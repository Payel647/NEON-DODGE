const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// DOM ELEMENTS

const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const levelElement = document.getElementById("level");
const bestElement = document.getElementById("best");

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScoreElement = document.getElementById("finalScore");
const resultMessage = document.getElementById("resultMessage");

// GAME VARIABLES

let width = 0;
let height = 0;

let animationId = null;

let score = 0;
let gameTime = 0;
let level = 1;

let gameRunning = false;

let obstacleTimer = 0;
let powerTimer = 0;


// Objects

let obstacles = [];
let powerUps = [];


// Keyboard

const keys = {};

const pointerInput = {
    active: false,
    x: 0,
    y: 0
};

// AUDIO

let audioContext = null;

let soundTimer = 0;


// Create audio context

function initAudio() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
}


// Gameplay beep

function playBeep() {

    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type = "square";

    oscillator.frequency.setValueAtTime(
        650,
        audioContext.currentTime
    );


    gain.gain.setValueAtTime(
        0.04,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.08
    );


    oscillator.connect(gain);

    gain.connect(audioContext.destination);


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.08
    );
}


// Collision boom

function playBoom() {

    if (!audioContext) return;

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type = "sawtooth";


    oscillator.frequency.setValueAtTime(
        120,
        audioContext.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        35,
        audioContext.currentTime + 0.45
    );


    gain.gain.setValueAtTime(
        0.25,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.45
    );


    oscillator.connect(gain);

    gain.connect(audioContext.destination);


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.45
    );
}

// PLAYER
const player = {

    x: 0,

    y: 0,

    radius: 13,

    speed: 280
};

// RESIZE CANVAS
function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;


    canvas.width = width;
    canvas.height = height;


    player.x = width / 2;
    player.y = height - 70;
}


window.addEventListener(
    "resize",
    resizeCanvas
);

// KEYBOARD

window.addEventListener(
    "keydown",
    (event) => {

        keys[event.key.toLowerCase()] = true;

    }
);


window.addEventListener(
    "keyup",
    (event) => {

        keys[event.key.toLowerCase()] = false;

    }
);

function updatePointerPosition(event) {

    const rect =
        canvas.getBoundingClientRect();

    const xRatio =
        canvas.width / rect.width;

    const yRatio =
        canvas.height / rect.height;

    pointerInput.x =
        (event.clientX - rect.left) * xRatio;

    pointerInput.y =
        (event.clientY - rect.top) * yRatio;
}

canvas.addEventListener(
    "pointerdown",
    (event) => {

        pointerInput.active = true;

        updatePointerPosition(event);

        canvas.setPointerCapture?.(event.pointerId);
    }
);

canvas.addEventListener(
    "pointermove",
    (event) => {

        if (!pointerInput.active) {
            return;
        }

        updatePointerPosition(event);
    }
);

window.addEventListener(
    "pointerup",
    () => {

        pointerInput.active = false;
    }
);

window.addEventListener(
    "pointercancel",
    () => {

        pointerInput.active = false;
    }
);

// START GAME

function startGame() {

    // Start audio because this
    // function is triggered by button click

    initAudio();


    score = 0;

    gameTime = 0;

    level = 1;

    obstacleTimer = 0;

    powerTimer = 0;

    soundTimer = 0.5;

    pointerInput.active = false;

    obstacles = [];

    powerUps = [];


    player.x = width / 2;

    player.y = height - 70;


    gameRunning = true;


    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");


    updateUI();


    let lastTime =
        performance.now();


    function gameLoop(currentTime) {

        if (!gameRunning) {
            return;
        }


        const deltaTime =
            Math.min(
                (currentTime - lastTime) / 1000,
                0.05
            );


        lastTime = currentTime;


        update(deltaTime);

        draw();


        animationId =
            requestAnimationFrame(gameLoop);
    }


    animationId =
        requestAnimationFrame(gameLoop);
}


// UPDATE GAME

function update(deltaTime) {

    gameTime += deltaTime;


    // Level increases every 10 seconds

    level =
        Math.floor(gameTime / 10) + 1;


    // Score continuously increases

    score +=
        deltaTime * (10 + level * 2);

    // GAMEPLAY SOUND

    soundTimer -= deltaTime;


    if (soundTimer <= 0) {

        playBeep();

        soundTimer = 0.65;
    }


    movePlayer();
    // CREATE OBSTACLES

    obstacleTimer -= deltaTime;


    const obstacleInterval =
        Math.max(
            0.25,
            0.8 - level * 0.05
        );


    if (obstacleTimer <= 0) {

        createObstacle();

        obstacleTimer =
            obstacleInterval;
    }

    // CREATE ENERGY

    powerTimer -= deltaTime;


    if (powerTimer <= 0) {

        createPowerUp();

        powerTimer =
            2.5 + Math.random() * 2;
    }


    updateObstacles(deltaTime);

    updatePowerUps(deltaTime);


    checkCollisions();


    updateUI();
}

// MOVE PLAYER

function movePlayer() {

    if (pointerInput.active) {

        const dx =
            pointerInput.x - player.x;

        const dy =
            pointerInput.y - player.y;

        const distance =
            Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {

            const moveDistance =
                Math.min(
                    distance,
                    player.speed * 0.016
                );

            player.x +=
                (dx / distance) * moveDistance;

            player.y +=
                (dy / distance) * moveDistance;
        }
    }
    else {

        let dx = 0;
        let dy = 0;


        if (
            keys["arrowleft"] ||
            keys["a"]
        ) {
            dx -= 1;
        }


        if (
            keys["arrowright"] ||
            keys["d"]
        ) {
            dx += 1;
        }


        if (
            keys["arrowup"] ||
            keys["w"]
        ) {
            dy -= 1;
        }


        if (
            keys["arrowdown"] ||
            keys["s"]
        ) {
            dy += 1;
        }


        // Normalize diagonal movement

        if (dx !== 0 || dy !== 0) {

            const length =
                Math.sqrt(dx * dx + dy * dy);

            dx /= length;
            dy /= length;
        }


        player.x +=
            dx * player.speed * 0.016;

        player.y +=
            dy * player.speed * 0.016;
    }


    // Keep player inside canvas

    player.x =
        Math.max(
            player.radius,
            Math.min(
                width - player.radius,
                player.x
            )
        );


    player.y =
        Math.max(
            player.radius,
            Math.min(
                height - player.radius,
                player.y
            )
        );
}

// CREATE OBSTACLE

function createObstacle() {

    const radius =
        10 + Math.random() * 12;


    obstacles.push({

        x:
            radius +
            Math.random() *
            (width - radius * 2),

        y:
            -radius,

        radius: radius,

        speed:
            120 +
            Math.random() * 80 +
            level * 12
    });
}

// CREATE ENERGY

function createPowerUp() {

    const radius = 11;


    powerUps.push({

        x:
            radius +
            Math.random() *
            (width - radius * 2),

        y:
            -radius,

        radius: radius,

        speed:
            100 +
            Math.random() * 40
    });
}

// UPDATE OBSTACLES

function updateObstacles(deltaTime) {

    obstacles.forEach(
        obstacle => {

            obstacle.y +=
                obstacle.speed *
                deltaTime;

        }
    );


    obstacles =
        obstacles.filter(
            obstacle =>
                obstacle.y <
                height + obstacle.radius
        );
}

// UPDATE ENERGY

function updatePowerUps(deltaTime) {

    powerUps.forEach(
        power => {

            power.y +=
                power.speed *
                deltaTime;

        }
    );


    powerUps =
        powerUps.filter(
            power =>
                power.y <
                height + power.radius
        );
}

// COLLISION CHECK

function isColliding(
    object1,
    object2
) {

    const dx =
        object1.x - object2.x;

    const dy =
        object1.y - object2.y;


    const distance =
        Math.sqrt(
            dx * dx + dy * dy
        );


    return (
        distance <
        object1.radius +
        object2.radius
    );
}

// CHECK COLLISIONS

function checkCollisions() {

    // OBSTACLES

    for (const obstacle of obstacles) {

        if (
            isColliding(
                player,
                obstacle
            )
        ) {

            endGame();

            return;
        }
    }


    // ENERGY

    for (
        let i = powerUps.length - 1;
        i >= 0;
        i--
    ) {

        if (
            isColliding(
                player,
                powerUps[i]
            )
        ) {

            score += 100;

            powerUps.splice(i, 1);
        }
    }
}

// END GAME

function endGame() {

    gameRunning = false;


    if (animationId) {

        cancelAnimationFrame(
            animationId
        );
    }


    // Collision sound

    playBoom();


    const finalScore =
        Math.floor(score);


    finalScoreElement.textContent =
        finalScore;


    // BEST SCORE

    const currentBest =
        Number(
            localStorage.getItem(
                "neonDodgeBest"
            )
        ) || 0;


    if (finalScore > currentBest) {

        localStorage.setItem(
            "neonDodgeBest",
            finalScore
        );

        resultMessage.textContent =
            "New high score!";
    }
    else {

        resultMessage.textContent =
            "You survived " +
            formatTime(gameTime) +
            ".";
    }


    updateBestScore();


    gameOverScreen.classList.remove(
        "hidden"
    );
}

// UPDATE UI

function updateUI() {

    scoreElement.textContent =
        Math.floor(score);


    timeElement.textContent =
        formatTime(gameTime);


    levelElement.textContent =
        level;
}

// FORMAT TIME

function formatTime(seconds) {

    return seconds.toFixed(1) + "s";
}

// BEST SCORE

function updateBestScore() {

    const best =
        Number(
            localStorage.getItem(
                "neonDodgeBest"
            )
        ) || 0;


    bestElement.textContent =
        best;
}

// DRAW GAME

function draw() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawBackground();

    drawGrid();

    drawPowerUps();

    drawObstacles();

    drawPlayer();
}

// BACKGROUND

function drawBackground() {

    ctx.fillStyle =
        "#080a0f";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );
}

// GRID

function drawGrid() {

    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";


    ctx.lineWidth = 1;


    const gridSize = 40;


    for (
        let x = 0;
        x <= width;
        x += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(x, height);

        ctx.stroke();
    }


    for (
        let y = 0;
        y <= height;
        y += gridSize
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(width, y);

        ctx.stroke();
    }
}

// DRAW PLAYER

function drawPlayer() {

    // Glow

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius + 8,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "rgba(34,197,94,0.12)";


    ctx.fill();


    // Green outer circle

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#22c55e";


    ctx.fill();


    // White center

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        5,
        0,
        Math.PI * 2
    );


    ctx.fillStyle =
        "#ffffff";


    ctx.fill();
}

// DRAW OBSTACLES

function drawObstacles() {

    obstacles.forEach(
        obstacle => {

            // Glow

            ctx.beginPath();

            ctx.arc(
                obstacle.x,
                obstacle.y,
                obstacle.radius + 6,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "rgba(239,68,68,0.12)";


            ctx.fill();


            // RED obstacle

            ctx.beginPath();

            ctx.arc(
                obstacle.x,
                obstacle.y,
                obstacle.radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#ef4444";


            ctx.fill();


            // Highlight

            ctx.beginPath();

            ctx.arc(
                obstacle.x - 3,
                obstacle.y - 3,
                obstacle.radius * 0.25,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#ff8a8a";


            ctx.fill();
        }
    );
}

// DRAW ENERGY

function drawPowerUps() {

    powerUps.forEach(
        power => {

            // Outer glow

            ctx.beginPath();

            ctx.arc(
                power.x,
                power.y,
                power.radius + 7,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "rgba(249,115,22,0.12)";


            ctx.fill();


            // ORANGE energy

            ctx.beginPath();

            ctx.arc(
                power.x,
                power.y,
                power.radius,
                0,
                Math.PI * 2
            );


            ctx.fillStyle =
                "#f97316";


            ctx.fill();


            // Plus sign

            ctx.strokeStyle =
                "#ffffff";


            ctx.lineWidth = 2;


            ctx.beginPath();

            ctx.moveTo(
                power.x - 5,
                power.y
            );

            ctx.lineTo(
                power.x + 5,
                power.y
            );

            ctx.stroke();


            ctx.beginPath();

            ctx.moveTo(
                power.x,
                power.y - 5
            );

            ctx.lineTo(
                power.x,
                power.y + 5
            );

            ctx.stroke();
        }
    );
}

// BUTTON EVENTS

startBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    startGame
);

// INITIAL SETUP

resizeCanvas();

updateBestScore();

updateUI();

draw();