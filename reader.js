/* ===================================================
   Black Dollar Trust Book Club – Reader + Upload Logic
=================================================== */

// --- PDF.js setup ---
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

// Elements
const bookInput = document.getElementById("bookInput");
const bookList = document.getElementById("bookList");
const uploadStatus = document.getElementById("uploadStatus");
const pdfCanvas = document.getElementById("pdfCanvas");
const textPreview = document.getElementById("textPreview");
const voiceSelect = document.getElementById("voiceSelect");
const readBtn = document.getElementById("readBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");

const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");

let books = [];
let currentBook = null;
let synth = window.speechSynthesis;

// ========== Logo upload ==========
function initLogo() {
  const savedLogo = localStorage.getItem("clubLogo");
  if (savedLogo) {
    logoPreview.src = savedLogo;
  } else {
    logoPreview.src = "https://upload.wikimedia.org/wikipedia/commons/3/3d/Gold_chain_pattern.svg";
  }

  logoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      logoPreview.src = reader.result;
      localStorage.setItem("clubLogo", reader.result);
    };
    reader.readAsDataURL(file);
  });
}
initLogo();

// ========== Book upload + preview ==========
bookInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;
  uploadStatus.textContent = "Loading files...";
  books = [];
  bookList.innerHTML = "";
  textPreview.textContent = "";
  pdfCanvas.style.display = "none";

  for (const file of files) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "txt") {
      const text = await file.text();
      books.push({ name: file.name, type: "txt", text });
    } else if (ext === "pdf") {
      const arrayBuffer = await file.arrayBuffer();
      books.push({ name: file.name, type: "pdf", data: arrayBuffer });
    } else if (ext === "epub") {
      const arrayBuffer = await file.arrayBuffer();
      books.push({ name: file.name, type: "epub", data: arrayBuffer });
    }
  }

  renderBookList();
});

function renderBookList() {
  bookList.innerHTML = "";
  books.forEach((book, i) => {
    const div = document.createElement("div");
    div.textContent = book.name;
    div.addEventListener("click", () => openBook(i));
    bookList.appendChild(div);
  });
  uploadStatus.textContent = `${books.length} file(s) loaded.`;
}

async function openBook(index) {
  currentBook = books[index];
  Array.from(bookList.children).forEach((el, i) =>
    el.classList.toggle("active", i === index)
  );

  textPreview.textContent = "";
  pdfCanvas.style.display = "none";

  if (currentBook.type === "txt") {
    textPreview.textContent = currentBook.text.slice(0, 5000);
  } else if (currentBook.type === "pdf") {
    renderPDF(currentBook.data);
  } else if (currentBook.type === "epub") {
    renderEPUB(currentBook.data);
  }
}

// ---------- PDF ----------
async function renderPDF(arrayBuffer) {
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdfDoc.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });
  const ctx = pdfCanvas.getContext("2d");
  pdfCanvas.height = viewport.height;
  pdfCanvas.width = viewport.width;
  pdfCanvas.style.display = "block";
  await page.render({ canvasContext: ctx, viewport }).promise;
  uploadStatus.textContent = `PDF loaded: page 1 / ${pdfDoc.numPages}`;
}

// ---------- EPUB ----------
function renderEPUB(arrayBuffer) {
  const book = ePub(arrayBuffer);
  book.renderTo(textPreview);
  uploadStatus.textContent = "EPUB loaded.";
}

// ---------- TTS ----------
function populateVoices() {
  const voices = synth.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
}
populateVoices();
if (synth) synth.onvoiceschanged = populateVoices;

let currentUtterance = null;
readBtn.addEventListener("click", () => {
  if (!currentBook || currentBook.type !== "txt") {
    uploadStatus.textContent = "Voice reading works with TXT only.";
    return;
  }
  const voice = synth.getVoices().find(v => v.name === voiceSelect.value);
  currentUtterance = new SpeechSynthesisUtterance(currentBook.text);
  if (voice) currentUtterance.voice = voice;
  synth.speak(currentUtterance);
  uploadStatus.textContent = "Reading...";
});

pauseBtn.addEventListener("click", () => {
  if (synth.speaking) {
    if (synth.paused) synth.resume();
    else synth.pause();
  }
});
stopBtn.addEventListener("click", () => {
  synth.cancel();
  uploadStatus.textContent = "Stopped.";
});
