# State And Storage

## State หลักในแอป

เก็บใน `js/main.js`

- `character`: ตัวละครที่ผู้เล่นสร้างล่าสุด
- `rooms`: รายการห้องที่มีอยู่ในเครื่อง
- `settings`: เสียงและ key bindings
- `currentRoom`: ห้องที่กำลังอยู่ใน waiting state
- `game`: instance ของ `Game` เมื่อเริ่มแมตช์แล้ว

## localStorage Keys

- `pixel-arena-character`
- `pixel-arena-rooms`
- `pixel-arena-settings`

## Character Shape

```js
{
  name: "Ari",
  className: "warrior",
  hairColor: "#7a4a28",
  hairStyle: "bob"
}
```

## Room Shape

```js
{
  id: "room-xxxx",
  name: "Arena Room",
  maxPlayers: 2,
  map: "/maps/arena.json",
  mapLabel: "Arena",
  ownerId: "local-host",
  status: "waiting",
  players: [
    {
      id: "player-xxxx",
      name: "Ari",
      className: "warrior",
      ready: false,
      owner: "local",
      inputProfile: "player1"
    }
  ]
}
```

## Settings Shape

```js
{
  audio: {
    master: 70,
    sfx: 80,
    bgm: 55
  },
  controls: {
    player1: {
      up: "KeyW",
      down: "KeyS",
      left: "KeyA",
      right: "KeyD",
      run: "ShiftLeft",
      skill1: "Digit1",
      skill2: "Digit2",
      skill3: "Digit3",
      skill4: "Digit4"
    },
    player2: {
      up: "ArrowUp",
      down: "ArrowDown",
      left: "ArrowLeft",
      right: "ArrowRight",
      run: "Enter",
      skill1: "KeyU",
      skill2: "KeyI",
      skill3: "KeyO",
      skill4: "KeyP"
    }
  }
}
```

## Runtime Game State

เมื่อเริ่มแมตช์ `Game` จะสร้าง runtime state แยกจาก persisted app state:
- `players`
- `projectiles`
- `effectManager`
- `tilemap`
- `input`
- `camera`

เหตุผล:
- game loop ต้องการ object ที่ update ได้ทุก frame
- app state ฝั่ง lobby ไม่ควรถูก mutation ด้วย logic ระดับ frame

## ข้อจำกัดปัจจุบัน

- room list ยังเป็น local-only
- currentRoom ยังไม่มี reconciliation กับ backend จริง
- save format ยังไม่มี versioning

## ควรทำต่อ

- เพิ่ม schema version ให้ localStorage
- แยก serialization/deserialization helper ออกจาก `main.js`
- ทำ migration path สำหรับ save format ที่เปลี่ยนในอนาคต
