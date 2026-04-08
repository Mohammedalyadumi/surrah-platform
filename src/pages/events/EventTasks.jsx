import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CheckSquare, Plus, Trash2, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react'
import EventPageHeader from '../../components/EventPageHeader'

const COLUMNS = [
  { key: 'todo',        label: 'للتنفيذ',      color: '#7c4dda', bg: 'rgba(124,77,218,0.08)'  },
  { key: 'in_progress', label: 'قيد التنفيذ',  color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
  { key: 'review',      label: 'مراجعة',       color: '#3b82f6', bg: 'rgba(59,130,246,0.08)'  },
  { key: 'done',        label: 'منجزة',        color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
]

const PRIORITIES = [
  { value: 'high',   label: 'عالية',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  { value: 'medium', label: 'متوسطة', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  { value: 'low',    label: 'منخفضة', color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
]

const EMPTY_FORM = { title: '', description: '', assigned_to: '', due_date: '', priority: 'medium', status: 'todo', department_id: '' }

export default function EventTasks() {
  const { id } = useParams()
  const [tasks, setTasks]           = useState([])
  const [departments, setDepts]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [editId, setEditId]         = useState(null)
  const [saving, setSaving]         = useState(false)
  const [filterDept, setFilterDept] = useState('')
  const [filterPerson, setFilterPerson] = useState('')

  useEffect(() => { fetchAll() }, [id])

  async function fetchAll() {
    setLoading(true)
    const [tRes, dRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('event_id', id).order('created_at'),
      supabase.from('departments').select('id,name,color').eq('event_id', id),
    ])
    setTasks(tRes.data || [])
    setDepts(dRes.data || [])
    setLoading(false)
  }

  const filtered = useMemo(() => tasks.filter(t => {
    if (filterDept   && t.department_id !== filterDept) return false
    if (filterPerson && !t.assigned_to?.toLowerCase().includes(filterPerson.toLowerCase())) return false
    return true
  }), [tasks, filterDept, filterPerson])

  const done  = tasks.filter(t => t.status === 'done').length
  const total = tasks.length
  const progress = total ? Math.round((done / total) * 100) : 0

  function openCreate(status = 'todo') {
    setForm({ ...EMPTY_FORM, status })
    setEditId(null)
    setModal('form')
  }

  function openEdit(task) {
    setEditId(task.id)
    setForm({ title: task.title, description: task.description || '', assigned_to: task.assigned_to || '', due_date: task.due_date || '', priority: task.priority || 'medium', status: task.status, department_id: task.department_id || '' })
    setModal('form')
  }

  async function saveTask() {
    if (!form.title.trim()) return
    setSaving(true)
    const payload = { ...form, event_id: id, department_id: form.department_id || null }
    if (editId) {
      await supabase.from('tasks').update(payload).eq('id', editId)
    } else {
      await supabase.from('tasks').insert([payload])
    }
    await fetchAll()
    setModal(null)
    setSaving(false)
  }

  async function deleteTask(tid) {
    await supabase.from('tasks').delete().eq('id', tid)
    setTasks(t => t.filter(x => x.id !== tid))
  }

  async function moveTask(task, direction) {
    const order = COLUMNS.map(c => c.key)
    const idx = order.indexOf(task.status)
    const next = order[idx + direction]
    if (!next) return
    await supabase.from('tasks').update({ status: next }).eq('id', task.id)
    setTasks(t => t.map(x => x.id === task.id ? { ...x, status: next } : x))
  }

  const deptColor = (deptId) => departments.find(d => d.id === deptId)?.color || '#7c4dda'
  const deptName  = (deptId) => departments.find(d => d.id === deptId)?.name || ''
  const prioMeta  = (p) => PRIORITIES.find(x => x.value === p) || PRIORITIES[1]

  if (loading) return <div className="loading-wrap"><div className="spinner" /><span>جاري التحميل...</span></div>

  return (
    <>
      <EventPageHeader
        title="المهام"
        icon={CheckSquare}
        eventId={id}
        actions={
          <button className="btn btn-primary" onClick={() => openCreate()}>
            <Plus size={15} />إضافة مهمة
          </button>
        }
      />

      {/* Progress + Filters */}
      <div className="tasks-toolbar">
        <div className="tasks-progress-wrap">
          <div className="tasks-progress-bar">
            <div className="tasks-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="tasks-progress-label">{done}/{total} منجزة ({progress}%)</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} style={{ width: 'auto' }}>
            <option value="">كل الأقسام</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input
            value={filterPerson}
            onChange={e => setFilterPerson(e.target.value)}
            placeholder="فلتر بالمكلف..."
            style={{ width: '160px' }}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLUMNS.map((col, colIdx) => {
          const colTasks = filtered.filter(t => t.status === col.key)
          return (
            <div key={col.key} className="kanban-column">
              <div className="kanban-col-header" style={{ borderTop: `3px solid ${col.color}` }}>
                <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
                <span className="kanban-col-count" style={{ background: `${col.color}20`, color: col.color }}>{colTasks.length}</span>
                <button className="btn-icon" style={{ padding: '4px', marginRight: 'auto' }} onClick={() => openCreate(col.key)}>
                  <Plus size={13} />
                </button>
              </div>
              <div className="kanban-cards">
                {colTasks.length === 0 && (
                  <div className="kanban-empty" onClick={() => openCreate(col.key)}>
                    <Plus size={16} />
                    <span>إضافة مهمة</span>
                  </div>
                )}
                {colTasks.map(task => (
                  <div key={task.id} className="kanban-card">
                    {/* Priority strip */}
                    <div className="kanban-card-priority-strip" style={{ background: prioMeta(task.priority).color }} />

                    <div className="kanban-card-body">
                      {/* Department tag */}
                      {task.department_id && (
                        <div className="kanban-card-dept" style={{ background: `${deptColor(task.department_id)}20`, color: deptColor(task.department_id) }}>
                          {deptName(task.department_id)}
                        </div>
                      )}

                      <div className="kanban-card-title">{task.title}</div>

                      {task.description && (
                        <div className="kanban-card-desc">{task.description.slice(0, 80)}{task.description.length > 80 ? '...' : ''}</div>
                      )}

                      <div className="kanban-card-footer">
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span
                            className="kanban-priority-badge"
                            style={{ background: prioMeta(task.priority).bg, color: prioMeta(task.priority).color }}
                          >
                            {prioMeta(task.priority).label}
                          </span>
                          {task.due_date && (
                            <span className="kanban-due-date" style={{ color: new Date(task.due_date) < new Date() && task.status !== 'done' ? '#ef4444' : '#5b30b8' }}>
                              📅 {new Date(task.due_date).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                        {task.assigned_to && (
                          <div className="kanban-assignee">
                            <div className="kanban-assignee-avatar">{task.assigned_to.slice(0, 1)}</div>
                            <span>{task.assigned_to}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="kanban-card-actions">
                        <button className="btn-icon" style={{ padding: '4px' }} disabled={colIdx === 0} onClick={() => moveTask(task, -1)} title="نقل للسابق">
                          <ChevronRight size={13} />
                        </button>
                        <button className="btn-icon" style={{ padding: '4px' }} onClick={() => openEdit(task)} title="تعديل">
                          <Pencil size={13} />
                        </button>
                        <button className="btn-icon danger" style={{ padding: '4px' }} onClick={() => deleteTask(task.id)} title="حذف">
                          <Trash2 size={13} />
                        </button>
                        <button className="btn-icon" style={{ padding: '4px' }} disabled={colIdx === COLUMNS.length - 1} onClick={() => moveTask(task, 1)} title="نقل للتالي">
                          <ChevronLeft size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Modal */}
      {modal === 'form' && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              <CheckSquare size={18} color="#c084fc" />
              {editId ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
              <button onClick={() => setModal(null)} style={{ background: 'none', color: '#7c4dda', marginRight: 'auto' }}><X size={18} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">اسم المهمة *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="وصف المهمة بوضوح" />
            </div>

            <div className="form-group">
              <label className="form-label">التفاصيل</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: 'none' }} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">المكلف</label>
                <input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="اسم الشخص" />
              </div>
              <div className="form-group">
                <label className="form-label">تاريخ الاستحقاق</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={{ direction: 'ltr' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">الأولوية</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">الحالة</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
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
              <button className="btn btn-primary" onClick={saveTask} disabled={saving || !form.title.trim()}>
                {saving ? 'جاري الحفظ...' : editId ? 'حفظ التعديلات' : 'إضافة المهمة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
