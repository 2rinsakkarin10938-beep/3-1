# Pixel Arena Prototype

2D top-down pixel art multiplayer prototype built with HTML, Tailwind CSS, and Vanilla JS.

สถานะปัจจุบัน:
- มี Lobby flow ครบ: สร้างตัวละคร, สร้างห้อง, เข้าร่วมห้อง, ห้องรอ, ตั้งค่า
- เก็บ character, room list, settings ไว้ใน `localStorage`
- เริ่มเกมแบบ local multiplayer ได้จากห้องรอ
- มี movement 8 ทิศ, วิ่ง, collision, base skills 3 แบบ และ class special
- ใช้ renderer แบบ pixel-block fallback ได้แม้ยังไม่มี sprite asset จริง

## Run

เปิด `index.html` ใน browser ได้ทันที

หมายเหตุ:
- ถ้าเปิดผ่าน `file://` ระบบจะยังทำงานได้ เพราะ tilemap มี fallback ในโค้ด
- ถ้าต้องการ flow ที่ใกล้ production มากขึ้น ใช้ static server เช่น `python3 -m http.server`

## Server

ฝั่ง online/server scaffold ใช้ ElysiaJS และ Bun อยู่ใน `server/`

ตัวอย่าง:

```bash
cd server
bun install
bun run dev
```

## Controls

- Player 1: `WASD`, `Shift`, `1 2 3 4`
- Player 2: `Arrow Keys`, `Enter`, `U I O P`

## Project Structure

```text
3-1/
├── index.html
├── css/
├── docs/
├── js/
├── maps/
└── server/
```

## Docs

เอกสารหลักอยู่ใน `docs/`

- [docs/README.md](/home/apichart/3-1/docs/README.md): ดัชนีเอกสารและกติกาการเก็บความรู้
- [docs/development/getting-started.md](/home/apichart/3-1/docs/development/getting-started.md): วิธีเริ่มงานและตรวจระบบ
- [docs/architecture/server-api.md](/home/apichart/3-1/docs/architecture/server-api.md): Elysia server routes และ websocket contract
- [docs/architecture/overview.md](/home/apichart/3-1/docs/architecture/overview.md): ภาพรวมสถาปัตยกรรม
- [docs/features/ui-flow.md](/home/apichart/3-1/docs/features/ui-flow.md): Flow ของหน้าจอ
- [docs/features/combat-and-skills.md](/home/apichart/3-1/docs/features/combat-and-skills.md): ระบบ movement, combat, skill
- [docs/development/roadmap.md](/home/apichart/3-1/docs/development/roadmap.md): milestone ถัดไป
