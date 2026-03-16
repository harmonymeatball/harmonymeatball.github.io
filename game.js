const TOTAL_LEVELS = 5;

const boardEl = document.querySelector(".game-board");
const levelLabelEl = document.getElementById("level-label");
const messageEl = document.getElementById("message");
const resetBtn = document.getElementById("reset-game");
const biggerTextBtn = document.getElementById("bigger-text");
const smallerTextBtn = document.getElementById("smaller-text");

let currentLevel = 1;
let isLocked = false;
let hotIndex = 0;

function levelToTiles(level) {
  const base = 6;
  return Math.min(12, base + (level - 1) * 2);
}

function levelToAllowedMistakes(level) {
  return level === 1 ? 6 : level === 2 ? 5 : level === 3 ? 4 : level === 4 ? 3 : 2;
}

function clearBoard() {
  while (boardEl.firstChild) {
    boardEl.removeChild(boardEl.firstChild);
  }
}

function speak(text) {
  messageEl.textContent = text;
}

function updateLevelLabel() {
  levelLabelEl.textContent = `Level ${currentLevel} of ${TOTAL_LEVELS}`;
}

function getDistanceHint(index, hotIndex, total) {
  const cols = window.innerWidth <= 540 ? 3 : 4;
  const row = Math.floor(index / cols);
  const col = index % cols;
  const hotRow = Math.floor(hotIndex / cols);
  const hotCol = hotIndex % cols;
  const dist = Math.abs(row - hotRow) + Math.abs(col - hotCol);

  if (dist === 0) return "Perfect!";
  if (dist === 1) return "Very close.";
  if (dist === 2) return "Close.";
  if (dist === 3) return "A bit far.";
  return "Far away.";
}

function buildLevel(level) {
  clearBoard();
  isLocked = false;

  const tilesCount = levelToTiles(level);
  const allowedMistakes = levelToAllowedMistakes(level);
  let mistakesLeft = allowedMistakes;

  const tiles = [];
  for (let i = 0; i < tilesCount; i++) {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";
    tile.setAttribute("aria-label", "Shape tile");

    const shape = document.createElement("div");
    shape.className = "tile-shape cold";
    tile.appendChild(shape);

    tiles.push(tile);
    boardEl.appendChild(tile);
  }

  hotIndex = Math.floor(Math.random() * tilesCount);
  tiles[hotIndex].classList.add("hot");

  updateLevelLabel();
  speak(level === 1 ? "Click the glowing, bright green shape." : "New level. Find the glowing shape again.");

  tiles.forEach((tile, index) => {
    tile.addEventListener("click", () => {
      if (isLocked) return;

      if (index === hotIndex) {
        isLocked = true;
        tile.classList.add("correct");
        speak(
          currentLevel === TOTAL_LEVELS
            ? "You found the final shape! Game complete."
            : "Nice! You found it. Moving to the next level."
        );

        setTimeout(() => {
          if (currentLevel < TOTAL_LEVELS) {
            currentLevel += 1;
            buildLevel(currentLevel);
          }
        }, 900);
      } else {
        mistakesLeft -= 1;
        const shape = tile.querySelector(".tile-shape");
        shape.classList.add("bad");

        const hint = getDistanceHint(index, hotIndex, tilesCount);

        if (mistakesLeft <= 0) {
          isLocked = true;
          speak("That was the last try on this level. Restarting the level.");
          setTimeout(() => buildLevel(currentLevel), 900);
        } else {
          speak(`${hint} Tries left on this level: ${mistakesLeft}.`);
        }
      }
    });
  });
}

function adjustRootFont(delta) {
  const htmlEl = document.documentElement;
  const current = parseFloat(getComputedStyle(htmlEl).fontSize) || 18;
  const next = Math.min(28, Math.max(14, current + delta));
  htmlEl.style.fontSize = `${next}px`;
}

resetBtn.addEventListener("click", () => {
  currentLevel = 1;
  buildLevel(currentLevel);
});

biggerTextBtn.addEventListener("click", () => adjustRootFont(2));
smallerTextBtn.addEventListener("click", () => adjustRootFont(-2));

window.addEventListener("load", () => {
  buildLevel(currentLevel);
});

