import { useState } from 'react'
import { saveDraft, generateSlug, deleteEntity } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight, Eye, EyeOff, GripVertical } from 'lucide-react'
import ImageUpload from '../ui/ImageUpload'

const EMPTY_CATEGORY = {
  name: '', slug: '', description: '', image: '', icon: '',
  parentId: null, displayOrder: 0, visibility: true,
  seoTitle: '', seoDescription: '',
}

export default function CategoryManager({ categories = [], onUpdate }) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [expanded, setExpanded] = useState({})

  const rootCategories = categories.filter(c => !c.parentId)
  const getChildren = (parentId) => categories.filter(c => c.parentId === parentId)

  function startEdit(cat) {
    setEditing(cat.id)
    setForm({ ...EMPTY_CATEGORY, ...cat })
  }

  function cancelEdit() { setEditing(null); setForm({}) }

  async function saveCategory() {
    const data = { ...form }
    if (!data.slug) data.slug = generateSlug(data.name)
    data.displayOrder = Number(data.displayOrder) || 0

    await saveDraft('categories', editing, data)
    await onUpdate()
    cancelEdit()
    toast.success('Category saved')
  }

  async function deleteCategory(id) {
    const children = getChildren(id)
    if (children.length > 0) {
      toast.error('Delete child categories first')
      return
    }
    if (!confirm('Delete this category?')) return
    await deleteEntity('categories_draft', id).catch(() => {})
    await deleteEntity('categories', id).catch(() => {})
    await onUpdate()
    toast.success('Deleted')
  }

  function toggleExpand(id) {
    setExpanded(e => ({ ...e, [id]: !e[id] }))
  }

  function renderCategory(cat, depth = 0) {
    const children = getChildren(cat.id)
    const isExpanded = expanded[cat.id]
    const isEditing = editing === cat.id

    return (
      <div key={cat.id} style={{ marginLeft: depth * 20 }}>
        <div className={`flex items-center gap-2 py-2 px-3 rounded-lg mb-1 ${isEditing ? 'glass border border-gold/20' : 'hover:bg-white/[0.02]'}`}>
          {children.length > 0 ? (
            <button onClick={() => toggleExpand(cat.id)} className="p-0.5 bg-transparent border-none cursor-pointer">
              {isExpanded ? <ChevronDown size={12} className="text-text-dim" /> : <ChevronRight size={12} className="text-text-dim" />}
            </button>
          ) : <div className="w-4" />}

          {cat.image && <img src={cat.image} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />}

          {isEditing ? (
            <div className="flex-1 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xs" placeholder="Name" />
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field text-xs" placeholder="slug" />
              </div>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-xs w-full" placeholder="Description" />
              <div className="grid grid-cols-3 gap-2">
                <select value={form.parentId || ''} onChange={e => setForm({ ...form, parentId: e.target.value || null })} className="input-field text-xs">
                  <option value="">No Parent (Root)</option>
                  {categories.filter(c => c.id !== editing).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: e.target.value })} className="input-field text-xs" placeholder="Order" />
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-text-dim">Visible</label>
                  <input type="checkbox" checked={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.checked })} className="accent-gold" />
                </div>
              </div>
              <ImageUpload currentImage={form.image} onUpload={url => setForm({ ...form, image: url })} compact />
              <div className="grid grid-cols-2 gap-2">
                <input value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} className="input-field text-xs" placeholder="SEO Title" />
                <input value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} className="input-field text-xs" placeholder="SEO Description" />
              </div>
              <div className="flex gap-1.5">
                <button onClick={saveCategory} className="btn-gold text-xs px-3 py-1.5 inline-flex items-center gap-1"><Save size={10} /> Save</button>
                <button onClick={cancelEdit} className="glass text-xs px-3 py-1.5 text-text-muted inline-flex items-center gap-1"><X size={10} /> Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text font-medium">{cat.name}</p>
                <p className="text-[10px] text-text-dim">{cat.slug} · Order: {cat.displayOrder || 0}</p>
              </div>
              <div className="flex items-center gap-1">
                {cat.visibility === false && <EyeOff size={10} className="text-red-400" />}
                <button onClick={() => startEdit(cat)} className="p-1 rounded hover:bg-gold-dim bg-transparent border-none cursor-pointer"><Edit size={11} className="text-gold" /></button>
                <button onClick={() => deleteCategory(cat.id)} className="p-1 rounded hover:bg-red-dim bg-transparent border-none cursor-pointer"><Trash2 size={11} className="text-red-400" /></button>
              </div>
            </>
          )}
        </div>

        {isExpanded && children.map(child => renderCategory(child, depth + 1))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text">Categories</h3>
        <button onClick={() => { setEditing('new'); setForm({ ...EMPTY_CATEGORY }) }}
          className="text-[11px] text-gold hover:underline inline-flex items-center gap-1 bg-transparent border-none cursor-pointer">
          <Plus size={12} /> Add Category
        </button>
      </div>

      {editing === 'new' && (
        <div className="glass rounded-lg p-3 mb-3 space-y-2 border border-gold/20">
          <div className="grid grid-cols-2 gap-2">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xs" placeholder="Category Name" />
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field text-xs" placeholder="slug-url" />
          </div>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-xs w-full" placeholder="Description" />
          <div className="grid grid-cols-3 gap-2">
            <select value={form.parentId || ''} onChange={e => setForm({ ...form, parentId: e.target.value || null })} className="input-field text-xs">
              <option value="">No Parent (Root)</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: e.target.value })} className="input-field text-xs" placeholder="Order" />
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-text-dim">Visible</label>
              <input type="checkbox" checked={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.checked })} className="accent-gold" />
            </div>
          </div>
          <ImageUpload currentImage={form.image} onUpload={url => setForm({ ...form, image: url })} compact />
          <div className="flex gap-1.5">
            <button onClick={async () => { await saveCategory(); setEditing(null) }} className="btn-gold text-xs px-3 py-1.5 inline-flex items-center gap-1"><Save size={10} /> Create</button>
            <button onClick={() => setEditing(null)} className="glass text-xs px-3 py-1.5 text-text-muted inline-flex items-center gap-1"><X size={10} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-0.5">
        {rootCategories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(cat => renderCategory(cat))}
      </div>

      {categories.length === 0 && (
        <p className="text-text-dim text-xs py-4 text-center glass rounded-lg">No categories yet. Create one to start.</p>
      )}
    </div>
  )
}
