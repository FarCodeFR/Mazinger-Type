let mobs = [];

//  Gestion des vagues
let Level = 0;
let spawnInWave = 0;
let lastSpawn = 0;
let nextWave = 0;
let waveCooldown = 2000;

// Gestion des tirs des ennemis
let enemyBullets = [];

// Image ennemis
let basicModel;
let alienModel;
let basicBlast;

let playerBlueprint;
let goldorak;
let goldorakModel;

// Charge les fichiers avant que le jeu démarre
function preload() {
  blueprint = loadJSON("assets/data/enemyBlueprint.json");
  basicModel = loadImage("assets/images/vaisseaux.webp");
  alienModel = loadImage("assets/images/alien.png");
  basicBlast = loadImage("assets/images/explosion.png");

  playerBlueprint = loadJSON("assets/data/playerBlueprint.json");
  goldorakModel = loadImage("assets/images/alien.png");
}

// Canvas
function setup() {
  let zone = createCanvas(windowWidth / 1.5, windowHeight, WEBGL);
  zone.parent("game-container");
  ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 1000);
  background(500);
  // spawnEnemy("basic", 0, -height / 2);

  const stats = playerBlueprint.goldorak;
  const playerConfig = {
    ...stats,
    model: goldorakModel
  }

  goldorak = new Player(height / 2 - 100, playerConfig);
}

function spawnEnemy(type, x, y) {
  const base = blueprint.types[type];
  // Image change en fonction du type d'ennemi
  let modelSelect = basicModel;
  if (type === "alien") {
    modelSelect = alienModel;
  }
  const config = {
    ...base,
    model: modelSelect,
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
  mobs = mobs.filter((m) => !m.isDead());

  goldorak.draw();
}

// Gestion automatique des vagues
function handleWaves() {
  let wave = blueprint.waves[Level];
  // Si plus de vagues = fin du jeu
  if (!wave) {
    return;
  }

  // Attend qu'il n'y à plus d'ennemis pour passer à la vague suivante
  if (spawnInWave >= wave.count) {
    if (mobs.length === 0 && millis() > nextWave) {
      Level++;
      spawnInWave = 0;
      // Enregistre le début de la nouvelle vague en temps
      lastSpawn = millis();
      // Calcul le temps ou la prochaine vague pourra commencer
      nextWave = millis() + waveCooldown;
    }
    return;
  }

  // Spawn le nombre d'ennemies défini dans le blueprint aléatoirement
  if (millis() - lastSpawn > wave.spawnTime + random(0, 500)) {
    // Si c'est un tableau on choisit un type au hasard dedans
    let anotherEnemy;

    if (Array.isArray(wave.type)) {
      anotherEnemy = random(wave.type);
    } else {
      // Sinon on renvoi la string
      anotherEnemy = wave.type;
    }
    let enemyType = blueprint.types[anotherEnemy];
    let margin = enemyType.size;

    let x = random(-width / 2 + margin, width / 2 - margin);
    let y = -height / 2 - margin;

    spawnEnemy(anotherEnemy, x, y);
    spawnInWave++;
    // Quand l'ennemie apparaît lance un nouveau point de départ avant le prochain spawn
    lastSpawn = millis();
  }
}
