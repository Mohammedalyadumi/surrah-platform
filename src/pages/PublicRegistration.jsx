import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CalendarDays, MapPin, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react'

export default function PublicRegistration() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState('form') // 'form' | 'success' | 'error' | 'closed'
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  async function fetchEvent() {
    setLoading(true)
    const { data } = await supabase.from('events').select('*').eq('id', eventId).single()
    setEvent(data)
    setLoading(false)
    if (data?.status === 'cancelled' || data?.status === 'completed') {
      setStep('closed')
    }
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('الاسم مطلوب'); return }
    if (!form.email.trim()) { setError('البريد الإلكتروني مطلوب'); return }
    setSaving(true)
    setError('')
    try {
      const { error: err } = await supabase.from('attendees').insert([{
        event_id: eventId,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      }])
      if (err) {
        if (err.message?.includes('duplicate') || err.code === '23505') {
          setError('هذا البريد الإلكتروني مسجل بالفعل في هذه الفعالية')
        } else {
          setError(err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى')
        }
      } else {
        setStep('success')
      }
    } catch {
      setError('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى')
    } finally {
      setSaving(false)
    }
  }

  const statusLabel = { upcoming: 'قادمة', ongoing: 'جارية' }

  return (
    <div className="public-reg-page">
      {/* Background */}
      <div className="public-reg-bg" />
      <div className="public-reg-glow public-reg-glow-1" />
      <div className="public-reg-glow public-reg-glow-2" />

      <div className="public-reg-container">
        {/* Brand Header */}
        <div className="public-reg-brand">
          <div className="logo-icon" style={{ width: '36px', height: '36px', fontSize: '16px' }}>S</div>
          <span className="public-reg-brand-name">منصة سرة</span>
        </div>

        {loading ? (
          <div className="loading-wrap" style={{ minHeight: '300px' }}>
            <div className="spinner" />
            <span>جاري التحميل...</span>
          </div>
        ) : !event ? (
          <div className="public-reg-card">
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ color: '#f3eeff', fontSize: '20px', fontWeight: 800 }}>الفعالية غير موجودة</h2>
              <p style={{ color: '#7c4dda', marginTop: '8px' }}>يبدو أن الرابط غير صحيح أو أن الفعالية تم حذفها</p>
            </div>
          </div>
        ) : step === 'closed' ? (
          <div className="public-reg-card">
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <CalendarDays size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ color: '#f3eeff', fontSize: '20px', fontWeight: 800 }}>التسجيل مغلق</h2>
              <p style={{ color: '#7c4dda', marginTop: '8px' }}>
                {event.status === 'cancelled' ? 'تم إلغاء هذه الفعالية' : 'انتهت هذه الفعالية'}
              </p>
            </div>
          </div>
        ) : step === 'success' ? (
          <div className="public-reg-card">
            <div className="reg-success">
              <div className="reg-success-icon">
                <CheckCircle size={48} color="#10b981" />
              </div>
              <h2 className="reg-success-title">تم التسجيل بنجاح! 🎉</h2>
              <p className="reg-success-desc">
                مرحباً <strong>{form.name}</strong>، تم تسجيلك في الفعالية بنجاح.
                سيتم إرسال تفاصيل الفعالية إلى <strong>{form.email}</strong>
              </p>
              <div className="reg-success-event">
                <div className="reg-success-event-title">{event.title}</div>
                <div className="reg-success-event-meta">
                  {event.date && (
                    <span><CalendarDays size={13} /> {new Date(event.date).toLocaleDateString('ar-SA')}</span>
                  )}
                  {event.time && <span><Clock size={13} /> {event.time}</span>}
                  {event.location && <span><MapPin size={13} /> {event.location}</span>}
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#5b30b8', textAlign: 'center' }}>
                نتطلع إلى رؤيتك في الفعالية
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Event Info Card */}
            <div className="public-reg-event-card">
              <div className="public-reg-event-badge">
                <span className={`badge ${event.status === 'upcoming' ? 'badge-purple' : 'badge-success'}`}>
                  {statusLabel[event.status] || event.status}
                </span>
              </div>
              <h1 className="public-reg-event-title">{event.title}</h1>
              {event.description && (
                <p className="public-reg-event-desc">{event.description}</p>
              )}
              <div className="public-reg-event-meta">
                {event.date && (
                  <div className="public-reg-meta-item">
                    <CalendarDays size={16} color="#c084fc" />
                    <span>{new Date(event.date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {event.time && (
                  <div className="public-reg-meta-item">
                    <Clock size={16} color="#c084fc" />
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="public-reg-meta-item">
                    <MapPin size={16} color="#c084fc" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.capacity && (
                  <div className="public-reg-meta-item">
                    <Users size={16} color="#c084fc" />
                    <span>السعة: {event.capacity} مقعد</span>
                  </div>
                )}
              </div>
            </div>

            {/* Registration Form */}
            <div className="public-reg-card">
              <h2 className="public-reg-form-title">تسجيل الحضور</h2>
              <p className="public-reg-form-subtitle">أدخل بياناتك للتسجيل في هذه الفعالية</p>

              {error && <div className="error-msg" style={{ marginBottom: '16px' }}>{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">الاسم الكامل *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">البريد الإلكتروني *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">رقم الهاتف</label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="05XXXXXXXX"
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ملاحظات (اختياري)</label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="أي ملاحظات أو متطلبات خاصة..."
                    rows={3}
                    style={{ resize: 'none' }}
                  />
                </div>

                <button type="submit" className="btn-full" disabled={saving}>
                  {saving ? 'جاري التسجيل...' : 'تسجيل الحضور'}
                </button>
              </form>
            </div>
          </>
        )}

        <p className="public-reg-footer">
          مدعوم بـ <strong>منصة سرة</strong> — منصة إدارة المجتمعات والفعاليات
        </p>
      </div>
    </div>
  )
}
