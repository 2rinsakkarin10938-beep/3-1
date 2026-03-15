import { Skill } from "../skills/skill.js";

export class ShadowStepSkill extends Skill {
  constructor() {
    super({
      key: "skill4",
      nameKey: "skill.shadowStep.name",
      name: "Shadow Step",
      descriptionKey: "skill.shadowStep.description",
      cooldown: 7,
      description: "Teleport behind the nearest enemy and deal crit damage.",
    });
  }

  execute(owner, context) {
    const targets = context.players
      .filter((target) => target.id !== owner.id && target.active)
      .sort(
        (a, b) =>
          Math.hypot(a.centerX - owner.centerX, a.centerY - owner.centerY) -
          Math.hypot(b.centerX - owner.centerX, b.centerY - owner.centerY),
      );

    const target = targets[0];
    if (!target) {
      return false;
    }

    const facing = target.facingVector();
    const newX = target.x - facing.x * 28;
    const newY = target.y - facing.y * 28;
    owner.teleport(newX, newY, context.tilemap);
    target.takeDamage(owner.attack * 1.7, owner);
    context.effectManager.addBurst(owner.centerX, owner.centerY, "#a855f7", 16, 0.16);
    context.effectManager.addSlash(target.centerX, target.centerY, "#a855f7", 34, 0.2);
    return true;
  }
}

export function createRogueSpecial() {
  return new ShadowStepSkill();
}
