import { Link } from 'react-router-dom'
import {
  CheckCircle, CalendarDays, Users, TrendingUp, Settings2,
  Shield, Zap, Star, ArrowLeft, BarChart2, CheckSquare, Mic2
} from 'lucide-react'

const features = [
  { icon: CalendarDays, title: 'إدارة الفعاليات', desc: 'أنشئ وأدر فعالياتك بسهولة مع تتبع التفاصيل والحضور في مكان واحد', color: '#7c4dda' },
  { icon: Users, title: 'إدارة الأعضاء', desc: 'تتبع أعضاء مجتمعك وأدوارهم وحالة عضويتهم بكل يسر', color: '#c084fc' },
  { icon: BarChart2, title: 'تحليلات متقدمة', desc: 'احصل على رؤى عميقة حول نمو مجتمعك وأداء فعالياتك', color: '#10b981' },
  { icon: Shield, title: 'إدارة الميزانية', desc: 'تتبع إيرادات ومصروفات فعالياتك بتقارير مالية شاملة', color: '#f59e0b' },
  { icon: Zap, title: 'تسجيل الحضور', desc: 'صفحات تسجيل عامة تتيح للحضور التسجيل بكل سهولة ويسر', color: '#3b82f6' },
  { icon: Mic2, title: 'إدارة المتحدثين', desc: 'أضف وأدر معلومات المتحدثين والضيوف لكل فعالية', color: '#ec4899' },
  { icon: CheckSquare, title: 'قوائم المهام', desc: 'قوائم مهام تفاعلية لضمان سير الفعاليات بشكل مثالي', color: '#f97316' },
  { icon: Settings2, title: 'تخصيص العلامة', desc: 'خصص ألوان وهوية مجتمعك لتعكس علامتك التجارية الفريدة', color: '#8b5cf6' },
  { icon: TrendingUp, title: 'تقارير تفصيلية', desc: 'تقارير شاملة ومفصلة عن أداء فعالياتك وإيراداتك', color: '#06b6d4' },
]

const plans = [
  {
    name: 'الأساسية',
    price: '299',
    desc: 'مثالية للمجتمعات الناشئة',
    features: ['3 فعاليات شهرياً', '100 عضو', 'تقارير أساسية', 'دعم عبر البريد', 'صفحة تسجيل عامة'],
    cta: 'ابدأ مجاناً',
    popular: false,
  },
  {
    name: 'الاحترافية',
    price: '799',
    desc: 'للمجتمعات المتنامية',
    features: ['فعاليات غير محدودة', '1,000 عضو', 'تحليلات متقدمة', 'دعم ذو أولوية', 'إدارة المتحدثين', 'تتبع الميزانية', 'قائمة مهام الفعاليات'],
    cta: 'ابدأ الآن',
    popular: true,
  },
  {
    name: 'المؤسسات',
    price: '1,999',
    desc: 'للمنظمات الكبيرة',
    features: ['كل مميزات الاحترافية', 'أعضاء غير محدودون', 'تخصيص العلامة التجارية', 'مدير حساب مخصص', 'API للتكاملات', 'تقارير مخصصة', 'دعم على مدار الساعة'],
    cta: 'تواصل معنا',
    popular: false,
  },
]

const testimonials = [
  { name: 'أحمد الشهري', role: 'مدير مجتمع TechRiyadh', text: 'منصة سرة غيّرت طريقة إدارتنا للفعاليات كلياً. التنظيم والمتابعة أصبح أسهل بكثير.' },
  { name: 'نورا العتيبي', role: 'منظمة فعاليات ثقافية', text: 'أداة رائعة لإدارة الحضور وتتبع الميزانية. أنصح بها كل منظم فعاليات.' },
  { name: 'محمد القحطاني', role: 'مؤسس مجتمع Startup Jeddah', text: 'واجهة جميلة وسهلة الاستخدام. وفّرت علينا ساعات من العمل في كل فعالية.' },
]

export default function Landing() {
  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-container">
          <div className="landing-nav-inner">
            <div className="landing-logo">
              <div className="logo-icon">S</div>
              <div className="logo-text">
                <span className="logo-title">سرة</span>
                <span className="logo-sub">منصة إدارة المجتمعات</span>
              </div>
            </div>
            <div className="landing-nav-links">
              <a href="#features" className="landing-nav-link">المميزات</a>
              <a href="#pricing" className="landing-nav-link">الأسعار</a>
            </div>
            <div className="landing-nav-actions">
              <Link to="/login" className="landing-nav-login">دخول</Link>
              <Link to="/login" className="btn btn-primary">ابدأ مجاناً</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="landing-hero-glow landing-hero-glow-1" />
        <div className="landing-hero-glow landing-hero-glow-2" />
        <div className="landing-container">
          <div className="landing-hero-content">
            <div className="landing-hero-badge">
              <Star size={12} fill="currentColor" />
              المنصة الرائدة في إدارة المجتمعات بالسعودية
            </div>
            <h1 className="landing-hero-title">
              أدر مجتمعك وفعالياتك
              <br />
              <span className="landing-hero-gradient">باحترافية لا مثيل لها</span>
            </h1>
            <p className="landing-hero-desc">
              منصة سرة هي الحل الشامل لإدارة مجتمعاتك وفعالياتك. من التسجيل إلى التحليلات،
              كل ما تحتاجه في مكان واحد بتصميم عصري وسهل الاستخدام.
            </p>
            <div className="landing-hero-actions">
              <Link to="/login" className="landing-hero-btn-primary">
                ابدأ تجربتك المجانية
                <ArrowLeft size={18} />
              </Link>
              <a href="#features" className="landing-hero-btn-sec">
                استكشف المميزات
              </a>
            </div>
          </div>

          {/* Mock Dashboard Preview */}
          <div className="landing-hero-preview">
            <div className="preview-window">
              <div className="preview-topbar">
                <div className="preview-dot red" />
                <div className="preview-dot yellow" />
                <div className="preview-dot green" />
                <span className="preview-url">app.surrah.sa/dashboard</span>
              </div>
              <div className="preview-content">
                <div className="preview-sidebar">
                  {['لوحة التحكم', 'الفعاليات', 'الأعضاء', 'الإعدادات'].map((item, i) => (
                    <div key={item} className={`preview-nav-item ${i === 0 ? 'active' : ''}`}>{item}</div>
                  ))}
                </div>
                <div className="preview-main">
                  <div className="preview-kpis">
                    {[{ v: '1,234', l: 'عضو' }, { v: '48', l: 'فعالية' }, { v: '9,820', l: 'حضور' }, { v: '85K', l: 'ر.س' }].map(k => (
                      <div key={k.l} className="preview-kpi">
                        <div className="preview-kpi-val">{k.v}</div>
                        <div className="preview-kpi-lbl">{k.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="preview-chart">
                    {[40, 65, 45, 80, 60, 90].map((h, i) => (
                      <div key={i} className="preview-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="landing-container">
          <div className="landing-stats">
            {[
              { value: '500+', label: 'فعالية مُدارة' },
              { value: '50+', label: 'مجتمع نشط' },
              { value: '10,000+', label: 'عضو مسجل' },
              { value: '98%', label: 'رضا العملاء' },
            ].map(s => (
              <div className="landing-stat" key={s.label}>
                <div className="landing-stat-value">{s.value}</div>
                <div className="landing-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">المميزات</span>
            <h2 className="landing-section-title">كل ما تحتاجه لإدارة مجتمعك</h2>
            <p className="landing-section-desc">أدوات قوية وسهلة الاستخدام لإدارة كل جانب من جوانب مجتمعك وفعالياتك</p>
          </div>
          <div className="landing-features-grid">
            {features.map(f => (
              <div className="landing-feature-card" key={f.title}>
                <div className="landing-feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                  <f.icon size={22} />
                </div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-section landing-testimonials">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">آراء العملاء</span>
            <h2 className="landing-section-title">ماذا يقول مستخدمونا</h2>
          </div>
          <div className="landing-testimonials-grid">
            {testimonials.map(t => (
              <div className="landing-testimonial-card" key={t.name}>
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.slice(0, 1)}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="landing-section" id="pricing">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">الأسعار</span>
            <h2 className="landing-section-title">خطط تناسب جميع المجتمعات</h2>
            <p className="landing-section-desc">اختر الخطة المناسبة لحجم مجتمعك واحتياجاتك — يمكنك الترقية في أي وقت</p>
          </div>
          <div className="landing-plans-grid">
            {plans.map(plan => (
              <div className={`landing-plan-card ${plan.popular ? 'popular' : ''}`} key={plan.name}>
                {plan.popular && <div className="plan-popular-badge">الأكثر شيوعاً ⭐</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">
                  <span className="plan-price-value">{plan.price}</span>
                  <div className="plan-price-meta">
                    <span className="plan-price-currency">ر.س</span>
                    <span className="plan-price-period">/شهرياً</span>
                  </div>
                </div>
                <p className="plan-desc">{plan.desc}</p>
                <ul className="plan-features-list">
                  {plan.features.map(f => (
                    <li key={f}>
                      <CheckCircle size={15} color="#10b981" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/login"
                  className={`plan-cta-btn ${plan.popular ? 'plan-cta-primary' : 'plan-cta-secondary'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="landing-cta-card">
            <div className="landing-cta-glow" />
            <h2 className="landing-cta-title">ابدأ رحلتك مع سرة اليوم</h2>
            <p className="landing-cta-desc">
              انضم إلى أكثر من 50 مجتمع يستخدمون منصة سرة لإدارة فعالياتهم باحترافية
            </p>
            <Link to="/login" className="landing-hero-btn-primary" style={{ display: 'inline-flex' }}>
              ابدأ مجاناً الآن
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-inner">
            <div className="landing-logo">
              <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '14px' }}>S</div>
              <div className="logo-text">
                <span className="logo-title" style={{ fontSize: '15px' }}>سرة</span>
                <span className="logo-sub">منصة إدارة المجتمعات</span>
              </div>
            </div>
            <div className="landing-footer-links">
              <a href="#features">المميزات</a>
              <a href="#pricing">الأسعار</a>
              <Link to="/login">تسجيل الدخول</Link>
            </div>
            <p className="landing-footer-copy">© 2025 منصة سرة — جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
