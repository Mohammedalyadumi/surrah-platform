import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { DollarSign, Plus, Trash2, Pencil, X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import EventPageHeader from '../../components/EventPageHeader'

const CATEGORIES = [
  { value: 'venue',         label: 'قاعة الفعاليات',       color: '#7c4dda' },
  { value: 'catering',      label: 'الضيافة والتغذية',      color: '#10b981' },
  { value: 'marketing',     label: 'التسويق والإعلان',      color: '#3b82f6' },
  { value: 'entertainment', label: 'الترفيه والبرامج',      color: '#f59e0b' },
  { value: 'technical',     label: 'التقنية والصوت والضوء', color: '#8b5cf6' },
  { value: 'staffing',      label: 'الكوادر والموظفون',     color: '#ec4899' },
  { value: 'contingency',   label: 'الطوارئ والاحتياطي',    color: '#ef4444' },
  { value: 'other',         label: 'أخرى',                  color: '#6b7280' },
]

const PAYMENT_STATUS = [
  { value: 'pending',  label: 'معلق',   cls: 'badge-warning' },
  { value: 'paid',     label: 'مدفوع',  cls: 'badge-success' },
  { value: 'overdue',  label: 'متأخر',  cls: 'badge-danger'  },
]

const EMPTY_FORM = { category: 'venue', description: '', estimated_cost: '', actual_cost: '', vendor: '', payment_status: 'pending' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a0a35', border: '1px solid rgba(124,77,218,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px' }}>
      <p style={{ color: '#f3eeff', fontWeight: 700, marginBottom: '6px' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {Number(p.value).toLocaleString()} ر.س</p>)}
    </div>
  )
}

export default function EventBudget() {
  const { id } = useParams()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [editId, setEditId]   = useState(null)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { fetchItems() }, [id])

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase.from('budget_items_v2').select('*').eq('event_id', id).order('category').order('created_at')
    setItems(data || [])
    setLoading(false)
  }

  const totals = useMemo(() => {
    const estimated = items.reduce((s, i) => s + (i.estimated_cost || 0), 0)
    const actual    = items.reduce((s, i) => s + (i.actual_cost    || 0), 0)
    return { estimated, actual, variance: estimated - actual, pct: estimated ? Math.round((actual / estimated) * 100) : 0 }
  }, [items])

  const chartData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catItems = items.filter(i => i.category === cat.value)
      const estimated = catItems.reduce((s, i) => s + (i.estimated_cost || 0), 0)
      const actual    = catItems.reduce((s, i) => s + (i.actual_cost    || 0), 0)
      return estimated + actual > 0 ? { name: cat.label, 'مخطط': estimated, 'فعلي': actual } : null
    }).filter(Boolean)
  }, [items])

  function openCreate(cat = 'venue') { setForm({ ...EMPTY_FORM, category: cat }); setEditId(null); setModal('form') }
  function openEdit(item) {
    setEditId(item.id)
    setForm({ category: item.category, description: item.description || '', estimated_cost: item.estimated_cost || '', actual_cost: item.actual_cost || '', vendor: item.vendor || '', payment_status: item.payment_status || 'pending' })
    setModal('form')
  }

  async function saveItem() {
    if (!form.description.trim()) return
    setSaving(true)
    const payload = { ...form, event_id: id, estimated_cost: Number(form.estimated_cost) || 0, actual_cost: Number(form.actual_cost) || 0 }
    if (editId) {
      await supabase.from('budget_items_v2').update(payload).eq('id', editId)
    } else {
      await supabase.from('budget_items_v2').insert([payload])
    }
    await fetchItems(); setModal(null); setSaving(false)
  }

  async function deleteItem(iid) {
    await supabase.from('budget_items_v2').delete().eq('id', iid)
    setItems(x => x.filter(i => i.id !== iid))
  }

  const catMeta = (v) => CATEGORIES.find(c => c.value === v) || CATEGORIES[CATEGORIES.length - 1]
  const payMeta = (v) => PAYMENT_STATUS.find(p => p.value === v) || PAYMENT_STATUS[0]

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>

  return (
    <>
      <EventPageHeader
        title="الميزانية"
        icon={DollarSign}
        eventId={id}
        actions={
          <button className="btn btn-primary" onClick={() => openCreate()}>
            <Plus size={15} />إضافة بند
          </button>
        }
      />

      {/* Budget Summary Cards */}
      <div className="budget-summary-row">
        <div className="budget-summary-card">
          <div className="budget-summary-icon" style={{ background: 'rgba(124,77,218,0.15)', color: '#7c4dda' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div className="budget-summary-label">الميزانية المخططة</div>
            <div className="budget-summary-value">{totals.estimated.toLocaleString()} ر.س</div>
          </div>
        </div>
        <div className="budget-summary-card">
          <div className="budget-summary-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
            <TrendingDown size={20} />
          </div>
          <div>
            <div className="budget-summary-label">المصروف الفعلي</div>
            <div className="budget-summary-value" style={{ color: '#ef4444' }}>{totals.actual.toLocaleString()} ر.س</div>
          </div>
        </div>
        <div className="budget-summary-card">
          <div className="budget-summary-icon" style={{ background: totals.variance >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: totals.variance >= 0 ? '#10b981' : '#ef4444' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="budget-summary-label">الفارق (وفر / عجز)</div>
            <div className="budget-summary-value" style={{ color: totals.variance >= 0 ? '#10b981' : '#ef4444' }}>
              {totals.variance >= 0 ? '+' : ''}{totals.variance.toLocaleString()} ر.س
            </div>
          </div>
        </div>
        <div className="budget-summary-card">
          <div style={{ flex: 1 }}>
            <div className="budget-summary-label">نسبة الإنفاق</div>
            <div className="budget-summary-value">{totals.pct}%</div>
            <div className="ev-progress-bar" style={{ marginTop: '8px' }}>
              <div className="ev-progress-fill" style={{ width: `${Math.min(totals.pct, 100)}%`, background: totals.pct > 90 ? '#ef4444' : totals.pct > 70 ? '#f59e0b' : '#10b981' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <span className="card-title">المخطط / الفعلي حسب الفئة</span>
          </div>
          <div className="card-body" style={{ paddingTop: '8px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,77,218,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#7c4dda', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7c4dda', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#a07ee8' }} />
                <Bar dataKey="مخطط" fill="#7c4dda" radius={[4, 4, 0, 0]} />
                <Bar dataKey="فعلي"  fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Budget Table by Category */}
      {items.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <DollarSign size={40} />
              <p>لا توجد بنود في الميزانية بعد</p>
              <button className="btn btn-primary" onClick={() => openCreate()} style={{ marginTop: '12px' }}>
                <Plus size={15} />إضافة أول بند
              </button>
            </div>
          </div>
        </div>
      ) : (
        CATEGORIES.map(cat => {
          const catItems = items.filter(i => i.category === cat.value)
          if (!catItems.length) return null
          const catEst = catItems.reduce((s, i) => s + (i.estimated_cost || 0), 0)
          const catAct = catItems.reduce((s, i) => s + (i.actual_cost    || 0), 0)
          return (
            <div key={cat.value} className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header" style={{ borderRight: `4px solid ${cat.color}` }}>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                  {cat.label}
                </span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#7c4dda' }}>مخطط: {catEst.toLocaleString()} ر.س</span>
                  <span style={{ fontSize: '12px', color: '#ef4444' }}>فعلي: {catAct.toLocaleString()} ر.س</span>
                  <button className="btn-icon" style={{ padding: '4px' }} onClick={() => openCreate(cat.value)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>البيان</th>
                      <th>المورد</th>
                      <th>المبلغ المخطط</th>
                      <th>المبلغ الفعلي</th>
                      <th>الفارق</th>
                      <th>الدفع</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {catItems.map(item => {
                      const variance = (item.estimated_cost || 0) - (item.actual_cost || 0)
                      const pm = payMeta(item.payment_status)
                      return (
                        <tr key={item.id}>
                          <td style={{ color: '#f3eeff', fontWeight: 600 }}>{item.description}</td>
                          <td>{item.vendor || '—'}</td>
                          <td style={{ direction: 'ltr', textAlign: 'right' }}>{Number(item.estimated_cost || 0).toLocaleString()} ر.س</td>
                          <td style={{ direction: 'ltr', textAlign: 'right', color: '#ef4444' }}>{Number(item.actual_cost || 0).toLocaleString()} ر.س</td>
                          <td style={{ direction: 'ltr', textAlign: 'right', color: variance >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                            {variance >= 0 ? '+' : ''}{variance.toLocaleString()} ر.س
                          </td>
                          <td><span className={`badge ${pm.cls}`}>{pm.label}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button className="btn-icon" style={{ padding: '4px' }} onClick={() => openEdit(item)}><Pencil size={13} /></button>
                              <button className="btn-icon danger" style={{ padding: '4px' }} onClick={() => deleteItem(item.id)}><Trash2 size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    <tr style={{ background: 'rgba(124,77,218,0.05)' }}>
                      <td colSpan={2} style={{ fontWeight: 700, color: '#c4aaef' }}>المجموع</td>
                      <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 700, color: '#f3eeff' }}>{catEst.toLocaleString()} ر.س</td>
                      <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>{catAct.toLocaleString()} ر.س</td>
                      <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 700, color: catEst - catAct >= 0 ? '#10b981' : '#ef4444' }}>
                        {(catEst - catAct) >= 0 ? '+' : ''}{(catEst - catAct).toLocaleString()} ر.س
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )
        })
      )}

      {/* Grand Total */}
      {items.length > 0 && (
        <div className="budget-grand-total">
          <span>الإجمالي الكلي</span>
          <div style={{ display: 'flex', gap: '32px' }}>
            <span>مخطط: <strong>{totals.estimated.toLocaleString()} ر.س</strong></span>
            <span style={{ color: '#ef4444' }}>فعلي: <strong>{totals.actual.toLocaleString()} ر.س</strong></span>
            <span style={{ color: totals.variance >= 0 ? '#10b981' : '#ef4444' }}>
              الفارق: <strong>{totals.variance >= 0 ? '+' : ''}{totals.variance.toLocaleString()} ر.س</strong>
            </span>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal === 'form' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <DollarSign size={18} color="#c084fc" />
              {editId ? 'تعديل البند' : 'إضافة بند ميزانية'}
              <button onClick={() => setModal(null)} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto' }}><X size={18} /></button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الفئة</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">حالة الدفع</label>
                <select value={form.payment_status} onChange={e => setForm(f => ({ ...f, payment_status: e.target.value }))}>
                  {PAYMENT_STATUS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">البيان / الوصف *</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف البند" />
            </div>

            <div className="form-group">
              <label className="form-label">المورد / الجهة</label>
              <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} placeholder="اسم المورد أو الشركة" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المبلغ المخطط (ر.س)</label>
                <input type="number" value={form.estimated_cost} onChange={e => setForm(f => ({ ...f, estimated_cost: e.target.value }))} placeholder="0" min="0" style={{ direction: 'ltr' }} />
              </div>
              <div className="form-group">
                <label className="form-label">المبلغ الفعلي (ر.س)</label>
                <input type="number" value={form.actual_cost} onChange={e => setForm(f => ({ ...f, actual_cost: e.target.value }))} placeholder="0" min="0" style={{ direction: 'ltr' }} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={saveItem} disabled={saving || !form.description.trim()}>
                {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
