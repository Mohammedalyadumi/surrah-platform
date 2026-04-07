import { useState, useEffect } from 'react'
import { Settings2, Palette, Building2, Save, Check, Image, RefreshCw } from 'lucide-react'

const SETTINGS_KEY = 'surrah_settings'

const PRESET_COLORS = [
  { name: 'بنفسجي (الافتراضي)', primary: '#7c4dda', accent: '#c084fc' },
  { name: 'أزرق', primary: '#2563eb', accent: '#60a5fa' },
  { name: 'أخضر زمردي', primary: '#059669', accent: '#34d399' },
  { name: 'برتقالي', primary: '#ea580c', accent: '#fb923c' },
  { name: 'وردي', primary: '#db2777', accent: '#f472b6' },
  { name: 'سماوي', primary: '#0891b2', accent: '#22d3ee' },
]

const DEFAULT_SETTINGS = {
  communityName: 'SUDDA',
  platformName: 'منصة سرة',
  logoUrl: '',
  primaryColor: '#7c4dda',
  accentColor: '#c084fc',
  contactEmail: '',
  contactPhone: '',
  website: '',
  twitter: '',
  instagram: '',
  linkedin: '',
}

function applyColors(primary, accent) {
  const root = document.documentElement
  root.style.setProperty('--purple-500', primary)
  root.style.setProperty('--accent', accent)
  root.style.setProperty('--text-muted', primary)
  root.style.setProperty('--border', `${primary}33`)
  root.style.setProperty('--border-bright', `${primary}80`)
}

export default function Settings() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY)
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('community')

  useEffect(() => {
    applyColors(settings.primaryColor, settings.accentColor)
  }, [settings.primaryColor, settings.accentColor])

  function handleChange(key, value) {
    setSettings(s => ({ ...s, [key]: value }))
  }

  function applyPreset(preset) {
    setSettings(s => ({ ...s, primaryColor: preset.primary, accentColor: preset.accent }))
    applyColors(preset.primary, preset.accent)
  }

  function handleSave() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    applyColors(settings.primaryColor, settings.accentColor)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    setSettings(DEFAULT_SETTINGS)
    applyColors(DEFAULT_SETTINGS.primaryColor, DEFAULT_SETTINGS.accentColor)
  }

  const sections = [
    { key: 'community', label: 'معلومات المجتمع', icon: Building2 },
    { key: 'branding', label: 'الهوية البصرية', icon: Palette },
    { key: 'contact', label: 'معلومات التواصل', icon: Settings2 },
  ]

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">الإعدادات</h1>
          <p className="page-subtitle">تخصيص إعدادات مجتمعك وهويته البصرية</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleReset}>
            <RefreshCw size={14} />
            إعادة تعيين
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'تم الحفظ!' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="success-msg" style={{ marginBottom: '20px' }}>
          تم حفظ الإعدادات بنجاح
        </div>
      )}

      <div className="settings-layout">
        {/* Section Navigation */}
        <div className="settings-nav card">
          <div className="card-body" style={{ padding: '12px' }}>
            {sections.map(s => (
              <button
                key={s.key}
                className={`settings-nav-item ${activeSection === s.key ? 'active' : ''}`}
                onClick={() => setActiveSection(s.key)}
              >
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="settings-content">

          {/* Community Info */}
          {activeSection === 'community' && (
            <div className="card animate-fade">
              <div className="card-header">
                <span className="card-title">معلومات المجتمع</span>
                <Building2 size={16} color="#7c4dda" />
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">اسم المجتمع</label>
                    <input
                      value={settings.communityName}
                      onChange={e => handleChange('communityName', e.target.value)}
                      placeholder="اسم مجتمعك"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">اسم المنصة</label>
                    <input
                      value={settings.platformName}
                      onChange={e => handleChange('platformName', e.target.value)}
                      placeholder="اسم المنصة"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">رابط الشعار (URL)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        value={settings.logoUrl}
                        onChange={e => handleChange('logoUrl', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        style={{ direction: 'ltr' }}
                      />
                      <p style={{ fontSize: '11px', color: '#5b30b8', marginTop: '6px' }}>
                        أدخل رابط صورة الشعار. يُنصح باستخدام صورة مربعة بأبعاد 200×200 بكسل على الأقل.
                      </p>
                    </div>
                    <div className="logo-preview">
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="logo preview" onError={e => { e.target.style.display = 'none' }} />
                      ) : (
                        <Image size={20} color="#5b30b8" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Branding */}
          {activeSection === 'branding' && (
            <div className="card animate-fade">
              <div className="card-header">
                <span className="card-title">الهوية البصرية</span>
                <Palette size={16} color="#7c4dda" />
              </div>
              <div className="card-body">
                <p style={{ fontSize: '13px', color: '#7c4dda', marginBottom: '20px' }}>
                  خصّص ألوان منصتك لتعكس هوية علامتك التجارية. التغييرات تُطبّق فوراً.
                </p>

                {/* Color Presets */}
                <div className="form-group">
                  <label className="form-label">ألوان جاهزة</label>
                  <div className="color-presets">
                    {PRESET_COLORS.map(p => (
                      <button
                        key={p.name}
                        className={`color-preset ${settings.primaryColor === p.primary ? 'active' : ''}`}
                        onClick={() => applyPreset(p)}
                        title={p.name}
                      >
                        <div className="color-preset-swatch" style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }} />
                        <span>{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="form-row" style={{ marginTop: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">اللون الأساسي</label>
                    <div className="color-input-wrap">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={e => handleChange('primaryColor', e.target.value)}
                        className="color-input"
                      />
                      <input
                        value={settings.primaryColor}
                        onChange={e => handleChange('primaryColor', e.target.value)}
                        placeholder="#7c4dda"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">اللون المكمل</label>
                    <div className="color-input-wrap">
                      <input
                        type="color"
                        value={settings.accentColor}
                        onChange={e => handleChange('accentColor', e.target.value)}
                        className="color-input"
                      />
                      <input
                        value={settings.accentColor}
                        onChange={e => handleChange('accentColor', e.target.value)}
                        placeholder="#c084fc"
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="brand-preview">
                  <div className="brand-preview-label">معاينة الألوان</div>
                  <div className="brand-preview-content">
                    <div className="preview-btn-primary" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}>
                      زر أساسي
                    </div>
                    <span className="preview-badge" style={{ background: `${settings.primaryColor}20`, color: settings.primaryColor, border: `1px solid ${settings.primaryColor}40` }}>
                      شارة
                    </span>
                    <div className="preview-accent-dot" style={{ background: settings.accentColor }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {activeSection === 'contact' && (
            <div className="card animate-fade">
              <div className="card-header">
                <span className="card-title">معلومات التواصل</span>
                <Settings2 size={16} color="#7c4dda" />
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني</label>
                    <input
                      value={settings.contactEmail}
                      onChange={e => handleChange('contactEmail', e.target.value)}
                      placeholder="contact@community.com"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">رقم الهاتف</label>
                    <input
                      value={settings.contactPhone}
                      onChange={e => handleChange('contactPhone', e.target.value)}
                      placeholder="05XXXXXXXX"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">الموقع الإلكتروني</label>
                  <input
                    value={settings.website}
                    onChange={e => handleChange('website', e.target.value)}
                    placeholder="https://community.com"
                    style={{ direction: 'ltr' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">حساب تويتر / X</label>
                  <input
                    value={settings.twitter}
                    onChange={e => handleChange('twitter', e.target.value)}
                    placeholder="@community"
                    style={{ direction: 'ltr', textAlign: 'right' }}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">حساب إنستغرام</label>
                    <input
                      value={settings.instagram}
                      onChange={e => handleChange('instagram', e.target.value)}
                      placeholder="@community"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">حساب لينكدإن</label>
                    <input
                      value={settings.linkedin}
                      onChange={e => handleChange('linkedin', e.target.value)}
                      placeholder="company/community"
                      style={{ direction: 'ltr', textAlign: 'right' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
