const state = require('./StateService');

function getItemsCollided(item, itemsCollidedTo) {
    const confItemsCollidedTo = itemsCollidedTo.filter(i => {
        const collided = isCollided(item, i);
        if (collided) return true;
    });
    return confItemsCollidedTo;
}

function isCollided(item, otherItem) {
    if (item.id === otherItem.id) return false;

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


class GameService {
    constructor(client, emitAllFn) {
        this.client = client;
        this.emitAllFn = emitAllFn;

        this.client.on('playerJoined', this.handlePlayerJoined.bind(this));
        this.client.on('playerMoved', this.handlePlayerMoved.bind(this));
        this.client.on('scored', this.handleScored.bind(this));
        this.client.on('disconnect', this.handleDisconnect.bind(this));
        this.playerColors = ['blue', 'red', 'green'];
    }

    handlePlayerJoined(playerSize, limitTop, limitRight, limitBottom, limitLeft) {
        const color = this.playerColors[state.players.length];
        const player = { x: 0, y: 0, size: playerSize, color, id: this.client.id };
        this.addItemWithoutColliding(player, state.players, limitTop, limitRight, limitBottom, limitLeft, () => state.players.push(player));
        this.client.emit('currentPlayer', player);
        this.client.emit('drawGame', state);
        this.client.broadcast.emit('updatePlayer', player);
        // if the first player joined, add the collectible, otherwise the collectible should
        // already be there.
        if (state.players.length === 1) this.createCollectible(limitTop, limitRight, limitBottom, limitLeft);
    }

    handlePlayerMoved({ x, y }) {
        const currentPlayer = state.players.find(p => p.id === this.client.id);
        // before updating the players, if any players were collided before this move
        // we need to let them know so that they can update all the collided players
        // even after they move out of each other, to make sure that the UI knows
        // to reprint the players that were overridden by others.
        const collidedPlayers = getItemsCollided(currentPlayer, state.players);
        for (let collidedPlayer of collidedPlayers) {
            this.emitAllFn('updatePlayer', collidedPlayer, collidedPlayer);
        }

        const oldPlayer = {...currentPlayer};
        currentPlayer.x = x;
        currentPlayer.y = y;
        this.emitAllFn('updatePlayer', currentPlayer, oldPlayer);
    }

    handleScored(score, limitTop, limitRight, limitBottom, limitLeft) {
        this.createCollectible(limitTop, limitRight, limitBottom, limitLeft);
        const currentPlayer = state.players.find(p => p.id === this.client.id);
        currentPlayer.score = score;
        this.emitAllFn('scored', currentPlayer);
    }

    handleDisconnect() {
        console.log(`client ${this.client.id} disconnected`);
        const deleteIndex = state.players.findIndex(p => p.id === this.client.id);
        if (deleteIndex >= 0) {
            const deleted = state.players.splice(deleteIndex, 1);
            this.emitAllFn('deletePlayer', deleted[0]);
        }
    }

    createCollectible(limitTop, limitRight, limitBottom, limitLeft) {
        // create a collectible copying from a random collectible
        const collectibleIndex = Math.floor(Math.random() * state.collectibles.length);
        const newCollectible = {...state.collectibles[collectibleIndex]};
        const oldCollectible = state.activeCollectible;
        this.addItemWithoutColliding(newCollectible, state.players, limitTop, limitRight, limitBottom, limitLeft, () => state.activeCollectible = newCollectible);
        this.emitAllFn('updateCollectible', newCollectible, oldCollectible);
    }

    addItemWithoutColliding(item, existingItems, limitTop, limitRight, limitBottom, limitLeft, addItemCallback) {
        let collided = false;
        do {
            let randomX = Math.floor(Math.random() * (limitRight - item.size - limitLeft) + limitLeft);
            let randomY = Math.floor(Math.random() * (limitBottom - item.size - limitTop) + limitTop);
            item.x = randomX;
            item.y = randomY;
        collided = getItemsCollided(item, existingItems);
            if (collided.length > 0) {
                randomX = Math.floor(Math.random() * (limitRight - item.size - limitLeft) + limitLeft);
                randomY = Math.floor(Math.random() * (limitBottom - item.size - limitTop) + limitTop);
                item.x = randomX;
                item.y = randomY;
            } else {
                if (addItemCallback) addItemCallback();
            }
        } while (collided.length > 0);
    }
}

module.exports = GameService;
