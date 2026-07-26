import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'
import { ShoppingCart, ArrowLeft, Edit, Save, Minus, Plus, Truck, RotateCcw, Shield, Heart, Share2, Check } from 'lucide-react'

export default function Product() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const { addItem, items } = useCart()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [qty, setQty] = useState(1)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    async function load() {
      // Try by slug first, then by ID
      let snap = await getDoc(doc(db, 'products', id))
      if (!snap.exists()) {
        const q = query(collection(db, 'products'), where('slug', '==', id))
        const qSnap = await getDocs(q)
        if (!qSnap.empty) snap = qSnap.docs[0]
      }

      if (snap?.exists()) {
        const data = { id: snap.id, ...snap.data() }
        setProduct(data)
        setForm(data)

        // Load related products
        if (data.categoryId) {
          const relQ = query(collection(db, 'products'), where('categoryId', '==', data.categoryId))
          const relSnap = await getDocs(relQ)
          setRelatedProducts(relSnap.docs.filter(d => d.id !== data.id).slice(0, 4).map(d => ({ id: d.id, ...d.data() })))
        }
      }
      setLoading(false)
    }
    load()
  }, [id])

  const cartItem = items?.find(i => i.id === product?.id)

  async function handleAddToCart() {
    if (!user) { toast.error('Please sign in to add to cart'); return }
    const itemToAdd = selectedVariant
      ? { ...product, ...selectedVariant, variantId: selectedVariant.id, variantName: selectedVariant.name }
      : product
    await addItem(itemToAdd, qty)
    toast.success('Added to cart!')
  }

  async function handleSave() {
    const updates = {
      name: form.name, slug: form.slug, price: Number(form.price),
      compareAtPrice: Number(form.compareAtPrice) || 0,
      description: form.description, shortDescription: form.shortDescription,
      stock: Number(form.stock) || 0, stockStatus: form.stockStatus,
      materials: form.materials, dimensions: form.dimensions, weight: form.weight,
      warranty: form.warranty, careInstructions: form.careInstructions,
      seoTitle: form.seoTitle, seoDescription: form.seoDescription,
      brand: form.brand,
    }
    if (isAdmin) {
      await setDoc(doc(db, 'products_draft', id), { ...product, ...updates, updatedAt: new Date().toISOString() }, { merge: true })
      toast.success('Draft saved — publish from Dashboard')
    } else {
      await setDoc(doc(db, 'products', id), { ...product, ...updates }, { merge: true })
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
      <div className="text-center">
        <p className="text-text-muted mb-4">Product not found</p>
        <Link to="/shop" className="btn-gold no-underline text-sm">Back to Shop</Link>
      </div>
    </div>
  )

  // Variant-aware computed values
  const activePrice = selectedVariant?.price || product.price
  const activeCompareAt = selectedVariant?.compareAtPrice || product.compareAtPrice
  const activeStock = selectedVariant?.stock ?? product.stock
  const activeStockStatus = selectedVariant?.stockStatus || product.stockStatus
  const activeSku = selectedVariant?.sku || product.sku
  const activeImage = selectedVariant?.image || null
  const images = activeImage
    ? [activeImage, ...(product.images || []).filter(i => i !== activeImage)]
    : (product.images?.length ? product.images : [product.image || '/placeholder.svg'])

  // Group variants by type
  const variantTypes = {}
  ;(product.variants || []).forEach(v => {
    if (!variantTypes[v.type]) variantTypes[v.type] = []
    variantTypes[v.type].push(v)
  })

  return (
    <div className="pt-20 pb-16 max-w-6xl mx-auto px-4 sm:px-6">
      <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-gold no-underline mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="glass rounded-2xl overflow-hidden mb-3">
            <img src={images[selectedImage]} alt={product.name} className="w-full aspect-square object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <span className="badge badge-gold">{product.categoryId || 'Product'}</span>
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
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field text-sm" placeholder="slug-url" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field text-sm" placeholder="Price" />
                <input type="number" value={form.compareAtPrice} onChange={e => setForm({ ...form, compareAtPrice: e.target.value })} className="input-field text-sm" placeholder="Compare at" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="input-field text-sm" placeholder="Stock" />
                <select value={form.stockStatus} onChange={e => setForm({ ...form, stockStatus: e.target.value })} className="input-field text-sm">
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="pre_order">Pre Order</option>
                </select>
              </div>
              <input value={form.materials} onChange={e => setForm({ ...form, materials: e.target.value })} className="input-field text-sm" placeholder="Materials" />
              <input value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} className="input-field text-sm" placeholder="Dimensions" />
              <input value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className="input-field text-sm" placeholder="Weight" />
              <input value={form.warranty} onChange={e => setForm({ ...form, warranty: e.target.value })} className="input-field text-sm" placeholder="Warranty" />
              <textarea value={form.careInstructions} onChange={e => setForm({ ...form, careInstructions: e.target.value })} className="input-field text-sm min-h-[60px]" placeholder="Care Instructions" />
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-sm min-h-[80px]" placeholder="Description" />
            </div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
                {product.name}
              </h1>

              {product.brand && <p className="text-xs text-text-muted mb-2">{product.brand}</p>}

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-gold">₹{activePrice?.toLocaleString()}</span>
                {activeCompareAt > activePrice && (
                  <>
                    <span className="text-sm text-text-dim line-through">₹{activeCompareAt.toLocaleString()}</span>
                    <span className="badge badge-green text-[10px]">
                      {Math.round((1 - activePrice / activeCompareAt) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {product.shortDescription && (
                <p className="text-sm text-text-muted mb-3">{product.shortDescription}</p>
              )}

              {/* Variant Selectors */}
              {Object.keys(variantTypes).length > 0 && (
                <div className="space-y-3 mb-5">
                  {Object.entries(variantTypes).map(([type, variants]) => (
                    <div key={type}>
                      <p className="text-[11px] text-text-muted mb-1.5 capitalize">{type}</p>
                      <div className="flex flex-wrap gap-2">
                        {variants.map(v => (
                          <button key={v.id} onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer
                              ${selectedVariant?.id === v.id
                                ? 'border-gold bg-gold-dim text-gold'
                                : 'border-white/[0.08] bg-white/[0.02] text-text-muted hover:border-gold/30'}`}>
                            {v.image && <img src={v.image} alt="" className="w-4 h-4 rounded inline mr-1.5 object-cover" />}
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm text-text-muted leading-relaxed mb-5">{product.description || 'No description available.'}</p>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {product.materials && (
                  <div className="glass rounded-lg p-3">
                    <p className="text-[10px] text-text-dim mb-1">Material</p>
                    <p className="text-xs text-text font-medium">{product.materials}</p>
                  </div>
                )}
                {product.dimensions && (
                  <div className="glass rounded-lg p-3">
                    <p className="text-[10px] text-text-dim mb-1">Dimensions</p>
                    <p className="text-xs text-text font-medium">{product.dimensions}</p>
                  </div>
                )}
                {product.weight && (
                  <div className="glass rounded-lg p-3">
                    <p className="text-[10px] text-text-dim mb-1">Weight</p>
                    <p className="text-xs text-text font-medium">{product.weight}</p>
                  </div>
                )}
                {activeSku && (
                  <div className="glass rounded-lg p-3">
                    <p className="text-[10px] text-text-dim mb-1">SKU</p>
                    <p className="text-xs text-text font-medium">{activeSku}</p>
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="mb-5">
                {activeStock > 0 ? (
                  <span className="badge badge-green">In Stock ({activeStock} available)</span>
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
                <button onClick={handleAddToCart} disabled={activeStock <= 0}
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

              {/* Care Instructions */}
              {product.careInstructions && (
                <div className="mt-5 glass rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-text mb-2">Care Instructions</h3>
                  <p className="text-[11px] text-text-muted leading-relaxed">{product.careInstructions}</p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold gold-text mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <Link key={p.id} to={`/product/${p.slug || p.id}`} className="block product-card no-underline group">
                <div className="aspect-square overflow-hidden">
                  <img src={p.images?.[0] || p.image || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-text line-clamp-1">{p.name}</h3>
                  <span className="text-sm font-bold text-gold">₹{p.price?.toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
