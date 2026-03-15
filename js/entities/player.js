import { getCharacterDefinition, createSkillLoadout } from "../characters/character-data.js";
import { Entity } from "./entity.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class Player extends Entity {
  constructor({ id, name, className, x, y, inputProfile }) {
    const definition = getCharacterDefinition(className);
    super({
      id,
      x,
      y,
      width: 24,
      height: 24,
      color: definition.color,
    });
    this.name = name;
    this.className = className;
    this.label = definition.label;
    this.inputProfile = inputProfile;
    this.maxHp = definition.hp;
    this.hp = definition.hp;
    this.attack = definition.attack;
    this.defense = definition.defense;
    this.baseSpeed = definition.speed;
    this.runMultiplier = 1.4;
    this.skills = createSkillLoadout(className);
    this.facing = { x: 0, y: 1 };
    this.dashTimeLeft = 0;
    this.shieldTimeLeft = 0;
    this.stunTimeLeft = 0;
    this.invulnerableTimeLeft = 0;
    this.respawnTimer = 0;
  }

  facingVector() {
    return this.facing.x === 0 && this.facing.y === 0 ? { x: 0, y: 1 } : this.facing;
  }

  isStunned() {
    return this.stunTimeLeft > 0;
  }

  startDash(dx, dy) {
    if (dx === 0 && dy === 0) {
      const fallback = this.facingVector();
      dx = fallback.x;
      dy = fallback.y;
    }

    this.facing = { x: dx, y: dy };
    this.dashTimeLeft = 0.18;
    this.invulnerableTimeLeft = Math.max(this.invulnerableTimeLeft, 0.12);
  }

  applyShield(seconds) {
    this.shieldTimeLeft = Math.max(this.shieldTimeLeft, seconds);
  }

  applyStun(seconds) {
    this.stunTimeLeft = Math.max(this.stunTimeLeft, seconds);
  }

  teleport(nextX, nextY, tilemap) {
    const clampedX = clamp(nextX, tilemap.tileSize, tilemap.pixelWidth - tilemap.tileSize - this.width);
    const clampedY = clamp(nextY, tilemap.tileSize, tilemap.pixelHeight - tilemap.tileSize - this.height);
    if (!tilemap.collidesRect(clampedX, clampedY, this.width, this.height)) {
      this.x = clampedX;
      this.y = clampedY;
    }
  }

  takeDamage(amount, source) {
    if (!this.active || this.invulnerableTimeLeft > 0) {
      return;
    }

    const shieldMultiplier = this.shieldTimeLeft > 0 ? 0.45 : 1;
    const reduced = Math.max(1, Math.round((amount - this.defense * 0.45) * shieldMultiplier));
    this.hp = Math.max(0, this.hp - reduced);
    this.invulnerableTimeLeft = 0.12;

    if (this.hp === 0) {
      this.active = false;
      this.respawnTimer = 2.2;
      this.lastHitBy = source?.name ?? "Arena";
    }
  }

  respawn(spawnPoint) {
    this.active = true;
    this.hp = this.maxHp;
    this.x = spawnPoint.x;
    this.y = spawnPoint.y;
    this.invulnerableTimeLeft = 0.4;
  }

  update(dt, context) {
    this.skills.forEach((skill) => skill.tick(dt));

    if (!this.active) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn(context.tilemap.getSpawnPoint(context.players.indexOf(this)));
      }
      return;
    }

    this.dashTimeLeft = Math.max(0, this.dashTimeLeft - dt);
    this.shieldTimeLeft = Math.max(0, this.shieldTimeLeft - dt);
    this.stunTimeLeft = Math.max(0, this.stunTimeLeft - dt);
    this.invulnerableTimeLeft = Math.max(0, this.invulnerableTimeLeft - dt);

    if (!this.isStunned()) {
      ["skill1", "skill2", "skill3", "skill4"].forEach((skillKey, index) => {
        if (context.input.consumePress(this.inputProfile, skillKey)) {
          this.skills[index].use(this, context);
        }
      });

      const movement = context.input.getMovementVector(this.inputProfile);
      if (movement.x !== 0 || movement.y !== 0) {
        this.facing = { x: movement.x, y: movement.y };
      }

      const speedMultiplier = movement.running ? this.runMultiplier : 1;
      const dashMultiplier = this.dashTimeLeft > 0 ? 2.85 : 1;
      const moveSpeed = this.baseSpeed * speedMultiplier * dashMultiplier;
      context.tilemap.resolveMovement(this, movement.x * moveSpeed * dt, movement.y * moveSpeed * dt);
    }
  }

  draw(ctx, camera) {
    const drawX = Math.round(this.x - camera.x);
    const drawY = Math.round(this.y - camera.y);
    const shielded = this.shieldTimeLeft > 0;
    const stunned = this.stunTimeLeft > 0;

    ctx.save();
    ctx.fillStyle = this.active ? this.color : "#5b6474";
    ctx.fillRect(drawX, drawY, this.width, this.height);

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(drawX + 4, drawY + 4, this.width - 8, 6);
    ctx.fillStyle = "#111318";
    ctx.fillRect(drawX + 6, drawY + 12, 4, 4);
    ctx.fillRect(drawX + this.width - 10, drawY + 12, 4, 4);

    if (shielded) {
      ctx.strokeStyle = "#8cc8ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX - 2, drawY - 2, this.width + 4, this.height + 4);
    }

    if (stunned) {
      ctx.fillStyle = "#fde68a";
      ctx.fillRect(drawX + 6, drawY - 7, 12, 4);
    }

    const hpRatio = this.hp / this.maxHp;
    ctx.fillStyle = "#0b0e13";
    ctx.fillRect(drawX, drawY - 10, this.width, 5);
    ctx.fillStyle = hpRatio > 0.45 ? "#22c55e" : "#ef5b5b";
    ctx.fillRect(drawX + 1, drawY - 9, Math.max(0, (this.width - 2) * hpRatio), 3);
    ctx.restore();
  }
}
