import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  ArrowRight, CalendarDays, MapPin, Clock, Users, DollarSign,
  CheckSquare, Mic2, Plus, Trash2, Check, X, Copy, ExternalLink,
  ChevronRight, TrendingUp, TrendingDown
} from 'lucide-react'

const TABS = [
  { key: 'details',   label: 'التفاصيل',    icon: CalendarDays },
  { key: 'speakers',  label: 'المتحدثون',   icon: Mic2 },
  { key: 'budget',    label: 'الميزانية',   icon: DollarSign },
  { key: 'checklist', label: 'قائمة المهام', icon: CheckSquare },
  { key: 'attendees', label: 'الحضور',      icon: Users },
]

const statusMap = {
  upcoming:  { cls: 'badge-purple',  label: 'قادمة'  },
  ongoing:   { cls: 'badge-success', label: 'جارية'  },
  completed: { cls: 'badge-warning', label: 'منتهية' },
  cancelled: { cls: 'badge-danger',  label: 'ملغاة'  },
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Tab-specific data
  const [speakers, setSpeakers]   = useState([])
  const [budget, setBudget]       = useState([])
  const [checklist, setChecklist] = useState([])
  const [attendees, setAttendees] = useState([])

  // Forms
  const [speakerForm, setSpeakerForm]   = useState({ name: '', title: '', bio: '' })
  const [budgetForm, setBudgetForm]     = useState({ title: '', amount: '', type: 'expense' })
  const [checklistForm, setChecklistForm] = useState({ title: '' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchEvent() }, [id])
  useEffect(() => {
    if (!event) return
    if (activeTab === 'speakers')  fetchSpeakers()
    if (activeTab === 'budget')    fetchBudget()
    if (activeTab === 'checklist') fetchChecklist()
    if (activeTab === 'attendees') fetchAttendees()
  }, [activeTab, event])

  async function fetchEvent() {
    setLoading(true)
    const { data } = await supabase.from('events').select('*').eq('id', id).single()
    setEvent(data)
    setLoading(false)
  }

  async function fetchSpeakers() {
    const { data } = await supabase.from('speakers').select('*').eq('event_id', id).order('created_at', { ascending: true })
    setSpeakers(data || [])
  }

  async function fetchBudget() {
    const { data } = await supabase.from('budget_items').select('*').eq('event_id', id).order('created_at', { ascending: true })
    setBudget(data || [])
  }

  async function fetchChecklist() {
    const { data } = await supabase.from('checklist_items').select('*').eq('event_id', id).order('created_at', { ascending: true })
    setChecklist(data || [])
  }

  async function fetchAttendees() {
    const { data } = await supabase.from('attendees').select('*').eq('event_id', id).order('created_at', { ascending: false })
    setAttendees(data || [])
  }

  async function addSpeaker() {
    if (!speakerForm.name.trim()) return
    setSaving(true)
    await supabase.from('speakers').insert([{ ...speakerForm, event_id: id }])
    setSpeakerForm({ name: '', title: '', bio: '' })
    setShowForm(false)
    await fetchSpeakers()
    setSaving(false)
  }

  async function deleteSpeaker(sid) {
    await supabase.from('speakers').delete().eq('id', sid)
    setSpeakers(s => s.filter(x => x.id !== sid))
  }

  async function addBudgetItem() {
    if (!budgetForm.title.trim() || !budgetForm.amount) return
    setSaving(true)
    await supabase.from('budget_items').insert([{ ...budgetForm, amount: Number(budgetForm.amount), event_id: id }])
    setBudgetForm({ title: '', amount: '', type: 'expense' })
    setShowForm(false)
    await fetchBudget()
    setSaving(false)
  }

  async function deleteBudgetItem(bid) {
    await supabase.from('budget_items').delete().eq('id', bid)
    setBudget(b => b.filter(x => x.id !== bid))
  }

  async function addChecklistItem() {
    if (!checklistForm.title.trim()) return
    setSaving(true)
    await supabase.from('checklist_items').insert([{ title: checklistForm.title, completed: false, event_id: id }])
    setChecklistForm({ title: '' })
    setShowForm(false)
    await fetchChecklist()
    setSaving(false)
  }

  async function toggleChecklist(item) {
    await supabase.from('checklist_items').update({ completed: !item.completed }).eq('id', item.id)
    setChecklist(c => c.map(x => x.id === item.id ? { ...x, completed: !x.completed } : x))
  }

  async function deleteChecklistItem(cid) {
    await supabase.from('checklist_items').delete().eq('id', cid)
    setChecklist(c => c.filter(x => x.id !== cid))
  }

  function copyRegLink() {
    const url = `${window.location.origin}/register/${id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>
  }

  if (!event) {
    return (
      <div className="empty-state" style={{ padding: '80px 20px' }}>
        <CalendarDays size={48} color="#5b30b8" />
        <p style={{ fontSize: '16px', fontWeight: 700 }}>لم يتم العثور على الفعالية</p>
        <button className="btn btn-secondary" onClick={() => navigate('/events')} style={{ marginTop: '16px' }}>
          العودة للفعاليات
        </button>
      </div>
    )
  }

  const status = statusMap[event.status] || { cls: 'badge-purple', label: event.status || '—' }
  const income   = budget.filter(b => b.type === 'income').reduce((s, b) => s + (b.amount || 0), 0)
  const expenses = budget.filter(b => b.type === 'expense').reduce((s, b) => s + (b.amount || 0), 0)
  const net = income - expenses

  return (
    <>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/events" className="breadcrumb-link">الفعاليات</Link>
        <ChevronRight size={14} color="#5b30b8" style={{ transform: 'scaleX(-1)' }} />
        <span>{event.title}</span>
      </div>

      {/* Event Header */}
      <div className="event-detail-header">
        <div className="event-detail-header-left">
          <div className="event-detail-icon">
            <CalendarDays size={24} color="#c084fc" />
          </div>
          <div>
            <h1 className="event-detail-title">{event.title}</h1>
            <div className="event-detail-meta">
              {event.date && (
                <span className="event-meta-item">
                  <CalendarDays size={13} />
                  {new Date(event.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {event.time && (
                <span className="event-meta-item">
                  <Clock size={13} />
                  {event.time}
                </span>
              )}
              {event.location && (
                <span className="event-meta-item">
                  <MapPin size={13} />
                  {event.location}
                </span>
              )}
              {event.capacity && (
                <span className="event-meta-item">
                  <Users size={13} />
                  {event.capacity} مقعد
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="event-detail-header-right">
          <span className={`badge ${status.cls}`} style={{ fontSize: '13px', padding: '5px 14px' }}>{status.label}</span>
          <button className="btn btn-secondary" onClick={copyRegLink} style={{ gap: '6px' }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'تم النسخ!' : 'رابط التسجيل'}
          </button>
          <a
            href={`/register/${id}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ gap: '6px' }}
          >
            <ExternalLink size={14} />
            فتح صفحة التسجيل
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="event-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`event-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(t.key); setShowForm(false) }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card animate-fade" style={{ marginTop: '0' }}>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="card-body">
            <div className="detail-info-grid">
              {event.description && (
                <div className="detail-info-item full-width">
                  <div className="detail-info-label">الوصف</div>
                  <div className="detail-info-value" style={{ lineHeight: 1.8 }}>{event.description}</div>
                </div>
              )}
              <div className="detail-info-item">
                <div className="detail-info-label">التاريخ</div>
                <div className="detail-info-value">{event.date ? new Date(event.date).toLocaleDateString('ar-SA') : '—'}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">الوقت</div>
                <div className="detail-info-value">{event.time || '—'}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">الموقع</div>
                <div className="detail-info-value">{event.location || '—'}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">السعة</div>
                <div className="detail-info-value">{event.capacity ? `${event.capacity} مقعد` : '—'}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">الحالة</div>
                <div className="detail-info-value"><span className={`badge ${status.cls}`}>{status.label}</span></div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">تاريخ الإنشاء</div>
                <div className="detail-info-value">{event.created_at ? new Date(event.created_at).toLocaleDateString('ar-SA') : '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Speakers Tab */}
        {activeTab === 'speakers' && (
          <div className="card-body">
            <div className="tab-toolbar">
              <h3 className="tab-section-title">المتحدثون ({speakers.length})</h3>
              <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
                <Plus size={15} />
                إضافة متحدث
              </button>
            </div>

            {showForm && (
              <div className="inline-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الاسم *</label>
                    <input value={speakerForm.name} onChange={e => setSpeakerForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم المتحدث" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">المسمى الوظيفي</label>
                    <input value={speakerForm.title} onChange={e => setSpeakerForm(f => ({ ...f, title: e.target.value }))} placeholder="المسمى الوظيفي" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">نبذة مختصرة</label>
                  <textarea value={speakerForm.bio} onChange={e => setSpeakerForm(f => ({ ...f, bio: e.target.value }))} rows={2} placeholder="نبذة قصيرة عن المتحدث" style={{ resize: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={addSpeaker} disabled={saving}>{saving ? 'جاري الحفظ...' : 'إضافة'}</button>
                  <button className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                </div>
              </div>
            )}

            {speakers.length === 0 ? (
              <div className="empty-state"><Mic2 size={36} /><p>لا يوجد متحدثون بعد</p></div>
            ) : (
              <div className="speakers-grid">
                {speakers.map(sp => (
                  <div className="speaker-card" key={sp.id}>
                    <div className="speaker-avatar">{sp.name?.slice(0, 1)}</div>
                    <div className="speaker-info">
                      <div className="speaker-name">{sp.name}</div>
                      {sp.title && <div className="speaker-title">{sp.title}</div>}
                      {sp.bio && <div className="speaker-bio">{sp.bio}</div>}
                    </div>
                    <button className="btn-icon danger" onClick={() => deleteSpeaker(sp.id)}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="card-body">
            {/* Summary */}
            <div className="budget-summary">
              <div className="budget-stat income">
                <TrendingUp size={18} />
                <div>
                  <div className="budget-stat-label">الإيرادات</div>
                  <div className="budget-stat-value">{income.toLocaleString('ar')} ر.س</div>
                </div>
              </div>
              <div className="budget-stat expense">
                <TrendingDown size={18} />
                <div>
                  <div className="budget-stat-label">المصروفات</div>
                  <div className="budget-stat-value">{expenses.toLocaleString('ar')} ر.س</div>
                </div>
              </div>
              <div className={`budget-stat ${net >= 0 ? 'income' : 'expense'}`}>
                <DollarSign size={18} />
                <div>
                  <div className="budget-stat-label">الصافي</div>
                  <div className="budget-stat-value">{net.toLocaleString('ar')} ر.س</div>
                </div>
              </div>
            </div>

            <div className="tab-toolbar" style={{ marginTop: '20px' }}>
              <h3 className="tab-section-title">البنود ({budget.length})</h3>
              <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
                <Plus size={15} />
                إضافة بند
              </button>
            </div>

            {showForm && (
              <div className="inline-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">البيان *</label>
                    <input value={budgetForm.title} onChange={e => setBudgetForm(f => ({ ...f, title: e.target.value }))} placeholder="وصف البند" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">المبلغ (ر.س) *</label>
                    <input type="number" value={budgetForm.amount} onChange={e => setBudgetForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" min="0" style={{ direction: 'ltr' }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">النوع</label>
                  <select value={budgetForm.type} onChange={e => setBudgetForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="income">إيراد</option>
                    <option value="expense">مصروف</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-primary" onClick={addBudgetItem} disabled={saving}>{saving ? 'جاري الحفظ...' : 'إضافة'}</button>
                  <button className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء</button>
                </div>
              </div>
            )}

            {budget.length === 0 ? (
              <div className="empty-state"><DollarSign size={36} /><p>لا توجد بنود ميزانية بعد</p></div>
            ) : (
              <div className="table-container" style={{ marginTop: '12px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>البيان</th>
                      <th>النوع</th>
                      <th>المبلغ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.map(b => (
                      <tr key={b.id}>
                        <td style={{ color: '#f3eeff', fontWeight: 600 }}>{b.title}</td>
                        <td>
                          <span className={`badge ${b.type === 'income' ? 'badge-success' : 'badge-danger'}`}>
                            {b.type === 'income' ? 'إيراد' : 'مصروف'}
                          </span>
                        </td>
                        <td style={{ color: b.type === 'income' ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                          {b.type === 'expense' ? '-' : '+'}{Number(b.amount || 0).toLocaleString('ar')} ر.س
                        </td>
                        <td>
                          <button className="btn-icon danger" onClick={() => deleteBudgetItem(b.id)}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="card-body">
            <div className="tab-toolbar">
              <h3 className="tab-section-title">
                المهام ({checklist.filter(c => c.completed).length}/{checklist.length} مكتملة)
              </h3>
              <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
                <Plus size={15} />
                إضافة مهمة
              </button>
            </div>

            {checklist.length > 0 && (
              <div className="checklist-progress-wrap">
                <div className="checklist-progress-bar">
                  <div
                    className="checklist-progress-fill"
                    style={{ width: `${checklist.length ? (checklist.filter(c => c.completed).length / checklist.length) * 100 : 0}%` }}
                  />
                </div>
                <span className="checklist-progress-pct">
                  {checklist.length ? Math.round((checklist.filter(c => c.completed).length / checklist.length) * 100) : 0}%
                </span>
              </div>
            )}

            {showForm && (
              <div className="inline-form">
                <div className="form-group">
                  <label className="form-label">المهمة *</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      value={checklistForm.title}
                      onChange={e => setChecklistForm({ title: e.target.value })}
                      placeholder="وصف المهمة"
                      onKeyDown={e => { if (e.key === 'Enter') addChecklistItem() }}
                    />
                    <button className="btn btn-primary" onClick={addChecklistItem} disabled={saving} style={{ whiteSpace: 'nowrap' }}>
                      {saving ? '...' : 'إضافة'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ whiteSpace: 'nowrap' }}>إلغاء</button>
                  </div>
                </div>
              </div>
            )}

            {checklist.length === 0 ? (
              <div className="empty-state"><CheckSquare size={36} /><p>لا توجد مهام بعد</p></div>
            ) : (
              <div className="checklist-items">
                {checklist.map(item => (
                  <div className={`checklist-item ${item.completed ? 'done' : ''}`} key={item.id}>
                    <button className="checklist-toggle" onClick={() => toggleChecklist(item)}>
                      {item.completed ? <Check size={14} /> : null}
                    </button>
                    <span className="checklist-text">{item.title}</span>
                    <button className="btn-icon danger" style={{ padding: '4px', marginRight: 'auto' }} onClick={() => deleteChecklistItem(item.id)}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Attendees Tab */}
        {activeTab === 'attendees' && (
          <div className="card-body">
            <div className="tab-toolbar">
              <h3 className="tab-section-title">الحضور المسجلون ({attendees.length})</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={copyRegLink} style={{ gap: '6px' }}>
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copied ? 'تم النسخ!' : 'نسخ رابط التسجيل'}
                </button>
                <a
                  href={`/register/${id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ gap: '6px' }}
                >
                  <ExternalLink size={14} />
                  صفحة التسجيل العامة
                </a>
              </div>
            </div>

            {attendees.length === 0 ? (
              <div className="empty-state">
                <Users size={36} />
                <p>لم يسجل أحد بعد</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>شارك رابط التسجيل مع الحضور</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>البريد الإلكتروني</th>
                      <th>الهاتف</th>
                      <th>تاريخ التسجيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map(a => (
                      <tr key={a.id}>
                        <td style={{ color: '#f3eeff', fontWeight: 600 }}>{a.name || '—'}</td>
                        <td>{a.email || '—'}</td>
                        <td>{a.phone || '—'}</td>
                        <td>{a.created_at ? new Date(a.created_at).toLocaleDateString('ar-SA') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
