class EnemyBullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 12;
    this.size = 5;
    this.dead = false;
  }

  update() {
    this.y += this.speed; // tire vers le bas
    if (this.y > height / 2 + this.size) this.dead = true;
  }

  draw() {
    push();
    translate(this.x, this.y, 20);
    noStroke();
    fill(255, 0, 0);
    plane(this.size, this.size * 2);
    pop();
  }

  isDead() {
    return this.dead;
  }
}
