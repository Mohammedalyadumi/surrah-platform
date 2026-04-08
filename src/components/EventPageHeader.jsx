import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Users, CheckSquare, BarChart2,
  Layers, DollarSign, AlertTriangle, ChevronLeft
} from 'lucide-react'

const SUB_PAGES = [
  { path: '',          label: 'الملخص',         icon: LayoutDashboard },
  { path: '/proposal', label: 'المقترح',        icon: FileText        },
  { path: '/team',     label: 'الفريق',         icon: Users           },
  { path: '/tasks',    label: 'المهام',         icon: CheckSquare     },
  { path: '/timeline', label: 'الجدول الزمني',  icon: BarChart2       },
  { path: '/agenda',   label: 'الأجندة',        icon: Layers          },
  { path: '/budget',   label: 'الميزانية',      icon: DollarSign      },
  { path: '/risks',    label: 'المخاطر',        icon: AlertTriangle   },
]

export default function EventPageHeader({ title, icon: Icon, eventId, actions }) {
  const location = useLocation()
  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Breadcrumb */}
      <div className="breadcrumb" style={{ marginBottom: '14px' }}>
        <Link to="/events" className="breadcrumb-link">الفعاليات</Link>
        <ChevronLeft size={14} color="#5b30b8" />
        <Link to={`/events/${eventId}`} className="breadcrumb-link">لوحة الفعالية</Link>
        <ChevronLeft size={14} color="#5b30b8" />
        <span style={{ color: '#c4aaef' }}>{title}</span>
      </div>

      {/* Page Title Row */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div className="page-header-left">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {Icon && <Icon size={20} color="#c084fc" />}
            {title}
          </h1>
        </div>
        {actions && <div style={{ display: 'flex', gap: '8px' }}>{actions}</div>}
      </div>

      {/* Sub Navigation Pills */}
      <div className="ev-subnav-pills">
        {SUB_PAGES.map(p => {
          const to = `/events/${eventId}${p.path}`
          const isActive = p.path === ''
            ? location.pathname === to
            : location.pathname.startsWith(to)
          return (
            <Link key={p.path} to={to} className={`ev-subnav-pill ${isActive ? 'active' : ''}`}>
              <p.icon size={13} />
              {p.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
