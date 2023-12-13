//dom element

const menus = document.querySelectorAll(".menu"),
    canvas = document.getElementById("gameCanvas"),
    startBtn = document.querySelector(".start-btn"),
    difficultyBtns = document.querySelectorAll(".difficulty-btn"),
    finalScoreElement = document.getElementById("final-score"),
    restartBtns = document.querySelectorAll(".restart-btn"),
    resumeBtn = document.getElementById("resume-btn"),
    iconsWrapper = document.querySelector(".icons");
    musicBtn = document.getElementById("music-btn"),
    pauseBtn = document.getElementById("pause-btn");

const ctx = canvas.getContext("2d");


//generalfunctions*/
function showMenu(menu) {
    hideAllMenus();
    menus[menu].classList.add("active");
}

function hideAllMenus() {
    menus.forEach((menu) => {
        menu.classList.remove("active");
    });
}



//game constants
const GRID_SIZE = 50,
    GRID_COLOR = "#12183a",
    LINE_WIDTH = 5,
    SNAKE_OFFSET = 1,
    SNAKE_EYE_SIZE = 5,
    SNAKE_BODY_COLOR = "#00aaff",
    SNAKE_HEAD_COLOR = "#ff6600",
    SNAKE_EYE_COLOR = "#ffffff",
    FOOD_COLORS = ["#ff0000", "#00ff00", "#0000ff"],
    BORDER_RADIUS = GRID_SIZE / 3,
    SCORE_PER_FOOD = 10,
    BIG_FOOD_COUNT = 6,
    INITIAL_SNAKE_SPEED = 6;

//GAME STATE
let score,
    direction,
    food,
    snake,
    numberOfColumns,
    numberOfRows,
    updateInterval,
    timeInterval,
    turned,
    snakeSpeed,
    mode = "hard",
    timePlayed = 0,
    gameRunning = false,
    musicMuted = false,
    foodSpawnedTimes = 0;


//game audio
const audioSources = {
    dead: "audio/dead.mp3",
    dead2: "audio/dead2.mp3",
    eat: "audio/eat.mp3",
    up: "audio/up.mp3",
    right: "audio/right.mp3",
    left: "audio/left.mp3",
    down: "audio/down.mp3",
    bg: "audio/bg.mp3"
};

const audioElements = {};
//initialize audio element
for (const key in audioSources) {
    if (Object.hasOwnProperty.call(audioSources, key)) {
        const element = audioSources[key];
        audioElements[key] = new Audio(element);
    }
}

audioElements.bg.loop = true;
audioElements.bg.volume = 0.2;
//initialize Gamepad
function initGame() {
    showMenu(0);
    ctx.lineWidth = LINE_WIDTH;
    numberOfColumns = Math.floor(window.innerWidth / GRID_SIZE);
    numberOfRows = Math.floor(window.innerHeight / GRID_SIZE);
    canvas.width = numberOfColumns * GRID_SIZE;
    canvas.height = numberOfRows * GRID_SIZE;

    //initial snake posaition and size
    //the length of snake array is length of snake with each points location

    snake = [
        { x: 2, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 0 },
    ];

    //initial direction
    direction = "right";
    score = 0;
    timePlayed = 0;
    //WE WILL CREATE A FUNCTION TO GENRATE FOOD
    food = generateFood();
    foodSpawnedTimes = 0;
    snakeSpeed = INITIAL_SNAKE_SPEED;
    drawGrid();
}

function generateFood() {
    let newFood;
    //create new food and check if it overlaps snake create new until it doesnt
    do {
        newFood = {
            x: Math.floor(Math.random() * numberOfColumns),
            y: Math.floor(Math.random() * numberOfRows),
            color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)]

        }
    } while (isFoodOverlapsSnake(newFood));
    return newFood;
}

function drawGrid() {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    for (let x = 0; x < canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        //get snake position on canvas
        const x = snake[i].x * GRID_SIZE + LINE_WIDTH + SNAKE_OFFSET;
        const y = snake[i].y * GRID_SIZE + LINE_WIDTH + SNAKE_OFFSET;
        const size = GRID_SIZE - 2 * LINE_WIDTH - 2 * SNAKE_OFFSET;

        if (i === 0) {
            //if i=0 its head
            drawSquare(SNAKE_HEAD_COLOR, x, y, size, LINE_WIDTH, BORDER_RADIUS);
            //draw eyes also in head
            drawEyes(x, y, size);
        } else {
            //else body
            drawSquare(SNAKE_BODY_COLOR, x, y, size, LINE_WIDTH, BORDER_RADIUS);
        }


    }

}

function drawEyes(x, y, size) {
    ctx.fillStyle = SNAKE_EYE_COLOR;

    //eye fill
    ctx.beginPath();
    ctx.arc(x + size / 4, y + size / 4, SNAKE_EYE_SIZE, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + (3 * size) / 4, y + size / 4, SNAKE_EYE_SIZE, 0, 2 * Math.PI);
    ctx.fill();

    //eye glow
    ctx.fillStyle = SNAKE_HEAD_COLOR;
    ctx.beginPath();
    ctx.arc(x + size / 4, y + size / 4, SNAKE_EYE_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + (3 * size) / 4, y + size / 4, SNAKE_EYE_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
}

function drawFood() {
    const x = food.x * GRID_SIZE + LINE_WIDTH + SNAKE_OFFSET;
    const y = food.y * GRID_SIZE + LINE_WIDTH + SNAKE_OFFSET;
    const size = GRID_SIZE - 2 * LINE_WIDTH - 2 * SNAKE_OFFSET;
    drawSquare(food.color, x, y, size, LINE_WIDTH, BORDER_RADIUS);
}

function drawSquare(color, x, y, size, LINE_WIDTH, BORDER_RADIUS) {
    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;

    //draw lines
    ctx.beginPath();
    ctx.moveTo(x + BORDER_RADIUS, y);
    ctx.lineTo(x + size - BORDER_RADIUS, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + BORDER_RADIUS);
    ctx.lineTo(x + size, y + size - BORDER_RADIUS);
    ctx.quadraticCurveTo(x + size, y + size, x + size - BORDER_RADIUS, y + size);
    ctx.lineTo(x + BORDER_RADIUS, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - BORDER_RADIUS);
    ctx.lineTo(x, y + BORDER_RADIUS);
    ctx.quadraticCurveTo(x, y, x + BORDER_RADIUS, y);
    ctx.closePath();
    ctx.stroke();

    //draw white center from exploration effect
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ffffff";

    //draw lines
    ctx.beginPath();
    ctx.moveTo(x + BORDER_RADIUS, y);
    ctx.lineTo(x + size - BORDER_RADIUS, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + BORDER_RADIUS);
    ctx.lineTo(x + size, y + size - BORDER_RADIUS);
    ctx.quadraticCurveTo(x + size, y + size, x + size - BORDER_RADIUS, y + size);
    ctx.lineTo(x + BORDER_RADIUS, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - BORDER_RADIUS);
    ctx.lineTo(x, y + BORDER_RADIUS);
    ctx.quadraticCurveTo(x, y, x + BORDER_RADIUS, y);
    ctx.closePath();
    ctx.stroke();

    //remove the ctx style
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

}
//initGame();
function drawScore() {
    const time = Math.floor(timePlayed / 60) + ":" + (timePlayed % 60 < 10 ? "0" + (timePlayed % 60) : timePlayed % 60);
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Varela Round"
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Difficulty: ${mode[0].toUpperCase() + mode.slice(1)}`, 10, 60);
    ctx.fillText(`Time: ${time}`, 10, 90);
}

//function to update thew canvas related to game speed##
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //remove last part of snake
    snake.pop();

    //update snake position based on direction
    const headX = snake[0].x;
    const headY = snake[0].y;

    if (direction === "right") {
        //update popsition
        snake.unshift({ x: headX + 1, y: headY });
    } else if (direction === 'left') {
        snake.unshift({ x: headX - 1, y: headY });
    } else if (direction === 'up') {
        snake.unshift({ x: headX, y: headY - 1 });
    } else if (direction === 'down') {
        snake.unshift({ x: headX, y: headY + 1 });
    }

    //check snake colliding with wall and itself and game over based on difficulty
    if (mode === "hard") {
        if (isSnakeCollidingWithWall() || isSnakeCollidingWithItself()) {
            //in hard mode game will be over on either colliding with itself or wallbody
            stop()

        }
    }
    else if (mode === "medium") {
        if (isSnakeCollidingWithItself()) {
            //in medium mode game will be over on either colliding with itself or wallbody
            stop();
        }
    }

    //if mode is easy or medium pass snake to other side when collide with wall
    snake[0].x = (snake[0].x + numberOfColumns) % numberOfColumns;
    snake[0].y = (snake[0].y + numberOfRows) % numberOfRows;

    drawGrid();
    drawFood();
    drawSnake();
    foodEaten();
    drawScore();
}
function updateFoodPosition() {
    food = generateFood();
}

function isSnakeCollidingWithItself() {
    for (let i = 1; i < snake.length; i++) {
        if (isOverlap(snake[0], snake[i])) {
            //if snake head overlaps any body segment return true
            return true;
        }
    }
    return false;
}

function isSnakeCollidingWithWall() {
    const headX = snake[0].x;
    const headY = snake[0].y;
    if (
        headX < 0 ||
        headX >= numberOfColumns ||
        headY < 0 ||
        headY >= numberOfRows) {
        return true;
    }
    return false;
}

function isFoodOverlapsSnake(food) {
    return snake.some((segment) => isOverlap(segment, food));

}

function isOverlap(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
}
//xheck if food is eaten
function foodEaten() {
    if (isFoodOverlapsSnake(food)) {
        updateFoodPosition();
        audioElements.eat.play();
        foodSpawnedTimes++;
        //if food is spawed 6 times then increase the speed
        if (foodSpawnedTimes % BIG_FOOD_COUNT === 0) {
            foodSpawnedTimes = 0;
            //GIVE EXTRA SCPRE AFTER every 6 food
            score += SCORE_PER_FOOD * BIG_FOOD_COUNT;
            changeSpeed(snakeSpeed + 1);
        } else {
            score += SCORE_PER_FOOD;
        }

        //increase snake length
        snake.push({
            x: snake[snake.length - 1].x,
            y: snake[snake.length - 1].y,
        });
    }
}
function changeMode(newMode) {
    mode = newMode;
}
function resetAudio(audioToReset) {
    audioToReset.pause();
    audioToReset.currentTime = 0;
}

function changeSpeed(newSpeed) {
    snakeSpeed = newSpeed;
    clearInterval(updateInterval);
    updateInterval = setInterval(update, 1000 / snakeSpeed);
}

function startGame() {
    if (!musicMuted) {
        audioElements.bg.play();
    }
    gameRunning = true;
    updateInterval = setInterval(update, 1000 / snakeSpeed);
    //time interval to caqlculate played time
    timeInterval = setInterval(() => {
        timePlayed++;
    }, 1000);
    iconsWrapper.classList.add("active");
}

function stop() {
    clearInterval(updateInterval);
    clearInterval(timeInterval);
    gameRunning = false;
    resetAudio(audioElements.bg);
    audioElements.dead.play();
    audioElements.dead2.play();
    showMenu(2);
    finalScoreElement.innerHTML = score;
    iconsWrapper.classList.remove("active");
}

function pauseGame() {
    clearInterval(updateInterval);
    clearInterval(timeInterval);
    gameRunning = false;
    audioElements.bg.pause();
    showMenu(3);
    iconsWrapper.classList.remove("active");
}
function resumeGame() {
    startGame();
    hideAllMenus();
}
startBtn.addEventListener("click", () => {
    showMenu(1);
});
difficultyBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        changeMode(btn.id);
        hideAllMenus();
        startGame();
    });
});

restartBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        initGame();
        resetAudio(audioElements.dead2);
    });
});

resumeBtn.addEventListener("click", resumeGame);

pauseBtn.addEventListener("click", pauseGame);

musicBtn.addEventListener("click", ()=>{
    if(musicMuted){
        musicMuted=false;
        audioElements.bg.play();
        musicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }else{
        musicMuted=true;
        audioElements.bg.pause();
        musicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
});

function handleArrowKeyPress(event) {
    switch (event.key) {
        case "ArrowRight":
            if (direction !== "left") {
                direction = "right";
            }
            break;
        case "ArrowLeft":
            if (direction !== "right") {
                direction = "left";
            }
            break;
        case "ArrowUp":
            if (direction !== "down") {
                direction = "up";
            }
            break;
        case "ArrowDown":
            if (direction !== "up") {
                direction = "down";
            }
            break;
    }
}

//event listener for arrow keys
document.addEventListener("keydown", handleArrowKeyPress);

//pause game on window or tab change
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && gameRunning) {
        pauseGame();
    }
})
initGame();

