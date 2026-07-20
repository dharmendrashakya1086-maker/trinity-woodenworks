const express = require('express');
const router = express.Router();
const { findAll, findById, findByKey, countAll, getDB } = require('../database');

function requireCustomer(req, res, next) {
  if (req.session.customer) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

router.get('/', async (req, res) => {
  try {
    const { data: allCategories } = await findAll('categories');
    const { data: allProducts } = await findAll('products');
    const featuredCategories = allCategories.filter(c => Number(c.featured) === 1).map(c => ({
      ...c,
      product_count: allProducts.filter(p => p.category_id === c.id && p.status === 'active').length
    }));
    const activeProducts = allProducts.filter(p => p.status === 'active');
    const latest = activeProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4).map(p => ({
      ...p,
      category_name: p.category_id ? (allCategories.find(c => c.id === p.category_id) || {}).name : null
    }));
    const { total: orderCount } = await findAll('orders');
    const stats = { products: activeProducts.length, orders: orderCount };
    res.render('home', { featuredCategories, latest, categories: allCategories, stats });
  } catch (err) {
    console.error('Home page error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', customer: req.session.customer || null });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { data: allCategories } = await findAll('categories');
    const { data: allProducts } = await findAll('products');
    const categories = allCategories.map(c => ({
      ...c,
      product_count: allProducts.filter(p => p.category_id === c.id && p.status === 'active').length
    }));
    res.render('categories', { categories });
  } catch (err) {
    console.error('Categories page error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', customer: req.session.customer || null });
  }
});

router.get('/shop', async (req, res) => {
  try {
    const category = req.query.category || '';
    const search = req.query.search || '';
    const sort = req.query.sort || 'newest';
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    let { data: products } = await findAll('products');
    products = products.filter(p => p.status === 'active');

    if (category) {
      products = products.filter(p => p.category_id === parseInt(category));
    }
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(s) || (p.description && p.description.toLowerCase().includes(s)));
    }

    switch(sort) {
      case 'price_low': products.sort((a,b) => (a.sale_price || a.price) - (b.sale_price || b.price)); break;
      case 'price_high': products.sort((a,b) => (b.sale_price || b.price) - (a.sale_price || a.price)); break;
      case 'name': products.sort((a,b) => a.name.localeCompare(b.name)); break;
      default: products.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    }

    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const { data: allCategories } = await findAll('categories');
    const paged = products.slice(offset, offset + limit).map(p => ({
      ...p,
      category_name: p.category_id ? (allCategories.find(c => c.id === p.category_id) || {}).name : null
    }));
    const currentCategory = category ? allCategories.find(c => c.id === parseInt(category)) : null;

    res.render('shop', { products: paged, categories: allCategories, category, search, sort, page, totalPages, total, currentCategory });
  } catch (err) {
    console.error('Shop page error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', customer: req.session.customer || null });
  }
});

router.get('/product/:id', async (req, res) => {
  try {
    const product = await findById('products', parseInt(req.params.id));
    if (!product) return res.redirect('/shop');

    const { data: allCategories } = await findAll('categories');
    const cat = product.category_id ? allCategories.find(c => c.id === product.category_id) : null;
    product.category_name = cat ? cat.name : null;

    const { data: allImages } = await findAll('product_images');
    const images = allImages.filter(img => img.product_id === product.id);
    const { data: allProducts } = await findAll('products');
    const related = allProducts
      .filter(p => p.category_id === product.category_id && p.status === 'active' && p.id !== product.id)
      .slice(0, 4).map(p => ({
        ...p,
        category_name: p.category_id ? (allCategories.find(c => c.id === p.category_id) || {}).name : null
      }));

    res.render('product', { product, images, related });
  } catch (err) {
    console.error('Product page error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', customer: req.session.customer || null });
  }
});

router.get('/buy/:id', requireCustomer, async (req, res) => {
  try {
    const product = await findById('products', parseInt(req.params.id));
    if (!product || product.status !== 'active') return res.redirect('/shop');
    if (product.stock < 1) return res.redirect('/product/' + product.id);

    req.session.cart = [{
      product_id: product.id,
      name: product.name,
      price: product.sale_price || product.price,
      image: product.image,
      quantity: 1,
      stock: product.stock
    }];

    res.redirect('/checkout');
  } catch (err) {
    console.error('Buy page error:', err);
    res.redirect('/shop');
  }
});

router.get('/checkout', requireCustomer, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    if (cart.length === 0) return res.redirect('/cart');

    const { data: settingsArr } = await findAll('site_settings');
    const settings = {};
    settingsArr.forEach(s => settings[s.key] = s.value);

    const customer = await findById('customers', req.session.customer.id);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const freeShippingAbove = parseFloat(settings.free_shipping_above) || 1000;
    const shippingCost = subtotal >= freeShippingAbove ? 0 : parseFloat(settings.shipping_cost) || 0;
    const total = subtotal + shippingCost;

    res.render('checkout', { cart, subtotal, shippingCost, total, settings, customer });
  } catch (err) {
    console.error('Checkout page error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', customer: req.session.customer || null });
  }
});

router.get('/cart', async (req, res) => {
  try {
    const cart = req.session.cart || [];
    const { data: settingsArr } = await findAll('site_settings');
    const settings = {};
    settingsArr.forEach(s => settings[s.key] = s.value);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const freeShippingAbove = parseFloat(settings.free_shipping_above) || 1000;
    const shippingCost = subtotal >= freeShippingAbove ? 0 : parseFloat(settings.shipping_cost) || 0;

    res.render('cart', { cart, subtotal, shippingCost });
  } catch (err) {
    console.error('Cart page error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', customer: req.session.customer || null });
  }
});

router.get('/order-confirmation/:orderNumber', async (req, res) => {
  try {
    const { data: allOrders } = await findAll('orders');
    const order = allOrders.find(o => o.order_number === req.params.orderNumber);
    if (!order) return res.redirect('/');
    res.render('order-confirmation', { order });
  } catch (err) {
    console.error('Order confirmation error:', err);
    res.redirect('/');
  }
});

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/contact', (req, res) => {
  res.render('contact');
});

router.get('/custom-order', (req, res) => {
  res.render('custom-order');
});

router.get('/track-order', async (req, res) => {
  try {
    let myOrders = [];
    if (req.session.customer) {
      const { data: allOrders } = await findAll('orders');
      myOrders = allOrders
        .filter(o => o.customer_id === req.session.customer.id || o.customer_email === req.session.customer.email)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
    }
    res.render('track-order', { order: null, myOrders, searched: false });
  } catch (err) {
    console.error('Track order error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', customer: req.session.customer || null });
  }
});

router.post('/track-order', async (req, res) => {
  try {
    const { data: allOrders } = await findAll('orders');
    const order = allOrders.find(o => o.order_number === req.body.order_number) || null;
    let myOrders = [];
    if (req.session.customer) {
      myOrders = allOrders
        .filter(o => o.customer_id === req.session.customer.id || o.customer_email === req.session.customer.email)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
    }
    res.render('track-order', { order, myOrders, searched: true });
  } catch (err) {
    console.error('Track order search error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Something went wrong', customer: req.session.customer || null });
  }
});

module.exports = router;
