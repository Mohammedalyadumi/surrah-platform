import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { AlertTriangle, Plus, Trash2, Pencil, X } from 'lucide-react'
import EventPageHeader from '../../components/EventPageHeader'

const CATEGORIES = ['تشغيلية', 'مالية', 'تقنية', 'سمعة', 'سلامة', 'طقس', 'أخرى']
const STATUS_OPTIONS = [
  { value: 'open',       label: 'مفتوح',   cls: 'badge-danger'  },
  { value: 'mitigated',  label: 'مخفف',    cls: 'badge-warning' },
  { value: 'closed',     label: 'مغلق',    cls: 'badge-success' },
]

const EMPTY_FORM = { description: '', category: 'تشغيلية', likelihood: 3, impact: 3, mitigation: '', owner: '', status: 'open' }

function riskLevel(score) {
  if (score >= 20) return { label: 'حرج',    color: '#7f1d1d', text: '#fca5a5' }
  if (score >= 15) return { label: 'عالي',   color: '#ef4444', text: '#fff' }
  if (score >= 10) return { label: 'متوسط+', color: '#f97316', text: '#fff' }
  if (score >= 5)  return { label: 'متوسط',  color: '#f59e0b', text: '#fff' }
  if (score >= 3)  return { label: 'منخفض+', color: '#84cc16', text: '#fff' }
  return             { label: 'منخفض',  color: '#10b981', text: '#fff' }
}

function cellColor(l, i) {
  const s = l * i
  if (s >= 20) return '#7f1d1d'
  if (s >= 15) return 'rgba(239,68,68,0.7)'
  if (s >= 10) return 'rgba(249,115,22,0.6)'
  if (s >= 5)  return 'rgba(245,158,11,0.55)'
  if (s >= 3)  return 'rgba(132,204,22,0.45)'
  return 'rgba(16,185,129,0.35)'
}

export default function EventRisks() {
  const { id } = useParams()
  const [risks, setRisks]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [editId, setEditId]   = useState(null)
  const [saving, setSaving]   = useState(false)
  const [view, setView]       = useState('table') // 'table' | 'matrix'

  useEffect(() => { fetchRisks() }, [id])

  async function fetchRisks() {
    setLoading(true)
    const { data } = await supabase.from('risks').select('*').eq('event_id', id).order('created_at', { ascending: false })
    setRisks(data || [])
    setLoading(false)
  }

  // Sort by score desc
  const sorted = useMemo(() => [...risks].sort((a, b) => (b.likelihood * b.impact) - (a.likelihood * a.impact)), [risks])

  // Matrix: for each cell (likelihood 1-5, impact 1-5), collect risks
  const matrixCells = useMemo(() => {
    const cells = {}
    risks.forEach(r => {
      const key = `${r.likelihood}-${r.impact}`
      if (!cells[key]) cells[key] = []
      cells[key].push(r)
    })
    return cells
  }, [risks])

  function openCreate() { setForm(EMPTY_FORM); setEditId(null); setModal('form') }
  function openEdit(r) {
    setEditId(r.id)
    setForm({ description: r.description, category: r.category || 'تشغيلية', likelihood: r.likelihood, impact: r.impact, mitigation: r.mitigation || '', owner: r.owner || '', status: r.status || 'open' })
    setModal('form')
  }

  async function saveRisk() {
    if (!form.description.trim()) return
    setSaving(true)
    const payload = { ...form, event_id: id, likelihood: Number(form.likelihood), impact: Number(form.impact) }
    if (editId) {
      await supabase.from('risks').update(payload).eq('id', editId)
    } else {
      await supabase.from('risks').insert([payload])
    }
    await fetchRisks(); setModal(null); setSaving(false)
  }

  async function deleteRisk(rid) {
    await supabase.from('risks').delete().eq('id', rid)
    setRisks(r => r.filter(x => x.id !== rid))
  }

  const statMeta = (v) => STATUS_OPTIONS.find(s => s.value === v) || STATUS_OPTIONS[0]
  const highCount = risks.filter(r => r.likelihood * r.impact >= 15).length
  const openCount = risks.filter(r => r.status === 'open').length

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>

  return (
    <>
      <EventPageHeader
        title="المخاطر"
        icon={AlertTriangle}
        eventId={id}
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={15} />إضافة مخاطرة
          </button>
        }
      />

      {/* Summary */}
      <div className="risk-summary-row">
        <div className="risk-summary-pill">
          <span style={{ fontSize: '22px', fontWeight: 900, color: '#f3eeff' }}>{risks.length}</span>
          <span style={{ fontSize: '12px', color: '#7c4dda' }}>إجمالي المخاطر</span>
        </div>
        <div className="risk-summary-pill" style={{ borderColor: highCount > 0 ? 'rgba(239,68,68,0.4)' : undefined }}>
          <span style={{ fontSize: '22px', fontWeight: 900, color: highCount > 0 ? '#ef4444' : '#f3eeff' }}>{highCount}</span>
          <span style={{ fontSize: '12px', color: '#7c4dda' }}>مخاطر عالية</span>
        </div>
        <div className="risk-summary-pill">
          <span style={{ fontSize: '22px', fontWeight: 900, color: openCount > 0 ? '#f59e0b' : '#10b981' }}>{openCount}</span>
          <span style={{ fontSize: '12px', color: '#7c4dda' }}>مخاطر مفتوحة</span>
        </div>
        <div style={{ marginRight: 'auto', display: 'flex', gap: '8px' }}>
          <button className={`btn ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('table')}>سجل المخاطر</button>
          <button className={`btn ${view === 'matrix' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('matrix')}>مصفوفة المخاطر</button>
        </div>
      </div>

      {view === 'matrix' ? (
        <RiskMatrix risks={risks} matrixCells={matrixCells} onEdit={openEdit} />
      ) : (
        <div className="card">
          {risks.length === 0 ? (
            <div className="card-body">
              <div className="empty-state">
                <AlertTriangle size={40} />
                <p>لا توجد مخاطر مسجلة بعد</p>
                <button className="btn btn-primary" onClick={openCreate} style={{ marginTop: '12px' }}>
                  <Plus size={15} />إضافة مخاطرة
                </button>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>وصف المخاطرة</th>
                    <th>الفئة</th>
                    <th>الاحتمالية</th>
                    <th>التأثير</th>
                    <th>الدرجة</th>
                    <th>المستوى</th>
                    <th>خطة التخفيف</th>
                    <th>المسؤول</th>
                    <th>الحالة</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(r => {
                    const score = r.likelihood * r.impact
                    const level = riskLevel(score)
                    const sm = statMeta(r.status)
                    return (
                      <tr key={r.id}>
                        <td style={{ color: '#f3eeff', fontWeight: 600, maxWidth: '200px' }}>{r.description}</td>
                        <td><span className="badge badge-purple" style={{ fontSize: '11px' }}>{r.category}</span></td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="risk-scale-bar">
                            {[1,2,3,4,5].map(n => <div key={n} className="risk-scale-dot" style={{ background: n <= r.likelihood ? '#f59e0b' : 'rgba(124,77,218,0.15)' }} />)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="risk-scale-bar">
                            {[1,2,3,4,5].map(n => <div key={n} className="risk-scale-dot" style={{ background: n <= r.impact ? '#ef4444' : 'rgba(124,77,218,0.15)' }} />)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 900, fontSize: '18px', color: level.text }}>
                          <span style={{ background: level.color, padding: '2px 10px', borderRadius: '8px', fontSize: '14px' }}>{score}</span>
                        </td>
                        <td>
                          <span style={{ background: level.color, color: level.text, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                            {level.label}
                          </span>
                        </td>
                        <td style={{ maxWidth: '180px', fontSize: '12px', color: '#a07ee8' }}>{r.mitigation || '—'}</td>
                        <td>{r.owner || '—'}</td>
                        <td><span className={`badge ${sm.cls}`}>{sm.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn-icon" style={{ padding: '4px' }} onClick={() => openEdit(r)}><Pencil size={13} /></button>
                            <button className="btn-icon danger" style={{ padding: '4px' }} onClick={() => deleteRisk(r.id)}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modal === 'form' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <AlertTriangle size={18} color="#c084fc" />
              {editId ? 'تعديل المخاطرة' : 'إضافة مخاطرة جديدة'}
              <button onClick={() => setModal(null)} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto' }}><X size={18} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">وصف المخاطرة *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} placeholder="اصف المخاطرة بوضوح..." style={{ resize: 'none' }} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الفئة</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الاحتمالية (1-5): <strong style={{ color: '#f59e0b' }}>{form.likelihood}</strong></label>
                <input type="range" min="1" max="5" value={form.likelihood} onChange={e => setForm(f => ({ ...f, likelihood: e.target.value }))} style={{ width: '100%', direction: 'ltr' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5b30b8' }}><span>نادر</span><span>محتمل</span><span>مؤكد</span></div>
              </div>
              <div className="form-group">
                <label className="form-label">التأثير (1-5): <strong style={{ color: '#ef4444' }}>{form.impact}</strong></label>
                <input type="range" min="1" max="5" value={form.impact} onChange={e => setForm(f => ({ ...f, impact: e.target.value }))} style={{ width: '100%', direction: 'ltr' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5b30b8' }}><span>ضعيف</span><span>متوسط</span><span>كارثي</span></div>
              </div>
            </div>

            <div style={{ background: riskLevel(form.likelihood * form.impact).color, borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: riskLevel(form.likelihood * form.impact).text, fontWeight: 700 }}>درجة المخاطرة: {form.likelihood * form.impact}</span>
              <span style={{ color: riskLevel(form.likelihood * form.impact).text, fontWeight: 700 }}>{riskLevel(form.likelihood * form.impact).label}</span>
            </div>

            <div className="form-group">
              <label className="form-label">خطة التخفيف</label>
              <textarea value={form.mitigation} onChange={e => setForm(f => ({ ...f, mitigation: e.target.value }))} rows={2} placeholder="كيف سيتم التعامل مع هذه المخاطرة؟" style={{ resize: 'none' }} />
            </div>

            <div className="form-group">
              <label className="form-label">المسؤول</label>
              <input value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} placeholder="من المسؤول عن هذه المخاطرة؟" />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={saveRisk} disabled={saving || !form.description.trim()}>
                {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function RiskMatrix({ risks, matrixCells, onEdit }) {
  const levels = [5, 4, 3, 2, 1] // Impact rows (top = high)
  const likelihoods = [1, 2, 3, 4, 5] // Likelihood columns

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">مصفوفة المخاطر 5×5</span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          {[{ c: '#10b981', l: 'منخفض' }, { c: '#f59e0b', l: 'متوسط' }, { c: '#ef4444', l: 'عالي' }, { c: '#7f1d1d', l: 'حرج' }].map(x => (
            <span key={x.l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: x.c, display: 'inline-block' }} />
              {x.l}
            </span>
          ))}
        </div>
      </div>
      <div className="card-body">
        <div className="risk-matrix-wrap">
          {/* Y-axis label */}
          <div className="risk-matrix-ylabel">التأثير →</div>
          <div>
            {/* Matrix grid */}
            <div className="risk-matrix-grid">
              {/* Y axis labels */}
              <div className="risk-matrix-ylabels">
                {levels.map(i => <div key={i} className="risk-matrix-ylabel">{i}</div>)}
              </div>
              {/* Cells */}
              <div className="risk-matrix-cells">
                {levels.map(impact => (
                  <div key={impact} className="risk-matrix-row">
                    {likelihoods.map(likelihood => {
                      const key = `${likelihood}-${impact}`
                      const cellRisks = matrixCells[key] || []
                      const bg = cellColor(likelihood, impact)
                      return (
                        <div
                          key={likelihood}
                          className="risk-matrix-cell"
                          style={{ background: bg }}
                        >
                          <div className="risk-matrix-score">{likelihood * impact}</div>
                          {cellRisks.map(r => (
                            <div
                              key={r.id}
                              className="risk-matrix-dot"
                              title={r.description}
                              onClick={() => onEdit(r)}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
                {/* X axis labels */}
                <div className="risk-matrix-xlabels">
                  {likelihoods.map(l => <div key={l} className="risk-matrix-xlabel">{l}</div>)}
                </div>
              </div>
            </div>
            <div className="risk-matrix-xlabel-title">← الاحتمالية</div>
          </div>
        </div>

        {/* Risk list with matrix context */}
        {risks.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#c4aaef', marginBottom: '12px' }}>المخاطر الحالية ({risks.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...risks].sort((a, b) => (b.likelihood * b.impact) - (a.likelihood * a.impact)).map(r => {
                const score = r.likelihood * r.impact
                const level = riskLevel(score)
                return (
                  <div key={r.id} className="risk-matrix-list-item" onClick={() => onEdit(r)}>
                    <div className="risk-matrix-score-badge" style={{ background: level.color, color: level.text }}>{score}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: '#f3eeff', fontWeight: 600 }}>{r.description}</div>
                      {r.owner && <div style={{ fontSize: '11px', color: '#5b30b8', marginTop: '2px' }}>المسؤول: {r.owner}</div>}
                    </div>
                    <span style={{ background: level.color, color: level.text, padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>{level.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
