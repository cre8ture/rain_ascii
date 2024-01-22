
// Function to clamp a value between a minimum and maximum
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Function to perform linear interpolation between a start and end value
function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

// Function to execute when the window loads
window.onload = function () {
  // Get the canvas element
  let canvas = document.getElementById("c");
  // Get the 2D rendering context for the canvas
  let ctx = canvas.getContext("2d");
  // Set the width of the canvas, clamping the window's inner width between 600 and Infinity
  let width = clamp(window.innerWidth, 1000, Infinity);
  // Set the height of the canvas to the window's inner height
  let height = window.innerHeight +  1000;
  // Apply the width and height to the canvas
  canvas.width = width;
  canvas.height = height;

  // Create a new Verly instance
  let verly = new Verly(16, canvas, ctx);

  class Droplet extends Entity {
    constructor(iterations, verly){
      super(iterations, verly)
      // this.droplets = new Entity(iterations, verly, 'Droplets');
      this.droplets  = verly.createDroplets(iterations);
      console.log(this.droplets)
      // this.d = d;
    }
  }

 
  let droplets = new Droplet(16, verly);
  verly.addEntity(droplets);


  // Function to animate the canvas
  function animate() {
    console.log("animate")

    // Update, render, and interact with the Verly instance
    verly.update("droplets");

    verly.render("droplets");

    // Request the next animation frame
    requestAnimationFrame(animate);
  }
  // Start the animation
  animate();

};
