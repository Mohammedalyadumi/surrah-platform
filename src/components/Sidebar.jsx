import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, Users, LogOut, Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/',        icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/events',  icon: CalendarDays,    label: 'الفعاليات'    },
  { to: '/members', icon: Users,           label: 'الأعضاء'      },
]

export default function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'SU'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <div className="logo-icon">S</div>
          <div className="logo-text">
            <span className="logo-title">SUDDA</span>
            <span className="logo-sub">منصة سرة</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-section-label">القائمة الرئيسية</span>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={18} className="nav-icon" />
            {label}
          </NavLink>
        ))}

        <span className="nav-section-label">المجتمع</span>
        <NavLink
          to="/communities"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Building2 size={18} className="nav-icon" />
          المجتمعات
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
  )
}
