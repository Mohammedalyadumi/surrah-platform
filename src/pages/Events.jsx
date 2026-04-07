import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, CalendarDays, X, MapPin, Clock, Eye } from 'lucide-react'

const EMPTY_FORM = {
  title: '', description: '', date: '', time: '', location: '',
  capacity: '', status: 'upcoming', community_id: '',
}

const STATUS_OPTIONS = [
  { value: 'upcoming',  label: 'قادمة'   },
  { value: 'ongoing',   label: 'جارية'   },
  { value: 'completed', label: 'منتهية'  },
  { value: 'cancelled', label: 'ملغاة'   },
]

const statusBadge = (status) => {
  const map = {
    upcoming:  { cls: 'badge-purple',  label: 'قادمة'  },
    ongoing:   { cls: 'badge-success', label: 'جارية'  },
    completed: { cls: 'badge-warning', label: 'منتهية' },
    cancelled: { cls: 'badge-danger',  label: 'ملغاة'  },
  }
  const m = map[status] || { cls: 'badge-purple', label: status || '—' }
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}

export default function Events() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setEvents(data || [])
    setLoading(false)
  }

  const filtered = events.filter(e =>
    (e.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.location || '').toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setForm(EMPTY_FORM)
    setError('')
    setModal('create')
  }

  function openEdit(ev) {
    setSelected(ev)
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      date: ev.date || '',
      time: ev.time || '',
      location: ev.location || '',
      capacity: ev.capacity || '',
      status: ev.status || 'upcoming',
      community_id: ev.community_id || '',
    })
    setError('')
    setModal('edit')
  }

  function openDelete(ev) {
    setSelected(ev)
    setModal('delete')
  }

  function closeModal() {
    setModal(null)
    setSelected(null)
    setError('')
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('اسم الفعالية مطلوب'); return }
    setSaving(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      date: form.date || null,
      time: form.time || null,
      location: form.location.trim() || null,
      capacity: form.capacity ? Number(form.capacity) : null,
      status: form.status,
      community_id: form.community_id || null,
    }

    let err
    if (modal === 'create') {
      ;({ error: err } = await supabase.from('events').insert([payload]))
    } else {
      ;({ error: err } = await supabase.from('events').update(payload).eq('id', selected.id))
    }

    if (err) {
      setError(err.message)
    } else {
      await fetchEvents()
      closeModal()
    }
    setSaving(false)
  }

  async function handleDelete() {
    setSaving(true)
    const { error: err } = await supabase.from('events').delete().eq('id', selected.id)
    if (!err) {
      await fetchEvents()
      closeModal()
    }
    setSaving(false)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">الفعاليات</h1>
          <p className="page-subtitle">إدارة فعاليات مجتمع SUDDA</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          إضافة فعالية
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="toolbar">
            <div className="search-wrap">
              <input
                type="text"
                placeholder="ابحث عن فعالية..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search size={15} className="search-icon" />
            </div>
            <span style={{ fontSize: '13px', color: '#7c4dda' }}>{filtered.length} فعالية</span>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="loading-wrap">
                <div className="spinner" />
                <span>جاري التحميل...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <CalendarDays size={40} />
                <p>لا توجد فعاليات</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>الفعالية</th>
                    <th>التاريخ</th>
                    <th>الوقت</th>
                    <th>المكان</th>
                    <th>السعة</th>
                    <th>الحالة</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(ev => (
                    <tr key={ev.id}>
                      <td>
                        <div style={{ color: '#f3eeff', fontWeight: 600 }}>{ev.title}</div>
                        {ev.description && <div style={{ fontSize: '12px', color: '#7c4dda', marginTop: '2px' }}>{ev.description.slice(0, 50)}{ev.description.length > 50 ? '...' : ''}</div>}
                      </td>
                      <td>{ev.date ? new Date(ev.date).toLocaleDateString('ar-SA') : '—'}</td>
                      <td>{ev.time || '—'}</td>
                      <td>
                        {ev.location ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={12} color="#7c4dda" />
                            {ev.location}
                          </div>
                        ) : '—'}
                      </td>
                      <td>{ev.capacity || '—'}</td>
                      <td>{statusBadge(ev.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-icon" onClick={() => navigate(`/events/${ev.id}`)} title="عرض التفاصيل">
                            <Eye size={14} />
                          </button>
                          <button className="btn-icon" onClick={() => openEdit(ev)} title="تعديل">
                            <Pencil size={14} />
                          </button>
                          <button className="btn-icon danger" onClick={() => openDelete(ev)} title="حذف">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <CalendarDays size={20} color="#c084fc" />
              {modal === 'create' ? 'إضافة فعالية جديدة' : 'تعديل الفعالية'}
              <button onClick={closeModal} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="form-group">
              <label className="form-label">اسم الفعالية *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="اسم الفعالية" />
            </div>

            <div className="form-group">
              <label className="form-label">الوصف</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="وصف مختصر عن الفعالية" rows={3} style={{ resize: 'vertical' }} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">التاريخ</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} style={{ direction: 'ltr' }} />
              </div>
              <div className="form-group">
                <label className="form-label">الوقت</label>
                <input name="time" type="time" value={form.time} onChange={handleChange} style={{ direction: 'ltr' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المكان</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="المكان" />
              </div>
              <div className="form-group">
                <label className="form-label">السعة</label>
                <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="عدد المقاعد" min="0" style={{ direction: 'ltr' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">الحالة</label>
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>إلغاء</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'جاري الحفظ...' : (modal === 'create' ? 'إضافة' : 'حفظ التغييرات')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: '#ef4444' }}>
              <Trash2 size={20} />
              حذف الفعالية
            </div>
            <p style={{ color: '#c4aaef', fontSize: '14px', lineHeight: 1.6 }}>
              هل أنت متأكد من حذف الفعالية <strong style={{ color: '#f3eeff' }}>"{selected?.title}"</strong>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>إلغاء</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'جاري الحذف...' : 'حذف نهائياً'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
