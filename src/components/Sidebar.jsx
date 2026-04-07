import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, LogOut, Building2, Settings2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/events',      icon: CalendarDays,    label: 'الفعاليات'    },
  { to: '/members',     icon: Users,           label: 'الأعضاء'      },
  { to: '/communities', icon: Building2,       label: 'المجتمعات'    },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'SU'

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Mobile close button */}
        <button className="sidebar-mobile-close" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <div className="logo-icon">S</div>
            <div className="logo-text">
              <span className="logo-title">سرة</span>
              <span className="logo-sub">إدارة المجتمعات</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">القائمة الرئيسية</span>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} className="nav-icon" />
              {label}
            </NavLink>
          ))}

          <span className="nav-section-label">الإدارة</span>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Settings2 size={18} className="nav-icon" />
            الإعدادات
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">المدير</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn-signout" onClick={handleSignOut}>
            <LogOut size={14} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  )
}
