import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Bell, BellOff, CheckCheck, Package, ShoppingCart, AlertTriangle, User } from 'lucide-react'

const typeIcons = { order: ShoppingCart, inventory: AlertTriangle, customer: User, system: Package }

export default function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => { load() }, [])

  async function load() { setNotifications(await getNotifications()) }

  async function markRead(id) {
    await markNotificationRead(id)
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    await markAllNotificationsRead()
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    toast.success('All marked as read')
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Notifications</h1>
        <div className="flex items-center gap-2">
          {unread > 0 && <span className="badge badge-gold text-[10px]">{unread} unread</span>}
          {unread > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-[10px] flex items-center gap-1">
              <CheckCheck size={12} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <Bell size={32} className="text-text-dim mx-auto mb-2" />
          <p className="text-xs text-text-dim">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = typeIcons[n.type] || Bell
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`glass rounded-xl p-4 cursor-pointer transition-all ${!n.read ? 'border-l-2 border-l-gold' : ''}`}
                onClick={() => markRead(n.id)}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-gold-dim' : 'bg-white/[0.04]'}`}>
                    <Icon size={14} className={!n.read ? 'text-gold' : 'text-text-dim'} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text">{n.title || n.message}</p>
                    {n.message && n.title && <p className="text-[10px] text-text-muted mt-0.5">{n.message}</p>}
                    <p className="text-[9px] text-text-dim mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1" />}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
