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
            <p class="pixel-title text-base text-accent">${app.t("roomCreate.title")}</p>
            <p class="mt-3 text-sm text-slate-300">${app.t("roomCreate.description")}</p>
          </div>
          <button data-action="back" class="pixel-button secondary">${app.t("common.back")}</button>
        </div>

        <label class="pixel-card block">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("roomCreate.roomName")}</p>
          <input id="room-name" class="pixel-input mt-3" type="text" maxlength="20" value="${app.t("roomCreate.defaultName")}" />
        </label>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="pixel-card block">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("roomCreate.maxPlayers")}</p>
            <select id="room-size" class="mt-3">
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </label>

          <label class="pixel-card block">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("roomCreate.map")}</p>
            <select id="room-map" class="mt-3">
              <option value="/maps/arena.json">${app.mapLabel("Arena")}</option>
            </select>
          </label>
        </div>

        <button data-action="create" class="pixel-button success w-full">${app.t("roomCreate.button")}</button>
      `;

      section.querySelector('[data-action="back"]')?.addEventListener("click", () => app.showScreen("lobby"));
      section.querySelector('[data-action="create"]')?.addEventListener("click", () => {
        const roomName = section.querySelector("#room-name").value.trim() || app.t("roomCreate.defaultName");
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
