import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { BarChart2, Plus, Trash2, Pencil, X, Flag } from 'lucide-react'
import EventPageHeader from '../../components/EventPageHeader'

const TYPES = [
  { value: 'task',      label: 'مهمة'    },
  { value: 'milestone', label: 'معلم'    },
  { value: 'phase',     label: 'مرحلة'  },
]

const EMPTY_FORM = { title: '', start_date: '', end_date: '', assigned_to: '', type: 'task', department_id: '' }

function addDays(date, n) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function toYMD(date) {
  return date.toISOString().slice(0, 10)
}
function diffDays(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })
}

export default function EventTimeline() {
  const { id } = useParams()
  const [items, setItems]           = useState([])
  const [departments, setDepts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    setLoading(true)
    const [iRes, dRes] = await Promise.all([
      supabase.from('timeline_items').select('*').eq('event_id', id).order('start_date'),
      supabase.from('departments').select('id,name,color').eq('event_id', id),
    ])
    setItems(iRes.data || [])
    setDepts(dRes.data || [])
    setLoading(false)
  }

  // Calculate timeline range
  const { minDate, maxDate, totalDays, weeks } = useMemo(() => {
    if (!items.length) return { minDate: null, maxDate: null, totalDays: 30, weeks: [] }
    const starts = items.map(i => new Date(i.start_date)).filter(Boolean)
    const ends   = items.map(i => new Date(i.end_date || i.start_date)).filter(Boolean)
    const min = new Date(Math.min(...starts))
    const max = new Date(Math.max(...ends))
    // pad by 2 days each side
    min.setDate(min.getDate() - 2)
    max.setDate(max.getDate() + 2)
    const total = Math.max(diffDays(toYMD(min), toYMD(max)), 7)

    // Generate week markers
    const ws = []
    let cur = new Date(min)
    while (cur <= max) {
      ws.push(toYMD(cur))
      cur = addDays(cur, 7)
    }
    return { minDate: toYMD(min), maxDate: toYMD(max), totalDays: total, weeks: ws }
  }, [items])

  function getBar(item) {
    if (!minDate || !item.start_date) return null
    const left  = (diffDays(minDate, item.start_date) / totalDays) * 100
    const width = (Math.max(diffDays(item.start_date, item.end_date || item.start_date) + 1, 1) / totalDays) * 100
    return { left: `${Math.max(left, 0)}%`, width: `${Math.min(width, 100 - Math.max(left, 0))}%` }
  }

  const deptColor = (deptId) => departments.find(d => d.id === deptId)?.color || '#7c4dda'
  const deptName  = (deptId) => departments.find(d => d.id === deptId)?.name  || ''

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setModal('form') }
  function openEdit(item) {
    setEditId(item.id)
    setForm({ title: item.title, start_date: item.start_date || '', end_date: item.end_date || '', assigned_to: item.assigned_to || '', type: item.type || 'task', department_id: item.department_id || '' })
    setModal('form')
  }

  async function saveItem() {
    if (!form.title.trim() || !form.start_date) return
    setSaving(true)
    const payload = { ...form, event_id: id, department_id: form.department_id || null, end_date: form.end_date || form.start_date }
    if (editId) {
      await supabase.from('timeline_items').update(payload).eq('id', editId)
    } else {
      await supabase.from('timeline_items').insert([payload])
    }
    await fetchAll(); setModal(null); setSaving(false)
  }

  async function deleteItem(iid) {
    await supabase.from('timeline_items').delete().eq('id', iid)
    setItems(x => x.filter(i => i.id !== iid))
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>

  return (
    <>
      <EventPageHeader
        title="الجدول الزمني"
        icon={BarChart2}
        eventId={id}
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} />إضافة بند
          </button>
        }
      />

      {items.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <BarChart2 size={40} />
              <p>أضف أول بند لعرض الجدول الزمني</p>
              <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: '12px' }}>
                <Plus size={15} />إضافة بند
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: '0', overflowX: 'auto' }}>
            <div className="gantt-wrapper" style={{ minWidth: '700px' }}>
              {/* Gantt Header */}
              <div className="gantt-header">
                <div className="gantt-label-col">المهمة / المرحلة</div>
                <div className="gantt-chart-col">
                  <div className="gantt-weeks-row">
                    {weeks.map(w => (
                      <div
                        key={w}
                        className="gantt-week-label"
                        style={{ left: `${(diffDays(minDate, w) / totalDays) * 100}%` }}
                      >
                        {formatDate(w)}
                      </div>
                    ))}
                  </div>
                  {/* Vertical grid lines */}
                  {weeks.map(w => (
                    <div
                      key={w}
                      className="gantt-grid-line"
                      style={{ left: `${(diffDays(minDate, w) / totalDays) * 100}%` }}
                    />
                  ))}
                  {/* Today line */}
                  {(() => {
                    const todayPct = (diffDays(minDate, toYMD(new Date())) / totalDays) * 100
                    if (todayPct >= 0 && todayPct <= 100)
                      return <div className="gantt-today-line" style={{ left: `${todayPct}%` }} />
                    return null
                  })()}
                </div>
              </div>

              {/* Gantt Rows */}
              {items.map(item => {
                const bar = getBar(item)
                const color = item.department_id ? deptColor(item.department_id) : (item.type === 'milestone' ? '#f59e0b' : '#7c4dda')
                const isMilestone = item.type === 'milestone'
                return (
                  <div key={item.id} className="gantt-row">
                    <div className="gantt-label-col">
                      <div className="gantt-item-info">
                        {isMilestone && <Flag size={12} color="#f59e0b" />}
                        <div>
                          <div className="gantt-item-title">{item.title}</div>
                          {item.assigned_to && <div className="gantt-item-meta">{item.assigned_to}</div>}
                          {item.department_id && <div className="gantt-item-dept" style={{ color }}>{deptName(item.department_id)}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" style={{ padding: '3px' }} onClick={() => openEdit(item)}><Pencil size={12} /></button>
                        <button className="btn-icon danger" style={{ padding: '3px' }} onClick={() => deleteItem(item.id)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <div className="gantt-chart-col gantt-row-chart">
                      {bar && (
                        isMilestone ? (
                          <div
                            className="gantt-milestone"
                            style={{ left: bar.left }}
                            title={`${item.title} — ${formatDate(item.start_date)}`}
                          />
                        ) : (
                          <div
                            className="gantt-bar"
                            style={{ left: bar.left, width: bar.width, background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                            title={`${item.title}: ${formatDate(item.start_date)} → ${formatDate(item.end_date)}`}
                          >
                            <span className="gantt-bar-label">{item.title}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            {departments.length > 0 && (
              <div className="gantt-legend">
                {departments.map(d => (
                  <div key={d.id} className="gantt-legend-item">
                    <div className="gantt-legend-dot" style={{ background: d.color }} />
                    <span>{d.name}</span>
                  </div>
                ))}
                <div className="gantt-legend-item">
                  <div className="gantt-legend-dot" style={{ background: '#f59e0b', transform: 'rotate(45deg)', borderRadius: '2px' }} />
                  <span>معلم</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal === 'form' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <BarChart2 size={18} color="#c084fc" />
              {editId ? 'تعديل البند' : 'إضافة بند للجدول الزمني'}
              <button onClick={() => setModal(null)} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto' }}><X size={18} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">اسم المهمة / المرحلة *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="وصف البند" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">تاريخ البداية *</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={{ direction: 'ltr' }} />
              </div>
              <div className="form-group">
                <label className="form-label">تاريخ النهاية</label>
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={{ direction: 'ltr' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">النوع</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">المكلف</label>
                <input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="اسم الشخص" />
              </div>
            </div>

            {departments.length > 0 && (
              <div className="form-group">
                <label className="form-label">القسم</label>
                <select value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}>
                  <option value="">بدون قسم</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={saveItem} disabled={saving || !form.title.trim() || !form.start_date}>
                {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
