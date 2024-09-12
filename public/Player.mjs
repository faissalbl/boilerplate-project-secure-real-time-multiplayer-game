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

  }

  calculateRank(arr) {

  }
}

export default Player;
