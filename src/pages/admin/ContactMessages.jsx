import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getContactMessages, markMessageRead, deleteMessage, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Search, Trash2, Mail, MailOpen, User, Phone, MessageSquare } from 'lucide-react'

export default function ContactMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  async function load() { setMessages(await getContactMessages()) }

  async function markRead(id) {
    await markMessageRead(id)
    setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m))
  }

  async function handleDelete(id) {
    if (!confirm('Delete this message?')) return
    await deleteMessage(id); toast.success('Deleted'); load()
  }

  const filtered = messages.filter(m => {
    const matchSearch = !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()) || m.message?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  const unread = messages.filter(m => !m.read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Contact Messages</h1>
        {unread > 0 && <span className="badge badge-gold text-[10px]">{unread} unread</span>}
      </div>

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
      </div>

      <div className="space-y-2">
        {filtered.map(m => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl p-4 cursor-pointer transition-all ${!m.read ? 'border-l-2 border-l-gold' : ''}`}
            onClick={() => { setSelected(m); markRead(m.id) }}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User size={12} className="text-text-dim" />
                  <span className="text-xs font-semibold text-text">{m.name || 'Unknown'}</span>
                  {!m.read && <span className="w-2 h-2 rounded-full bg-gold" />}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-text-dim mb-2">
                  <span className="flex items-center gap-1"><Mail size={10} /> {m.email || '—'}</span>
                  {m.phone && <span className="flex items-center gap-1"><Phone size={10} /> {m.phone}</span>}
                </div>
                <p className="text-[11px] text-text-muted line-clamp-2">{m.message}</p>
                <p className="text-[9px] text-text-dim mt-1">{m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(m.id) }}
                className="p-1.5 glass rounded-lg hover:bg-red-500/10 flex-shrink-0" aria-label="Delete">
                <Trash2 size={12} className="text-accent-red" />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-text-dim text-xs py-8 text-center">No messages</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-5 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-dim flex items-center justify-center">
                <User size={16} className="text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">{selected.name}</h3>
                <p className="text-[10px] text-text-muted">{selected.email}</p>
              </div>
            </div>
            {selected.phone && <p className="text-[11px] text-text-muted mb-2"><Phone size={10} className="inline mr-1" />{selected.phone}</p>}
            <div className="bg-white/[0.02] rounded-lg p-3 mb-3">
              <p className="text-xs text-text whitespace-pre-wrap">{selected.message}</p>
            </div>
            <p className="text-[9px] text-text-dim">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}</p>
          </motion.div>
        </div>
      )}
    </div>
  )
}
