import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'
import { ShoppingCart, ArrowLeft, Edit, Save, Minus, Plus, Truck, RotateCcw, Shield } from 'lucide-react'

export default function Product() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const { addItem, items } = useCart()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'products', id))
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setProduct(data)
        setForm(data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const cartItem = items?.find(i => i.id === product?.id)

  async function handleAddToCart() {
    if (!user) { toast.error('Please sign in to add to cart'); return }
    await addItem(product, qty)
    toast.success('Added to cart!')
  }

  async function handleSave() {
    const updates = {
      name: form.name, price: Number(form.price), mrp: Number(form.mrp) || 0,
      description: form.description, stock: Number(form.stock) || 0,
    }
    if (isAdmin) {
      // Admin edits go to draft only — publish to make live
      await setDoc(doc(db, 'products_draft', id), { ...product, ...updates, updatedAt: new Date().toISOString() }, { merge: true })
      toast.success('Draft saved — go to Dashboard → Publish to make live')
    } else {
      await updateDoc(doc(db, 'products', id), updates)
      toast.success('Updated!')
    }
    setProduct({ ...product, ...updates })
    setEditing(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <p className="text-text-muted">Product not found</p>
    </div>
  )

  return (
    <div className="pt-20 pb-16 max-w-6xl mx-auto px-4 sm:px-6">
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-gold no-underline mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="glass rounded-2xl overflow-hidden">
            <img src={product.image || '/placeholder.svg'} alt={product.name} className="w-full aspect-square object-cover" />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <span className="badge badge-gold">{product.category || 'Product'}</span>
            {isAdmin && (
              <button onClick={() => editing ? handleSave() : setEditing(true)}
                className="p-2 glass rounded-lg hover:bg-gold-dim transition-all">
                {editing ? <Save size={14} className="text-gold" /> : <Edit size={14} className="text-gold" />}
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-3 glass rounded-xl p-4">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-sm" placeholder="Name" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field text-sm" placeholder="Price" />
                <input type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: e.target.value })} className="input-field text-sm" placeholder="MRP" />
              </div>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field text-sm" placeholder="Stock" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-sm min-h-[80px]" placeholder="Description" />
            </div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-gold">₹{product.price?.toLocaleString()}</span>
                {product.mrp > product.price && (
                  <span className="text-sm text-text-dim line-through">₹{product.mrp.toLocaleString()}</span>
                )}
                {product.mrp > product.price && (
                  <span className="badge badge-green text-[10px]">
                    {Math.round((1 - product.price / product.mrp) * 100)}% OFF
                  </span>
                )}
              </div>

              <p className="text-sm text-text-muted leading-relaxed mb-5">{product.description || 'No description available.'}</p>

              {/* Stock */}
              <div className="mb-5">
                {product.stock > 0 ? (
                  <span className="badge badge-green">In Stock ({product.stock} available)</span>
                ) : (
                  <span className="badge badge-red">Out of Stock</span>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-3 mb-6">
                <div className="qty-controls">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={14} /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)}><Plus size={14} /></button>
                </div>
                <button onClick={handleAddToCart} disabled={product.stock <= 0}
                  className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                  <ShoppingCart size={16} /> {cartItem ? `In Cart (${cartItem.qty})` : 'Add to Cart'}
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: 'Free Delivery' },
                  { icon: Shield, label: '2-Year Warranty' },
                  { icon: RotateCcw, label: 'Easy Returns' },
                ].map(b => (
                  <div key={b.label} className="glass rounded-xl p-3 text-center">
                    <b.icon size={16} className="mx-auto text-gold mb-1" />
                    <p className="text-[10px] text-text-muted">{b.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
