import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Edit } from 'lucide-react'
import { SEO } from '../components/ui/SEO'

export default function Categories() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, 'categories'))
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)))
    }
    load()
  }, [])

  return (
    <div className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      <SEO title="Categories" description="Browse our handcrafted wooden furniture categories. Beds, sofas, dining tables, chairs, wardrobes, and more." url="/categories" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gold-text mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Categories</h1>
        <p className="text-text-muted text-sm">Browse our handcrafted collections</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.filter(c => c.visibility !== false).map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
            <Link to={`/shop/${c.id}`} className="block product-card no-underline group relative">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={c.image || '/placeholder.svg'} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-3 text-center">
                <h3 className="text-sm font-semibold text-text">{c.name}</h3>
                <p className="text-[11px] text-text-muted mt-0.5">{c.description || 'Explore collection'}</p>
              </div>
              {isAdmin && (
                <div className="absolute top-2 right-2 p-1.5 glass rounded-lg hover:bg-gold-dim transition-all">
                  <Edit size={12} className="text-gold" />
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
