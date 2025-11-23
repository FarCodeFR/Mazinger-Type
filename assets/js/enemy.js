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
  }

  update() {
    if (this.dead) {
      return;
    }
    // Mise à jour du déplacement
    this.x += this.vx;
    this.y += this.vy;

    let margin = this.size;
    this.x = constrain(this.x, -width / 2 + margin, width / 2 - margin);

    // Sortie d'écran = mort
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
      plane(this.blastSize, this.blastSize);
    } else {
      // Affiche le vaisseau
      texture(this.model);
      plane(this.size, this.size);
    }
    pop();
  }

  isDead() {
    // Mort en dehors de la zone
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
