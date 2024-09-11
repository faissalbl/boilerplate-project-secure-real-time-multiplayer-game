import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io('https://3000-freecodecam-boilerplate-kw588w7gghl.ws-us116.gitpod.io/');
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

const canvasWidth = 640; 
const canvasHeight = 480;

socket.on('updatePlayers', handleUpdatePlayers);

socket.emit('playerJoined');

function handleUpdatePlayers(players) {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for (let p of players) {
        console.log('p', p);
        const player = new Player({ x: p.x, y: p.y, score: 0, id: p.id, size: p.size, color: p.color });
        requestAnimationFrame(() => drawPlayer(player));
        console.log('player drawn', player);
    }
}

function drawPlayer(player) {
    console.log('drawing player', player);
    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.size, player.size);
}