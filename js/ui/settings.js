function labelForCode(code) {
  return code
    .replace("Key", "")
    .replace("Digit", "")
    .replace("Arrow", "Arrow ")
    .replace("ShiftLeft", "Left Shift")
    .replace("ShiftRight", "Right Shift");
}

export function createSettingsScreen(app) {
  let section;
  let draftSettings = structuredClone(app.settings);
  let rebinding = null;
  let rebindHandler = null;

  function resetDraft() {
    draftSettings = structuredClone(app.settings);
    if (rebindHandler) {
      window.removeEventListener("keydown", rebindHandler, true);
      rebindHandler = null;
    }
    rebinding = null;
  }

  function attachRebinding(button, profile, action, render) {
    button.addEventListener("click", () => {
      rebinding = { profile, action };
      render();
    });
  }

  function renderControlGrid() {
    return Object.entries(draftSettings.controls)
      .map(
        ([profile, bindings]) => `
          <article class="pixel-card">
            <p class="text-sm font-semibold text-slate-100">${profile}</p>
            <div class="mt-4 grid gap-3 md:grid-cols-2">
              ${Object.entries(bindings)
                .map(
                  ([action, code]) => `
                    <div class="pixel-card">
                      <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${action}</p>
                      <button
                        data-bind="${profile}:${action}"
                        class="pixel-button secondary mt-3 w-full"
                      >
                        ${
                          rebinding?.profile === profile && rebinding?.action === action
                            ? "Press any key"
                            : labelForCode(code)
                        }
                      </button>
                    </div>
                  `,
                )
                .join("")}
            </div>
          </article>
        `,
      )
      .join("");
  }

  function listenForKey(render) {
    if (!rebinding || rebindHandler) {
      return;
    }

    rebindHandler = (event) => {
      event.preventDefault();
      draftSettings.controls[rebinding.profile][rebinding.action] = event.code;
      rebinding = null;
      window.removeEventListener("keydown", rebindHandler, true);
      rebindHandler = null;
      render();
    };

    window.addEventListener("keydown", rebindHandler, true);
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
            <p class="pixel-title text-base text-accent">Settings</p>
            <p class="mt-3 text-sm text-slate-300">Audio values and key bindings are saved in local storage.</p>
          </div>
          <button data-action="back" class="pixel-button secondary">Back</button>
        </div>

        <div class="grid gap-3 md:grid-cols-3">
          <label class="pixel-card block">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Master</p>
            <input id="audio-master" class="pixel-slider mt-3" type="range" min="0" max="100" value="${draftSettings.audio.master}" />
          </label>
          <label class="pixel-card block">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">SFX</p>
            <input id="audio-sfx" class="pixel-slider mt-3" type="range" min="0" max="100" value="${draftSettings.audio.sfx}" />
          </label>
          <label class="pixel-card block">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">BGM</p>
            <input id="audio-bgm" class="pixel-slider mt-3" type="range" min="0" max="100" value="${draftSettings.audio.bgm}" />
          </label>
        </div>

        <div class="grid gap-3">
          ${renderControlGrid()}
        </div>

        <button data-action="save" class="pixel-button success w-full">Save Settings</button>
      `;

      section.querySelector('[data-action="back"]')?.addEventListener("click", () => {
        resetDraft();
        app.showScreen("lobby");
      });

      section.querySelector("#audio-master")?.addEventListener("input", (event) => {
        draftSettings.audio.master = Number(event.target.value);
      });
      section.querySelector("#audio-sfx")?.addEventListener("input", (event) => {
        draftSettings.audio.sfx = Number(event.target.value);
      });
      section.querySelector("#audio-bgm")?.addEventListener("input", (event) => {
        draftSettings.audio.bgm = Number(event.target.value);
      });

      section.querySelectorAll("[data-bind]").forEach((button) => {
        const [profile, action] = button.dataset.bind.split(":");
        attachRebinding(button, profile, action, () => this.render());
      });

      listenForKey(() => this.render());

      section.querySelector('[data-action="save"]')?.addEventListener("click", () => {
        app.settings = structuredClone(draftSettings);
        app.persistSettings();
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
