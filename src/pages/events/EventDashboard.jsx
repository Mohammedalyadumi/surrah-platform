import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  CalendarDays, Users, CheckSquare, BarChart2, FileText, Clock,
  DollarSign, AlertTriangle, MapPin, ArrowLeft, Layers, Target, TrendingUp
} from 'lucide-react'

const SECTIONS = (id) => [
  { key: 'proposal',  label: 'المقترح',        icon: FileText,       to: `/events/${id}/proposal`,  color: '#7c4dda', desc: 'تفاصيل الفعالية وأهدافها' },
  { key: 'team',      label: 'الفريق',          icon: Users,          to: `/events/${id}/team`,      color: '#3b82f6', desc: 'الأقسام وأعضاء الفريق' },
  { key: 'tasks',     label: 'المهام',          icon: CheckSquare,    to: `/events/${id}/tasks`,     color: '#10b981', desc: 'لوحة إدارة المهام' },
  { key: 'timeline',  label: 'الجدول الزمني',   icon: BarChart2,      to: `/events/${id}/timeline`,  color: '#f59e0b', desc: 'المخطط الزمني للفعالية' },
  { key: 'agenda',    label: 'الأجندة',         icon: Layers,         to: `/events/${id}/agenda`,    color: '#8b5cf6', desc: 'برنامج الفعالية التفصيلي' },
  { key: 'budget',    label: 'الميزانية',       icon: DollarSign,     to: `/events/${id}/budget`,    color: '#ec4899', desc: 'تتبع التكاليف والمصروفات' },
  { key: 'risks',     label: 'المخاطر',         icon: AlertTriangle,  to: `/events/${id}/risks`,     color: '#ef4444', desc: 'سجل وإدارة المخاطر' },
]

const STATUS_MAP = {
  upcoming:  { label: 'قادمة',  cls: 'badge-purple'  },
  ongoing:   { label: 'جارية',  cls: 'badge-success' },
  completed: { label: 'منتهية', cls: 'badge-warning' },
  cancelled: { label: 'ملغاة',  cls: 'badge-danger'  },
}

export default function EventDashboard() {
  const { id } = useParams()
  const [event, setEvent]   = useState(null)
  const [stats, setStats]   = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    setLoading(true)
    try {
      const [evRes, propRes, teamRes, tasksRes, budgetRes, risksRes] = await Promise.all([
        supabase.from('events').select('*').eq('id', id).single(),
        supabase.from('event_proposals').select('status').eq('event_id', id).maybeSingle(),
        supabase.from('team_members').select('id', { count: 'exact', head: true }).eq('event_id', id),
        supabase.from('tasks').select('status').eq('event_id', id),
        supabase.from('budget_items_v2').select('estimated_cost,actual_cost').eq('event_id', id),
        supabase.from('risks').select('likelihood,impact').eq('event_id', id),
      ])

      setEvent(evRes.data)
      const tasks  = tasksRes.data  || []
      const budget = budgetRes.data || []
      const risks  = risksRes.data  || []
      const today  = new Date()
      const evDate = evRes.data?.date ? new Date(evRes.data.date) : null
      const daysUntil = evDate ? Math.ceil((evDate - today) / 86400000) : null

      setStats({
        proposalStatus: propRes.data?.status ?? null,
        teamSize:        teamRes.count || 0,
        tasksDone:       tasks.filter(t => t.status === 'done').length,
        tasksTotal:      tasks.length,
        budgetEstimated: budget.reduce((s, b) => s + (b.estimated_cost || 0), 0),
        budgetActual:    budget.reduce((s, b) => s + (b.actual_cost    || 0), 0),
        risksHigh:       risks.filter(r => r.likelihood * r.impact >= 15).length,
        risksTotal:      risks.length,
        daysUntil,
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>
  if (!event)  return <div className="empty-state"><p>الفعالية غير موجودة</p></div>

  const evStatus = STATUS_MAP[event.status] || { label: event.status || '—', cls: 'badge-purple' }
  const tasksP   = stats.tasksTotal    ? Math.round((stats.tasksDone    / stats.tasksTotal)    * 100) : 0
  const budgetP  = stats.budgetEstimated ? Math.round((stats.budgetActual / stats.budgetEstimated) * 100) : 0

  return (
    <>
      {/* Event Header Card */}
      <div className="ev-header-card">
        <div className="ev-header-icon"><CalendarDays size={30} color="#c084fc" /></div>
        <div className="ev-header-body">
          <div className="ev-header-top">
            <h1 className="page-title" style={{ margin: 0 }}>{event.title}</h1>
            <span className={`badge ${evStatus.cls}`} style={{ fontSize: '13px', padding: '4px 14px' }}>{evStatus.label}</span>
          </div>
          <div className="event-detail-meta" style={{ marginTop: '8px' }}>
            {event.date     && <span className="event-meta-item"><CalendarDays size={13} />{new Date(event.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            {event.time     && <span className="event-meta-item"><Clock size={13} />{event.time}</span>}
            {event.location && <span className="event-meta-item"><MapPin size={13} />{event.location}</span>}
            {event.capacity && <span className="event-meta-item"><Users size={13} />{event.capacity} مقعد</span>}
          </div>
        </div>
        <Link to="/events" className="btn btn-secondary" style={{ gap: '6px', flexShrink: 0 }}>
          <ArrowLeft size={14} />كل الفعاليات
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="ev-stats-row">
        {stats.daysUntil !== null && (
          <div className="ev-stat-pill" style={{ borderColor: stats.daysUntil <= 7 ? 'rgba(239,68,68,0.4)' : 'rgba(124,77,218,0.25)' }}>
            <Clock size={18} color={stats.daysUntil <= 7 ? '#ef4444' : '#7c4dda'} />
            <div>
              <div className="ev-stat-pill-value" style={{ color: stats.daysUntil <= 7 ? '#ef4444' : '#f3eeff' }}>
                {stats.daysUntil > 0 ? `${stats.daysUntil} يوم` : stats.daysUntil === 0 ? 'اليوم!' : 'انتهت'}
              </div>
              <div className="ev-stat-pill-label">حتى الفعالية</div>
            </div>
          </div>
        )}
        <div className="ev-stat-pill">
          <Users size={18} color="#3b82f6" />
          <div>
            <div className="ev-stat-pill-value">{stats.teamSize}</div>
            <div className="ev-stat-pill-label">عضو في الفريق</div>
          </div>
        </div>
        <div className="ev-stat-pill" style={{ flex: 1 }}>
          <CheckSquare size={18} color="#10b981" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="ev-stat-pill-value">{stats.tasksDone}/{stats.tasksTotal} مهمة</div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>{tasksP}%</span>
            </div>
            <div className="ev-progress-bar"><div className="ev-progress-fill" style={{ width: `${tasksP}%`, background: '#10b981' }} /></div>
          </div>
        </div>
        <div className="ev-stat-pill" style={{ flex: 1 }}>
          <DollarSign size={18} color="#f59e0b" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="ev-stat-pill-value">{stats.budgetActual.toLocaleString()} / {stats.budgetEstimated.toLocaleString()} ر.س</div>
              <span style={{ fontSize: '12px', color: budgetP > 90 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>{budgetP}%</span>
            </div>
            <div className="ev-progress-bar"><div className="ev-progress-fill" style={{ width: `${Math.min(budgetP, 100)}%`, background: budgetP > 90 ? '#ef4444' : '#f59e0b' }} /></div>
          </div>
        </div>
        <div className="ev-stat-pill">
          <AlertTriangle size={18} color="#ef4444" />
          <div>
            <div className="ev-stat-pill-value" style={{ color: stats.risksHigh > 0 ? '#ef4444' : '#f3eeff' }}>{stats.risksHigh} عالية</div>
            <div className="ev-stat-pill-label">{stats.risksTotal} مخاطر إجمالاً</div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <h2 className="ev-sections-heading">أقسام إدارة الفعالية</h2>
      <div className="ev-sections-grid">
        {SECTIONS(id).map(s => (
          <Link key={s.key} to={s.to} className="ev-section-card">
            <div className="ev-section-icon" style={{ background: `${s.color}18`, color: s.color }}>
              <s.icon size={24} />
            </div>
            <div className="ev-section-name">{s.label}</div>
            <div className="ev-section-desc">{s.desc}</div>
            <div className="ev-section-arrow" style={{ color: s.color }}>←</div>
          </Link>
        ))}
      </div>
    </>
  )
}
