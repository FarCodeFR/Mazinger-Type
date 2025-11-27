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

let blueprint;
let playerBlueprint;
let goldorak;
let goldorakModel;

// Background map

let mapOne;
let mapTwo;
let mapThree;
let mapFour;
let activeMap;

let nextMap = null;

// Scroll du background
let bgScroll = 0;
let bgSpeed = 0.5;

// Charge les fichiers avant que le jeu démarre
function preload() {
  blueprint = loadJSON("assets/data/enemyBlueprint.json");
  basicModel = loadImage("assets/images/enemy/vaisseaux.webp");
  alienModel = loadImage("assets/images/enemy/alien.png");
  basicBlast = loadImage("assets/images/enemy/explosion.png");

  playerBlueprint = loadJSON("assets/data/playerBlueprint.json");
  goldorakModel = loadImage("assets/images/player/Goldorak.png");

  mapOne = loadImage("assets/images/themes/mapOne.png");
  mapTwo = loadImage("assets/images/themes/mapTwo.png");
  mapThree = loadImage("assets/images/themes/mapThree.png");
  mapFour = loadImage("assets/images/themes/mapFour.png");
}

// Canvas
function setup() {
  let zone = createCanvas(windowWidth / 1.5, windowHeight, WEBGL);
  zone.parent("game-container");

  ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 1000);

  let firstWave = blueprint.waves[Level];
  activeMap = changeMap(firstWave);

  const stats = playerBlueprint.goldorak;
  const playerConfig = {
    ...stats,
    model: goldorakModel,
  };

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

      // Changement de map
      let newWave = blueprint.waves[Level];
      if (newWave) {
        activeMap = changeMap(newWave);
      }
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

function backgroundScrollMap() {
  bgScroll += bgSpeed;

  if (bgScroll >= height) {
    bgScroll = 0;
  }
  push();
  imageMode(CENTER);
  translate(0, bgScroll);
  image(activeMap, 0, 0, width, height);
  image(activeMap, 0, -height, width, height);
  pop();
}

// Changement de thème
function changeMap(wave) {
  if (!wave) {
    return mapOne;
  }
  switch (wave.theme) {
    case "mapOne":
      return mapOne;
    case "mapTwo":
      return mapTwo;
    case "mapThree":
      return mapThree;
    case "mapFour":
      return mapFour;
    default:
      return mapOne;
  }
}

// Boucle de jeu
function draw() {
  background(0);
  // Thème de la map
  backgroundScrollMap();
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

  goldorak.update();
  goldorak.draw();
}
