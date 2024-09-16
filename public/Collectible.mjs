class Collectible {
  constructor({
    x, y, value, id, size, color, 
    circleX, circleY, radius, startAngle, endAngle
  }) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.size = size;
    this.color = color;

    // Set the starting position and circle properties
    this.circleX = this.x + this.size / 2;  // X-coordinate of the circle's center
    this.circleY = this.y + this.size / 2; // Y-coordinate of the circle's center
    this.radius = this.size / 2;          // Circle's radius
    this.startAngle = 0;        // Start angle (0 radians = 0 degrees)
    this.endAngle = 2 * Math.PI; // End angle (2π radians = 360 degrees)    
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
