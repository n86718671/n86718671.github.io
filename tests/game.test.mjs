import test from "node:test";
import assert from "node:assert/strict";

import "../game.js";

const {
  createGame,
  pauseGame,
  queueDirection,
  restartGame,
  resumeGame,
  spawnFood,
  startGame,
  tickGame,
} = globalThis.SnakeEngine;

test("initialization creates a three-cell idle snake and food off its body", () => {
  const state = createGame({ columns: 10, rows: 10, random: () => 0 });

  assert.equal(state.status, "idle");
  assert.equal(state.snake.length, 3);
  assert.equal(state.score, 0);
  assert.ok(state.food);
  assert.equal(state.snake.some((cell) => cell.x === state.food.x && cell.y === state.food.y), false);
});

test("start and single tick move the snake automatically by one cell", () => {
  const started = startGame(createGame({ columns: 10, rows: 10, food: { x: 0, y: 0 } }));
  const before = started.snake[0];
  const after = tickGame(started);

  assert.equal(after.status, "running");
  assert.deepEqual(after.snake[0], { x: before.x + 1, y: before.y });
  assert.equal(after.tickCount, 1);
});

test("food generation is deterministic and never overlaps the snake", () => {
  const state = createGame({ columns: 4, rows: 4, food: null });
  let randomCalls = 0;
  const first = spawnFood(state, () => {
    randomCalls += 1;
    return 0.25;
  });
  const second = spawnFood(state, () => 0.25);

  assert.deepEqual(first, second);
  assert.equal(randomCalls, 1);
  assert.equal(state.snake.some((cell) => cell.x === first.x && cell.y === first.y), false);
});

test("food, growth, score, and high score update together", () => {
  const state = startGame(createGame({
    columns: 8,
    rows: 8,
    snake: [{ x: 3, y: 3 }, { x: 2, y: 3 }, { x: 1, y: 3 }],
    food: { x: 4, y: 3 },
  }));
  const result = tickGame(state, () => 0);

  assert.equal(result.snake.length, 4);
  assert.equal(result.score, 10);
  assert.equal(result.highScore, 10);
  assert.equal(result.snake.some((cell) => result.food && cell.x === result.food.x && cell.y === result.food.y), false);
});

test("wall collision ends the game", () => {
  const state = startGame(createGame({
    columns: 5,
    rows: 5,
    snake: [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }],
    food: { x: 0, y: 0 },
  }));

  assert.equal(tickGame(state).status, "gameover");
});

test("self collision ends the game", () => {
  const state = startGame(createGame({
    columns: 5,
    rows: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
    ],
    direction: "left",
    food: { x: 4, y: 4 },
  }));

  assert.equal(tickGame(state).status, "gameover");
});

test("pause and resume stop and restore state transitions", () => {
  const running = startGame(createGame({ food: { x: 0, y: 0 } }));
  const paused = pauseGame(running);

  assert.equal(paused.status, "paused");
  assert.strictEqual(tickGame(paused), paused);
  assert.equal(resumeGame(paused).status, "running");
});

test("restart resets the run while preserving the high score", () => {
  const state = createGame({ score: 20, highScore: 40, status: "gameover" });
  const restarted = restartGame(state, () => 0);

  assert.equal(restarted.status, "idle");
  assert.equal(restarted.score, 0);
  assert.equal(restarted.highScore, 40);
  assert.equal(restarted.tickCount, 0);
});

test("opposite and multiple directions before a tick are rejected", () => {
  const running = startGame(createGame({ food: { x: 0, y: 0 } }));
  assert.strictEqual(queueDirection(running, "left"), running);

  const queuedUp = queueDirection(running, "up");
  assert.equal(queuedUp.nextDirectionName, "up");
  assert.strictEqual(queueDirection(queuedUp, "left"), queuedUp);

  const movedUp = tickGame(queuedUp);
  assert.equal(movedUp.directionName, "up");
  assert.strictEqual(queueDirection(movedUp, "down"), movedUp);
});
