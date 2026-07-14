import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const CHROME_PATH =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const ARTIFACTS = resolve(process.argv[2] ?? join(tmpdir(), "portfolio-browser-evidence"));
const DIRECT_FILE = process.env.SITE_TEST_DIRECT_FILE === "1";
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
};

class CdpClient {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }

      const listeners = this.listeners.get(message.method) ?? [];
      listeners.forEach((listener) => listener(message.params));
    });
  }

  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolveOpen, rejectOpen) => {
      socket.addEventListener("open", resolveOpen, { once: true });
      socket.addEventListener("error", rejectOpen, { once: true });
    });
    return new CdpClient(socket);
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolveResult, rejectResult) => {
      this.pending.set(id, { resolve: resolveResult, reject: rejectResult });
    });
  }

  on(method, listener) {
    const listeners = this.listeners.get(method) ?? [];
    listeners.push(listener);
    this.listeners.set(method, listeners);
  }

  once(method, timeoutMs = 10_000) {
    return new Promise((resolveEvent, rejectEvent) => {
      const timeout = setTimeout(() => rejectEvent(new Error(`Timed out waiting for ${method}`)), timeoutMs);
      const listener = (params) => {
        clearTimeout(timeout);
        const listeners = this.listeners.get(method) ?? [];
        this.listeners.set(method, listeners.filter((item) => item !== listener));
        resolveEvent(params);
      };
      this.on(method, listener);
    });
  }

  close() {
    this.socket.close();
  }
}

function startStaticServer() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, "http://127.0.0.1").pathname;
      const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
      const filePath = resolve(ROOT, relativePath);
      if (!filePath.startsWith(`${ROOT}/`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }

      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new Error("Not a file");
      const content = await readFile(filePath);
      response.writeHead(200, {
        "Content-Type": MIME_TYPES[extname(filePath)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(content);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });

  return new Promise((resolveServer, rejectServer) => {
    server.once("error", rejectServer);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolveServer({ server, port: address.port });
    });
  });
}

async function waitForFile(path, timeoutMs = 10_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      return await readFile(path, "utf8");
    } catch {
      await new Promise((resolveWait) => setTimeout(resolveWait, 50));
    }
  }
  throw new Error(`Timed out waiting for ${path}`);
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

async function wait(milliseconds) {
  await new Promise((resolveWait) => setTimeout(resolveWait, milliseconds));
}

async function navigate(client, url, width, height) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 600,
  });
  const loaded = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url });
  await loaded;
  await evaluate(client, "document.fonts.ready.then(() => true)");
}

async function screenshot(client, name) {
  const { data } = await client.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
  });
  const outputPath = join(ARTIFACTS, name);
  await writeFile(outputPath, Buffer.from(data, "base64"));
  return outputPath;
}

const results = [];
function check(name, condition, details = "") {
  results.push({ name, result: condition ? "PASS" : "FAIL", details });
  assert.ok(condition, `${name}${details ? `: ${details}` : ""}`);
}

let server;
let chrome;
let client;
let chromeDirectory;

try {
  await mkdir(ARTIFACTS, { recursive: true });
  let baseUrl;
  if (DIRECT_FILE) {
    baseUrl = pathToFileURL(join(ROOT, "index.html")).href;
  } else {
    const staticServer = await startStaticServer();
    server = staticServer.server;
    baseUrl = `http://127.0.0.1:${staticServer.port}/`;
  }

  chromeDirectory = await mkdtemp(join(tmpdir(), "portfolio-chrome-"));
  chrome = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-extensions",
      "--disable-sync",
      "--metrics-recording-only",
      "--no-first-run",
      "--no-default-browser-check",
      "--remote-debugging-port=0",
      `--user-data-dir=${chromeDirectory}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  const activePort = await waitForFile(join(chromeDirectory, "DevToolsActivePort"));
  const [debugPort] = activePort.trim().split("\n");
  const targetResponse = await fetch(
    `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(baseUrl)}`,
    { method: "PUT" },
  );
  const target = await targetResponse.json();
  client = await CdpClient.connect(target.webSocketDebuggerUrl);

  const consoleErrors = [];
  const runtimeErrors = [];
  const failedRequests = [];
  const badResponses = [];

  client.on("Runtime.consoleAPICalled", (event) => {
    if (event.type === "error" || event.type === "assert") consoleErrors.push(event);
  });
  client.on("Runtime.exceptionThrown", (event) => runtimeErrors.push(event));
  client.on("Network.loadingFailed", (event) => failedRequests.push(event));
  client.on("Network.responseReceived", (event) => {
    if (event.response.status >= 400) badResponses.push(event.response);
  });

  await Promise.all([
    client.send("Page.enable"),
    client.send("Runtime.enable"),
    client.send("Network.enable"),
  ]);

  await navigate(client, baseUrl, 1440, 900);
  const desktop = await evaluate(client, `(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    toggleDisplay: getComputedStyle(document.querySelector('.nav-toggle')).display,
    sections: ['home','about','experience','projects','games','contact'].every(id => document.getElementById(id)),
    brokenInternalLinks: [...document.querySelectorAll('a[href^="#"]')].filter(link => !document.querySelector(link.hash)).length,
    boardInside: document.querySelector('#game-canvas').getBoundingClientRect().right <= innerWidth,
    landmarks: Boolean(document.querySelector('header') && document.querySelector('main') && document.querySelector('footer'))
  }))()`);
  check("desktop has no horizontal overflow", desktop.overflow <= 0, JSON.stringify(desktop));
  check("desktop navigation is visible without toggle", desktop.toggleDisplay === "none", JSON.stringify(desktop));
  check("all professional and Games sections exist", desktop.sections, JSON.stringify(desktop));
  check("internal links resolve", desktop.brokenInternalLinks === 0, JSON.stringify(desktop));
  check("desktop game board stays in viewport", desktop.boardInside, JSON.stringify(desktop));
  check("semantic landmarks render", desktop.landmarks, JSON.stringify(desktop));
  await screenshot(client, "desktop-1440.png");

  await navigate(client, baseUrl, 768, 900);
  const tablet = await evaluate(client, `(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    boardWidth: document.querySelector('#game-canvas').getBoundingClientRect().width,
    viewport: innerWidth
  }))()`);
  check("tablet has no horizontal overflow", tablet.overflow <= 0, JSON.stringify(tablet));
  check("tablet game board fits", tablet.boardWidth <= tablet.viewport, JSON.stringify(tablet));
  await screenshot(client, "tablet-768.png");

  await navigate(client, baseUrl, 375, 812);
  const mobileBefore = await evaluate(client, `(() => {
    const toggle = document.querySelector('.nav-toggle');
    const controls = [...document.querySelectorAll('.direction-pad button')].map(button => {
      const rect = button.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    return {
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      toggleDisplay: getComputedStyle(toggle).display,
      toggleHeight: toggle.getBoundingClientRect().height,
      boardWidth: document.querySelector('#game-canvas').getBoundingClientRect().width,
      viewport: innerWidth,
      touchTargets: controls,
      canvasTouchAction: getComputedStyle(document.querySelector('#game-canvas')).touchAction
    };
  })()`);
  check("mobile has no horizontal overflow", mobileBefore.overflow <= 0, JSON.stringify(mobileBefore));
  check("mobile toggle is visible and large enough", mobileBefore.toggleDisplay !== "none" && mobileBefore.toggleHeight >= 44, JSON.stringify(mobileBefore));
  check("mobile game board fits", mobileBefore.boardWidth <= mobileBefore.viewport, JSON.stringify(mobileBefore));
  check("mobile controls are at least 44px", mobileBefore.touchTargets.every(({ width, height }) => width >= 44 && height >= 44), JSON.stringify(mobileBefore));
  check("game canvas suppresses gesture scrolling only on the board", mobileBefore.canvasTouchAction === "none", JSON.stringify(mobileBefore));

  const mobileMenu = await evaluate(client, `(() => {
    document.querySelector('.nav-toggle').click();
    return {
      expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded'),
      display: getComputedStyle(document.querySelector('#primary-navigation')).display
    };
  })()`);
  check("mobile menu opens with synchronized aria-expanded", mobileMenu.expanded === "true" && mobileMenu.display !== "none", JSON.stringify(mobileMenu));

  await evaluate(client, `localStorage.setItem('portfolio-snake-high-score', '40')`);
  await navigate(client, baseUrl, 375, 812);
  const initialBest = await evaluate(client, `document.querySelector('#game-best').textContent`);
  check("stored high score renders", initialBest === "040", initialBest);

  const gameStarted = await evaluate(client, `(() => {
    const canvas = document.querySelector('#game-canvas');
    const startHead = canvas.dataset.head;
    document.querySelector('#game-start').click();
    return { startHead, status: canvas.dataset.status, loop: canvas.dataset.loopActive };
  })()`);
  await wait(360);
  const gameMoved = await evaluate(client, `(() => {
    const canvas = document.querySelector('#game-canvas');
    return { head: canvas.dataset.head, tick: Number(canvas.dataset.tickCount), status: canvas.dataset.status, loop: canvas.dataset.loopActive };
  })()`);
  check("game starts with one active loop", gameStarted.status === "running" && gameStarted.loop === "1", JSON.stringify(gameStarted));
  check("game moves automatically", gameMoved.tick >= 2 && gameMoved.head !== gameStarted.startHead, JSON.stringify(gameMoved));

  const opposite = await evaluate(client, `(() => {
    const canvas = document.querySelector('#game-canvas');
    const event = new KeyboardEvent('keydown', { code: 'ArrowLeft', key: 'ArrowLeft', bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    return { direction: canvas.dataset.direction, defaultPrevented: event.defaultPrevented };
  })()`);
  check("immediate opposite keyboard direction is rejected", opposite.direction === "right", JSON.stringify(opposite));
  check("game keyboard input prevents page scrolling", opposite.defaultPrevented, JSON.stringify(opposite));

  const arrowSequence = await evaluate(client, `(async () => {
    const canvas = document.querySelector('#game-canvas');
    const steps = [
      ['ArrowDown', 'ArrowDown', 'down'],
      ['ArrowLeft', 'ArrowLeft', 'left'],
      ['ArrowUp', 'ArrowUp', 'up'],
      ['ArrowRight', 'ArrowRight', 'right']
    ];
    const observed = [];
    for (const [code, key, expected] of steps) {
      document.dispatchEvent(new KeyboardEvent('keydown', { code, key, bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 170));
      observed.push({ expected, actual: canvas.dataset.direction });
    }
    return observed;
  })()`);
  check("all four Arrow keys change direction", arrowSequence.every(({ expected, actual }) => expected === actual), JSON.stringify(arrowSequence));

  const wasdSequence = await evaluate(client, `(async () => {
    const canvas = document.querySelector('#game-canvas');
    const steps = [
      ['KeyS', 's', 'down'],
      ['KeyA', 'a', 'left'],
      ['KeyW', 'w', 'up'],
      ['KeyD', 'd', 'right']
    ];
    const observed = [];
    for (const [code, key, expected] of steps) {
      document.dispatchEvent(new KeyboardEvent('keydown', { code, key, bubbles: true, cancelable: true }));
      await new Promise(resolve => setTimeout(resolve, 170));
      observed.push({ expected, actual: canvas.dataset.direction });
    }
    return observed;
  })()`);
  check("W A S D each change direction", wasdSequence.every(({ expected, actual }) => expected === actual), JSON.stringify(wasdSequence));

  const paused = await evaluate(client, `(() => {
    document.querySelector('#game-pause').click();
    const canvas = document.querySelector('#game-canvas');
    return { tick: canvas.dataset.tickCount, status: canvas.dataset.status, loop: canvas.dataset.loopActive };
  })()`);
  await wait(320);
  const pausedAfterWait = await evaluate(client, `(() => {
    const canvas = document.querySelector('#game-canvas');
    return { tick: canvas.dataset.tickCount, status: canvas.dataset.status, loop: canvas.dataset.loopActive };
  })()`);
  check("pause stops movement and the timer", paused.status === "paused" && paused.loop === "0" && pausedAfterWait.tick === paused.tick, JSON.stringify({ paused, pausedAfterWait }));

  await evaluate(client, `document.querySelector('#game-pause').click()`);
  await wait(180);
  const resumed = await evaluate(client, `(() => {
    const canvas = document.querySelector('#game-canvas');
    return { tick: Number(canvas.dataset.tickCount), status: canvas.dataset.status, loop: canvas.dataset.loopActive };
  })()`);
  check("resume restarts movement with one timer", resumed.status === "running" && resumed.loop === "1" && resumed.tick > Number(paused.tick), JSON.stringify(resumed));

  const touchSequence = await evaluate(client, `(async () => {
    const canvas = document.querySelector('#game-canvas');
    const observed = [];
    for (const direction of ['down', 'left', 'up', 'right']) {
      const event = new PointerEvent('pointerdown', { bubbles: true, cancelable: true });
      document.querySelector('[data-direction="' + direction + '"]').dispatchEvent(event);
      await new Promise(resolve => setTimeout(resolve, 170));
      observed.push({ expected: direction, actual: canvas.dataset.direction, defaultPrevented: event.defaultPrevented });
    }
    return observed;
  })()`);
  check("all four mobile direction controls work", touchSequence.every(({ expected, actual, defaultPrevented }) => expected === actual && defaultPrevented), JSON.stringify(touchSequence));

  await evaluate(client, `(() => {
    const canvas = document.querySelector('#game-canvas');
    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, clientY: 100, bubbles: true, cancelable: true }));
    canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, clientY: 150, bubbles: true, cancelable: true }));
  })()`);
  await wait(170);
  const swipeDirection = await evaluate(client, `document.querySelector('#game-canvas').dataset.direction`);
  check("swipe changes direction", swipeDirection === "down", swipeDirection);

  const generationBeforeGames = await evaluate(client, `document.querySelector('#game-canvas').dataset.loopGeneration`);
  await evaluate(client, `(() => { const link = document.querySelector('a[href="#games"]'); link.click(); link.click(); link.click(); })()`);
  await wait(100);
  const generationAfterGames = await evaluate(client, `document.querySelector('#game-canvas').dataset.loopGeneration`);
  check("reopening Games does not create another loop", generationAfterGames === generationBeforeGames, `${generationBeforeGames} -> ${generationAfterGames}`);

  await evaluate(client, `document.querySelector('#game-restart').click()`);
  await wait(1_700);
  const gameOver = await evaluate(client, `(() => {
    const canvas = document.querySelector('#game-canvas');
    return {
      status: canvas.dataset.status,
      loop: canvas.dataset.loopActive,
      overlayHidden: document.querySelector('#game-overlay').hidden,
      title: document.querySelector('#game-overlay-title').textContent
    };
  })()`);
  check("wall collision produces game over and stops the timer", gameOver.status === "gameover" && gameOver.loop === "0" && !gameOver.overlayHidden, JSON.stringify(gameOver));

  await evaluate(client, `document.querySelector('#game-start').click()`);
  const restarted = await evaluate(client, `(() => {
    const canvas = document.querySelector('#game-canvas');
    return { status: canvas.dataset.status, score: document.querySelector('#game-score').textContent, loop: canvas.dataset.loopActive };
  })()`);
  check("play again resets score and starts one loop", restarted.status === "running" && restarted.score === "000" && restarted.loop === "1", JSON.stringify(restarted));
  await evaluate(client, `document.querySelector('#game-pause').click()`);

  const accessibility = await evaluate(client, `(() => {
    const interactive = [...document.querySelectorAll('a, button, [tabindex="0"]')];
    const unnamed = interactive.filter(element => {
      const name = element.getAttribute('aria-label') || element.textContent.trim();
      return !name;
    });
    const headingLevels = [...document.querySelectorAll('h1, h2, h3')].map(heading => Number(heading.tagName.slice(1)));
    return {
      h1Count: document.querySelectorAll('h1').length,
      unnamedCount: unnamed.length,
      statusRole: document.querySelector('#game-status').getAttribute('role'),
      statusLive: document.querySelector('#game-status').getAttribute('aria-live'),
      canvasLabel: document.querySelector('#game-canvas').getAttribute('aria-label'),
      headingLevels
    };
  })()`);
  check("interactive elements have accessible names", accessibility.unnamedCount === 0, JSON.stringify(accessibility));
  check("page has one h1 and ordered section headings", accessibility.h1Count === 1 && accessibility.headingLevels[0] === 1, JSON.stringify(accessibility));
  check("game status is announced and canvas is named", accessibility.statusRole === "status" && accessibility.statusLive === "polite" && Boolean(accessibility.canvasLabel), JSON.stringify(accessibility));
  await screenshot(client, "mobile-375.png");

  check("browser console has no errors", consoleErrors.length === 0, `count=${consoleErrors.length}`);
  check("browser runtime has no uncaught exceptions", runtimeErrors.length === 0, `count=${runtimeErrors.length}`);
  check("browser network has no failed requests", failedRequests.length === 0, `count=${failedRequests.length}`);
  check(
    "browser network has no HTTP errors",
    badResponses.length === 0,
    JSON.stringify(badResponses.map(({ status, url }) => ({ status, url }))),
  );

  const report = {
    browser: `Google Chrome headless via CDP (${DIRECT_FILE ? "file" : "http"})`,
    baseUrl,
    results,
    consoleErrorCount: consoleErrors.length,
    runtimeErrorCount: runtimeErrors.length,
    failedRequestCount: failedRequests.length,
    badResponseCount: badResponses.length,
    screenshots: ["desktop-1440.png", "tablet-768.png", "mobile-375.png"],
  };
  await writeFile(join(ARTIFACTS, "browser-report.json"), `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  if (client) client.close();
  if (chrome) chrome.kill("SIGTERM");
  if (server) await new Promise((resolveClose) => server.close(resolveClose));
  if (chromeDirectory) await rm(chromeDirectory, { recursive: true, force: true });
}
