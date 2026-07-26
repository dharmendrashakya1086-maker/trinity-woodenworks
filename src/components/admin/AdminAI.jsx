import { useState } from 'react'
import { Wand2, Loader, X, Sparkles, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const AI_TOOLS = [
  { id: 'seoTitle', label: 'SEO Title', icon: '📝', desc: 'Generate optimized title tag' },
  { id: 'seoDescription', label: 'Meta Description', icon: '🔍', desc: 'Generate meta description' },
  { id: 'shortDescription', label: 'Short Description', icon: '✨', desc: 'One-liner for product cards' },
  { id: 'description', label: 'Product Description', icon: '📄', desc: 'Detailed product description' },
  { id: 'careInstructions', label: 'Care Instructions', icon: '🧹', desc: 'Wood care guide' },
  { id: 'tags', label: 'Product Tags', icon: '🏷️', desc: 'Suggested search tags' },
]

function generateContent(toolId, product) {
  const name = product?.name || 'This product'
  const mat = product?.materials || 'premium solid wood'
  const cat = product?.categoryId || 'furniture'
  const dim = product?.dimensions || ''
  const price = product?.price || 0

  const generators = {
    seoTitle: () => `${name} - Handcrafted ${mat} ${cat} | Trinity Woodenworks Varanasi`,
    seoDescription: () => `Shop ${name} crafted from ${mat} by skilled artisans in Varanasi. ${price > 0 ? `Starting at ₹${price.toLocaleString()}.` : ''} Premium quality handcrafted furniture with free delivery. Buy online from Trinity Woodenworks.`,
    shortDescription: () => `Handcrafted ${name.toLowerCase()} made from ${mat} by skilled artisans in Varanasi. Premium quality with traditional techniques.`,
    description: () => `The ${name} is a masterfully handcrafted piece made from ${mat} by skilled artisans in Varanasi. Each piece showcases traditional woodworking techniques passed down through generations, ensuring exceptional quality and timeless beauty. ${dim ? `Measuring ${dim}, ` : ''}this piece is designed to be both functional and aesthetically pleasing, perfect for adding warmth and character to any living space.`,
    careInstructions: () => `Dust regularly with a soft, dry cloth. Avoid placing in direct sunlight or near heat sources. Wipe spills immediately with a clean, damp cloth and dry thoroughly. Apply wood polish or wax every 6 months to maintain the natural luster. Use coasters and placemats to prevent water marks and scratches. For deeper cleaning, use a mild soap solution and dry immediately.`,
    tags: () => {
      const base = [name.toLowerCase(), mat.toLowerCase(), cat, 'handcrafted', 'varanasi', 'wooden', 'indian']
      if (price > 10000) base.push('premium', 'luxury')
      if (price < 5000) base.push('affordable', 'budget')
      return base.join(', ')
    },
  }

  return (generators[toolId] || (() => ''))()
}

export default function AdminAI({ product, onApply }) {
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(null)
  const [copied, setCopied] = useState(null)
  const [results, setResults] = useState({})

  function handleGenerate(toolId) {
    setGenerating(toolId)
    setTimeout(() => {
      const content = generateContent(toolId, product)
      setResults(r => ({ ...r, [toolId]: content }))
      setGenerating(null)
    }, 500)
  }

  function handleCopy(text, toolId) {
    navigator.clipboard.writeText(text)
    setCopied(toolId)
    toast.success('Copied!')
    setTimeout(() => setCopied(null), 1500)
  }

  function handleApply(toolId) {
    const text = results[toolId]
    if (!text) return
    onApply?.(toolId, text)
    toast.success(`${toolId} applied to form`)
  }

  return (
    <>
      <button onClick={() => setOpen(!open)}
        className="glass rounded-lg p-2 hover:bg-gold-dim transition-all border-none cursor-pointer"
        title="AI Content Generator">
        {open ? <X size={14} className="text-gold" /> : <Sparkles size={14} className="text-gold" />}
      </button>

      {open && (
        <div className="glass rounded-xl p-3 border border-gold/20 mb-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={12} className="text-gold" />
            <p className="text-[11px] text-text font-semibold">AI Content Generator</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {AI_TOOLS.map(tool => (
              <button key={tool.id} onClick={() => handleGenerate(tool.id)} disabled={generating === tool.id}
                className="glass rounded-lg p-2 text-left hover:bg-gold-dim transition-all disabled:opacity-50 border-none cursor-pointer">
                {generating === tool.id ? (
                  <Loader size={12} className="text-gold animate-spin" />
                ) : (
                  <>
                    <p className="text-[10px] text-text font-medium">{tool.icon} {tool.label}</p>
                    <p className="text-[8px] text-text-dim">{tool.desc}</p>
                  </>
                )}
              </button>
            ))}
          </div>

          {Object.keys(results).length > 0 && (
            <div className="space-y-2 mt-2 border-t border-white/[0.04] pt-2">
              {Object.entries(results).map(([key, text]) => (
                <div key={key} className="glass rounded-lg p-2">
                  <p className="text-[9px] text-text-dim mb-1 font-medium">{AI_TOOLS.find(t => t.id === key)?.label}</p>
                  <p className="text-[10px] text-text leading-relaxed">{text}</p>
                  <div className="flex gap-1 mt-1.5">
                    <button onClick={() => handleCopy(text, key)}
                      className="text-[9px] text-gold hover:underline inline-flex items-center gap-1 bg-transparent border-none cursor-pointer">
                      {copied === key ? <Check size={9} /> : <Copy size={9} />} Copy
                    </button>
                    <button onClick={() => handleApply(key)}
                      className="text-[9px] text-gold hover:underline inline-flex items-center gap-1 bg-transparent border-none cursor-pointer">
                      <Wand2 size={9} /> Apply to form
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
