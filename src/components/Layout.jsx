import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="main-content">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="mobile-topbar-logo">
            <div className="logo-icon" style={{ width: '30px', height: '30px', fontSize: '13px' }}>S</div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#f3eeff' }}>سرة</span>
          </div>
        </div>
        <div className="page-wrapper animate-fade">
          {children}
        </div>
      </div>
    </div>
  )
}
