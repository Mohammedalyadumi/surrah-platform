import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, CalendarDays, Users, LogOut, Building2, Settings2, X,
  FileText, CheckSquare, BarChart2, Layers, DollarSign, AlertTriangle, ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const mainNav = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'لوحة التحكم' },
  { to: '/events',      icon: CalendarDays,    label: 'الفعاليات'    },
  { to: '/members',     icon: Users,           label: 'الأعضاء'      },
  { to: '/communities', icon: Building2,       label: 'المجتمعات'    },
]

const eventSubNav = (id) => [
  { to: `/events/${id}`,          icon: LayoutDashboard, label: 'الملخص',          end: true },
  { to: `/events/${id}/proposal`, icon: FileText,        label: 'المقترح'         },
  { to: `/events/${id}/team`,     icon: Users,           label: 'الفريق'          },
  { to: `/events/${id}/tasks`,    icon: CheckSquare,     label: 'المهام'          },
  { to: `/events/${id}/timeline`, icon: BarChart2,       label: 'الجدول الزمني'  },
  { to: `/events/${id}/agenda`,   icon: Layers,          label: 'الأجندة'         },
  { to: `/events/${id}/budget`,   icon: DollarSign,      label: 'الميزانية'       },
  { to: `/events/${id}/risks`,    icon: AlertTriangle,   label: 'المخاطر'         },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  // Detect current event ID
  const evMatch        = location.pathname.match(/^\/events\/([^/]+)/)
  const currentEventId = evMatch ? evMatch[1] : null
  const isEventPage    = !!currentEventId

  const initials = user?.email?.slice(0, 2).toUpperCase() || 'SU'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <button className="sidebar-mobile-close" onClick={onClose}><X size={18} /></button>

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

          {mainNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) => `nav-item${isActive && !isEventPage ? ' active' : (to === '/events' && isEventPage ? ' active' : isActive ? ' active' : '')}`}
              onClick={onClose}
            >
              <Icon size={18} className="nav-icon" />
              {label}
            </NavLink>
          ))}

          {/* Expanded Event Sub-navigation */}
          {isEventPage && (
            <div className="event-subnav-section">
              <div className="event-subnav-header">
                <ChevronDown size={13} />
                <span>قسم الفعالية</span>
              </div>
              {eventSubNav(currentEventId).map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `nav-item event-subnav-item${isActive ? ' active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={15} className="nav-icon" />
                  {label}
                </NavLink>
              ))}
            </div>
          )}

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
            <LogOut size={14} />تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  )
}
