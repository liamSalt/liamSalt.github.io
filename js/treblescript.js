// Get all cells and the popup elements
const cells = document.querySelectorAll('.clue');
const cats = document.querySelectorAll('.category');
const cluePopup = document.querySelector('.clue-popup');
const clueText = document.querySelector('.clue-text');
const closeButton = document.querySelector('.close-button');
let playerCount = 1;

const folderInput = document.getElementById("folderInput");
const loadBtn = document.getElementById("loadGameBtn");
const statusEl = document.getElementById("upload-status");

let fileMap = new Map();
let game; 

let currentQuestion = null;
let timeMultiplier = 1; // normal

cells.forEach(cell => {
  cell.addEventListener('click', function () {
	  
	resetTimeSlider();

    // Always set wager FIRST (works in both modes)
    const wagerEl = document.getElementById("wager");
    const cellPoints = parseInt(cell.getAttribute("points")) || 0;
    wagerEl.points = cellPoints;
    wagerEl.innerHTML = "Wager: " + cellPoints;

    // Show popup
    const clueX = cell.getAttribute("clue-text");
    clueText.textContent = clueX;
    cluePopup.style.display = "block";

    // If a game is loaded, bind audio question
    if (game) {
      const allClues = Array.from(cells);
const cellIndex = allClues.indexOf(cell);

// 5 categories, 5 rows
const row = Math.floor(cellIndex / 5);   // question index (0–4)
const col = cellIndex % 5;               // category index (0–4)

currentQuestion = game.categories[col].questions[row];
    } else {
      // No-file mode: no audio question
      currentQuestion = null;
    }
	
	if (currentQuestion?.dailydouble) {
  timeMultiplier = 2;
  showDailyDoubleOverlay();
  configureSliderForDailyDouble();
	} else {
	  timeMultiplier = 1;
	  configureSliderNormal();
	}

    // Mark cell used
    cell.innerHTML = "";
	answerText.style.display = "none";
	answerText.textContent = "";
  });
});
const playButton = document.getElementById("playbutton");
// Play button always uses the current question
playButton.onclick = async function () {
  if (!currentQuestion) {
    alert("No audio loaded for this question.");
    return;
  }

  const timeWindow =
    0.5 * parseInt(document.getElementById("myRange").value);

  await playQuestion(currentQuestion, timeWindow);
};

function configureSliderNormal() {
  const slider = document.getElementById("myRange");
  slider.min = 1;
  slider.max = 20;
  resetTimeSlider();
}

function configureSliderForDailyDouble() {
  const slider = document.getElementById("myRange");
  slider.min = 1;
  slider.max = 40;
  resetTimeSlider();
}
// Function to display the clue popup
function showClue(clueX) {
	cells.forEach(cell => {
        cell.style.display = "none";  // Make cells visible again
    });
	cats.forEach(cell => {
        cell.style.display = "none";  // Make cells visible again
    });
    clueText.textContent = clueX;
    cluePopup.style.display = 'block';
}

// Close the clue popup
closeButton.addEventListener('click', function() {
	audioManager.stop();
    cluePopup.style.display = 'none';
	 cells.forEach(cell => {
        cell.style.display = "block";  // Make cells visible again
    });
	cats.forEach(cell => {
        cell.style.display = "block";  // Make cells visible again
    });
});
function increment(playerNum){
	const value = document.getElementById("myRange").value;
	const win = document.getElementById("wager");
	const ID = 'player'.concat(playerNum.toString()).concat('score');
	console.log(ID);
	const player = document.getElementById(ID);
							
	player.innerHTML = (parseInt(player.innerHTML)+ Math.ceil(parseInt(win.points)*(1+0.5*(10-0.5*value)))).toString();
}
function decrement(playerNum){
	const value = document.getElementById("myRange").value;
	const win = document.getElementById("wager");
	const ID = 'player'.concat(playerNum.toString()).concat('score');
	console.log(ID);
	const player = document.getElementById(ID);
							
	player.innerHTML = (parseInt(player.innerHTML)- Math.ceil(parseInt(win.points)*(1+0.5*(10-0.5*value)))).toString();
}
function playerInc(){playerCount+=1};



folderInput.addEventListener("change", () => {
  fileMap.clear();

  for (const file of folderInput.files) {
    // Normalize path
    const path =
      file.webkitRelativePath || file.name;

    // Remove leading folder name
    const cleanPath = path.replace(/^[^/]+\//, "");

    fileMap.set(cleanPath, file);
  }

  if (fileMap.has("game.json")) {
    statusEl.textContent = "Game pack detected. Press load button.";
    loadBtn.disabled = false;
  } else {
    statusEl.textContent = "Missing game.json.";
    loadBtn.disabled = true;
  }
});

loadBtn.addEventListener("click", async () => {
  try {
    game = await loadAndValidateGame(fileMap);
    statusEl.textContent = "Game loaded successfully!";
    console.log("Validated game:", game);

    updateCategoryHeaders(game);

  } catch (err) {
    statusEl.textContent = err.message;
    console.error(err);
  }
});

async function loadAndValidateGame(fileMap) {
  const gameFile = fileMap.get("game.json");
  if (!gameFile) {
    throw new Error("game.json not found.");
  }

  let game;
  try {
    game = JSON.parse(await gameFile.text());
  } catch {
    throw new Error("game.json is not valid JSON.");
  }

  if (!Array.isArray(game.categories) || game.categories.length !== 5) {
    throw new Error("Game must have exactly 5 categories.");
  }

  game.categories.forEach((cat, cIdx) => {
    if (typeof cat.name !== "string") {
      throw new Error(`Category ${cIdx + 1} is missing a name.`);
    }

    if (!Array.isArray(cat.questions) || cat.questions.length !== 5) {
      throw new Error(`Category "${cat.name}" must have 5 questions.`);
    }

    cat.questions.forEach((q, qIdx) => {

      if (typeof q.audio !== "string") {
        throw new Error(`Missing audio path in ${cat.name}, question ${qIdx + 1}.`);
      }

      if (typeof q.answer !== "string") {
        throw new Error(`Missing answer in ${cat.name}, question ${qIdx + 1}.`);
      }

      if (typeof q.startOffset !== "number" || q.startOffset < 0) {
        throw new Error(
          `Invalid startOffset in ${cat.name}, question ${qIdx + 1}.`
        );
      }
    });
  });

  validateAudioReferences(game, fileMap);

  return game;
}

function validateAudioReferences(game, fileMap) {
  const allowedExt = [".mp3", ".m4a"];

  for (const cat of game.categories) {
    for (const q of cat.questions) {
      const file = fileMap.get(q.audio);

      if (!file) {
        throw new Error(`Missing audio file: ${q.audio}`);
      }

      const lower = q.audio.toLowerCase();
      if (!allowedExt.some(ext => lower.endsWith(ext))) {
        throw new Error(`Unsupported audio format: ${q.audio}`);
      }

      // Optional sanity check
      if (file.size > 20 * 1024 * 1024) {
        throw new Error(`Audio file too large: ${q.audio}`);
      }
    }
  }
}

class AudioManager {
  constructor() {
    this.ctx = new AudioContext();
    this.cache = new Map(); // path -> AudioBuffer
    this.currentSource = null;
    this.clipStartTime = null;
  }

  async ensureReady() {
    if (this.ctx.state !== "running") {
      await this.ctx.resume();
    }
  }

  async decode(file, path) {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);

    this.cache.set(path, audioBuffer);
    return audioBuffer;
  }

  stop() {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {}
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    this.clipStartTime = null;
  }

  playClip(buffer, offset, duration) {
    this.stop();

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.ctx.destination);

    this.clipStartTime = this.ctx.currentTime;
    source.start(this.clipStartTime, offset, duration);

    this.currentSource = source;

    source.onended = () => {
      if (this.currentSource === source) {
        this.currentSource = null;
      }
    };
  }

  getElapsedTime() {
    if (this.clipStartTime === null) return null;
    return this.ctx.currentTime - this.clipStartTime;
  }
}

const audioManager = new AudioManager();

async function playQuestion(question, timeWindowSeconds) {
  await audioManager.ensureReady();

  const file = fileMap.get(question.audio);
  const buffer = await audioManager.decode(file, question.audio);

  // Safety: ensure clip fits
  const maxOffset = buffer.duration - timeWindowSeconds;
  const offset = Math.min(question.startOffset, maxOffset);

  audioManager.playClip(buffer, offset, timeWindowSeconds);
}

const revealButton = document.getElementById("revealButton");
const answerText = document.getElementById("answerText");

revealButton.onclick = function () {
  if (!currentQuestion) {
    alert("No question selected!");
    return;
  }

  answerText.textContent = "\"".concat(currentQuestion.answer).concat("\"").concat(" by ").concat(currentQuestion.artist);
  answerText.style.display = "block";
};

function updateCategoryHeaders(game) {
  if (!game || !Array.isArray(game.categories)) return;

  cats.forEach((catEl, index) => {
    if (game.categories[index]) {
      catEl.textContent = game.categories[index].name;
      catEl.contentEditable = "false";
    }
  });
}
function resetTimeSlider() {
  const slider = document.getElementById("myRange");
  const output = slider.nextElementSibling.nextElementSibling;

  slider.value = 20; // default = 10 seconds
  output.value = "10 seconds";

  updateWager(); // recalc wager based on reset time
}

function showDailyDoubleOverlay() {
    const overlay = document.getElementById("dailyDoubleOverlay");
    const audio = document.getElementById("dailyDoubleSound");

    // Show overlay
    overlay.style.display = "flex";

    // Play sound
    audio.currentTime = 0;
    audio.play();

    // Hide overlay after 4 seconds
    setTimeout(() => {
        overlay.style.display = "none";
    }, 3000);
}