import { getCharacterDefinition } from "./characters/character-data.js";
import { Game } from "./game.js";
import { getDefaultBindings } from "./input.js";
import { detectLanguage, translate } from "./i18n.js";
import { createCharacterCreateScreen } from "./ui/character-create.js";
import { createChatScreen } from "./ui/chat.js";
import { createLobbyScreen } from "./ui/lobby.js";
import { createRoomCreateScreen } from "./ui/room-create.js";
import { createRoomJoinScreen } from "./ui/room-join.js";
import { createRoomWaitingScreen } from "./ui/room-waiting.js";
import { createSettingsScreen } from "./ui/settings.js";

const STORAGE_KEYS = {
  character: "pixel-arena-character",
  currentRoom: "pixel-arena-current-room",
  rooms: "pixel-arena-rooms",
  settings: "pixel-arena-settings",
};

const DEFAULT_SETTINGS = {
  language: detectLanguage(),
  audio: {
    master: 70,
    sfx: 80,
    bgm: 55,
  },
  controls: getDefaultBindings(),
};

const DEMO_ROOMS = [
  { id: "arena-alpha", name: "Arena Alpha", maxPlayers: 2, map: "/maps/arena.json", mapLabel: "Arena", players: [] },
  { id: "duel-beta", name: "Duel Beta", maxPlayers: 4, map: "/maps/arena.json", mapLabel: "Arena", players: [] },
];

function resolveApiBase() {
  const configured = (import.meta.env?.VITE_API_BASE ?? "").trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const { protocol, hostname, port } = window.location;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocalhost && port === "5173") {
    return `${protocol}//${hostname}:3000`;
  }

  return "";
}

function resolveWsBase(apiBase) {
  const configured = (import.meta.env?.VITE_WS_BASE ?? "").trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (apiBase) {
    return apiBase.replace(/^http/, "ws");
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

const SCREEN_PATHS = {
  lobby: "/index.html",
  characterCreate: "/character.html",
  chat: "/chat.html",
  roomCreate: "/room-create.html",
  roomJoin: "/room-join.html",
  roomWaiting: "/room-waiting.html",
  settings: "/settings.html",
  game: "/game.html",
};

const SCREEN_CREATORS = {
  lobby: createLobbyScreen,
  characterCreate: createCharacterCreateScreen,
  chat: createChatScreen,
  roomCreate: createRoomCreateScreen,
  roomJoin: createRoomJoinScreen,
  roomWaiting: createRoomWaitingScreen,
  settings: createSettingsScreen,
};

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn(`Unable to load ${key}`, error);
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function mergeSettings(savedSettings) {
  return {
    language: savedSettings?.language ?? DEFAULT_SETTINGS.language,
    audio: {
      ...DEFAULT_SETTINGS.audio,
      ...(savedSettings?.audio ?? {}),
    },
    controls: {
      player1: {
        ...DEFAULT_SETTINGS.controls.player1,
        ...(savedSettings?.controls?.player1 ?? {}),
      },
      player2: {
        ...DEFAULT_SETTINGS.controls.player2,
        ...(savedSettings?.controls?.player2 ?? {}),
      },
    },
  };
}

function cloneCharacter(character, overrides = {}) {
  return {
    id: uid("player"),
    name: character.name,
    className: character.className,
    ready: false,
    owner: "local",
    ...overrides,
  };
}

const pageName = document.body.dataset.page || "lobby";

const app = {
  pageName,
  screenRoot: document.querySelector("#screen-root"),
  canvasShell: document.querySelector("#canvas-shell"),
  previewPanel: document.querySelector("#preview-panel"),
  canvas: document.querySelector("#game-canvas"),
  hudRoot: document.querySelector("#game-hud"),
  character: loadJSON(STORAGE_KEYS.character, null),
  currentRoom: loadJSON(STORAGE_KEYS.currentRoom, null),
  rooms: loadJSON(STORAGE_KEYS.rooms, DEMO_ROOMS),
  settings: mergeSettings(loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS)),
  apiBase: resolveApiBase(),
  wsBase: "",
  game: null,
  currentScreen: null,

  t(key, params) {
    return translate(this.settings.language, key, params);
  },

  classLabel(className) {
    return this.t(`class.${className}.name`);
  },

  classAllyLabel(className) {
    return this.t(`class.${className}.ally`);
  },

  mapLabel(value = "Arena") {
    return value === "Arena" ? this.t("map.arena") : value;
  },

  apiUrl(path) {
    return this.apiBase ? `${this.apiBase}${path}` : path;
  },

  websocketUrl(path) {
    return `${this.wsBase}${path}`;
  },

  pathFor(screenName) {
    return SCREEN_PATHS[screenName] ?? SCREEN_PATHS.lobby;
  },

  applyChromeText() {
    document.documentElement.lang = this.settings.language;
    document.title = this.t("app.windowTitle");
    document.body.dataset.screen = this.pageName;

    const bindings = [
      ["#app-title", this.t("app.title")],
      ["#app-subtitle", this.t("app.subtitle")],
      ["#control-hint-player1", this.t("app.controlHint.player1")],
      ["#control-hint-player2", this.t("app.controlHint.player2")],
      ["#preview-title", this.t("preview.title")],
      ["#preview-description", this.t("preview.description")],
    ];

    bindings.forEach(([selector, text]) => {
      document.querySelector(selector)?.replaceChildren(document.createTextNode(text));
    });
  },

  persistCharacter() {
    saveJSON(STORAGE_KEYS.character, this.character);
  },

  persistCurrentRoom() {
    if (this.currentRoom) {
      saveJSON(STORAGE_KEYS.currentRoom, this.currentRoom);
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentRoom);
    }
  },

  persistRooms() {
    saveJSON(STORAGE_KEYS.rooms, this.rooms);
  },

  persistSettings() {
    saveJSON(STORAGE_KEYS.settings, this.settings);
  },

  setLanguage(language) {
    this.settings.language = language;
    this.persistSettings();
    this.applyChromeText();
    this.refreshScreens();
    this.game?.updateHud();
  },

  navigate(screenName) {
    window.location.href = this.pathFor(screenName);
  },

  showScreen(screenName) {
    if (screenName === this.pageName) {
      this.currentScreen?.render?.();
      return;
    }

    this.navigate(screenName);
  },

  refreshScreens() {
    this.currentScreen?.render?.();
  },

  ensureCharacter(callback) {
    if (this.character) {
      callback();
      return;
    }

    this.navigate("characterCreate");
  },

  setCharacter(character) {
    this.character = character;
    this.persistCharacter();
    this.navigate("lobby");
  },

  createRoom(payload) {
    const room = {
      id: uid("room"),
      name: payload.name,
      maxPlayers: Number(payload.maxPlayers),
      map: payload.map,
      mapLabel: payload.mapLabel,
      ownerId: "local-host",
      status: "waiting",
      players: [cloneCharacter(this.character, { ready: false, inputProfile: "player1" })],
    };
    this.rooms = [room, ...this.rooms.filter((existing) => existing.id !== room.id)];
    this.persistRooms();
    this.enterRoom(room.id);
  },

  enterRoom(roomId) {
    const room = this.rooms.find((entry) => entry.id === roomId);
    if (!room) {
      return;
    }

    const nextRoom = structuredClone(room);
    if (!nextRoom.players.length) {
      nextRoom.players.push(cloneCharacter(this.character, { ready: false, inputProfile: "player1" }));
    } else if (!nextRoom.players.some((player) => player.inputProfile === "player1")) {
      nextRoom.players.unshift(cloneCharacter(this.character, { ready: false, inputProfile: "player1" }));
    }

    this.syncRoom(nextRoom);
    this.navigate("roomWaiting");
  },

  syncRoom(room) {
    this.currentRoom = structuredClone(room);
    this.persistCurrentRoom();
    this.rooms = this.rooms.map((entry) => (entry.id === room.id ? structuredClone(room) : entry));
    this.persistRooms();
    this.refreshScreens();
  },

  toggleReady(playerId) {
    if (!this.currentRoom) {
      return;
    }

    this.currentRoom.players = this.currentRoom.players.map((player) =>
      player.id === playerId ? { ...player, ready: !player.ready } : player,
    );
    this.syncRoom(this.currentRoom);
  },

  addLocalGuest() {
    if (!this.currentRoom || !this.character) {
      return;
    }

    if (this.currentRoom.players.length >= this.currentRoom.maxPlayers) {
      return;
    }

    const options = ["mage", "rogue", "warrior"];
    const nextClass = options[(this.currentRoom.players.length - 1) % options.length];
    this.currentRoom.players.push({
      id: uid("player"),
      name: this.classAllyLabel(nextClass),
      className: nextClass,
      ready: false,
      owner: "local-guest",
      inputProfile: this.currentRoom.players.length === 1 ? "player2" : `player${this.currentRoom.players.length + 1}`,
    });
    this.syncRoom(this.currentRoom);
  },

  removeLocalGuest(playerId) {
    if (!this.currentRoom) {
      return;
    }

    this.currentRoom.players = this.currentRoom.players.filter((player) => player.id !== playerId || player.inputProfile === "player1");
    this.syncRoom(this.currentRoom);
  },

  canStartRoom() {
    return Boolean(this.currentRoom?.players.length) && this.currentRoom.players.every((player) => player.ready);
  },

  startGame() {
    if (!this.currentRoom || !this.canStartRoom()) {
      return;
    }

    this.persistCurrentRoom();
    this.navigate("game");
  },

  async mountScreen() {
    const screenFactory = SCREEN_CREATORS[this.pageName];
    if (!screenFactory || !this.screenRoot) {
      return;
    }

    this.currentScreen = screenFactory(this);
    this.currentScreen.init(this.screenRoot);
    this.currentScreen.show();
  },

  async mountGame() {
    if (!this.currentRoom) {
      this.navigate("lobby");
      return;
    }

    this.canvasShell?.classList.remove("hidden");
    this.previewPanel?.classList.add("hidden");

    this.game?.stop();
    this.game = new Game({
      canvas: this.canvas,
      hudRoot: this.hudRoot,
      room: this.currentRoom,
      settings: this.settings,
      t: this.t.bind(this),
      classLabel: this.classLabel.bind(this),
      mapLabel: this.mapLabel.bind(this),
      onExit: () => {
        this.navigate("lobby");
      },
    });
    await this.game.init();
    this.game.start();
  },
};

app.wsBase = resolveWsBase(app.apiBase);

app.applyChromeText();

if (pageName === "game") {
  await app.mountGame();
} else {
  await app.mountScreen();
}
