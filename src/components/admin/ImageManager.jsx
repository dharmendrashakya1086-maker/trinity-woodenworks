import { useState, useRef } from 'react'
import {
  Upload, X, GripVertical, Eye, Trash2, ChevronDown, ChevronUp,
  Sparkles, Maximize, Copy, Check, RotateCcw, Loader, Image as ImageIcon
} from 'lucide-react'
import { BG_OPTIONS, extractPublicId, hdUpscaledUrl, optimizedUrl, thumbnailUrl } from '../../lib/cloudinary'

export default function ImageManager({ images = [], onChange, productId }) {
  const [expandedImage, setExpandedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [processing, setProcessing] = useState(null)
  const [activeVersions, setActiveVersions] = useState({})
  const widgetRef = useRef(null)

  function openUpload() {
    if (!window.cloudinary) {
      const script = document.createElement('script')
      script.src = 'https://widget.cloudinary.com/v2.0/upload/widget.js'
      script.onload = () => openWidget()
      document.head.appendChild(script)
    } else {
      openWidget()
    }
  }

  function openWidget() {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'trinity_unsigned',
        folder: `trinity-products/${productId || 'general'}`,
        maxImageFileSize: 10000000,
        sources: ['local', 'camera', 'url'],
        multiple: true,
        maxFiles: 10,
      },
      (error, result) => {
        if (!error && result.event === 'success') {
          const url = result.info.secure_url
          onChange([...images, url])
        }
      }
    )
    widget.open()
  }

  function removeImage(index) {
    onChange(images.filter((_, i) => i !== index))
    if (expandedImage === index) setExpandedImage(null)
  }

  function moveImage(from, to) {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  function setAsPrimary(index) {
    if (index === 0) return
    moveImage(index, 0)
  }

  function duplicateImage(url) {
    onChange([...images, url])
  }

  function applyVersion(imageIndex, versionFn) {
    const url = images[imageIndex]
    const transformed = versionFn(url)
    const next = [...images]
    next[imageIndex] = transformed
    onChange(next)
    setActiveVersions(v => ({ ...v, [imageIndex]: 'processed' }))
  }

  function restoreOriginal(imageIndex) {
    const url = images[imageIndex]
    if (url.includes('_bgremoved') || url.includes('_upscaled')) {
      // Try to find original from Cloudinary public id pattern
      const pid = extractPublicId(url)
      if (pid) {
        // Restore by removing transformations - use base URL
        const basePid = pid.replace(/\/e_bgremove.*$/, '').replace(/\/c_scale.*$/, '').replace(/\/e_upscale.*$/, '')
        // For simplicity, keep original and let admin re-upload if needed
      }
    }
  }

  function getActiveVersion(index) {
    return activeVersions[index] || 'original'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-text-muted font-medium">Product Images ({images.length})</label>
        <button type="button" onClick={openUpload}
          className="text-[11px] text-gold hover:underline inline-flex items-center gap-1 bg-transparent border-none cursor-pointer">
          <Upload size={12} /> Add Images
        </button>
      </div>

      {images.length === 0 && (
        <button type="button" onClick={openUpload}
          className="w-full h-32 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-gold/40 flex flex-col items-center justify-center gap-2 bg-white/[0.02] cursor-pointer transition-all">
          <Upload size={20} className="text-text-dim" />
          <span className="text-[11px] text-text-dim">Click to upload images</span>
          <span className="text-[9px] text-text-dim">JPG, PNG, WebP up to 10MB</span>
        </button>
      )}

      {/* Image List */}
      <div className="space-y-2">
        {images.map((url, idx) => {
          const isExpanded = expandedImage === idx
          return (
            <div key={idx} className="glass rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-2">
                <GripVertical size={12} className="text-text-dim flex-shrink-0 cursor-grab" />

                <button type="button" onClick={() => setExpandedImage(isExpanded ? null : idx)}
                  className="flex items-center gap-2 flex-1 min-w-0 bg-transparent border-none cursor-pointer p-0 text-left">
                  <img src={thumbnailUrl(url, 80)} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[11px] text-text truncate">{url.split('/').pop()}</p>
                    <p className="text-[9px] text-text-dim">{idx === 0 ? 'Primary' : `Image ${idx + 1}`}</p>
                  </div>
                </button>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {idx > 0 && (
                    <button type="button" onClick={() => moveImage(idx, idx - 1)} className="p-1 rounded hover:bg-white/[0.05] bg-transparent border-none cursor-pointer" title="Move left">
                      <ChevronDown size={10} className="text-text-dim rotate-90" />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button type="button" onClick={() => moveImage(idx, idx + 1)} className="p-1 rounded hover:bg-white/[0.05] bg-transparent border-none cursor-pointer" title="Move right">
                      <ChevronUp size={10} className="text-text-dim rotate-90" />
                    </button>
                  )}
                  {idx !== 0 && (
                    <button type="button" onClick={() => setAsPrimary(idx)} className="p-1 rounded hover:bg-gold-dim bg-transparent border-none cursor-pointer" title="Set primary">
                      <ImageIcon size={10} className="text-gold" />
                    </button>
                  )}
                  <button type="button" onClick={() => duplicateImage(url)} className="p-1 rounded hover:bg-white/[0.05] bg-transparent border-none cursor-pointer" title="Duplicate">
                    <Copy size={10} className="text-text-dim" />
                  </button>
                  <button type="button" onClick={() => removeImage(idx)} className="p-1 rounded hover:bg-red-dim bg-transparent border-none cursor-pointer" title="Remove">
                    <Trash2 size={10} className="text-red-400" />
                  </button>
                </div>
              </div>

              {/* Expanded: Image Processing Options */}
              {isExpanded && (
                <div className="p-3 border-t border-white/[0.04] space-y-2">
                  {/* Preview */}
                  <div className="relative rounded-lg overflow-hidden bg-black/30">
                    <img src={url} alt="" className="w-full max-h-48 object-contain" />
                    <button type="button" onClick={() => setPreviewImage(url)}
                      className="absolute top-2 right-2 p-1.5 glass rounded-lg bg-black/50 hover:bg-gold-dim">
                      <Eye size={12} className="text-white" />
                    </button>
                  </div>

                  {/* Background Replacement */}
                  <div>
                    <p className="text-[10px] text-text-dim mb-1.5 font-medium">Background & Processing</p>
                    <div className="grid grid-cols-4 gap-1">
                      {BG_OPTIONS.map(opt => (
                        <button key={opt.id} type="button"
                          onClick={() => {
                            setProcessing(`${idx}-${opt.id}`)
                            setTimeout(() => {
                              applyVersion(idx, opt.fn)
                              setProcessing(null)
                            }, 300)
                          }}
                          disabled={processing === `${idx}-${opt.id}`}
                          className="glass rounded-lg p-2 text-center hover:bg-gold-dim transition-all disabled:opacity-50 border-none cursor-pointer">
                          {processing === `${idx}-${opt.id}` ? (
                            <Loader size={10} className="text-gold animate-spin mx-auto" />
                          ) : (
                            <>
                              <img src={opt.fn(thumbnailUrl(url, 40))} alt="" className="w-6 h-6 rounded object-cover mx-auto mb-0.5" />
                              <span className="text-[8px] text-text-dim">{opt.label}</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => applyVersion(idx, u => hdUpscaledUrl(u, 2))}
                      className="glass flex-1 rounded-lg p-1.5 text-[9px] text-text-muted hover:text-gold inline-flex items-center justify-center gap-1 border-none cursor-pointer">
                      <Sparkles size={10} /> Upscale 2x
                    </button>
                    <button type="button" onClick={() => applyVersion(idx, u => hdUpscaledUrl(u, 4))}
                      className="glass flex-1 rounded-lg p-1.5 text-[9px] text-text-muted hover:text-gold inline-flex items-center justify-center gap-1 border-none cursor-pointer">
                      <Maximize size={10} /> Upscale 4x
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Full-screen Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <img src={previewImage} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <button onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 glass rounded-full flex items-center justify-center border-none cursor-pointer hover:bg-red-dim">
              <X size={14} className="text-text" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
