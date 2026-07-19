const express = require('express');
const router = express.Router();
const { findAll, findById, insertOne, updateOne, countAll, generateId } = require('../database');

function generateOrderNumber() {
  const date = new Date();
  const prefix = 'TW';
  const datePart = date.getFullYear().toString().slice(-2) + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${datePart}${random}`;
}

router.post('/place', async (req, res) => {
  try {
    const { name, email, phone, address, city, state, pincode, payment_method, notes } = req.body;
    const cart = req.session.cart;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const settingsArr = await findAll('site_settings');
    const settings = {};
    settingsArr.forEach(s => settings[s.key] = s.value);
    const freeShippingAbove = parseFloat(settings.free_shipping_above) || 1000;
    const shippingCost = subtotal >= freeShippingAbove ? 0 : parseFloat(settings.shipping_cost) || 0;
    const total = subtotal + shippingCost;
    const orderNumber = generateOrderNumber();

    const allOrders = await findAll('orders');
    const maxOrderId = allOrders.reduce((max, o) => Math.max(max, o.id || 0), 0);

    const order = {
      id: maxOrderId + 1,
      order_number: orderNumber,
      customer_id: req.session.customer ? req.session.customer.id : null,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_address: address,
      customer_city: city,
      customer_state: state,
      customer_pincode: pincode,
      subtotal,
      shipping_cost: shippingCost,
      total,
      payment_method: payment_method || 'cod',
      payment_status: 'pending',
      order_status: 'pending',
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await insertOne('orders', order);

    const allOrderItems = await findAll('order_items');
    let maxItemId = allOrderItems.reduce((max, i) => Math.max(max, i.id || 0), 0);

    for (const item of cart) {
      maxItemId++;
      await insertOne('order_items', {
        id: maxItemId,
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity
      });

      const product = await findById('products', item.product_id);
      if (product) {
        await updateOne('products', product.id, { stock: product.stock - item.quantity });
      }
    }

    req.session.cart = [];
    res.json({ success: true, order_number: orderNumber });
  } catch (err) {
    console.error('Order place error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

router.get('/track/:orderNumber', async (req, res) => {
  try {
    const allOrders = await findAll('orders');
    const order = allOrders.find(o => o.order_number === req.params.orderNumber);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const allItems = await findAll('order_items');
    const items = allItems.filter(i => i.order_id === order.id);
    res.json({ order, items });
  } catch (err) {
    console.error('Order track error:', err);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

module.exports = router;
