import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'
import { Search, Edit, Trash2, Save, X, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import ImageUpload from '../../components/ui/ImageUpload'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    async function load() {
      const [prodSnap, catSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc'))),
        getDocs(collection(db, 'categories')),
      ])
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [])

  useEffect(() => {
    let f = products
    if (search) f = f.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    if (catFilter) f = f.filter(p => p.categoryId === catFilter)
    setFiltered(f); setPage(1)
  }, [products, search, catFilter])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  function startEdit(p) { setEditing(p.id); setEditForm({ ...p }) }
  function cancelEdit() { setEditing(null); setEditForm({}) }

  async function saveEdit() {
    const { id, ...data } = editForm
    await updateDoc(doc(db, 'products', id), data)
    setProducts(products.map(p => p.id === id ? { ...data, id } : p))
    cancelEdit()
    toast.success('Product updated')
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await deleteDoc(doc(db, 'products', id))
    setProducts(products.filter(p => p.id !== id))
    toast.success('Product deleted')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Products</h1>
        <span className="text-[11px] text-text-muted">{filtered.length} products</span>
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
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {paginated.map(p => (
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
                          <img src={p.image || '/placeholder.svg'} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                          <span className="text-xs text-text font-medium line-clamp-1">{p.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {editing === p.id ? (
                        <select value={editForm.categoryId || ''} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })} className="input-field text-[10px] w-full">
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      ) : <span className="text-[11px] text-text-muted">{categories.find(c => c.id === p.categoryId)?.name || '—'}</span>}
                    </td>
                    <td className="py-2 px-3">
                      {editing === p.id ? (
                        <input type="number" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} className="input-field text-xs w-20" />
                      ) : <span className="text-xs text-gold">₹{p.price?.toLocaleString()}</span>}
                    </td>
                    <td className="py-2 px-3">
                      {editing === p.id ? (
                        <input type="number" value={editForm.stock || ''} onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })} className="input-field text-xs w-16" />
                      ) : <span className={`badge ${p.stock > 0 ? 'badge-green' : 'badge-red'} text-[9px]`}>{p.stock}</span>}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {editing === p.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={saveEdit} className="p-1.5 glass rounded-lg hover:bg-gold-dim"><Save size={12} className="text-gold" /></button>
                          <button onClick={cancelEdit} className="p-1.5 glass rounded-lg hover:bg-red-dim"><X size={12} className="text-red-400" /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => startEdit(p)} className="p-1.5 glass rounded-lg hover:bg-gold-dim"><Edit size={12} className="text-gold" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 glass rounded-lg hover:bg-red-dim"><Trash2 size={12} className="text-red-400" /></button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
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
