const MOLE_MIN_TIME   = 200;
const MOLE_MAX_TIME   = 1000;
const GAME_DURATION   = 10000;
const MAX_FILE_SIZE   = 5 * 1024 * 1024;
const STUN_DURATION   = 500;
const STUN_MAX_HITS   = 2;
const COMBO_TIMEOUT   = 1400;
const GOLD_CHANCE     = 0.15;
const GOLD_BONUS_TIME = 2000;
const GOLD_BONUS_PTS  = 3;
const SHAKE_COMBO_MIN = 3;

const title       = document.querySelector(".title");
const start       = document.querySelector("#start");
const navItems    = document.querySelector("#navItems");
const gameDisplay = document.querySelectorAll(".game-hide");
const holes       = document.querySelectorAll(".hole");
const scoreBoard  = document.querySelector(".score");
const moles       = document.querySelectorAll(".mole");
const imageInput  = document.querySelector(".image-hide");
const dropArea    = document.querySelector(".drag-area");
const dragText    = dropArea.querySelector("h3");
const input       = dropArea.querySelector("input");
const showOnLoad  = document.querySelector(".show-on-load");

let lastHole;
let timeUp        = false;
let score         = 0;
let comboCount    = 0;
let comboTimer    = null;
let gameInterval  = null;
let gameEndTimeout = null;
let timeLeft      = GAME_DURATION / 1000;

const stunHitsMap  = new WeakMap();
const peepTimeouts = new WeakMap();

let file;
dropArea.onclick = () => { input.click(); };

input.addEventListener("change", function () {
  file = this.files[0];
  dropArea.classList.add("active");
  showFile();
});

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("active");
  dragText.textContent = "Suelta Para Subir la Foto";
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("active");
  dragText.textContent = "Arrastra y Suelta la Foto que Quieras Golpear";
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  file = event.dataTransfer.files[0];
  showFile();
});

function showFile() {
  const fileType = file.type;
  const validExtensions = ["image/jpeg", "image/jpg", "image/png"];
  if (!validExtensions.includes(fileType)) {
    alert("Esa no es una imagen!");
    dropArea.classList.remove("active");
    dragText.textContent = "Arrastra y Suelta la Foto que Quieras Golpear";
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    alert("La imagen es demasiado grande. Máximo 5 MB.");
    dropArea.classList.remove("active");
    return;
  }
  const fileReader = new FileReader();
  fileReader.onload = () => {
    const fileURL = fileReader.result;
    const img = document.createElement("img");
    img.src = fileURL;
    img.alt = "Foto seleccionada";
    const newInput = document.createElement("input");
    newInput.type = "file";
    newInput.hidden = true;
    const cover = document.createElement("div");
    cover.className = "drop-area-load";
    dropArea.replaceChildren(img, newInput, cover);
    moles.forEach((mole) => {
      mole.setAttribute("src", fileURL);
      mole.setAttribute("alt", file.name);
    });
    showOnLoad.setAttribute("style", "display:flex");
  };
  fileReader.onerror = () => {
    alert("Error al leer el archivo. Intentá con otra imagen.");
    dropArea.classList.remove("active");
  };
  try {
    fileReader.readAsDataURL(file);
  } catch (err) {
    alert("No se pudo cargar la imagen.");
    dropArea.classList.remove("active");
  }
}

const displayGame = () => {
  title.setAttribute("style", "display:none");
  imageInput.setAttribute("style", "display:none");
  navItems.classList.remove("game-hidden");
  navItems.classList.add("nav-items");
  for (let i = 0; i < gameDisplay.length; i++) {
    const el = gameDisplay[i];
    el.classList.add("show");
    el.classList.remove("fade-in");
    void el.offsetWidth;
    el.classList.add("fade-in");
  }
};

const changePhoto = () => {
  imageInput.setAttribute("style", "display:block");
  imageInput.classList.remove("fade-in");
  void imageInput.offsetWidth;
  imageInput.classList.add("fade-in");
  title.setAttribute("style", "display:block");
  navItems.classList.remove("nav-items");
  navItems.classList.add("game-hidden");
  for (let i = 0; i < gameDisplay.length; i++) {
    gameDisplay[i].classList.remove("show");
  }
};

const randomTime = (min, max) =>
  Math.round(Math.random() * (max - min) + min);

const randomHole = (holes) => {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) return randomHole(holes);
  lastHole = hole;
  return hole;
};

const peep = () => {
  const time = randomTime(MOLE_MIN_TIME, MOLE_MAX_TIME);
  const hole = randomHole(holes);
  hole.classList.add("up");
  if (Math.random() < GOLD_CHANCE) hole.classList.add("gold");
  const t = setTimeout(() => {
    peepTimeouts.delete(hole);
    hole.classList.remove("up", "gold", "stunned");
    if (!timeUp) peep();
  }, time);
  peepTimeouts.set(hole, t);
};

const startTimer = () => {
  const timerEl = document.getElementById("timer");
  timeLeft = GAME_DURATION / 1000;
  timerEl.textContent = timeLeft;
  timerEl.classList.remove("urgent");
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 1);
    timerEl.textContent = timeLeft;
    if (timeLeft <= 3) timerEl.classList.add("urgent");
    if (timeLeft <= 0) clearInterval(gameInterval);
  }, 1000);
};

const addBonusTime = (ms) => {
  const timerEl = document.getElementById("timer");
  timeLeft += ms / 1000;
  timerEl.textContent = Math.round(timeLeft);
  if (timeLeft > 3) timerEl.classList.remove("urgent");
  clearTimeout(gameEndTimeout);
  gameEndTimeout = setTimeout(() => {
    timeUp = true;
    clearInterval(gameInterval);
  }, timeLeft * 1000);
};

const resetCombo = () => {
  comboCount = 0;
  const el = document.getElementById("combo");
  el.textContent = "";
  el.classList.remove("active");
};

const updateCombo = () => {
  clearTimeout(comboTimer);
  comboCount++;
  const el = document.getElementById("combo");
  if (comboCount >= 2) {
    el.classList.remove("active");
    void el.offsetWidth;
    el.textContent = `COMBO ×${comboCount}`;
    el.classList.add("active");
  }
  comboTimer = setTimeout(resetCombo, COMBO_TIMEOUT);
};

const spawnParticles = (x, y, isGold) => {
  const count = isGold ? 12 : 7;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = isGold ? "particle gold-particle" : "particle";
    p.style.cssText = `left:${x}px;top:${y}px;--dx:${(Math.random() - 0.5) * 120}px;--dy:${-(Math.random() * 80 + 40)}px`;
    document.body.appendChild(p);
    p.addEventListener("animationend", () => p.remove(), { once: true });
  }
};

const spawnFloatText = (x, y, text) => {
  const el = document.createElement("span");
  el.className = "float-text";
  el.textContent = text;
  el.style.cssText = `left:${x}px;top:${y}px`;
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
};

const triggerShake = () => {
  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 300);
};

const vibrate = (isGold) => {
  if (!navigator.vibrate) return;
  navigator.vibrate(isGold ? [80, 40, 80] : 40);
};

start.addEventListener("click", () => {
  scoreBoard.textContent = 0;
  timeUp = false;
  score = 0;
  clearTimeout(comboTimer);
  resetCombo();
  startTimer();
  peep();
  clearTimeout(gameEndTimeout);
  gameEndTimeout = setTimeout(() => {
    timeUp = true;
    clearInterval(gameInterval);
  }, GAME_DURATION);
});

const bonk = (e) => {
  if (!e.isTrusted) return;

  const hole = e.currentTarget.parentNode;
  const currentHits = stunHitsMap.get(hole) || 0;
  if (currentHits >= STUN_MAX_HITS) return;

  const isGold = hole.classList.contains("gold");
  const pts = isGold ? GOLD_BONUS_PTS : 1;
  score += pts;
  scoreBoard.textContent = score;

  const cx = e.clientX;
  const cy = e.clientY;
  spawnParticles(cx, cy, isGold);
  updateCombo();

  if (isGold) {
    spawnFloatText(cx, cy - 20, `+${GOLD_BONUS_PTS}`);
    spawnFloatText(cx, cy - 55, "⭐ GOLD!");
    addBonusTime(GOLD_BONUS_TIME);
    triggerShake();
    vibrate(true);
    hole.classList.remove("gold");
  } else {
    spawnFloatText(cx, cy - 20, comboCount >= 2 ? "¡POW!" : "+1");
    if (comboCount >= SHAKE_COMBO_MIN) triggerShake();
    vibrate(false);
  }

  const t = peepTimeouts.get(hole);
  if (t) {
    clearTimeout(t);
    peepTimeouts.delete(hole);
  }

  const hits = currentHits + 1;
  stunHitsMap.set(hole, hits);
  hole.classList.add("stunned");

  const stunDelay = hits >= STUN_MAX_HITS ? 150 : STUN_DURATION;
  setTimeout(() => {
    hole.classList.remove("up", "stunned", "gold");
    stunHitsMap.delete(hole);
    if (!timeUp) peep();
  }, stunDelay);
};

moles.forEach((mole) => mole.addEventListener("click", bonk));
document.querySelector(".change-photo").addEventListener("click", changePhoto);
document.querySelector(".go-game").addEventListener("click", displayGame);
