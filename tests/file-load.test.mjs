import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const chromePath =
  process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const indexUrl = pathToFileURL(resolve(new URL("..", import.meta.url).pathname, "index.html")).href;

test("direct file load initializes the site and game without module CORS errors", () => {
  const result = spawnSync(
    chromePath,
    [
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      "--enable-logging=stderr",
      "--dump-dom",
      indexUrl,
    ],
    { encoding: "utf8", timeout: 20_000 },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.doesNotMatch(result.stderr, /blocked by CORS policy/i);
  assert.match(result.stdout, /<html[^>]+data-js="ready"/);
  assert.match(result.stdout, /id="game-canvas"[^>]+data-status="idle"/);
});
