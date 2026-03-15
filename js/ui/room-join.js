export function createRoomJoinScreen(app) {
  let section;

  return {
    init(root) {
      section = document.createElement("section");
      section.className = "screen";
      root.appendChild(section);
      this.render();
    },

    render() {
      const roomCards = app.rooms
        .map(
          (room) => `
            <article class="pixel-card">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-lg font-semibold">${room.name}</p>
                  <p class="mt-2 text-sm text-slate-300">${room.players.length}/${room.maxPlayers} players</p>
                  <p class="mt-1 text-sm text-slate-300">Map: ${room.mapLabel || "Arena"}</p>
                </div>
                <div class="status-pill ${room.players.length ? "waiting" : "ready"}">
                  ${room.players.length ? "waiting" : "open"}
                </div>
              </div>
              <button data-room-id="${room.id}" class="pixel-button mt-4 w-full">Join Room</button>
            </article>
          `,
        )
        .join("");

      section.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pixel-title text-base text-accent">Join Room</p>
            <p class="mt-3 text-sm text-slate-300">Rooms are stored locally to support the prototype flow.</p>
          </div>
          <button data-action="back" class="pixel-button secondary">Back</button>
        </div>

        <div class="grid gap-3">
          ${roomCards || '<div class="pixel-card text-sm text-slate-300">No rooms available yet. Create one first.</div>'}
        </div>
      `;

      section.querySelector('[data-action="back"]')?.addEventListener("click", () => app.showScreen("lobby"));
      section.querySelectorAll("[data-room-id]").forEach((button) => {
        button.addEventListener("click", () => app.enterRoom(button.dataset.roomId));
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
