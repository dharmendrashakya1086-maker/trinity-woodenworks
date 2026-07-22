import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Save, X, Search } from 'lucide-react'
import ImageUpload from '../../components/ui/ImageUpload'

const emptyProduct = { name: '', price: '', mrp: '', description: '', category: '', stock: '', image: '' }

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [editingId, setEditingId] = useState(null)
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')

  async function load() {
    const [prodSnap, catSnap] = await Promise.all([
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'categories')),
    ])
    setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { load() }, [])

  async function handleSave() {
    const data = {
      name: form.name,
      price: Number(form.price),
      mrp: Number(form.mrp) || 0,
      description: form.description,
      category: form.category,
      stock: Number(form.stock) || 0,
      image: form.image,
    }

    if (editingId) {
      await updateDoc(doc(db, 'products', editingId), data)
      toast.success('Product updated!')
    } else {
      await addDoc(collection(db, 'products'), data)
      toast.success('Product added!')
    }
    setEditingId(null)
    setAdding(false)
    setForm(emptyProduct)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await deleteDoc(doc(db, 'products', id))
    toast.success('Deleted!')
    load()
  }

  function startEdit(p) {
    setForm({
      name: p.name || '',
      price: p.price || '',
      mrp: p.mrp || '',
      description: p.description || '',
      category: p.category || '',
      stock: p.stock || '',
      image: p.image || '',
    })
    setEditingId(p.id)
    setAdding(false)
  }

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Products</h1>
        <button
          onClick={() => { setAdding(true); setEditingId(null); setForm(emptyProduct) }}
          className="btn-gold flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      {/* Add/Edit Form */}
      {(adding || editingId) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text">{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <button onClick={() => { setAdding(false); setEditingId(null) }} className="text-text-muted hover:text-text bg-transparent border-none cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" placeholder="Price (₹)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" />
            <input type="number" placeholder="MRP (₹)" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} className="input-field" />
            <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field" />
          </div>
          <div className="mt-4">
            <ImageUpload value={form.image} onChange={url => setForm({ ...form, image: url })} />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field mt-4 min-h-[80px]" />
          <button onClick={handleSave} className="btn-gold mt-4 flex items-center gap-2 text-sm">
            <Save size={16} /> {editingId ? 'Update' : 'Add'} Product
          </button>
        </motion.div>
      )}

      {/* Products Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-4 text-text-muted font-medium">Product</th>
                <th className="text-left p-4 text-text-muted font-medium">Category</th>
                <th className="text-left p-4 text-text-muted font-medium">Price</th>
                <th className="text-left p-4 text-text-muted font-medium">Stock</th>
                <th className="text-right p-4 text-text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-dark-border hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image || '/placeholder.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <span className="text-text font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-text-muted capitalize">{p.category || '—'}</td>
                  <td className="p-4 text-gold font-semibold">₹{p.price?.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`font-medium ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.stock || 0}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => startEdit(p)} className="p-2 text-text-muted hover:text-gold hover:bg-gold-dim rounded-lg bg-transparent border-none cursor-pointer transition-all mr-1">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg bg-transparent border-none cursor-pointer transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
