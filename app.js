// Canvas

function setup() {
  let zone = createCanvas(windowWidth / 1.5, windowHeight, WEBGL);
  zone.parent("game-container");

  background(500);
}

// Dessin

function draw() {
  background(0);

  camera(0, 0, 500);
  triangle(-20, 25, 8, 60, 36, 25);
}
