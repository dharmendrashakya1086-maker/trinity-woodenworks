import { useState } from 'react'
import { Plus, X, GripVertical, Upload, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '../ui/ImageUpload'

const VARIANT_TYPES = [
  { value: 'color', label: 'Color', placeholder: 'e.g. Natural Walnut' },
  { value: 'size', label: 'Size', placeholder: 'e.g. King (78x72)' },
  { value: 'wood', label: 'Wood Type', placeholder: 'e.g. Sheesham' },
  { value: 'finish', label: 'Finish', placeholder: 'e.g. Matte' },
]

const STOCK_STATUSES = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'pre_order', label: 'Pre Order' },
  { value: 'back_order', label: 'Back Order' },
]

export default function VariantManager({ variants = [], onChange }) {
  const [expanded, setExpanded] = useState(null)

  function addVariant() {
    const id = `v_${Date.now()}`
    onChange([...variants, {
      id, name: '', type: 'color', sku: '', price: 0, compareAtPrice: 0,
      stock: 0, stockStatus: 'in_stock', image: '', options: {},
    }])
    setExpanded(id)
  }

  function updateVariant(id, field, value) {
    onChange(variants.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  function removeVariant(id) {
    onChange(variants.filter(v => v.id !== id))
    if (expanded === id) setExpanded(null)
  }

  function duplicateVariant(id) {
    const original = variants.find(v => v.id === id)
    if (!original) return
    const newId = `v_${Date.now()}`
    const copy = { ...original, id: newId, name: `${original.name} (copy)`, sku: `${original.sku}-copy` }
    const idx = variants.findIndex(v => v.id === id)
    const next = [...variants]
    next.splice(idx + 1, 0, copy)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-text-muted font-medium">Variants</label>
        <button type="button" onClick={addVariant}
          className="text-[11px] text-gold hover:underline inline-flex items-center gap-1 bg-transparent border-none cursor-pointer">
          <Plus size={12} /> Add Variant
        </button>
      </div>

      {variants.length === 0 && (
        <p className="text-[11px] text-text-dim py-3 text-center glass rounded-lg">
          No variants. Add color, size, wood type, or finish variants.
        </p>
      )}

      {variants.map((v, idx) => (
        <div key={v.id} className="glass rounded-lg overflow-hidden">
          <button type="button" onClick={() => setExpanded(expanded === v.id ? null : v.id)}
            className="w-full flex items-center gap-2 p-2.5 text-left bg-transparent border-none cursor-pointer hover:bg-white/[0.02]">
            <GripVertical size={12} className="text-text-dim flex-shrink-0" />
            {v.image && <img src={v.image} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text font-medium truncate">{v.name || `Variant ${idx + 1}`}</p>
              <p className="text-[10px] text-text-dim">{v.type} · ₹{v.price || 0} · {v.stock || 0} units</p>
            </div>
            <span className={`badge ${v.stockStatus === 'in_stock' ? 'badge-green' : v.stockStatus === 'out_of_stock' ? 'badge-red' : 'badge-gold'} text-[8px]`}>
              {STOCK_STATUSES.find(s => s.value === v.stockStatus)?.label || 'In Stock'}
            </span>
          </button>

          {expanded === v.id && (
            <div className="p-3 border-t border-white/[0.04] space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-dim mb-1 block">Variant Name</label>
                  <input value={v.name} onChange={e => updateVariant(v.id, 'name', e.target.value)}
                    className="input-field text-xs w-full" placeholder="e.g. Natural Walnut" />
                </div>
                <div>
                  <label className="text-[10px] text-text-dim mb-1 block">Type</label>
                  <select value={v.type} onChange={e => updateVariant(v.id, 'type', e.target.value)}
                    className="input-field text-xs w-full">
                    {VARIANT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-dim mb-1 block">SKU</label>
                  <input value={v.sku} onChange={e => updateVariant(v.id, 'sku', e.target.value)}
                    className="input-field text-xs w-full" placeholder="SKU" />
                </div>
                <div>
                  <label className="text-[10px] text-text-dim mb-1 block">Image</label>
                  <ImageUpload currentImage={v.image} onUpload={url => updateVariant(v.id, 'image', url)} compact />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-text-dim mb-1 block">Price (₹)</label>
                  <input type="number" value={v.price} onChange={e => updateVariant(v.id, 'price', Number(e.target.value))}
                    className="input-field text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] text-text-dim mb-1 block">Compare At (₹)</label>
                  <input type="number" value={v.compareAtPrice} onChange={e => updateVariant(v.id, 'compareAtPrice', Number(e.target.value))}
                    className="input-field text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] text-text-dim mb-1 block">Stock</label>
                  <input type="number" value={v.stock} onChange={e => updateVariant(v.id, 'stock', Number(e.target.value))}
                    className="input-field text-xs w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-dim mb-1 block">Stock Status</label>
                  <select value={v.stockStatus} onChange={e => updateVariant(v.id, 'stockStatus', e.target.value)}
                    className="input-field text-xs w-full">
                    {STOCK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-1.5">
                  <button type="button" onClick={() => duplicateVariant(v.id)}
                    className="glass px-3 py-1.5 rounded-lg text-[10px] text-text-muted hover:text-gold flex-1">Duplicate</button>
                  <button type="button" onClick={() => removeVariant(v.id)}
                    className="glass px-3 py-1.5 rounded-lg text-[10px] text-red-400 hover:bg-red-dim flex-1">Remove</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
