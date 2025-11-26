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

    // Enregistrer le moment exact de l'apparition pour ensuite calculer quand il doit tirer
    this.lastShot = millis();
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
      enemyBullets.push(
        new EnemyBullet(
          this.x,
          this.y + this.size / 2,
          this.bulletSpeed,
          this.bulletSize,
          this.bulletColor
        )
      );
      this.lastShot = millis();
    }

    let margin = this.size;
    this.x = constrain(this.x, -width / 2 + margin, width / 2 - margin);

    // Sortie d'écran = mort
    // Plus démarer le temps d'explosion avec millis
    if (this.y > height / 2 - this.size / 2) {
      this.dead = true;
      this.blastTimer = millis();
    }
  }

  // Affichage de l'ennemi
  draw() {
    push();
    translate(this.x, this.y, 10);
    if (this.dead) {
      // Affiche l'explosion
      texture(this.blast);
      noStroke()
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
    if (this.hp <= 0) {
      this.dead = true;
      this.blastTimer = millis();
      return false;
    }
    return false;
  }
}
