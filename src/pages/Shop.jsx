import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Search } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
}

export default function Shop() {
  const { category } = useParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(category || 'all')

  useEffect(() => {
    async function load() {
      const catSnap = await getDocs(collection(db, 'categories'))
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))

      let q = collection(db, 'products')
      if (category && category !== 'all') {
        q = query(q, where('category', '==', category))
      }
      const prodSnap = await getDocs(q)
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [category])

  useEffect(() => {
    setActiveCategory(category || 'all')
  }, [category])

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-3xl font-bold gold-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Products'}
        </h1>
        <p className="text-text-muted text-sm">Browse our handcrafted collection</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            to="/shop"
            className={`px-4 py-2 rounded-lg text-sm no-underline whitespace-nowrap transition-all ${
              activeCategory === 'all' ? 'bg-gold-dim text-gold border border-gold' : 'glass text-text-muted hover:text-text'
            }`}
          >
            All
          </Link>
          {categories.map(c => (
            <Link
              key={c.id}
              to={`/shop/${c.id}`}
              className={`px-4 py-2 rounded-lg text-sm no-underline whitespace-nowrap transition-all ${
                activeCategory === c.id ? 'bg-gold-dim text-gold border border-gold' : 'glass text-text-muted hover:text-text'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
            >
              <Link to={`/product/${p.id}`} className="block glass glass-hover rounded-2xl overflow-hidden no-underline group">
                <div className="aspect-square overflow-hidden bg-dark">
                  <img
                    src={p.image || '/placeholder.jpg'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-text mb-1">{p.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gold font-bold">₹{p.price?.toLocaleString()}</span>
                    {p.mrp && p.mrp > p.price && (
                      <span className="text-xs text-text-muted line-through">₹{p.mrp.toLocaleString()}</span>
                    )}
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
