class PlayerBullet {
  constructor(x, y, speed, size, color) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = size;
    this.color = color || "green";
    this.dead = false;
  }

  update() {
    // le joueur tire vers le haut
    this.y -= this.speed;

    // hors écran
    if (this.y < -height / 2 - this.size) {
      this.dead = true;
    }
  }

  draw() {
    push();
    translate(this.x, this.y, 40);
    noStroke();
    fill(this.color);

    // laser
    box(this.size * 0.6, this.size * 2.5, this.size * 0.6);

    pop();
  }

  isDead() {
    return this.dead;
  }
}
