import { useState } from 'react'
import { motion } from 'framer-motion'
import { saveDraft } from '../../lib/firestore'
import toast from 'react-hot-toast'
import { Database, CheckCircle, Loader, ArrowUpCircle } from 'lucide-react'

const categories = [
  { id: 'beds', name: 'Beds', description: 'Handcrafted wooden beds', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600', slug: 'beds', displayOrder: 1, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Beds - Handcrafted Furniture', seoDescription: 'Premium handcrafted wooden beds from Trinity Woodenworks' },
  { id: 'sofas', name: 'Sofas', description: 'Comfortable wooden sofas', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', slug: 'sofas', displayOrder: 2, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Sofas - Handcrafted Furniture', seoDescription: 'Premium handcrafted wooden sofas from Trinity Woodenworks' },
  { id: 'dining', name: 'Dining Tables', description: 'Elegant dining tables', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600', slug: 'dining-tables', displayOrder: 3, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Dining Tables', seoDescription: 'Handcrafted wooden dining tables for your home' },
  { id: 'chairs', name: 'Chairs', description: 'Wooden chairs & rockers', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600', slug: 'chairs', displayOrder: 4, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Chairs', seoDescription: 'Handcrafted wooden chairs and rockers' },
  { id: 'wardrobes', name: 'Wardrobes', description: 'Spacious wooden wardrobes', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600', slug: 'wardrobes', displayOrder: 5, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Wardrobes', seoDescription: 'Spacious handcrafted wooden wardrobes' },
  { id: 'desks', name: 'Desks', description: 'Work & study desks', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600', slug: 'desks', displayOrder: 6, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Desks', seoDescription: 'Handcrafted work and study desks' },
  { id: 'shelves', name: 'Shelves', description: 'Floating & standing shelves', image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600', slug: 'shelves', displayOrder: 7, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Shelves', seoDescription: 'Floating and standing wooden shelves' },
  { id: 'tables', name: 'Coffee Tables', description: 'Center & side tables', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600', slug: 'coffee-tables', displayOrder: 8, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Coffee Tables', seoDescription: 'Center and side tables handcrafted in Varanasi' },
  { id: 'outdoor', name: 'Outdoor', description: 'Garden & patio furniture', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600', slug: 'outdoor', displayOrder: 9, visibility: true, parentId: null, children: [], seoTitle: 'Outdoor Wooden Furniture', seoDescription: 'Garden and patio furniture handcrafted from solid wood' },
  { id: 'decor', name: 'Decor', description: 'Wooden home decor items', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600', slug: 'decor', displayOrder: 10, visibility: true, parentId: null, children: [], seoTitle: 'Wooden Home Decor', seoDescription: 'Handcrafted wooden home decor items' },
]

const adjectives = ['Royal', 'Classic', 'Heritage', 'Modern', 'Rustic', 'Premium', 'Artisan', 'Elite', 'Grand', 'Majestic']
const materials = ['Sheesham Wood', 'Teak Wood', 'Mango Wood', 'Oak Wood', 'Walnut Wood', 'Reclaimed Wood']
const items = {
  beds: ['Queen Bed', 'King Bed', 'Single Bed', 'Bunk Bed', 'Canopy Bed', 'Platform Bed', 'Storage Bed', 'Poster Bed', 'Low Profile Bed', 'Trundle Bed'],
  sofas: ['3-Seater Sofa', 'L-Shape Sofa', 'Loveseat', 'Recliner Sofa', 'Sofa Cum Bed', 'Chesterfield Sofa', 'Mid-Century Sofa', 'Sectional Sofa', 'Tuxedo Sofa', 'Cabriole Sofa'],
  dining: ['6-Seater Table', '4-Seater Table', '8-Seater Table', 'Round Table', 'Extendable Table', 'Foldable Table', 'Counter Table', 'Farmhouse Table', 'Pedestal Table', 'Parsons Table'],
  chairs: ['Dining Chair', 'Rocking Chair', 'Armchair', 'Folding Chair', 'Windsor Chair', 'Club Chair', 'Wingback Chair', 'Slipper Chair', 'Accent Chair', 'Barrel Chair'],
  wardrobes: ['2-Door Wardrobe', '3-Door Wardrobe', 'Sliding Wardrobe', 'Corner Wardrobe', 'Mirror Wardrobe', 'Open Wardrobe', 'Portable Wardrobe', 'Walk-in Closet', 'Armoire', 'Chifforobe'],
  desks: ['Study Desk', 'Computer Desk', 'Standing Desk', 'Writing Desk', 'L-Desk', 'Floating Desk', 'Secretary Desk', 'Executive Desk', 'Drawing Desk', 'Gaming Desk'],
  shelves: ['Floating Shelf', 'Bookshelf', 'Corner Shelf', 'Ladder Shelf', 'Wall Unit', 'Cube Shelf', 'Tiered Shelf', 'Display Shelf', 'Shadow Box', 'Picture Ledge'],
  tables: ['Coffee Table', 'End Table', 'Side Table', 'Nesting Tables', 'Console Table', 'C-Table', 'Round Coffee Table', 'Ottoman Table', 'Trunk Table', 'Drum Table'],
  outdoor: ['Garden Bench', 'Patio Set', 'Deck Chair', 'Swing', 'Adirondack Chair', 'Picnic Table', 'Planter Box', 'Hammock Stand', 'Gazebo', 'Fire Pit Table'],
  decor: ['Wall Clock', 'Photo Frame', 'Mirror Frame', 'Key Holder', 'Bookend Set', 'Candle Holder', 'Serving Tray', 'Bowl Set', 'Rack', 'Coaster Set'],
}

function generateProducts() {
  const products = []
  let count = 0
  for (const cat of categories) {
    const catItems = items[cat.id] || []
    for (const itemName of catItems) {
      const adj = adjectives[count % adjectives.length]
      const material = materials[count % materials.length]
      const name = `${adj} ${itemName}`
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const price = Math.floor(Math.random() * 45000) + 5000
      const stock = Math.floor(Math.random() * 20) + 1

      products.push({
        id: `${cat.id}_${count + 1}`,
        name,
        slug,
        description: `Handcrafted ${itemName.toLowerCase()} made from premium ${material.toLowerCase()}. Features traditional joinery and a rich natural finish that highlights the beauty of the grain. Built to last generations with proper care.`,
        shortDescription: `Premium ${itemName.toLowerCase()} handcrafted from ${material.toLowerCase()}`,
        price,
        compareAtPrice: Math.floor(price * 1.2),
        sku: `TW-${cat.id.toUpperCase().slice(0, 3)}-${String(count + 1).padStart(4, '0')}`,
        categoryId: cat.id,
        categories: [cat.id],
        collectionIds: [],
        brand: 'Trinity Woodenworks',
        materials: material,
        dimensions: `${Math.floor(Math.random() * 100 + 60)} × ${Math.floor(Math.random() * 60 + 40)} × ${Math.floor(Math.random() * 40 + 30)} cm`,
        weight: `${Math.floor(Math.random() * 30 + 5)} kg`,
        warranty: '2 years manufacturer warranty',
        careInstructions: 'Wipe with a dry cloth. Avoid direct sunlight. Use coasters for hot items.',
        images: [cat.image],
        gallery: [],
        variants: [],
        relatedProductIds: [],
        seoTitle: `${name} - Trinity Woodenworks`,
        seoDescription: `Buy ${name} online. Handcrafted from ${material.toLowerCase()} in Varanasi, India.`,
        seoKeywords: `${itemName.toLowerCase()}, wooden ${itemName.toLowerCase()}, ${material.toLowerCase()}, trinity woodenworks`,
        featured: count % 5 === 0,
        stock,
        stockStatus: stock > 0 ? 'in_stock' : 'out_of_stock',
        createdAt: new Date().toISOString(),
      })
      count++
    }
  }
  return products
}

export default function SeedData() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSeed() {
    if (!confirm('Add 10 categories and 100 products to DRAFTS. Nothing goes live until you publish.')) return
    setLoading(true)
    try {
      for (const cat of categories) {
        await saveDraft('categories', cat.id, cat)
      }
      const products = generateProducts()
      for (const p of products) {
        await saveDraft('products', p.id, p)
      }
      setDone(true)
      toast.success('Drafts seeded! Go to Dashboard → Publish All')
    } catch (err) { toast.error('Seeding failed: ' + err.message) }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gold-dim border border-gold/10 flex items-center justify-center">
          <Database className="text-gold" size={26} />
        </div>
        <h1 className="text-xl font-bold gold-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Seed Database</h1>
        <p className="text-text-muted text-sm mb-6">
          Add 10 categories and 100 products to drafts. PRD-compliant data with slugs, SKUs, materials, dimensions, SEO fields, and more.
        </p>

        {done ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle size={48} className="text-gold" />
            <div>
              <p className="text-sm font-semibold text-text">Drafts Seeded!</p>
              <p className="text-[11px] text-text-muted mt-1">10 categories and 100 products added to drafts</p>
            </div>
            <a href="/admin" className="btn-gold no-underline text-sm inline-flex items-center gap-1.5">
              <ArrowUpCircle size={14} /> Go to Dashboard → Publish
            </a>
          </div>
        ) : (
          <button onClick={handleSeed} disabled={loading} className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-50">
            {loading ? <><Loader size={15} className="animate-spin" /> Seeding...</> : <><Database size={15} /> Seed Draft Data</>}
          </button>
        )}
      </motion.div>
    </div>
  )
}
