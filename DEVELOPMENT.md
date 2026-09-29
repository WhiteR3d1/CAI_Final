# คู่มือพัฒนา Boot & Bloom

**สถานะ:** เกมจำลองบนเว็บที่สอนตาม**ใบเนื้อหาเรื่องการติดตั้งระบบปฏิบัติการ Windows** (15 หน้า) มี 5 งาน (Claude, 29 กันยายน 2026)

**เอกสารที่เกี่ยวข้อง:**
- HANDOFF.md — ประวัติงาน
- GAME_PLAN.md — ขอบเขตเกม
- COURSE_REFERENCE.md — สรุปใบเนื้อหาทีละหน้า

## คำสั่ง

```sh
npm install
npm run dev     # เปิด URL ที่ Vite แสดงใน terminal (ห้ามเปิดไฟล์ index.html ตรง ๆ)
npm test        # เทสต์ตรรกะคะแนน/ความคืบหน้า และความสอดคล้องของข้อมูลงานกับ sim
npm run lint    # ESLint (ไม่ตรวจโฟลเดอร์ archive/)
npm run build   # tsc + vite build → dist/
```

- เทสต์รันไฟล์ .ts ตรงด้วย `node --test` (ใช้ type stripping ของ Node พัฒนาบน Node 24.14)
- ไฟล์ใน `src/game` และ `src/data` ต้อง import ด้วยนามสกุล `.ts`
- ใช้ได้เฉพาะ syntax ที่ลบ type ได้ เช่น ห้าม enum และ namespace (tsconfig เปิด `erasableSyntaxOnly` ไว้แล้ว)
- ถ้าแก้หลายไฟล์พร้อมกันแล้วหน้าเว็บ error ทั้งที่ `tsc` ผ่าน ให้ reload หน้าเว็บ หรือเซฟไฟล์นั้นอีกครั้ง บางครั้ง Vite จับการเขียนไฟล์ที่เร็วมากไม่ทัน

## โครงสร้าง

```
src/
  game/        ตรรกะล้วน: types, scoring, evidence, progress, storage, audio + GameProvider/gameContext
  data/        jobs/ (งาน 01–05), manual.ts (คู่มือ 5 ตอนตามใบเนื้อหา), people.ts, decor.ts
  components/  UI กลาง: Icon, Avatar, Modal, RichText, KnowledgeView, Bits
  screens/     Hud, Shop + ShopScene, Manual, Results
    workbench/ โต๊ะซ่อม: Workbench, runState, runContext (useRun), CasePanel, Intake, Learn, Wrapup, Fact, Drawer
  sims/
    common/    จอ, KeyPad, POST (ปิดการจับเวลาได้), BIOS (แบบ uefi/legacy), Boot menu
    desktop/   Windows จำลอง: Desktop, Browser (+ แถบดาวน์โหลด), File Explorer, Settings (Windows Update แบบมี Restart)
    windows/   หน้าจอติดตั้งที่ใช้ร่วมกัน: Rufus, WinSetup, Oobe, EvidenceAsk, media.ts (ข้อมูลกลาง)
    makeUsb/ biosBoot/ installNew/ firstSetup/ reinstall/   sim ของแต่ละงาน
tests/         logic.test.ts, content.test.ts
archive/       งานเดิมที่อยู่นอกใบเนื้อหา (ไม่ถูก build) ดู archive/README.md
```

**หลักสำคัญของ `sims/windows/`:**
- คอมโพเนนต์กลางจะ**ไม่บันทึกข้อผิดเอง** แต่แจ้งเหตุการณ์ผ่าน callback เช่น `onArch`, `onTarget`, `onAccount`
- sim ของแต่ละงานเป็นผู้ตัดสินว่าอะไรเป็นข้อผิดของงานนั้น แล้วเรียก `run.mistake('id')` เอง
- เทสต์จึงตรวจ id ได้ทีละโฟลเดอร์งาน

## การทำงานของโต๊ะซ่อม

- **ขั้นของงาน:** รับงาน → เรียนก่อนทำ → ดูตัวอย่าง → ลงมือ → ส่งงาน → สรุป (ขั้นรับผลย้อนกลับเกิดระหว่างลงมือ)
- `Workbench` สร้าง state ของรอบเล่นด้วย `runReducer` แล้วส่ง `RunApi` ผ่าน context ทุกชิ้นเรียกใช้ด้วย `useRun()`
- **API ที่ sim ใช้:**

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `run.setStage(id)` | เลื่อนขั้นย่อย |
| `run.mistake(id, opts)` | บันทึกข้อผิด: major/critical เปิดหน้าต่าง, minor ขึ้นข้อความพี่บูต, `quiet` บันทึกอย่างเดียว |
| `run.check(id)` | บันทึกการตรวจหลังทำ |
| `run.say(...)` | แสดงข้อความพี่บูต |
| `run.log(...)` | บันทึกขั้นที่ทำ |
| `run.alert(...)` | เปิดหน้าต่างข้อความ |
| `run.complete()` | ไปขั้นส่งงาน |

- **หลักฐาน:**
  - ห่อข้อความด้วย `<Fact id>` ให้ผู้เล่นปักลงสมุด
  - ก่อนตัดสินใจสำคัญ ใช้ `EvidenceAsk` ถามหลักฐาน ตัวนี้เรียก `run.reason(id, ok)` ให้เอง
  - sim เป็นคนบันทึก `ev-missing` หรือ `ev-irrelevant`
  - งานที่ถามหลักฐานมี 3 จุด: งาน 01 ตอนกด START ใน Rufus, งาน 03 ตอนเลือก 32/64 บิต, งาน 04 ตอนเลือก Offline account
- **รหัสหลักฐาน:** `wo-` มาจากใบสั่งงาน, `fe-` มาจาก File Explorer, `bs-` มาจากหน้า BIOS (เทสต์ตรวจตาม prefix นี้)

## เพิ่มงานใหม่

1. เพิ่ม id ใน `JobId` (`src/game/types.ts`) แล้วสร้าง `src/data/jobs/<name>.ts`
   - ใส่ `manualNo` ให้ชี้ไปตอนในคู่มือ
   - อ้างอิงเป็น "ใบเนื้อหา หน้า …" (เทสต์บังคับ)
2. เพิ่มงานใน `JOBS` (`src/data/jobs/index.ts`) และลิงก์ในตอนที่เกี่ยวข้องของ `src/data/manual.ts`
3. สร้าง sim ใน `src/sims/<name>/` เป็น component ไม่มี props ที่เรียก `useRun()` แล้วเพิ่มใน `SIMS` (`Workbench.tsx`)
4. เพิ่มโฟลเดอร์ใน `SIM_DIRS` (`tests/content.test.ts`) ถ้าใช้ prefix หลักฐานใหม่ ให้เพิ่มใน `EVIDENCE_ID`
5. รัน `npm test`

## คะแนนและรางวัล

| รายการ | กติกา (`src/game/scoring.ts`, `progress.ts`) |
|---|---|
| คะแนนวิชา | เฉลี่ยเกณฑ์ที่งานนั้นใช้ (ความถูกต้อง, เหตุผลและหลักฐาน, การรักษาข้อมูลและความปลอดภัย, การทดสอบหลังแก้) เป็น 0–100 |
| เหตุผลและหลักฐาน | สัดส่วนการแนบหลักฐานถูกในครั้งแรก รวมกับคำถามสรุปที่ตอบถูกครั้งแรก |
| การทดสอบหลังแก้ | สัดส่วนการตรวจที่จำเป็นที่ทำจริง |
| หักคะแนน | ข้อผิดแต่ละชนิดหักครั้งเดียวตามตาราง `PENALTY` |
| ดาว | 3 = ≥85 และไม่มีข้อผิดร้ายแรง, 2 = ≥60, 1 = ต่ำกว่านั้น |
| เหรียญ | ค่าจ้าง × ดาว/3 ปัดหลักสิบ จ่ายเฉพาะส่วนที่ดีกว่าเดิม รวมไม่เกินค่าจ้าง |
| ชื่อเสียง/ระดับ | ผลรวมดาวสูงสุด (เต็ม 15): ช่างฝึกหัด 0, ช่างประจำร้าน 5, ช่างมือโปร 10, หัวหน้าช่าง 14 |
| คำใบ้ | ไม่หักคะแนน แสดงจำนวนในสรุปผล |

ผลบันทึกใน localStorage key `boot-bloom:save:v3` (ผลของรุ่นก่อน v2 ไม่ถูกนำมาใช้) ล้างได้ที่ "ผลการฝึก" → "ล้างความคืบหน้า"

## ตรวจด้วยมือ

### ทั่วไป
- [ ] หน้าร้านแสดงงานถัดไปเป็นงาน 01 ของครูแอน กระดานงานมี 5 งาน และงานถัดไปล็อกจนส่งงานก่อนหน้า (หรือเปิดสวิตช์ "เปิดทุกงาน")
- [ ] คู่มือช่างมี 5 ตอนตามใบเนื้อหา และหมวด "เสริมนอกใบเนื้อหา"
- [ ] ระหว่างงาน โลโก้บน HUD ไม่ใช่ปุ่มกลับร้าน ต้องออกผ่านปุ่ม "ออกจากงาน" ซึ่งมีหน้าต่างยืนยัน
- [ ] จอแคบ (~375px) ไม่มี scroll แนวนอน

### งาน 01 ทำแฟลชไดรฟ์ติดตั้ง Windows 10
- [ ] Browser: ค้นหา rufus → เว็บ rufus.ie → ดาวน์โหลด rufus-3.4.exe → มีแถบดาวน์โหลดด้านล่าง
- [ ] กด "เสียบแฟลชไดรฟ์ของครูแอน" → This PC เห็น KINGSTON (F:) → ดับเบิลคลิกเข้าไป (เช็ก "เครื่องเห็น USB") และปักหลักฐานได้
- [ ] เปิด Rufus จากแถบดาวน์โหลดหรือ Downloads
  - ช่อง Device ตั้งต้นเป็น SHOP-TOOLS (E:)
  - มี Partition scheme 3 แบบตามใบเนื้อหา
- [ ] กด START ครั้งแรกจะถามหลักฐาน คำตอบที่ถูกคือแฟลชไดรฟ์ 16 GB และเครื่อง BIOS แบบเก่า
- [ ] ข้อผิดที่ต้องขึ้น:
  - Device เป็น E: → ข้อผิดร้ายแรงและย้อนกลับได้
  - เลือก GPT/UEFI → ข้อผิด
  - เลือก ISO Ubuntu → ข้อผิด
  - เลือก ISO Office → ขึ้นว่า not bootable
- [ ] ทางถูก: F: + MBR for BIOS or UEFI + ISO Windows 10 → READY → เปิด WIN10_TH (F:) เห็นไฟล์ติดตั้ง → ส่งงาน

### งาน 02 ตั้งค่า BIOS ให้บูตจาก USB
- [ ] เปิดเครื่อง → POST ไม่จับเวลา (ติ๊กให้จับเวลา 7 วินาทีได้) → กด F2
- [ ] ถ้าปล่อยให้บูตต่อ ต้องขึ้น "Reboot and Select proper Boot device"
- [ ] BIOS แบบ legacy มีแท็บ Main/Advanced/Power/Boot/Security/Exit → Boot → Hard Disk Drives → 1st Drive = USB
- [ ] ข้อผิดที่ต้องขึ้น:
  - เลือก Disabled → ข้อผิดเล็ก
  - ออกแบบ Discard/Quit without saving → ข้อผิด แล้วเครื่องบูตแบบเดิม
- [ ] F10 → Ok → เห็น Windows Boot Manager พร้อมกล่อง "บูตจาก USB สำเร็จ" → ส่งงาน

### งาน 03 ติดตั้ง Windows 10 ลงเครื่องห้องแล็บ
- [ ] เปิดเครื่อง → ปล่อยบูต (หรือ F12 เลือก USB) → Windows Boot Manager
- [ ] เลือก 32/64 ครั้งแรกจะถามหลักฐาน (RAM 2 GB) ถ้าเลือก 64-bit จะเป็นข้อผิด
- [ ] หน้าภาษา: ถ้า Time and currency ไม่เป็น Thai (Thailand) → ข้อผิดเล็ก
- [ ] Product Key:
  - พิมพ์ผิด → The product key didn't work
  - มีปุ่ม "พิมพ์ตามสติกเกอร์"
  - กด I don't have a product key → ข้อผิด
- [ ] License → Custom (ถ้าเลือก Upgrade → ข้อผิด)
- [ ] ขั้นสร้างพาร์ทิชัน:
  - กด Next ที่ Unallocated โดยไม่สร้าง → ข้อผิด part-size
  - New → 102400 → Apply → OK → มี System Reserved + Partition 2 → Next
  - ขนาดที่ยอมรับอยู่ระหว่าง 95–110 GB
- [ ] ตอน Press any key ห้ามกด (ถ้ากด → ข้อผิด) → เข้าหน้า region → ส่งงาน

### งาน 04 ตั้งค่าเริ่มต้นและอัปเดต Windows
- [ ] ภูมิภาคตั้งต้นเป็น United States ต้องเลือก Thailand (ถ้าไม่เปลี่ยน → ข้อผิดเล็ก)
- [ ] แป้นพิมพ์: US → Add layout → Thai Kedmanee (ถ้ากด Skip → ข้อผิดเล็ก)
- [ ] หน้าบัญชี:
  - ใส่อีเมลหรือกด Create account → ข้อผิด เลือกย้อนกลับ หรือดูขั้น PIN/โทรศัพท์/OneDrive ต่อได้
  - Offline account → ถามหลักฐาน (ใบงานเรื่องบัญชี)
- [ ] ตั้งชื่อ Lab01 และรหัสผ่านสองช่องให้ตรงกัน
  - ชื่ออื่น → ข้อผิดเล็ก
  - ไม่ใส่รหัสผ่าน → ข้อผิดและย้อนกลับ
- [ ] Privacy: ปิด Location และ Advertising ID (ถ้าไม่ปิด → ข้อผิดเล็ก) → Accept
- [ ] เดสก์ท็อป: พิมพ์ Windows Update ในช่องค้นหา → Check for updates → Restart now → กลับมาเห็น You're up to date → ส่งงาน

### งาน 05 ลง Windows ใหม่ ห้ามรูปหาย (งานรวม)
- [ ] ทางถูกตามลำดับ:
  1. สำรองข้อมูลไป E:
  2. Rufus: F: + GPT for UEFI + ISO Windows 10
  3. F2 → Hard Disk Drives → 1st Drive = USB → F10
  4. 64-bit → I don't have a product key → Home → Custom → Partition 3: Windows
  5. ไม่กดปุ่มตอนรีสตาร์ต
  6. OOBE ด้วย Offline account
  7. ตรวจ PHOTOS (D:) และ Windows Update + Restart
- [ ] ข้อผิดที่ต้องขึ้นใน Rufus:
  - ข้ามการสำรองข้อมูล
  - Rufus เลือก E:
  - MBR for BIOS or UEFI → Setup แจ้ง error เรื่อง GPT แล้วต้องทำ USB ใหม่
  - MBR for UEFI → ข้อผิดเล็ก
- [ ] ข้อผิดที่ต้องขึ้นใน Setup:
  - 32-bit
  - รุ่นที่ไม่ใช่ Home
  - Upgrade
  - ลบพาร์ทิชัน PHOTOS (ย้อนกลับได้)
  - ติดตั้งลง PHOTOS
  - ลบพาร์ทิชันระบบ

### หน้าผลการฝึก
- [ ] แสดง 5 งาน และจุดประสงค์ 5 ข้อจากใบเนื้อหา
- [ ] ใช้ "คัดลอกสรุปผล" และ "ดาวน์โหลด .txt" ได้ บรรทัดแรกเป็น "การติดตั้งระบบปฏิบัติการ Windows 10"

## ข้อจำกัดที่รู้

- ยังไม่มีโหมดประเมิน ระบบครู หรือการเก็บผลข้ามเครื่อง
- ไม่บันทึกงานที่ทำค้าง ถ้า reload ระหว่างงานต้องเริ่มงานนั้นใหม่
- ถ้าสคริปต์คลิกชิปหลักฐาน 2 อันในจังหวะเดียวกัน ตัวเลือกหนึ่งจะหาย (คลิกด้วยมือไม่พบ)
- ต้องเปิดผ่าน dev server หรือ `npm run preview` ถ้าเปิดไฟล์ `index.html` หรือ `dist/index.html` ตรง ๆ จะเห็นหน้าว่าง
- ไฟล์ template ที่ไม่ได้ใช้ยังอยู่: `src/assets/*`, `public/icons.svg`
