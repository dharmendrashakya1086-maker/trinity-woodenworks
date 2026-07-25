import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.5 } }),
}

export default function Shop() {
  const { category } = useParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(category || 'all')
  const [priceRange, setPriceRange] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      const [catSnap, prodSnap] = await Promise.all([
        getDocs(collection(db, 'categories')),
        category && category !== 'all'
          ? getDocs(query(collection(db, 'products'), where('category', '==', category)))
          : getDocs(collection(db, 'products')),
      ])
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [category])

  useEffect(() => { setActiveCategory(category || 'all') }, [category])

  let filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
  if (priceRange) filtered = filtered.filter(p => p.price <= priceRange)

  return (
    <div className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold gold-text mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          {categories.find(c => c.id === activeCategory)?.name || 'All Products'}
        </h1>
        <p className="text-text-muted text-sm">{filtered.length} products found</p>
      </motion.div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text bg-transparent">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 glass rounded-lg text-sm text-text-muted hover:text-gold transition-all"
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => { setActiveCategory('all'); window.history.pushState({}, '', '/shop') }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === 'all' ? 'bg-gold text-dark' : 'bg-white/[0.03] text-text-muted hover:text-text'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <Link
                key={c.id}
                to={`/shop/${c.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all no-underline ${
                  activeCategory === c.id ? 'bg-gold text-dark' : 'bg-white/[0.03] text-text-muted hover:text-text'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="flex gap-2">
            {[null, 2000, 5000, 10000, 25000].map((price, i) => (
              <button
                key={i}
                onClick={() => setPriceRange(price)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  priceRange === price ? 'bg-gold text-dark' : 'bg-white/[0.03] text-text-muted hover:text-text'
                }`}
              >
                {price ? `Under ₹${price.toLocaleString()}` : 'All Prices'}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted text-sm mb-4">No products found</p>
          <button onClick={() => { setSearch(''); setPriceRange(null) }} className="btn-outline text-xs">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
            >
              <Link to={`/product/${p.id}`} className="block product-card no-underline group">
                <div className="overflow-hidden">
                  <img src={p.image || '/placeholder.svg'} alt={p.name} className="card-img" />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{p.name}</h3>
                  <div className="flex items-center">
                    <span className="card-price">₹{p.price?.toLocaleString()}</span>
                    {p.mrp > p.price && <span className="card-mrp">₹{p.mrp.toLocaleString()}</span>}
                  </div>
                  <button className="card-btn mt-2">Add to Cart</button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
