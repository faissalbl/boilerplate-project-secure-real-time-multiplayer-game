const state = require('./StateService');

class GameService {
    constructor(client, emitAllFn) {
        this.client = client;
        this.emitAllFn = emitAllFn;

        this.client.on('playerJoined', this.handlePlayerJoined.bind(this));
        this.client.on('playerMoved', this.handlePlayerMoved.bind(this));
        this.client.on('disconnect', this.handleDisconnect.bind(this));
        this.playerColors = ['blue', 'red', 'green'];
        this.playerSize = 30;
        this.limitRight = 640; 
        this.limitBottom = 480;
    }

    handlePlayerJoined() {
        const color = this.playerColors[state.players.length];
        const player = { x: 0, y: 0, size: this.playerSize, color, id: this.client.id };
        this.addItemWithoutColliding(player, state.players, () => state.players.push(player));
        this.client.emit('currentPlayer', player);
        this.emitAllFn('updatePlayers', state.players);
    }

    handlePlayerMoved({ x, y }) {
        const currentPlayer = state.players.find(p => p.id === this.client.id);
        currentPlayer.x = x;
        currentPlayer.y = y;
        this.emitAllFn('updatePlayers', state.players);
    }

    handleDisconnect() {
        console.log(`client ${this.client.id} disconnected`);
        const deleteIndex = state.players.findIndex(p => p.id === this.client.id);
        if (deleteIndex >= 0) {
            state.players.splice(deleteIndex, 1);
            this.emitAllFn('updatePlayers', state.players);
        }
    }

    createCollectible() {
        // create a collectible copying from a random collectible
        const collectibleIndex = Math.floor(Math.random() * state.collectibles.length);
        const newCollectible = {...state.collectibles[collectibleIndex]};
        const oldCollectible = state.activeCollectible;
        this.addItemWithoutColliding(newCollectible, state.players, () => state.activeCollectible = newCollectible);
        this.emitAllFn('updateCollectible', state.newCollectible, oldCollectible);
    }

    addItemWithoutColliding(item, existingItems, addItemCallback) {
        let collided = false;
        do {
            collided = this.isCollidedAny(item, existingItems);
            if (collided) {
                const randomX = Math.random() * (this.limitRight - item.size);
                const randomY = Math.random() * (this.limitBottom - item.size);
                item.x = randomX;
                item.y = randomY;
            } else {
                addItemCallback();
            }
        } while (collided);
    }

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