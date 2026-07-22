import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'
import { ShoppingCart, ArrowLeft, Edit, X, Save } from 'lucide-react'

export default function Product() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'products', id))
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setProduct(data)
        setForm(data)
      }
    }
    load()
  }, [id])

  async function handleAddToCart() {
    if (!user) {
      toast.error('Please sign in to add to cart')
      return
    }
    await addItem(product, qty)
    toast.success('Added to cart!')
  }

  async function handleSave() {
    await updateDoc(doc(db, 'products', id), {
      name: form.name,
      price: Number(form.price),
      mrp: Number(form.mrp) || 0,
      description: form.description,
      stock: Number(form.stock) || 0,
    })
    setProduct({ ...product, ...form })
    setEditing(false)
    toast.success('Product updated!')
  }

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="pt-24 pb-16 max-w-6xl mx-auto px-4 sm:px-6">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-gold no-underline mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl overflow-hidden">
          <img src={product.image || '/placeholder.jpg'} alt={product.name} className="w-full aspect-square object-cover" />
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              {editing ? (
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xl font-bold mb-2" />
              ) : (
                <h1 className="text-2xl font-bold text-text" style={{ fontFamily: 'var(--font-heading)' }}>{product.name}</h1>
              )}
              <p className="text-xs text-text-muted mt-1 capitalize">{product.category || 'Uncategorized'}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                className="p-2 glass rounded-lg hover:bg-gold-dim transition-colors"
              >
                {editing ? <Save size={18} className="text-gold" /> : <Edit size={18} className="text-gold" />}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Price (₹)</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">MRP (₹)</label>
                  <input type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field min-h-[100px]" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-gold">₹{product.price?.toLocaleString()}</span>
                {product.mrp > product.price && (
                  <span className="text-sm text-text-muted line-through">₹{product.mrp.toLocaleString()}</span>
                )}
              </div>

              <p className="text-sm text-text-muted leading-relaxed">{product.description || 'No description available.'}</p>

              <div className="flex items-center gap-4">
                <div className="glass rounded-lg px-3 py-1">
                  <span className="text-xs text-text-muted">Stock: </span>
                  <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="glass rounded-lg flex items-center">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-text-muted hover:text-gold bg-transparent border-none cursor-pointer">-</button>
                  <span className="px-3 py-2 text-sm font-semibold text-text">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-text-muted hover:text-gold bg-transparent border-none cursor-pointer">+</button>
                </div>
                <button onClick={handleAddToCart} className="btn-gold flex-1 flex items-center justify-center gap-2">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
