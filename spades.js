/* =====================================================
   Black Dollar Trust Spades — Legacy Table
   Module 1: 3D Setup, Deck, Dealing, Player Interaction
===================================================== */

// === DOM ELEMENTS ===
const canvas = document.getElementById("spades3D");
const startBtn = document.getElementById("startGame");
const easyBtn = document.getElementById("easyMode");
const hardBtn = document.getElementById("hardMode");
const playerHandEl = document.getElementById("playerHand");

// === GAME STATE ===
let scene, camera, renderer, table, deck = [];
let playerHand = [], partnerHand = [], ai1Hand = [], ai2Hand = [];
let gameStarted = false;
let difficulty = "easy";

// === 3D INITIALIZATION ===
function init3D() {
  scene = new THREE.Scene();

  // Camera
  const aspect = canvas.clientWidth / canvas.clientHeight;
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x0a0a0a);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const spot = new THREE.SpotLight(0xfacc15, 1.5);
  spot.position.set(5, 8, 5);
  scene.add(ambient, spot);

  // Table Felt
  const tableGeo = new THREE.CylinderGeometry(5, 5, 0.3, 64);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x022b12, // deep green felt
    metalness: 0.3,
    roughness: 0.7,
  });
  table = new THREE.Mesh(tableGeo, tableMat);
  table.position.y = -0.3;
  scene.add(table);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// === DECK CREATION ===
const suits = ["♠", "♥", "♦", "♣"];
const values = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

function buildDeck() {
  deck = [];
  suits.forEach(suit => {
    values.forEach(value => {
      deck.push({ value, suit });
    });
  });
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// === DEAL CARDS ===
function dealHands() {
  playerHand = [];
  partnerHand = [];
  ai1Hand = [];
  ai2Hand = [];
  for (let i = 0; i < 13; i++) {
    playerHand.push(deck.pop());
    partnerHand.push(deck.pop());
    ai1Hand.push(deck.pop());
    ai2Hand.push(deck.pop());
  }
  renderPlayerHand();
}

// === DISPLAY PLAYER HAND (2D UI Layer) ===
function renderPlayerHand() {
  playerHandEl.innerHTML = "";
  playerHand.forEach((card, idx) => {
    const el = document.createElement("div");
    el.className = "card";
    el.textContent = card.value + card.suit;
    el.dataset.index = idx;
    el.addEventListener("click", () => playCard(idx));
    playerHandEl.appendChild(el);
  });
}

// === CARD PLAY EVENT ===
function playCard(index) {
  if (!gameStarted) return;
  const card = playerHand[index];
  console.log("Played:", card.value + card.suit);
  playerHand.splice(index, 1);
  renderPlayerHand();

  // TEMPORARY: add floating card animation in 3D
  const geom = new THREE.PlaneGeometry(1, 1.5);
  const mat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set((Math.random() - 0.5) * 4, 0.2, (Math.random() - 0.5) * 3);
  scene.add(mesh);
  setTimeout(() => scene.remove(mesh), 1000);
}

// === START GAME ===
function startGameSession() {
  console.log("Starting Spades in mode:", difficulty);
  buildDeck();
  shuffleDeck();
  dealHands();
  gameStarted = true;

  // Sound placeholder (will add Howler sounds in Module 2)
  console.log("Sound: shuffle + deal");
}

// === BUTTON EVENTS ===
easyBtn.addEventListener("click", () => {
  difficulty = "easy";
  easyBtn.classList.add("selected");
  hardBtn.classList.remove("selected");
});
hardBtn.addEventListener("click", () => {
  difficulty = "hard";
  hardBtn.classList.add("selected");
  easyBtn.classList.remove("selected");
});
startBtn.addEventListener("click", startGameSession);

// === INITIALIZE ===
window.addEventListener("load", init3D);
window.addEventListener("resize", () => {
  if (!renderer || !camera) return;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
});
