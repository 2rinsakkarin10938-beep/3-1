# Roadmap

## Current

prototype ตอนนี้ครอบคลุม milestone แรกและบางส่วนของ milestone ถัดไป:
- Lobby UI
- character creation
- room create / join / waiting
- game canvas
- movement
- collision
- skills
- local multiplayer แบบ same-screen

## Next Priorities

### 1. Sprite And Animation Pass

- โหลด sprite sheet จริง
- directional animation
- walk / run / attack / cast states

### 2. HUD Polish

- skill icons
- cooldown overlay
- HP/MP presentation
- damage numbers

### 3. Map System Upgrade

- support หลาย map
- spawn groups
- decorative foreground layers
- better collision metadata

### 4. Local Multiplayer Upgrade

- support มากกว่า 2 local input profiles
- character select ต่อผู้เล่น
- split camera หรือ camera rule ที่ดีขึ้น

### 5. Online Multiplayer

- implement `ws-adapter.js`
- connect `ws-adapter.js` เข้ากับ Elysia room websocket
- เพิ่ม persistence/auth/rate limit ให้ `server/server.js`
- room sync และ match start ผ่าน network

## Risk Areas

- state management จะซับซ้อนขึ้นเมื่อมี online sync
- collision และ skill hit detection ต้องแยก logic ชัดขึ้นเมื่อเพิ่ม animation
- ถ้าไม่มี save schema versioning จะ migrate ยากเมื่อ state shape เปลี่ยน

## Suggested Engineering Order

1. ทำ sprite/animation ก่อน
2. แยก game state serialization
3. ออกแบบ network message schema
4. ค่อย implement WebSocket room flow
