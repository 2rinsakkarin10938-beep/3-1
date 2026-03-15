import { Elysia, t } from "elysia";

const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || "*";

const rooms = new Map();
const roomSockets = new Map();

function now() {
  return new Date().toISOString();
}

function createRoomId() {
  return `room-${crypto.randomUUID().slice(0, 8)}`;
}

function summarizeRoom(room) {
  return {
    id: room.id,
    name: room.name,
    map: room.map,
    mapLabel: room.mapLabel,
    maxPlayers: room.maxPlayers,
    status: room.status,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    playerCount: room.players.length,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      className: player.className,
      ready: player.ready,
      inputProfile: player.inputProfile ?? null,
    })),
  };
}

function getSocketGroup(roomId) {
  if (!roomSockets.has(roomId)) {
    roomSockets.set(roomId, new Set());
  }

  return roomSockets.get(roomId);
}

function broadcast(roomId, type, payload) {
  const sockets = roomSockets.get(roomId);
  if (!sockets?.size) {
    return;
  }

  const message = JSON.stringify({ type, payload });
  sockets.forEach((socket) => socket.send(message));
}

function upsertRoom(room) {
  room.updatedAt = now();
  rooms.set(room.id, room);
  broadcast(room.id, "room:update", summarizeRoom(room));
  return room;
}

function findRoom(roomId) {
  return rooms.get(roomId) ?? null;
}

function createSeedRooms() {
  if (rooms.size > 0) {
    return;
  }

  const seededRoom = {
    id: createRoomId(),
    name: "Arena Alpha",
    map: "./maps/arena.json",
    mapLabel: "Arena",
    maxPlayers: 4,
    status: "waiting",
    createdAt: now(),
    updatedAt: now(),
    players: [],
  };

  rooms.set(seededRoom.id, seededRoom);
}

createSeedRooms();

const createRoomBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 24 }),
  maxPlayers: t.Numeric({ minimum: 2, maximum: 4 }),
  map: t.Optional(t.String()),
  mapLabel: t.Optional(t.String()),
});

const joinRoomBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 16 }),
  className: t.Union([t.Literal("warrior"), t.Literal("mage"), t.Literal("rogue")]),
  inputProfile: t.Optional(t.String()),
});

const readyBody = t.Object({
  playerId: t.String(),
  ready: t.Boolean(),
});

const app = new Elysia()
  .onBeforeHandle(({ set }) => {
    set.headers["Access-Control-Allow-Origin"] = corsOrigin;
    set.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type";
  })
  .options("/*", () => "ok")
  .get("/", () => ({
    name: "pixel-arena-server",
    runtime: "elysia",
    status: "ok",
  }))
  .get("/health", () => ({
    status: "ok",
    timestamp: now(),
    roomCount: rooms.size,
  }))
  .get("/api/rooms", () => ({
    rooms: Array.from(rooms.values()).map((room) => summarizeRoom(room)),
  }))
  .post(
    "/api/rooms",
    ({ body, set }) => {
      const room = {
        id: createRoomId(),
        name: body.name,
        map: body.map || "./maps/arena.json",
        mapLabel: body.mapLabel || "Arena",
        maxPlayers: Number(body.maxPlayers),
        status: "waiting",
        createdAt: now(),
        updatedAt: now(),
        players: [],
      };

      upsertRoom(room);
      set.status = 201;
      return summarizeRoom(room);
    },
    { body: createRoomBody },
  )
  .get("/api/rooms/:roomId", ({ params, set }) => {
    const room = findRoom(params.roomId);
    if (!room) {
      set.status = 404;
      return { error: "Room not found" };
    }

    return summarizeRoom(room);
  })
  .post(
    "/api/rooms/:roomId/join",
    ({ params, body, set }) => {
      const room = findRoom(params.roomId);
      if (!room) {
        set.status = 404;
        return { error: "Room not found" };
      }

      if (room.players.length >= room.maxPlayers) {
        set.status = 409;
        return { error: "Room is full" };
      }

      const player = {
        id: `player-${crypto.randomUUID().slice(0, 8)}`,
        name: body.name,
        className: body.className,
        ready: false,
        inputProfile: body.inputProfile ?? null,
      };

      room.players.push(player);
      upsertRoom(room);
      set.status = 201;
      return { room: summarizeRoom(room), player };
    },
    { body: joinRoomBody },
  )
  .post(
    "/api/rooms/:roomId/ready",
    ({ params, body, set }) => {
      const room = findRoom(params.roomId);
      if (!room) {
        set.status = 404;
        return { error: "Room not found" };
      }

      const player = room.players.find((entry) => entry.id === body.playerId);
      if (!player) {
        set.status = 404;
        return { error: "Player not found" };
      }

      player.ready = body.ready;
      room.status = room.players.length > 0 && room.players.every((entry) => entry.ready) ? "ready" : "waiting";
      upsertRoom(room);
      return summarizeRoom(room);
    },
    { body: readyBody },
  )
  .ws("/ws/rooms/:roomId", {
    open(socket) {
      const roomId = socket.data.params.roomId;
      const room = findRoom(roomId);
      if (!room) {
        socket.send(JSON.stringify({ type: "error", payload: { message: "Room not found" } }));
        socket.close();
        return;
      }

      getSocketGroup(roomId).add(socket);
      socket.send(JSON.stringify({ type: "room:snapshot", payload: summarizeRoom(room) }));
      broadcast(roomId, "room:presence", { roomId, connections: getSocketGroup(roomId).size });
    },
    message(socket, message) {
      const roomId = socket.data.params.roomId;

      let parsed;
      try {
        parsed = typeof message === "string" ? JSON.parse(message) : message;
      } catch {
        socket.send(JSON.stringify({ type: "error", payload: { message: "Invalid JSON" } }));
        return;
      }

      if (parsed?.type === "ping") {
        socket.send(JSON.stringify({ type: "pong", payload: { timestamp: now() } }));
        return;
      }

      if (parsed?.type === "player-state") {
        broadcast(roomId, "player-state", parsed.payload ?? {});
      }
    },
    close(socket) {
      const roomId = socket.data.params.roomId;
      const sockets = roomSockets.get(roomId);
      sockets?.delete(socket);

      if (sockets && sockets.size === 0) {
        roomSockets.delete(roomId);
      } else {
        broadcast(roomId, "room:presence", { roomId, connections: sockets?.size ?? 0 });
      }
    },
  })
  .listen(port);

console.log(`Elysia server running at http://localhost:${app.server?.port ?? port}`);
