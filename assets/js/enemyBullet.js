class EnemyBullet {
  constructor(
    x,
    y,
    bulletSpeed,
    bulletSize,
    color,
    shape,
    angle,
    spiralColor,
    rotationSpeed
  ) {
    this.x = x;
    this.y = y;
    this.speed = bulletSpeed;
    this.size = bulletSize;
    this.dead = false;
    this.color = color;

    //  Forme du tir
    this.shape = shape || "rect";

    // Switch couleur
    this.baseColor = this.color || "white";
    this.spiralColor = spiralColor || this.color;

    // temps de vie de la balle pour l'animation
    this.life = 0;
    this.rotation = 0;
    this.rotationSpeed = rotationSpeed || 0;

    // Si on a un angle > tir directionnel (spirale possible)
    if (angle === null) {
      this.vx = 0;
      this.vy = this.speed;
    } else {
      this.vx = cos(angle) * this.speed;
      this.vy = sin(angle) * this.speed;
    }
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    this.life++;
    this.rotation += this.rotationSpeed;

    if (this.rotationSpeed !== 0 && this.life > 50) {
      this.dead = true;
    }
    if (
      this.y > height / 2 + this.size ||
      this.y < -height / 2 - this.size ||
      this.x < -width / 2 - this.size ||
      this.x > width / 2 + this.size
    ) {
      this.dead = true;
    }
  }

  draw() {
    push();
    translate(this.x, this.y, 30);
    rotateZ(this.rotation);
    // Animation de couleur : va et vient entre baseColor et spiralColor
    let t = (sin(this.life * 0.2) + 1) / 2; // entre 0 et 1
    let useAlt = t > 0.5;
    fill(useAlt ? this.spiralColor : this.color);
    noStroke();
    switch (this.shape) {
      case "circle":
        sphere(this.size);
        break;
      case "square":
        box(this.size);
        break;
      case "triangle":
        cone(this.size, this.size * 2);
        break;
      case "rect":
      default:
        plane(this.size, this.size * 3);
    }
    pop();
  }

  isDead() {
    return this.dead;
  }
}
