import { CHARACTER_DATA } from "../characters/character-data.js";

function characterSummary(character) {
  if (!character) {
    return `
      <div class="pixel-card lobby-card-compact">
        <p class="text-sm text-slate-300">No character created yet.</p>
        <p class="mt-1 text-sm text-amber-300">Create one before entering any room.</p>
      </div>
    `;
  }

  const data = CHARACTER_DATA[character.className];
  return `
    <div class="pixel-card lobby-card-compact">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Current Character</p>
          <p class="mt-1 text-lg font-semibold text-slate-100">${character.name}</p>
          <p class="mt-1 text-sm text-slate-300">${data.label}</p>
        </div>
        <div class="sprite-preview" style="background-color:${data.color}33"></div>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-300">
        <p>HP: ${data.hp}</p>
        <p>ATK: ${data.attack}</p>
        <p>DEF: ${data.defense}</p>
        <p>SPD: ${data.speed}</p>
      </div>
    </div>
  `;
}

export function createLobbyScreen(app) {
  let section;

  return {
    init(root) {
      section = document.createElement("section");
      section.className = "screen lobby-screen";
      root.appendChild(section);
      this.render();
    },

    render() {
      section.innerHTML = `
        <div>
          <p class="pixel-title text-base text-accent">Lobby</p>
          <p class="mt-2 text-sm leading-6 text-slate-300">
            Build a character, tune controls, then host or join a local room.
          </p>
        </div>

        ${characterSummary(app.character)}

        <div class="lobby-actions">
          <button data-action="character" class="pixel-button w-full">Create Character</button>
          <button data-action="room-create" class="pixel-button w-full">Create Room</button>
          <button data-action="room-join" class="pixel-button w-full">Join Room</button>
          <button data-action="settings" class="pixel-button secondary w-full">Settings</button>
        </div>

        <div class="pixel-card lobby-notes">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Milestone Status</p>
          <ul class="text-slate-300">
            <li>Lobby and sub-screens are wired with a simple screen manager.</li>
            <li>Character data and settings persist in local storage.</li>
            <li>Start a room to launch the canvas-based combat prototype.</li>
          </ul>
        </div>
      `;

      section.querySelector('[data-action="character"]')?.addEventListener("click", () => app.showScreen("characterCreate"));
      section.querySelector('[data-action="room-create"]')?.addEventListener("click", () =>
        app.ensureCharacter(() => app.showScreen("roomCreate")),
      );
      section.querySelector('[data-action="room-join"]')?.addEventListener("click", () =>
        app.ensureCharacter(() => app.showScreen("roomJoin")),
      );
      section.querySelector('[data-action="settings"]')?.addEventListener("click", () => app.showScreen("settings"));
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
