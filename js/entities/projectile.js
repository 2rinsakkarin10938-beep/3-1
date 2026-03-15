import { Entity } from "./entity.js";

export class Projectile extends Entity {
  constructor({ id, ownerId, x, y, dx, dy, speed, damage, radius, ttl, color }) {
    super({
      id,
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2,
      color,
    });
    this.ownerId = ownerId;
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
    this.damage = damage;
    this.ttl = ttl;
    this.radius = radius;
  }

  update(dt, context) {
    this.ttl -= dt;
    if (this.ttl <= 0) {
      this.active = false;
      return;
    }

    this.x += this.dx * this.speed * dt;
    this.y += this.dy * this.speed * dt;

    if (context.tilemap.collidesRect(this.x, this.y, this.width, this.height)) {
      context.effectManager.addBurst(this.centerX, this.centerY, "#f2a93b");
      this.active = false;
      return;
    }

    const target = context.players.find(
      (player) => player.id !== this.ownerId && player.active && context.checkOverlap(this, player),
    );

    if (target) {
      target.takeDamage(this.damage, context.players.find((player) => player.id === this.ownerId));
      context.effectManager.addBurst(this.centerX, this.centerY, this.color);
      this.active = false;
    }
  }

  draw(ctx, camera) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(Math.round(this.centerX - camera.x), Math.round(this.centerY - camera.y), this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
