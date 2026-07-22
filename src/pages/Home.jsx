import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import { ArrowRight, Truck, Shield, HeartHandshake, Star } from 'lucide-react'

const features = [
  { icon: Truck, title: 'Pan-India Delivery', desc: 'Free shipping on orders above ₹5,000' },
  { icon: Shield, title: '2-Year Warranty', desc: 'On all wooden furniture products' },
  { icon: HeartHandshake, title: 'Custom Orders', desc: 'Your vision, our craftsmanship' },
  { icon: Star, title: 'Premium Quality', desc: 'Hand-selected sustainable wood' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
}

export default function Home() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, 'products'), limit(6)))
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [])

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl mx-auto px-4"
        >
          <h1 className="text-4xl sm:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="gold-text">Handcrafted</span> Wooden Art
          </h1>
          <p className="text-text-muted text-lg mb-8 max-w-xl mx-auto">
            Premium wooden furniture and home décor, crafted with precision and care in Varanasi, India.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="btn-gold no-underline inline-flex items-center gap-2">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/custom-order" className="btn-outline no-underline">
              Custom Order
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="section-padding max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              className="glass glass-hover rounded-2xl p-6 text-center"
            >
              <f.icon className="mx-auto mb-3 text-gold" size={28} />
              <h3 className="text-sm font-semibold text-text mb-1">{f.title}</h3>
              <p className="text-xs text-text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="section-padding max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold gold-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Featured Products
            </h2>
            <p className="text-text-muted text-sm">Our most loved handcrafted pieces</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
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

          <div className="text-center mt-8">
            <Link to="/shop" className="btn-outline no-underline inline-flex items-center gap-2">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-10 sm:p-14"
        >
          <h2 className="text-3xl font-bold gold-text mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Your Vision, Our Craft
          </h2>
          <p className="text-text-muted mb-6 max-w-md mx-auto">
            Have a custom furniture idea? We bring your ideas to life with handcrafted precision.
          </p>
          <Link to="/custom-order" className="btn-gold no-underline inline-flex items-center gap-2">
            Start Custom Order <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}
