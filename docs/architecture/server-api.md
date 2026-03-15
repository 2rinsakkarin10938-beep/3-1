# Server API

ฝั่ง server ใช้ ElysiaJS บน Bun และตอนนี้ทำหน้าที่เป็น prototype room service แบบ in-memory

ไฟล์หลัก:
- `server/server.js`
- `server/package.json`

## Runtime

- Framework: ElysiaJS
- Runtime: Bun
- Transport: HTTP + WebSocket

## Environment Variables

ตัวอย่างอยู่ใน `server/.env.example`

- `PORT`: port ของ server
- `CORS_ORIGIN`: allowed origin สำหรับ browser requests

## HTTP Routes

### `GET /`

ใช้เช็กว่า service ตอบสนองอยู่

ตัวอย่าง response:

```json
{
  "name": "pixel-arena-server",
  "runtime": "elysia",
  "status": "ok"
}
```

### `GET /health`

ใช้ health check และดูจำนวนห้องที่อยู่ใน memory

### `GET /api/rooms`

คืนรายการห้องทั้งหมดใน memory

### `POST /api/rooms`

สร้างห้องใหม่

body:

```json
{
  "name": "Arena Room",
  "maxPlayers": 4,
  "map": "./maps/arena.json",
  "mapLabel": "Arena"
}
```

### `GET /api/rooms/:roomId`

ดึงข้อมูลห้องเดียว

### `POST /api/rooms/:roomId/join`

เพิ่ม player เข้า room

body:

```json
{
  "name": "Ari",
  "className": "warrior",
  "inputProfile": "player1"
}
```

### `POST /api/rooms/:roomId/ready`

อัปเดตสถานะ ready ของผู้เล่น

body:

```json
{
  "playerId": "player-xxxx",
  "ready": true
}
```

## WebSocket Route

### `ws /ws/rooms/:roomId`

ใช้สำหรับ room-level real-time events

พฤติกรรมปัจจุบัน:
- ตอน connect จะส่ง `room:snapshot`
- เมื่อจำนวน connection เปลี่ยน จะ broadcast `room:presence`
- รองรับ `ping` -> `pong`
- รองรับ passthrough `player-state` broadcast

## WebSocket Message Shape

server -> client:

```json
{
  "type": "room:snapshot",
  "payload": {}
}
```

client -> server ตัวอย่าง:

```json
{
  "type": "ping"
}
```

หรือ

```json
{
  "type": "player-state",
  "payload": {
    "playerId": "player-1",
    "x": 128,
    "y": 256
  }
}
```

## ข้อจำกัดปัจจุบัน

- state อยู่ใน memory ทั้งหมด
- server restart แล้ว room หาย
- ยังไม่มี auth
- ยังไม่มี host authority หรือ anti-cheat
- ยังไม่มี validation สำหรับ gameplay event ที่ลึกกว่า room flow

## ทิศทางถัดไป

- ให้ `js/net/ws-adapter.js` ใช้ route นี้จริง
- แยก room service ออกจาก transport layer
- เพิ่ม persistence หรือ cache layer
- ออกแบบ message schema สำหรับ match state โดยเฉพาะ
