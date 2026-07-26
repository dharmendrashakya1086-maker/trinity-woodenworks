import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { saveDraft, logAudit, generateSlug, publishEntity } from '../../lib/firestore'
import toast from 'react-hot-toast'
import { Pencil, Eye, Save, X, Loader, Wand2, ArrowUpCircle } from 'lucide-react'

export default function LiveEditBar({ entityType = 'products', entityId, data, onUpdate }) {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(null)

  if (!isAdmin || !entityId || !data) return null

  function startEdit() {
    setForm({ ...data })
    setEditing(true)
  }

  function cancelEdit() { setEditing(false); setForm({}) }

  async function save() {
    setSaving(true)
    try {
      await saveDraft(entityType, entityId, { ...form, updatedAt: new Date().toISOString() })
      await logAudit({ userId: user.uid, action: 'live_edit', entityType, entityId, newValue: form })
      toast.success('Saved as draft — publish from Dashboard')
      setEditing(false)
      onUpdate?.()
    } catch (err) { toast.error(err.message) }
    setSaving(false)
  }

  async function publishNow() {
    if (!confirm('Publish changes to live?')) return
    setSaving(true)
    try {
      await saveDraft(entityType, entityId, { ...form, updatedAt: new Date().toISOString() })
      await publishEntity(entityType, entityId)
      await logAudit({ userId: user.uid, action: 'live_publish', entityType, entityId })
      toast.success('Published!')
      setEditing(false)
      onUpdate?.()
    } catch (err) { toast.error(err.message) }
    setSaving(false)
  }

  async function generateWithAI(field) {
    setGenerating(field)
    try {
      // Generate content based on product data
      const name = form.name || data.name || ''
      const desc = form.description || data.description || ''
      const materials = form.materials || data.materials || ''
      const category = form.categoryId || data.categoryId || ''

      let suggestion = ''
      if (field === 'seoTitle') {
        suggestion = `${name} - Handcrafted ${materials || 'Wooden'} Furniture | Trinity Woodenworks`
      } else if (field === 'seoDescription') {
        suggestion = `Shop ${name} crafted from premium ${materials || 'wood'} by skilled artisans in Varanasi. ${desc ? desc.slice(0, 100) : 'Handcrafted with care.'} Free delivery available.`
      } else if (field === 'shortDescription') {
        suggestion = `Handcrafted ${name.toLowerCase()} made from ${materials || 'premium wood'} by skilled artisans.`
      } else if (field === 'careInstructions') {
        suggestion = 'Dust regularly with a soft, dry cloth. Avoid direct sunlight and moisture. Apply wood polish every 6 months to maintain finish. Use coasters to prevent water marks.'
      } else if (field === 'description') {
        suggestion = `The ${name} is a masterfully handcrafted piece made from ${materials || 'premium solid wood'} by skilled artisans in Varanasi. Each piece showcases traditional woodworking techniques passed down through generations, ensuring exceptional quality and timeless beauty. Perfect for adding warmth and character to any space.`
      }

      setForm(f => ({ ...f, [field]: suggestion }))
      toast.success('AI suggestion generated — review before saving')
    } catch (err) { toast.error('Generation failed') }
    setGenerating(null)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {editing ? (
        <div className="glass rounded-xl p-3 border border-gold/20 w-72 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[11px] text-gold font-semibold">Live Edit</p>
            <div className="flex gap-1">
              <button onClick={save} disabled={saving} className="p-1 rounded hover:bg-gold-dim bg-transparent border-none cursor-pointer disabled:opacity-50">
                {saving ? <Loader size={12} className="text-gold animate-spin" /> : <Save size={12} className="text-gold" />}
              </button>
              <button onClick={cancelEdit} className="p-1 rounded hover:bg-red-dim bg-transparent border-none cursor-pointer">
                <X size={12} className="text-red-400" />
              </button>
            </div>
          </div>

          <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-[11px] w-full" placeholder="Product name" />
          <input type="number" value={form.price || 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input-field text-[11px] w-full" placeholder="Price" />

          {/* AI Quick Fields */}
          {[
            { key: 'seoTitle', label: 'SEO Title' },
            { key: 'shortDescription', label: 'Short Description' },
            { key: 'description', label: 'Description' },
            { key: 'careInstructions', label: 'Care Instructions' },
          ].map(f => (
            <div key={f.key} className="relative">
              <textarea value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="input-field text-[10px] w-full min-h-[40px]" placeholder={f.label} />
              <button type="button" onClick={() => generateWithAI(f.key)} disabled={generating === f.key}
                className="absolute top-1 right-1 p-1 rounded bg-gold/20 hover:bg-gold/30 border-none cursor-pointer disabled:opacity-50"
                title={`AI generate ${f.label}`}>
                {generating === f.key ? <Loader size={9} className="text-gold animate-spin" /> : <Wand2 size={9} className="text-gold" />}
              </button>
            </div>
          ))}

          <div className="flex gap-1.5">
            <button onClick={save} disabled={saving} className="btn-gold text-[10px] px-3 py-1.5 flex-1 inline-flex items-center justify-center gap-1">
              <Save size={10} /> Save Draft
            </button>
            <button onClick={publishNow} disabled={saving} className="glass text-[10px] px-3 py-1.5 text-gold inline-flex items-center gap-1 border-none cursor-pointer hover:bg-gold-dim">
              <ArrowUpCircle size={10} /> Publish
            </button>
          </div>
        </div>
      ) : (
        <button onClick={startEdit}
          className="glass rounded-full p-3 border border-gold/30 hover:bg-gold-dim transition-all shadow-2xl cursor-pointer"
          title="Live Edit this product">
          <Pencil size={16} className="text-gold" />
        </button>
      )}
    </div>
  )
}
