# Pixel Arena Prototype

2D top-down pixel art multiplayer prototype built with Vite, Tailwind CSS, and Vanilla JS.

frontend ตอนนี้ใช้ multi-page flow แบบไฟล์ HTML แยกจริง ไม่ใช่ SPA หน้าเดียว

สถานะปัจจุบัน:
- มี Lobby flow ครบ: สร้างตัวละคร, สร้างห้อง, เข้าร่วมห้อง, ห้องรอ, ตั้งค่า
- มีเมนู `Chat โลก` สำหรับคุยกันผ่าน server แบบ real-time
- เก็บ character, room list, settings ไว้ใน `localStorage`
- เริ่มเกมแบบ local multiplayer ได้จากห้องรอ
- มี movement 8 ทิศ, วิ่ง, collision, base skills 3 แบบ และ class special
- รองรับ 2 ภาษา: ไทย / อังกฤษ
- ใช้ renderer แบบ pixel-block fallback ได้แม้ยังไม่มี sprite asset จริง

## Run

frontend รันผ่าน Vite

```bash
npm install
cd server && bun install && cd ..
npm run dev
```

แล้วเปิด `http://localhost:5173`

หมายเหตุ:
- source frontend ยังอยู่ใน `index.html`, `css/`, `js/`, `maps/`
- Vite ใช้ `vite.config.js` เพื่อ copy `maps/` และ `assets/` เข้า `dist/` ตอน build
- คำสั่ง `npm run dev` ที่ root จะรันทั้ง frontend และ server พร้อมกัน

## Server

ฝั่ง online/server scaffold ใช้ ElysiaJS และ Bun อยู่ใน `server/`

ตัวอย่าง:

```bash
cd server
bun install
bun run dev
```

## Deploy

deploy production ใช้ `docker-compose.yml` ที่ root repo

services:
- `web`: Caddy สำหรับ serve static multi-page frontend จาก source files และ reverse proxy `/api` กับ `/ws`
- `server`: ElysiaJS/Bun backend

workflow ที่ [deploy.yml](/home/apichart/3-1/.github/workflows/deploy.yml) ต้องอาศัย DNS ของ domain ชี้มาที่ VPS และเครื่องต้องเปิด `80/443`
โดย compose stack นี้จะ bind หน้าเว็บไว้ที่ `127.0.0.1:8080` เพื่อให้ reverse proxy หลักบน VPS รับ `gamev1.apichart.dev` แล้วส่งต่อเข้ามา

## Controls

- Player 1: `WASD`, `Shift`, `1 2 3 4`
- Player 2: `Arrow Keys`, `Enter`, `U I O P`

## Project Structure

```text
3-1/
├── package.json
├── vite.config.js
├── index.html
├── chat.html
├── character.html
├── room-create.html
├── room-join.html
├── room-waiting.html
├── settings.html
├── game.html
├── css/
├── assets/
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
