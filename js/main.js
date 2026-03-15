import { getCharacterDefinition } from "./characters/character-data.js";
import { Game } from "./game.js";
import { getDefaultBindings } from "./input.js";
import { createCharacterCreateScreen } from "./ui/character-create.js";
import { createLobbyScreen } from "./ui/lobby.js";
import { createRoomCreateScreen } from "./ui/room-create.js";
import { createRoomJoinScreen } from "./ui/room-join.js";
import { createRoomWaitingScreen } from "./ui/room-waiting.js";
import { createSettingsScreen } from "./ui/settings.js";

const STORAGE_KEYS = {
  character: "pixel-arena-character",
  rooms: "pixel-arena-rooms",
  settings: "pixel-arena-settings",
};

const DEFAULT_SETTINGS = {
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

const app = {
  screenRoot: document.querySelector("#screen-root"),
  canvasShell: document.querySelector("#canvas-shell"),
  previewPanel: document.querySelector("#preview-panel"),
  canvas: document.querySelector("#game-canvas"),
  hudRoot: document.querySelector("#game-hud"),
  character: loadJSON(STORAGE_KEYS.character, null),
  rooms: loadJSON(STORAGE_KEYS.rooms, DEMO_ROOMS),
  settings: mergeSettings(loadJSON(STORAGE_KEYS.settings, DEFAULT_SETTINGS)),
  currentRoom: null,
  game: null,
  screens: {},

  persistCharacter() {
    saveJSON(STORAGE_KEYS.character, this.character);
  },

  persistRooms() {
    saveJSON(STORAGE_KEYS.rooms, this.rooms);
  },

  persistSettings() {
    saveJSON(STORAGE_KEYS.settings, this.settings);
  },

  ensureCharacter(callback) {
    if (this.character) {
      callback();
      return;
    }

    this.showScreen("characterCreate");
  },

  setCharacter(character) {
    this.character = character;
    this.persistCharacter();
    this.refreshScreens();
    this.showScreen("lobby");
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

    this.currentRoom = nextRoom;
    this.syncRoom(nextRoom);
    this.showScreen("roomWaiting");
  },

  syncRoom(room) {
    this.currentRoom = structuredClone(room);
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
    const definition = getCharacterDefinition(nextClass);
    this.currentRoom.players.push({
      id: uid("player"),
      name: `${definition.label} Ally`,
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

  async startGame() {
    if (!this.currentRoom || !this.canStartRoom()) {
      return;
    }

    this.canvasShell.classList.remove("hidden");
    this.previewPanel.classList.add("hidden");

    Object.values(this.screens).forEach((screen) => screen.hide());
    this.game?.stop();

    this.game = new Game({
      canvas: this.canvas,
      hudRoot: this.hudRoot,
      room: this.currentRoom,
      settings: this.settings,
      onExit: () => {
        this.canvasShell.classList.add("hidden");
        this.previewPanel.classList.remove("hidden");
        this.showScreen("lobby");
      },
    });
    await this.game.init();
    this.game.start();
  },

  showScreen(name) {
    if (this.game && !this.canvasShell.classList.contains("hidden")) {
      this.game.stop();
      this.canvasShell.classList.add("hidden");
      this.previewPanel.classList.remove("hidden");
    }

    Object.values(this.screens).forEach((screen) => screen.hide());
    this.screens[name].show();
  },

  refreshScreens() {
    Object.values(this.screens).forEach((screen) => screen.render?.());
  },
};

const screens = {
  lobby: createLobbyScreen(app),
  characterCreate: createCharacterCreateScreen(app),
  roomCreate: createRoomCreateScreen(app),
  roomJoin: createRoomJoinScreen(app),
  roomWaiting: createRoomWaitingScreen(app),
  settings: createSettingsScreen(app),
};

app.screens = screens;

Object.values(screens).forEach((screen) => screen.init(app.screenRoot));
app.showScreen("lobby");
