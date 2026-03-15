import { AssetLoader } from "./asset-loader.js";
import { Camera } from "./camera.js";
import { Player } from "./entities/player.js";
import { Projectile } from "./entities/projectile.js";
import { InputManager } from "./input.js";
import { LocalAdapter } from "./net/local-adapter.js";
import { Renderer } from "./renderer.js";
import { SkillEffectManager } from "./skills/skill-effects.js";
import { aabbIntersect } from "./world/collision.js";
import { TileMap } from "./world/tilemap.js";

const STEP = 1 / 60;

export class Game {
  constructor({ canvas, hudRoot, room, settings, t, classLabel, mapLabel, onExit }) {
    this.canvas = canvas;
    this.hudRoot = hudRoot;
    this.room = room;
    this.settings = settings;
    this.t = t;
    this.classLabel = classLabel;
    this.mapLabel = mapLabel;
    this.onExit = onExit;
    this.renderer = new Renderer(canvas);
    this.camera = new Camera(canvas.width, canvas.height);
    this.effectManager = new SkillEffectManager();
    this.assetLoader = new AssetLoader();
    this.adapter = new LocalAdapter(room);
    this.projectiles = [];
    this.players = [];
    this.running = false;
    this.accumulator = 0;
    this.lastTime = 0;
    this.hudRefreshLeft = 0;
    this.frameHandle = 0;
    this.loop = this.loop.bind(this);
  }

  async init() {
    await this.assetLoader.loadAll();
    this.tilemap = await TileMap.load(this.room.map || "/maps/arena.json");
    this.input = new InputManager(this.settings.controls);
    this.input.attach();

    const roomState = this.adapter.init();
    this.players = roomState.players.map((player, index) => {
      const spawn = this.tilemap.getSpawnPoint(index);
      return new Player({
        id: player.id,
        name: player.name,
        className: player.className,
        x: spawn.x,
        y: spawn.y,
        inputProfile: player.inputProfile || `player${index + 1}`,
      });
    });

    this.hudRefreshLeft = 0;
    this.updateHud();
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.frameHandle = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameHandle);
    this.input?.detach();
  }

  loop(timestamp) {
    if (!this.running) {
      return;
    }

    const delta = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    this.accumulator += delta;

    while (this.accumulator >= STEP) {
      this.update(STEP);
      this.accumulator -= STEP;
    }

    this.draw();
    this.frameHandle = requestAnimationFrame(this.loop);
  }

  update(dt) {
    const context = {
      input: this.input,
      tilemap: this.tilemap,
      players: this.players,
      effectManager: this.effectManager,
      spawnProjectile: (config) => this.spawnProjectile(config),
      checkOverlap: aabbIntersect,
    };

    this.players.forEach((player) => player.update(dt, context));
    this.projectiles.forEach((projectile) => projectile.update(dt, context));
    this.projectiles = this.projectiles.filter((projectile) => projectile.active);
    this.effectManager.update(dt);
    this.adapter.sync(this.players);
    this.hudRefreshLeft -= dt;

    const focusTarget = this.players[0] ?? { x: 0, y: 0, width: 0, height: 0 };
    this.camera.setViewport(this.canvas.width, this.canvas.height);
    this.camera.follow(focusTarget, this.tilemap.pixelWidth, this.tilemap.pixelHeight);
    if (this.hudRefreshLeft <= 0) {
      this.hudRefreshLeft = 0.15;
      this.updateHud();
    }
  }

  draw() {
    this.renderer.render({
      camera: this.camera,
      tilemap: this.tilemap,
      players: this.players,
      projectiles: this.projectiles,
      effectManager: this.effectManager,
    });
  }

  spawnProjectile(config) {
    const projectile = new Projectile({
      id: `projectile-${crypto.randomUUID()}`,
      ...config,
    });
    this.projectiles.push(projectile);
  }

  updateHud() {
    const playerCards = this.players
      .map((player) => {
        const skills = player.skills
          .map((skill, index) => {
            const cooling = skill.cooldownLeft > 0;
            return `
              <div class="pixel-card skill-slot ${cooling ? "cooling" : ""}">
                <p class="text-xs text-slate-400">${index + 1}. ${skill.key === "skill4" ? this.t("hud.specialSkill") : this.t("hud.baseSkill")}</p>
                <p class="mt-1 font-semibold text-slate-100">${this.t(skill.nameKey ?? skill.name)}</p>
                <p class="mt-2 text-xs text-slate-300">${cooling ? this.t("hud.cooldown", { seconds: skill.cooldownLeft.toFixed(1) }) : this.t(skill.descriptionKey ?? skill.description)}</p>
              </div>
            `;
          })
          .join("");

        const hpRatio = Math.max(0, (player.hp / player.maxHp) * 100);
        return `
          <article class="pixel-card hud-card">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${player.inputProfile}</p>
                <p class="text-lg font-semibold">${player.name}</p>
                <p class="text-sm text-slate-300">${this.classLabel(player.className)}</p>
              </div>
              <div class="status-pill ${player.active ? "ready" : "waiting"}">
                ${player.active ? this.t("hud.alive") : this.t("hud.respawning")}
              </div>
            </div>
            <div class="mt-4 bar"><span style="width: ${hpRatio}%"></span></div>
            <div class="mt-3 grid gap-2 md:grid-cols-2">${skills}</div>
          </article>
        `;
      })
      .join("");

    this.hudRoot.innerHTML = `
      <div class="mini-grid">${playerCards}</div>
      <aside class="mini-grid">
        <article class="pixel-card hud-card">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${this.t("hud.arena")}</p>
          <p class="mt-2 text-lg font-semibold">${this.room.name}</p>
          <p class="mt-2 text-sm text-slate-300">${this.t("hud.map", { map: this.mapLabel(this.room.mapLabel || "Arena") })}</p>
          <p class="mt-3 text-sm text-slate-300">${this.t("hud.controlHint")}</p>
        </article>
        <article class="pixel-card hud-card">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${this.t("hud.session")}</p>
          <p class="mt-2 text-sm text-slate-300">${this.t("hud.playerCount", { count: this.players.length })}</p>
          <p class="mt-2 text-sm text-slate-300">${this.t("hud.mode")}</p>
          <button id="leave-match-button" class="pixel-button secondary mt-4 w-full">${this.t("hud.returnLobby")}</button>
        </article>
      </aside>
    `;

    this.hudRoot.querySelector("#leave-match-button")?.addEventListener("click", () => {
      this.stop();
      this.onExit?.();
    });
  }
}
