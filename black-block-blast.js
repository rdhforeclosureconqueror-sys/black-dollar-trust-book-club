<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Black Block Blast — Pan-African Tetris</title>
  <style>
    body { background: #18181b; color: #eee; font-family: sans-serif; text-align: center; }
    #tetrisCanvas { border: 2px solid #444; display: block; margin: 15px auto; background: #222; }
    #tetrisScore { font-weight: bold; }
    button { margin: 0 8px; padding: 8px 18px; font-size: 1rem; cursor: pointer;}
  </style>
</head>
<body>
  <h1>Black Block Blast<br><small style="color:#facc15">Pan-African Tetris</small></h1>
  <canvas id="tetrisCanvas"></canvas>
  <div>
    <button id="tetrisStartBtn">Start</button>
    <button id="tetrisStopBtn">Stop</button>
  </div>
  <div>Score: <span id="tetrisScore">0</span></div>
  <!-- Put your JS just before the closing </body> tag -->
  <script>
    /* ===================================================
       Black Block Blast — Pan-African Tetris Game
       Rebuilt Clean Version (No Duplicate Variables)
    =================================================== */

    // === Canvas Setup ===
    const canvas = document.getElementById("tetrisCanvas");
    const ctx = canvas.getContext("2d");

    const startBtn = document.getElementById("tetrisStartBtn");
    const stopBtn = document.getElementById("tetrisStopBtn");
    const scoreEl = document.getElementById("tetrisScore");

    // === Game Constants ===
    const COLS = 10;
    const ROWS = 20;
    const BLOCK = 25;
    canvas.width = COLS * BLOCK;
    canvas.height = ROWS * BLOCK;

    // === Game Variables ===
    let board = [];
    let currentPiece = null;
    let score = 0;
    let gameInterval = null;

    // === Colors (Pan-African Inspired) ===
    const COLORS = ["#22c55e", "#ef4444", "#facc15", "#2563eb", "#eab308", "#9333ea"];

    // === Shape Definitions ===
    const SHAPES = [
      [[1, 1, 1, 1]],                 // I
      [[1, 1], [1, 1]],               // O
      [[0, 1, 0], [1, 1, 1]],         // T
      [[1, 0, 0], [1, 1, 1]],         // L
      [[0, 0, 1], [1, 1, 1]],         // J
      [[1, 1, 0], [0, 1, 1]],         // S
      [[0, 1, 1], [1, 1, 0]]          // Z
    ];

    // === Board Initialization ===
    function initBoard() {
      board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    // === Drawing Utilities ===
    function drawSquare(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1);
    }

    function drawBoard() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (board[y][x]) drawSquare(x, y, board[y][x]);
        }
      }
      if (currentPiece) currentPiece.draw();
    }

    // === Piece Class ===
    class Piece {
      constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.x = 3;
        this.y = 0;
      }

      draw() {
        this.shape.forEach((row, r) =>
          row.forEach((v, c) => {
            if (v) drawSquare(this.x + c, this.y + r, this.color);
          })
        );
      }

      move(dir) {
        this.x += dir;
        if (this.collision()) this.x -= dir;
      }

      drop() {
        this.y++;
        if (this.collision()) {
          this.y--;
          this.lock();
          newPiece();
        }
      }

      rotate() {
        const newShape = this.shape[0].map((_, c) =>
          this.shape.map(row => row[c]).reverse()
        );
        const prevShape = this.shape;
        this.shape = newShape;
        if (this.collision()) this.shape = prevShape;
      }

      collision() {
        return this.shape.some((row, r) =>
          row.some(
            (v, c) =>
              v &&
              (this.y + r >= ROWS ||
                this.x + c < 0 ||
                this.x + c >= COLS ||
                board[this.y + r][this.x + c])
          )
        );
      }

      lock() {
        this.shape.forEach((row, r) =>
          row.forEach((v, c) => {
            if (v) board[this.y + r][this.x + c] = this.color;
          })
        );
        clearLines();
      }
    }

    // === Game Logic ===
    function clearLines() {
      let lines = 0;
      for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(v => v)) {
          board.splice(y, 1);
          board.unshift(Array(COLS).fill(0));
          lines++;
        }
      }
      if (lines > 0) {
        score += lines * 100;
        scoreEl.textContent = score;
      }
    }

    function newPiece() {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      currentPiece = new Piece(shape, color);
      if (collisionOnSpawn()) {
        stopGame();
        alert("Game Over — Final Score: " + score);
      }
    }

    function collisionOnSpawn() {
      return currentPiece.shape.some((row, r) =>
        row.some(
          (v, c) =>
            v &&
            board[r + currentPiece.y] &&
            board[r + currentPiece.y][c + currentPiece.x]
        )
      );
    }

    function gameLoop() {
      if (!currentPiece) return;
      currentPiece.drop();
      drawBoard();
    }

    // === Control Functions ===
    function startGame() {
      initBoard();
      score = 0;
      scoreEl.textContent = score;
      newPiece();
      clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, 500);
      document.addEventListener("keydown", handleKey);
    }

    function stopGame() {
      clearInterval(gameInterval);
      gameInterval = null;
      document.removeEventListener("keydown", handleKey);
    }

    // === Keyboard Controls ===
    function handleKey(e) {
      if (!currentPiece) return;
      switch (e.key) {
        case "ArrowLeft":
          currentPiece.move(-1);
          break;
        case "ArrowRight":
          currentPiece.move(1);
          break;
        case "ArrowUp":
          currentPiece.rotate();
          break;
        case "ArrowDown":
          currentPiece.drop();
          break;
      }
      drawBoard();
    }

    // === Event Listeners ===
    startBtn.addEventListener("click", startGame);
    stopBtn.addEventListener("click", stopGame);
  </script>
</body>
</html>
