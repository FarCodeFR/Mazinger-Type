class Player {
  constructor(y, config) {
    this.x = 0;
    this.y = y;
    this.speed = config.speed;
    this.size = config.size;
    this.hp = config.hp;
    this.model = config.model;
  }

  draw() {
    push();
    translate(this.x, this.y, 20);
    texture(this.model);
    plane(this.size, this.size);
    pop();
  }
}