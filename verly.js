// import Mouse from "./Mouse";
let p5Instance = new p5();

// Now you can call p5.js functions on p5Instance
/**
 * @class Verly
 * @version 1.3.0
 * @author <hazru.anurag@gmail.com>
 */
class Verly {
  /**
   *
   * @param {Number} iterations
   * @param {HTMLCanvasElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(iterations, canvas, ctx) {
    this.entities = [];
    this.chars = [];
    this.iterations = iterations;
    this.currentFrame = 0;
    this.canvas = canvas;
    this.WIDTH = canvas.width;
    this.HEIGHT = canvas.height;
    this.ctx = ctx;
    this.mouse = new Mouse(this.entities, this.canvas, this.ctx);
  }

  /**
   * sets the canvas DPI for better rendering quality
   */
  setDPI() {
    // Set up CSS size.
    this.canvas.style.width =
      this.canvas.style.width || this.canvas.width + "px";
    this.canvas.style.height =
      this.canvas.style.height || this.canvas.height + "px";

    // Get size information.
    var scaleFactor = window.devicePixelRatio / 1;
    var width = parseFloat(this.canvas.style.width);
    var height = parseFloat(this.canvas.style.height);

    // Backup the this.canvas contents.
    var oldScale = this.canvas.width / width;
    var backupScale = scaleFactor / oldScale;
    var backup = this.canvas.cloneNode(false);
    backup.getContext("2d").drawImage(this.canvas, 0, 0);
    this.time = 0; // Time variable for Perlin noise

    // Resize the this.canvas.
    this.canvas.width = Math.ceil(width * scaleFactor);
    this.canvas.height = Math.ceil(height * scaleFactor);

    // Redraw the this.canvas image and scale future draws.
    this.ctx.setTransform(backupScale, 0, 0, backupScale, 0, 0);
    this.ctx.drawImage(backup, 0, 0);
    this.ctx.setTransform(scaleFactor, 0, 0, scaleFactor, 0, 0);
  }

  /**
   * @param  {...Entity} args
   * @description Joins two Entity Class Together
   *
   * @example
   *
   */
  joinEntities(...args) {
    let mixEntity = new Entity(this.iterations, this);

    let points = [];
    let sticks = [];

    // loop through the args and push points and sticks to the array
    for (let i = 0; i < args.length; i++) {
      points.push(args[i].points);
      sticks.push(args[i].sticks);

      // get the index which item we should splice in [this.entities]
      let index = this.entities.indexOf(args[i]);
      this.entities.splice(index, 1);
    }

    // join multiple arrays
    points = [].concat.apply([], points);
    sticks = [].concat.apply([], sticks);

    // add the arrays to the mix::Entity
    mixEntity.points = points;
    mixEntity.sticks = sticks;

    // add the mix::Entity to [this.entities]
    this.addEntity(mixEntity);
    return mixEntity; // return for chaining
  }

  /**
   * @param {Entity} e
   */
  addEntity(e) {
    e.setupAccessibility();
    this.entities.push(e);
  }

  /**
   * drags points
   */
  interact() {
    this.mouse.drag();
  }

  /**
   * updates all the physics stuff
   */
  update(name = "none") {
    // Update the time variable
    this.time += 0.01; // Adjust the increment for speed of change
    // console.log("UPDATE YPP!", this.entities)

    // Apply gravity and Perlin noise-based forces
    for (let entity of this.entities) {
      entity.update("droplets");
      for (let point of entity.points) {
        // Apply gravity
        let gravityValue = Math.random() * (6 - 3) + 3; // Generates a random number between 3 and 6
        let gravity = new Vector(0, gravityValue);
        point.applyForce(gravity);

        // 10% chance to generate a new droplet each frame
        if (
          Math.random() < 0.1 &&
          this.entities.length < 10 &&
          entity.points.length < 100
        ) {
          entity.generateInkDroplet();
        }

        // Fade each droplet
        for (let i = entity.points.length - 1; i >= 0; i--) {
          entity.fadeDroplet(entity.points[i]);
        }
      }
    }
  }
  /**
   */
  renderPointIndex() {
    for (let i = 0; i < this.entities.length; i++) {
      this.entities[i].renderPointIndex(this.ctx);
    }
  }

  /**
   * renders all the entity
   */
  render(name = "none") {
    console.log("i am render", name);
    this.ctx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    if (name === "none") {
      for (let i = 0; i < this.entities.length; i++) {
        this.entities[i].render(this.ctx);
      }
    }

    if (name === "droplets") {
      console.log("i am this.entities ", this.entities.length);
      for (let i = 0; i < this.entities.length; i++) {
        const entity = this.entities[i];

        for (let j = 0; j < entity.points.length; j++) {
          const droplet = entity.points[j];
          this.ctx.fillStyle = `rgba(0, 0, 0, ${droplet.opacity})`;
          this.ctx.beginPath();
          this.ctx.arc(droplet.pos.x, droplet.pos.y, 0, 0, Math.PI * 2);
          this.ctx.fill();

          if (droplet.history) {
            this.ctx.beginPath();
            for (let k = 0; k < droplet.history.length - 1; k++) {
              const pos1 = droplet.history[k];
              const pos2 = droplet.history[k + 1];

              let chars =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

              let dx = pos2.x - pos1.x;
              let dy = pos2.y - pos1.y;
              let distance = Math.sqrt(dx * dx + dy * dy);
              let lineWidth = droplet.radius + 2;
              let letters = Math.abs(Math.floor(
                (distance - lineWidth) / this.ctx.measureText("W").width
              ));

              this.ctx.strokeStyle = `rgba(0, 0, 0, ${pos1.opacity})`;
              this.ctx.moveTo(pos1.x, pos1.y);
              this.ctx.lineTo(pos2.x, pos2.y);

              for (let i = 0; i <= letters; i++) {
                let t = i / letters;
                let x = pos1.x + dx * t;
                let y = pos1.y + dy * t;
                this.ctx.fillStyle = "red";
                this.ctx.font = "20px Arial";
                let text = chars.charAt(
                  Math.floor(Math.random() * chars.length)
                ); // Choose a random character
                this.ctx.fillText(text, x, y);

                  // Add the character to the array with its position, creation time, and initial opacity
                this.chars.push({x, y, text, time: Date.now(), opacity: 1});
              }
            }
            this.ctx.stroke();
          }
        }
      }
    }
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  createBox(x, y, w, h) {
    const box = new Entity(this.iterations, this, "Box");
    box.addPoint(x, y, 0, 0);
    box.addPoint(x + w, y, 0, 0);
    box.addPoint(x + w, y + h, 0, 0);
    box.addPoint(x, y + h, 0, 0);
    box.addStick(0, 1);
    box.addStick(1, 2);
    box.addStick(2, 3);
    box.addStick(3, 0);
    box.addStick(3, 1);
    this.addEntity(box);
    return box;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} segments
   * @param {number} radius=50
   * @param {number} stride1=1
   * @param {number} stride2=5
   */
  createHexagon(x, y, segments, radius = 50, stride1 = 1, stride2 = 5) {
    const hexagon = new Entity(this.iterations, this, "Hexagon");

    let stride = (2 * Math.PI) / segments;

    // points
    for (let i = 0; i < segments; ++i) {
      let theta = i * stride;
      hexagon.addPoint(
        x + Math.cos(theta) * radius,
        y + Math.sin(theta) * radius,
        0,
        0
      );
    }

    let center = hexagon.addPoint(x, y, 0, 0);

    // sticks
    for (let i = 0; i < segments; ++i) {
      hexagon.addStick(i, (i + stride1) % segments);
      hexagon.addStick(new Stick(hexagon.points[i], center));
      hexagon.addStick(i, (i + stride2) % segments);
    }

    this.addEntity(hexagon);
    return hexagon;
  }

  createDroplets(dropsAmount = 10) {
    let droplets = new Entity(this.iterations, this, "Droplets");

    function randomRadiusBasedOnHeight(height) {
      // Normalize height to range [0, 1]
      let normalizedHeight = 1 - height / canvas.height;

      // Generate radius in range [1, 30] based on normalized height
      let radius = 1 + normalizedHeight * 29;

      return radius;
    }
    const maxMass = 2;
    const minMass = 1;
    for (let i = 0; i < dropsAmount; ++i) {
      let px = Math.random() * canvas.width; // random x position within canvas
      let py = Math.random() * canvas.height; // random y position within canvas
      let radius = randomRadiusBasedOnHeight(py); // get random radius based on height

      let opacity = Math.random() * 0.5 + 0.5; // random opacity between 0.5 and 1
      let mass = Math.random() * (maxMass - minMass) + minMass; // Generates a random mass between minMass and maxMass
      droplets.addPoint(px, py, 0, 0, radius, opacity, mass, 0.3);
    }

    console.log("i am droplets inside", droplets);
    this.addEntity(droplets);
  }

  /**
   * @param {number} posx
   * @param {number} posy
   * @param {number} w
   * @param {number} h
   * @param {number} segments
   * @param {number} pinOffset
   */
  createCloth(posx, posy, w, h, segments, pinOffset) {
    let cloth = new Entity(this.iterations, this, "Cloth");

    let xStride = w / segments;
    let yStride = h / segments;

    let x, y;
    for (y = 0; y < segments; ++y) {
      for (x = 0; x < segments; ++x) {
        let px = posx + x * xStride - w / 2 + xStride / 2;
        let py = posy + y * yStride - h / 2 + yStride / 2;
        cloth.addPoint(px, py);

        if (x > 0) {
          cloth.addStick(y * segments + x, y * segments + x - 1);
        }

        if (y > 0) {
          cloth.addStick(y * segments + x, (y - 1) * segments + x);
        }
      }
    }

    // as the name suggest
    function tear(mouseX, mouseY, threshold) {
      for (let i = 0; i < cloth.points.length; i++) {
        // Calculate the distance between the mouse position and the point
        let dist = cloth.points[i].pos.dist(new Vector(mouseX, mouseY));

        // If the distance is less than the threshold, remove the corresponding sticks
        if (dist < threshold) {
          let sticksToRemove = cloth.sticks.filter(
            (stick) =>
              stick.startPoint === cloth.points[i] ||
              stick.endPoint === cloth.points[i]
          );
          sticksToRemove.forEach((stick) => {
            let index = cloth.sticks.indexOf(stick);
            if (index !== -1) {
              cloth.sticks.splice(index, 1);
            }
          });
        }
      }
    }

    cloth.tear = tear;

    for (x = 0; x < segments; ++x) {
      if (x % pinOffset == 0) {
        // magic
        cloth.pin(x);
      }
    }

    !this.dontPush && this.addEntity(cloth);
    return cloth;
  }

  /**
   * @param {number} posx
   * @param {number} posy
   * @param {number} w
   * @param {number} h
   * @param {number} segments
   * @param {number} pinOffset
   */
  createCloth_perlin(posx, posy, w, h, segments, pinOffset) {
    let cloth = new Entity(this.iterations, this, "Cloth");
    let xStride = w / segments;
    let yStride = h / segments;
    let x, y;

    // Create points in a grid
    for (y = 0; y <= segments; ++y) {
      for (x = 0; x <= segments; ++x) {
        let px = posx + x * xStride;
        let py = posy + y * yStride;
        cloth.addPoint(px, py);
      }
    }

    // Connect points with sticks to form triangles
    for (y = 0; y < segments; ++y) {
      for (x = 0; x < segments; ++x) {
        let topLeft = y * (segments + 1) + x;
        let topRight = topLeft + 1;
        let bottomLeft = (y + 1) * (segments + 1) + x;
        let bottomRight = bottomLeft + 1;

        // Form two triangles for each square
        cloth.addStick(topLeft, bottomRight);
        cloth.addStick(topRight, bottomLeft);

        // Connect edges of the square
        cloth.addStick(topLeft, topRight);
        cloth.addStick(topRight, bottomRight);
        cloth.addStick(bottomRight, bottomLeft);
        cloth.addStick(bottomLeft, topLeft);
      }
    }
    const stiffness = 0.1;
    for (y = 0; y < segments; ++y) {
      for (x = 0; x < segments; ++x) {
        let topLeft = y * (segments + 1) + x;
        let topRight = topLeft + 1;
        let bottomLeft = (y + 1) * (segments + 1) + x;
        let bottomRight = bottomLeft + 1;

        // Add AngleSticks to enforce angles within the triangles
        cloth.addAngleStick(topLeft, bottomRight, topRight, stiffness);
        cloth.addAngleStick(bottomRight, topLeft, bottomLeft, stiffness);

        // Optionally, you can add more AngleSticks for the other pair of triangles
        // or for other configurations depending on how rigid you want the structure to be
      }
    }

    // as the name suggest
    function tear(mouseX, mouseY, threshold) {
      for (let i = 0; i < cloth.points.length; i++) {
        // Calculate the distance between the mouse position and the point
        let dist = cloth.points[i].pos.dist(new Vector(mouseX, mouseY));

        // If the distance is less than the threshold, remove the corresponding sticks
        if (dist < threshold) {
          let sticksToRemove = cloth.sticks.filter(
            (stick) =>
              stick.startPoint === cloth.points[i] ||
              stick.endPoint === cloth.points[i]
          );
          sticksToRemove.forEach((stick) => {
            let index = cloth.sticks.indexOf(stick);
            if (index !== -1) {
              cloth.sticks.splice(index, 1);
            }
          });
        }
      }
    }

    cloth.tear = tear;

    // Pin the top edge
    for (x = 0; x < segments; ++x) {
      cloth.pin(x);

      !this.dontPush && this.addEntity(cloth);
      return cloth;
    }
  }

  /**
   * @param {number} posx
   * @param {number} posy
   * @param {number} w
   * @param {number} h
   * @param {number} segments
   * @param {number} pinOffset
   * @param {String} text
   *
   */
  createCharCloth(posx, posy, w, h, segments, pinOffset, text) {
    let cloth = new Entity(this.iterations, this, "Cloth");
    this.stickCount = 0;

    let xStride = w / segments;
    let yStride = h / segments;

    let x, y;
    for (y = 0; y < segments; ++y) {
      for (x = 0; x < segments; ++x) {
        let px = posx + x * xStride - w / 2 + xStride / 2;
        let py = posy + y * yStride - h / 2 + yStride / 2;
        const index = y * segments + x;
        if (index < text.length) {
          cloth.addCharPoint(text[index], px, py);
        } else cloth.addCharPoint(".", px, py);

        if (x > 0) {
          cloth.addStick(y * segments + x, y * segments + x - 1);
          this.stickCount++;
        }

        if (y > 0) {
          cloth.addStick(y * segments + x, (y - 1) * segments + x);
          this.stickCount++;
        }
      }
    }

    // as the name suggest
    function tear(mouseX, mouseY, threshold) {
      for (let i = 0; i < cloth.points.length; i++) {
        // Calculate the distance between the mouse position and the point
        let dist = cloth.points[i].pos.dist(new Vector(mouseX, mouseY));

        // If the distance is less than the threshold, remove the corresponding sticks
        if (dist < threshold) {
          let sticksToRemove = cloth.sticks.filter(
            (stick) =>
              stick.startPoint === cloth.points[i] ||
              stick.endPoint === cloth.points[i]
          );
          sticksToRemove.forEach((stick) => {
            let index = cloth.sticks.indexOf(stick);
            if (index !== -1) {
              cloth.sticks.splice(index, 1);
            }
          });
        }
      }
      this.stickCount = cloth.sticks.length;
      if (this.stickCount < 1110) {
        window.location.href = window.location.origin + "/final.html";
      }
    }

    cloth.tear = tear;

    for (x = 0; x < segments; ++x) {
      if (x % pinOffset == 0) {
        // magic
        cloth.pin(x);
      }
    }

    !this.dontPush && this.addEntity(cloth);
    return cloth;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} segments=10
   * @param {number} gap=15
   * @param {number} pin=0
   */
  createRope(x, y, segments = 10, gap = 15, pin) {
    let rope = new Entity(this.iterations, this, "Rope");

    for (let i = 0; i < segments; i++) {
      rope.addPoint(x + i * gap, y, 0, 0);
    }

    for (let i = 0; i < segments - 1; i++) {
      rope.addStick(i, (i + 1) % segments);
    }

    if (pin !== undefined) {
      rope.pin(pin);
    }
    this.addEntity(rope);
    return rope;
  }

  createRagdoll(x0, y0) {
    let ragdoll = new Entity(this.iterations, this, "Ragdoll");

    // Head
    ragdoll.addPoint(x0, y0).setRadius(15).setMass(5);

    // Groin
    ragdoll.addPoint(x0, y0 + 100);

    // Hips
    ragdoll.addPoint(x0 + 30, y0 + 90);
    ragdoll.addPoint(x0 - 30, y0 + 90);

    // Knees
    ragdoll.addPoint(x0 + 20, y0 + 150);
    ragdoll.addPoint(x0 - 20, y0 + 150);

    // Feet
    ragdoll
      .addPoint(x0 + 30, y0 + 190)
      .setRadius(10)
      .setMass(20);
    ragdoll
      .addPoint(x0 - 30, y0 + 190)
      .setRadius(10)
      .setMass(20);

    // Neck
    ragdoll.addPoint(x0, y0 + 25);

    // Shoulders
    ragdoll.addPoint(x0 + 25, y0 + 30);
    ragdoll.addPoint(x0 - 25, y0 + 30);

    // Hands
    ragdoll
      .addPoint(x0 + 15, y0 + 105)
      .setRadius(10)
      .setMass(5);
    ragdoll
      .addPoint(x0 - 15, y0 + 105)
      .setRadius(10)
      .setMass(5);

    // "Muscles"
    // Head - shoulders
    ragdoll.addStick(0, 9);
    ragdoll.addStick(0, 10);
    // Shoulder - shoulder
    ragdoll.addStick(9, 10);

    // Shoulders - hips
    ragdoll.addStick(9, 2);
    ragdoll.addStick(10, 3);
    // Shoulders - hips opposite side
    ragdoll.addStick(9, 3);
    ragdoll.addStick(10, 2);

    // Hips - feet
    ragdoll.addStick(2, 6);
    ragdoll.addStick(3, 7);

    // Hips - feet, opposite
    ragdoll.addStick(2, 7);
    ragdoll.addStick(3, 6);

    // Head - groin
    ragdoll.addStick(0, 1);

    // Hip - hip
    ragdoll.addStick(2, 3);
    // Shoulder - hip
    ragdoll.addStick(9, 2);
    ragdoll.addStick(10, 3);

    // Head - knee
    ragdoll.addStick(0, 4);
    // Head - knee
    ragdoll.addStick(0, 5);

    // Head feet
    ragdoll.addStick(0, 6);
    ragdoll.addStick(0, 7);

    // Body parts
    // Hips
    ragdoll.addStick(1, 2);
    ragdoll.addStick(1, 3);
    // Legs
    ragdoll.addStick(2, 4);
    ragdoll.addStick(3, 5);
    ragdoll.addStick(4, 6);
    ragdoll.addStick(5, 7);

    ragdoll.addStick(0, 8);
    ragdoll.addStick(8, 1);

    // Left arm
    ragdoll.addStick(8, 9);
    ragdoll.addStick(9, 11);

    // Right arm
    ragdoll.addStick(8, 10);
    ragdoll.addStick(10, 12);

    this.addEntity(ragdoll);
    return ragdoll;
  }
}
