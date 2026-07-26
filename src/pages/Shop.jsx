import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function Shop() {
  const { category, collectionId } = useParams()
  const categoryId = category
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      const [catSnap, colSnap] = await Promise.all([
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'collections')),
      ])
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCollections(colSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      let prodQuery
      if (collectionId) {
        const col = colSnap.docs.find(d => d.id === collectionId)
        const pIds = col?.data()?.productIds || []
        if (pIds.length > 0) {
          prodQuery = query(collection(db, 'products'), where('__name__', 'in', pIds.slice(0, 30)))
        } else {
          prodQuery = collection(db, 'products')
        }
      } else if (categoryId && categoryId !== 'all') {
        prodQuery = query(collection(db, 'products'), where('categoryId', '==', categoryId))
      } else {
        prodQuery = collection(db, 'products')
      }
      const prodSnap = await getDocs(prodQuery)
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [categoryId, collectionId])

  const filtered = products.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.materials?.toLowerCase().includes(q)
  })

  const activeCollection = collections.find(c => c.id === collectionId)
  const activeCategory = categories.find(c => c.id === categoryId)

  return (
    <div className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold gold-text mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          {activeCollection ? activeCollection.name : activeCategory ? activeCategory.name : 'All Products'}
        </h1>
        <p className="text-text-muted text-sm">{filtered.length} products</p>
      </motion.div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={15} />
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 text-sm w-full" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="glass px-3 rounded-lg flex items-center gap-1.5 text-xs text-text-muted hover:text-gold">
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {/* Collection chips */}
      {collections.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <Link to="/shop" className={`badge no-underline text-[11px] ${!collectionId ? 'badge-gold' : 'bg-white/[0.04] text-text-muted'}`}>All</Link>
          {collections.filter(c => c.visibility !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(c => (
            <Link key={c.id} to={`/shop/collection/${c.id}`} className={`badge no-underline text-[11px] ${collectionId === c.id ? 'badge-gold' : 'bg-white/[0.04] text-text-muted'}`}>
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.filter(c => c.visibility !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(c => (
          <Link key={c.id} to={`/shop/${c.id}`} className={`badge no-underline text-[11px] ${categoryId === c.id ? 'badge-gold' : 'bg-white/[0.04] text-text-muted'}`}>
            {c.name}
          </Link>
        ))}
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-sm mb-4">No products found</p>
          <Link to="/shop" className="btn-gold no-underline text-sm">View All Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
              <Link to={`/product/${p.slug || p.id}`} className="block product-card no-underline group">
                <div className="aspect-square overflow-hidden relative">
                  <img src={p.images?.[0] || p.image || '/placeholder.svg'} alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  {p.compareAtPrice > p.price && (
                    <span className="absolute top-2 left-2 badge badge-green text-[9px]">
                      {Math.round((1 - p.price / p.compareAtPrice) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-text line-clamp-1">{p.name}</h3>
                  <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{p.shortDescription || p.materials || 'Handcrafted'}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-sm font-bold text-gold">₹{p.price?.toLocaleString()}</span>
                    {p.compareAtPrice > p.price && (
                      <span className="text-[11px] text-text-dim line-through">₹{p.compareAtPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    {(p.stock || 0) > 0 ? (
                      <span className="badge badge-green text-[9px]">In Stock</span>
                    ) : (
                      <span className="badge badge-red text-[9px]">Out of Stock</span>
                    )}
                    {p.brand && <span className="text-[10px] text-text-dim">{p.brand}</span>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
