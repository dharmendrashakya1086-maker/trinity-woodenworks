// Seed script — run with: node scripts/seed.js
// Requires: FIREBASE_SERVICE_ACCOUNT env var (JSON string of service account key)

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

const categories = [
  { id: 'furniture', name: 'Furniture', description: 'Tables, chairs, beds, and more', image: '' },
  { id: 'home-decor', name: 'Home Décor', description: 'Mirrors, frames, wall art', image: '' },
  { id: 'kitchen', name: 'Kitchen', description: 'Cutting boards, serving trays, utensils', image: '' },
  { id: 'garden', name: 'Garden', description: 'Planters, outdoor furniture', image: '' },
]

const products = [
  { name: 'Sheesham Wood Dining Table', price: 18999, mrp: 24999, category: 'furniture', stock: 5, description: 'Solid sheesham wood 6-seater dining table with natural grain finish.', image: '' },
  { name: 'Carved Wooden Mirror Frame', price: 3499, mrp: 4999, category: 'home-decor', stock: 12, description: 'Hand-carved teak wood mirror frame with traditional motifs.', image: '' },
  { name: 'Mango Wood Serving Tray', price: 1299, mrp: 1799, category: 'kitchen', stock: 25, description: 'Rustic mango wood serving tray with handles.', image: '' },
  { name: 'Oak Study Table', price: 12999, mrp: 16999, category: 'furniture', stock: 8, description: 'Minimalist oak wood study table with drawer.', image: '' },
  { name: 'Teak Garden Bench', price: 8999, mrp: 11999, category: 'garden', stock: 3, description: 'Weather-resistant teak garden bench for 2 people.', image: '' },
  { name: 'Walnut Wall Shelf', price: 2799, mrp: 3499, category: 'home-decor', stock: 15, description: 'Floating walnut wood wall shelf, set of 3.', image: '' },
]

async function seed() {
  console.log('Seeding categories...')
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set(cat)
  }

  console.log('Seeding products...')
  for (const prod of products) {
    await db.collection('products').add(prod)
  }

  // Create empty defaults
  for (const col of ['orders', 'customers', 'customOrders', 'contactMessages', 'carts', 'newsletter', 'admin']) {
    const snap = await db.collection(col).limit(1).get()
    if (snap.empty) {
      await db.collection(col).doc('_placeholder').set({ _seed: true })
    }
  }

  console.log('Seed complete!')
}

seed().catch(console.error)
