(() => {
"use strict";

const DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 }),
});

const DEFAULT_GAME_CONFIG = Object.freeze({
  columns: 20,
  rows: 20,
  pointsPerFood: 10,
});

function sameCell(first, second) {
  return first.x === second.x && first.y === second.y;
}

function isOpposite(first, second) {
  return first.x + second.x === 0 && first.y + second.y === 0;
}

function initialSnake(columns, rows) {
  const x = Math.max(2, Math.floor(columns / 2));
  const y = Math.floor(rows / 2);

  return [
    { x, y },
    { x: x - 1, y },
    { x: x - 2, y },
  ];
}

function spawnFood(state, random = Math.random) {
  const occupied = new Set(state.snake.map(({ x, y }) => `${x},${y}`));
  const freeCells = [];

  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.columns; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const randomValue = random();
  const sample = Number.isFinite(randomValue) ? randomValue : 0;
  const normalized = Math.min(Math.max(sample, 0), 0.999999999);
  return freeCells[Math.floor(normalized * freeCells.length)];
}

function createGame(options = {}) {
  const columns = options.columns ?? DEFAULT_GAME_CONFIG.columns;
  const rows = options.rows ?? DEFAULT_GAME_CONFIG.rows;
  const pointsPerFood = options.pointsPerFood ?? DEFAULT_GAME_CONFIG.pointsPerFood;
  const snake = (options.snake ?? initialSnake(columns, rows)).map((cell) => ({ ...cell }));
  const directionName = options.direction ?? "right";
  const direction = DIRECTIONS[directionName] ?? DIRECTIONS.right;
  const baseState = {
    columns,
    rows,
    pointsPerFood,
    snake,
    direction,
    nextDirection: direction,
    directionName,
    nextDirectionName: directionName,
    inputLocked: false,
    score: options.score ?? 0,
    highScore: options.highScore ?? 0,
    status: options.status ?? "idle",
    tickCount: options.tickCount ?? 0,
    food: null,
  };

  const hasFoodOption = Object.prototype.hasOwnProperty.call(options, "food");
  baseState.food = hasFoodOption ? options.food : spawnFood(baseState, options.random);

  return baseState;
}

function startGame(state) {
  if (state.status !== "idle") {
    return state;
  }

  return { ...state, status: "running" };
}

function pauseGame(state) {
  if (state.status !== "running") {
    return state;
  }

  return { ...state, status: "paused" };
}

function resumeGame(state) {
  if (state.status !== "paused") {
    return state;
  }

  return { ...state, status: "running" };
}

function restartGame(state, random = Math.random) {
  return createGame({
    columns: state.columns,
    rows: state.rows,
    pointsPerFood: state.pointsPerFood,
    highScore: state.highScore,
    random,
  });
}

function queueDirection(state, directionName) {
  const direction = DIRECTIONS[directionName];

  if (
    state.status !== "running" ||
    !direction ||
    state.inputLocked ||
    isOpposite(state.direction, direction)
  ) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction,
    nextDirectionName: directionName,
    inputLocked: true,
  };
}

function tickGame(state, random = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.nextDirection;
  const directionName = state.nextDirectionName;
  const head = state.snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };
  const nextTickCount = state.tickCount + 1;
  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.columns ||
    nextHead.y >= state.rows;

  if (hitWall) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      directionName,
      nextDirectionName: directionName,
      inputLocked: false,
      status: "gameover",
      tickCount: nextTickCount,
    };
  }

  const ateFood = state.food ? sameCell(nextHead, state.food) : false;
  const collisionBody = ateFood ? state.snake : state.snake.slice(0, -1);
  const hitSelf = collisionBody.some((cell) => sameCell(cell, nextHead));

  if (hitSelf) {
    return {
      ...state,
      direction,
      nextDirection: direction,
      directionName,
      nextDirectionName: directionName,
      inputLocked: false,
      status: "gameover",
      tickCount: nextTickCount,
    };
  }

  const snake = [nextHead, ...state.snake];
  if (!ateFood) {
    snake.pop();
  }

  const score = ateFood ? state.score + state.pointsPerFood : state.score;
  const highScore = Math.max(state.highScore, score);
  const nextState = {
    ...state,
    snake,
    direction,
    nextDirection: direction,
    directionName,
    nextDirectionName: directionName,
    inputLocked: false,
    score,
    highScore,
    tickCount: nextTickCount,
  };

  if (ateFood) {
    nextState.food = spawnFood(nextState, random);
    if (nextState.food === null) {
      nextState.status = "won";
    }
  }

  return nextState;
}

globalThis.SnakeEngine = Object.freeze({
  DEFAULT_GAME_CONFIG,
  DIRECTIONS,
  createGame,
  pauseGame,
  queueDirection,
  restartGame,
  resumeGame,
  spawnFood,
  startGame,
  tickGame,
});
})();
