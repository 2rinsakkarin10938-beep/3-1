import { Skill } from "../skills/skill.js";

export class FireballSkill extends Skill {
  constructor() {
    super({
      key: "skill4",
      nameKey: "skill.fireball.name",
      name: "Fireball",
      descriptionKey: "skill.fireball.description",
      cooldown: 4.5,
      description: "High damage projectile with long reach.",
    });
  }

  execute(owner, context) {
    const { x, y } = owner.facingVector();
    context.spawnProjectile({
      ownerId: owner.id,
      x: owner.centerX,
      y: owner.centerY,
      dx: x,
      dy: y,
      speed: 300,
      damage: owner.attack * 1.55,
      radius: 8,
      ttl: 1.5,
      color: "#f97316",
    });
    context.effectManager.addBurst(owner.centerX, owner.centerY, "#f97316", 20, 0.18);
    return true;
  }
}

export function createMageSpecial() {
  return new FireballSkill();
}
