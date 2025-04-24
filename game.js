const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let monkeyY = 150, velocity = 0, gravity = 0.6, jump = -12;
let score = 0, running = false, playerName = '';
let snakes = [], bananas = [], highScores = [];
let lastTime = 0, lastSnakeTime = 0, lastBananaTime = 0;

// Load images from local files
const monkeyImg = new Image();
monkeyImg.src = 'images/monkey.png';

const bananaImg = new Image();
bananaImg.src = 'images/banana.png';

const backgroundImg = new Image();
backgroundImg.src = 'images/jungle.png';

document.addEventListener('keydown', () => velocity = jump);
canvas.addEventListener('click', () => velocity = jump);

function startGame() {
  checkResetScores();
  score = 0;
  monkeyY = 150;
  velocity = 0;
  running = true;
  snakes = [];
  bananas = [];
  lastSnakeTime = 0;
  lastBananaTime = 0;
  playerName = document.getElementById('playerName').value || 'Anon';
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!running) return;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'green';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

  velocity += gravity;
  monkeyY += velocity;
  if (monkeyY > canvas.height - 100) { monkeyY = canvas.height - 100; velocity = 0; }

  ctx.drawImage(monkeyImg, 50, monkeyY, 30, 30);

  if (timestamp - lastSnakeTime > 1500) {
    snakes.push({ x: canvas.width, width: 20, height: 30 });
    lastSnakeTime = timestamp;
  }

  if (timestamp - lastBananaTime > 2000) {
    bananas.push({ x: canvas.width, y: Math.random() * (canvas.height - 100), width: 20, height: 20 });
    lastBananaTime = timestamp;
  }

  snakes = snakes.map(snake => {
    snake.x -= 6;
    ctx.fillStyle = 'darkgreen';
    ctx.fillRect(snake.x, canvas.height - snake.height - 50, snake.width, snake.height);
    return snake;
  }).filter(snake => snake.x + snake.width > 0);

  bananas = bananas.map(banana => {
    banana.x -= 4;
    ctx.drawImage(bananaImg, banana.x, banana.y, banana.width, banana.height);
    return banana;
  }).filter(banana => banana.x + banana.width > 0);

  for (let snake of snakes) {
    if (50 < snake.x + snake.width && 80 > snake.x && monkeyY + 30 > canvas.height - snake.height - 50) {
      running = false;
      saveScore();
      updateLeaderboard();
      return;
    }
  }

  for (let i = 0; i < bananas.length; i++) {
    let banana = bananas[i];
    if (50 < banana.x + banana.width && 80 > banana.x && monkeyY < banana.y + banana.height && monkeyY + 30 > banana.y) {
      bananas.splice(i, 1);
      score += 5;
      break;
    }
  }

  score++;
  document.getElementById('score').textContent = 'Score: ' + score;
  requestAnimationFrame(gameLoop);
}

function saveScore() {
  let saved = JSON.parse(localStorage.getItem('highScores')) || [];
  let existing = saved.find(e => e.name === playerName);
  if (!existing || score > existing.score) {
    saved = saved.filter(e => e.name !== playerName);
    saved.push({ name: playerName, score });
  }
  localStorage.setItem('highScores', JSON.stringify(saved));
  localStorage.setItem('lastReset', Date.now().toString());
}

function updateLeaderboard() {
  let saved = JSON.parse(localStorage.getItem('highScores')) || [];
  saved.sort((a, b) => b.score - a.score);
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  saved.slice(0, 10).forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

function checkResetScores() {
  const lastReset = parseInt(localStorage.getItem('lastReset'), 10) || 0;
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  if (now - lastReset > oneDay) {
    localStorage.removeItem('highScores');
    localStorage.setItem('lastReset', now.toString());
  }
  updateLeaderboard();
}

window.onload = () => {
  checkResetScores();
};
