let players = [];
let currentLeft;
let currentRight;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let isFirstRound = true;
let usedNames = [];

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");

document.getElementById("high-score").textContent = highScore;

document.getElementById("play-btn").addEventListener("click", () => {
  transitionScreens(startScreen, gameScreen, async () => {
    score = 0;
    isFirstRound = true;
    usedNames = [];
    document.getElementById("score").textContent = score;
    resetGameVisuals();

    const res = await fetch("/api/players");
    players = await res.json();

    pickPlayers();
  });
});

document.getElementById("restart-btn").addEventListener("click", () => {
  transitionScreens(endScreen, gameScreen, async () => {
    score = 0;
    isFirstRound = true;
    usedNames = [];
    document.getElementById("score").textContent = score;
    resetGameVisuals();

    const res = await fetch("/api/players");
    players = await res.json();

    pickPlayers();
  });
});

function resetGameVisuals() {
  const goalsLeft = document.getElementById("goals-left");
  goalsLeft.textContent = "";
  goalsLeft.classList.remove("counter");

  const playerRight = document.getElementById("player-right");
  const oldGoalsRight = playerRight.querySelectorAll(".counter");
  oldGoalsRight.forEach(el => el.remove());

  const centerBar = document.getElementById("center-bar");
  const oldMarks = centerBar.querySelectorAll(".checkmark, .crossmark");
  oldMarks.forEach(el => el.remove());
}

function transitionScreens(fromScreen, toScreen, callback) {
  fromScreen.classList.add("fade-out");
  setTimeout(() => {
    fromScreen.classList.remove("active", "fade-out");
    toScreen.classList.add("active");
    if (callback) callback();
  }, 800);
}

function pickPlayers() {
  if (isFirstRound) {
    currentLeft = getUniquePlayer();
  } else {
    currentLeft = currentRight;
  }

  currentRight = getUniquePlayer(currentLeft.name);

  updateUI();
}

function getUniquePlayer(excludeName = null) {
  let available = players.filter(p => !usedNames.includes(p.name) && p.name !== excludeName);

  if (available.length === 0) {
    usedNames = [];
    available = players.filter(p => p.name !== excludeName);
  }

  const chosen = available[Math.floor(Math.random() * available.length)];
  usedNames.push(chosen.name);
  return chosen;
}

function updateUI() {
  const imgLeft = document.getElementById("img-left");
  const nameLeft = document.getElementById("name-left");
  const goalsLeft = document.getElementById("goals-left");

  const imgRight = document.getElementById("img-right");
  const nameRight = document.getElementById("name-right");

  const elements = [imgLeft, nameLeft, goalsLeft, imgRight, nameRight];
  elements.forEach(el => el.classList.remove("player-transition"));

  setTimeout(() => {
    imgLeft.src = currentLeft.image;
    nameLeft.textContent = currentLeft.name;
    goalsLeft.textContent = isFirstRound ? "" : `${currentLeft.goals} goluri`;
    goalsLeft.classList.remove("counter");

    imgRight.src = currentRight.image;
    nameRight.textContent = currentRight.name;

    elements.forEach(el => el.classList.add("player-transition"));
  }, 100);
}

document.getElementById("img-left").addEventListener("click", () => checkAnswer("left"));
document.getElementById("img-right").addEventListener("click", () => checkAnswer("right"));

function checkAnswer(choice) {
  if (!currentLeft || !currentRight) return;

  const correct =
    (choice === "left" && currentLeft.goals >= currentRight.goals) ||
    (choice === "right" && currentRight.goals >= currentLeft.goals);

  const goalsLeft = document.getElementById("goals-left");
  const goalsRight = document.createElement("p");
  goalsRight.className = "counter";
  goalsRight.textContent = "0 goluri";
  document.getElementById("player-right").appendChild(goalsRight);

  const check = document.createElement("div");
  check.className = correct ? "checkmark" : "crossmark";
  check.textContent = correct ? "✅" : "❌";
  document.getElementById("center-bar").appendChild(check);

  if (isFirstRound) {
    goalsLeft.classList.add("counter");
    animateCounter(goalsLeft, currentLeft.goals);
    isFirstRound = false;
  }

  goalsRight.classList.add("counter");

  if (correct) {
    score++;
    document.getElementById("score").textContent = score;

    animateCounter(goalsRight, currentRight.goals, () => {
      setTimeout(() => {
        check.remove();
        goalsRight.remove();
        pickPlayers();
      }, 300);
    });
  } else {
    animateCounter(goalsRight, currentRight.goals, () => {
      setTimeout(() => {
        check.remove();
        transitionScreens(gameScreen, endScreen, () => {
          document.getElementById("final-score").textContent = score;
          if (score > highScore) {
            localStorage.setItem("highScore", score);
            highScore = score;
            document.getElementById("high-score").textContent = highScore;
          }
        });
      }, 300);
    });
  }
}

function animateCounter(el, target, onComplete) {
  const duration = 1600;
  const minSteps = 25;
  const maxSteps = 80;

  const steps = Math.min(Math.max(Math.floor(target), minSteps), maxSteps);
  const increment = target / steps;
  const interval = duration / steps;

  let count = 0;
  const counter = setInterval(() => {
    count += increment;
    if (count >= target) {
      count = target;
      clearInterval(counter);
      if (onComplete) {
        setTimeout(onComplete, 300);
      }
    }
    el.textContent = `${Math.floor(count)} goluri`;
  }, interval);
}

// SHARE FUNCTIONALITY

document.getElementById("copy-btn").addEventListener("click", () => {
  const finalScore = document.getElementById("final-score").textContent;
  const message = `Scorul meu pe Superliga Higher or Lower este: ${finalScore}\nTe provoc și pe tine 👉 https://superligahigherlower.ro`;

  navigator.clipboard.writeText(message).then(() => {
    alert("Link copiat în clipboard! 📋");
  }).catch(() => {
    alert("Nu am reușit să copiez linkul. Poți să-l copiezi manual.");
  });
});

document.getElementById("whatsapp-share").addEventListener("click", () => {
  const score = document.getElementById("final-score").textContent;
  const text = encodeURIComponent(`Scorul meu pe Superliga Higher or Lower este: ${score}\nTe provoc și pe tine 👉 https://superligahigherlower.ro`);
  document.getElementById("whatsapp-share").href = `https://wa.me/?text=${text}`;
});

document.getElementById("instagram-share").addEventListener("click", () => {
  document.getElementById("instagram-share").href = `https://www.instagram.com/superligahigherlower`;
});

document.getElementById("facebook-share").addEventListener("click", () => {
  const score = document.getElementById("final-score").textContent;
  const url = encodeURIComponent("https://superligahigherlower.ro");
  const quote = encodeURIComponent(`Scorul meu pe Superliga Higher or Lower este: ${score}\nTe provoc și pe tine!`);
  document.getElementById("facebook-share").href = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
});
