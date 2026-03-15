# Rooms And Local Multiplayer

## Room Lifecycle

1. ผู้เล่นสร้างหรือเข้าร่วมห้องจาก Lobby
2. แอปสร้าง `currentRoom`
3. Waiting Room ใช้ state นี้ในการ toggle ready
4. เมื่อทุกคน ready host กด Start Game
5. `Game` สร้าง players จาก `room.players`

## Local Multiplayer Model

ไฟล์: `js/net/local-adapter.js`

แนวคิด:
- ใช้ room state ร่วมกันในเครื่องเดียว
- แยก adapter contract ไว้ก่อน เพื่อให้เปลี่ยนไป WebSocket ในอนาคตง่ายขึ้น

## Input Profiles

ตอนนี้มี 2 profile หลัก:
- `player1`
- `player2`

player เพิ่มเติมที่มากกว่า 2 จะยังไม่มี control binding จริงใน prototype ปัจจุบัน

## ทำไมยังเก็บห้องใน localStorage

เหตุผล:
- ทำให้ UI flow ครบก่อนมี backend
- เหมาะกับ milestone แรกที่เน้น interaction ระหว่างหน้าจอ
- ลด complexity เรื่อง network, auth, sync, reconnect

## ขอบเขตที่ยังไม่ทำ

- room ownership จริงผ่าน network
- join/leave events แบบ real-time
- latency handling
- authoritative server
- anti-cheat

## เป้าหมายของ WsAdapter

ไฟล์ placeholder: `js/net/ws-adapter.js`

phase ถัดไปควรรองรับ:
- connect/disconnect lifecycle
- player state sync
- skill event replication
- room membership sync
- start game command จาก host

ฝั่ง server scaffold ปัจจุบันอยู่ที่ `server/server.js` และใช้ ElysiaJS เป็น HTTP/WS runtime
