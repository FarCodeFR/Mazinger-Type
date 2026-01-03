let mobs = [];

// Score
let score = 0;
let scorePopups = [];
let arcadeFont;

// Musique

let musicMapOne, musicMapTwo, musicBoss, currentMusic;
let audioUnlocked = false;
let musicKey = "";
let explosionSound;
let playerShotSound;

//  Gestion des vagues
let Level = 0;
let spawnInWave = 0;
let lastSpawn = 0;
let nextWave = 0;
let waveCooldown = 2000;

// Gestion des tirs des ennemis
let enemyBullets = [];

// Tir joueur
let playerBullets = [];
let lastPlayerShot = 0;

// Image ennemis
let basicModel;
let alienModel;
let basicBlast;

let blueprint;
let playerBlueprint;
let goldorak;
let goldorakModel;

// Boss
let bossOne;

// Background map
let mapOne;
let mapTwo;
let mapThree;
let mapFour;
let activeMap;

// Transition
let autoMoveUp = false;
const autoMoveSpeed = 8;
let playerBaseY;

let nextLevel = null;

// Scroll du background
let bgScroll = 0;
let bgSpeed = 0.5;

// Charge les fichiers avant que le jeu démarre
function preload() {
  blueprint = loadJSON("assets/data/enemyBlueprint.json");
  basicModel = loadImage("assets/images/enemy/vaisseaux.webp");
  alienModel = loadImage("assets/images/enemy/alien.png");
  basicBlast = loadImage("assets/images/enemy/explosion.png");
  spaceShip = loadImage("assets/images/enemy/spaceship.jpg");
  eye = loadImage("assets/images/enemy/eyebot.png");

  // Boss
  bossOne = loadImage("assets/images/enemy/bossOne.png");

  // Joueur
  playerBlueprint = loadJSON("assets/data/playerBlueprint.json");
  goldorakModel = loadImage("assets/images/player/Goldorak.png");

  mapOne = loadImage("assets/images/themes/mapOne.png");
  mapTwo = loadImage("assets/images/themes/mapTwo.png");
  mapThree = loadImage("assets/images/themes/mapThree.png");
  mapFour = loadImage("assets/images/themes/mapFour.png");

  // Musique
  musicMapOne = loadSound("assets/sounds/mapOne.mp3");
  musicMapTwo = loadSound("assets/sounds/mapTwo.mp3");
  musicBoss = loadSound("assets/sounds/bossOne.mp3");
  explosionSound = loadSound("assets/sounds/explosion.mp3");
  playerShotSound = loadSound("assets/sounds/playerShot.mp3");

  // Score
  arcadeFont = loadFont("assets/fonts/score.ttf");
}

// Canvas
function setup() {
  let zone = createCanvas(windowWidth / 1.5, windowHeight, WEBGL);
  zone.parent("game-container");
  const menuBtn = document.getElementById("menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", goToMenu);
  }

  ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 1000);

  let firstWave = blueprint.waves[Level];
  activeMap = changeMap(firstWave);
  applyMusicForWave(firstWave);

  const stats = playerBlueprint.goldorak;
  const playerConfig = {
    ...stats,
    model: goldorakModel,
  };

  playerBaseY = height / 2 - 100;
  goldorak = new Player(playerBaseY, playerConfig);
  lastPlayerShot = millis();
}

// Score

function updateScorePopups() {
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const p = scorePopups[i];
    p.y -= p.vy;
    p.life--;

    if (p.life <= 0) {
      scorePopups.splice(i, 1);
    }
  }
}

function drawScorePopups() {
  push();
  textAlign(CENTER, CENTER);
  textSize(25);
  textFont(arcadeFont);

  for (const p of scorePopups) {
    const alpha = map(p.life, 0, 60, 0, 255);
    fill(255, 200, 50, alpha);

    push();
    translate(p.x, p.y - 40, 400);
    text(`+${p.value}`, 0, 0);
    pop();
  }

  pop();
}

//  Sauvegarde le score

function saveScore() {
  const best = Number(localStorage.getItem("bestScore") || 0);

  if (score > best) {
    localStorage.setItem("bestScore", String(score));
  }

  localStorage.setItem("lastScore", String(score));
}

//  Retour menu

function goToMenu() {
  try {
    saveScore();
  } catch (e) {
    console.warn("saveScore failed:", e);
  }
  window.location.href = "./index.html";
}

// Musique

function keyPressed() {
  startMusicIfReady();

  if (key === "Escape") {
    goToMenu();
  }

  if (keyCode === 32) {
    // SPACE
    shootPlayer();
  }
}

function unlockAudioOnce() {
  if (audioUnlocked) return;
  userStartAudio();
  audioUnlocked = true;
}

function playLoop(track, volume = 0.35) {
  if (!track || !track.isLoaded()) return;
  track.setLoop(true);
  track.setVolume(volume);
  track.play();
}

function stopTrack(track) {
  if (track && track.isPlaying()) track.stop();
}

function pickBaseTrack(theme) {
  // mapOne -> musicMapOne, mapTwo/mapThree/mapFour -> musicMapTwo
  if (theme === "mapOne") return musicMapOne;
  return musicMapTwo || musicMapOne; // fallback si mapTwo pas chargé
}

function waveHasBoss(wave) {
  if (!wave) return false;
  if (wave.type === "bossOne") return true;
  return Array.isArray(wave.type) && wave.type.includes("bossOne");
}

function applyMusicForWave(wave) {
  const theme = wave?.theme || "mapOne";

  // Boss prioritaire
  if (waveHasBoss(wave)) {
    switchMusic("boss", musicBoss, 0.5);
    return;
  }

  // Musique de base selon la map
  const baseTrack = pickBaseTrack(theme);
  const key = `base:${theme}`;
  switchMusic(key, baseTrack, 0.35);
}

function switchMusic(key, track, volume) {
  // évite de redémarrer la même musique
  if (musicKey === key && track && track.isPlaying()) return;

  musicKey = key;
  currentMusic = track;

  // si audio pas encore unlock, on attend une interaction
  if (!audioUnlocked) return;

  stopTrack(musicMapOne);
  stopTrack(musicMapTwo);
  stopTrack(musicBoss);

  playLoop(currentMusic, volume);
}

function startMusicIfReady() {
  unlockAudioOnce();

  // choisir la bonne musique selon la vague/map actuelle
  if (!currentMusic) {
    const wave = blueprint?.waves?.[Level];
    applyMusicForWave(wave);
  }

  // si on avait choisi une musique avant unlock, on la lance maintenant
  if (currentMusic && !currentMusic.isPlaying()) {
    const vol = musicKey.startsWith("boss") ? 0.5 : 0.35;
    playLoop(currentMusic, vol);
  }
}

function shootPlayer() {
  startMusicIfReady();
  // fireRate vient du blueprint du joueur
  const fireRate = playerBlueprint.goldorak.fireRate;

  if (millis() - lastPlayerShot < fireRate) return;

  // 🔊 son de tir
  if (playerShotSound && playerShotSound.isLoaded()) {
    playerShotSound.rate(random(0.95, 1.05));
    playerShotSound.play(0, 1, 0.05);
  }

  const b = new PlayerBullet(
    goldorak.x,
    goldorak.y - goldorak.size / 2,
    playerBlueprint.goldorak.bulletSpeed,
    playerBlueprint.goldorak.bulletSize,
    playerBlueprint.goldorak.bulletColor
  );

  playerBullets.push(b);
  lastPlayerShot = millis();
}

// swith enemy

function spawnEnemy(type, x, y) {
  const base = blueprint.types[type];
  // Image change en fonction du type d'ennemi
  let modelSelect = basicModel;
  if (type === "alien") {
    modelSelect = alienModel;
  } else if (type === "spaceship") {
    modelSelect = spaceShip;
  } else if (type === "eye") {
    modelSelect = eye;
  } else if (type === "bossOne") {
    modelSelect = bossOne;
  }
  const config = {
    ...base,
    type,
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
  // Attendre que tout les ennemis disparaisse pour passer à la vague suivante
  if (spawnInWave >= wave.count) {
    if (mobs.length === 0 && millis() > nextWave && !autoMoveUp) {
      // on prépare juste le prochain niveau, sans changer tout de suite
      nextLevel = Level + 1;

      // le vaisseau va commencer à monter
      autoMoveUp = true;
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

    // Récupérer le pattern de spawn (par défaut 'random')
    const patternName = wave.spawnPattern || "random";
    const patternFunc = spawnPatterns[patternName] || spawnPatterns.random;

    // Calculer toutes les positions du pattern en une seule fois
    const allPositions = patternFunc(
      Level,
      enemyType,
      wave.count,
      width,
      height
    );

    // Spawn l'ennemi à la position correspondante
    if (spawnInWave < allPositions.length) {
      const pos = allPositions[spawnInWave];
      spawnEnemy(anotherEnemy, pos.x, pos.y);
    }

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

// Impact du tir sur l'ennemi
function handlePlayerBulletHits() {
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const b = playerBullets[i];
    let hitSomething = false;

    for (let j = mobs.length - 1; j >= 0; j--) {
      const e = mobs[j];

      // Ne pas toucher un ennemi déjà mort / en explosion
      if (e.dead) continue;

      // Collision simple : distance (cercle/cercle)
      const d = dist(b.x, b.y, e.x, e.y);
      const hitRadius = e.size * 0.5 + b.size * 0.8;

      if (d < hitRadius) {
        // Dégâts
        e.hp -= 1;
        e.trembleUntil = millis() + 120;

        // La balle disparaît à l'impact
        b.dead = true;
        console.log(
          "KILL:",
          e.type,
          "scoreValue:",
          e.scoreValue,
          "total:",
          score
        );

        // ✅ Si l'ennemi vient d'atteindre 0 HP -> explosion + score + popup
        if (e.hp <= 0 && !e.dead) {
          e.dead = true;
          e.blastTimer = millis();

          // 🔊 son d'explosion
          if (explosionSound && explosionSound.isLoaded()) {
            explosionSound.play(0, 1, 0.1);
          }

          // ⭐ score total
          score += e.scoreValue;

          // ⭐ popup "+100"
          scorePopups.push({
            x: e.x,
            y: e.y,
            value: e.scoreValue,
            life: 60,
            vy: random(0.8, 1.2),
          });
        }

        hitSomething = true;
        break; // une balle ne touche qu’un ennemi
      }
    }

    if (hitSomething) {
      playerBullets.splice(i, 1);
    }
  }
}

// Boucle de jeu
function draw() {
  background(0);

  // Fond qui défile
  backgroundScrollMap();

  if (autoMoveUp) {
    // le vaisseau monte
    goldorak.y -= autoMoveSpeed;

    // quand il sort par le haut
    if (goldorak.y < -height / 2 - 100) {
      // Change de Level et de thème
      Level = nextLevel;
      spawnInWave = 0;

      let newWave = blueprint.waves[Level];
      if (newWave) {
        activeMap = changeMap(newWave);
      }
      applyMusicForWave(newWave);
      // on remet le vaisseau en bas de l'écran sur la nouvelle map
      goldorak.y = height / 2 + 100;

      // on relance les timers pour la nouvelle vague
      lastSpawn = millis();
      nextWave = millis() + waveCooldown;

      autoMoveUp = false;
    }

    goldorak.draw();
  } else {
    // Jeu normal
    handleWaves();

    if (keyIsDown(32)) shootPlayer();

    playerBullets.forEach((b) => {
      b.update();
      b.draw();
    });
    // Collision balle joueur contre ennemis
    handlePlayerBulletHits();
    playerBullets = playerBullets.filter((b) => !b.isDead());

    mobs.forEach((e) => {
      e.update();
      e.draw();
    });
    updateScorePopups();
    drawScorePopups();
    enemyBullets.forEach((b) => {
      b.update();
      b.draw();
    });
    enemyBullets = enemyBullets.filter((b) => !b.isDead());
    mobs = mobs.filter((m) => !m.isDead());

    goldorak.update();
    goldorak.draw();
  }

  // Mettre à jour l'affichage du level
  const levelDisplay = document.getElementById("level-display");
  if (levelDisplay) {
    levelDisplay.textContent = `Level: ${Level + 1}`;
  }

  // Mettre à jour l'affichage du score
  const scoreDisplay = document.getElementById("score-display");
  if (scoreDisplay) {
    scoreDisplay.textContent = `Score: ${score}`;
  }

  // Mettre à jour le titre de l'onglet
  const pageTitle = document.getElementById("page-title");
  if (pageTitle) {
    pageTitle.textContent = `Mazinger - Level ${Level + 1}`;
  }
}
