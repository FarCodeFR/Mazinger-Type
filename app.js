let mobs = [];

//  Gestion des vagues

let Level = 0;
let spawnInWave = 0;
let lastSpawn = 0;

// Gestion des tirs des ennemis

let enemyBullets = [];

// Charge les fichiers avant que le jeu démarre

function preload() {
  blueprint = loadJSON("assets/data/enemyBlueprint.json");
  basicModel = loadImage("assets/images/vaisseaux.webp");
  basicBlast = loadImage("assets/images/explosion.png");
}

// Canvas

function setup() {
  let zone = createCanvas(windowWidth / 1.5, windowHeight, WEBGL);
  zone.parent("game-container");
  ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 1000);
  background(500);
  // spawnEnemy("basic", 0, -height / 2);
}

function spawnEnemy(type, x, y) {
  const base = blueprint.types[type];
  const config = {
    ...base,
    model: basicModel,
    blast: basicBlast,
  };
  mobs.push(new Enemy(x, y, config));
}

// Boucle de jeu

function draw() {
  background(0);
  handleWaves();
  mobs.forEach((e) => {
    e.update();
    e.draw();
  });
  enemyBullets.forEach((b) => {
    b.update();
    b.draw();
  });
  enemyBullets = enemyBullets.filter((b) => !b.isDead());
  mobs = mobs.filter((e) => !e.isDead());
}

// Gestion automatique des vagues

function handleWaves() {
  let wave = blueprint.waves[Level];
  if (!wave) {
    return;
  }
  if (spawnInWave < wave.count) {
    if (millis() - lastSpawn > wave.spawnTime + random(0, 700)) {
      let enemyType = blueprint.types[wave.type];

      let margin = enemyType.size;
      let x = random(-width / 2 + margin, width / 2 - margin);
      let y = -height / 2 - margin;

      spawnEnemy(wave.type, x, y);
      spawnInWave++;
      lastSpawn = millis();
    }
  } else {
    Level++;
    spawnInWave = 0;
  }
}
