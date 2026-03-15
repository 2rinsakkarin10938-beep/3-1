export class Skill {
  constructor({ key, name, cooldown, description }) {
    this.key = key;
    this.name = name;
    this.cooldown = cooldown;
    this.description = description;
    this.cooldownLeft = 0;
  }

  tick(dt) {
    this.cooldownLeft = Math.max(0, this.cooldownLeft - dt);
  }

  canUse() {
    return this.cooldownLeft <= 0;
  }

  use(owner, context) {
    if (!this.canUse() || !owner.active || owner.isStunned()) {
      return false;
    }

    const didUse = this.execute(owner, context);
    if (didUse) {
      this.cooldownLeft = this.cooldown;
    }

    return didUse;
  }

  execute() {
    return false;
  }
}
