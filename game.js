const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let monkeyY = 150, velocity = 0, gravity = 0.6, jump = -12;
let score = 0, running = false, playerName = '';
let snakes = [], bananas = [], highScores = [];
let lastTime = 0, lastSnakeTime = 0, lastBananaTime = 0;

// Base64 Image Data for Monkey (pixelated)
const monkeyImg = new Image();
monkeyImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARc...'; // (truncated for brevity)

// Base64 Image Data for Banana (pixelated)
const bananaImg = new Image();
bananaImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ0...'; // (truncated for brevity)

// Base64 Image Data for Jungle Background
const backgroundImg = new Image();
backgroundImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARc...'; // (truncated for brevity)


// Event listeners for jumping
document.addEventListener('keydown', () => velocity = jump);
canvas.addEventListener('click', () => velocity = jump);

function startGame() {
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
  
  // Draw background
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'green'; // Ground color
  ctx.fillRect(0, canvas.height - 50, canvas.width, 50);

  // Apply gravity and movement for the monkey
  velocity += gravity;
  monkeyY += velocity;
  if (monkeyY > canvas.height - 100) { monkeyY = canvas.height - 100; velocity = 0; }

  // Draw pixel monkey
  ctx.drawImage(monkeyImg, 50, monkeyY, 30, 30); // Use the pixel monkey image

  // Create snakes (obstacles)
  if (timestamp - lastSnakeTime > 1500) {
    snakes.push({ x: canvas.width, width: 20, height: 30 });
    lastSnakeTime = timestamp;
  }

  // Create bananas
  if (timestamp - lastBananaTime > 2000) {
    bananas.push({ x: canvas.width, y: Math.random() * (canvas.height - 100), width: 20, height: 20 });
    lastBananaTime = timestamp;
  }

  // Move snakes and check for collisions
  snakes = snakes.map(snake => {
    snake.x -= 6;
    ctx.fillStyle = 'darkgreen'; // Snake color
    ctx.fillRect(snake.x, canvas.height - snake.height - 50, snake.width, snake.height);
    return snake;
  }).filter(snake => snake.x + snake.width > 0);

  // Move bananas and check for collisions
  bananas = bananas.map(banana => {
    banana.x -= 4;
    ctx.drawImage(bananaImg, banana.x, banana.y, banana.width, banana.height);
    return banana;
  }).filter(banana => banana.x + banana.width > 0);

  // Check for collisions with snakes
  for (let snake of snakes) {
    if (50 < snake.x + snake.width && 80 > snake.x && monkeyY + 30 > canvas.height - snake.height - 50) {
      running = false;
      highScores.push({ name: playerName, score });
      highScores = [...new Set(highScores.map(a => a.name))].map(name => highScores.find(a => a.name === name)); // Only record player once
      highScores.sort((a, b) => b.score - a.score);
      updateLeaderboard();
      return;
    }
  }

  // Check for collecting bananas
  for (let i = 0; i < bananas.length; i++) {
    let banana = bananas[i];
    if (50 < banana.x + banana.width && 80 > banana.x && monkeyY < banana.y + banana.height && monkeyY + 30 > banana.y) {
      bananas.splice(i, 1);  // Remove banana from array
      score += 5;  // Add score for collecting a banana
      break;
    }
  }

  // Increment score and update display
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
