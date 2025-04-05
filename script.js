// Game elements
const canvas = document.getElementById('curve');
const ctx = canvas.getContext('2d');
const currentMultiplier = document.getElementById('current-multiplier');
const startBtn = document.getElementById('start-btn');
const cashoutBtn = document.getElementById('cashout-btn');
const betInput = document.getElementById('bet-amount');
const balanceElement = document.getElementById('balance');
const lastCrashElement = document.getElementById('last-crash');
const profitLossElement = document.getElementById('profit-loss');

// Game variables
let gameRunning = false;
let multiplier = 1;
let balance = 1000;
let currentBet = 0;
let animationId;
let startTime;
let crashPoint;

// Canvas setup
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Generate random crash point (between 1 and 10)
function generateCrashPoint() {
    // Using a modified exponential distribution for more realistic crash points
    const rand = Math.random();
    return Math.max(1, Math.min(10, Math.floor(-Math.log(1 - rand) * 2 * 100) / 100));
}

// Draw the curve
function drawCurve() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#2a2a5a';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw curve
    ctx.beginPath();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 3;
    
    const elapsedTime = (Date.now() - startTime) / 1000;
    const points = [];
    
    for (let t = 0; t <= elapsedTime; t += 0.1) {
        const x = t * 100;
        const y = canvas.height - (Math.pow(1.0167, t * 100) - 1) * 2;
        points.push({ x, y });
    }
    
    ctx.moveTo(0, canvas.height);
    points.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    
    ctx.stroke();
}

// Update game state
function updateGame() {
    if (!gameRunning) return;

    const elapsedTime = (Date.now() - startTime) / 1000;
    multiplier = Math.floor(Math.pow(1.0167, elapsedTime * 100) * 100) / 100;
    
    currentMultiplier.textContent = multiplier.toFixed(2);
    drawCurve();

    if (multiplier >= crashPoint) {
        endGame(false);
        return;
    }

    animationId = requestAnimationFrame(updateGame);
}

// Start new game
function startGame() {
    if (gameRunning) return;
    
    currentBet = parseInt(betInput.value);
    if (currentBet > balance) {
        alert('Insufficient balance!');
        return;
    }
    
    balance -= currentBet;
    balanceElement.textContent = balance;
    
    gameRunning = true;
    startBtn.disabled = true;
    cashoutBtn.disabled = false;
    betInput.disabled = true;
    
    crashPoint = generateCrashPoint();
    startTime = Date.now();
    multiplier = 1;
    
    updateGame();
}

// Cash out
function cashOut() {
    if (!gameRunning) return;
    
    const profit = Math.floor(currentBet * multiplier);
    balance += profit;
    balanceElement.textContent = balance;
    
    const totalProfit = profit - currentBet;
    profitLossElement.textContent = totalProfit >= 0 ? `+${totalProfit}` : totalProfit;
    profitLossElement.style.color = totalProfit >= 0 ? '#4CAF50' : '#e94560';
    
    endGame(true);
}

// End game
function endGame(cashedOut) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    startBtn.disabled = false;
    cashoutBtn.disabled = true;
    betInput.disabled = false;
    
    if (!cashedOut) {
        lastCrashElement.textContent = multiplier.toFixed(2) + 'x';
        profitLossElement.textContent = `-${currentBet}`;
        profitLossElement.style.color = '#e94560';
    }
}

// Event listeners
startBtn.addEventListener('click', startGame);
cashoutBtn.addEventListener('click', cashOut);

// Initialize
balanceElement.textContent = balance;
profitLossElement.textContent = '0'; 