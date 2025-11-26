class EnemyBullet {
  constructor(x, y, bulletSpeed, bulletSize, color) {
    this.x = x;
    this.y = y;
    this.speed = bulletSpeed;
    this.size = bulletSize;
    this.dead = false;
    this.color = color;
  }

  update() {
    // tire vers le bas
    this.y += this.speed;
    if (this.y > height / 2 + this.size) this.dead = true;
  }

  draw() {
    push();
    translate(this.x, this.y, 30);
    fill(this.color);
    noStroke();
    plane(this.size, this.size * 3);
    pop();
  }

  isDead() {
    return this.dead;
  }
}
