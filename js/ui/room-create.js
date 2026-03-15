export function createRoomCreateScreen(app) {
  let section;

  return {
    init(root) {
      section = document.createElement("section");
      section.className = "screen";
      root.appendChild(section);
      this.render();
    },

    render() {
      section.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pixel-title text-base text-accent">Create Room</p>
            <p class="mt-3 text-sm text-slate-300">Set up a waiting room, then add a second local player before starting.</p>
          </div>
          <button data-action="back" class="pixel-button secondary">Back</button>
        </div>

        <label class="pixel-card block">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Room Name</p>
          <input id="room-name" class="pixel-input mt-3" type="text" maxlength="20" value="Arena Room" />
        </label>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="pixel-card block">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Max Players</p>
            <select id="room-size" class="mt-3">
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </label>

          <label class="pixel-card block">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Map</p>
            <select id="room-map" class="mt-3">
              <option value="/maps/arena.json">Arena</option>
            </select>
          </label>
        </div>

        <button data-action="create" class="pixel-button success w-full">Create Room</button>
      `;

      section.querySelector('[data-action="back"]')?.addEventListener("click", () => app.showScreen("lobby"));
      section.querySelector('[data-action="create"]')?.addEventListener("click", () => {
        const roomName = section.querySelector("#room-name").value.trim() || "Arena Room";
        const maxPlayers = section.querySelector("#room-size").value;
        const map = section.querySelector("#room-map").value;
        app.createRoom({
          name: roomName,
          maxPlayers,
          map,
          mapLabel: "Arena",
        });
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
