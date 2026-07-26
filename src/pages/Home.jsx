import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import { ShoppingCart, ArrowRight, Sparkles, Star, Truck } from 'lucide-react'
import CategoryRibbon from '../components/ui/CategoryRibbon'

const heroSlides = [
  { title: 'Crafted with Soul', subtitle: 'Handmade wooden furniture from Varanasi', accent: 'Since 1985' },
  { title: 'Timeless Design', subtitle: 'Every piece tells a story of tradition', accent: 'Solid Wood' },
  { title: 'Built to Last', subtitle: 'Generations of craftsmanship in every joint', accent: 'Premium Quality' },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [collectionProducts, setCollectionProducts] = useState({})
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    async function load() {
      const [prodSnap, catSnap, colSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), limit(8))),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'collections')),
      ])
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      const cols = colSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.visibility !== false)
      setCollections(cols.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).slice(0, 3))

      // Load products for first visible collection
      if (cols.length > 0 && cols[0].productIds?.length) {
        const pIds = cols[0].productIds.slice(0, 4)
        const pDocs = await Promise.all(pIds.map(pid => getDoc(doc(db, 'products', pid)).catch(() => null)))
        setCollectionProducts({ [cols[0].id]: pDocs.filter(d => d?.exists()).map(d => ({ id: d.id, ...d.data() })) })
      }
    }
    load()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(s => (s + 1) % heroSlides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = heroSlides[currentSlide]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-alt to-primary" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,var(--gold-dim)_0%,transparent_50%)]" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-gold/30"
            animate={{ y: [-20, 20], x: [-10, 10], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
            style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 20}%` }} />
        ))}

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.div key={currentSlide} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
            <span className="badge badge-gold mb-4 inline-block">{slide.accent}</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gold-text mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              {slide.title}
            </h1>
            <p className="text-text-muted text-base sm:text-lg mb-8">{slide.subtitle}</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/shop" className="btn-gold no-underline inline-flex items-center gap-2">
                <ShoppingCart size={16} /> Shop Now
              </Link>
              <Link to="/categories" className="glass px-5 py-2.5 rounded-lg text-sm text-text hover:text-gold no-underline transition-colors">
                Browse Categories
              </Link>
            </div>
          </motion.div>

          {/* Slide indicators */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-gold w-6' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-white/[0.06] bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center gap-8 sm:gap-16 text-text-muted text-xs">
          {[
            { icon: Truck, text: 'Free Delivery' },
            { icon: Star, text: '2-Year Warranty' },
            { icon: Sparkles, text: 'Handcrafted' },
          ].map(b => (
            <div key={b.text} className="flex items-center gap-2">
              <b.icon size={14} className="text-gold" />
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Category Ribbon */}
      {categories.length > 3 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <CategoryRibbon categories={categories.filter(c => c.visibility !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))} />
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Categories</h2>
            <Link to="/categories" className="text-xs text-gold hover:underline no-underline inline-flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.slice(0, 5).map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/shop/${c.id}`} className="block product-card no-underline group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={c.image || '/placeholder.svg'} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="text-sm font-semibold text-text">{c.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Shop by Collection</h2>
            <Link to="/shop" className="text-xs text-gold hover:underline no-underline inline-flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {collections.map((col, i) => (
              <motion.div key={col.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Link to={`/shop/collection/${col.id}`} className="block product-card no-underline group">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={col.image || '/placeholder.svg'} alt={col.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text">{col.name}</h3>
                    {col.description && <p className="text-[11px] text-text-muted mt-1 line-clamp-2">{col.description}</p>}
                    <span className="text-[11px] text-gold mt-2 inline-flex items-center gap-1">
                      Browse Collection <ArrowRight size={10} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Collections</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {collections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).slice(0, 3).map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/shop/collection/${c.id}`} className="block product-card no-underline group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={c.image || '/placeholder.svg'} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="text-sm font-semibold text-text">{c.name}</h3>
                    {c.description && <p className="text-[11px] text-text-muted mt-0.5">{c.description}</p>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Featured Products</h2>
            <Link to="/shop" className="text-xs text-gold hover:underline no-underline inline-flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link to={`/product/${p.slug || p.id}`} className="block product-card no-underline group">
                  <div className="aspect-square overflow-hidden">
                    <img src={p.images?.[0] || p.image || '/placeholder.svg'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
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
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding max-w-4xl mx-auto text-center">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold gold-text mb-3" style={{ fontFamily: 'var(--font-heading)' }}>Custom Orders Welcome</h2>
          <p className="text-text-muted text-sm mb-5 max-w-md mx-auto">Have a vision? We bring it to life. Discuss your project with our craftsman.</p>
          <Link to="/custom-order" className="btn-gold no-underline text-sm inline-flex items-center gap-2">
            Start Custom Order <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  )
}
