const state = require('./StateService');

class GameService {
    constructor(socket) {
        this.socket = socket;

        this.socket.on('playerJoined', this.handlePlayerJoined.bind(this));
        this.socket.on('holdRightKey', this.handleHoldRightKey.bind(this));
        this.socket.on('releaseRightKey', this.handleReleaseRightKey.bind(this));
        this.playerColors = ['blue', 'red', 'green'];
        this.playerSize = 30;
        this.limitRight = 640; 
        this.limitBottom = 480;
    }

    handlePlayerJoined() {
        const color = this.playerColors[state.players.length];
        const player = { x: 0, y: 0, size: this.playerSize, color };
        let collided = false;
        do {
            collided = this.isCollidedAny(player, state.players);
            if (collided) {
                console.log('collided');
                player.x = player.x + player.size;
                player.y = player.y + player.size;
            } else {
                console.log('not collided');
                state.players.push({ ...player, id: `player${state.players.length + 1}` });
            }
        } while (collided || player.x >= this.limitRight - player.size || player.y >= this.limitBottom - player.size);
        this.socket.emit('updatePlayers', state.players);
    }

    handleHoldRightKey() {}

    handleReleaseRightKey() {}

    isCollidedAny(item, itemsCollidedTo) {
        const itemCollidedTo = itemsCollidedTo.find(i => {
            const collided = this.isCollided(item, i);
            if (collided) return true;
        });
        return itemCollidedTo;
    }

    isCollided(item, otherItem) {
        const itemLeftX = item.x;
        const itemRightX = item.x + item.size;
        const itemTopY = item.y;
        const itemBottomY = item.y + item.size;

        const otherItemLeftX = otherItem.x;
        const otherItemRightX = otherItem.x + otherItem.size;
        const otherItemTopY = otherItem.y;
        const otherItemBottomY = otherItem.y + otherItem.size;

        const itemCollidedTopLeft = 
            itemLeftX >= otherItemLeftX 
            && itemLeftX <= otherItemRightX 
            && itemTopY >= otherItemTopY 
            && itemTopY <= otherItemBottomY;

        const itemCollidedBottomLeft = 
            itemLeftX >= otherItemLeftX 
            && itemLeftX <= otherItemRightX 
            && itemBottomY >= otherItemTopY 
            && itemBottomY <= otherItemBottomY;

        const itemCollidedTopRight = 
            itemRightX >= otherItemLeftX 
            && itemRightX <= otherItemRightX 
            && itemTopY >= otherItemTopY 
            && itemTopY <= otherItemBottomY;

        const itemCollidedBottomRight = 
            itemRightX >= otherItemLeftX 
            && itemRightX <= otherItemRightX 
            && itemBottomY >= otherItemTopY 
            && itemBottomY <= otherItemBottomY;

        return (itemCollidedTopLeft || itemCollidedBottomLeft || itemCollidedTopRight || itemCollidedBottomRight);
    }
}

module.exports = GameService;