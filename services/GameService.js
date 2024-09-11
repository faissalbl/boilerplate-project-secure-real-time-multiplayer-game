const state = require('./StateService');

class GameService {
    constructor(socket) {
        this.socket = socket;

        this.socket.on('playerJoined', this.handlePlayerJoined.bind(this));
        this.socket.on('holdRightKey', this.handleHoldRightKey.bind(this));
        this.socket.on('releaseRightKey', this.handleReleaseRightKey.bind(this));
        this.playerColors = ['blue', 'red', 'green'];
        this.playerSize = 30;
    }

    handlePlayerJoined() {
        const color = this.playerColors[state.players.length];
        state.players.push({ x: 0, y: 0, size: this.playerSize, color, id: `player${state.players.length + 1}` });
        this.socket.emit('updatePlayers', state.players);
    }

    handleHoldRightKey() {}

    handleReleaseRightKey() {}
}

module.exports = GameService;