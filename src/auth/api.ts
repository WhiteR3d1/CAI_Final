import type { SaveData } from '../game/types.ts'

export interface User { uid: string; name: string; username: string }
export interface Session { token: string; user: User; expiresAt: number }
export interface Snapshot { revision: number; save: SaveData | null }
export interface Health { registration: boolean }
const URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyuROkK8JTpyUS5y3xty1NmjuZXoou1-LpEeSMLFpuNobEZwa0RThmw5xyAKsu9enXS_Q/exec'
export class ApiError extends Error {
  code: string
  constructor(code: string) { super(code); this.code = code }
}
const messages: Record<string, string> = {
  AUTH: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือหมดเวลาเข้าสู่ระบบ กรุณาเข้าใหม่',
  SETUP: 'ยังไม่ได้ติดตั้งระบบบัญชีใน Apps Script ตามคู่มือ SETUP.md',
  SERVER: 'ระบบชีตยังไม่พร้อม กรุณาลองอีกครั้งหรือติดต่อครู',
  NETWORK: 'ติดต่อระบบบันทึกไม่ได้ กรุณาตรวจ URL /exec และสิทธิ์ Web app (Anyone) กับครู แล้วลองอีกครั้ง',
  BUSY: 'ระบบกำลังบันทึกข้อมูล กรุณารอสักครู่แล้วลองอีกครั้ง',
  PASSWORD: 'รหัสผ่านต้องมีอย่างน้อย 10 ตัว และยาวไม่เกิน 72 ไบต์ (ภาษาไทยใช้หลายไบต์)',
  USERNAME: 'ชื่อผู้ใช้นี้ไม่พร้อมใช้งาน กรุณาเลือกชื่ออื่น',
  RATE: 'ลองใช้งานถี่เกินไป กรุณารอ 15 นาที',
  CLOSED: 'ครูยังไม่เปิดรับสมัครบัญชีใหม่',
  INVALID: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจชื่อผู้ใช้และข้อมูลที่กรอก',
  SIZE: 'ข้อมูลร้านมีขนาดเกินที่ระบบรองรับ กรุณาติดต่อครู',
  CONFLICT: 'มีข้อมูลใหม่ในชีตจากอีกหน้าต่างหรืออีกเครื่อง ระบบหยุดเขียนทับแล้ว',
}
export function errorMessage(e: unknown) { return messages[e instanceof ApiError ? e.code : 'NETWORK'] || messages.SERVER }
export async function api<T>(action?: string, body: Record<string, unknown> = {}): Promise<T> {
  try {
    const response = await fetch(URL, action ? {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, action }), redirect: 'follow', signal: AbortSignal.timeout(45000),
    } : { redirect: 'follow', signal: AbortSignal.timeout(20000) })
    const text = await response.text()
    let result
    try { result = JSON.parse(text) } catch { throw new ApiError('SETUP') }
    if (result.protocol !== 'boot-bloom-v1') throw new ApiError('SETUP')
    if (!result.ok) throw new ApiError(result.error || 'SERVER')
    return result.data as T
  } catch (e) { if (e instanceof ApiError) throw e; throw new ApiError('NETWORK') }
}
