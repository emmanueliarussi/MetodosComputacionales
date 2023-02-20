// App
let app;
let stage;

// Holder to store the bunnies
const bunnies = [];
const totalBunnies   = 20;

// Textures 
let textures;
let bg;

// Score
let scoreText;
let score = 0;

function pointInPolygon(point, polygon) {
    const v0 = [polygon[0].x, polygon[0].y];
    for (let i = 1; i < polygon.length - 1; i++) {
      const v1 = [polygon[i].x, polygon[i].y];
      const v2 = [polygon[i + 1].x, polygon[i + 1].y];
      const barycentric = getBarycentricCoordinates(point, v0, v1, v2);
      if (barycentric[0] >= 0 && barycentric[1] >= 0 && barycentric[2] >= 0) {
        return true;
      }
    }
    return false;
  }
  
  function getBarycentricCoordinates(point, v0, v1, v2) {
    const v0v1 = [v1[0] - v0[0], v1[1] - v0[1]];
    const v0v2 = [v2[0] - v0[0], v2[1] - v0[1]];
    const v0p = [point.x - v0[0], point.y - v0[1]];
    const d00 = dotProduct(v0v1, v0v1);
    const d01 = dotProduct(v0v1, v0v2);
    const d11 = dotProduct(v0v2, v0v2);
    const d20 = dotProduct(v0p, v0v1);
    const d21 = dotProduct(v0p, v0v2);
    const denominator = d00 * d11 - d01 * d01;
    const b1 = (d11 * d20 - d01 * d21) / denominator;
    const b2 = (d00 * d21 - d01 * d20) / denominator;
    const b0 = 1 - b1 - b2;
    return [b0, b1, b2];
  }
  
  function dotProduct(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1];
  }

// Click listener
function printCoordinates(event) {
    // Click pos    
    let click = {x:event.clientX, y: event.clientY};
    console.log(`X: ${click.x}, Y: ${click.y}`);

    // Test colision
    let triangle_test = false;
    for (let i = 0; i < totalBunnies; i++) {
      triangle_test = pointInPolygon(click,bunnies[i].getBounds());
      if(triangle_test) { score += bunnies[i].getScore(); updateScore(); break;};
    }

    console.log(triangle_test);
  }

// Click listener
document.addEventListener("click", printCoordinates);

// Bunny Class
class Bunny extends PIXI.Sprite {
    constructor(texture, name = "none"){
        super(texture);
        // Set the initial position and other bunny prop. 
        this.anchor.set(0.5);
        this.x = Math.random() * app.screen.width;
        this.y = Math.random() * app.screen.height;
        this.name = name;
        this.speed = 2 + Math.random() * 4;
        this.direction = Math.random() * Math.PI * 2;
        this.scale_faactor = Math.random() * 1.5;
        this.score = Math.round((1./this.scale_faactor)*50);
        this.scale.x *= this.scale_faactor;
        this.scale.y *= this.scale_faactor;
        this.turningSpeed = Math.random() - 0.8;
        this.boundsPadding = 0;
        this.reshapeBoundingBounds();
    }

    // Reshape bounding box after window resize
    reshapeBoundingBounds() {
        this.bounds = new PIXI.Rectangle(-this.boundsPadding,
                                         -this.boundsPadding,
                                          app.screen.width + this.boundsPadding * 2,
                                          app.screen.height + this.boundsPadding * 2);
    }

    // Returns score for this bunny
    getScore() {
      return this.score;
    }
    
    // Updates one step
    move() {
        // Move one step
        this.direction += this.turningSpeed * 0.01;
        this.x         += Math.sin(this.direction) * this.speed;
        this.y         += Math.cos(this.direction) * this.speed;
        this.rotation   = -this.direction - Math.PI / 2;

        // Wrap the bunny by testing windows bounds...
        if (this.x < this.bounds.x) {
            this.x += this.bounds.width;
        } else if (this.x > this.bounds.x + this.bounds.width) {
            this.x -= this.bounds.width;
        }

        if (this.y < this.bounds.y) {
            this.y += this.bounds.height;
        } else if (this.y > this.bounds.y + this.bounds.height) {
            this.y -= this.bounds.height;
        }
    }
    
    // Returns triangulated boundary
    getBounds() {
        // Use builtin bounding box feature
        let polygon   = super.getBounds(true);

        // Triangulate
        let triangles = [];

        // Triangle 1
        triangles.push({x:polygon.x, y:polygon.y});
        triangles.push({x:polygon.x+polygon.width, y:polygon.y});
        triangles.push({x:polygon.x, y:polygon.y+polygon.height});

        // Triangle 2
        triangles.push({x:polygon.x+polygon.width, y:polygon.y});
        triangles.push({x:polygon.x, y:polygon.y+polygon.height});
        triangles.push({x:polygon.x+polygon.width, y:polygon.y+polygon.height});

        return triangles;
    }
}

// Update score after click
function updateScore() {
    scoreText.text = `Score: ${score}`;
}

// Game loop
function gameLoop(delta) {
    // Move bunnies
    for (let i = 0; i < totalBunnies; i++) {
      bunnies[i].move();      
    }

    // Move background
    bg.tilePosition.x += 1;
    bg.tilePosition.y += 1;
}

// Windows resize
function resizeHandler() {
    // New size
    const newWidth  = window.innerWidth;
    const newHeight = window.innerHeight;
    
    // Resize canvas 
    app.renderer.view.style.width = `${newWidth}px`;
    app.renderer.view.style.height = `${newHeight}px`;
    app.renderer.resize(newWidth, newHeight);

    // Update bunnies
    for (let i = 0; i < totalBunnies; i++) {
      bunnies[i].reshapeBoundingBounds();
    }

    // Update background
    bg.width  = newWidth;
    bg.height = newHeight;
  };

// Create the scene elements 
function createScene() {
    // Main scene element
    stage = new PIXI.Container();

    // Set up background
    bg = new PIXI.TilingSprite(PIXI.Assets.get("grass"), app.screen.width, app.screen.height);
    app.stage.addChild(bg);

    // Create bunnies
    for (let i = 0; i < totalBunnies; i++) {
      // Create
      let bunny = new Bunny(PIXI.Assets.get("bunny"));
      // Shows hand cursor
      bunny.cursor = 'pointer';
      bunnies.push(bunny);
      app.stage.addChild(bunny);
    }

    // Score text
    scoreText = new PIXI.Text(`Score: ${score}`);
    scoreText.position.set(10, 10);

    scoreText.style = new PIXI.TextStyle({
      fontFamily: "PublicPixel",
      fontSize: 40,
      fill: 0xFFFFFF,
    });

    app.stage.addChild(scoreText);
}

//  After loading the sprites
function doneLoading(textures) {
    // Create scene elements
    createScene();

    // Resize canvas to fit window size
    resizeHandler();

    //Launch game!
    app.ticker.add(gameLoop)
}

// Load game
window.onload = function() { 
    // Create app
    app = new PIXI.Application({ background: '#288C22' });

    // Add view to scene and register resize event
    document.body.appendChild(app.view);
    window.addEventListener('resize', resizeHandler, false);

    // Load sprites
    PIXI.Assets.add('bunny', 'assets/bunny_sprite.png');
    PIXI.Assets.add('grass', 'assets/grass.png');
    // Load more if neded
    // ...

    // Load the assets and get a resolved promise once both are loaded
    const spritesPromise = PIXI.Assets.load(['bunny','grass']);
    spritesPromise.then(doneLoading);
};






