import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getMergedEntities, getEntities, saveDraft, publishEntity, publishAll,
  deleteEntity, saveVersion, logAudit, generateSlug, STATUSES
} from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  Search, Edit, Trash2, Save, X, ChevronLeft, ChevronRight,
  ArrowUpCircle, Plus, Eye, History, Loader, ChevronDown, ChevronUp, Link as LinkIcon, Unlink
} from 'lucide-react'
import ImageUpload from '../../components/ui/ImageUpload'
import ImageManager from '../../components/admin/ImageManager'
import VariantManager from '../../components/admin/VariantManager'
import AdminAI from '../../components/admin/AdminAI'

const EMPTY_PRODUCT = {
  name: '', slug: '', description: '', shortDescription: '',
  price: 0, compareAtPrice: 0, sku: '',
  categoryId: '', categories: [], collectionIds: [],
  brand: '', materials: '', dimensions: '', weight: '',
  warranty: '', careInstructions: '',
  images: [], gallery: [],
  variants: [],
  relatedProductIds: [], similarProductIds: [], frequentlyBoughtTogetherIds: [], similarProductIds: [], frequentlyBoughtTogetherIds: [],
  seoTitle: '', seoDescription: '', seoKeywords: '',
  featured: false, stock: 0, stockStatus: 'in_stock',
}

const STOCK_STATUSES = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'pre_order', label: 'Pre Order' },
  { value: 'back_order', label: 'Back Order' },
]

const STATUS_COLORS = {
  draft: 'badge-gold', in_review: 'badge-blue', scheduled: 'badge-blue',
  published: 'badge-green', archived: 'badge-red',
}

export default function Products() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [expanded, setExpanded] = useState(null)
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [allProducts, setAllProducts] = useState([])
  const [relSearch, setRelSearch] = useState('')
  const [relField, setRelField] = useState('')
  const [selected, setSelected] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const perPage = 10

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [merged, cats, prods] = await Promise.all([
      getMergedEntities('products'),
      getEntities('categories'),
      getEntities('products'),
    ])
    setItems(merged)
    setCategories(cats)
    setAllProducts(prods)
    setLoading(false)
  }

  useEffect(() => {
    let f = items
    if (search) f = f.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    if (catFilter) f = f.filter(p => (p.draft?.categoryId || p.live?.categoryId) === catFilter)
    if (statusFilter === 'draft') f = f.filter(p => p.draft && !p.live)
    else if (statusFilter === 'live') f = f.filter(p => p.live)
    else if (statusFilter === 'changed') f = f.filter(p => p.draft && p.live && JSON.stringify(p.draft) !== JSON.stringify(p.live))
    setFiltered(f); setPage(1)
  }, [items, search, catFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  function startEdit(p) {
    setEditing(p.id)
    setEditForm({ ...EMPTY_PRODUCT, ...p.draft || p.live || {} })
  }
  function cancelEdit() { setEditing(null); setEditForm({}) }

  async function saveDraftProduct() {
    const data = { ...editForm }
    if (!data.slug) data.slug = generateSlug(data.name)
    data.price = Number(data.price) || 0
    data.compareAtPrice = Number(data.compareAtPrice) || 0
    data.stock = Number(data.stock) || 0
    data.version = (editForm.version || 0) + 1

    await saveDraft('products', editing, data)
    await saveVersion('products', editing, data, user.uid)
    await logAudit({ userId: user.uid, action: 'save_draft', entityType: 'products', entityId: editing, newValue: data })
    toast.success('Draft saved')
    cancelEdit()
    load()
  }

  async function handlePublish(id) {
    try {
      await publishEntity('products', id)
      await logAudit({ userId: user.uid, action: 'publish', entityType: 'products', entityId: id })
      toast.success('Published')
      load()
    } catch (err) { toast.error(err.message) }
  }

  async function handlePublishAll() {
    const count = items.filter(p => p.draft && !p.live).length
    if (count === 0) { toast('Nothing to publish'); return }
    if (!confirm(`Publish ${count} products to live?`)) return
    setPublishing(true)
    try {
      const n = await publishAll('products')
      await logAudit({ userId: user.uid, action: 'publish_all', entityType: 'products', newValue: { count: n } })
      toast.success(`Published ${n} products`)
      load()
    } catch (err) { toast.error(err.message) }
    setPublishing(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await deleteEntity('products_draft', id).catch(() => {})
    await deleteEntity('products', id).catch(() => {})
    await logAudit({ userId: user.uid, action: 'delete', entityType: 'products', entityId: id })
    toast.success('Deleted')
    load()
  }

  async function syncLiveToDrafts() {
    if (!confirm('Copy all live products to drafts?')) return
    setSyncing(true)
    try {
      const liveItems = items.filter(p => p.live).map(p => p.live)
      for (const p of liveItems) {
        await saveDraft('products', p.id, p)
      }
      await logAudit({ userId: user.uid, action: 'sync_live_to_drafts', entityType: 'products', newValue: { count: liveItems.length } })
      toast.success(`Synced ${liveItems.length} products`)
      load()
    } catch { toast.error('Sync failed') }
    setSyncing(false)
  }

  async function handleBulkAction() {
    if (!bulkAction || selected.length === 0) return
    if (!confirm(`Apply "${bulkAction}" to ${selected.length} products?`)) return

    try {
      if (bulkAction === 'publish') {
        for (const id of selected) {
          const item = items.find(p => p.id === id)
          if (item?.draft) await publishEntity('products', id)
        }
        toast.success(`Published ${selected.length} products`)
      } else if (bulkAction === 'delete') {
        for (const id of selected) {
          await deleteEntity('products_draft', id).catch(() => {})
          await deleteEntity('products', id).catch(() => {})
        }
        toast.success(`Deleted ${selected.length} products`)
      } else if (bulkAction === 'archive') {
        for (const id of selected) {
          const item = items.find(p => p.id === id)
          if (item?.draft) {
            await saveDraft('products', id, { ...item.draft, status: 'archived' })
          }
        }
        toast.success(`Archived ${selected.length} products`)
      }
      await logAudit({ userId: user.uid, action: `bulk_${bulkAction}`, entityType: 'products', newValue: { ids: selected } })
      setSelected([])
      setBulkAction('')
      load()
    } catch (err) { toast.error(err.message) }
  }

  function toggleSelect(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function toggleSelectAll() {
    const pageIds = paginated.map(p => p.id)
    const allSelected = pageIds.every(id => selected.includes(id))
    if (allSelected) {
      setSelected(s => s.filter(id => !pageIds.includes(id)))
    } else {
      setSelected(s => [...new Set([...s, ...pageIds])])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Products</h1>
          <p className="text-[11px] text-text-muted mt-0.5">{items.filter(p => p.draft).length} drafts · {items.filter(p => p.live).length} live</p>
        </div>
        <div className="flex gap-2">
          {items.some(p => p.draft && !p.live) && (
            <button onClick={syncLiveToDrafts} disabled={syncing} className="btn-gold text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
              {syncing ? <Loader size={12} className="animate-spin" /> : <ArrowUpCircle size={12} />} Sync Live
            </button>
          )}
          <button onClick={handlePublishAll} disabled={publishing} className="btn-gold text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            {publishing ? <Loader size={12} className="animate-spin" /> : <ArrowUpCircle size={12} />} Publish All
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selected.length > 0 && (
          <div className="flex items-center gap-2 glass rounded-lg px-3 py-2 border border-gold/20">
            <span className="text-[11px] text-gold">{selected.length} selected</span>
            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="input-field text-[10px] w-auto">
              <option value="">Action...</option>
              <option value="publish">Publish</option>
              <option value="archive">Archive</option>
              <option value="delete">Delete</option>
            </select>
            <button onClick={handleBulkAction} disabled={!bulkAction} className="btn-gold text-[10px] px-2 py-1 disabled:opacity-40">
              Apply
            </button>
          </div>
        )}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
          <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-field text-xs w-auto">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-xs w-auto">
          <option value="">All Status</option>
          <option value="draft">Draft Only</option>
          <option value="live">Live Only</option>
          <option value="changed">Unpublished Changes</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10"><Loader size={24} className="animate-spin text-gold mx-auto" /></div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">
                    <input type="checkbox" checked={paginated.length > 0 && paginated.every(p => selected.includes(p.id))}
                      onChange={toggleSelectAll} className="accent-gold" />
                  </th>
                  <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Product</th>
                  <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Category</th>
                  <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Price</th>
                  <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Stock</th>
                  <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Status</th>
                  <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map(p => {
                    const item = p.draft || p.live
                    const isDraft = !!p.draft
                    const isLive = !!p.live
                    const hasChanges = isDraft && isLive && JSON.stringify(p.draft) !== JSON.stringify(p.live)
                    const catName = categories.find(c => c.id === item?.categoryId)?.name || '—'
                    const isExpanded = expanded === p.id

                    return (
                      <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="accent-gold" />
                            <button onClick={() => setExpanded(isExpanded ? null : p.id)} className="p-1 glass rounded hover:bg-gold-dim">
                              {isExpanded ? <ChevronUp size={12} className="text-text-muted" /> : <ChevronDown size={12} className="text-text-muted" />}
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          {editing === p.id ? (
                            <div className="space-y-2 min-w-[300px]">
                              <div className="flex items-center justify-between">
                                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="input-field text-xs flex-1 mr-2" placeholder="Product Name" />
                                <AdminAI product={editForm} onApply={(field, value) => setEditForm({ ...editForm, [field]: value })} />
                              </div>
                              <input value={editForm.slug} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} className="input-field text-xs w-full" placeholder="slug-url" />
                              <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="input-field text-xs w-full min-h-[60px]" placeholder="Description" />
                              <input value={editForm.shortDescription} onChange={e => setEditForm({ ...editForm, shortDescription: e.target.value })} className="input-field text-xs w-full" placeholder="Short description" />
                              <ImageManager images={editForm.images || []} onChange={images => setEditForm({ ...editForm, images })} productId={editing} />
                              <VariantManager variants={editForm.variants || []} onChange={variants => setEditForm({ ...editForm, variants })} />

                              {/* Product Relationships */}
                              <div className="space-y-2">
                                {[
                                  { key: 'similarProductIds', label: 'Similar Products' },
                                  { key: 'frequentlyBoughtTogetherIds', label: 'Frequently Bought Together' },
                                ].map(rel => (
                                  <div key={rel.key}>
                                    <label className="text-[10px] text-text-dim mb-1 block">{rel.label}</label>
                                    <div className="flex flex-wrap gap-1 mb-1">
                                      {(editForm[rel.key] || []).map(pid => {
                                        const p = allProducts.find(x => x.id === pid)
                                        return p ? (
                                          <span key={pid} className="inline-flex items-center gap-1 badge badge-gold text-[9px]">
                                            {p.name}
                                            <button type="button" onClick={() => setEditForm({ ...editForm, [rel.key]: (editForm[rel.key] || []).filter(id => id !== pid) })} className="bg-transparent border-none cursor-pointer p-0 text-gold hover:text-white"><X size={9} /></button>
                                          </span>
                                        ) : null
                                      })}
                                    </div>
                                    <select value="" onChange={e => {
                                      if (e.target.value) {
                                        const ids = editForm[rel.key] || []
                                        if (!ids.includes(e.target.value)) setEditForm({ ...editForm, [rel.key]: [...ids, e.target.value] })
                                      }
                                    }} className="input-field text-[10px] w-full">
                                      <option value="">+ Add product</option>
                                      {allProducts.filter(p => p.id !== editing && !(editForm[rel.key] || []).includes(p.id)).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <img src={item?.images?.[0] || item?.image || '/placeholder.svg'} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                              <div>
                                <span className="text-xs text-text font-medium line-clamp-1">{item?.name}</span>
                                <span className="text-[10px] text-text-dim block">v{item?.version || 1}</span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {editing === p.id ? (
                            <select value={editForm.categoryId} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })} className="input-field text-[10px] w-full">
                              <option value="">None</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          ) : <span className="text-[11px] text-text-muted">{catName}</span>}
                        </td>
                        <td className="py-2 px-3">
                          {editing === p.id ? (
                            <div className="space-y-1">
                              <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="input-field text-xs w-20" placeholder="Price" />
                              <input type="number" value={editForm.compareAtPrice} onChange={e => setEditForm({ ...editForm, compareAtPrice: e.target.value })} className="input-field text-xs w-20" placeholder="Compare at" />
                            </div>
                          ) : <span className="text-xs text-gold">₹{item?.price?.toLocaleString()}</span>}
                        </td>
                        <td className="py-2 px-3">
                          {editing === p.id ? (
                            <div className="space-y-1">
                              <input type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className="input-field text-xs w-16" placeholder="Qty" />
                              <select value={editForm.stockStatus} onChange={e => setEditForm({ ...editForm, stockStatus: e.target.value })} className="input-field text-[10px] w-full">
                                {STOCK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            </div>
                          ) : (
                            <span className={`badge ${(item?.stock || 0) > 0 ? 'badge-green' : 'badge-red'} text-[9px]`}>
                              {item?.stock || 0} · {item?.stockStatus || 'in_stock'}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {isLive && <span className="badge badge-green text-[9px]">Live</span>}
                            {isDraft && !isLive && <span className="badge badge-gold text-[9px]">New</span>}
                            {hasChanges && <span className="badge badge-blue text-[9px]">Changed</span>}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          {editing === p.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={saveDraftProduct} className="p-1.5 glass rounded-lg hover:bg-gold-dim"><Save size={12} className="text-gold" /></button>
                              <button onClick={cancelEdit} className="p-1.5 glass rounded-lg hover:bg-red-dim"><X size={12} className="text-red-400" /></button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {isDraft && <button onClick={() => handlePublish(p.id)} className="p-1.5 glass rounded-lg hover:bg-gold-dim" title="Publish"><ArrowUpCircle size={12} className="text-gold" /></button>}
                              <button onClick={() => startEdit(p)} className="p-1.5 glass rounded-lg hover:bg-gold-dim"><Edit size={12} className="text-gold" /></button>
                              <button onClick={() => handleDelete(p.id)} className="p-1.5 glass rounded-lg hover:bg-red-dim"><Trash2 size={12} className="text-red-400" /></button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 glass rounded-lg disabled:opacity-30"><ChevronLeft size={14} className="text-text-muted" /></button>
          <span className="text-[11px] text-text-muted">{page}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 glass rounded-lg disabled:opacity-30"><ChevronRight size={14} className="text-text-muted" /></button>
        </div>
      )}
    </div>
  )
}
