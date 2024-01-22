class TriangleStick extends Stick {
    constructor(p1, p2, p3, length1, length2, length3, stiffness) {
      super(p1, p2, length1, stiffness); // Initialize the first stick
      this.thirdPoint = p3;
      this.length2 = length2 || p2.pos.dist(p3.pos); // Length between p2 and p3
      this.length3 = length3 || p3.pos.dist(p1.pos); // Length between p3 and p1
    }
  
    update() {
      super.update(); // Update the first stick
  
      // Update the second stick (p2 to p3)
      let dx2 = this.thirdPoint.pos.x - this.endPoint.pos.x;
      let dy2 = this.thirdPoint.pos.y - this.endPoint.pos.y;
      let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
      let diff2 = (this.length2 - dist2) / dist2 * this.stiffness;
  
      let offsetX2 = dx2 * diff2 * 0.5;
      let offsetY2 = dy2 * diff2 * 0.5;
  
      if (!this.endPoint.pinned) {
        this.endPoint.pos.x -= offsetX2;
        this.endPoint.pos.y -= offsetY2;
      }
      if (!this.thirdPoint.pinned) {
        this.thirdPoint.pos.x += offsetX2;
        this.thirdPoint.pos.y += offsetY2;
      }
  
      // Update the third stick (p3 to p1)
      // Similar to the above but for the third stick

      let dx3 = this.thirdPoint.pos.x - this.startPoint.pos.x;
      let dy3 = this.thirdPoint.pos.y - this.startPoint.pos.y;
      let dist3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
      let diff3 = (this.length3 - dist3) / dist3 * this.stiffness;
  
      let offsetX3 = dx3 * diff3 * 0.5;
      let offsetY3 = dy3 * diff3 * 0.5;
  
      if (!this.startPoint.pinned) {
        this.startPoint.pos.x -= offsetX3;
        this.startPoint.pos.y -= offsetY3;
      }
      if (!this.thirdPoint.pinned) {
        this.thirdPoint.pos.x += offsetX3;
        this.thirdPoint.pos.y += offsetY3;
      }
      
    }
  
    // Additional methods for rendering, etc.
  }
  