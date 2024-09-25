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

class Player {
  constructor({x, y, score = 0, id, size, color}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
    this.size = size;
    this.color = color;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case "right":
        this.x += speed;
        break;
      case "left":
        this.x -= speed;
        break;
      case "down":
        this.y += speed;
        break;
      case "up":
        this.y -= speed;
        break;
    }
  }

  collision(item) {
    return isCollided(item, this);
  }

  calculateRank(arr) {
    let rank = 1;
    const thisIndex = arr.findIndex(player => player.id === this.id);
    arr.forEach((player, index) => {
      // this player will be in the list. Skip comparing to itself.
      if (player.id !== this.id) {
        if (player.score > this.score || player.score === this.score && index < thisIndex) {
          // greater score, greater rank
          // draw. Lowest index, greater rank
          rank++;
        }
      }
    });
    return rank;
  }
}

export default Player;
