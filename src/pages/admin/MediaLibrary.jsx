import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMedia, uploadMedia, deleteMedia, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Upload, Trash2, Image, Search, X, Loader, Grid, List, Copy } from 'lucide-react'

export default function MediaLibrary() {
  const { user } = useAuth()
  const [media, setMedia] = useState([])
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [view, setView] = useState('grid')
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  async function load() { setMedia(await getMedia()) }

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'ml_default')
        const res = await fetch(`https://api.cloudinary.com/v1_1/ddek8a4ti/image/upload`, { method: 'POST', body: formData })
        const data = await res.json()
        if (data.secure_url) {
          await uploadMedia({ url: data.secure_url, name: file.name, size: file.size, type: file.type, folder: '' })
        }
      }
      await logAudit({ userId: user.uid, action: 'upload_media', entityType: 'media', newValue: { count: files.length } })
      toast.success(`Uploaded ${files.length} files`)
      load()
    } catch (err) { toast.error('Upload failed') }
    setUploading(false)
    e.target.value = ''
  }

  async function handleDelete(id) {
    if (!confirm('Delete this media?')) return
    await deleteMedia(id)
    toast.success('Deleted')
    load()
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url)
    toast.success('URL copied!')
  }

  const filtered = media.filter(m => !search || m.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Media Library</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="p-2 glass rounded-lg hover:bg-gold-dim" aria-label="Toggle view">
            {view === 'grid' ? <List size={14} className="text-text-muted" /> : <Grid size={14} className="text-text-muted" />}
          </button>
          <label className="btn-gold text-xs flex items-center gap-1 cursor-pointer">
            <Upload size={14} /> Upload
            <input type="file" multiple accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="glass rounded-xl p-4 mb-4 flex items-center gap-2">
          <Loader size={14} className="animate-spin text-gold" />
          <span className="text-xs text-text-muted">Uploading...</span>
        </div>
      )}

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search media..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {filtered.map(m => (
            <motion.div key={m.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`glass rounded-lg overflow-hidden cursor-pointer group relative ${selected === m.id ? 'ring-2 ring-gold' : ''}`}
              onClick={() => setSelected(selected === m.id ? null : m.id)}>
              <img src={m.url} alt={m.name} className="w-full aspect-square object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={e => { e.stopPropagation(); copyUrl(m.url) }} className="p-1.5 bg-black/50 rounded-lg hover:bg-gold-dim" aria-label="Copy URL">
                  <Copy size={12} className="text-white" />
                </button>
                <button onClick={e => { e.stopPropagation(); handleDelete(m.id) }} className="p-1.5 bg-black/50 rounded-lg hover:bg-red-500/30" aria-label="Delete">
                  <Trash2 size={12} className="text-white" />
                </button>
              </div>
              <div className="p-1.5">
                <p className="text-[9px] text-text-muted truncate">{m.name}</p>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <Image size={32} className="text-text-dim mx-auto mb-2" />
              <p className="text-xs text-text-dim">No media uploaded yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Preview</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Name</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Size</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Date</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 px-3"><img src={m.url} alt="" className="w-10 h-10 rounded-lg object-cover" /></td>
                  <td className="py-2 px-3 text-[11px] text-text">{m.name}</td>
                  <td className="py-2 px-3 text-[10px] text-text-dim">{m.size ? `${(m.size / 1024).toFixed(1)} KB` : '—'}</td>
                  <td className="py-2 px-3 text-[10px] text-text-dim">{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => copyUrl(m.url)} className="p-1.5 glass rounded-lg hover:bg-gold-dim" aria-label="Copy URL">
                        <Copy size={12} className="text-gold" />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10" aria-label="Delete">
                        <Trash2 size={12} className="text-accent-red" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
