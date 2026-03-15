export class SkillEffectManager {
  constructor() {
    this.effects = [];
  }

  addSlash(x, y, color, radius = 28, ttl = 0.18) {
    this.effects.push({ type: "slash", x, y, color, radius, ttl, maxTtl: ttl });
  }

  addRing(x, y, color, radius = 42, ttl = 0.26) {
    this.effects.push({ type: "ring", x, y, color, radius, ttl, maxTtl: ttl });
  }

  addBurst(x, y, color, radius = 18, ttl = 0.2) {
    this.effects.push({ type: "burst", x, y, color, radius, ttl, maxTtl: ttl });
  }

  update(dt) {
    this.effects = this.effects
      .map((effect) => ({ ...effect, ttl: effect.ttl - dt }))
      .filter((effect) => effect.ttl > 0);
  }

  draw(ctx, camera) {
    this.effects.forEach((effect) => {
      const progress = effect.ttl / effect.maxTtl;
      const drawX = Math.round(effect.x - camera.x);
      const drawY = Math.round(effect.y - camera.y);

      ctx.save();
      ctx.globalAlpha = Math.max(0.18, progress);
      ctx.strokeStyle = effect.color;
      ctx.fillStyle = effect.color;
      ctx.lineWidth = 3;

      if (effect.type === "slash") {
        ctx.beginPath();
        ctx.arc(drawX, drawY, effect.radius * (1.2 - progress * 0.4), -0.5, 1.1);
        ctx.stroke();
      } else if (effect.type === "ring") {
        ctx.beginPath();
        ctx.arc(drawX, drawY, effect.radius * (1.4 - progress * 0.4), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(drawX, drawY, effect.radius * (1.1 - progress * 0.3), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }
}
