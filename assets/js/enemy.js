class Enemy {
  constructor(x, y, config) {
    // Position horizontale et verticale
    this.x = x;
    this.y = y;
    // Vitesse de déplacement
    this.vx = config.vx;
    this.vy = config.vy;
    // Stats
    this.hp = config.hp;
    this.dead = false;
    // Style
    this.model = config.model;
    this.blast = config.blast;
    // Tailles
    this.size = config.size;
    // Explosion timer & duration
    this.blastTimer = 0;
    this.duration = 400;
    this.blastSize = this.size * 1.5;
    //  Tirs
    this.fireRate = config.fireRate;
    this.bulletSpeed = config.bulletSpeed;
    this.bulletSize = config.bulletSize;
    this.bulletColor = config.bulletColor;
    this.bulletShape = config.bulletShape;
    // Pattern de tir
    this.bulletPatterns = config.bulletPatterns || "straight";
    // Type (utile pour comportements spécifiques comme le boss)
    this.type = config.type;
    // Score
    this.scoreValue = config.score || 0;

    // Comportement par défaut pour le boss : spawn en haut et patrouille horizontale
    if (this.type === "bossOne") {
      this.vy = 0;
      // vitesse horizontale réduite par défaut (modifiable depuis le blueprint)
      this.vx =
        config.vx && Math.abs(config.vx) > 0 ? Math.sign(config.vx) * 1.2 : 1.2;
      if (typeof height !== "undefined") {
        this.y = -height / 2 + this.size;
      }

      // Supporter une liste de patterns pour alterner au rebond
      if (Array.isArray(config.bulletPatterns)) {
        this.patternList = config.bulletPatterns;
      } else if (Array.isArray(config.bulletPatternsList)) {
        this.patternList = config.bulletPatternsList;
      } else {
        this.patternList = [config.bulletPatterns || "straight"];
      }
      this.currentPatternIndex = 0;
      this.bulletPatterns =
        this.patternList[this.currentPatternIndex] || this.bulletPatterns;
    }

    // Spirale
    this.shotAngle = HALF_PI;
    this.shotAngleSpeed = config.shotAngleSpeed || 0;

    // Animation du tir
    this.bulletSpiralColor = config.bulletSpiralColor || this.bulletColor;
    this.bulletRotationSpeed = config.bulletRotationSpeed || 0;

    // Enregistrer le moment exact de l'apparition pour ensuite calculer quand il doit tirer
    this.lastShot = millis();
    // Tremblement temporaire (ms)
    this.trembleUntil = 0;
  }

  update() {
    if (this.dead) {
      return;
    }
    // Mise à jour du déplacement
    this.x += this.vx;
    this.y += this.vy;

    // Tirs
    // millis temps actuel - temps du dernier tir > délai entre deux tirs
    if (millis() - this.lastShot > this.fireRate) {
      const pattern =
        bulletPatterns[this.bulletPatterns] || bulletPatterns.straight;

      pattern(this, enemyBullets);

      this.lastShot = millis();
    }

    let margin = this.size;
    this.x = constrain(this.x, -width / 2 + margin, width / 2 - margin);

    // Comportement spécifique pour le boss : rester en haut et patrouiller horizontalement
    if (this.type === "bossOne") {
      let leftLimit = -width / 2 + margin;
      let rightLimit = width / 2 - margin;
      let topLimit = -height / 2 + margin;
      let bottomLimit = topLimit + Math.max(this.size * 2, 150);

      // Contrainte verticale (reste en haut)
      this.y = constrain(this.y, topLimit, bottomLimit);

      // Rebond horizontal aux bords
      if (this.x <= leftLimit + 1 && this.vx < 0) {
        this.vx *= -1;
        this.x = leftLimit + 1;
        // Changer le pattern au rebond
        if (this.patternList && this.patternList.length > 1) {
          this.currentPatternIndex =
            (this.currentPatternIndex + 1) % this.patternList.length;
          this.bulletPatterns = this.patternList[this.currentPatternIndex];
        }
      } else if (this.x >= rightLimit - 1 && this.vx > 0) {
        this.vx *= -1;
        this.x = rightLimit - 1;
        // Changer le pattern au rebond
        if (this.patternList && this.patternList.length > 1) {
          this.currentPatternIndex =
            (this.currentPatternIndex + 1) % this.patternList.length;
          this.bulletPatterns = this.patternList[this.currentPatternIndex];
        }
      }
      return;
    }

    // Sortie d'écran = mort (pour les ennemis classiques)
    // Lance le timer d'explosion
    if (this.y > height / 2 - this.size / 2 && !this.dead) {
      this.dead = true;
      this.blastTimer = millis();

      // 🔊 son d'explosion (mort par sortie écran)
      if (typeof explosionSound !== "undefined" && explosionSound.isLoaded()) {
        explosionSound.play(0, 1, 0.1);
      }
    }
  }

  // Affichage de l'ennemi
  draw() {
    push();
    // Appliquer un léger tremblement si demandé
    let tx = this.x;
    let ty = this.y;
    if (this.trembleUntil && millis() < this.trembleUntil) {
      const j = Math.max(2, this.size * 0.02);
      tx += random(-j, j);
      ty += random(-j, j);
    }
    translate(tx, ty, 10);
    if (this.dead) {
      // Affiche l'explosion
      texture(this.blast);
      noStroke();
      plane(this.blastSize, this.blastSize);
    } else {
      // Affiche le vaisseau
      texture(this.model);
      noStroke();
      plane(this.size, this.size);
    }
    pop();
  }

  isDead() {
    // Mort en dehors de la zone + vérification que l'explosion est terminée
    if (this.dead) {
      return millis() - this.blastTimer > this.duration;
    }

    // Mort par tirs
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      this.blastTimer = millis();
    }
    return false;
  }
}
