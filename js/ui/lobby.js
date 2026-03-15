function characterStatus(app, character) {
  if (!character) {
    return app.t("lobby.noCharacterHint");
  }

  return app.t("lobby.characterStatus", {
    name: character.name,
    className: app.classLabel(character.className),
  });
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
        <div class="cyber-menu">
          <div class="cyber-logo">
            <p class="cyber-kicker">NETRUN // LOCAL BUILD</p>
            <p class="pixel-title cyber-title">GAMEV1</p>
            <p class="cyber-subtitle">${app.t("lobby.description")}</p>
          </div>

          <div class="cyber-menu-buttons">
            <button data-action="character" class="pixel-button cyber-button w-full">${app.t("lobby.createCharacter")}</button>
            <button data-action="room-create" class="pixel-button cyber-button w-full">${app.t("lobby.createRoom")}</button>
            <button data-action="room-join" class="pixel-button cyber-button w-full">${app.t("lobby.joinRoom")}</button>
            <button data-action="chat" class="pixel-button cyber-button w-full">${app.t("lobby.worldChat")}</button>
            <button data-action="settings" class="pixel-button cyber-button secondary w-full">${app.t("common.settings")}</button>
          </div>

          <div class="cyber-status">
            <span class="cyber-status-label">${app.t("lobby.currentCharacter")}</span>
            <p class="cyber-status-value">${characterStatus(app, app.character)}</p>
          </div>
        </div>
      `;

      section.querySelector('[data-action="character"]')?.addEventListener("click", () => app.showScreen("characterCreate"));
      section.querySelector('[data-action="room-create"]')?.addEventListener("click", () =>
        app.ensureCharacter(() => app.showScreen("roomCreate")),
      );
      section.querySelector('[data-action="room-join"]')?.addEventListener("click", () =>
        app.ensureCharacter(() => app.showScreen("roomJoin")),
      );
      section.querySelector('[data-action="chat"]')?.addEventListener("click", () => app.showScreen("chat"));
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
