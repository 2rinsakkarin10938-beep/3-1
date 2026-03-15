import { CHARACTER_DATA } from "../characters/character-data.js";

const PREVIEW_SPRITE = encodeURI("/assets/Eris Esra's Character Template 4.0/16x32/16x32 Walk-Sheet.png");
const FRAME_WIDTH = 16;
const FRAME_HEIGHT = 32;
const FRAME_COUNT = 4;
const DIRECTION_ROW = 1;
const HAIR_PALETTES = [
  { key: "ember", label: "Ember", color: "#7a4a28", shine: "#c98b56", shadow: "#412012" },
  { key: "sun", label: "Sun", color: "#d7a93f", shine: "#f7de8b", shadow: "#7f5619" },
  { key: "rose", label: "Rose", color: "#cb6477", shine: "#f5a4b3", shadow: "#7b3044" },
  { key: "mint", label: "Mint", color: "#4dc6a1", shine: "#aaf2da", shadow: "#1f6956" },
  { key: "violet", label: "Violet", color: "#8164d8", shine: "#c2b5ff", shadow: "#423078" },
  { key: "silver", label: "Silver", color: "#c3cfde", shine: "#f6f8fb", shadow: "#728096" },
];

function classCard(app, key, isSelected) {
  const data = CHARACTER_DATA[key];
  return `
    <button
      type="button"
      data-class="${key}"
      class="pixel-card class-card class-card-compact text-left ${isSelected ? "is-selected" : ""}"
    >
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-base font-semibold text-slate-100">${app.classLabel(key)}</p>
        </div>
        <div class="sprite-preview sprite-preview-compact" style="background-color:${data.color}33"></div>
      </div>
      <div class="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
        <p>${app.t("stat.hp")}: ${data.hp}</p>
        <p>${app.t("stat.attack")}: ${data.attack}</p>
        <p>${app.t("stat.defense")}: ${data.defense}</p>
        <p>${app.t("stat.speed")}: ${data.speed}</p>
      </div>
    </button>
  `;
}

function hairSwatch(swatch, selectedKey) {
  return `
    <button
      type="button"
      data-hair="${swatch.key}"
      class="hair-swatch ${swatch.key === selectedKey ? "is-selected" : ""}"
      aria-label="${swatch.label}"
      title="${swatch.label}"
      style="--swatch-base:${swatch.color};--swatch-shine:${swatch.shine};--swatch-shadow:${swatch.shadow};"
    >
      <span></span>
    </button>
  `;
}

function buildPreviewMarkup(app, state) {
  const definition = CHARACTER_DATA[state.selectedClass];
  const swatch = HAIR_PALETTES.find((entry) => entry.key === state.selectedHairKey) ?? HAIR_PALETTES[0];

  return `
    <div class="character-preview-shell h-full min-h-0 p-4 md:p-6">
      <div class="character-preview-card h-full">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="pixel-title text-base text-mint">${app.t("character.previewTitle")}</p>
            <p class="mt-3 max-w-xl text-sm leading-7 text-slate-300">${app.t("character.previewDescription")}</p>
          </div>
          <div class="flex flex-wrap items-center justify-end gap-2 text-right">
            <span class="status-pill ready">${app.t("character.walking")}</span>
            <span class="status-pill" style="color:${definition.color};border-color:${definition.color};">${app.classLabel(state.selectedClass)}</span>
          </div>
        </div>

        <div class="character-stage mt-5">
          <canvas class="character-stage-canvas" width="960" height="620"></canvas>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
          <div class="pixel-card">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("character.classFocus")}</p>
            <p class="mt-3 text-xl font-semibold text-slate-50">${state.name || app.classLabel(state.selectedClass)}</p>
            <p class="mt-2 text-sm text-slate-300">${app.t(definition.specialNameKey ?? definition.specialName)}</p>
          </div>
          <div class="pixel-card">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("character.hairColor")}</p>
            <div class="mt-3 flex items-center gap-3">
              <span class="hair-chip" style="background:${swatch.color}; box-shadow: inset 0 0 0 2px ${swatch.shine};"></span>
              <div>
                <p class="font-semibold text-slate-100">${swatch.label}</p>
                <p class="text-xs text-slate-400">${swatch.color}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function createPreviewController(app, state) {
  let root;
  let canvas;
  let context;
  let rafId = 0;
  let lastTimestamp = 0;
  let sprite = null;
  const runtime = {
    frameIndex: 0,
    frameTimer: 0,
    actorX: 140,
    actorDirection: 1,
    actorY: 344,
  };

  function getHairPalette() {
    return HAIR_PALETTES.find((entry) => entry.key === state.selectedHairKey) ?? HAIR_PALETTES[0];
  }

  function step(deltaMs) {
    runtime.frameTimer += deltaMs;
    if (runtime.frameTimer >= 140) {
      runtime.frameTimer = 0;
      runtime.frameIndex = (runtime.frameIndex + 1) % FRAME_COUNT;
    }

    runtime.actorX += runtime.actorDirection * deltaMs * 0.12;
    if (runtime.actorX >= 720) {
      runtime.actorDirection = -1;
    } else if (runtime.actorX <= 140) {
      runtime.actorDirection = 1;
    }
  }

  function drawBackdrop(definition) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1b2233");
    gradient.addColorStop(0.55, "#121722");
    gradient.addColorStop(1, "#0a0d14");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = `${definition.color}22`;
    context.beginPath();
    context.arc(canvas.width * 0.3, canvas.height * 0.28, 130, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "rgba(255,255,255,0.03)";
    for (let x = 0; x < canvas.width; x += 40) {
      context.fillRect(x, 0, 1, canvas.height);
    }
    for (let y = 0; y < canvas.height; y += 40) {
      context.fillRect(0, y, canvas.width, 1);
    }

    context.fillStyle = "#111723";
    context.fillRect(0, 420, canvas.width, 200);

    context.fillStyle = `${definition.color}44`;
    for (let x = 60; x < canvas.width - 40; x += 80) {
      context.fillRect(x, 455, 32, 10);
    }

    context.fillStyle = "rgba(255,255,255,0.08)";
    context.fillRect(0, 418, canvas.width, 4);
  }

  function drawHairOverlay(x, y, direction, hairPalette) {
    const scale = 10;
    const originX = x + (direction === 1 ? 34 : 30);
    const originY = y + 54;
    const shapes = direction === 1
      ? [
          [0, 0, 4, 1, hairPalette.shine],
          [-1, 1, 6, 2, hairPalette.color],
          [-2, 3, 7, 2, hairPalette.color],
          [1, 5, 4, 2, hairPalette.shadow],
          [3, 7, 2, 1, hairPalette.shadow],
        ]
      : [
          [0, 0, 4, 1, hairPalette.shine],
          [-1, 1, 6, 2, hairPalette.color],
          [-1, 3, 7, 2, hairPalette.color],
          [0, 5, 4, 2, hairPalette.shadow],
          [-1, 7, 2, 1, hairPalette.shadow],
        ];

    shapes.forEach(([dx, dy, width, height, color]) => {
      context.fillStyle = color;
      context.fillRect(originX + dx * scale, originY + dy * scale, width * scale, height * scale);
    });
  }

  function drawSprite(definition) {
    const direction = runtime.actorDirection === 1 ? 1 : -1;
    const drawX = runtime.actorX;
    const drawY = runtime.actorY;
    const scale = 10;
    const sourceX = runtime.frameIndex * FRAME_WIDTH;
    const sourceY = DIRECTION_ROW * FRAME_HEIGHT;

    context.save();
    if (direction === -1) {
      context.translate(drawX + FRAME_WIDTH * scale, 0);
      context.scale(-1, 1);
    } else {
      context.translate(drawX, 0);
    }

    if (sprite?.complete) {
      context.imageSmoothingEnabled = false;
      context.drawImage(
        sprite,
        sourceX,
        sourceY,
        FRAME_WIDTH,
        FRAME_HEIGHT,
        0,
        drawY,
        FRAME_WIDTH * scale,
        FRAME_HEIGHT * scale,
      );
    } else {
      context.fillStyle = "#efe7da";
      context.fillRect(0, drawY + 48, FRAME_WIDTH * scale, FRAME_HEIGHT * scale - 48);
      context.fillRect(24, drawY + 18, 112, 84);
    }

    context.fillStyle = `${definition.color}33`;
    context.fillRect(18, drawY + 86, 124, 136);
    drawHairOverlay(0, drawY, direction, getHairPalette());
    context.restore();

    context.fillStyle = "rgba(0, 0, 0, 0.32)";
    context.fillRect(drawX + 12, drawY + 298, 136, 18);
  }

  function drawForeground(definition) {
    context.fillStyle = "rgba(255,255,255,0.08)";
    context.fillRect(62, 110, 190, 34);
    context.fillStyle = "#f8fafc";
    context.font = "700 22px 'Google Sans'";
    context.fillText(state.name || app.classLabel(state.selectedClass), 80, 134);

    context.fillStyle = `${definition.color}aa`;
    context.font = "700 18px 'Google Sans'";
    context.fillText(app.classLabel(state.selectedClass), 80, 166);
  }

  function render() {
    if (!context || !canvas) {
      return;
    }

    const definition = CHARACTER_DATA[state.selectedClass];
    drawBackdrop(definition);
    drawSprite(definition);
    drawForeground(definition);
  }

  function tick(timestamp) {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const delta = Math.min(48, timestamp - lastTimestamp);
    lastTimestamp = timestamp;
    step(delta);
    render();
    rafId = window.requestAnimationFrame(tick);
  }

  return {
    mount(nextRoot) {
      root = nextRoot;
      root.innerHTML = buildPreviewMarkup(app, state);
      canvas = root.querySelector(".character-stage-canvas");
      context = canvas?.getContext("2d");
      if (sprite === null) {
        sprite = new Image();
        sprite.src = PREVIEW_SPRITE;
      }
      this.render();
      window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(tick);
      window.advanceTime = (ms) => {
        step(ms);
        render();
      };
      window.render_game_to_text = () =>
        JSON.stringify({
          mode: "character-create",
          name: state.name || app.classLabel(state.selectedClass),
          className: state.selectedClass,
          hairColor: getHairPalette().color,
          actor: {
            x: Math.round(runtime.actorX),
            y: runtime.actorY,
            direction: runtime.actorDirection === 1 ? "right" : "left",
            frame: runtime.frameIndex,
          },
          coordinateSystem: "origin top-left, x rightward, y downward",
        });
    },

    render() {
      if (!root) {
        return;
      }
      root.innerHTML = buildPreviewMarkup(app, state);
      canvas = root.querySelector(".character-stage-canvas");
      context = canvas?.getContext("2d");
      render();
    },

    unmount() {
      window.cancelAnimationFrame(rafId);
      if (window.advanceTime) {
        delete window.advanceTime;
      }
      if (window.render_game_to_text) {
        delete window.render_game_to_text;
      }
      if (root) {
        root.innerHTML = "";
      }
    },
  };
}

export function createCharacterCreateScreen(app) {
  let section;
  const state = {
    selectedClass: app.character?.className ?? "warrior",
    selectedHairKey: HAIR_PALETTES.find((entry) => entry.color === app.character?.hairColor)?.key ?? HAIR_PALETTES[0].key,
    name: app.character?.name ?? "",
  };
  const previewController = createPreviewController(app, state);

  function syncPreview() {
    previewController.render();
  }

  return {
    init(root) {
      section = document.createElement("section");
      section.className = "screen";
      root.appendChild(section);
      this.render();
      if (app.previewPanel) {
        previewController.mount(app.previewPanel);
      }
    },

    render() {
      section.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pixel-title text-base text-accent">${app.t("character.title")}</p>
            <p class="mt-2 text-xs leading-6 text-slate-300">${app.t("character.description")}</p>
          </div>
          <button data-action="back" class="pixel-button secondary">${app.t("common.back")}</button>
        </div>

        <div class="character-form-grid">
          <div class="character-class-grid">${Object.keys(CHARACTER_DATA).map((key) => classCard(app, key, key === state.selectedClass)).join("")}</div>

          <label class="pixel-card compact-form-card block">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("character.name")}</p>
            <input
              id="character-name"
              class="pixel-input mt-2"
              type="text"
              maxlength="16"
              placeholder="${app.t("character.namePlaceholder")}"
              value="${state.name}"
            />
          </label>

          <div class="pixel-card compact-form-card">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("character.appearance")}</p>
            <div class="mt-2 flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-100">${app.t("character.hairColor")}</p>
                <p class="mt-1 text-[11px] text-slate-400">6 palette presets</p>
              </div>
              <span class="status-pill">${HAIR_PALETTES.find((entry) => entry.key === state.selectedHairKey)?.label}</span>
            </div>
            <div class="mt-3 grid grid-cols-3 gap-2">
              ${HAIR_PALETTES.map((entry) => hairSwatch(entry, state.selectedHairKey)).join("")}
            </div>
          </div>
        </div>

        <button data-action="save" class="pixel-button success w-full">${app.t("character.confirm")}</button>
      `;

      section.querySelectorAll("[data-class]").forEach((button) => {
        button.addEventListener("click", () => {
          state.selectedClass = button.dataset.class;
          this.render();
          syncPreview();
        });
      });

      section.querySelector("#character-name")?.addEventListener("input", (event) => {
        state.name = event.target.value;
        syncPreview();
      });

      section.querySelectorAll("[data-hair]").forEach((button) => {
        button.addEventListener("click", () => {
          state.selectedHairKey = button.dataset.hair;
          this.render();
          syncPreview();
        });
      });

      section.querySelector('[data-action="back"]')?.addEventListener("click", () => app.showScreen("lobby"));
      section.querySelector('[data-action="save"]')?.addEventListener("click", () => {
        const name = state.name.trim() || app.classLabel(state.selectedClass);
        const selectedHair = HAIR_PALETTES.find((entry) => entry.key === state.selectedHairKey) ?? HAIR_PALETTES[0];
        app.setCharacter({
          name,
          className: state.selectedClass,
          hairColor: selectedHair.color,
        });
      });
    },

    show() {
      this.render();
      section.classList.add("active");
      syncPreview();
    },

    hide() {
      section.classList.remove("active");
      previewController.unmount();
    },
  };
}
