Original prompt: ตอนนี้เราจะออกแบบ character โดยแก้หน้าใหม่ เป็นการสร้างตัวละคร โดยจะออกแบบให้เป็นการสร้างตัวละครอกแบบสีผม และได้ตัวละครมาเดิน โดยมี asset ที่อัพให้แล้ว

- 2026-03-15: Identified `character.html` + `js/ui/character-create.js` as the main integration point for the new character creator flow.
- 2026-03-15: Chose the `Eris Esra` 16x32 walk sheet for a lightweight live preview because it already contains a clean multi-frame walking animation.
- 2026-03-15: Planned to store customization on the character object, keeping room/game flows backward compatible by only adding optional fields.
- 2026-03-15: Rebuilt `js/ui/character-create.js` into a full customizer with class cards, name input, hair-color presets, and a live walking stage in the right preview panel.
- 2026-03-15: Added `hairColor` persistence to the character profile and documented the updated shape in `docs/architecture/state-and-storage.md`.
- 2026-03-15: Verified with the Playwright skill client that class switching and hair-color switching both update the preview canvas and `render_game_to_text`.
- 2026-03-15: The bundled Playwright harness hangs after artifact capture in this environment, so test runs were wrapped with a timeout and validated via generated screenshots/state files.
- TODO: If we want the hair swatch grid visible without any scrolling at 1280x720, compress the left panel a little more or move the swatches higher in the form.
