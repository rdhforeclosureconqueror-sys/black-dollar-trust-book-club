/* ===================================================
   Black Block Blast – Pan-African Tetris Variant
=================================================== */

const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("tetrisStartBtn");
const stopBtn = document.getElementById("tetrisStopBtn");
const scoreEl = document.getElementById("tetrisScore");

const COLS = 10, ROWS = 20, BLOCK = 25;
canvas.width = COLS * BLOCK;
canvas.height = ROWS * BLOCK;

let board = [];
let currentPiece = null;
let gameInterval = null;
let score = 0;

// Colors inspired by Pan-African palette
const COLORS = ["#ef4444", "#22c55e", "#facc15", "#3b82f6", "#eab308"];

// Pieces
const SHAPES = [
  [[1, 1, 1, 1]],                 // I
  [[1, 1], [1, 1]],               // O
  [[0, 1, 0], [1, 1, 1]],         // T
  [[1, 0, 0], [1, 1, 1]],         // L
  [[0, 0, 1], [1, 1, 1]],         // J
  [[1, 1, 0], [0, 1, 1]],         // S
  [[0, 1, 1], [1, 1, 0]]          // Z
];

function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

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

class Piece {
  constructor(shape, color) {
    this.shape = shape;
    this.color = color;
    this.x = 3;
    this.y = 0;
  }
  draw() {
    this.shape.forEach((row, r) =>
      row.forEach((v, c) => v && drawSquare(this.x + c, this.y + r, this.color))
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
}

function gameLoop() {
  currentPiece.drop();
  drawBoard();
}

function startGame() {
  initBoard();
  newPiece();
  score = 0;
  scoreEl.textContent = "0";
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 600);
  document.addEventListener("keydown", handleKey);
}

function stopGame() {
  clearInterval(gameInterval);
  gameInterval = null;
  document.removeEventListener("keydown", handleKey);
}

function handleKey(e) {
  if (!currentPiece) return;
  switch (e.key) {
    case "ArrowLeft": currentPiece.move(-1); break;
    case "ArrowRight": currentPiece.move(1); break;
    case "ArrowUp": currentPiece.rotate(); break;
    case "ArrowDown": currentPiece.drop(); break;
  }
  drawBoard();
}

startBtn.addEventListener("click", startGame);
stopBtn.addEventListener("click", stopGame);
