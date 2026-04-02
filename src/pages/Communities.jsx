import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, Building2, X } from 'lucide-react'

const EMPTY_FORM = { name: '', description: '', location: '', status: 'active' }

export default function Communities() {
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchCommunities() }, [])

  async function fetchCommunities() {
    setLoading(true)
    const { data } = await supabase.from('communities').select('*').order('created_at', { ascending: false })
    setCommunities(data || [])
    setLoading(false)
  }

  const filtered = communities.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() { setForm(EMPTY_FORM); setError(''); setModal('create') }
  function openEdit(c) { setSelected(c); setForm({ name: c.name||'', description: c.description||'', location: c.location||'', status: c.status||'active' }); setError(''); setModal('edit') }
  function openDelete(c) { setSelected(c); setModal('delete') }
  function closeModal() { setModal(null); setSelected(null); setError('') }
  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function handleSave() {
    if (!form.name.trim()) { setError('اسم المجتمع مطلوب'); return }
    setSaving(true)
    setError('')
    const payload = { name: form.name.trim(), description: form.description||null, location: form.location||null, status: form.status }
    let err
    if (modal === 'create') { ;({ error: err } = await supabase.from('communities').insert([payload])) }
    else { ;({ error: err } = await supabase.from('communities').update(payload).eq('id', selected.id)) }
    if (err) setError(err.message)
    else { await fetchCommunities(); closeModal() }
    setSaving(false)
  }

  async function handleDelete() {
    setSaving(true)
    await supabase.from('communities').delete().eq('id', selected.id)
    await fetchCommunities()
    closeModal()
    setSaving(false)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">المجتمعات</h1>
          <p className="page-subtitle">إدارة مجتمعات منصة سرة</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          إضافة مجتمع
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="toolbar">
            <div className="search-wrap">
              <input type="text" placeholder="ابحث عن مجتمع..." value={search} onChange={e => setSearch(e.target.value)} />
              <Search size={15} className="search-icon" />
            </div>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>
            ) : filtered.length === 0 ? (
              <div className="empty-state"><Building2 size={40} /><p>لا توجد مجتمعات</p></div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>المجتمع</th>
                    <th>الموقع</th>
                    <th>الحالة</th>
                    <th>تاريخ الإنشاء</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ color: '#f3eeff', fontWeight: 600 }}>{c.name}</div>
                        {c.description && <div style={{ fontSize: '12px', color: '#7c4dda', marginTop: '2px' }}>{c.description.slice(0, 60)}</div>}
                      </td>
                      <td>{c.location || '—'}</td>
                      <td>
                        <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {c.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td>{c.created_at ? new Date(c.created_at).toLocaleDateString('ar-SA') : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-icon" onClick={() => openEdit(c)}><Pencil size={14} /></button>
                          <button className="btn-icon danger" onClick={() => openDelete(c)}><Trash2 size={14} /></button>
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

      {(modal === 'create' || modal === 'edit') && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <Building2 size={20} color="#c084fc" />
              {modal === 'create' ? 'إضافة مجتمع جديد' : 'تعديل المجتمع'}
              <button onClick={closeModal} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto', padding: '4px' }}><X size={18} /></button>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <div className="form-group">
              <label className="form-label">اسم المجتمع *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="اسم المجتمع" />
            </div>
            <div className="form-group">
              <label className="form-label">الوصف</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="وصف المجتمع" rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الموقع</label>
                <input name="location" value={form.location} onChange={handleChange} placeholder="المدينة / المنطقة" />
              </div>
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
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

      {modal === 'delete' && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: '#ef4444' }}><Trash2 size={20} />حذف المجتمع</div>
            <p style={{ color: '#c4aaef', fontSize: '14px', lineHeight: 1.6 }}>
              هل أنت متأكد من حذف مجتمع <strong style={{ color: '#f3eeff' }}>"{selected?.name}"</strong>؟
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>إلغاء</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'جاري الحذف...' : 'حذف نهائياً'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
