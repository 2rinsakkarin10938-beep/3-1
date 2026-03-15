import { CHARACTER_DATA } from "../characters/character-data.js";

function classCard(key, isSelected) {
  const data = CHARACTER_DATA[key];
  return `
    <button
      type="button"
      data-class="${key}"
      class="pixel-card class-card text-left ${isSelected ? "is-selected" : ""}"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-lg font-semibold text-slate-100">${data.label}</p>
          <p class="mt-2 text-sm text-slate-300">Special: ${data.specialName}</p>
        </div>
        <div class="sprite-preview" style="background-color:${data.color}33"></div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
        <p>HP: ${data.hp}</p>
        <p>ATK: ${data.attack}</p>
        <p>DEF: ${data.defense}</p>
        <p>SPD: ${data.speed}</p>
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
            <p class="pixel-title text-base text-accent">Character</p>
            <p class="mt-3 text-sm text-slate-300">Choose a class, set a name, and save it to local storage.</p>
          </div>
          <button data-action="back" class="pixel-button secondary">Back</button>
        </div>

        <div class="grid gap-3">${Object.keys(CHARACTER_DATA).map((key) => classCard(key, key === selectedClass)).join("")}</div>

        <label class="pixel-card block">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Character Name</p>
          <input
            id="character-name"
            class="pixel-input mt-3"
            type="text"
            maxlength="16"
            placeholder="Enter a name"
            value="${currentName}"
          />
        </label>

        <button data-action="save" class="pixel-button success w-full">Confirm Character</button>
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
        const name = nameInput.value.trim() || CHARACTER_DATA[selectedClass].label;
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
