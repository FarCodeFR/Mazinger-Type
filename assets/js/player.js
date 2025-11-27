class Player {
  constructor(y, config) {
    this.x = 0;
    this.y = y;
    this.speed = config.speed;
    this.size = config.size;
    this.hp = config.hp;
    this.model = config.model;
  }

  update() {
    if (keyIsDown(LEFT_ARROW)){
      this.x -= this.speed;
    }

    if (keyIsDown(RIGHT_ARROW)) {
      this.x += this.speed;
    }

    if (keyIsDown(UP_ARROW)) {
      this.y -= this.speed;
    }

    if (keyIsDown(DOWN_ARROW)) {
      this.y += this.speed;
    }

    this.x = constrain(this.x, (-width + this.size) / 2, (width - this.size) / 2, -height / 2, height / 2)
  }

  draw() {
    push();
    translate(this.x, this.y, 20);
    texture(this.model);
    noStroke()
    plane(this.size, this.size);
    pop();
  }
}