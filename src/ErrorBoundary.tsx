import { Component, type ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  reload = () => window.location.reload()
  render() {
    if (this.state.failed) return <main role="alert"><h1>เปิดร้านไม่สำเร็จ</h1><p>ลองโหลดหน้าใหม่อีกครั้ง ข้อมูลที่บันทึกไว้จะยังคงอยู่</p><button onClick={this.reload}>โหลดหน้าใหม่</button></main>
    return this.props.children
  }
}
