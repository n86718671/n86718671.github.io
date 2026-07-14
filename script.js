"use strict";

const {
  createGame,
  pauseGame,
  queueDirection,
  restartGame,
  resumeGame,
  startGame,
  tickGame,
} = globalThis.SnakeEngine;

const TICK_INTERVAL_MS = 140;
const HIGH_SCORE_KEY = "portfolio-snake-high-score";

document.documentElement.dataset.js = "ready";

const currentYear = document.querySelector("#current-year");
if (currentYear) {
  currentYear.textContent = String(new Date().getFullYear());
}

const navToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");

function closeNavigation() {
  if (!navToggle || !primaryNavigation) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  primaryNavigation.classList.remove("is-open");
}

if (navToggle && primaryNavigation) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    primaryNavigation.classList.toggle("is-open", !isOpen);
  });

  primaryNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
      navToggle.focus();
    }
  });

  window.matchMedia("(min-width: 45.01rem)").addEventListener("change", closeNavigation);
}

const gameElements = {
  canvas: document.querySelector("#game-canvas"),
  score: document.querySelector("#game-score"),
  best: document.querySelector("#game-best"),
  status: document.querySelector("#game-status"),
  overlay: document.querySelector("#game-overlay"),
  overlayTitle: document.querySelector("#game-overlay-title"),
  start: document.querySelector("#game-start"),
  pause: document.querySelector("#game-pause"),
  restart: document.querySelector("#game-restart"),
  directionButtons: [...document.querySelectorAll("[data-direction]")],
};

const hasCompleteGameUi = Object.values(gameElements).every((value) =>
  Array.isArray(value) ? value.length === 4 : value !== null,
);

if (hasCompleteGameUi) {
  initializeGame(gameElements);
}

function readHighScore() {
  try {
    const storedValue = Number.parseInt(window.localStorage.getItem(HIGH_SCORE_KEY) ?? "0", 10);
    return Number.isFinite(storedValue) && storedValue >= 0 ? storedValue : 0;
  } catch {
    return 0;
  }
}

function writeHighScore(value) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(value));
  } catch {
    // The game remains fully playable when storage is unavailable.
  }
}

function initializeGame(elements) {
  const context = elements.canvas.getContext("2d");
  if (!context) {
    elements.status.textContent = "Canvas is unavailable in this browser.";
    elements.start.disabled = true;
    elements.restart.disabled = true;
    return;
  }

  let game = createGame({ highScore: readHighScore() });
  let intervalId = null;
  let loopGeneration = 0;
  let swipeStart = null;

  function stopLoop() {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startLoop() {
    stopLoop();
    loopGeneration += 1;
    intervalId = window.setInterval(runTick, TICK_INTERVAL_MS);
  }

  function runTick() {
    const previousHighScore = game.highScore;
    game = tickGame(game);

    if (game.highScore > previousHighScore) {
      writeHighScore(game.highScore);
    }

    if (game.status === "gameover" || game.status === "won") {
      stopLoop();
    }

    render();
  }

  function setDirection(direction) {
    game = queueDirection(game, direction);
    renderDiagnostics();
  }

  function beginGame() {
    if (game.status === "gameover" || game.status === "won") {
      game = restartGame(game);
    }

    game = startGame(game);
    if (game.status === "running") {
      startLoop();
      elements.canvas.focus({ preventScroll: true });
    }
    render();
  }

  function restartAndBegin() {
    stopLoop();
    game = startGame(restartGame(game));
    startLoop();
    elements.canvas.focus({ preventScroll: true });
    render();
  }

  function togglePause() {
    if (game.status === "running") {
      game = pauseGame(game);
      stopLoop();
    } else if (game.status === "paused") {
      game = resumeGame(game);
      startLoop();
      elements.canvas.focus({ preventScroll: true });
    }
    render();
  }

  function drawBoard() {
    const cellWidth = elements.canvas.width / game.columns;
    const cellHeight = elements.canvas.height / game.rows;

    context.fillStyle = "#0b1210";
    context.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    context.strokeStyle = "rgba(241, 239, 231, 0.075)";
    context.lineWidth = 1;
    for (let index = 1; index < game.columns; index += 1) {
      const position = index * cellWidth;
      context.beginPath();
      context.moveTo(position, 0);
      context.lineTo(position, elements.canvas.height);
      context.stroke();
    }
    for (let index = 1; index < game.rows; index += 1) {
      const position = index * cellHeight;
      context.beginPath();
      context.moveTo(0, position);
      context.lineTo(elements.canvas.width, position);
      context.stroke();
    }

    if (game.food) {
      context.fillStyle = "#e84b2c";
      context.beginPath();
      context.arc(
        (game.food.x + 0.5) * cellWidth,
        (game.food.y + 0.5) * cellHeight,
        cellWidth * 0.28,
        0,
        Math.PI * 2,
      );
      context.fill();
    }

    game.snake.forEach((cell, index) => {
      const inset = index === 0 ? 2 : 3;
      context.fillStyle = index === 0 ? "#f1efe7" : "#dbe743";
      context.fillRect(
        cell.x * cellWidth + inset,
        cell.y * cellHeight + inset,
        cellWidth - inset * 2,
        cellHeight - inset * 2,
      );
    });
  }

  function renderDiagnostics() {
    const head = game.snake[0];
    elements.canvas.dataset.status = game.status;
    elements.canvas.dataset.direction = game.nextDirectionName;
    elements.canvas.dataset.head = `${head.x},${head.y}`;
    elements.canvas.dataset.tickCount = String(game.tickCount);
    elements.canvas.dataset.loopActive = intervalId === null ? "0" : "1";
    elements.canvas.dataset.loopGeneration = String(loopGeneration);
  }

  function render() {
    drawBoard();
    renderDiagnostics();

    elements.score.textContent = String(game.score).padStart(3, "0");
    elements.best.textContent = String(game.highScore).padStart(3, "0");
    elements.pause.disabled = !["running", "paused"].includes(game.status);
    elements.pause.textContent = game.status === "paused" ? "Resume" : "Pause";

    const statusContent = {
      idle: "Ready. Start the game to begin.",
      running: "Game running.",
      paused: "Game paused.",
      gameover: `Game over. Final score ${game.score}.`,
      won: `Board cleared. Final score ${game.score}.`,
    };
    elements.status.textContent = statusContent[game.status];

    const showOverlay = ["idle", "gameover", "won"].includes(game.status);
    elements.overlay.hidden = !showOverlay;

    if (game.status === "idle") {
      elements.overlayTitle.textContent = "Ready?";
      elements.start.textContent = "Start game";
    } else if (game.status === "gameover") {
      elements.overlayTitle.textContent = "Game over";
      elements.start.textContent = "Play again";
    } else if (game.status === "won") {
      elements.overlayTitle.textContent = "You win";
      elements.start.textContent = "Play again";
    }
  }

  const keyboardDirections = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    KeyW: "up",
    KeyS: "down",
    KeyA: "left",
    KeyD: "right",
  };

  document.addEventListener("keydown", (event) => {
    const direction = keyboardDirections[event.code];
    if (direction && game.status === "running") {
      event.preventDefault();
      setDirection(direction);
      return;
    }

    if (event.code === "Space" && ["running", "paused"].includes(game.status)) {
      event.preventDefault();
      togglePause();
    }
  });

  elements.directionButtons.forEach((button) => {
    button.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();
        setDirection(button.dataset.direction);
      },
      { passive: false },
    );
  });

  elements.canvas.addEventListener(
    "pointerdown",
    (event) => {
      if (game.status !== "running") {
        return;
      }
      event.preventDefault();
      swipeStart = { x: event.clientX, y: event.clientY };
    },
    { passive: false },
  );

  elements.canvas.addEventListener(
    "pointerup",
    (event) => {
      if (!swipeStart || game.status !== "running") {
        swipeStart = null;
        return;
      }

      event.preventDefault();
      const deltaX = event.clientX - swipeStart.x;
      const deltaY = event.clientY - swipeStart.y;
      swipeStart = null;

      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDirection(deltaX > 0 ? "right" : "left");
      } else {
        setDirection(deltaY > 0 ? "down" : "up");
      }
    },
    { passive: false },
  );

  elements.canvas.addEventListener("pointercancel", () => {
    swipeStart = null;
  });

  elements.start.addEventListener("click", beginGame);
  elements.pause.addEventListener("click", togglePause);
  elements.restart.addEventListener("click", restartAndBegin);
  window.addEventListener("pagehide", stopLoop, { once: true });

  render();
}
