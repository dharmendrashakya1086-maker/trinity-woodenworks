const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME || 'trinity_woodenworks';

let client = null;
let database = null;

async function connectDB() {
  if (database) return database;
  if (!MONGO_URI) {
    console.error('MONGO_URI not set! Falling back to lowdb.');
    return initLowdb();
  }
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    database = client.db(DB_NAME);
    console.log('Connected to MongoDB Atlas');
    await seedMongoDB(database);
    return database;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.log('Falling back to lowdb.');
    return initLowdb();
  }
}

function getDB() {
  return database;
}

function getCollection(name) {
  if (database && database.collection) {
    return database.collection(name);
  }
  // lowdb fallback
  if (lowdb) return lowdb.get(name);
  return null;
}

// ============================================================
// LOWDB FALLBACK (if MongoDB not configured)
// ============================================================
let lowdb = null;
let lowdbAdapter = null;

function initLowdb() {
  const low = require('lowdb');
  const FileSync = require('lowdb/adapters/FileSync');
  const path = require('path');
  const fs = require('fs');

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  lowdbAdapter = new FileSync(path.join(dataDir, 'db.json'));
  lowdb = low(lowdbAdapter);
  lowdb.defaults({
    admin: [], customers: [], categories: [], products: [],
    product_images: [], orders: [], order_items: [],
    site_settings: [], messages: []
  }).write();

  database = lowdb;
  seedLowdb(lowdb);
  return lowdb;
}

// ============================================================
// SEED FUNCTIONS
// ============================================================
async function seedMongoDB(db) {
  const collections = ['admin', 'customers', 'categories', 'products', 'orders', 'order_items', 'site_settings', 'messages'];
  for (const col of collections) {
    const count = await db.collection(col).countDocuments();
    if (col === 'admin' && count === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      await db.collection('admin').insertOne({ id: 1, username: 'admin', password: hash, name: 'Trinity Admin', created_at: new Date().toISOString() });
    }
    if (col === 'categories' && count === 0) {
      await db.collection('categories').insertMany([
        { id: 1, name: 'Wooden Decor', description: 'Beautiful handcrafted wooden decorative items for your home', image: 'categories/cat-decor.jpg', icon: 'fa-snowflake', featured: 1, created_at: new Date().toISOString() },
        { id: 2, name: 'Furniture', description: 'Premium handcrafted wooden furniture pieces', image: 'categories/cat-furniture.jpg', icon: 'fa-couch', featured: 1, created_at: new Date().toISOString() },
        { id: 3, name: 'Kitchen & Dining', description: 'Wooden kitchen accessories and dining items', image: 'categories/cat-kitchen.jpg', icon: 'fa-utensils', featured: 0, created_at: new Date().toISOString() },
        { id: 4, name: 'Gifting', description: 'Perfect wooden gift items for your loved ones', image: 'categories/cat-gifting.jpg', icon: 'fa-gift', featured: 1, created_at: new Date().toISOString() },
        { id: 5, name: 'Custom Orders', description: 'Customized wooden items made to your specifications', image: 'categories/cat-custom.jpg', icon: 'fa-pencil-ruler', featured: 0, created_at: new Date().toISOString() }
      ]);
    }
    if (col === 'products' && count === 0) {
      await db.collection('products').insertMany([
        { id: 1, name: 'Wooden Flower Vase', category_id: 1, description: 'Hand-carved wooden vase with intricate floral patterns.', price: 1299, mrp: 1599, discount_percent: 19, sale_price: 1299, stock: 25, image: 'products/prod-vase.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
        { id: 2, name: 'Carved Wooden Wall Panel', category_id: 1, description: 'Elegant wall panel with traditional Indian motifs.', price: 2499, mrp: 2999, discount_percent: 17, sale_price: 2499, stock: 15, image: 'products/prod-panel.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
        { id: 3, name: 'Wooden Chess Board', category_id: 1, description: 'Premium handcrafted chess board with carved wooden pieces.', price: 1899, mrp: 2299, discount_percent: 17, sale_price: 1899, stock: 20, image: 'products/prod-chess.jpg', status: 'active', featured: 0, created_at: new Date().toISOString() },
        { id: 4, name: 'Rustic Wooden Bookshelf', category_id: 2, description: '5-tier open bookshelf made from solid Sheesham wood.', price: 8999, mrp: 11999, discount_percent: 25, sale_price: 8999, stock: 8, image: 'products/prod-bookshelf.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
        { id: 5, name: 'Wooden Coffee Table', category_id: 2, description: 'Live-edge wooden coffee table with sturdy legs.', price: 6499, mrp: 7999, discount_percent: 19, sale_price: 6499, stock: 10, image: 'products/prod-table.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
        { id: 6, name: 'Wooden Dining Set (4 Seater)', category_id: 2, description: 'Complete dining set with table and 4 chairs.', price: 15999, mrp: 19999, discount_percent: 20, sale_price: 15999, stock: 5, image: 'products/prod-dining.jpg', status: 'active', featured: 0, created_at: new Date().toISOString() },
        { id: 7, name: 'Wooden Cutting Board', category_id: 3, description: 'Thick wooden cutting board from organic teak.', price: 599, mrp: 799, discount_percent: 25, sale_price: 599, stock: 50, image: 'products/prod-board.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
        { id: 8, name: 'Wooden Spice Box', category_id: 3, description: 'Traditional wooden spice box with 7 compartments.', price: 899, mrp: 1199, discount_percent: 25, sale_price: 899, stock: 30, image: 'products/prod-spice.jpg', status: 'active', featured: 0, created_at: new Date().toISOString() },
        { id: 9, name: 'Personalized Wooden Nameplate', category_id: 5, description: 'Custom carved wooden nameplate for your home.', price: 1499, mrp: 1999, discount_percent: 25, sale_price: 1499, stock: 99, image: 'products/prod-nameplate.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
        { id: 10, name: 'Wooden Photo Frame Set', category_id: 4, description: 'Set of 3 handcrafted wooden photo frames.', price: 999, mrp: 1299, discount_percent: 23, sale_price: 999, stock: 40, image: 'products/prod-frames.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
        { id: 11, name: 'Wooden Pen Stand', category_id: 4, description: 'Handcrafted wooden pen stand with carved design.', price: 449, mrp: 599, discount_percent: 25, sale_price: 449, stock: 60, image: 'products/prod-penstand.jpg', status: 'active', featured: 0, created_at: new Date().toISOString() },
        { id: 12, name: 'Carved Wooden Elephant', category_id: 1, description: 'Hand-carved wooden elephant statue.', price: 1799, mrp: 2199, discount_percent: 18, sale_price: 1799, stock: 12, image: 'products/prod-elephant.jpg', status: 'active', featured: 0, created_at: new Date().toISOString() }
      ]);
    }
    if (col === 'site_settings' && count === 0) {
      await db.collection('site_settings').insertMany([
        { key: 'site_name', value: 'Trinity Woodenworks' },
        { key: 'tagline', value: 'Crafted with Passion, Built to Last' },
        { key: 'phone', value: '+91 98765 43210' },
        { key: 'email', value: 'info@trinitywoodenworks.com' },
        { key: 'address', value: 'Jaipur, Rajasthan, India' },
        { key: 'shipping_cost', value: '0' },
        { key: 'free_shipping_above', value: '1000' }
      ]);
    }
  }
}

function seedLowdb(db) {
  const adminCount = db.get('admin').size().value();
  if (adminCount === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.get('admin').push({ id: 1, username: 'admin', password: hash, name: 'Trinity Admin', created_at: new Date().toISOString() }).write();
  }
  const catCount = db.get('categories').size().value();
  if (catCount === 0) {
    db.get('categories').push(
      { id: 1, name: 'Wooden Decor', description: 'Beautiful handcrafted wooden decorative items', image: 'categories/cat-decor.jpg', icon: 'fa-snowflake', featured: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'Furniture', description: 'Premium handcrafted wooden furniture pieces', image: 'categories/cat-furniture.jpg', icon: 'fa-couch', featured: 1, created_at: new Date().toISOString() },
      { id: 3, name: 'Kitchen & Dining', description: 'Wooden kitchen accessories and dining items', image: 'categories/cat-kitchen.jpg', icon: 'fa-utensils', featured: 0, created_at: new Date().toISOString() },
      { id: 4, name: 'Gifting', description: 'Perfect wooden gift items for your loved ones', image: 'categories/cat-gifting.jpg', icon: 'fa-gift', featured: 1, created_at: new Date().toISOString() },
      { id: 5, name: 'Custom Orders', description: 'Customized wooden items made to your specifications', image: 'categories/cat-custom.jpg', icon: 'fa-pencil-ruler', featured: 0, created_at: new Date().toISOString() }
    ).write();
  }
  const prodCount = db.get('products').size().value();
  if (prodCount === 0) {
    db.get('products').push(
      { id: 1, name: 'Wooden Flower Vase', category_id: 1, description: 'Hand-carved wooden vase.', price: 1299, mrp: 1599, discount_percent: 19, sale_price: 1299, stock: 25, image: 'products/prod-vase.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
      { id: 2, name: 'Carved Wooden Wall Panel', category_id: 1, description: 'Elegant wall panel.', price: 2499, mrp: 2999, discount_percent: 17, sale_price: 2499, stock: 15, image: 'products/prod-panel.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
      { id: 3, name: 'Wooden Chess Board', category_id: 1, description: 'Premium chess board.', price: 1899, mrp: 2299, discount_percent: 17, sale_price: 1899, stock: 20, image: 'products/prod-chess.jpg', status: 'active', featured: 0, created_at: new Date().toISOString() },
      { id: 4, name: 'Rustic Wooden Bookshelf', category_id: 2, description: '5-tier bookshelf.', price: 8999, mrp: 11999, discount_percent: 25, sale_price: 8999, stock: 8, image: 'products/prod-bookshelf.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
      { id: 5, name: 'Wooden Coffee Table', category_id: 2, description: 'Live-edge coffee table.', price: 6499, mrp: 7999, discount_percent: 19, sale_price: 6499, stock: 10, image: 'products/prod-table.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
      { id: 6, name: 'Wooden Cutting Board', category_id: 3, description: 'Teak cutting board.', price: 599, mrp: 799, discount_percent: 25, sale_price: 599, stock: 50, image: 'products/prod-board.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
      { id: 7, name: 'Personalized Nameplate', category_id: 5, description: 'Custom nameplate.', price: 1499, mrp: 1999, discount_percent: 25, sale_price: 1499, stock: 99, image: 'products/prod-nameplate.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() },
      { id: 8, name: 'Wooden Photo Frame Set', category_id: 4, description: '3 photo frames.', price: 999, mrp: 1299, discount_percent: 23, sale_price: 999, stock: 40, image: 'products/prod-frames.jpg', status: 'active', featured: 1, created_at: new Date().toISOString() }
    ).write();
  }
  const settingsCount = db.get('site_settings').size().value();
  if (settingsCount === 0) {
    db.get('site_settings').push(
      { key: 'site_name', value: 'Trinity Woodenworks' },
      { key: 'tagline', value: 'Crafted with Passion, Built to Last' },
      { key: 'phone', value: '+91 98765 43210' },
      { key: 'email', value: 'info@trinitywoodenworks.com' },
      { key: 'address', value: 'Jaipur, Rajasthan, India' },
      { key: 'shipping_cost', value: '0' },
      { key: 'free_shipping_above', value: '1000' }
    ).write();
  }
}

// ============================================================
// HELPER FUNCTIONS (work with both MongoDB and lowdb)
// ============================================================
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Convert filter to MongoDB query
function toMongoQuery(filter) {
  const query = {};
  for (const [key, val] of Object.entries(filter)) {
    if (val === undefined || val === '' || val === null) continue;
    if (typeof val === 'object' && val.$like) {
      query[key] = { $regex: val.$like, $options: 'i' };
    } else if (typeof val === 'object' && val.$ne) {
      query[key] = { $ne: val.$ne };
    } else {
      query[key] = val;
    }
  }
  return query;
}

async function findAll(collection, filter = {}, sort = null, limit = null, offset = 0) {
  // lowdb fallback
  if (lowdb) {
    let results = lowdb.get(collection);
    if (filter) {
      Object.keys(filter).forEach(key => {
        if (filter[key] !== undefined && filter[key] !== '' && filter[key] !== null) {
          results = results.filter(item => {
            if (typeof filter[key] === 'object' && filter[key].$like) return String(item[key]).toLowerCase().includes(filter[key].$like.toLowerCase());
            if (typeof filter[key] === 'object' && filter[key].$ne) return item[key] !== filter[key].$ne;
            return item[key] == filter[key];
          });
        }
      });
    }
    let arr = results.value();
    if (sort) {
      const key = Object.keys(sort)[0];
      const dir = sort[key];
      arr.sort((a, b) => { if (a[key] < b[key]) return dir === 'asc' ? -1 : 1; if (a[key] > b[key]) return dir === 'asc' ? 1 : -1; return 0; });
    }
    const total = arr.length;
    if (offset) arr = arr.slice(offset);
    if (limit) arr = arr.slice(0, limit);
    return { data: arr, total };
  }

  // MongoDB
  const col = database.collection(collection);
  const query = toMongoQuery(filter);
  const total = await col.countDocuments(query);
  let cursor = col.find(query);
  if (sort) {
    const key = Object.keys(sort)[0];
    const dir = sort[key] === 'asc' ? 1 : -1;
    cursor = cursor.sort({ [key]: dir });
  }
  if (offset) cursor = cursor.skip(offset);
  if (limit) cursor = cursor.limit(limit);
  const data = await cursor.toArray();
  return { data, total };
}

async function findById(collection, id) {
  if (lowdb) return lowdb.get(collection).find({ id: parseInt(id) || id }).value();
  const col = database.collection(collection);
  const numId = parseInt(id);
  if (!isNaN(numId)) return await col.findOne({ id: numId });
  return await col.findOne({ _id: new ObjectId(id) });
}

async function findByKey(collection, keyObj) {
  if (lowdb) return lowdb.get(collection).find(keyObj).value();
  const col = database.collection(collection);
  return await col.findOne(keyObj);
}

async function insertOne(collection, data) {
  if (lowdb) {
    const maxId = lowdb.get(collection).map('id').max().value() || 0;
    const item = { id: maxId + 1, ...data, created_at: new Date().toISOString() };
    lowdb.get(collection).push(item).write();
    return item;
  }
  const col = database.collection(collection);
  const maxDoc = await col.find().sort({ id: -1 }).limit(1).toArray();
  const maxId = maxDoc.length > 0 ? (maxDoc[0].id || 0) : 0;
  const item = { id: maxId + 1, ...data, created_at: new Date().toISOString() };
  const result = await col.insertOne(item);
  return { ...item, _id: result.insertedId };
}

async function updateOne(collection, keyObj, data) {
  if (lowdb) {
    lowdb.get(collection).find(keyObj).assign(data, { updated_at: new Date().toISOString() }).write();
    return;
  }
  const col = database.collection(collection);
  await col.updateOne(keyObj, { $set: { ...data, updated_at: new Date().toISOString() } });
}

async function removeOne(collection, keyObj) {
  if (lowdb) {
    lowdb.get(collection).remove(keyObj).write();
    return;
  }
  const col = database.collection(collection);
  await col.deleteMany(keyObj);
}

async function countAll(collection, filter = {}) {
  const result = await findAll(collection, filter);
  return result.total;
}

async function sumField(collection, field, filter = {}) {
  if (lowdb) return lowdb.get(collection).filter(filter).sumBy(field).value();
  const col = database.collection(collection);
  const query = toMongoQuery(filter);
  const result = await col.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: `$${field}` } } }
  ]).toArray();
  return result.length > 0 ? result[0].total : 0;
}

module.exports = { connectDB, getDB, findAll, findById, findByKey, insertOne, updateOne, removeOne, countAll, sumField, generateId };
