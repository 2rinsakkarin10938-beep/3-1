export class Entity {
  constructor({ id, x, y, width, height, color }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.active = true;
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }

  draw(ctx, camera) {
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.round(this.x - camera.x), Math.round(this.y - camera.y), this.width, this.height);
  }
}
