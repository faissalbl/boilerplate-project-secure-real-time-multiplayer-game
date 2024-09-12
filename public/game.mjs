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

addKeyEvents();

socket.on('currentPlayer', handleCurrentPlayer);
socket.on('updatePlayer', handleUpdatePlayer);
socket.on('deletePlayer', handleDeletePlayer);
socket.on('updateCollectible', handleUpdateCollectible);

socket.emit('playerJoined');

function handleCurrentPlayer(player) {
    currentPlayer = new Player(player);
}

function handleUpdatePlayer(newPlayer, oldPlayer) {
    requestAnimationFrame(() => drawRect(newPlayer, oldPlayer));
}

function handleDeletePlayer(player) {
    console.log('handling update player', player);
    requestAnimationFrame(() => deleteItem(player));
}

function handleUpdateCollectible(newCollectible, oldCollectible) {
    currentCollectible = new Collectible(newCollectible);
    requestAnimationFrame(() => drawCircle(newCollectible, oldCollectible));
}

function drawRect(newItem, oldItem) {
    deleteItem(oldItem);
    context.fillStyle = newItem.color;
    context.fillRect(newItem.x, newItem.y, newItem.size, newItem.size);
}

function deleteItem(item) {
    if (item) {
        context.clearRect(item.x, item.y, item.size, item.size);
    }
}

function drawCircle(newItem, oldItem) {
    deleteItem(oldItem);
    context.fillStyle = newItem.color;

    // Set the starting position and circle properties
    const x = newItem.x / 2;  // X-coordinate of the circle's center
    const y = newItem.y / 2; // Y-coordinate of the circle's center
    const radius = newItem.size / 2;          // Circle's radius
    const startAngle = 0;        // Start angle (0 radians = 0 degrees)
    const endAngle = 2 * Math.PI; // End angle (2π radians = 360 degrees)

    // Begin a new path to draw the circle
    context.beginPath();
    context.arc(x, y, radius, startAngle, endAngle);
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
        currentPlayer.movePlayer("right", speed);
        socket.emit('playerMoved', currentPlayer);
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
        currentPlayer.movePlayer("left", speed);
        socket.emit('playerMoved', currentPlayer);
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
        currentPlayer.movePlayer("up", speed);
        socket.emit('playerMoved', currentPlayer);
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
        currentPlayer.movePlayer("down", speed);
        socket.emit('playerMoved', currentPlayer);
    } else {
        stopMovingDown();
    }
};

function stopMovingDown() {
    clearInterval(moveDownIntervalId);
    moveDownIntervalId = null;
}

