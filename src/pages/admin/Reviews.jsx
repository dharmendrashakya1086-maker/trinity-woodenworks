import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getReviews, updateReview, deleteReview, getEntities, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Star, Trash2, Search, Eye, CheckCircle, XCircle } from 'lucide-react'

export default function Reviews() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    const [r, p] = await Promise.all([getReviews(), getEntities('products')])
    setReviews(r); setProducts(p)
  }

  function getProductName(productId) {
    return products.find(p => p.id === productId)?.name || productId?.slice(0, 8)
  }

  async function moderateReview(id, status) {
    await updateReview(id, { status })
    await logAudit({ userId: user.uid, action: `review_${status}`, entityType: 'reviews', entityId: id })
    toast.success(`Review ${status}`)
    load()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this review?')) return
    await deleteReview(id); toast.success('Deleted'); load()
  }

  const filtered = reviews.filter(r => {
    const matchSearch = !search || r.userName?.toLowerCase().includes(search.toLowerCase()) || r.comment?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || r.status === filter || (filter === 'pending' && !r.status)
    return matchSearch && matchFilter
  })

  return (
    <div>
      <h1 className="text-xl font-bold gold-text mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Reviews</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
          <input placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
        </div>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all bg-transparent cursor-pointer capitalize
              ${filter === f ? 'border-gold bg-gold-dim text-gold' : 'border-white/[0.08] text-text-muted hover:border-gold/30'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(r => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-text">{r.userName || 'Anonymous'}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={10} className={s <= (r.rating || 0) ? 'text-gold fill-gold' : 'text-text-dim'} />
                    ))}
                  </div>
                  <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'rejected' ? 'badge-red' : 'badge-gold'} text-[8px]`}>
                    {r.status || 'pending'}
                  </span>
                </div>
                <p className="text-[10px] text-text-dim">{getProductName(r.productId)} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</p>
              </div>
            </div>
            {r.comment && <p className="text-[11px] text-text-muted mb-3">{r.comment}</p>}
            <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
              {r.status !== 'approved' && (
                <button onClick={() => moderateReview(r.id, 'approved')} className="flex-1 p-1.5 glass rounded-lg hover:bg-accent-green/10 text-[10px] text-accent-green flex items-center justify-center gap-1">
                  <CheckCircle size={10} /> Approve
                </button>
              )}
              {r.status !== 'rejected' && (
                <button onClick={() => moderateReview(r.id, 'rejected')} className="flex-1 p-1.5 glass rounded-lg hover:bg-accent-red/10 text-[10px] text-accent-red flex items-center justify-center gap-1">
                  <XCircle size={10} /> Reject
                </button>
              )}
              <button onClick={() => handleDelete(r.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10" aria-label="Delete">
                <Trash2 size={10} className="text-accent-red" />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-text-dim text-xs py-8 text-center">No reviews found</p>}
      </div>
    </div>
  )
}
