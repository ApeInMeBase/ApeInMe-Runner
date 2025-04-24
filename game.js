
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let monkeyY = 150, velocity = 0, gravity = 0.6, jump = -12;
let score = 0, running = false, walletConnected = false;
let obstacles = [], highScores = [], playerName = '';
let lastTime = 0, lastObstacleTime = 0;

document.addEventListener('keydown', () => velocity = jump);
canvas.addEventListener('click', () => velocity = jump);

function connectWallet() {
  walletConnected = true;
  alert('Wallet connected! (Simulated)');
}

function startGame() {
  score = 0;
  monkeyY = 150;
  velocity = 0;
  running = true;
  obstacles = [];
  lastObstacleTime = 0;
  playerName = document.getElementById('playerName').value || 'Anon';
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  if (!running) return;
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#87ceeb';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'green';
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

  velocity += gravity;
  monkeyY += velocity;
  if (monkeyY > canvas.height - 100) { monkeyY = canvas.height - 100; velocity = 0; }
  ctx.fillStyle = 'brown';
  ctx.fillRect(50, monkeyY, 30, 30);

  if (timestamp - lastObstacleTime > 1500) {
    obstacles.push({ x: canvas.width, width: 20, height: 50 });
    lastObstacleTime = timestamp;
  }

  obstacles = obstacles.map(obs => {
    obs.x -= 6;
    ctx.fillStyle = 'darkgreen';
    ctx.fillRect(obs.x, canvas.height - obs.height - 50, obs.width, obs.height);
    return obs;
  }).filter(obs => obs.x + obs.width > 0);

  for (let obs of obstacles) {
    if (50 < obs.x + obs.width && 80 > obs.x && monkeyY + 30 > canvas.height - obs.height - 50) {
      running = false;
      highScores.push({ name: playerName, score });
      highScores.sort((a, b) => b.score - a.score);
      updateLeaderboard();
      return;
    }
  }

  score++;
  document.getElementById('score').textContent = 'Score: ' + score;
  requestAnimationFrame(gameLoop);
}

function updateLeaderboard() {
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';
  highScores.slice(0, 10).forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}
