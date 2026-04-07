import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (tab === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/dashboard')
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setSuccess('تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب.')
      }
    } catch (err) {
      console.error('Auth error:', err)
      const msgs = {
        'Invalid login credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً',
        'User already registered': 'هذا البريد الإلكتروني مسجل مسبقاً',
      }
      setError(msgs[err.message] || `${err.message}${err.status ? ` (${err.status})` : ''}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">S</div>
          <h1 className="login-title">منصة سرة</h1>
          <p className="login-subtitle">إدارة مجتمع SUDDA</p>
        </div>

        <div className="tab-switcher">
          <button className={`tab-btn${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
            تسجيل الدخول
          </button>
          <button className={`tab-btn${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>
            إنشاء حساب
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="example@sudda.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ paddingRight: '40px', direction: 'ltr', textAlign: 'right' }}
              />
              <Mail size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7c4dda', pointerEvents: 'none' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px', paddingLeft: '40px', direction: 'ltr' }}
              />
              <Lock size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7c4dda', pointerEvents: 'none' }} />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', color: '#7c4dda', padding: '2px' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-full" disabled={loading}>
            {loading ? (tab === 'login' ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...') : (tab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب')}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '11px', color: '#5b30b8', marginTop: '20px' }}>
          منصة سرة — جميع الحقوق محفوظة © 2025
        </p>
      </div>
    </div>
  )
}
