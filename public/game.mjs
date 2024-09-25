import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io('https://3000-freecodecam-boilerplate-kw588w7gghl.ws-us116.gitpod.io/');
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const headerStartX = 0;
const headerStartY = 0;
const headerHeight = 50;
const canvasStartX = 0;
const canvasStartY = headerHeight + 1;
const canvasWidth = 640; 
const canvasHeight = 480;
const speed = 5;
const framesPerSecond = 50;

const playerSize = 30;

let currentPlayer;
let currentCollectible;
const players = [];

addKeyEvents();

socket.on('currentPlayer', handleCurrentPlayer);
socket.on('drawGame', handleDrawGame);
socket.on('updatePlayer', handleUpdatePlayer);
socket.on('deletePlayer', handleDeletePlayer);
socket.on('updateCollectible', handleUpdateCollectible);
socket.on('scored', handleScored);

socket.emit('playerJoined', playerSize, headerHeight + 1, canvasWidth, canvasHeight, canvasStartX);

function handleCurrentPlayer(player) {
    currentPlayer = new Player(player);
}

function handleDrawGame(state) {
    for (let player of state.players) {
        handleUpdatePlayer(player);
    }
    currentCollectible = new Collectible(state.activeCollectible);
    handleUpdateCollectible(state.activeCollectible);
}

function handleUpdatePlayer(newPlayer, oldPlayer) {
    const existingPlayerIndex = players.findIndex(p => p.id === newPlayer.id);
    let existingPlayer;
    if (existingPlayerIndex >= 0) {
        existingPlayer = players[existingPlayerIndex];
    }

    if (existingPlayer) {
        players[existingPlayerIndex] = newPlayer;
    } else {
        players.push(newPlayer);
    }

    requestAnimationFrame(() => drawRect(newPlayer, oldPlayer));
}

function handleDeletePlayer(player) {
    requestAnimationFrame(() => deleteItem(player));
}

function handleUpdateCollectible(newCollectible, oldCollectible) {
    currentCollectible = new Collectible(newCollectible);
    requestAnimationFrame(() => drawCircle(currentCollectible, oldCollectible));
}

function handleScored(player) {
    const existingPlayer = players.find(p => p.id === player.id);
    existingPlayer.score = player.score;
    const rank = currentPlayer.calculateRank(players);
    requestAnimationFrame(() => drawHeader(rank, players.length));
}

function drawHeader(rank, numPlayers) {
    
}

function drawRect(newItem, oldItem) {
    deleteItem(oldItem);
    context.fillStyle = newItem.color;
    context.fillRect(newItem.x, newItem.y, newItem.size, newItem.size);
}

function deleteItem(item) {
    if (item) {
        // if player, delete it from the list of players
        // FIXME if we work with the players array index here it will be faster
        const playerIndex = players.findIndex(p => p.id === item.id);
        if (playerIndex >= 0) players.splice(playerIndex, 1);
        context.clearRect(item.x, item.y, item.size, item.size);
    }
}

function drawCircle(newItem, oldItem) {
    deleteItem(oldItem);
    context.fillStyle = newItem.color;

    // Begin a new path to draw the circle
    context.beginPath();
    context.arc(newItem.circleX, newItem.circleY, newItem.radius, newItem.startAngle, newItem.endAngle);
    context.fill();  // Draw the filled up circle
}

function addKeyEvents() {
    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("keyup", keyupHandler);
}

function keydownHandler(e) {
    // move right
    if ([39, 68].includes(e.keyCode)) {
        moveRightInterval();
    } else if ([37, 65].includes(e.keyCode)) {
        moveLeftInterval();
    } else if ([40, 83].includes(e.keyCode)) {
        moveDownInterval();
    } else if ([38, 87].includes(e.keyCode)) {
        moveUpInterval();
    }
}

function keyupHandler(e) {
    if ([39, 68].includes(e.keyCode)) {
        stopMovingRight();
    } else if ([37, 65].includes(e.keyCode)) {
        stopMovingLeft();
    } else if ([40, 83].includes(e.keyCode)) {
        stopMovingDown();
    } else if ([38, 87].includes(e.keyCode)) {
        stopMovingUp();
    }
}

let moveRightIntervalId;
function moveRightInterval() {
    if (!moveRightIntervalId) {
        moveRight();
        moveRightIntervalId = setInterval(moveRight, 1000 / framesPerSecond);
    }
}

function moveRight() {
    if (currentPlayer.x + currentPlayer.size + speed <= canvasWidth) {
        movePlayer("right", speed);
    } else {
        stopMovingRight();
    }
};

function stopMovingRight() {
    clearInterval(moveRightIntervalId);
    moveRightIntervalId = null;
}

let moveLeftIntervalId;
function moveLeftInterval() {
    if (!moveLeftIntervalId) {
        moveLeft();
        moveLeftIntervalId = setInterval(moveLeft, 1000 / framesPerSecond);
    }
}

function moveLeft() {
    if (currentPlayer.x - speed >= canvasStartX) {
        movePlayer("left", speed);
    } else {
        stopMovingLeft();
    }
};

function stopMovingLeft() {
    clearInterval(moveLeftIntervalId);
    moveLeftIntervalId = null;
}

let moveUpIntervalId;
function moveUpInterval() {
    if (!moveUpIntervalId) {
        moveUp();
        moveUpIntervalId = setInterval(moveUp, 1000 / framesPerSecond);
    }
}

function moveUp() {
    if (currentPlayer.y - speed >= headerHeight + 1) {
        movePlayer("up", speed);
    } else {
        stopMovingUp();
    }
};

function stopMovingUp() {
    clearInterval(moveUpIntervalId);
    moveUpIntervalId = null;
}

let moveDownIntervalId;
function moveDownInterval() {
    if (!moveDownIntervalId) {
        moveDown();
        moveDownIntervalId = setInterval(moveDown, 1000 / framesPerSecond);
    }
}

function moveDown() {
    if (currentPlayer.y + currentPlayer.size + speed <= canvasHeight) {
        movePlayer("down", speed);
    } else {
        stopMovingDown();
    }
};

function stopMovingDown() {
    clearInterval(moveDownIntervalId);
    moveDownIntervalId = null;
}

function movePlayer(dir, speed) {
    currentPlayer.movePlayer(dir, speed);
    socket.emit('playerMoved', currentPlayer);
    if (currentPlayer.collision(currentCollectible)) {
        currentPlayer.score += currentCollectible.value;
        socket.emit('scored', currentPlayer.score, headerHeight + 1, canvasWidth, canvasHeight, canvasStartX);
    }
}

