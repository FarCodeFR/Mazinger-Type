class Enemy {
  constructor(x, y) {
    // Position horizontale et verticale
    this.x = x;
    this.y = y;
    // Vitesse de déplacement
    this.vx = 0;
    this.vy = 4;
    // Stats
    this.hp = 1;
    this.dead = false;
  }

  update() {
    // Mise à jour du déplacement
    this.x += this.vx;
    this.y += this.vy;
    // Sortie d'écran = mort
    if (this.y > height) {
      return (this.dead = true);
    }
  }
  // Affichage de l'ennemi
  draw() {
    push();
    translate(this.x, this.y);
    triangle(-20, 25, 8, 60, 36, 25);
    pop();
  }

  isDead() {
    return this.hp <= 0 || this.dead === true;
  }
}
