import { createContext, useContext, useState, useEffect } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function useCart() {
  return useContext(CartContext)
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setItems([])
      return
    }
    setLoading(true)
    const unsub = onSnapshot(doc(db, 'carts', user.uid), (snap) => {
      setItems(snap.exists() ? snap.data().items || [] : [])
      setLoading(false)
    })
    return unsub
  }, [user])

  async function saveCart(newItems) {
    if (!user) return
    setItems(newItems)
    await setDoc(doc(db, 'carts', user.uid), { items: newItems, updatedAt: new Date().toISOString() })
  }

  function addItem(product, qty = 1) {
    if (!user) return
    const existing = items.find(i => i.id === product.id)
    const updated = existing
      ? items.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      : [...items, { id: product.id, name: product.name, price: product.price, image: product.image, qty }]
    return saveCart(updated)
  }

  function removeItem(productId) {
    return saveCart(items.filter(i => i.id !== productId))
  }

  function updateQty(productId, qty) {
    if (qty < 1) return removeItem(productId)
    return saveCart(items.map(i => i.id === productId ? { ...i, qty } : i))
  }

  function clearCart() {
    return saveCart([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  const value = { items, loading, addItem, removeItem, updateQty, clearCart, total, count }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
