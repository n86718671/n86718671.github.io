(() => {
  const STORAGE_KEY = "n86718671-snake-high-score";
  const GRID_SIZE = 20;
  const STEP_MS = 130;
  const MIN_STEP_MS = 72;

  function sameCell(a, b) {
    return a.x === b.x && a.y === b.y;
  }

  function opposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  function randomCell(limit) {
    return {
      x: Math.floor(Math.random() * limit),
      y: Math.floor(Math.random() * limit),
    };
  }

  class SnakeGame {
    constructor(root) {
      this.root = root;
      this.canvas = root.querySelector("#snake-canvas");
      this.stage = root.querySelector("[data-canvas-stage]");
      this.ctx = this.canvas.getContext("2d");
      this.scoreNode = root.querySelector("[data-score]");
      this.highScoreNode = root.querySelector("[data-high-score]");
      this.statusNode = root.querySelector("[data-status]");
      this.startButton = root.querySelector('[data-action="start"]');
      this.pauseButton = root.querySelector('[data-action="pause"]');
      this.restartButton = root.querySelector('[data-action="restart"]');
      this.directionButtons = Array.from(root.querySelectorAll("[data-direction]"));
      this.highScore = this.loadHighScore();

      this.running = false;
      this.paused = false;
      this.gameOver = false;
      this.score = 0;
      this.direction = { x: 1, y: 0 };
      this.nextDirection = { x: 1, y: 0 };
      this.snake = [];
      this.food = { x: 0, y: 0 };
      this.lastFrame = 0;
      this.accumulator = 0;
      this.stepMs = STEP_MS;
      this.cellSize = 24;
      this.boardPixels = GRID_SIZE * this.cellSize;
      this.pointerStart = null;

      this.loop = this.loop.bind(this);
      this.handleKeydown = this.handleKeydown.bind(this);
      this.handleResize = this.handleResize.bind(this);
      this.handlePointerDown = this.handlePointerDown.bind(this);
      this.handlePointerUp = this.handlePointerUp.bind(this);
    }

    mount() {
      this.attachEvents();
      this.reset(false);
      this.resize();
      this.syncUI("Ready to play");
      requestAnimationFrame(this.loop);
    }

    attachEvents() {
      document.addEventListener("keydown", this.handleKeydown);
      window.addEventListener("resize", this.handleResize);
      this.canvas.addEventListener("pointerdown", this.handlePointerDown);
      this.canvas.addEventListener("pointerup", this.handlePointerUp);
      this.canvas.addEventListener("pointercancel", this.handlePointerUp);

      this.startButton.addEventListener("click", () => this.start());
      this.pauseButton.addEventListener("click", () => this.togglePause());
      this.restartButton.addEventListener("click", () => this.restart());

      for (const button of this.directionButtons) {
        button.addEventListener("click", () => this.setDirection(button.dataset.direction));
      }
    }

    handleResize() {
      this.resize();
      this.draw();
    }

    resize() {
      const available = Math.min(this.stage.clientWidth, 560);
      const board = Math.max(240, Math.floor(available));
      const cell = Math.max(12, Math.floor(board / GRID_SIZE));
      const boardPixels = cell * GRID_SIZE;
      const dpr = window.devicePixelRatio || 1;

      this.cellSize = cell;
      this.boardPixels = boardPixels;
      this.canvas.width = Math.round(boardPixels * dpr);
      this.canvas.height = Math.round(boardPixels * dpr);
      this.canvas.style.width = `${boardPixels}px`;
      this.canvas.style.height = `${boardPixels}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    loadHighScore() {
      try {
        return Number(window.localStorage.getItem(STORAGE_KEY) || 0) || 0;
      } catch {
        return 0;
      }
    }

    saveHighScore() {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(this.highScore));
      } catch {
        // Ignore storage failures in private mode.
      }
    }

    syncUI(message) {
      this.scoreNode.textContent = String(this.score);
      this.highScoreNode.textContent = String(this.highScore);
      this.statusNode.textContent = message;
      this.pauseButton.textContent = this.paused ? "Resume" : "Pause";
      this.pauseButton.setAttribute("aria-pressed", String(this.paused));
      this.startButton.disabled = this.running && !this.paused && !this.gameOver;
    }

    reset(autoStart) {
      const center = Math.floor(GRID_SIZE / 2);
      this.running = Boolean(autoStart);
      this.paused = false;
      this.gameOver = false;
      this.score = 0;
      this.stepMs = STEP_MS;
      this.direction = { x: 1, y: 0 };
      this.nextDirection = { x: 1, y: 0 };
      this.snake = [
        { x: center - 1, y: center },
        { x: center - 2, y: center },
        { x: center - 3, y: center },
      ];
      this.food = this.spawnFood();
      this.lastFrame = performance.now();
      this.accumulator = 0;
      this.syncUI(autoStart ? "Playing" : "Ready to play");
      this.draw();
    }

    start() {
      if (this.running && !this.gameOver) {
        return;
      }
      this.reset(true);
      this.syncUI("Playing");
    }

    togglePause() {
      if (this.gameOver) {
        return;
      }
      if (!this.running) {
        this.start();
        return;
      }
      this.paused = !this.paused;
      this.syncUI(this.paused ? "Paused" : "Playing");
    }

    restart() {
      this.reset(true);
      this.syncUI("Playing");
    }

    handleKeydown(event) {
      const key = event.key.toLowerCase();
      const directionMap = {
        arrowup: { x: 0, y: -1 },
        w: { x: 0, y: -1 },
        arrowdown: { x: 0, y: 1 },
        s: { x: 0, y: 1 },
        arrowleft: { x: -1, y: 0 },
        a: { x: -1, y: 0 },
        arrowright: { x: 1, y: 0 },
        d: { x: 1, y: 0 },
      };

      if (directionMap[key]) {
        event.preventDefault();
        this.setDirection(directionMap[key]);
        return;
      }

      if (key === " " || key === "p") {
        event.preventDefault();
        this.togglePause();
        return;
      }

      if (key === "r") {
        event.preventDefault();
        this.restart();
      }
    }

    handlePointerDown(event) {
      this.pointerStart = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
      };
    }

    handlePointerUp(event) {
      if (!this.pointerStart) {
        return;
      }

      const deltaX = event.clientX - this.pointerStart.x;
      const deltaY = event.clientY - this.pointerStart.y;
      const elapsed = performance.now() - this.pointerStart.time;
      this.pointerStart = null;

      const threshold = 26;
      if (elapsed > 700) {
        return;
      }

      if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.setDirection(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      } else {
        this.setDirection(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      }
    }

    setDirection(next) {
      if (this.gameOver) {
        this.start();
      }
      if (!this.running) {
        this.start();
      }
      if (opposite(next, this.nextDirection || this.direction)) {
        return;
      }
      this.nextDirection = next;
    }

    spawnFood() {
      let candidate = randomCell(GRID_SIZE);
      let safety = 0;
      while (this.snake.some((segment) => sameCell(segment, candidate))) {
        candidate = randomCell(GRID_SIZE);
        safety += 1;
        if (safety > 1000) {
          break;
        }
      }
      return candidate;
    }

    finishGame(reason) {
      this.running = false;
      this.paused = false;
      this.gameOver = true;
      this.syncUI(`Game over - ${reason}`);
    }

    advance() {
      this.direction = this.nextDirection;
      const head = this.snake[0];
      const nextHead = {
        x: head.x + this.direction.x,
        y: head.y + this.direction.y,
      };

      if (
        nextHead.x < 0 ||
        nextHead.y < 0 ||
        nextHead.x >= GRID_SIZE ||
        nextHead.y >= GRID_SIZE
      ) {
        this.finishGame("Wall collision");
        return;
      }

      if (this.snake.some((segment) => sameCell(segment, nextHead))) {
        this.finishGame("Self collision");
        return;
      }

      this.snake.unshift(nextHead);

      if (sameCell(nextHead, this.food)) {
        this.score += 10;
        this.highScore = Math.max(this.highScore, this.score);
        this.saveHighScore();
        this.food = this.spawnFood();
        this.stepMs = Math.max(MIN_STEP_MS, STEP_MS - Math.floor(this.score / 20) * 5);
      } else {
        this.snake.pop();
      }

      this.syncUI("Playing");
    }

    loop(now) {
      requestAnimationFrame(this.loop);

      if (!this.running || this.paused || this.gameOver) {
        this.draw();
        return;
      }

      const delta = now - this.lastFrame;
      this.lastFrame = now;
      this.accumulator += delta;

      while (this.accumulator >= this.stepMs && this.running && !this.paused && !this.gameOver) {
        this.advance();
        this.accumulator -= this.stepMs;
      }

      this.draw();
    }

    drawBackground() {
      const size = this.boardPixels;
      const cell = this.cellSize;
      const ctx = this.ctx;

      ctx.clearRect(0, 0, size, size);

      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, "#09111f");
      gradient.addColorStop(1, "#0f1a30");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = "rgba(255,255,255,0.045)";
      ctx.lineWidth = 1;

      for (let i = 0; i <= GRID_SIZE; i += 1) {
        const pos = i * cell + 0.5;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(size, pos);
        ctx.stroke();
      }
    }

    drawFood() {
      const cell = this.cellSize;
      const ctx = this.ctx;
      const inset = cell * 0.14;
      const size = cell - inset * 2;
      ctx.fillStyle = "#ff7f6a";
      ctx.beginPath();
      ctx.roundRect(this.food.x * cell + inset, this.food.y * cell + inset, size, size, size / 3);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(this.food.x * cell + cell * 0.35, this.food.y * cell + cell * 0.35, cell * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }

    drawSnake() {
      const cell = this.cellSize;
      const ctx = this.ctx;

      this.snake.forEach((segment, index) => {
        const x = segment.x * cell + 2;
        const y = segment.y * cell + 2;
        const size = cell - 4;
        const radius = Math.max(8, cell * 0.24);
        const isHead = index === 0;

        ctx.fillStyle = isHead ? "#f3b563" : index < 3 ? "#88d8c0" : "#d8f3ff";
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.fill();

        if (isHead) {
          ctx.fillStyle = "rgba(9,17,31,0.8)";
          const eyeOffset = cell * 0.2;
          const eyeY = y + cell * 0.34;
          ctx.beginPath();
          ctx.arc(x + eyeOffset, eyeY, Math.max(1.8, cell * 0.05), 0, Math.PI * 2);
          ctx.arc(x + size - eyeOffset, eyeY, Math.max(1.8, cell * 0.05), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    drawOverlay() {
      if (this.running && !this.paused && !this.gameOver) {
        return;
      }

      const size = this.boardPixels;
      const ctx = this.ctx;

      ctx.fillStyle = "rgba(4, 8, 14, 0.5)";
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = "#f5efe4";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${Math.max(18, this.cellSize * 0.9)}px Georgia`;

      let title = "Ready";
      if (this.paused) {
        title = "Paused";
      } else if (this.gameOver) {
        title = "Game Over";
      }
      ctx.fillText(title, size / 2, size / 2 - this.cellSize * 0.45);

      ctx.font = `500 ${Math.max(12, this.cellSize * 0.42)}px "Trebuchet MS"`;
      const subtitle = this.gameOver
        ? "Press Restart or R to play again"
        : this.paused
          ? "Press Pause, P, or Space to resume"
          : "Press Start or use the controls";
      ctx.fillText(subtitle, size / 2, size / 2 + this.cellSize * 0.3);
    }

    draw() {
      this.drawBackground();
      this.drawFood();
      this.drawSnake();
      this.drawOverlay();
    }
  }

  window.SnakeGame = SnakeGame;
})();
