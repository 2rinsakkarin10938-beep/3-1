# Docs Index

พื้นที่นี้ใช้เก็บความรู้ของโปรเจกต์แบบแยกหมวด เพื่อให้ขยายเกมต่อได้โดยไม่ต้องย้อนอ่านโค้ดทุกครั้ง

## โครงสร้าง

```text
docs/
├── architecture/   # ภาพรวมระบบ, game loop, networking, state
├── features/       # พฤติกรรมระดับ feature และ flow ฝั่งผู้เล่น
├── development/    # วิธีเริ่มงาน, roadmap, วิธีตรวจงาน
├── reference/      # file map, module contract, glossary
├── templates/      # template สำหรับ docs/ADR/feature note
└── decisions/      # เก็บ decision log / ADR ในอนาคต
```

## เอกสารที่มี

- [architecture/overview.md](/home/apichart/3-1/docs/architecture/overview.md)
- [architecture/server-api.md](/home/apichart/3-1/docs/architecture/server-api.md)
- [architecture/state-and-storage.md](/home/apichart/3-1/docs/architecture/state-and-storage.md)
- [features/ui-flow.md](/home/apichart/3-1/docs/features/ui-flow.md)
- [features/combat-and-skills.md](/home/apichart/3-1/docs/features/combat-and-skills.md)
- [features/rooms-and-local-multiplayer.md](/home/apichart/3-1/docs/features/rooms-and-local-multiplayer.md)
- [development/getting-started.md](/home/apichart/3-1/docs/development/getting-started.md)
- [development/testing.md](/home/apichart/3-1/docs/development/testing.md)
- [development/contributing.md](/home/apichart/3-1/docs/development/contributing.md)
- [development/roadmap.md](/home/apichart/3-1/docs/development/roadmap.md)
- [reference/file-map.md](/home/apichart/3-1/docs/reference/file-map.md)
- [reference/module-contracts.md](/home/apichart/3-1/docs/reference/module-contracts.md)
- [reference/glossary.md](/home/apichart/3-1/docs/reference/glossary.md)
- [templates/decision-template.md](/home/apichart/3-1/docs/templates/decision-template.md)
- [templates/feature-note-template.md](/home/apichart/3-1/docs/templates/feature-note-template.md)
- [decisions/README.md](/home/apichart/3-1/docs/decisions/README.md)

## หลักการเขียน docs

- เขียนตามของจริงใน repo ก่อน แล้วค่อยแยกหัวข้อ `Current` กับ `Planned`
- ถ้าพบข้อจำกัดหรือ workaround ในโค้ด ให้บันทึกไว้ใน docs ทันที
- ถ้ามีการเปลี่ยน flow, data shape, controls หรือ contract ของ module ให้แก้ docs ในรอบเดียวกับ code change
- สำหรับ decision ที่มี tradeoff ชัดเจน ให้เพิ่มไฟล์ใหม่ใน `docs/decisions/`

## แนวทางตั้งชื่อไฟล์

- ใช้ kebab-case
- หนึ่งไฟล์ต่อหนึ่งประเด็นหลัก
- ชื่อไฟล์ควรสื่อว่าตอบคำถามอะไร เช่น `state-and-storage.md`, `combat-and-skills.md`
