# UI Flow

## เป้าหมายของ flow

ผู้เล่นทุกคนต้องเข้า Lobby ก่อนเสมอ จากนั้นค่อยไปยัง flow การสร้างตัวละครและห้อง

## Screen List

### Lobby

ไฟล์: `js/ui/lobby.js`

หน้าที่:
- เป็นหน้าแรกของแอป
- แสดงตัวละครปัจจุบัน
- เป็น entry point ไปยังทุก flow อื่น

ปุ่มหลัก:
- Create Character
- Create Room
- Join Room
- World Chat
- Settings

## Character Create

ไฟล์: `js/ui/character-create.js`

รองรับ:
- เลือก class: Warrior, Mage, Rogue
- ตั้งชื่อตัวละคร
- save ลง `localStorage`

## Room Create

ไฟล์: `js/ui/room-create.js`

รองรับ:
- ตั้งชื่อห้อง
- เลือกจำนวนผู้เล่นสูงสุด
- เลือก map

ผลลัพธ์:
- สร้าง room object
- ใส่ host player เข้า room
- พาไป Waiting Room

## Room Join

ไฟล์: `js/ui/room-join.js`

รองรับ:
- แสดงรายการห้องจาก `localStorage`
- กด join เพื่อเข้า waiting room

หมายเหตุ:
- ตอนนี้เป็น local prototype จึงยังไม่ใช่ room discovery จาก network จริง

## Room Waiting

ไฟล์: `js/ui/room-waiting.js`

รองรับ:
- แสดงรายชื่อผู้เล่น
- toggle ready / cancel
- เพิ่ม local guest player
- remove guest player
- start game เมื่อทุกคน ready

ข้อจำกัดปัจจุบัน:
- รองรับ player ที่ควบคุมได้จริง 2 คน
- slot มากกว่า 2 ยังเป็น placeholder สำหรับ phase ต่อไป

## Settings

ไฟล์: `js/ui/settings.js`

รองรับ:
- เปลี่ยนภาษา ไทย / อังกฤษ
- save ลง `localStorage`

## World Chat

ไฟล์: `js/ui/chat.js`

รองรับ:
- ดึงข้อความล่าสุดจาก server
- subscribe real-time ผ่าน WebSocket
- ส่งข้อความในช่อง public ร่วมกันทุกคน

## Screen Switching Contract

ทุกหน้าจอใช้ contract เดียวกัน:

```js
{
  init(root),
  render(),
  show(),
  hide()
}
```

ข้อดี:
- predictable
- ง่ายต่อการเพิ่มหน้าใหม่
- ไม่ต้องพึ่ง framework router
