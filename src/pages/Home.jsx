import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import { ArrowRight, Truck, Shield, HeartHandshake, Star, ChevronRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] } }),
}

const features = [
  { icon: Truck, title: 'Pan-India Delivery', desc: 'Free shipping on orders above ₹5,000' },
  { icon: Shield, title: '2-Year Warranty', desc: 'On all wooden furniture products' },
  { icon: HeartHandshake, title: 'Custom Orders', desc: 'Your vision, our craftsmanship' },
  { icon: Star, title: 'Premium Quality', desc: 'Hand-selected sustainable wood' },
]

const heroSlides = [
  {
    tagline: 'New Collection',
    title1: 'Handcrafted',
    title2: 'Wooden Art',
    desc: 'Premium wooden furniture and home décor, crafted with precision in Varanasi, India.',
    bg: 'from-gold/[0.04] to-transparent',
    accent: 'gold',
  },
  {
    tagline: 'Custom Orders',
    title1: 'Your Vision,',
    title2: 'Our Craft',
    desc: 'Have a custom furniture idea? We bring your ideas to life with handcrafted precision.',
    bg: 'from-accent-blue/[0.04] to-transparent',
    accent: 'blue',
  },
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [heroIdx, setHeroIdx] = useState(0)

  useEffect(() => {
    async function load() {
      const [prodSnap, catSnap] = await Promise.all([
        getDocs(query(collection(db, 'products'), limit(8))),
        getDocs(collection(db, 'categories')),
      ])
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % heroSlides.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const hero = heroSlides[heroIdx]

  return (
    <div className="pt-16">
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-blue/[0.02] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <motion.div
              key={heroIdx}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="badge badge-gold mb-4 inline-block">{hero.tagline}</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                {hero.title1} <br />
                <span className="gold-text">{hero.title2}</span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
                {hero.desc}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/shop" className="btn-gold no-underline inline-flex items-center gap-2">
                  Shop Now <ArrowRight size={16} />
                </Link>
                <Link to="/custom-order" className="btn-outline no-underline">
                  Custom Order
                </Link>
              </div>

              {/* Hero dots */}
              <div className="flex gap-2 mt-8">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIdx(i)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      i === heroIdx ? 'w-8 bg-gold' : 'w-1.5 bg-white/10 hover:bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              key={`visual-${heroIdx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-gold/[0.05] border border-gold/10 flex items-center justify-center" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}>
                  <div className="w-60 h-60 rounded-full bg-gold/[0.08] border border-gold/10 flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full bg-gold/[0.12] border border-gold/15 flex items-center justify-center">
                      <span className="text-5xl gold-text" style={{ fontFamily: 'var(--font-heading)' }}>T</span>
                    </div>
                  </div>
                </div>
                {/* Floating particles */}
                <div className="absolute top-8 right-0 w-2 h-2 bg-gold/30 rounded-full" style={{ animation: 'float 3s ease-in-out infinite' }} />
                <div className="absolute bottom-12 left-4 w-1.5 h-1.5 bg-gold/20 rounded-full" style={{ animation: 'float 4s ease-in-out infinite 1s' }} />
                <div className="absolute top-1/2 -right-8 w-1 h-1 bg-accent-blue/30 rounded-full" style={{ animation: 'float 3.5s ease-in-out infinite 0.5s' }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-padding max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="glass glass-hover rounded-2xl p-5 sm:p-6 text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gold-dim border border-gold/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <f.icon className="text-gold" size={20} />
              </div>
              <h3 className="text-[13px] font-semibold text-text mb-1">{f.title}</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto">
          <div className="section-title">
            <h2 className="gold-text">Browse Categories</h2>
            <p className="text-text-muted">Find what you're looking for</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((c, i) => (
              <motion.div
                key={c.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <Link to={`/shop/${c.id}`} className="block glass glass-hover rounded-2xl overflow-hidden no-underline group text-center">
                  <div className="aspect-[4/3] overflow-hidden bg-white/[0.02]">
                    <img src={c.image || '/placeholder.svg'} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-[13px] font-semibold text-text">{c.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {products.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto">
          <div className="section-title">
            <h2 className="gold-text">Featured Products</h2>
            <p className="text-text-muted">Our most loved handcrafted pieces</p>
          </div>

          <div className="products-grid">
            {products.map((p, i) => (
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
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/shop" className="btn-outline no-underline inline-flex items-center gap-2">
              View All Products <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="section-padding max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-gold/[0.03] via-transparent to-gold/[0.03] pointer-events-none" />
          <div className="relative z-10">
            <span className="badge badge-gold mb-4 inline-block">Custom Orders</span>
            <h2 className="text-2xl sm:text-3xl font-bold gold-text mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Your Vision, Our Craft
            </h2>
            <p className="text-text-muted text-sm mb-6 max-w-md mx-auto">
              Have a custom furniture idea? Tell us what you need and we'll make it happen with handcrafted precision.
            </p>
            <Link to="/custom-order" className="btn-gold no-underline inline-flex items-center gap-2">
              Start Custom Order <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
