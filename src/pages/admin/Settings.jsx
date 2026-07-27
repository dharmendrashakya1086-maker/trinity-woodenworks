import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getSettings, saveSettings, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Settings as SettingsIcon, Store, Mail, Phone, MapPin, Globe, Palette, Loader, Save } from 'lucide-react'

export default function Settings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    storeName: 'Trinity Woodenworks', storeTagline: 'Handcrafted wooden furniture',
    storeEmail: '', storePhone: '', storeAddress: '', storeCity: 'Varanasi', storeState: 'UP', storePin: '',
    currency: 'INR', taxRate: 18, shippingFee: 0, freeShippingMin: 0,
    primaryColor: '#D4AF37', accentColor: '#E74C3C',
    whatsappNumber: '', instagramHandle: '', facebookPage: '',
    businessHours: '', returnPolicy: '', shippingPolicy: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const s = await getSettings()
      if (s && Object.keys(s).length) setSettings(prev => ({ ...prev, ...s }))
    }
    load()
  }, [])

  async function handleSave() {
    setLoading(true)
    try {
      await saveSettings(settings)
      await logAudit({ userId: user.uid, action: 'update_settings', entityType: 'settings' })
      toast.success('Settings saved')
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  function update(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const sections = [
    {
      title: 'Store Info', icon: Store,
      fields: [
        { key: 'storeName', label: 'Store Name', type: 'text' },
        { key: 'storeTagline', label: 'Tagline', type: 'text' },
        { key: 'storeEmail', label: 'Email', type: 'email' },
        { key: 'storePhone', label: 'Phone', type: 'tel' },
        { key: 'storeAddress', label: 'Address', type: 'text' },
        { key: 'storeCity', label: 'City', type: 'text' },
        { key: 'storeState', label: 'State', type: 'text' },
        { key: 'storePin', label: 'PIN Code', type: 'text' },
      ],
    },
    {
      title: 'Commerce', icon: Store,
      fields: [
        { key: 'currency', label: 'Currency', type: 'text' },
        { key: 'taxRate', label: 'Tax Rate (%)', type: 'number' },
        { key: 'shippingFee', label: 'Shipping Fee (₹)', type: 'number' },
        { key: 'freeShippingMin', label: 'Free Shipping Min (₹)', type: 'number' },
      ],
    },
    {
      title: 'Social Media', icon: Globe,
      fields: [
        { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'tel' },
        { key: 'instagramHandle', label: 'Instagram Handle', type: 'text' },
        { key: 'facebookPage', label: 'Facebook Page URL', type: 'text' },
      ],
    },
    {
      title: 'Policies', icon: Mail,
      fields: [
        { key: 'businessHours', label: 'Business Hours', type: 'text' },
        { key: 'returnPolicy', label: 'Return Policy', type: 'textarea' },
        { key: 'shippingPolicy', label: 'Shipping Policy', type: 'textarea' },
      ],
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Settings</h1>
        <button onClick={handleSave} disabled={loading} className="btn-gold text-xs flex items-center gap-1">
          {loading ? <Loader size={12} className="animate-spin" /> : <Save size={14} />} Save Settings
        </button>
      </div>

      <div className="space-y-5">
        {sections.map((section, si) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.05 }}
            className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <section.icon size={14} className="text-gold" />
              <h2 className="text-sm font-semibold text-text">{section.title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.fields.map(f => (
                <div key={f.key}>
                  <label className="text-[10px] text-text-muted mb-1 block">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea value={settings[f.key] || ''} onChange={e => update(f.key, e.target.value)}
                      className="input-field text-xs w-full min-h-[60px]" />
                  ) : (
                    <input type={f.type} value={settings[f.key] || ''} onChange={e => update(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="input-field text-xs w-full" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Branding */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={14} className="text-gold" />
            <h2 className="text-sm font-semibold text-text">Branding</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-text-muted mb-1 block">Primary Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                <input value={settings.primaryColor} onChange={e => update('primaryColor', e.target.value)}
                  className="input-field text-xs flex-1" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-text-muted mb-1 block">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.accentColor} onChange={e => update('accentColor', e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                <input value={settings.accentColor} onChange={e => update('accentColor', e.target.value)}
                  className="input-field text-xs flex-1" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
