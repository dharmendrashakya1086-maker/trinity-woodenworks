import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Command, Package, ShoppingCart, Users, Warehouse, Tag, Megaphone, BarChart3, Settings, Factory, Mail, Bell, Image } from 'lucide-react'

const commands = [
  { label: 'Dashboard', path: '/admin', icon: Command },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', path: '/admin/customers', icon: Users },
  { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
  { label: 'Manufacturing', path: '/admin/manufacturing', icon: Factory },
  { label: 'Coupons', path: '/admin/coupons', icon: Tag },
  { label: 'Marketing', path: '/admin/marketing', icon: Megaphone },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { label: 'Media Library', path: '/admin/media', icon: Image },
  { label: 'Brands', path: '/admin/brands', icon: Tag },
  { label: 'Tags', path: '/admin/tags', icon: Tag },
  { label: 'Reviews', path: '/admin/reviews', icon: Mail },
  { label: 'Contact Messages', path: '/admin/messages', icon: Mail },
  { label: 'Newsletter', path: '/admin/newsletter', icon: Mail },
  { label: 'Audit Log', path: '/admin/audit', icon: Bell },
  { label: 'Attributes', path: '/admin/attributes', icon: Package },
]

export default function CommandPalette({ open, onClose }) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) { setSearch(''); setSelectedIndex(0); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open ? onClose() : null }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => { setSelectedIndex(0) }, [search])

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && filtered[selectedIndex]) { navigate(filtered[selectedIndex].path); onClose() }
    else if (e.key === 'Escape') { onClose() }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-start justify-center z-[100] pt-[20vh]" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="glass rounded-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <Search size={16} className="text-text-dim" />
            <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-sm text-text placeholder:text-text-dim"
              placeholder="Type a command or search..." />
            <kbd className="text-[9px] text-text-dim bg-white/[0.04] px-1.5 py-0.5 rounded">ESC</kbd>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filtered.map((c, i) => {
              const Icon = c.icon
              return (
                <button key={c.path} onClick={() => { navigate(c.path); onClose() }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all bg-transparent border-none cursor-pointer
                    ${i === selectedIndex ? 'bg-gold-dim text-gold' : 'text-text-muted hover:bg-white/[0.03] hover:text-text'}`}>
                  <Icon size={14} />
                  <span className="text-xs font-medium">{c.label}</span>
                </button>
              )
            })}
            {filtered.length === 0 && <p className="text-text-dim text-xs py-4 text-center">No matching commands</p>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
