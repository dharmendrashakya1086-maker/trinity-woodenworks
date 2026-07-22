import { useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'

export default function ImageUpload({ value, onChange }) {
  const widgetRef = useRef(null)

  function openUpload() {
    if (!window.cloudinary) {
      // Load Cloudinary widget script
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
        folder: 'trinity-products',
        maxImageFileSize: 5000000,
        cropping: true,
        croppingAspectRatio: 1,
        sources: ['local', 'camera', 'url'],
      },
      (error, result) => {
        if (!error && result.event === 'success') {
          onChange(result.info.secure_url)
        }
      }
    )
    widget.open()
  }

  return (
    <div className="space-y-2">
      <label className="text-xs text-text-muted block">Product Image</label>

      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="w-32 h-32 rounded-xl object-cover border border-dark-border" />
          <button
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-none cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openUpload}
          className="w-32 h-32 rounded-xl border-2 border-dashed border-dark-border hover:border-gold flex flex-col items-center justify-center gap-2 bg-white/[0.02] cursor-pointer transition-colors"
        >
          <Upload size={20} className="text-text-muted" />
          <span className="text-xs text-text-muted">Upload</span>
        </button>
      )}
    </div>
  )
}
