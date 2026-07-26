import { useState, useEffect } from 'react'
import { saveDraft, generateSlug, deleteEntity, getEntities } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, GripVertical, Search } from 'lucide-react'
import ImageUpload from '../ui/ImageUpload'

const EMPTY_COLLECTION = {
  name: '', slug: '', description: '', image: '',
  productIds: [], displayOrder: 0, visibility: true,
  seoTitle: '', seoDescription: '',
}

export default function CollectionManager({ collections = [], onUpdate }) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [allProducts, setAllProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    getEntities('products').then(setAllProducts).catch(() => {})
  }, [])

  function startEdit(col) {
    setEditing(col.id)
    setForm({ ...EMPTY_COLLECTION, ...col, productIds: col.productIds || [] })
    setProductSearch('')
  }

  function cancelEdit() { setEditing(null); setForm({}); setProductSearch('') }

  async function saveCollection() {
    const data = { ...form }
    if (!data.slug) data.slug = generateSlug(data.name)
    data.displayOrder = Number(data.displayOrder) || 0
    await saveDraft('collections', editing, data)
    await onUpdate()
    cancelEdit()
    toast.success('Collection saved')
  }

  async function deleteCollection(id) {
    if (!confirm('Delete this collection?')) return
    await deleteEntity('collections_draft', id).catch(() => {})
    await deleteEntity('collections', id).catch(() => {})
    await onUpdate()
    toast.success('Deleted')
  }

  function toggleProduct(productId) {
    const ids = form.productIds || []
    const next = ids.includes(productId) ? ids.filter(id => id !== productId) : [...ids, productId]
    setForm({ ...form, productIds: next })
  }

  const filteredProducts = allProducts.filter(p => {
    if (!productSearch) return true
    return p.name?.toLowerCase().includes(productSearch.toLowerCase())
  })

  const selectedProducts = allProducts.filter(p => (form.productIds || []).includes(p.id))

  function renderCollection(col) {
    const isEditing = editing === col.id
    return (
      <div key={col.id} className={`flex items-center gap-2 py-2 px-3 rounded-lg mb-1 ${isEditing ? 'glass border border-gold/20' : 'hover:bg-white/[0.02]'}`}>
        {col.image && <img src={col.image} alt="" className="w-7 h-7 rounded object-cover flex-shrink-0" />}

        {isEditing ? (
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xs" placeholder="Collection Name" />
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field text-xs" placeholder="slug" />
            </div>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-xs w-full" placeholder="Description" />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: e.target.value })} className="input-field text-xs" placeholder="Order" />
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-text-dim">Visible</label>
                <input type="checkbox" checked={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.checked })} className="accent-gold" />
              </div>
              <div className="text-[10px] text-text-dim flex items-center">{(form.productIds || []).length} products</div>
            </div>
            <ImageUpload currentImage={form.image} onUpload={url => setForm({ ...form, image: url })} compact />

            {/* Product Picker */}
            <div>
              <label className="text-[10px] text-text-dim mb-1 block">Products in this collection</label>
              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedProducts.map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1 badge badge-gold text-[9px]">
                      {p.name}
                      <button onClick={() => toggleProduct(p.id)} className="bg-transparent border-none cursor-pointer p-0 text-gold hover:text-white"><X size={9} /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-text-dim" size={12} />
                <input value={productSearch} onChange={e => setProductSearch(e.target.value)} className="input-field text-xs pl-7 w-full" placeholder="Search products to add..." />
              </div>
              {productSearch && (
                <div className="glass rounded-lg mt-1 max-h-32 overflow-y-auto">
                  {filteredProducts.filter(p => !(form.productIds || []).includes(p.id)).slice(0, 10).map(p => (
                    <button key={p.id} onClick={() => toggleProduct(p.id)}
                      className="w-full text-left px-3 py-1.5 text-[11px] text-text hover:bg-gold-dim flex items-center gap-2 bg-transparent border-none cursor-pointer">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-5 h-5 rounded object-cover" />}
                      <span className="truncate">{p.name}</span>
                      <span className="text-text-dim ml-auto">₹{p.price}</span>
                    </button>
                  ))}
                  {filteredProducts.filter(p => !(form.productIds || []).includes(p.id)).length === 0 && (
                    <p className="text-[10px] text-text-dim py-2 text-center">No matching products</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} className="input-field text-xs" placeholder="SEO Title" />
              <input value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} className="input-field text-xs" placeholder="SEO Description" />
            </div>
            <div className="flex gap-1.5">
              <button onClick={saveCollection} className="btn-gold text-xs px-3 py-1.5 inline-flex items-center gap-1"><Save size={10} /> Save</button>
              <button onClick={cancelEdit} className="glass text-xs px-3 py-1.5 text-text-muted inline-flex items-center gap-1"><X size={10} /> Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text font-medium">{col.name}</p>
              <p className="text-[10px] text-text-dim">{col.slug} · {(col.productIds || []).length} products · Order: {col.displayOrder || 0}</p>
            </div>
            <div className="flex items-center gap-1">
              {col.visibility === false && <EyeOff size={10} className="text-red-400" />}
              <button onClick={() => startEdit(col)} className="p-1 rounded hover:bg-gold-dim bg-transparent border-none cursor-pointer"><Edit size={11} className="text-gold" /></button>
              <button onClick={() => deleteCollection(col.id)} className="p-1 rounded hover:bg-red-dim bg-transparent border-none cursor-pointer"><Trash2 size={11} className="text-red-400" /></button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text">Collections</h3>
        <button onClick={() => { setEditing('new'); setForm({ ...EMPTY_COLLECTION, productIds: [] }); setProductSearch('') }}
          className="text-[11px] text-gold hover:underline inline-flex items-center gap-1 bg-transparent border-none cursor-pointer">
          <Plus size={12} /> Add Collection
        </button>
      </div>

      {editing === 'new' && (
        <div className="glass rounded-lg p-3 mb-3 space-y-2 border border-gold/20">
          <div className="grid grid-cols-2 gap-2">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xs" placeholder="Collection Name" />
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field text-xs" placeholder="slug-url" />
          </div>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-xs w-full" placeholder="Description" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: e.target.value })} className="input-field text-xs" placeholder="Order" />
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-text-dim">Visible</label>
              <input type="checkbox" checked={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.checked })} className="accent-gold" />
            </div>
          </div>
          <ImageUpload currentImage={form.image} onUpload={url => setForm({ ...form, image: url })} compact />

          {/* Product Picker */}
          <div>
            <label className="text-[10px] text-text-dim mb-1 block">Products in this collection</label>
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedProducts.map(p => (
                  <span key={p.id} className="inline-flex items-center gap-1 badge badge-gold text-[9px]">
                    {p.name}
                    <button onClick={() => toggleProduct(p.id)} className="bg-transparent border-none cursor-pointer p-0 text-gold hover:text-white"><X size={9} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-text-dim" size={12} />
              <input value={productSearch} onChange={e => setProductSearch(e.target.value)} className="input-field text-xs pl-7 w-full" placeholder="Search products to add..." />
            </div>
            {productSearch && (
              <div className="glass rounded-lg mt-1 max-h-32 overflow-y-auto">
                {filteredProducts.filter(p => !(form.productIds || []).includes(p.id)).slice(0, 10).map(p => (
                  <button key={p.id} onClick={() => toggleProduct(p.id)}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-text hover:bg-gold-dim flex items-center gap-2 bg-transparent border-none cursor-pointer">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-5 h-5 rounded object-cover" />}
                    <span className="truncate">{p.name}</span>
                    <span className="text-text-dim ml-auto">₹{p.price}</span>
                  </button>
                ))}
                {filteredProducts.filter(p => !(form.productIds || []).includes(p.id)).length === 0 && (
                  <p className="text-[10px] text-text-dim py-2 text-center">No matching products</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-1.5">
            <button onClick={async () => { await saveCollection(); setEditing(null) }} className="btn-gold text-xs px-3 py-1.5 inline-flex items-center gap-1"><Save size={10} /> Create</button>
            <button onClick={() => setEditing(null)} className="glass text-xs px-3 py-1.5 text-text-muted inline-flex items-center gap-1"><X size={10} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-0.5">
        {collections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(col => renderCollection(col))}
      </div>

      {collections.length === 0 && (
        <p className="text-text-dim text-xs py-4 text-center glass rounded-lg">No collections yet. Create one to group products.</p>
      )}
    </div>
  )
}
