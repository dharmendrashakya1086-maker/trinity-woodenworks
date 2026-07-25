import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'
import { Search, Edit, Trash2, Save, X, Upload, ChevronLeft, ChevronRight, ArrowUpCircle, RefreshCw } from 'lucide-react'
import ImageUpload from '../../components/ui/ImageUpload'

export default function Products() {
  const [drafts, setDrafts] = useState([])
  const [live, setLive] = useState([])
  const [categories, setCategories] = useState([])
  const [catDrafts, setCatDrafts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)
  const perPage = 10

  useEffect(() => {
    async function safeGet(q) { try { return await getDocs(q) } catch { return { docs: [] } } }
    async function load() {
      const [draftSnap, liveSnap, catSnap, catDraftSnap] = await Promise.all([
        safeGet(query(collection(db, 'products_draft'), orderBy('createdAt', 'desc'))),
        safeGet(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        safeGet(collection(db, 'categories')),
        safeGet(collection(db, 'categories_draft')),
      ])
      setDrafts(draftSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLive(liveSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCatDrafts(catDraftSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [])

  // Merge drafts + live for display
  useEffect(() => {
    const allIds = new Set([...drafts.map(d => d.id), ...live.map(d => d.id)])
    let merged = [...allIds].map(id => {
      const d = drafts.find(x => x.id === id)
      const l = live.find(x => x.id === id)
      return { id, draft: d || null, live: l || null, name: d?.name || l?.name || '' }
    })
    if (search) merged = merged.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    if (catFilter) merged = merged.filter(p => (p.draft?.categoryId || p.live?.categoryId) === catFilter)
    if (statusFilter === 'draft') merged = merged.filter(p => p.draft && !p.live)
    else if (statusFilter === 'live') merged = merged.filter(p => p.live)
    else if (statusFilter === 'changed') merged = merged.filter(p => p.draft && p.live && JSON.stringify(p.draft) !== JSON.stringify({ ...p.live, _draft: undefined }))
    setFiltered(merged); setPage(1)
  }, [drafts, live, search, catFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  function startEdit(p) {
    setEditing(p.id)
    setEditForm({ ...p.draft || p.live || {} })
  }
  function cancelEdit() { setEditing(null); setEditForm({}) }

  async function saveDraft(id) {
    const { _draft, _live, ...data } = editForm
    data.updatedAt = new Date().toISOString()
    await setDoc(doc(db, 'products_draft', id), data, { merge: true })
    setDrafts(drafts.map(d => d.id === id ? { ...data, id } : d))
    cancelEdit()
    toast.success('Draft saved')
  }

  async function publishSingle(id) {
    const d = drafts.find(x => x.id === id)
    if (!d) return
    await setDoc(doc(db, 'products', id), d)
    setLive(live.map(x => x.id === id ? { ...d } : x))
    toast.success('Published')
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product from drafts AND live?')) return
    await Promise.all([
      deleteDoc(doc(db, 'products_draft', id)).catch(() => {}),
      deleteDoc(doc(db, 'products', id)).catch(() => {}),
    ])
    setDrafts(drafts.filter(d => d.id !== id))
    setLive(live.filter(d => d.id !== id))
    toast.success('Deleted')
  }

  async function syncLiveToDrafts() {
    if (!confirm('Copy all live products to drafts? This lets you edit them.')) return
    setSyncing(true)
    try {
      for (const p of live) {
        await setDoc(doc(db, 'products_draft', p.id), p)
      }
      setDrafts([...live])
      toast.success(`Synced ${live.length} products to drafts`)
    } catch (err) { toast.error('Sync failed') }
    setSyncing(false)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Products</h1>
          <p className="text-[11px] text-text-muted mt-0.5">{drafts.length} drafts · {live.length} live</p>
        </div>
        {live.length > 0 && drafts.length === 0 && (
          <button onClick={syncLiveToDrafts} disabled={syncing} className="btn-gold text-xs inline-flex items-center gap-1.5 disabled:opacity-50">
            <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing...' : 'Sync Live to Drafts'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
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

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
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
                  const catList = catDrafts.length ? catDrafts : categories
                  const catName = catList.find(c => c.id === (item?.categoryId))?.name || '—'

                  return (
                    <motion.tr key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="py-2 px-3">
                        {editing === p.id ? (
                          <div className="space-y-2">
                            <input value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="input-field text-xs w-full" placeholder="Name" />
                            <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="input-field text-xs w-full min-h-[60px]" placeholder="Description" />
                            <ImageUpload currentImage={editForm.image} onUpload={url => setEditForm({ ...editForm, image: url })} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <img src={item?.image || '/placeholder.svg'} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                            <span className="text-xs text-text font-medium line-clamp-1">{item?.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        {editing === p.id ? (
                          <select value={editForm.categoryId || ''} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })} className="input-field text-[10px] w-full">
                            {catList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : <span className="text-[11px] text-text-muted">{catName}</span>}
                      </td>
                      <td className="py-2 px-3">
                        {editing === p.id ? (
                          <input type="number" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} className="input-field text-xs w-20" />
                        ) : <span className="text-xs text-gold">₹{item?.price?.toLocaleString()}</span>}
                      </td>
                      <td className="py-2 px-3">
                        {editing === p.id ? (
                          <input type="number" value={editForm.stock || ''} onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })} className="input-field text-xs w-16" />
                        ) : <span className={`badge ${(item?.stock || 0) > 0 ? 'badge-green' : 'badge-red'} text-[9px]`}>{item?.stock || 0}</span>}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1">
                          {isLive && <span className="badge badge-green text-[9px]">Live</span>}
                          {isDraft && !isLive && <span className="badge badge-gold text-[9px]">New</span>}
                          {hasChanges && <span className="badge badge-blue text-[9px]">Changed</span>}
                          {!isLive && !isDraft && <span className="badge badge-red text-[9px]">Deleted</span>}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        {editing === p.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => saveDraft(p.id)} className="p-1.5 glass rounded-lg hover:bg-gold-dim"><Save size={12} className="text-gold" /></button>
                            <button onClick={cancelEdit} className="p-1.5 glass rounded-lg hover:bg-red-dim"><X size={12} className="text-red-400" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {isDraft && <button onClick={() => publishSingle(p.id)} className="p-1.5 glass rounded-lg hover:bg-gold-dim" title="Publish"><ArrowUpCircle size={12} className="text-gold" /></button>}
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

// ponytail: using setDoc with merge for upsert
