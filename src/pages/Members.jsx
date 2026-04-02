import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, Users, X, Phone, Mail } from 'lucide-react'

const EMPTY_FORM = {
  name: '', email: '', phone: '', role: 'member',
  status: 'active', join_date: '', community_id: '',
}

const ROLE_OPTIONS = [
  { value: 'admin',   label: 'مدير'    },
  { value: 'leader',  label: 'قائد'    },
  { value: 'member',  label: 'عضو'     },
  { value: 'guest',   label: 'ضيف'     },
]

const STATUS_OPTIONS = [
  { value: 'active',   label: 'نشط'    },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'pending',  label: 'معلق'   },
]

const roleBadge = (role) => {
  const map = {
    admin:  { cls: 'badge-danger',  label: 'مدير'  },
    leader: { cls: 'badge-warning', label: 'قائد'  },
    member: { cls: 'badge-purple',  label: 'عضو'   },
    guest:  { cls: 'badge-success', label: 'ضيف'   },
  }
  const m = map[role] || { cls: 'badge-purple', label: role || 'عضو' }
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}

const statusBadge = (status) => {
  const map = {
    active:   { cls: 'badge-success', label: 'نشط'    },
    inactive: { cls: 'badge-danger',  label: 'غير نشط' },
    pending:  { cls: 'badge-warning', label: 'معلق'   },
  }
  const m = map[status] || { cls: 'badge-purple', label: status || '—' }
  return <span className={`badge ${m.cls}`}>{m.label}</span>
}

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchMembers() }, [])

  async function fetchMembers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setMembers(data || [])
    setLoading(false)
  }

  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.phone || '').includes(q)
    const matchRole = !filterRole || m.role === filterRole
    return matchSearch && matchRole
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setError('')
    setModal('create')
  }

  function openEdit(member) {
    setSelected(member)
    setForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      role: member.role || 'member',
      status: member.status || 'active',
      join_date: member.join_date || '',
      community_id: member.community_id || '',
    })
    setError('')
    setModal('edit')
  }

  function openDelete(member) {
    setSelected(member)
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
    if (!form.name.trim()) { setError('اسم العضو مطلوب'); return }
    setSaving(true)
    setError('')

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      role: form.role,
      status: form.status,
      join_date: form.join_date || null,
      community_id: form.community_id || null,
    }

    let err
    if (modal === 'create') {
      ;({ error: err } = await supabase.from('members').insert([payload]))
    } else {
      ;({ error: err } = await supabase.from('members').update(payload).eq('id', selected.id))
    }

    if (err) {
      setError(err.message)
    } else {
      await fetchMembers()
      closeModal()
    }
    setSaving(false)
  }

  async function handleDelete() {
    setSaving(true)
    const { error: err } = await supabase.from('members').delete().eq('id', selected.id)
    if (!err) {
      await fetchMembers()
      closeModal()
    }
    setSaving(false)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">الأعضاء</h1>
          <p className="page-subtitle">إدارة أعضاء مجتمع SUDDA</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} />
          إضافة عضو
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="toolbar">
            <div className="search-wrap">
              <input
                type="text"
                placeholder="ابحث عن عضو..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search size={15} className="search-icon" />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              style={{ width: 'auto', minWidth: '120px' }}
            >
              <option value="">جميع الأدوار</option>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <span style={{ fontSize: '13px', color: '#7c4dda' }}>{filtered.length} عضو</span>
          </div>

          <div className="table-container">
            {loading ? (
              <div className="loading-wrap">
                <div className="spinner" />
                <span>جاري التحميل...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Users size={40} />
                <p>لا يوجد أعضاء</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>العضو</th>
                    <th>البريد الإلكتروني</th>
                    <th>الهاتف</th>
                    <th>تاريخ الانضمام</th>
                    <th>الدور</th>
                    <th>الحالة</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(member => {
                    const initials = (member.name || 'AA').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
                    return (
                      <tr key={member.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #7c4dda, #3D2080)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0
                            }}>
                              {initials}
                            </div>
                            <span style={{ color: '#f3eeff', fontWeight: 600 }}>{member.name}</span>
                          </div>
                        </td>
                        <td>
                          {member.email ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', direction: 'ltr' }}>
                              <Mail size={12} color="#7c4dda" />
                              {member.email}
                            </div>
                          ) : '—'}
                        </td>
                        <td>
                          {member.phone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', direction: 'ltr' }}>
                              <Phone size={12} color="#7c4dda" />
                              {member.phone}
                            </div>
                          ) : '—'}
                        </td>
                        <td>{member.join_date ? new Date(member.join_date).toLocaleDateString('ar-SA') : '—'}</td>
                        <td>{roleBadge(member.role)}</td>
                        <td>{statusBadge(member.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-icon" onClick={() => openEdit(member)}>
                              <Pencil size={14} />
                            </button>
                            <button className="btn-icon danger" onClick={() => openDelete(member)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
              <Users size={20} color="#c084fc" />
              {modal === 'create' ? 'إضافة عضو جديد' : 'تعديل بيانات العضو'}
              <button onClick={closeModal} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <div className="form-group">
              <label className="form-label">الاسم الكامل *</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="الاسم الكامل" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com" style={{ direction: 'ltr' }} />
              </div>
              <div className="form-group">
                <label className="form-label">رقم الهاتف</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="05xxxxxxxx" style={{ direction: 'ltr' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الدور</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">تاريخ الانضمام</label>
              <input name="join_date" type="date" value={form.join_date} onChange={handleChange} style={{ direction: 'ltr' }} />
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
              حذف العضو
            </div>
            <p style={{ color: '#c4aaef', fontSize: '14px', lineHeight: 1.6 }}>
              هل أنت متأكد من حذف العضو <strong style={{ color: '#f3eeff' }}>"{selected?.name}"</strong>؟ لا يمكن التراجع عن هذا الإجراء.
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
