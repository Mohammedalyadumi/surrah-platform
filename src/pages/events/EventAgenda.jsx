import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Layers, Plus, Trash2, Pencil, X, Printer, Clock, MapPin, Mic2 } from 'lucide-react'
import EventPageHeader from '../../components/EventPageHeader'

const EMPTY_FORM = { day_number: 1, date: '', start_time: '', end_time: '', title: '', speaker: '', location: '', notes: '' }

export default function EventAgenda() {
  const { id } = useParams()
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [editId, setEditId]     = useState(null)
  const [saving, setSaving]     = useState(false)
  const [activeDay, setActiveDay] = useState(1)
  const [printMode, setPrintMode] = useState(false)

  useEffect(() => { fetchItems() }, [id])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase.from('agenda_items').select('*').eq('event_id', id).order('day_number').order('start_time')
    setItems(data || [])
    setLoading(false)
  }

  const days = [...new Set(items.map(i => i.day_number))].sort((a, b) => a - b)
  const maxDay = days.length > 0 ? Math.max(...days) : 1
  const dayItems = items.filter(i => i.day_number === activeDay).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))

  function openCreate() { setForm({ ...EMPTY_FORM, day_number: activeDay }); setEditId(null); setModal('form') }
  function openEdit(item) {
    setEditId(item.id)
    setForm({ day_number: item.day_number, date: item.date || '', start_time: item.start_time || '', end_time: item.end_time || '', title: item.title, speaker: item.speaker || '', location: item.location || '', notes: item.notes || '' })
    setModal('form')
  }

  async function saveItem() {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = { ...form, event_id: id, day_number: Number(form.day_number) }
    if (editId) {
      await supabase.from('agenda_items').update(payload).eq('id', editId)
    } else {
      await supabase.from('agenda_items').insert([payload])
    }
    await fetchItems(); setModal(null); setSaving(false)
  }

  async function deleteItem(iid) {
    await supabase.from('agenda_items').delete().eq('id', iid)
    setItems(x => x.filter(i => i.id !== iid))
  }

  async function addDay() {
    const newDay = maxDay + 1
    setActiveDay(newDay)
    openCreate()
    setForm(f => ({ ...f, day_number: newDay }))
  }

  function calcDuration(start, end) {
    if (!start || !end) return null
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const diff = (eh * 60 + em) - (sh * 60 + sm)
    if (diff <= 0) return null
    if (diff < 60) return `${diff} دقيقة`
    return `${Math.floor(diff / 60)}س ${diff % 60 ? diff % 60 + 'د' : ''}`
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>

  return (
    <>
      <EventPageHeader
        title="الأجندة"
        icon={Layers}
        eventId={id}
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setPrintMode(p => !p)}>
              <Printer size={14} />{printMode ? 'إخفاء طريقة الطباعة' : 'طريقة الطباعة'}
            </button>
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={15} />إضافة فقرة
            </button>
          </>
        }
      />

      {/* Day Tabs */}
      <div className="agenda-day-tabs">
        {days.map(d => (
          <button
            key={d}
            className={`agenda-day-tab ${activeDay === d ? 'active' : ''}`}
            onClick={() => setActiveDay(d)}
          >
            اليوم {d}
            {items.find(i => i.day_number === d)?.date && (
              <span className="agenda-day-date">{new Date(items.find(i => i.day_number === d).date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}</span>
            )}
          </button>
        ))}
        <button className="agenda-day-tab add-day" onClick={addDay}>
          <Plus size={14} />يوم جديد
        </button>
      </div>

      {/* Agenda Content */}
      <div className={`card ${printMode ? 'print-card' : ''}`}>
        {printMode && (
          <div className="print-header">
            <div className="print-title">أجندة الفعالية — اليوم {activeDay}</div>
            <button className="btn btn-secondary" onClick={() => window.print()} style={{ fontSize: '12px', padding: '6px 12px' }}>
              <Printer size={13} />طباعة
            </button>
          </div>
        )}

        <div className="card-header">
          <span className="card-title">اليوم {activeDay}</span>
          <span style={{ fontSize: '12px', color: '#5b30b8' }}>{dayItems.length} فقرة</span>
        </div>

        <div className="card-body" style={{ padding: '12px 0' }}>
          {dayItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <Layers size={36} />
              <p>لا توجد فقرات لهذا اليوم بعد</p>
              <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: '12px' }}>
                <Plus size={15} />إضافة فقرة
              </button>
            </div>
          ) : (
            <div className="agenda-timeline">
              {dayItems.map((item, idx) => {
                const duration = calcDuration(item.start_time, item.end_time)
                return (
                  <div key={item.id} className="agenda-item">
                    {/* Time column */}
                    <div className="agenda-time-col">
                      {item.start_time && <div className="agenda-start-time">{item.start_time}</div>}
                      {item.end_time && <div className="agenda-end-time">{item.end_time}</div>}
                      {duration && <div className="agenda-duration">{duration}</div>}
                    </div>

                    {/* Timeline line */}
                    <div className="agenda-line-col">
                      <div className="agenda-dot" />
                      {idx < dayItems.length - 1 && <div className="agenda-connector" />}
                    </div>

                    {/* Content */}
                    <div className="agenda-content-col">
                      <div className="agenda-item-card">
                        <div className="agenda-item-title">{item.title}</div>
                        <div className="agenda-item-meta">
                          {item.speaker && <span className="agenda-meta-chip"><Mic2 size={11} />{item.speaker}</span>}
                          {item.location && <span className="agenda-meta-chip"><MapPin size={11} />{item.location}</span>}
                        </div>
                        {item.notes && <div className="agenda-item-notes">{item.notes}</div>}

                        {!printMode && (
                          <div className="agenda-item-actions">
                            <button className="btn-icon" style={{ padding: '4px' }} onClick={() => openEdit(item)}><Pencil size={13} /></button>
                            <button className="btn-icon danger" style={{ padding: '4px' }} onClick={() => deleteItem(item.id)}><Trash2 size={13} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {modal === 'form' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <Layers size={18} color="#c084fc" />
              {editId ? 'تعديل الفقرة' : 'إضافة فقرة جديدة'}
              <button onClick={() => setModal(null)} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto' }}><X size={18} /></button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">اليوم</label>
                <select value={form.day_number} onChange={e => setForm(f => ({ ...f, day_number: e.target.value }))}>
                  {Array.from({ length: Math.max(maxDay, 1) }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>اليوم {d}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">التاريخ (اختياري)</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ direction: 'ltr' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">عنوان الفقرة / الجلسة *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="اسم الفقرة أو الجلسة" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">وقت البداية</label>
                <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={{ direction: 'ltr' }} />
              </div>
              <div className="form-group">
                <label className="form-label">وقت النهاية</label>
                <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} style={{ direction: 'ltr' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المتحدث / المضيف</label>
                <input value={form.speaker} onChange={e => setForm(f => ({ ...f, speaker: e.target.value }))} placeholder="اسم المتحدث" />
              </div>
              <div className="form-group">
                <label className="form-label">القاعة / الموقع</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="القاعة الرئيسية" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ملاحظات</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ resize: 'none' }} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={saveItem} disabled={saving || !form.title.trim()}>
                {saving ? 'جاري الحفظ...' : editId ? 'حفظ' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
