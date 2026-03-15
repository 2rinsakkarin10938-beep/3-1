import { Skill } from "../skills/skill.js";

export class GroundSlamSkill extends Skill {
  constructor() {
    super({
      key: "skill4",
      name: "Ground Slam",
      cooldown: 8,
      description: "AoE shockwave that damages and stuns nearby enemies.",
    });
  }

  execute(owner, context) {
    context.players.forEach((target) => {
      if (target.id === owner.id || !target.active) {
        return;
      }

      const distance = Math.hypot(target.centerX - owner.centerX, target.centerY - owner.centerY);
      if (distance <= 86) {
        target.takeDamage(owner.attack * 1.15, owner);
        target.applyStun(1);
      }
    });

    context.effectManager.addRing(owner.centerX, owner.centerY, "#ef5b5b", 56, 0.3);
    return true;
  }
}

export function createWarriorSpecial() {
  return new GroundSlamSkill();
}
