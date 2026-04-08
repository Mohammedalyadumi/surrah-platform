import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { FileText, Plus, Trash2, Save, Check, Target, Info } from 'lucide-react'
import EventPageHeader from '../../components/EventPageHeader'

const EVENT_TYPES = ['مؤتمر', 'ورشة عمل', 'حفل تكريم', 'معرض', 'حفل غلا', 'ملتقى', 'ندوة', 'يوم مفتوح', 'فعالية رياضية', 'أخرى']
const STATUS_OPTIONS = [
  { value: 'draft',     label: 'مسودة',    cls: 'badge-purple'  },
  { value: 'submitted', label: 'مُرسل',    cls: 'badge-warning' },
  { value: 'approved',  label: 'مُعتمد',   cls: 'badge-success' },
  { value: 'rejected',  label: 'مرفوض',    cls: 'badge-danger'  },
]

const EMPTY = {
  type: '', theme: '', venue: '', target_market: '',
  target_attendees: '', description: '', mission: '',
  objectives: [], status: 'draft',
}

export default function EventProposal() {
  const { id } = useParams()
  const [form, setForm]       = useState(EMPTY)
  const [proposalId, setProposalId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [newObj, setNewObj]   = useState('')
  const [activeSection, setActiveSection] = useState('basic')

  useEffect(() => { fetchProposal() }, [id])

  async function fetchProposal() {
    setLoading(true)
    const { data } = await supabase.from('event_proposals').select('*').eq('event_id', id).maybeSingle()
    if (data) {
      setProposalId(data.id)
      setForm({
        type:              data.type              || '',
        theme:             data.theme             || '',
        venue:             data.venue             || '',
        target_market:     data.target_market     || '',
        target_attendees:  data.target_attendees  || '',
        description:       data.description       || '',
        mission:           data.mission           || '',
        objectives:        Array.isArray(data.objectives) ? data.objectives : [],
        status:            data.status            || 'draft',
      })
    }
    setLoading(false)
  }

  function handle(key, value) { setForm(f => ({ ...f, [key]: value })) }

  function addObjective() {
    if (!newObj.trim()) return
    setForm(f => ({ ...f, objectives: [...f.objectives, newObj.trim()] }))
    setNewObj('')
  }

  function removeObjective(i) {
    setForm(f => ({ ...f, objectives: f.objectives.filter((_, idx) => idx !== i) }))
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      event_id:         id,
      type:             form.type,
      theme:            form.theme,
      venue:            form.venue,
      target_market:    form.target_market,
      target_attendees: form.target_attendees ? Number(form.target_attendees) : null,
      description:      form.description,
      mission:          form.mission,
      objectives:       form.objectives,
      status:           form.status,
    }
    if (proposalId) {
      await supabase.from('event_proposals').update(payload).eq('id', proposalId)
    } else {
      const { data } = await supabase.from('event_proposals').insert([payload]).select().single()
      if (data) setProposalId(data.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const sections = [
    { key: 'basic',       label: 'التفاصيل الأساسية', icon: Info },
    { key: 'description', label: 'الوصف والرسالة',    icon: FileText },
    { key: 'objectives',  label: 'الأهداف',           icon: Target },
    { key: 'status',      label: 'الحالة',            icon: Check },
  ]

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>

  const currentStatus = STATUS_OPTIONS.find(s => s.value === form.status)

  return (
    <>
      <EventPageHeader title="مقترح الفعالية" icon={FileText} eventId={id} />

      <div className="proposal-layout">
        {/* Section Tabs */}
        <div className="proposal-tabs">
          {sections.map(s => (
            <button
              key={s.key}
              className={`proposal-tab ${activeSection === s.key ? 'active' : ''}`}
              onClick={() => setActiveSection(s.key)}
            >
              <s.icon size={15} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card animate-fade">
          <div className="card-header">
            <span className="card-title">{sections.find(s => s.key === activeSection)?.label}</span>
            {currentStatus && <span className={`badge ${currentStatus.cls}`}>{currentStatus.label}</span>}
          </div>
          <div className="card-body">

            {activeSection === 'basic' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">نوع الفعالية</label>
                    <select value={form.type} onChange={e => handle('type', e.target.value)}>
                      <option value="">اختر نوع الفعالية</option>
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">اسم / ثيم الفعالية</label>
                    <input value={form.theme} onChange={e => handle('theme', e.target.value)} placeholder="مثال: قمة الابتكار 2025" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">المكان المقترح</label>
                    <input value={form.venue} onChange={e => handle('venue', e.target.value)} placeholder="اسم القاعة أو المكان" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الجمهور المستهدف</label>
                    <input value={form.target_market} onChange={e => handle('target_market', e.target.value)} placeholder="مثال: رواد الأعمال، طلاب الجامعات" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">العدد المستهدف من الحضور</label>
                    <input type="number" value={form.target_attendees} onChange={e => handle('target_attendees', e.target.value)} placeholder="500" min="0" style={{ direction: 'ltr' }} />
                  </div>
                </div>
              </>
            )}

            {activeSection === 'description' && (
              <>
                <div className="form-group">
                  <label className="form-label">وصف الفعالية</label>
                  <textarea
                    value={form.description}
                    onChange={e => handle('description', e.target.value)}
                    rows={8}
                    placeholder="اكتب وصفاً تفصيلياً للفعالية، طبيعتها، محاورها الرئيسية، وما تقدمه للحضور..."
                    style={{ resize: 'vertical', lineHeight: 1.8 }}
                  />
                  <div style={{ fontSize: '11px', color: '#5b30b8', marginTop: '6px' }}>
                    {form.description.length} حرف
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">رسالة الفعالية</label>
                  <textarea
                    value={form.mission}
                    onChange={e => handle('mission', e.target.value)}
                    rows={4}
                    placeholder="ما الرسالة أو القيمة التي تسعى الفعالية لتحقيقها؟"
                    style={{ resize: 'vertical', lineHeight: 1.8 }}
                  />
                </div>
              </>
            )}

            {activeSection === 'objectives' && (
              <>
                <p style={{ fontSize: '13px', color: '#7c4dda', marginBottom: '20px' }}>
                  أضف أهداف الفعالية بشكل واضح وقابل للقياس. يُنصح بأن تكون الأهداف وفق منهجية SMART.
                </p>
                {form.objectives.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <Target size={32} />
                    <p>لا توجد أهداف بعد — أضف أول هدف أدناه</p>
                  </div>
                ) : (
                  <div className="objectives-list">
                    {form.objectives.map((obj, i) => (
                      <div key={i} className="objective-item">
                        <div className="objective-num">{i + 1}</div>
                        <div className="objective-text">{obj}</div>
                        <button className="btn-icon danger" onClick={() => removeObjective(i)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="objective-add-row">
                  <input
                    value={newObj}
                    onChange={e => setNewObj(e.target.value)}
                    placeholder="أدخل هدفاً جديداً..."
                    onKeyDown={e => { if (e.key === 'Enter') addObjective() }}
                  />
                  <button className="btn btn-primary" onClick={addObjective}>
                    <Plus size={15} />
                    إضافة هدف
                  </button>
                </div>
              </>
            )}

            {activeSection === 'status' && (
              <>
                <p style={{ fontSize: '13px', color: '#7c4dda', marginBottom: '24px' }}>
                  حدد حالة المقترح الحالية. يمكن تغييرها في أي وقت.
                </p>
                <div className="status-options-grid">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s.value}
                      className={`status-option-card ${form.status === s.value ? 'selected' : ''}`}
                      onClick={() => handle('status', s.value)}
                    >
                      <span className={`badge ${s.cls}`} style={{ fontSize: '14px', padding: '6px 18px' }}>{s.label}</span>
                      <div className="status-option-desc">
                        {s.value === 'draft'     && 'المقترح قيد الإعداد ولم يُرسل بعد'}
                        {s.value === 'submitted' && 'تم إرسال المقترح وبانتظار المراجعة'}
                        {s.value === 'approved'  && 'تمت الموافقة على المقترح'}
                        {s.value === 'rejected'  && 'تم رفض المقترح، يتطلب مراجعة'}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ gap: '8px', padding: '12px 28px' }}>
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ!' : 'حفظ المقترح'}
          </button>
        </div>
      </div>
    </>
  )
}
