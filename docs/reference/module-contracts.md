# Module Contracts

เอกสารนี้สรุป contract ระหว่าง module สำคัญ เพื่อให้ refactor แล้วไม่หลุด interface

## Screen Contract

ใช้โดย `js/main.js`

```js
{
  init(root),
  render(),
  show(),
  hide()
}
```

ข้อกำหนด:
- `init(root)` ต้อง append DOM ของ screen ตัวเอง
- `show()` ควร call `render()` ถ้าหน้าจอต้องอิง state ล่าสุด
- `hide()` ต้องไม่ลบ DOM ทิ้ง

## InputManager Contract

ไฟล์: `js/input.js`

method หลัก:

```js
attach()
detach()
isDown(profile, action)
consumePress(profile, action)
getMovementVector(profile)
```

ข้อกำหนด:
- `consumePress()` ต้องคืนค่า `true` แค่ครั้งเดียวต่อ key press
- `getMovementVector()` ต้อง normalize diagonal

## Skill Contract

ไฟล์: `js/skills/skill.js`

```js
new Skill({
  key,
  name,
  cooldown,
  description
})
```

method หลัก:

```js
tick(dt)
canUse()
use(owner, context)
execute(owner, context)
```

ข้อกำหนด:
- skill ลูกควร override `execute()`
- `execute()` ต้องคืน boolean ว่าใช้สำเร็จหรือไม่
- cooldown จะถูกตั้งเมื่อ `execute()` สำเร็จเท่านั้น

## Player Runtime Contract

ไฟล์: `js/entities/player.js`

field สำคัญ:
- `id`
- `name`
- `className`
- `inputProfile`
- `hp`, `maxHp`
- `skills`
- `active`

method สำคัญ:
- `update(dt, context)`
- `takeDamage(amount, source)`
- `applyShield(seconds)`
- `applyStun(seconds)`
- `teleport(x, y, tilemap)`
- `facingVector()`

## TileMap Contract

ไฟล์: `js/world/tilemap.js`

method หลัก:

```js
TileMap.load(path)
collidesRect(x, y, width, height)
resolveMovement(entity, dx, dy)
getSpawnPoint(index)
drawBackground(ctx, camera)
drawForeground(ctx, camera)
```

ข้อกำหนด:
- `collidesRect()` ต้อง treat out-of-bounds เป็นชน
- `resolveMovement()` ต้องแยกแกน X/Y

## Network Adapter Direction

ปัจจุบันยังไม่ enforce ด้วย base class แต่ intent คือ:

```js
init()
sync(players)
onPlayerJoin(handler)
getRemoteState()
```

เป้าหมาย:
- `LocalAdapter` และ `WsAdapter` ควรใช้ contract เดียวกัน
- `Game` ไม่ควรรู้รายละเอียด transport
