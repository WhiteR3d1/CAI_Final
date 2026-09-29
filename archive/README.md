# งานเก็บถาวร (ไม่ถูก build และไม่ถูก lint)

ย้ายมาเมื่อ 29 ก.ย. 2026 ตอนผู้ใช้สั่งให้เปลี่ยนเนื้อหาเกมเป็นใบเนื้อหาเรื่องการติดตั้ง Windows งานเหล่านี้อยู่นอกใบเนื้อหาจึงถอดออกจากเกม แต่เก็บโค้ดไว้เผื่อผู้ใช้อยากนำกลับมา

| ไฟล์ | เดิมคือ |
|---|---|
| `data/jobs/chooseOs.ts`, `sims/chooseOs/` | งาน 01 เตรียมเครื่องให้สำนักงานบัญชี (เลือก OS) |
| `data/jobs/noSound.ts`, `sims/noSound/` | งาน 03 สื่อการสอนไม่มีเสียง (ไดรเวอร์) |
| `data/jobs/meetingAudio.ts`, `sims/meetingAudio/` | งาน 04 ประชุมออนไลน์ไม่ได้ยินเสียง |
| `sims/desktop/DeviceManager.tsx`, `Dxdiag.tsx`, `RunDialog.tsx`, `SoundControls.tsx`, `sims/audio.css` | หน้าจอที่ใช้เฉพาะงานข้างบน |

## นำกลับมาใช้

1. ย้ายไฟล์กลับไปไว้ที่เดิมใต้ `src/`
2. เพิ่ม id กลับเข้า `JobId` ใน `src/game/types.ts`
3. เพิ่มงานใน `src/data/jobs/index.ts` และใน `SIMS` ของ `src/screens/workbench/Workbench.tsx`
4. เพิ่มโฟลเดอร์ใน `SIM_DIRS` ของ `tests/content.test.ts`

ระหว่างนั้นโค้ดส่วนกลางเปลี่ยนไปแล้ว จึงต้องแก้เพิ่ม:
- `JobDef` มีฟิลด์ `manualNo`
- `UpdatePage` และ `Desktop` เปลี่ยน props
- คู่มือเปลี่ยนเป็น 5 ตอนตามใบเนื้อหา
