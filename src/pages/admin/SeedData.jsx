import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'
import { Database, Check, Loader } from 'lucide-react'

const categories = [
  { id: 'dining-tables', name: 'Dining Tables', description: 'Solid wood dining tables for family gatherings', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=400&fit=crop' },
  { id: 'chairs', name: 'Chairs', description: 'Handcrafted wooden chairs for every room', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&h=400&fit=crop' },
  { id: 'beds', name: 'Beds', description: 'Premium wooden bed frames and headboards', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop' },
  { id: 'wardrobes', name: 'Wardrobes', description: 'Spacious wooden wardrobes with elegant finishes', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&h=400&fit=crop' },
  { id: 'tables', name: 'Tables', description: 'Coffee tables, side tables, and console tables', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&h=400&fit=crop' },
  { id: 'shelves', name: 'Shelves & Racks', description: 'Wall shelves, bookcases, and display racks', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&h=400&fit=crop' },
  { id: 'kitchen', name: 'Kitchen & Dining', description: 'Cutting boards, spice racks, and serving trays', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop' },
  { id: 'home-decor', name: 'Home Décor', description: 'Mirrors, frames, wall art, and accessories', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=400&fit=crop' },
  { id: 'outdoor', name: 'Outdoor & Garden', description: 'Garden benches, planters, and patio furniture', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop' },
  { id: 'office', name: 'Office Furniture', description: 'Desks, bookshelves, and office essentials', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop' },
]

const products = {
  'dining-tables': [
    { name: 'Sheesham 6-Seater Dining Table', price: 18999, mrp: 24999, stock: 5, description: 'Solid sheesham wood dining table with natural grain finish. Seats 6 comfortably.', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop' },
    { name: 'Walnut Extendable Dining Table', price: 24999, mrp: 32000, stock: 3, description: 'Premium walnut wood extendable table. Expands from 4 to 8 seats.', image: 'https://images.unsplash.com/photo-1577140917170-285929fb5787?w=400&h=400&fit=crop' },
    { name: 'Rustic Mango Wood Dining Table', price: 14999, mrp: 19999, stock: 7, description: 'Rustic finish mango wood table with sturdy iron legs.', image: 'https://images.unsplash.com/photo-1604074131665-7a4b13870ab7?w=400&h=400&fit=crop' },
    { name: 'Round Pedestal Dining Table', price: 16999, mrp: 21999, stock: 4, description: 'Elegant round teak wood pedestal table for 4 people.', image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&h=400&fit=crop' },
    { name: 'Industrial Oak Dining Table', price: 21999, mrp: 28000, stock: 3, description: 'Oak wood top with black metal frame. Industrial modern design.', image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&h=400&fit=crop' },
    { name: 'Farmhouse Pine Dining Table', price: 12999, mrp: 16999, stock: 8, description: 'Classic farmhouse style pine wood table with distressed finish.', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop' },
    { name: 'Live Edge Walnut Dining Table', price: 34999, mrp: 42000, stock: 2, description: 'Stunning live edge walnut slab table with epoxy resin fill.', image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=400&h=400&fit=crop' },
    { name: 'Minimalist Birch Dining Table', price: 15999, mrp: 20000, stock: 6, description: 'Clean Scandinavian design in light birch wood.', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
    { name: 'Carved Teak Dining Table', price: 28999, mrp: 36000, stock: 3, description: 'Hand-carved teak wood table with traditional Indian motifs.', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop' },
    { name: 'Marble Top Wooden Dining Table', price: 22999, mrp: 29000, stock: 4, description: 'Italian marble top with solid wood base. Luxurious finish.', image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&h=400&fit=crop' },
  ],
  'chairs': [
    { name: 'Sheesham Wood Dining Chair', price: 4999, mrp: 6999, stock: 20, description: 'Solid sheesham wood chair with cushioned seat.', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop' },
    { name: 'Carved Wooden Armchair', price: 8999, mrp: 12000, stock: 10, description: 'Hand-carved rosewood armchair with intricate designs.', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop' },
    { name: 'Rocking Chair Classic', price: 12999, mrp: 16999, stock: 6, description: 'Traditional teak wood rocking chair. Perfect for verandas.', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop' },
    { name: 'Windsor Oak Chair', price: 5999, mrp: 7999, stock: 15, description: 'Classic Windsor design in solid oak wood.', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop' },
    { name: 'Rattan & Wood Lounge Chair', price: 14999, mrp: 19000, stock: 4, description: 'Modern lounge chair with rattan weave and wooden frame.', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop' },
    { name: 'Foldable Wooden Chair Set (2)', price: 7999, mrp: 10999, stock: 12, description: 'Space-saving foldable mango wood chairs. Set of 2.', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop' },
    { name: 'Bar Stool Tall Oak', price: 6999, mrp: 8999, stock: 8, description: 'Counter height bar stool in solid oak with footrest.', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop' },
    { name: 'Office Chair Wooden Frame', price: 9999, mrp: 13000, stock: 7, description: 'Ergonomic office chair with solid wood frame and cushion.', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop' },
    { name: 'Kids Wooden Chair', price: 2999, mrp: 4000, stock: 25, description: 'Colorful kids chair in safe rounded pine wood.', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop' },
    { name: 'Patio Recliner Teak', price: 18999, mrp: 24000, stock: 3, description: 'Weather-resistant teak recliner for outdoor relaxation.', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop' },
  ],
  'beds': [
    { name: 'Sheesham King Size Bed', price: 28999, mrp: 36000, stock: 5, description: 'Solid sheesham wood king bed with Storage.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop' },
    { name: 'Teak Platform Bed Queen', price: 24999, mrp: 32000, stock: 4, description: 'Low profile teak platform bed. Modern minimalist design.', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=400&fit=crop' },
    { name: 'Carved Headboard Bed', price: 32999, mrp: 42000, stock: 3, description: 'Ornate hand-carved headboard in rosewood.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop' },
    { name: 'Bunk Bed Pine Wood', price: 18999, mrp: 24000, stock: 6, description: 'Sturdy pine wood bunk bed for kids. Safe railings included.', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=400&fit=crop' },
    { name: 'Poster Bed Walnut', price: 38999, mrp: 48000, stock: 2, description: 'Grand four-poster bed in rich walnut wood.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop' },
    { name: 'Single Bed Mango Wood', price: 9999, mrp: 13999, stock: 10, description: 'Compact single bed in mango wood. Perfect for small rooms.', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=400&fit=crop' },
    { name: 'Storage Bed Oak', price: 22999, mrp: 29000, stock: 5, description: 'Oak bed with hydraulic storage. Ample space underneath.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop' },
    { name: 'Canopy Bed Sheesham', price: 45999, mrp: 56000, stock: 1, description: 'Luxurious canopy bed frame in solid sheesham.', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=400&fit=crop' },
    { name: 'Daybed Teak Wood', price: 16999, mrp: 22000, stock: 4, description: 'Versatile teak daybed. Use as sofa or bed.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop' },
    { name: 'Trundle Bed Pine', price: 15999, mrp: 20000, stock: 3, description: 'Space-saving trundle bed with pull-out mattress.', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=400&fit=crop' },
  ],
  'wardrobes': [
    { name: '3-Door Sheesham Wardrobe', price: 24999, mrp: 32000, stock: 4, description: 'Spacious 3-door wardrobe in solid sheesham wood.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Sliding Door Wardrobe Oak', price: 28999, mrp: 36000, stock: 3, description: 'Modern sliding door wardrobe in oak finish.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop' },
    { name: 'Antique Mirror Wardrobe', price: 34999, mrp: 44000, stock: 2, description: 'Vintage wardrobe with full-length mirror panels.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Corner Wardrobe Teak', price: 22999, mrp: 29000, stock: 5, description: 'Space-efficient corner wardrobe in teak.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop' },
    { name: 'Kids Wardrobe Pine', price: 12999, mrp: 16999, stock: 7, description: 'Colorful kids wardrobe with fun knobs.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Walk-in Closet System', price: 45999, mrp: 58000, stock: 1, description: 'Complete walk-in closet system in walnut.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop' },
    { name: '2-Door Compact Wardrobe', price: 14999, mrp: 19999, stock: 8, description: 'Compact 2-door wardrobe for small spaces.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Carved Designer Wardrobe', price: 38999, mrp: 48000, stock: 2, description: 'Exquisitely carved rosewood wardrobe.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop' },
    { name: 'Louvered Door Wardrobe', price: 20999, mrp: 27000, stock: 4, description: 'Traditional louvered door design in mango wood.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Modular Wardrobe System', price: 32999, mrp: 42000, stock: 3, description: 'Customizable modular wardrobe. Add or remove sections.', image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&h=400&fit=crop' },
  ],
  'tables': [
    { name: 'Live Edge Coffee Table', price: 8999, mrp: 12000, stock: 8, description: 'Natural edge walnut coffee table with hairpin legs.', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=400&fit=crop' },
    { name: 'Nesting Tables Set of 3', price: 6999, mrp: 9999, stock: 10, description: 'Space-saving nesting tables in teak.', image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&h=400&fit=crop' },
    { name: 'Industrial Side Table', price: 4999, mrp: 6999, stock: 12, description: 'Pipe and wood industrial side table.', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=400&fit=crop' },
    { name: 'Round Ottoman Table', price: 5999, mrp: 7999, stock: 9, description: 'Round upholstered ottoman with hidden storage.', image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&h=400&fit=crop' },
    { name: 'Console Table Oak', price: 7999, mrp: 10999, stock: 7, description: 'Slim console table for hallways in oak.', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=400&fit=crop' },
    { name: 'Foldable TV Unit', price: 11999, mrp: 15999, stock: 5, description: 'Wall-mounted foldable TV unit in walnut.', image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&h=400&fit=crop' },
    { name: 'Sheesham Side Table', price: 3999, mrp: 5499, stock: 15, description: 'Compact side table in solid sheesham.', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=400&fit=crop' },
    { name: 'Marble Top Center Table', price: 14999, mrp: 19999, stock: 4, description: 'White marble top with wooden legs. Elegant center piece.', image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&h=400&fit=crop' },
    { name: 'Bench Style Coffee Table', price: 7499, mrp: 9999, stock: 6, description: 'Rustic bench-style coffee table in pine.', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=400&fit=crop' },
    { name: 'Glass Top Wooden Table', price: 9999, mrp: 13000, stock: 5, description: 'Tempered glass top with carved wooden base.', image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&h=400&fit=crop' },
  ],
  'shelves': [
    { name: 'Floating Wall Shelf Set (3)', price: 3999, mrp: 5499, stock: 20, description: 'Set of 3 floating shelves in walnut.', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop' },
    { name: 'Corner Display Shelf', price: 5999, mrp: 7999, stock: 10, description: 'Triangular corner shelf unit in teak.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Ladder Bookshelf', price: 8999, mrp: 12000, stock: 7, description: 'Leaning ladder style bookshelf in oak.', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop' },
    { name: 'Wall Mounted Grid Shelf', price: 4999, mrp: 6999, stock: 12, description: 'Geometric grid shelf for modern homes.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Modular Cube Shelves', price: 7999, mrp: 10999, stock: 8, description: 'Stackable cube shelves in mango wood.', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop' },
    { name: 'Vintage Display Cabinet', price: 14999, mrp: 19999, stock: 4, description: 'Glass-front display cabinet in distressed pine.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Pipe & Wood Shelf', price: 6999, mrp: 9000, stock: 9, description: 'Industrial pipe frame with wooden shelves.', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop' },
    { name: 'Kids Rainbow Shelf', price: 3499, mrp: 4999, stock: 15, description: 'Colorful wall shelf for kids rooms.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
    { name: 'Solid Teak Bookcase', price: 18999, mrp: 24000, stock: 3, description: 'Tall 5-tier bookcase in solid teak.', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=400&fit=crop' },
    { name: 'Wall Mounted Wine Rack', price: 4499, mrp: 5999, stock: 11, description: 'Display 12 bottles in style with oak wine rack.', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=400&h=400&fit=crop' },
  ],
  'kitchen': [
    { name: 'Thick Oak Cutting Board', price: 1499, mrp: 2000, stock: 30, description: 'Thick solid oak cutting board with juice groove.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Spice Rack Wall Mount', price: 2999, mrp: 3999, stock: 15, description: 'Wall-mounted 3-tier spice rack in bamboo.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Serving Tray Set (3)', price: 2499, mrp: 3499, stock: 20, description: 'Round serving trays in mango wood. Set of 3.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Wooden Utensil Set', price: 999, mrp: 1499, stock: 50, description: '6-piece wooden cooking utensil set in teak.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Bread Box Oak', price: 3499, mrp: 4499, stock: 10, description: 'Classic bread box in solid oak with chrome handle.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Mortar & Pestle Teak', price: 1999, mrp: 2799, stock: 25, description: 'Hand-carved teak wood mortar and pestle.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Fruit Basket Bamboo', price: 1299, mrp: 1799, stock: 35, description: 'Woven bamboo fruit basket with wooden base.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Pizza Peel Board', price: 2499, mrp: 3299, stock: 12, description: 'Large pizza peel in maple wood with handle.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Knife Block Walnut', price: 3999, mrp: 5499, stock: 8, description: 'Elegant walnut knife block. Holds 8 knives.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
    { name: 'Charcuterie Board', price: 2999, mrp: 3999, stock: 18, description: 'Large charcuterie board in live edge acacia.', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop' },
  ],
  'home-decor': [
    { name: 'Carved Wooden Mirror', price: 5999, mrp: 7999, stock: 8, description: 'Hand-carved teak wood mirror frame.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Wall Art Panel Set', price: 4999, mrp: 6999, stock: 10, description: 'Set of 3 abstract wooden wall art panels.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Wooden Clock Round', price: 3499, mrp: 4999, stock: 15, description: 'Minimalist round wall clock in walnut.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Photo Frame Collage', price: 2999, mrp: 3999, stock: 12, description: 'Multi-photo collage frame in mango wood.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Candle Holder Set', price: 1999, mrp: 2999, stock: 20, description: 'Set of 3 wooden candle holders in teak.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Key Holder Wall Mount', price: 1299, mrp: 1799, stock: 25, description: 'Wall-mounted key holder with hooks in pine.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Wooden Plant Pot Stand', price: 2499, mrp: 3499, stock: 18, description: 'Mid-century plant pot stand in teak.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Decorative Mirror Circle', price: 7999, mrp: 10999, stock: 5, description: 'Large circular mirror with carved frame.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Wind Chimes Bamboo', price: 999, mrp: 1499, stock: 30, description: 'Melodic bamboo wind chimes for gardens.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
    { name: 'Wall Shelf with Hooks', price: 2799, mrp: 3799, stock: 14, description: 'Floating shelf with coat hooks in oak.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=400&fit=crop' },
  ],
  'outdoor': [
    { name: 'Teak Garden Bench', price: 12999, mrp: 16999, stock: 5, description: '2-seater teak garden bench. Weather resistant.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Wooden Planter Box', price: 3999, mrp: 5499, stock: 15, description: 'Rectangular cedar planter box for herbs.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Outdoor Dining Set', price: 28999, mrp: 36000, stock: 3, description: '4-seater outdoor dining set in acacia.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Garden Arbor Arch', price: 15999, mrp: 20000, stock: 2, description: 'Wooden garden arbor for climbing plants.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Adirondack Chair', price: 8999, mrp: 11999, stock: 6, description: 'Classic Adirondack chair in weather-treated pine.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Hanging Plant Holder', price: 1999, mrp: 2999, stock: 20, description: 'Macrame and wood hanging plant holder.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Wooden Bird House', price: 1499, mrp: 2000, stock: 25, description: 'Charming bird house in cedar wood.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Lounge Chair Teak', price: 16999, mrp: 22000, stock: 4, description: 'Reclining teak lounge chair for patio.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Patio Umbrella Stand', price: 2499, mrp: 3499, stock: 10, description: 'Weighted wooden umbrella stand.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
    { name: 'Garden Pathway Lights (4)', price: 3499, mrp: 4999, stock: 12, description: 'Solar-powered wooden pathway light set.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop' },
  ],
  'office': [
    { name: 'Standing Desk Oak', price: 18999, mrp: 24000, stock: 5, description: 'Adjustable standing desk in solid oak.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'Executive Office Table', price: 22999, mrp: 29000, stock: 4, description: 'Large executive desk in walnut with drawers.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'L-Shape Office Desk', price: 16999, mrp: 22000, stock: 6, description: 'Corner L-shape desk in teak.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'Wooden Monitor Stand', price: 2999, mrp: 3999, stock: 20, description: 'Ergonomic monitor stand in oak.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'Bookcase Tall Oak', price: 14999, mrp: 19999, stock: 5, description: '6-tier tall bookcase in oak wood.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'Desk Organizer Set', price: 2499, mrp: 3499, stock: 25, description: 'Bamboo desk organizer with pen holder.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'Filing Cabinet Wood', price: 8999, mrp: 11999, stock: 7, description: '3-drawer filing cabinet in mango wood.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'Laptop Stand Bamboo', price: 1999, mrp: 2999, stock: 30, description: 'Adjustable laptop stand in bamboo.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'Conference Table', price: 34999, mrp: 44000, stock: 2, description: '10-seater conference table in sheesham.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
    { name: 'Floating Desk Walnut', price: 11999, mrp: 15999, stock: 6, description: 'Wall-mounted floating desk in walnut.', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
  ],
}

export default function SeedData() {
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState({ categories: 0, products: 0 })

  async function handleSeed() {
    setStatus('seeding')
    setProgress({ categories: 0, products: 0 })

    try {
      // Check if already seeded
      const existing = await getDocs(collection(db, 'categories'))
      if (existing.size > 0) {
        toast.error('Database already has categories. Delete them first if you want to re-seed.')
        setStatus('error')
        return
      }

      // Seed categories
      for (const cat of categories) {
        await addDoc(collection(db, 'categories'), cat)
        setProgress(p => ({ ...p, categories: p.categories + 1 }))
      }

      // Seed products
      for (const [catId, catProducts] of Object.entries(products)) {
        for (const prod of catProducts) {
          await addDoc(collection(db, 'products'), { ...prod, category: catId })
          setProgress(p => ({ ...p, products: p.products + 1 }))
        }
      }

      setStatus('done')
      toast.success('10 categories + 100 products seeded!')
    } catch (err) {
      console.error(err)
      setStatus('error')
      toast.error('Seeding failed: ' + err.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold gold-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Seed Database</h1>

      <div className="glass rounded-2xl p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Database size={24} className="text-gold" />
          <div>
            <h2 className="text-sm font-semibold text-text">Populate Database</h2>
            <p className="text-xs text-text-muted">Adds 10 categories and 100 products</p>
          </div>
        </div>

        {status === 'idle' && (
          <button onClick={handleSeed} className="btn-gold flex items-center gap-2">
            <Database size={16} /> Seed Database
          </button>
        )}

        {status === 'seeding' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-text">
              <Loader size={16} className="text-gold animate-spin" /> Seeding...
            </div>
            <div className="text-xs text-text-muted">
              Categories: {progress.categories}/{categories.length}
            </div>
            <div className="text-xs text-text-muted">
              Products: {progress.products}/100
            </div>
            <div className="w-full bg-dark-border rounded-full h-2">
              <div
                className="bg-gold h-2 rounded-full transition-all"
                style={{ width: `${((progress.categories + progress.products) / 110) * 100}%` }}
              />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="flex items-center gap-2 text-green-400">
            <Check size={16} /> Done! {progress.categories} categories + {progress.products} products added.
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-400 text-sm">Something went wrong. Check console.</div>
        )}
      </div>
    </div>
  )
}
