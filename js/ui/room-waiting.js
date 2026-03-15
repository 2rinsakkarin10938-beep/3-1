import { CHARACTER_DATA } from "../characters/character-data.js";

function playerRow(player, isHostPlayer) {
  const data = CHARACTER_DATA[player.className];
  return `
    <article class="pixel-card">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-lg font-semibold">${player.name}</p>
          <p class="mt-1 text-sm text-slate-300">${data.label}</p>
          <p class="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">${player.inputProfile || "observer"}</p>
        </div>
        <div class="status-pill ${player.ready ? "ready" : "waiting"}">
          ${player.ready ? "ready" : "not ready"}
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-3">
        <button data-toggle-ready="${player.id}" class="pixel-button ${player.ready ? "danger" : "success"}">
          ${player.ready ? "Cancel" : "Ready"}
        </button>
        ${
          !isHostPlayer
            ? `<button data-remove-player="${player.id}" class="pixel-button secondary">Remove</button>`
            : ""
        }
      </div>
    </article>
  `;
}

export function createRoomWaitingScreen(app) {
  let section;

  return {
    init(root) {
      section = document.createElement("section");
      section.className = "screen";
      root.appendChild(section);
      this.render();
    },

    render() {
      if (!app.currentRoom) {
        section.innerHTML = `
          <div class="pixel-card">
            <p class="text-sm text-slate-300">No active room selected.</p>
            <button data-action="back" class="pixel-button mt-4">Back To Lobby</button>
          </div>
        `;
        section.querySelector('[data-action="back"]')?.addEventListener("click", () => app.showScreen("lobby"));
        return;
      }

      const playersMarkup = app.currentRoom.players
        .map((player) => playerRow(player, player.inputProfile === "player1"))
        .join("");

      section.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pixel-title text-base text-accent">Waiting Room</p>
            <p class="mt-3 text-sm text-slate-300">${app.currentRoom.name} • ${app.currentRoom.players.length}/${app.currentRoom.maxPlayers} players</p>
          </div>
          <button data-action="back" class="pixel-button secondary">Back</button>
        </div>

        <div class="pixel-card">
          <p class="text-sm text-slate-300">
            Ready every player before starting. The prototype supports two controllable local players; extra slots remain visible for future networking.
          </p>
        </div>

        <div class="grid gap-3">${playersMarkup}</div>

        <div class="grid gap-3 md:grid-cols-2">
          <button
            data-action="add-player"
            class="pixel-button"
            ${app.currentRoom.players.length >= app.currentRoom.maxPlayers ? "disabled" : ""}
          >
            Add Local Player
          </button>
          <button
            data-action="start"
            class="pixel-button success"
            ${app.canStartRoom() ? "" : "disabled"}
          >
            Start Game
          </button>
        </div>
      `;

      section.querySelector('[data-action="back"]')?.addEventListener("click", () => app.showScreen("lobby"));
      section.querySelector('[data-action="add-player"]')?.addEventListener("click", () => app.addLocalGuest());
      section.querySelector('[data-action="start"]')?.addEventListener("click", () => app.startGame());

      section.querySelectorAll("[data-toggle-ready]").forEach((button) => {
        button.addEventListener("click", () => app.toggleReady(button.dataset.toggleReady));
      });

      section.querySelectorAll("[data-remove-player]").forEach((button) => {
        button.addEventListener("click", () => app.removeLocalGuest(button.dataset.removePlayer));
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
