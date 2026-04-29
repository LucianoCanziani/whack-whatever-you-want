const MOLE_MIN_TIME = 200;
const MOLE_MAX_TIME = 1000;
const GAME_DURATION = 10000;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const title = document.querySelector(".title");
const start = document.querySelector("#start");
const navItems = document.querySelector("#navItems");
const gameDisplay = document.querySelectorAll(".game-hide");
const navDisplay = document.querySelector(".game-hidden");
const holes = document.querySelectorAll(".hole");
const scoreBoard = document.querySelector(".score");
const moles = document.querySelectorAll(".mole");
let lastHole;
let timeUp = false;
let score = 0;
const imageInput = document.querySelector(".image-hide");
const dropArea = document.querySelector(".drag-area"),
  dragText = dropArea.querySelector("h3"),
  input = dropArea.querySelector("input"),
  showOnLoad = document.querySelector(".show-on-load");

let file;
dropArea.onclick = () => {
  input.click();
};

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
    gameDisplay[i].setAttribute("style", "display:block");
  }
};

const changePhoto = () => {
  imageInput.setAttribute("style", "display:block");
  title.setAttribute("style", "display:block");
  navItems.classList.remove("nav-items");
  navItems.classList.add("game-hidden");
  for (let i = 0; i < gameDisplay.length; i++) {
    gameDisplay[i].setAttribute("style", "display:none");
  }
};

const randomTime = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

const randomHole = (holes) => {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) {
    return randomHole(holes);
  }
  lastHole = hole;
  return hole;
};

const peep = () => {
  const time = randomTime(MOLE_MIN_TIME, MOLE_MAX_TIME);
  const hole = randomHole(holes);
  hole.classList.add("up");
  setTimeout(() => {
    hole.classList.remove("up");
    if (!timeUp) peep();
  }, time);
};

start.addEventListener("click", () => {
  scoreBoard.textContent = 0;
  timeUp = false;
  score = 0;
  peep();
  setTimeout(() => (timeUp = true), GAME_DURATION);
});

const bonk = (e) => {
  if (!e.isTrusted) return;
  score++;
  e.currentTarget.parentNode.classList.remove("up");
  scoreBoard.textContent = score;
};

moles.forEach((mole) => mole.addEventListener("click", bonk));

document.querySelector(".change-photo").addEventListener("click", changePhoto);
document.querySelector(".go-game").addEventListener("click", displayGame);
