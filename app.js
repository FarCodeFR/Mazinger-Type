// Canvas

function setup() {
  background(500);
  let zone = createCanvas(windowWidth / 1.5, windowHeight, WEBGL);
  zone.parent("game-container");
  spawnEnemy(0, -height / 2);
}

// Dessin

function draw() {
  background(0);
  camera(0, 0, 500);
  mobs.forEach((e) => {
    e.update();
    e.draw();
  });
}

let mobs = [];

function spawnEnemy(x, y) {
  const mob = new Enemy(x, y);
  mobs.push(mob);
}
