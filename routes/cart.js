const express = require('express');
const router = express.Router();
const { findById } = require('../database');

function requireCustomer(req, res, next) {
  if (req.session.customer) return next();
  return res.status(401).json({ error: 'login_required', message: 'Please login to continue' });
}

router.post('/add', requireCustomer, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const product = await findById('products', parseInt(product_id));

    if (!product || product.status !== 'active') return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    if (!req.session.cart) req.session.cart = [];

    const existingIndex = req.session.cart.findIndex(item => item.product_id == product_id);
    if (existingIndex > -1) {
      req.session.cart[existingIndex].quantity += parseInt(quantity);
    } else {
      req.session.cart.push({
        product_id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image: product.image,
        quantity: parseInt(quantity),
        stock: product.stock
      });
    }

    res.json({ success: true, cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0) });
  } catch (err) {
    console.error('Cart add error:', err);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.post('/update', requireCustomer, (req, res) => {
  const { product_id, quantity } = req.body;
  if (!req.session.cart) return res.status(400).json({ error: 'Cart is empty' });

  const index = req.session.cart.findIndex(item => item.product_id == product_id);
  if (index > -1) {
    if (parseInt(quantity) <= 0) {
      req.session.cart.splice(index, 1);
    } else {
      req.session.cart[index].quantity = parseInt(quantity);
    }
  }

  res.json({ success: true, cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0) });
});

router.post('/remove', requireCustomer, (req, res) => {
  const { product_id } = req.body;
  if (!req.session.cart) return res.status(400).json({ error: 'Cart is empty' });

  req.session.cart = req.session.cart.filter(item => item.product_id != product_id);
  res.json({ success: true, cartCount: req.session.cart.reduce((sum, item) => sum + item.quantity, 0) });
});

router.get('/count', (req, res) => {
  const count = req.session.cart ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
  res.json({ count });
});

module.exports = router;
