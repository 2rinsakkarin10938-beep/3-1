import { Skill } from "./skill.js";

function findTargets(owner, context, range) {
  return context.players.filter((player) => {
    if (player.id === owner.id || !player.active) {
      return false;
    }

    const dx = player.centerX - owner.centerX;
    const dy = player.centerY - owner.centerY;
    return Math.hypot(dx, dy) <= range;
  });
}

export class DashSkill extends Skill {
  constructor() {
    super({
      key: "skill1",
      nameKey: "skill.dash.name",
      name: "Dash",
      descriptionKey: "skill.dash.description",
      cooldown: 2.5,
      description: "Burst forward with brief speed gain.",
    });
  }

  execute(owner, context) {
    const { x, y } = owner.facingVector();
    owner.startDash(x, y);
    context.effectManager.addSlash(owner.centerX, owner.centerY, "#67d5b5", 22, 0.16);
    return true;
  }
}

export class StrikeSkill extends Skill {
  constructor() {
    super({
      key: "skill2",
      nameKey: "skill.strike.name",
      name: "Strike",
      descriptionKey: "skill.strike.description",
      cooldown: 1.2,
      description: "Short melee hit in a tight cone.",
    });
  }

  execute(owner, context) {
    const targets = findTargets(owner, context, 52);
    targets.forEach((target) => target.takeDamage(owner.attack * 0.9, owner));
    context.effectManager.addSlash(owner.centerX, owner.centerY, "#f2a93b", 28, 0.18);
    return true;
  }
}

export class ShieldSkill extends Skill {
  constructor() {
    super({
      key: "skill3",
      nameKey: "skill.shield.name",
      name: "Shield",
      descriptionKey: "skill.shield.description",
      cooldown: 5,
      description: "Temporary damage reduction barrier.",
    });
  }

  execute(owner, context) {
    owner.applyShield(2.6);
    context.effectManager.addRing(owner.centerX, owner.centerY, "#8cc8ff", 32, 0.22);
    return true;
  }
}
