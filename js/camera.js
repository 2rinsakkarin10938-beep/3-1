function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.x = 0;
    this.y = 0;
  }

  setViewport(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  follow(target, worldWidth, worldHeight) {
    const halfWidth = this.viewportWidth / 2;
    const halfHeight = this.viewportHeight / 2;
    this.x = clamp(target.x + target.width / 2 - halfWidth, 0, Math.max(0, worldWidth - this.viewportWidth));
    this.y = clamp(target.y + target.height / 2 - halfHeight, 0, Math.max(0, worldHeight - this.viewportHeight));
  }
}
