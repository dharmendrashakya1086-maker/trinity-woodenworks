const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { getDB, insertOne, updateOne, removeOne, findAll, findById, findByKey, countAll, sumField, generateId } = require('../database');
const { sendOrderMessageEmail } = require('../services/email');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { const types = /jpeg|jpg|png|gif|webp/; cb(null, types.test(path.extname(file.originalname).toLowerCase())); } });

function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    res.locals.adminUser = req.session.admin;
    return next();
  }
  res.redirect('/admin/login');
}

// Root redirect to login
router.get('/', (req, res) => {
  res.redirect('/admin/login');
});

// Login
router.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/admin/dashboard');
  res.render('admin/login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const admin = await findByKey('admin', { username });

  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.render('admin/login', { error: 'Invalid credentials' });
  }

  req.session.admin = { id: admin.id, name: admin.name, username: admin.username };
  res.redirect('/admin/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
  const [totalProducts, activeProducts, totalOrders, pendingOrders, totalRevenue, lowStockProductsAll, allOrders, allProducts] = await Promise.all([
    countAll('products'),
    countAll('products', { status: 'active' }),
    countAll('orders'),
    countAll('orders', { order_status: 'pending' }),
    sumField('orders', 'total', { payment_status: 'paid' }),
    findAll('products', { status: 'active' }, { stock: 'asc' }),
    findAll('orders', {}, { created_at: 'desc' }),
    findAll('products', {}, { created_at: 'desc' })
  ]);

  const now = new Date();
  const todayStr = now.toDateString();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const todayOrders = allOrders.data.filter(o => new Date(o.created_at).toDateString() === todayStr).length;

  const monthlyRevenue = allOrders.data
    .filter(o => {
      const d = new Date(o.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.payment_status === 'paid';
    })
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const lowStock = lowStockProductsAll.data.filter(p => p.stock <= 5).length;

  const stats = {
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue || 0,
    lowStock,
    todayOrders,
    monthlyRevenue: monthlyRevenue || 0
  };

  const recentOrders = allOrders.data.slice(0, 5);

  const lowStockList = lowStockProductsAll.data.slice(0, 5);
  const categories = (await findAll('categories')).data;
  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c.name; });
  const lowStockProducts = lowStockList.map(p => ({
    ...p,
    category_name: p.category_id ? catMap[p.category_id] || null : null
  }));

  res.render('admin/dashboard', { stats, recentOrders, lowStockProducts });
});

// Products
router.get('/products', requireAdmin, async (req, res) => {
  const { data: products } = await findAll('products', {}, { created_at: 'desc' });
  const { data: categories } = await findAll('categories');
  const catMap = {};
  categories.forEach(c => { catMap[c.id] = c.name; });
  const enriched = products.map(p => ({
    ...p,
    category_name: p.category_id ? catMap[p.category_id] || null : null
  }));
  res.render('admin/products', { products: enriched });
});

router.get('/products/add', requireAdmin, async (req, res) => {
  const { data: categories } = await findAll('categories');
  res.render('admin/product-form', { product: null, categories });
});

router.post('/products/add', requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), async (req, res) => {
  const { name, description, mrp, discount_percent, price, category_id, stock, featured } = req.body;
  const image = req.files && req.files.image ? req.files.image[0].filename : null;

  const mrpVal = parseFloat(mrp) || 0;
  const discVal = parseFloat(discount_percent) || 0;
  const salePrice = mrpVal > 0 ? Math.round(mrpVal * (1 - discVal / 100)) : 0;

  const product = {
    name,
    description,
    mrp: mrpVal,
    discount_percent: discVal,
    price: salePrice,
    sale_price: salePrice,
    category_id: category_id ? parseInt(category_id) : null,
    stock: parseInt(stock) || 0,
    image,
    featured: featured ? 1 : 0,
    status: 'active'
  };

  const inserted = await insertOne('products', product);

  if (req.files && req.files.gallery) {
    for (let i = 0; i < req.files.gallery.length; i++) {
      const f = req.files.gallery[i];
      await insertOne('product_images', {
        product_id: inserted.id,
        image: f.filename,
        is_primary: i === 0 ? 1 : 0
      });
    }
  }

  res.redirect('/admin/products');
});

router.get('/products/edit/:id', requireAdmin, async (req, res) => {
  const product = await findById('products', parseInt(req.params.id));
  const { data: categories } = await findAll('categories');
  const { data: images } = await findAll('product_images', { product_id: parseInt(req.params.id) });
  res.render('admin/product-form', { product, categories, images });
});

router.post('/products/edit/:id', requireAdmin, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), async (req, res) => {
  const { name, description, mrp, discount_percent, price, category_id, stock, featured, status, remove_image } = req.body;
  let image = req.body.existing_image;

  const mrpVal = parseFloat(mrp) || 0;
  const discVal = parseFloat(discount_percent) || 0;
  const salePrice = mrpVal > 0 ? Math.round(mrpVal * (1 - discVal / 100)) : 0;

  if (remove_image === '1') {
    image = null;
  }
  if (req.files && req.files.image) {
    image = req.files.image[0].filename;
  }

  await updateOne('products', { id: parseInt(req.params.id) }, {
    name,
    description,
    mrp: mrpVal,
    discount_percent: discVal,
    price: salePrice,
    sale_price: salePrice,
    category_id: category_id ? parseInt(category_id) : null,
    stock: parseInt(stock) || 0,
    image,
    featured: featured ? 1 : 0,
    status: status || 'active'
  });

  if (req.files && req.files.gallery) {
    for (let i = 0; i < req.files.gallery.length; i++) {
      const f = req.files.gallery[i];
      await insertOne('product_images', {
        product_id: parseInt(req.params.id),
        image: f.filename,
        is_primary: 0
      });
    }
  }

  res.redirect('/admin/products');
});

router.post('/products/delete/:id', requireAdmin, async (req, res) => {
  await removeOne('product_images', { product_id: parseInt(req.params.id) });
  await removeOne('products', { id: parseInt(req.params.id) });
  res.redirect('/admin/products');
});

router.post('/products/delete-image/:id', requireAdmin, async (req, res) => {
  const img = await findById('product_images', parseInt(req.params.id));
  if (img) {
    const filePath = path.join(__dirname, '..', 'uploads', img.image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await removeOne('product_images', { id: parseInt(req.params.id) });
  }
  res.redirect('back');
});

// Categories
router.get('/categories', requireAdmin, async (req, res) => {
  const { data: categories } = await findAll('categories');
  const enriched = [];
  for (const c of categories) {
    const productCount = await countAll('products', { category_id: c.id });
    enriched.push({ ...c, product_count: productCount });
  }
  res.render('admin/categories', { categories: enriched });
});

router.post('/categories/add', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, featured } = req.body;
  const image = req.file ? req.file.filename : null;
  await insertOne('categories', {
    name,
    description: description || '',
    image,
    featured: featured ? 1 : 0
  });
  res.redirect('/admin/categories');
});

router.post('/categories/edit/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, existing_image, featured } = req.body;
  let image = existing_image || null;
  if (req.file) {
    image = req.file.filename;
  }
  await updateOne('categories', { id: parseInt(req.params.id) }, { name, description, image, featured: featured ? 1 : 0 });
  res.redirect('/admin/categories');
});

router.post('/categories/toggle-featured/:id', requireAdmin, async (req, res) => {
  const cat = await findById('categories', parseInt(req.params.id));
  if (cat) {
    await updateOne('categories', { id: parseInt(req.params.id) }, { featured: cat.featured ? 0 : 1 });
  }
  res.redirect('/admin/categories');
});

router.post('/categories/delete/:id', requireAdmin, async (req, res) => {
  const { data: productsInCat } = await findAll('products', { category_id: parseInt(req.params.id) });
  for (const p of productsInCat) {
    await updateOne('products', { id: p.id }, { category_id: null });
  }
  await removeOne('categories', { id: parseInt(req.params.id) });
  res.redirect('/admin/categories');
});

// Orders
router.get('/orders', requireAdmin, async (req, res) => {
  const status = req.query.status || '';
  const filter = status ? { order_status: status } : {};
  const { data: orders } = await findAll('orders', filter, { created_at: 'desc' });
  res.render('admin/orders', { orders, status });
});

router.get('/orders/:id', requireAdmin, async (req, res) => {
  const order = await findById('orders', parseInt(req.params.id));
  if (!order) return res.redirect('/admin/orders');
  const { data: items } = await findAll('order_items', { order_id: order.id });
  const { data: sentMessages } = await findAll('messages', { order_id: order.id }, { created_at: 'desc' });
  res.render('admin/order-detail', { order, items, sentMessages });
});

router.post('/orders/:id/status', requireAdmin, async (req, res) => {
  const { order_status, payment_status } = req.body;
  await updateOne('orders', { id: parseInt(req.params.id) }, {
    order_status,
    payment_status
  });
  res.redirect('/admin/orders/' + req.params.id);
});

router.post('/orders/:id/message', requireAdmin, async (req, res) => {
  const { subject, message } = req.body;
  const order = await findById('orders', parseInt(req.params.id));
  if (!order) return res.redirect('/admin/orders');

  await insertOne('messages', {
    order_id: order.id,
    order_number: order.order_number,
    customer_id: order.customer_id || null,
    customer_email: order.customer_email,
    customer_name: order.customer_name,
    subject: subject.trim(),
    message: message.trim(),
    read: false
  });

  try {
    await sendOrderMessageEmail(order.customer_email, order.customer_name, subject.trim(), message.trim(), order.order_number);
  } catch (err) {
    console.error('Failed to send message email:', err);
  }

  res.redirect('/admin/orders/' + req.params.id);
});

router.post('/orders/:id/delete', requireAdmin, async (req, res) => {
  await removeOne('order_items', { order_id: parseInt(req.params.id) });
  await removeOne('orders', { id: parseInt(req.params.id) });
  res.redirect('/admin/orders');
});

// Settings
router.get('/settings', requireAdmin, async (req, res) => {
  const { data: settingsList } = await findAll('site_settings');
  const settings = {};
  settingsList.forEach(s => { settings[s.key] = s.value; });
  res.render('admin/settings', { settings });
});

router.post('/settings', requireAdmin, async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    const existing = await findByKey('site_settings', { key });
    if (existing) {
      await updateOne('site_settings', { key }, { value });
    } else {
      await insertOne('site_settings', { key, value });
    }
  }
  res.redirect('/admin/settings');
});

// Change password
router.post('/change-password', requireAdmin, async (req, res) => {
  const { current_password, new_password } = req.body;
  const admin = await findByKey('admin', { id: req.session.admin.id });

  if (!bcrypt.compareSync(current_password, admin.password)) {
    return res.redirect('/admin/settings?error=wrong_password');
  }

  const hash = bcrypt.hashSync(new_password, 10);
  await updateOne('admin', { id: req.session.admin.id }, { password: hash });
  res.redirect('/admin/settings?success=password_changed');
});

module.exports = router;
