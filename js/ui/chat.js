const CHAT_ALIAS_KEY = "pixel-arena-chat-alias";
const MAX_MESSAGES = 100;

function escapeTime(value, locale) {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "--:--";
  }
}

function normalizeMessage(message) {
  return {
    id: message.id,
    author: message.author,
    text: message.text,
    className: message.className ?? null,
    createdAt: message.createdAt,
  };
}

function upsertMessages(list, incoming) {
  const next = [...list];
  const entries = Array.isArray(incoming) ? incoming : [incoming];

  entries.forEach((entry) => {
    if (!entry?.id) {
      return;
    }

    const index = next.findIndex((message) => message.id === entry.id);
    const normalized = normalizeMessage(entry);
    if (index === -1) {
      next.push(normalized);
      return;
    }

    next[index] = normalized;
  });

  next.sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
  return next.slice(-MAX_MESSAGES);
}

export function createChatScreen(app) {
  let section;
  let feedElement;
  let statusElement;
  let formElement;
  let aliasInput;
  let messageInput;
  let mounted = false;
  let retryTimer = null;
  let socket = null;
  let sending = false;
  let connectionState = "idle";
  let messages = [];
  let historyLoaded = false;
  let historyLoading = false;
  let draftAlias = app.character?.name ?? localStorage.getItem(CHAT_ALIAS_KEY) ?? "";

  function updateConnectionLabel() {
    if (!statusElement) {
      return;
    }

    const key =
      connectionState === "connected"
        ? "chat.status.connected"
        : connectionState === "connecting"
          ? "chat.status.connecting"
          : "chat.status.disconnected";

    statusElement.textContent = app.t(key);
  }

  function scrollFeedToBottom() {
    if (!feedElement) {
      return;
    }

    feedElement.scrollTop = feedElement.scrollHeight;
  }

  function renderMessages() {
    if (!feedElement) {
      return;
    }

    feedElement.textContent = "";

    if (!messages.length) {
      const empty = document.createElement("div");
      empty.className = "chat-empty";
      empty.textContent = app.t("chat.empty");
      feedElement.appendChild(empty);
      return;
    }

    messages.forEach((message) => {
      const article = document.createElement("article");
      article.className = "chat-message pixel-card";

      const header = document.createElement("div");
      header.className = "chat-message-head";

      const author = document.createElement("p");
      author.className = "chat-message-author";
      author.textContent = message.author;

      const meta = document.createElement("div");
      meta.className = "chat-message-meta";

      if (message.className) {
        const classTag = document.createElement("span");
        classTag.className = "status-pill waiting";
        classTag.textContent = app.classLabel(message.className);
        meta.appendChild(classTag);
      }

      const time = document.createElement("span");
      time.className = "chat-message-time";
      time.textContent = escapeTime(message.createdAt, app.settings.language);
      meta.appendChild(time);

      header.append(author, meta);

      const body = document.createElement("p");
      body.className = "chat-message-body";
      body.textContent = message.text;

      article.append(header, body);
      feedElement.appendChild(article);
    });

    scrollFeedToBottom();
  }

  async function loadHistory() {
    if (historyLoading) {
      return;
    }

    historyLoading = true;
    try {
      const response = await fetch(app.apiUrl("/api/chat/world"));
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      messages = upsertMessages([], payload.messages ?? []);
      historyLoaded = true;
      renderMessages();
    } catch (error) {
      console.warn("Unable to load world chat history", error);
    } finally {
      historyLoading = false;
    }
  }

  function scheduleReconnect() {
    if (!mounted || retryTimer) {
      return;
    }

    retryTimer = window.setTimeout(() => {
      retryTimer = null;
      connectSocket();
    }, 2000);
  }

  function connectSocket() {
    if (!mounted || socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    connectionState = "connecting";
    updateConnectionLabel();

    socket = new WebSocket(app.websocketUrl("/ws/chat/world"));
    socket.addEventListener("open", () => {
      connectionState = "connected";
      updateConnectionLabel();
    });

    socket.addEventListener("message", (event) => {
      try {
        const packet = JSON.parse(event.data);
        if (packet.type === "world:snapshot") {
          messages = upsertMessages([], packet.payload?.messages ?? []);
          renderMessages();
          return;
        }

        if (packet.type === "world:message") {
          messages = upsertMessages(messages, packet.payload);
          renderMessages();
        }
      } catch (error) {
        console.warn("Unable to parse world chat message", error);
      }
    });

    socket.addEventListener("close", () => {
      connectionState = "disconnected";
      updateConnectionLabel();
      socket = null;
      scheduleReconnect();
    });

    socket.addEventListener("error", () => {
      connectionState = "disconnected";
      updateConnectionLabel();
    });
  }

  function teardownSocket() {
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }

    if (socket) {
      socket.close();
      socket = null;
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (sending || !messageInput || !aliasInput) {
      return;
    }

    const author = aliasInput.value.trim() || app.character?.name || app.t("chat.guestName");
    const text = messageInput.value.trim();
    if (!text) {
      return;
    }

    sending = true;
    aliasInput.value = author;
    draftAlias = author;
    localStorage.setItem(CHAT_ALIAS_KEY, author);

    try {
      const payload = {
        author,
        text,
      };

      if (app.character?.className) {
        payload.className = app.character.className;
      }

      const response = await fetch(app.apiUrl("/api/chat/world"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const responseData = await response.json();
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        messages = upsertMessages(messages, responseData.message);
        renderMessages();
      }

      messageInput.value = "";
    } catch (error) {
      console.warn("Unable to send world chat message", error);
    } finally {
      sending = false;
    }
  }

  function bindDomReferences() {
    feedElement = section.querySelector("#world-chat-feed");
    statusElement = section.querySelector("#world-chat-status");
    formElement = section.querySelector("#world-chat-form");
    aliasInput = section.querySelector("#world-chat-alias");
    messageInput = section.querySelector("#world-chat-message");
    if (aliasInput) {
      aliasInput.value = draftAlias;
    }

    formElement?.addEventListener("submit", sendMessage);
    section.querySelector('[data-action="back"]')?.addEventListener("click", () => app.showScreen("lobby"));
    updateConnectionLabel();
    renderMessages();
  }

  return {
    init(root) {
      section = document.createElement("section");
      section.className = "screen chat-screen";
      root.appendChild(section);
      this.render();
    },

    render() {
      section.innerHTML = `
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="pixel-title text-base text-accent">${app.t("chat.title")}</p>
            <p class="mt-3 text-sm text-slate-300">${app.t("chat.description")}</p>
          </div>
          <button data-action="back" class="pixel-button secondary">${app.t("common.back")}</button>
        </div>

        <div class="chat-shell">
          <div class="chat-toolbar pixel-card">
            <div>
              <p class="chat-toolbar-label">${app.t("chat.channel")}</p>
              <p class="chat-toolbar-value">${app.t("chat.worldChannel")}</p>
            </div>
            <div class="text-right">
              <p class="chat-toolbar-label">${app.t("chat.statusLabel")}</p>
              <p id="world-chat-status" class="chat-toolbar-value">${app.t("chat.status.connecting")}</p>
            </div>
          </div>

          <div id="world-chat-feed" class="chat-feed"></div>

          <form id="world-chat-form" class="chat-compose pixel-card">
            <label class="chat-field">
              <span class="chat-field-label">${app.t("chat.name")}</span>
              <input
                id="world-chat-alias"
                class="pixel-input"
                type="text"
                maxlength="16"
                placeholder="${app.t("chat.namePlaceholder")}"
              />
            </label>

            <label class="chat-field chat-field-message">
              <span class="chat-field-label">${app.t("chat.message")}</span>
              <input
                id="world-chat-message"
                class="pixel-input"
                type="text"
                maxlength="240"
                placeholder="${app.t("chat.messagePlaceholder")}"
              />
            </label>

            <button type="submit" class="pixel-button success">${app.t("chat.send")}</button>
          </form>
        </div>
      `;

      bindDomReferences();
    },

    show() {
      mounted = true;
      this.render();
      if (!historyLoaded && !historyLoading) {
        loadHistory();
      }
      connectSocket();
      section.classList.add("active");
    },

    hide() {
      mounted = false;
      teardownSocket();
      section.classList.remove("active");
    },
  };
}
