import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io('https://3000-freecodecam-boilerplate-kw588w7gghl.ws-us116.gitpod.io/');
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const canvasWidth = 640; 
const canvasHeight = 480;
const speed = 5;
const framesPerSecond = 50;

let currentPlayer;
let currentCollectible;
const players = [];

addKeyEvents();

socket.on('currentPlayer', handleCurrentPlayer);
socket.on('drawGame', handleDrawGame);
socket.on('updatePlayer', handleUpdatePlayer);
socket.on('deletePlayer', handleDeletePlayer);
socket.on('updateCollectible', handleUpdateCollectible);

socket.emit('playerJoined');

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
    if (currentPlayer.x - speed >= 0) {
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
    if (currentPlayer.y - speed >= 0) {
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
        // TODO rank
        socket.emit('scored', currentPlayer.score);
    }
}

