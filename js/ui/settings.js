export function createSettingsScreen(app) {
  let section;
  let draftSettings = structuredClone(app.settings);

  function resetDraft() {
    draftSettings = structuredClone(app.settings);
  }

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
            <p class="pixel-title text-base text-accent">${app.t("settings.title")}</p>
            <p class="mt-3 text-sm text-slate-300">${app.t("settings.description")}</p>
          </div>
          <button data-action="back" class="pixel-button secondary">${app.t("common.back")}</button>
        </div>

        <label class="pixel-card block">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${app.t("settings.language")}</p>
          <select id="app-language" class="mt-3">
            <option value="th" ${draftSettings.language === "th" ? "selected" : ""}>${app.t("common.thai")}</option>
            <option value="en" ${draftSettings.language === "en" ? "selected" : ""}>${app.t("common.english")}</option>
          </select>
        </label>

        <button data-action="save" class="pixel-button success w-full">${app.t("settings.save")}</button>
      `;

      section.querySelector('[data-action="back"]')?.addEventListener("click", () => {
        resetDraft();
        app.showScreen("lobby");
      });

      section.querySelector("#app-language")?.addEventListener("change", (event) => {
        draftSettings.language = event.target.value;
      });

      section.querySelector('[data-action="save"]')?.addEventListener("click", () => {
        app.settings = structuredClone(draftSettings);
        app.setLanguage(app.settings.language);
        app.showScreen("lobby");
      });
    },

    show() {
      resetDraft();
      this.render();
      section.classList.add("active");
    },

    hide() {
      section.classList.remove("active");
    },
  };
}
