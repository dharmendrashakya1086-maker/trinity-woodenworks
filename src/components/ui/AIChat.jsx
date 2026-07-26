import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { MessageCircle, X, Send, Bot, User, Loader, Sparkles } from 'lucide-react'

const WOOD_TYPES = ['Sheesham', 'Teak', 'Oak', 'Walnut', 'Mango', 'Rosewood', 'Pine', 'Cedar']

function generateAIResponse(input, products) {
  const q = input.toLowerCase()

  // Product recommendations
  if (q.includes('dining') || q.includes('table')) {
    const match = products.filter(p => p.name?.toLowerCase().includes('dining') || p.categoryId === 'dining')
    if (match.length) return `We have ${match.length} dining table options! ${match.slice(0, 2).map(p => `${p.name} at ₹${p.price?.toLocaleString()}`).join(' and ')}. Would you like to see more?`
    return 'We offer custom dining tables in Sheesham, Teak, and Oak wood. Our artisan team in Varanasi can craft one to your exact specifications. Would you like to start a custom order?'
  }
  if (q.includes('bed')) {
    return 'Our wooden beds are crafted from solid Sheesham and Teak wood, built to last generations. Prices start from ₹24,999. Would you like to browse our bed collection or discuss a custom size?'
  }
  if (q.includes('sofa')) {
    return 'Our wooden sofas combine traditional craftsmanship with modern comfort. We offer 2-seater, 3-seater, and L-shaped options in premium hardwood. Shall I help you find the right one?'
  }
  if (q.includes('price') || q.includes('cost') || q.includes('expensive') || q.includes('cheap') || q.includes('budget')) {
    return 'Our handcrafted furniture ranges from ₹1,999 for smaller decor items to ₹1,50,000+ for premium dining sets. Each piece is made to order by skilled artisans. What is your budget? I can suggest options.'
  }
  if (q.includes('custom') || q.includes('bespoke') || q.includes('made to order')) {
    return 'We love custom projects! Our artisans can create furniture to your exact specifications — dimensions, wood type, finish, and design. Start by visiting our Custom Order page or share your requirements here.'
  }
  if (q.includes('wood') || q.includes('material')) {
    return `We work with ${WOOD_TYPES.slice(0, 5).join(', ')} and more. Each wood has unique grain patterns and durability. Sheesham is our most popular — known for its rich golden-brown color and exceptional strength. Want to know about a specific wood type?`
  }
  if (q.includes('delivery') || q.includes('shipping') || q.includes('ship')) {
    return 'We offer free delivery across India for orders above ₹5,000. Standard delivery takes 7-15 business days depending on your location and the complexity of the piece. Custom orders may take 4-6 weeks.'
  }
  if (q.includes('warranty') || q.includes('guarantee')) {
    return 'Every piece comes with a 2-year warranty against manufacturing defects. We also offer lifetime care support for our solid wood furniture.'
  }
  if (q.includes('return') || q.includes('exchange')) {
    return 'We offer a 7-day return policy for standard items in original condition. Custom orders are made to specification and cannot be returned unless there is a defect. We always ensure quality before dispatch.'
  }
  if (q.includes('care') || q.includes('maintain') || q.includes('clean')) {
    return 'For daily care: dust with a soft dry cloth. Avoid direct sunlight and moisture. Apply wood polish every 6 months. Use coasters to prevent water marks. Our furniture is built to last generations with proper care!'
  }
  if (q.includes('size') || q.includes('dimension')) {
    return 'We offer standard sizes and can craft custom dimensions for any piece. What product are you looking at? I can provide specific dimensions or help you plan a custom size.'
  }
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return 'Hello! Welcome to Trinity Woodenworks. I am here to help you find the perfect handcrafted wooden furniture. What are you looking for today?'
  }
  if (q.includes('thank')) {
    return 'You are welcome! Feel free to ask if you need anything else. Happy to help you find the perfect piece for your home.'
  }
  if (q.includes('contact') || q.includes('phone') || q.includes('call') || q.includes('email')) {
    return 'You can reach us at our contact page or email support@trinitywoodenworks.com. Our team responds within 24 hours. For urgent queries, you can also start a custom order request and we will get back to you promptly.'
  }

  return 'I can help you with product recommendations, wood types, pricing, delivery info, care instructions, and custom orders. What would you like to know?'
}

export default function AIChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome to Trinity Woodenworks! I can help you find furniture, answer questions about wood types, pricing, or start a custom order. How can I help?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open && products.length === 0) {
      getDocs(collection(db, 'products')).then(snap =>
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      ).catch(() => {})
    }
  }, [open])

  function handleSend() {
    if (!input.trim()) return
    const userMsg = input.trim()
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      const response = generateAIResponse(userMsg, products)
      setMessages(m => [...m, { role: 'bot', text: response }])
      setLoading(false)
    }, 800)
  }

  const suggestions = ['What wood types do you use?', 'Tell me about dining tables', 'Do you deliver?', 'Custom order info']

  return (
    <>
      {/* FAB */}
      <button onClick={() => setOpen(!open)}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-gold text-dark flex items-center justify-center shadow-lg hover:bg-gold-light transition-all cursor-pointer border-none">
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-18 left-4 z-50 w-80 max-h-[450px] glass rounded-2xl border border-white/[0.08] shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="p-3 border-b border-white/[0.06] flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <Sparkles size={14} className="text-gold" />
              </div>
              <div>
                <p className="text-xs text-text font-semibold">Trinity Assistant</p>
                <p className="text-[9px] text-green-400">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[300px]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'bot' && (
                    <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                      <Bot size={10} className="text-gold" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-[11px] leading-relaxed
                    ${msg.role === 'user' ? 'bg-gold/20 text-text' : 'glass text-text-muted'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
                    <Loader size={10} className="text-gold animate-spin" />
                  </div>
                  <div className="glass rounded-xl px-3 py-2 text-[11px] text-text-dim">Thinking...</div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1">
                {suggestions.map(s => (
                  <button key={s} onClick={() => { setInput(s); }}
                    className="text-[9px] px-2 py-1 rounded-full bg-white/[0.04] text-text-muted hover:text-gold hover:bg-gold-dim transition-all border-none cursor-pointer">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/[0.06]">
              <form onSubmit={e => { e.preventDefault(); handleSend() }} className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about furniture..."
                  className="flex-1 bg-white/[0.04] rounded-lg px-3 py-2 text-[11px] text-text border border-white/[0.06] focus:border-gold/30 outline-none" />
                <button type="submit" disabled={!input.trim()}
                  className="w-8 h-8 rounded-lg bg-gold text-dark flex items-center justify-center disabled:opacity-40 border-none cursor-pointer">
                  <Send size={12} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
