import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const player1 = new Player({ x: 0, y: 0, score: 0, id: 'player1' });

drawPlayer(player1);

function drawPlayer(player) {
    context.fillStyle = "white";
    context.fillRect(player.x, player.y, 20, 20);
}