export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
  }

  resize(width, height) {
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.ctx.imageSmoothingEnabled = false;
    }
  }

  clear() {
    this.ctx.fillStyle = "#0f1218";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  render({ camera, tilemap, players, projectiles, effectManager }) {
    this.clear();
    tilemap.drawBackground(this.ctx, camera);

    const entities = [...players, ...projectiles].sort((a, b) => (a.y + a.height) - (b.y + b.height));
    entities.forEach((entity) => entity.draw(this.ctx, camera));

    effectManager.draw(this.ctx, camera);
    tilemap.drawForeground(this.ctx, camera);
  }
}
