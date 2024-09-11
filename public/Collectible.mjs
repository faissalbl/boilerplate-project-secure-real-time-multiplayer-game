class Collectible {
  constructor({x, y, value, id, size, color}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.size = size;
    this.color = color;
  }
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
