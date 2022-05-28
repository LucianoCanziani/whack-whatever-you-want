const tittle = document.querySelector(".tittle");
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
  button = dropArea.querySelector("button"),
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
  let fileType = file.type;
  let validExtensions = ["image/jpeg", "image/jpg", "image/png"];
  if (validExtensions.includes(fileType)) {
    let fileReader = new FileReader();
    fileReader.onload = () => {
      let fileURL = fileReader.result;
      let inputTag = `<input type="file" hidden>`,
        imgTag = `<img src="${fileURL}" alt="image">`,
        hoverCover = `<div class="drop-area-load"></div>`;
      dropArea.innerHTML = imgTag + inputTag + hoverCover;
      for (let i = 0; i < moles.length; i++) {
        moles[i].setAttribute("src", fileURL);
      }
      showOnLoad.setAttribute("style", "display:flex");
    };
    fileReader.readAsDataURL(file);
  } else {
    alert("Esa no es una imagen!");
    dropArea.classList.remove("active");
    dragText.textContent = "Arrastra y Suelta la Foto que Quieras Golpear";
  }
}

const displayGame = (e) => {
  tittle.setAttribute("style", "display:none");
  imageInput.setAttribute("style", "display:none");
  navItems.classList.remove("game-hidden");
  navItems.classList.add("nav-items");
  for (let i = 0; i < gameDisplay.length; i++) {
    gameDisplay[i].setAttribute("style", "display:block");
  }
};

const changePhoto = (e) => {
  imageInput.setAttribute("style", "display:block");
  tittle.setAttribute("style", "display:block");
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

const peep = (e) => {
  const time = randomTime(200, 1000);
  const hole = randomHole(holes);
  hole.classList.add("up");
  setTimeout(() => {
    hole.classList.remove("up");
    if (!timeUp) peep();
  }, time);
};

start.addEventListener("click", (e) => {
  scoreBoard.textContent = 0;
  timeUp = false;
  score = 0;
  peep();
  setTimeout(() => (timeUp = true), 10000);
});

const startGame = (e) => {
  scoreBoard.textContent = 0;
  timeUp = false;
  score = 0;
  peep();
  setTimeout(() => (timeUp = true), 10000);
};

function bonk(e) {
  if (!e.isTrusted) return;
  score++;
  this.parentNode.classList.remove("up");
  scoreBoard.textContent = score;
}

moles.forEach((mole) => mole.addEventListener("click", bonk));
