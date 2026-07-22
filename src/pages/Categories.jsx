import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Edit } from 'lucide-react'

export default function Categories() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, 'categories'))
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [])

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-10">
        <h1 className="text-3xl font-bold gold-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Categories
        </h1>
        <p className="text-text-muted text-sm">Browse by category</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={`/shop/${c.id}`} className="block glass glass-hover rounded-2xl overflow-hidden no-underline group relative">
              <div className="aspect-[4/3] overflow-hidden bg-dark">
                <img src={c.image || '/placeholder.jpg'} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-text">{c.name}</h3>
                <p className="text-sm text-text-muted mt-1">{c.description || 'Explore collection'}</p>
              </div>
              {isAdmin && (
                <div className="absolute top-3 right-3 p-2 glass rounded-lg hover:bg-gold-dim transition-colors">
                  <Edit size={14} className="text-gold" />
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
