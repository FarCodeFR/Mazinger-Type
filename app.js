let mobs = [];

// Score
let score = 0;
let scorePopups = [];
let arcadeFont;

// Musique
let musicMapOne, musicMapTwo, musicBoss, currentMusic;
// Empêche de lancer l’audio avant une interaction user (obligation navigateur)
let audioUnlocked = false;
// Clé qui identifie la musique en cours (évite de relancer la même)
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

// Images ennemis
let basicModel;
let alienModel;
let basicBlast;

// Blueprint
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

// Transition entre vagues (le joueur monte et on change de map)
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

  // Map thèmes
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

  // Typo pour le Score
  arcadeFont = loadFont("assets/fonts/score.ttf");
}

/**  Canvas
 * Sert à initialiser le canvas, préparer l’état initial du jeu,
 * créer le joueur, sélectionner la map/musique de départ. */
function setup() {
  let zone = createCanvas(windowWidth / 1.5, windowHeight, WEBGL);
  zone.parent("game-container");

  // Bouton “Menu” (retour à l’accueil)
  const menuBtn = document.getElementById("menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", goToMenu);
  }

  // Caméra orthographique : projection 2D propre en WEBGL
  ortho(-width / 2, width / 2, -height / 2, height / 2, 0, 1000);

  // Initialisation de la première vague
  let firstWave = blueprint.waves[Level];
  activeMap = changeMap(firstWave);
  applyMusicForWave(firstWave);

  // Crée le joueur à partir du blueprint
  const stats = playerBlueprint.goldorak;
  const playerConfig = {
    ...stats,
    model: goldorakModel,
  };

  // Position “bas de l’écran” en coordonnées WEBGL (centre = 0,0)
  playerBaseY = height / 2 - 100;
  goldorak = new Player(playerBaseY, playerConfig);
  lastPlayerShot = millis();
}

/**
 * Met à jour l’animation des popups de score.
 * - ils montent (y -= vy)
 * - leur durée de vie diminue (life--)
 * - on supprime quand life <= 0
 */
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

/**
 * Dessine visuellement les popups de score.
 * Utilise une alpha qui diminue avec la vie pour un effet “fade out”.
 */
function drawScorePopups() {
  push();
  textAlign(CENTER, CENTER);
  textSize(25);
  textFont(arcadeFont);

  for (const p of scorePopups) {
    const alpha = map(p.life, 0, 60, 0, 255);
    fill(255, 200, 50, alpha);

    // On translate en Z=400 pour afficher devant le background en WEBGL
    push();
    translate(p.x, p.y - 40, 400);
    text(`+${p.value}`, 0, 0);
    pop();
  }

  pop();
}

/**
 * Sauvegarde le score dans localStorage :
 * - bestScore = meilleur score de tous les temps
 * - lastScore = score de la dernière partie
 */
function saveScore() {
  const best = Number(localStorage.getItem("bestScore") || 0);

  if (score > best) {
    localStorage.setItem("bestScore", String(score));
  }

  localStorage.setItem("lastScore", String(score));
}

/**
 * Termine proprement une partie puis redirige vers l’écran d’accueil.
 * - essaye de sauvegarder le score
 * - puis change de page
 */
function goToMenu() {
  try {
    saveScore();
  } catch (e) {
    console.warn("saveScore failed:", e);
  }
  window.location.href = "./index.html";
}

/**
 * Callback p5 déclenché lors d’un appui de touche.
 * - démarre la musique (car interaction user)
 * - ESC : retour menu
 * - SPACE : tir
 */
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

/**
 * Débloque l’audio une seule fois.
 * Les navigateurs empêchent la lecture audio tant qu’il n’y a pas eu une interaction utilisateur.
 */
function unlockAudioOnce() {
  if (audioUnlocked) return;
  userStartAudio();
  audioUnlocked = true;
}

/**
 * Lance une piste en boucle, avec volume.
 * Vérifie qu’elle est chargée pour éviter les erreurs.
 */
function playLoop(track, volume = 0.35) {
  if (!track || !track.isLoaded()) return;
  track.setLoop(true);
  track.setVolume(volume);
  track.play();
}

/**
 * Stoppe une piste si elle est en cours de lecture.
 */
function stopTrack(track) {
  if (track && track.isPlaying()) track.stop();
}

/**
 * Choisit la musique de base selon la map/thème.
 * - mapOne -> musicMapOne
 * - mapTwo/mapThree/mapFour -> musicMapTwo (fallback sur mapOne si besoin)
 */
function pickBaseTrack(theme) {
  // mapOne -> musicMapOne, mapTwo/mapThree/mapFour -> musicMapTwo
  if (theme === "mapOne") return musicMapOne;
  return musicMapTwo || musicMapOne; // fallback si mapTwo pas chargé
}

/**
 * Détermine si la vague contient un boss.
 * Supporte :
 * - wave.type = "bossOne"
 * - wave.type = ["basic","bossOne",...]
 */
function waveHasBoss(wave) {
  if (!wave) return false;
  if (wave.type === "bossOne") return true;
  return Array.isArray(wave.type) && wave.type.includes("bossOne");
}

/**
 * Applique la bonne musique selon :
 * - boss présent -> musique boss
 * - sinon musique liée au thème de map
 */
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

/**
 * Change de musique sans relancer inutilement la même piste.
 * - stop toutes les musiques connues
 * - lance la nouvelle en loop si l’audio est déverrouillé
 */
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

/**
 * S’assure que l’audio est débloqué + démarre la bonne musique courante.
 * Utile à appeler sur un input (tir, touche, clic) pour être sûr que la musique démarre.
 */
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

/**
 * Crée une balle joueur si le cooldown (fireRate) est respecté.
 * - joue un son de tir
 * - instancie PlayerBullet et l’ajoute au tableau playerBullets
 */
function shootPlayer() {
  startMusicIfReady();
  // fireRate vient du blueprint du joueur
  const fireRate = playerBlueprint.goldorak.fireRate;

  // Cooldown de tir
  if (millis() - lastPlayerShot < fireRate) return;

  // son de tir
  if (playerShotSound && playerShotSound.isLoaded()) {
    playerShotSound.rate(random(0.95, 1.05));
    playerShotSound.play(0, 1, 0.05);
  }

  // Crée une balle devant le joueur (y - size/2)
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

/**
 * Instancie un ennemi à une position donnée.
 * - récupère ses stats dans blueprint.types[type]
 * - choisit son image selon son type
 * - crée un Enemy et l’ajoute dans mobs
 */
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

/**
 * Gère l’apparition des ennemis d’une vague.
 *
 * Fonctionnement :
 * - récupère la vague courante via blueprint.waves[Level]
 * - si la vague est terminée (spawnInWave >= count), on attend que mobs soit vide
 * - déclenche une transition (autoMoveUp) pour passer à la prochaine vague
 * - sinon, spawn des ennemis à intervalles (spawnTime + jitter random)
 * - utilise un spawnPattern (ex: random, line, circle...) via spawnPatterns
 */
function handleWaves() {
  let wave = blueprint.waves[Level];
  // Si plus de vagues = fin du jeu
  if (!wave) {
    return;
  }
  // Si on a déjà spawn tous les ennemis prévus pour cette vague :
  // on attend qu’ils soient tous morts/retirés avant de passer à la suivante.
  if (spawnInWave >= wave.count) {
    if (mobs.length === 0 && millis() > nextWave && !autoMoveUp) {
      // on prépare juste le prochain niveau, sans changer tout de suite
      nextLevel = Level + 1;

      // Déclenche la transition de déplacement (le joueur monte)
      autoMoveUp = true;
    }
    return;
  }

  // Spawn si le délai depuis le dernier spawn est écoulé
  if (millis() - lastSpawn > wave.spawnTime + random(0, 500)) {
    // Si wave.type est un tableau, choisir un type random
    let anotherEnemy;
    if (Array.isArray(wave.type)) {
      anotherEnemy = random(wave.type);
    } else {
      // Sinon on renvoi la string
      anotherEnemy = wave.type;
    }
    // Stats de ce type d’ennemi (utilisé pour calculer les positions)
    let enemyType = blueprint.types[anotherEnemy];

    // Récupérer le pattern de spawn (par défaut 'random')
    const patternName = wave.spawnPattern || "random";
    const patternFunc = spawnPatterns[patternName] || spawnPatterns.random;

    // Calcule toutes les positions du pattern
    const allPositions = patternFunc(
      Level,
      enemyType,
      wave.count,
      width,
      height
    );

    // Spawn l'ennemi à la position correspondante dans la liste
    if (spawnInWave < allPositions.length) {
      const pos = allPositions[spawnInWave];
      spawnEnemy(anotherEnemy, pos.x, pos.y);
    }

    spawnInWave++;
    // Quand l'ennemie apparaît lance un nouveau point de départ avant le prochain spawn
    lastSpawn = millis();
  }
}

/**
 * Dessine le background en défilement vertical infini.
 * - bgScroll augmente
 * - quand bgScroll dépasse height, on reset à 0
 * - on dessine 2 fois la même image pour créer une boucle
 */
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

/**
 * Renvoie l’image de background à utiliser selon wave.theme.
 * Si wave est absent ou theme inconnu, fallback sur mapOne.
 */
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

/**
 * Gère les collisions entre les balles du joueur et les ennemis.
 * - parcourt les balles à l’envers (pour splice sans bug)
 * - teste une collision distance (cercle/cercle approximatif)
 * - applique des dégâts
 * - si HP <= 0 : déclenche explosion, son, score, popup
 * - supprime la balle après impact
 */
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

        // Petit feedback visuel (tremblement) géré dans Enemy.draw()/update()
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

        // Si l'ennemi vient d'atteindre 0 HP -> explosion + score + popup
        if (e.hp <= 0 && !e.dead) {
          e.dead = true;
          e.blastTimer = millis();

          // son d'explosion
          if (explosionSound && explosionSound.isLoaded()) {
            explosionSound.play(0, 1, 0.1);
          }

          // score total
          score += e.scoreValue;

          // popup score
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
    // On retire la balle du tableau si elle a touché quelque chose
    if (hitSomething) {
      playerBullets.splice(i, 1);
    }
  }
}

/**
 * Boucle principale p5 (appelée ~60 fois/seconde).
 * Gère :
 * - rendu du background
 * - transition de changement de vague (autoMoveUp)
 * - logique gameplay normale (spawn, updates, collisions, draw)
 * - mise à jour HUD HTML (level, score, titre)
 */
function draw() {
  background(0);

  // Fond qui défile
  backgroundScrollMap();

  // Transition : le joueur monte, puis on change de Level et de map
  if (autoMoveUp) {
    goldorak.y -= autoMoveSpeed;

    // Quand le joueur est sorti par le haut de l’écran
    if (goldorak.y < -height / 2 - 100) {
      // Active le nouveau level
      Level = nextLevel;
      spawnInWave = 0;

      // Map + musique de la nouvelle vague
      let newWave = blueprint.waves[Level];
      if (newWave) {
        activeMap = changeMap(newWave);
      }
      applyMusicForWave(newWave);

      // On remet le joueur en bas de l'écran
      goldorak.y = height / 2 + 100;

      // Timers de vague
      lastSpawn = millis();
      nextWave = millis() + waveCooldown;

      autoMoveUp = false;
    }

    goldorak.draw();
  } else {
    // --- Jeu normal ---
    handleWaves();

    // Tir continu tant que SPACE est maintenu
    if (keyIsDown(32)) shootPlayer();

    // Update + draw bullets joueur
    playerBullets.forEach((b) => {
      b.update();
      b.draw();
    });

    // Collision balle joueur contre ennemis
    handlePlayerBulletHits();

    // Nettoyage des balles mortes
    playerBullets = playerBullets.filter((b) => !b.isDead());

    // Update + draw ennemis
    mobs.forEach((e) => {
      e.update();
      e.draw();
    });

    // Score popups (animation + rendu)
    updateScorePopups();
    drawScorePopups();

    // Update + draw bullets ennemis
    enemyBullets.forEach((b) => {
      b.update();
      b.draw();
    });
    enemyBullets = enemyBullets.filter((b) => !b.isDead());

    // Nettoyage ennemis morts
    mobs = mobs.filter((m) => !m.isDead());

    // Update + draw joueur
    goldorak.update();
    goldorak.draw();
  }

  // HUD HTML : Level
  const levelDisplay = document.getElementById("level-display");
  if (levelDisplay) {
    levelDisplay.textContent = `Level: ${Level + 1}`;
  }

  // HUD HTML : Score
  const scoreDisplay = document.getElementById("score-display");
  if (scoreDisplay) {
    scoreDisplay.textContent = `Score: ${score}`;
  }

  // Titre onglet (si tu as un élément #page-title)
  const pageTitle = document.getElementById("page-title");
  if (pageTitle) {
    pageTitle.textContent = `Mazinger - Level ${Level + 1}`;
  }
}
