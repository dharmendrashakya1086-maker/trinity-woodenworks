import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'
import { CreditCard, Truck, CheckCircle } from 'lucide-react'

export default function Checkout() {
  const { user } = useAuth()
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: '', state: '', pincode: '',
    paymentMethod: 'cod',
  })

  async function handlePlaceOrder() {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.pincode) {
      toast.error('Please fill all delivery details')
      return
    }

    try {
      await addDoc(collection(db, 'orders'), {
        customer_id: user.uid,
        customer_name: form.name,
        customer_email: user.email,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, image: i.image })),
        total,
        shipping: { ...form },
        paymentMethod: form.paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
      await clearCart()
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (err) {
      toast.error('Failed to place order')
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold gold-text mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        {[
          { n: 1, icon: Truck, label: 'Delivery' },
          { n: 2, icon: CreditCard, label: 'Payment' },
          { n: 3, icon: CheckCircle, label: 'Confirm' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.n ? 'bg-gold text-dark' : 'glass text-text-muted'}`}>
              <s.icon size={16} />
            </div>
            <span className={`text-xs hidden sm:block ${step >= s.n ? 'text-gold' : 'text-text-muted'}`}>{s.label}</span>
            {i < 2 && <div className={`flex-1 h-px ${step > s.n ? 'bg-gold' : 'bg-dark-border'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Delivery */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text mb-4">Delivery Details</h2>
          <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
          <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
          <textarea placeholder="Full Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field min-h-[80px]" />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field" />
            <input placeholder="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="input-field" />
          </div>
          <input placeholder="PIN Code" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="input-field" />
          <button onClick={() => setStep(2)} className="btn-gold w-full">Continue to Payment</button>
        </motion.div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text mb-4">Payment Method</h2>
          {[
            { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive' },
            { id: 'upi', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm' },
            { id: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, RuPay' },
          ].map(m => (
            <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${form.paymentMethod === m.id ? 'bg-gold-dim border border-gold' : 'glass hover:bg-white/5'}`}>
              <input type="radio" name="payment" value={m.id} checked={form.paymentMethod === m.id} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="accent-[#C9A96E]" />
              <div>
                <p className="text-sm font-semibold text-text">{m.label}</p>
                <p className="text-xs text-text-muted">{m.desc}</p>
              </div>
            </label>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
            <button onClick={() => setStep(3)} className="btn-gold flex-1">Review Order</button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-text mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map(i => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-text-muted">{i.name} × {i.qty}</span>
                  <span className="text-text">₹{(i.price * i.qty).toLocaleString()}</span>
                </div>
              ))}
              <hr className="border-dark-border" />
              <div className="flex justify-between font-bold">
                <span className="text-text">Total</span>
                <span className="text-gold">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-text mb-2">Delivery Address</h2>
            <p className="text-sm text-text-muted">{form.name}, {form.phone}</p>
            <p className="text-sm text-text-muted">{form.address}, {form.city}, {form.state} - {form.pincode}</p>
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-text mb-2">Payment</h2>
            <p className="text-sm text-text-muted capitalize">{form.paymentMethod === 'cod' ? 'Cash on Delivery' : form.paymentMethod}</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1">Back</button>
            <button onClick={handlePlaceOrder} className="btn-gold flex-1">Place Order</button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
