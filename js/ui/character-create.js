import { CHARACTER_DATA } from "../characters/character-data.js";

function classCard(app, key, isSelected) {
  const data = CHARACTER_DATA[key];
  return `
    <button
      type="button"
      data-class="${key}"
      class="pixel-card class-card text-left ${isSelected ? "is-selected" : ""}"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-lg font-semibold text-slate-100">${app.classLabel(key)}</p>
          <p class="mt-2 text-sm text-slate-300">${app.t("character.special")}: ${app.t(data.specialNameKey ?? data.specialName)}</p>
        </div>
        <div class="sprite-preview" style="background-color:${data.color}33"></div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
        <p>${app.t("stat.hp")}: ${data.hp}</p>
        <p>${app.t("stat.attack")}: ${data.attack}</p>
        <p>${app.t("stat.defense")}: ${data.defense}</p>
        <p>${app.t("stat.speed")}: ${data.speed}</p>
      </div>
    </button>
  `;
}

export function createCharacterCreateScreen(app) {
  let section;
  let selectedClass = app.character?.className ?? "warrior";

  return {
    init(root) {
      section = document.createElement("section");
      section.className = "screen";
      root.appendChild(section);
      this.render();
    },

    render() {
      const currentName = app.character?.name ?? "";

      section.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pixel-title text-base text-accent">${app.t("character.title")}</p>
            <p class="mt-3 text-sm text-slate-300">${app.t("character.description")}</p>
          </div>
          <button data-action="back" class="pixel-button secondary">${app.t("common.back")}</button>
        </div>

        <div class="grid gap-3">${Object.keys(CHARACTER_DATA).map((key) => classCard(app, key, key === selectedClass)).join("")}</div>

        <label class="pixel-card block">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("character.name")}</p>
          <input
            id="character-name"
            class="pixel-input mt-3"
            type="text"
            maxlength="16"
            placeholder="${app.t("character.namePlaceholder")}"
            value="${currentName}"
          />
        </label>

        <button data-action="save" class="pixel-button success w-full">${app.t("character.confirm")}</button>
      `;

      section.querySelectorAll("[data-class]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedClass = button.dataset.class;
          this.render();
        });
      });

      section.querySelector('[data-action="back"]')?.addEventListener("click", () => app.showScreen("lobby"));
      section.querySelector('[data-action="save"]')?.addEventListener("click", () => {
        const nameInput = section.querySelector("#character-name");
        const name = nameInput.value.trim() || app.classLabel(selectedClass);
        app.setCharacter({ name, className: selectedClass });
      });
    },

    show() {
      this.render();
      section.classList.add("active");
    },

    hide() {
      section.classList.remove("active");
    },
  };
}
