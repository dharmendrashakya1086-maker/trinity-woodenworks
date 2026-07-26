import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { Search, X, Clock, TrendingUp, ArrowRight } from 'lucide-react'

const RECENT_KEY = 'trinity_recent_searches'
const MAX_RECENT = 5

function getRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}

function saveRecent(term) {
  const recent = getRecent().filter(t => t !== term).slice(0, MAX_RECENT)
  recent.unshift(term)
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent))
}

export default function SearchOverlay({ open, onClose }) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState({ products: [], categories: [], collections: [] })
  const [recent, setRecent] = useState(getRecent())
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const timerRef = useRef(null)

  useEffect(() => {
    if (open) {
      setRecent(getRecent())
      setSearch('')
      setResults({ products: [], categories: [], collections: [] })
      setSelectedIndex(-1)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!search.trim()) {
      setResults({ products: [], categories: [], collections: [] })
      return
    }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(search.trim()), 250)
    return () => clearTimeout(timerRef.current)
  }, [search])

  async function doSearch(term) {
    setLoading(true)
    const q = term.toLowerCase()

    const [prodSnap, catSnap, colSnap] = await Promise.all([
      getDocs(query(collection(db, 'products'), limit(20))),
      getDocs(query(collection(db, 'categories'), limit(20))),
      getDocs(query(collection(db, 'collections'), limit(10))),
    ])

    const products = prodSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.materials?.toLowerCase().includes(q))
      .slice(0, 6)

    const categories = catSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
      .slice(0, 3)

    const collections = colSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
      .slice(0, 3)

    setResults({ products, categories, collections })
    setLoading(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (selectedIndex >= 0) {
      handleSelectFlattened(selectedIndex)
      return
    }
    if (!search.trim()) return
    saveRecent(search.trim())
    navigate(`/shop?search=${encodeURIComponent(search.trim())}`)
    onClose()
  }

  const flatResults = [
    ...results.products.map(p => ({ type: 'product', ...p })),
    ...results.categories.map(c => ({ type: 'category', ...c })),
    ...results.collections.map(c => ({ type: 'collection', ...c })),
  ]

  function handleSelectFlattened(idx) {
    const item = flatResults[idx]
    if (!item) return
    saveRecent(search.trim())
    if (item.type === 'product') navigate(`/product/${item.slug || item.id}`)
    else if (item.type === 'category') navigate(`/shop/${item.id}`)
    else if (item.type === 'collection') navigate(`/shop/collection/${item.id}`)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  function handleRecentClick(term) {
    setSearch(term)
  }

  const popular = ['Dining Table', 'Sheesham', 'Bed', 'Sofa', 'Coffee Table']

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
          className="max-w-2xl mx-auto mt-16 px-4" onClick={e => e.stopPropagation()}>
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Search products, categories, collections..."
              aria-label="Search products, categories, collections"
              className="w-full glass rounded-xl pl-12 pr-10 py-4 text-sm text-text bg-transparent border border-white/[0.08] focus:border-gold/40 outline-none transition-colors" />
            <button type="button" onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/[0.05] bg-transparent border-none cursor-pointer">
              <X size={16} className="text-text-dim" />
            </button>
          </form>

          {/* Results or suggestions */}
          <div className="mt-2 glass rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="py-6 text-center">
                <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {!loading && !search.trim() && (
              <div className="p-4 space-y-4">
                {recent.length > 0 && (
                  <div>
                    <p className="text-[10px] text-text-dim mb-2 font-medium flex items-center gap-1"><Clock size={10} /> Recent</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recent.map(t => (
                        <button key={t} onClick={() => handleRecentClick(t)}
                          className="badge bg-white/[0.04] text-text-muted text-[10px] hover:bg-gold-dim cursor-pointer border-none">
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-text-dim mb-2 font-medium flex items-center gap-1"><TrendingUp size={10} /> Popular</p>
                  <div className="flex flex-wrap gap-1.5">
                    {popular.map(t => (
                      <button key={t} onClick={() => handleRecentClick(t)}
                        className="badge bg-white/[0.04] text-text-muted text-[10px] hover:bg-gold-dim cursor-pointer border-none">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && search.trim() && flatResults.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-text-muted text-sm">No results for "{search}"</p>
                <p className="text-text-dim text-xs mt-1">Try different keywords</p>
              </div>
            )}

            {!loading && flatResults.length > 0 && (
              <div className="p-2">
                {results.products.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-text-dim px-2 mb-1 font-medium">Products</p>
                    {results.products.map((p, i) => {
                      const flatIdx = i
                      return (
                        <button key={p.id} onClick={() => handleSelectFlattened(flatIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all border-none cursor-pointer
                            ${flatIdx === selectedIndex ? 'bg-gold-dim' : 'hover:bg-white/[0.03] bg-transparent'}`}>
                          <img src={p.images?.[0] || '/placeholder.svg'} alt="" className="w-9 h-9 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text font-medium truncate">{p.name}</p>
                            <p className="text-[10px] text-gold">₹{p.price?.toLocaleString()}</p>
                          </div>
                          <ArrowRight size={12} className="text-text-dim" />
                        </button>
                      )
                    })}
                  </div>
                )}

                {results.categories.length > 0 && (
                  <div className="mb-2">
                    <p className="text-[10px] text-text-dim px-2 mb-1 font-medium">Categories</p>
                    {results.categories.map((c, i) => {
                      const flatIdx = results.products.length + i
                      return (
                        <button key={c.id} onClick={() => handleSelectFlattened(flatIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all border-none cursor-pointer
                            ${flatIdx === selectedIndex ? 'bg-gold-dim' : 'hover:bg-white/[0.03] bg-transparent'}`}>
                          {c.image && <img src={c.image} alt="" className="w-9 h-9 rounded object-cover" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text font-medium">{c.name}</p>
                            <p className="text-[10px] text-text-dim">{c.description?.slice(0, 50)}</p>
                          </div>
                          <ArrowRight size={12} className="text-text-dim" />
                        </button>
                      )
                    })}
                  </div>
                )}

                {results.collections.length > 0 && (
                  <div>
                    <p className="text-[10px] text-text-dim px-2 mb-1 font-medium">Collections</p>
                    {results.collections.map((c, i) => {
                      const flatIdx = results.products.length + results.categories.length + i
                      return (
                        <button key={c.id} onClick={() => handleSelectFlattened(flatIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all border-none cursor-pointer
                            ${flatIdx === selectedIndex ? 'bg-gold-dim' : 'hover:bg-white/[0.03] bg-transparent'}`}>
                          {c.image && <img src={c.image} alt="" className="w-9 h-9 rounded object-cover" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-text font-medium">{c.name}</p>
                            <p className="text-[10px] text-text-dim">{(c.productIds || []).length} products</p>
                          </div>
                          <ArrowRight size={12} className="text-text-dim" />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
