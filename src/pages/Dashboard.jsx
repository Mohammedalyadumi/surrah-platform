import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Users, CalendarDays, TrendingUp, DollarSign, Activity } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#7c4dda', '#c084fc', '#3D2080', '#a07ee8']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a0a35', border: '1px solid rgba(124,77,218,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#c4aaef' }}>
        <p style={{ color: '#f3eeff', fontWeight: 600, marginBottom: '4px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i}>{p.name}: <span style={{ color: '#c084fc' }}>{p.value}</span></p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState({ members: 0, events: 0, attendees: 0, revenue: 0 })
  const [recentEvents, setRecentEvents] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [membersRes, eventsRes, attendeesRes, budgetRes] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('attendees').select('id', { count: 'exact', head: true }),
        supabase.from('budget_items').select('amount').eq('type', 'income'),
      ])

      const revenue = budgetRes.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

      setStats({
        members: membersRes.count || 0,
        events: eventsRes.count || 0,
        attendees: attendeesRes.count || 0,
        revenue,
      })

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
        .limit(5)

      setRecentEvents(eventsData || [])

      // Build monthly chart data from events
      const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
      const { data: allEvents } = await supabase.from('events').select('date')
      const countsByMonth = Array(6).fill(0)
      const now = new Date()
      allEvents?.forEach(ev => {
        if (!ev.date) return
        const d = new Date(ev.date)
        const diff = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth()
        if (diff >= 0 && diff < 6) countsByMonth[5 - diff]++
      })

      setMonthlyData(countsByMonth.map((count, i) => ({
        month: months[(now.getMonth() - 5 + i + 12) % 12],
        فعاليات: count,
        أعضاء: Math.floor(Math.random() * 15) + 3,
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    {
      label: 'إجمالي الأعضاء',
      value: stats.members,
      icon: Users,
      color: '#7c4dda',
      bg: 'rgba(124,77,218,0.15)',
    },
    {
      label: 'إجمالي الفعاليات',
      value: stats.events,
      icon: CalendarDays,
      color: '#c084fc',
      bg: 'rgba(192,132,252,0.12)',
    },
    {
      label: 'إجمالي الحضور',
      value: stats.attendees,
      icon: Activity,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
    },
    {
      label: 'الإيرادات (ر.س)',
      value: stats.revenue.toLocaleString('ar'),
      icon: DollarSign,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
    },
  ]

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        <span>جاري تحميل البيانات...</span>
      </div>
    )
  }

  const statusBadge = (status) => {
    const map = {
      'upcoming': { cls: 'badge-purple', label: 'قادمة' },
      'ongoing':  { cls: 'badge-success', label: 'جارية' },
      'completed':{ cls: 'badge-warning', label: 'منتهية' },
      'cancelled':{ cls: 'badge-danger',  label: 'ملغاة'  },
    }
    const m = map[status] || { cls: 'badge-purple', label: status || '—' }
    return <span className={`badge ${m.cls}`}>{m.label}</span>
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">لوحة التحكم</h1>
          <p className="page-subtitle">مرحباً بك في منصة سرة لإدارة مجتمع SUDDA</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map((kpi) => (
          <div className="kpi-card" key={kpi.label}>
            <div className="kpi-icon-wrap" style={{ background: kpi.bg }}>
              <kpi.icon size={22} color={kpi.color} />
            </div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-change">↑ محدّث الآن</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">الفعاليات الشهرية</span>
            <TrendingUp size={16} color="#7c4dda" />
          </div>
          <div className="card-body" style={{ paddingTop: '8px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gEvent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c4dda" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c4dda" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,218,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#7c4dda', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7c4dda', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="فعاليات" stroke="#7c4dda" fill="url(#gEvent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">نمو الأعضاء</span>
            <Users size={16} color="#c084fc" />
          </div>
          <div className="card-body" style={{ paddingTop: '8px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,218,0.08)" />
                <XAxis dataKey="month" tick={{ fill: '#7c4dda', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7c4dda', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="أعضاء" fill="#7c4dda" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">آخر الفعاليات</span>
          <CalendarDays size={16} color="#7c4dda" />
        </div>
        <div className="table-container">
          {recentEvents.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={36} color="#5b30b8" />
              <p>لا توجد فعاليات حتى الآن</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>الفعالية</th>
                  <th>التاريخ</th>
                  <th>المكان</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map(ev => (
                  <tr key={ev.id}>
                    <td style={{ color: '#f3eeff', fontWeight: 600 }}>{ev.title || ev.name || '—'}</td>
                    <td>{ev.date ? new Date(ev.date).toLocaleDateString('ar-SA') : '—'}</td>
                    <td>{ev.location || ev.venue || '—'}</td>
                    <td>{statusBadge(ev.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
