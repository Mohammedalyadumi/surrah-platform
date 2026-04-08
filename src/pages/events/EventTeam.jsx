import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Users, Plus, Trash2, Pencil, X, Phone, Mail, Briefcase } from 'lucide-react'
import EventPageHeader from '../../components/EventPageHeader'

const DEPT_COLORS = ['#7c4dda', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4']
const EMPTY_DEPT = { name: '', head_name: '', head_email: '', head_phone: '', job_description: '', color: '#7c4dda' }
const EMPTY_MEMBER = { name: '', role: '', email: '', phone: '', responsibilities: '' }

export default function EventTeam() {
  const { id } = useParams()
  const [departments, setDepartments]   = useState([])
  const [members, setMembers]           = useState([])
  const [selectedDept, setSelectedDept] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [deptModal, setDeptModal]       = useState(null)   // 'create'|'edit'|'delete'
  const [memberModal, setMemberModal]   = useState(null)
  const [deptForm, setDeptForm]         = useState(EMPTY_DEPT)
  const [memberForm, setMemberForm]     = useState(EMPTY_MEMBER)
  const [saving, setSaving]             = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [view, setView]                 = useState('list') // 'list' | 'orgchart'

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    setLoading(true)
    const [dRes, mRes] = await Promise.all([
      supabase.from('departments').select('*').eq('event_id', id).order('created_at'),
      supabase.from('team_members').select('*').eq('event_id', id).order('created_at'),
    ])
    const depts = dRes.data || []
    setDepartments(depts)
    setMembers(mRes.data || [])
    if (depts.length && !selectedDept) setSelectedDept(depts[0].id)
    setLoading(false)
  }

  const deptMembers = members.filter(m => m.department_id === selectedDept)
  const selectedDeptData = departments.find(d => d.id === selectedDept)

  // Dept CRUD
  function openCreateDept() { setDeptForm({ ...EMPTY_DEPT, color: DEPT_COLORS[departments.length % DEPT_COLORS.length] }); setDeptModal('create') }
  function openEditDept(d) { setEditTarget(d); setDeptForm({ name: d.name, head_name: d.head_name || '', head_email: d.head_email || '', head_phone: d.head_phone || '', job_description: d.job_description || '', color: d.color || '#7c4dda' }); setDeptModal('edit') }
  function openDeleteDept(d) { setEditTarget(d); setDeptModal('delete') }

  async function saveDept() {
    setSaving(true)
    const payload = { ...deptForm, event_id: id }
    if (deptModal === 'create') {
      const { data } = await supabase.from('departments').insert([payload]).select().single()
      if (data) { setSelectedDept(data.id) }
    } else {
      await supabase.from('departments').update(deptForm).eq('id', editTarget.id)
    }
    await fetchAll(); setDeptModal(null); setSaving(false)
  }

  async function deleteDept() {
    setSaving(true)
    await supabase.from('team_members').delete().eq('department_id', editTarget.id)
    await supabase.from('departments').delete().eq('id', editTarget.id)
    setSelectedDept(null); await fetchAll(); setDeptModal(null); setSaving(false)
  }

  // Member CRUD
  function openCreateMember() { setMemberForm(EMPTY_MEMBER); setEditTarget(null); setMemberModal('create') }
  function openEditMember(m) { setEditTarget(m); setMemberForm({ name: m.name, role: m.role || '', email: m.email || '', phone: m.phone || '', responsibilities: m.responsibilities || '' }); setMemberModal('edit') }

  async function saveMember() {
    setSaving(true)
    const payload = { ...memberForm, event_id: id, department_id: selectedDept }
    if (memberModal === 'create') {
      await supabase.from('team_members').insert([payload])
    } else {
      await supabase.from('team_members').update(memberForm).eq('id', editTarget.id)
    }
    await fetchAll(); setMemberModal(null); setSaving(false)
  }

  async function deleteMember(mid) {
    await supabase.from('team_members').delete().eq('id', mid)
    setMembers(m => m.filter(x => x.id !== mid))
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>

  return (
    <>
      <EventPageHeader title="الفريق والأقسام" icon={Users} eventId={id} />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('list')}>قائمة الأعضاء</button>
        <button className={`btn ${view === 'orgchart' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setView('orgchart')}>المخطط التنظيمي</button>
      </div>

      {view === 'orgchart' ? (
        <OrgChart departments={departments} members={members} />
      ) : (
        <div className="team-layout">
          {/* Departments Sidebar */}
          <div className="team-dept-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#c4aaef' }}>الأقسام ({departments.length})</span>
              <button className="btn btn-primary" style={{ padding: '7px 12px', fontSize: '12px', gap: '5px' }} onClick={openCreateDept}>
                <Plus size={13} />قسم
              </button>
            </div>
            {departments.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}><Users size={28} /><p>أضف قسماً للبدء</p></div>
            ) : (
              departments.map(d => (
                <div
                  key={d.id}
                  className={`dept-item ${selectedDept === d.id ? 'active' : ''}`}
                  onClick={() => setSelectedDept(d.id)}
                  style={{ borderRight: `3px solid ${d.color || '#7c4dda'}` }}
                >
                  <div>
                    <div className="dept-item-name">{d.name}</div>
                    <div className="dept-item-meta">{members.filter(m => m.department_id === d.id).length} عضو</div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', opacity: 0 }} className="dept-item-actions">
                    <button className="btn-icon" onClick={e => { e.stopPropagation(); openEditDept(d) }}><Pencil size={12} /></button>
                    <button className="btn-icon danger" onClick={e => { e.stopPropagation(); openDeleteDept(d) }}><Trash2 size={12} /></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Members Panel */}
          <div className="team-members-panel">
            {!selectedDeptData ? (
              <div className="empty-state"><Users size={36} /><p>اختر قسماً لعرض أعضائه</p></div>
            ) : (
              <>
                {/* Dept Header */}
                <div className="dept-header-card" style={{ borderRight: `4px solid ${selectedDeptData.color}` }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f3eeff', marginBottom: '4px' }}>{selectedDeptData.name}</h3>
                    {selectedDeptData.head_name && (
                      <div style={{ fontSize: '13px', color: '#7c4dda' }}>
                        رئيس القسم: <strong style={{ color: '#c4aaef' }}>{selectedDeptData.head_name}</strong>
                        {selectedDeptData.head_email && <span style={{ marginRight: '12px' }}>📧 {selectedDeptData.head_email}</span>}
                        {selectedDeptData.head_phone && <span style={{ marginRight: '12px' }}>📞 {selectedDeptData.head_phone}</span>}
                      </div>
                    )}
                    {selectedDeptData.job_description && (
                      <p style={{ fontSize: '13px', color: '#5b30b8', marginTop: '8px', lineHeight: 1.6 }}>{selectedDeptData.job_description}</p>
                    )}
                  </div>
                  <button className="btn btn-primary" onClick={openCreateMember} style={{ flexShrink: 0 }}>
                    <Plus size={15} />إضافة عضو
                  </button>
                </div>

                {/* Members Grid */}
                {deptMembers.length === 0 ? (
                  <div className="empty-state"><Users size={36} /><p>لا يوجد أعضاء في هذا القسم بعد</p></div>
                ) : (
                  <div className="members-grid">
                    {deptMembers.map(m => (
                      <div className="member-card" key={m.id} style={{ borderTop: `3px solid ${selectedDeptData.color}` }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div className="member-avatar" style={{ background: `linear-gradient(135deg, ${selectedDeptData.color}, #1a0a35)` }}>
                            {m.name?.slice(0, 1)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="member-name">{m.name}</div>
                            {m.role && <div className="member-role"><Briefcase size={11} />{m.role}</div>}
                            {m.email && <div className="member-contact"><Mail size={11} />{m.email}</div>}
                            {m.phone && <div className="member-contact"><Phone size={11} />{m.phone}</div>}
                            {m.responsibilities && (
                              <div className="member-resp">{m.responsibilities}</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn-icon" onClick={() => openEditMember(m)}><Pencil size={13} /></button>
                            <button className="btn-icon danger" onClick={() => deleteMember(m.id)}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Department Modal */}
      {(deptModal === 'create' || deptModal === 'edit') && (
        <div className="modal-backdrop" onClick={() => setDeptModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <Users size={18} color="#c084fc" />
              {deptModal === 'create' ? 'إضافة قسم جديد' : 'تعديل القسم'}
              <button onClick={() => setDeptModal(null)} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto' }}><X size={18} /></button>
            </div>
            <div className="form-group"><label className="form-label">اسم القسم *</label>
              <input value={deptForm.name} onChange={e => setDeptForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: الخدمات اللوجستية" />
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">رئيس القسم</label>
                <input value={deptForm.head_name} onChange={e => setDeptForm(f => ({ ...f, head_name: e.target.value }))} placeholder="الاسم الكامل" />
              </div>
              <div className="form-group"><label className="form-label">لون القسم</label>
                <div className="color-input-wrap">
                  <input type="color" value={deptForm.color} onChange={e => setDeptForm(f => ({ ...f, color: e.target.value }))} className="color-input" />
                  <input value={deptForm.color} onChange={e => setDeptForm(f => ({ ...f, color: e.target.value }))} style={{ direction: 'ltr' }} />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">البريد الإلكتروني</label>
                <input value={deptForm.head_email} onChange={e => setDeptForm(f => ({ ...f, head_email: e.target.value }))} placeholder="email@example.com" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div className="form-group"><label className="form-label">رقم الهاتف</label>
                <input value={deptForm.head_phone} onChange={e => setDeptForm(f => ({ ...f, head_phone: e.target.value }))} placeholder="05XXXXXXXX" style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
            </div>
            <div className="form-group"><label className="form-label">الوصف الوظيفي للقسم</label>
              <textarea value={deptForm.job_description} onChange={e => setDeptForm(f => ({ ...f, job_description: e.target.value }))} rows={3} placeholder="مهام ومسؤوليات القسم..." style={{ resize: 'none' }} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeptModal(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={saveDept} disabled={saving || !deptForm.name.trim()}>
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deptModal === 'delete' && (
        <div className="modal-backdrop" onClick={() => setDeptModal(null)}>
          <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ color: '#ef4444' }}><Trash2 size={18} />حذف القسم</div>
            <p style={{ color: '#c4aaef', fontSize: '14px' }}>سيتم حذف قسم <strong style={{ color: '#f3eeff' }}>"{editTarget?.name}"</strong> وجميع أعضائه. هل أنت متأكد؟</p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeptModal(null)}>إلغاء</button>
              <button className="btn btn-danger" onClick={deleteDept} disabled={saving}>{saving ? '...' : 'حذف نهائياً'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {(memberModal === 'create' || memberModal === 'edit') && (
        <div className="modal-backdrop" onClick={() => setMemberModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <Users size={18} color="#c084fc" />
              {memberModal === 'create' ? 'إضافة عضو' : 'تعديل العضو'}
              <button onClick={() => setMemberModal(null)} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto' }}><X size={18} /></button>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">الاسم الكامل *</label>
                <input value={memberForm.name} onChange={e => setMemberForm(f => ({ ...f, name: e.target.value }))} placeholder="الاسم الكامل" />
              </div>
              <div className="form-group"><label className="form-label">المسمى الوظيفي</label>
                <input value={memberForm.role} onChange={e => setMemberForm(f => ({ ...f, role: e.target.value }))} placeholder="مثال: منسق لوجستي" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">البريد الإلكتروني</label>
                <input value={memberForm.email} onChange={e => setMemberForm(f => ({ ...f, email: e.target.value }))} style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
              <div className="form-group"><label className="form-label">رقم الهاتف</label>
                <input value={memberForm.phone} onChange={e => setMemberForm(f => ({ ...f, phone: e.target.value }))} style={{ direction: 'ltr', textAlign: 'right' }} />
              </div>
            </div>
            <div className="form-group"><label className="form-label">المسؤوليات</label>
              <textarea value={memberForm.responsibilities} onChange={e => setMemberForm(f => ({ ...f, responsibilities: e.target.value }))} rows={3} style={{ resize: 'none' }} placeholder="ما هي مهام ومسؤوليات هذا العضو؟" />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMemberModal(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={saveMember} disabled={saving || !memberForm.name.trim()}>
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function OrgChart({ departments, members }) {
  if (departments.length === 0) return <div className="empty-state"><Users size={36} /><p>أضف أقساماً لعرض المخطط التنظيمي</p></div>
  return (
    <div className="orgchart-container">
      <div className="orgchart-title">المخطط التنظيمي</div>
      <div className="orgchart-grid">
        {departments.map(d => {
          const deptMembers = members.filter(m => m.department_id === d.id)
          return (
            <div key={d.id} className="orgchart-dept">
              <div className="orgchart-dept-header" style={{ borderTop: `4px solid ${d.color}`, background: `${d.color}18` }}>
                <div className="orgchart-dept-name">{d.name}</div>
                {d.head_name && <div className="orgchart-dept-head">رئيس: {d.head_name}</div>}
              </div>
              <div className="orgchart-members">
                {deptMembers.map(m => (
                  <div key={m.id} className="orgchart-member">
                    <div className="orgchart-member-avatar" style={{ background: `linear-gradient(135deg, ${d.color}, #1a0a35)` }}>{m.name?.slice(0, 1)}</div>
                    <div>
                      <div className="orgchart-member-name">{m.name}</div>
                      {m.role && <div className="orgchart-member-role">{m.role}</div>}
                    </div>
                  </div>
                ))}
                {deptMembers.length === 0 && <div style={{ fontSize: '12px', color: '#5b30b8', padding: '8px', textAlign: 'center' }}>لا يوجد أعضاء</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
