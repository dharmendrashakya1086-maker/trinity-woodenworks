import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'
import { MapPin, CreditCard, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'

export default function Checkout() {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: '',
    paymentMethod: 'cod',
  })

  const shipping = total >= 5000 ? 0 : 99
  const grandTotal = total + shipping

  async function handlePlaceOrder() {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all delivery details')
      return
    }
    try {
      await addDoc(collection(db, 'orders'), {
        customer_id: user.uid, customer_name: form.name, customer_email: user.email,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
        total: grandTotal, shipping: { ...form }, paymentMethod: form.paymentMethod,
        status: 'pending', createdAt: new Date().toISOString(),
      })
      await clearCart()
      toast.success('Order placed!')
      navigate('/orders')
    } catch { toast.error('Failed to place order') }
  }

  if (items.length === 0) { navigate('/cart'); return null }

  const steps = [
    { n: 1, icon: MapPin, label: 'Delivery' },
    { n: 2, icon: CreditCard, label: 'Payment' },
    { n: 3, icon: CheckCircle, label: 'Confirm' },
  ]

  return (
    <div className="pt-20 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold gold-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step >= s.n ? 'bg-gold text-dark' : 'bg-white/[0.03] text-text-dim border border-white/[0.06]'
            }`}>
              <s.n size={14} />
            </div>
            <span className={`text-[11px] hidden sm:block ${step >= s.n ? 'text-gold' : 'text-text-dim'}`}>{s.label}</span>
            {i < 2 && <div className={`flex-1 h-px ${step > s.n ? 'bg-gold/30' : 'bg-white/[0.05]'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Delivery */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gold text-dark text-xs flex items-center justify-center font-bold">1</span>
            Delivery Details
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-sm" />
              <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field text-sm" />
            </div>
            <textarea placeholder="Full Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field text-sm min-h-[80px]" />
            <div className="grid grid-cols-3 gap-3">
              <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field text-sm" />
              <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-field text-sm" />
              <input placeholder="PIN Code" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="input-field text-sm" />
            </div>
          </div>
          <button onClick={() => setStep(2)} className="btn-gold mt-5 flex items-center gap-2 text-sm">
            Continue <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-text mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gold text-dark text-xs flex items-center justify-center font-bold">2</span>
            Payment Method
          </h2>
          <div className="space-y-2">
            {[
              { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '🚚' },
              { id: 'upi', label: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm', icon: '📱' },
              { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: '💳' },
            ].map(m => (
              <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                form.paymentMethod === m.id
                  ? 'bg-gold-dim border-gold/20'
                  : 'bg-white/[0.02] border-white/[0.04] hover:border-white/[0.08]'
              }`}>
                <input type="radio" name="payment" value={m.id} checked={form.paymentMethod === m.id}
                  onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                  className="accent-[#D4AF37]" />
                <span className="text-lg">{m.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-text">{m.label}</p>
                  <p className="text-[11px] text-text-muted">{m.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={() => setStep(1)} className="btn-outline flex-1 text-sm flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(3)} className="btn-gold flex-1 text-sm flex items-center justify-center gap-1">
              Review <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold text-dark text-xs flex items-center justify-center font-bold">3</span>
              Order Summary
            </h2>
            <div className="space-y-2">
              {items.map(i => (
                <div key={i.id} className="flex items-center gap-3 text-sm">
                  <img src={i.image || '/placeholder.svg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="flex-1 text-text-muted truncate">{i.name}</span>
                  <span className="text-text">×{i.qty}</span>
                  <span className="text-gold font-semibold">₹{(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.05] mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-text-muted"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
              <div className="flex justify-between text-text-muted"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
              <div className="flex justify-between font-bold text-base pt-1"><span className="text-text">Total</span><span className="text-gold">₹{grandTotal.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Delivery Address</h3>
            <p className="text-sm text-text">{form.name}, {form.phone}</p>
            <p className="text-sm text-text-muted">{form.address}, {form.city}, {form.state} - {form.pincode}</p>
          </div>

          <div className="glass rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Payment</h3>
            <p className="text-sm text-text capitalize">{form.paymentMethod === 'cod' ? 'Cash on Delivery' : form.paymentMethod}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1 text-sm flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={handlePlaceOrder} className="btn-gold flex-1 text-sm">
              Place Order — ₹{grandTotal.toLocaleString()}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
