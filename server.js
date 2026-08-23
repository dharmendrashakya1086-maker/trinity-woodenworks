/*
 * =====================================================
 * TRINITY WOODENWORKS — Main Server File
 * =====================================================
 * This is the entry point of the application.
 * It sets up Express, connects to database, and
 * defines all routes (URLs) the website responds to.
 * =====================================================
 */

// Load environment variables from .env file (like passwords, ports)
require('dotenv').config();

// Import Express framework (makes building web servers easy)
const express = require('express');

// Import session middleware (keeps user logged in across pages)
const session = require('express-session');

// Import path module (helps work with file/folder paths)
const path = require('path');

// Import database connection function
const { connectDB, getDB } = require('./database');

// Import file system module (read/write files)
const fs = require('fs');

// Create Express app instance
const app = express();

// Server port — uses .env value or defaults to 3000
const PORT = process.env.PORT || 3000;

// =====================================================
// DATABASE CONNECTION
// =====================================================
// connectDB() connects to MongoDB Atlas (cloud database)
// .then() runs if connection succeeds
// .catch() runs if connection fails
connectDB().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Database init error:', err);
});

// =====================================================
// MIDDLEWARE (code that runs before every request)
// =====================================================

// Set EJS as the template engine (lets us use .ejs files for HTML)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images) from /public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'images')));

// Parse form data (when user submits a form)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// =====================================================
// SESSION (keeps user logged in)
// =====================================================
app.use(session({
  secret: process.env.SESSION_SECRET || 'trinity-woodenworks-fallback-secret',
  resave: false,              // Don't save session if nothing changed
  saveUninitialized: false,   // Don't create session until something is stored
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,  // Session expires after 24 hours
    secure: false,                  // Set true if using HTTPS
    httpOnly: true                  // Prevents JavaScript from accessing cookie
  }
}));

// =====================================================
// GLOBAL VARIABLES (available in all EJS templates)
// =====================================================
// This middleware runs before every request and sets
// variables that all pages can access
app.use((req, res, next) => {
  // Cart item count (for header badge)
  res.locals.cartCount = req.session.cart 
    ? req.session.cart.reduce((sum, item) => sum + item.quantity, 0) 
    : 0;
  
  // Is current user an admin?
  res.locals.isAdmin = req.session.admin ? true : false;
  
  // Current page path (for active menu highlighting)
  res.locals.currentPath = req.path;
  
  // Logged-in customer info (or null if not logged in)
  res.locals.customer = req.session.customer || null;
  
  next(); // Continue to next middleware/route
});

// =====================================================
// ROUTES (URL patterns the server responds to)
// =====================================================

// Page routes (home, shop, product, about, contact, etc.)
app.use('/', require('./routes/pages'));

// Customer routes (login, signup, account, logout)
app.use('/', require('./routes/customers'));

// Cart routes (add, remove, update, view cart)
app.use('/api/cart', require('./routes/cart'));

// Order routes (checkout, order history, order confirmation)
app.use('/api/orders', require('./routes/orders'));

// Admin routes (admin dashboard, manage products/orders)
app.use('/admin', require('./routes/admin'));

// =====================================================
// API ROUTES (for AJAX requests from JavaScript)
// =====================================================

// Health check endpoint (for monitoring)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Newsletter subscription
app.post('/api/newsletter', async (req, res) => {
  var email = (req.body.email || '').trim();
  
  // Validate email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.json({ success: false, error: 'Valid email required' });
  }
  
  try {
    var db = getDB();
    if (db) {
      await db.collection('newsletter').insertOne({ 
        email: email, 
        subscribed_at: new Date() 
      });
    }
  } catch(e) {} // Silently handle errors
  
  res.json({ success: true });
});

// Custom order submission
app.post('/api/custom-order', async (req, res) => {
  var b = req.body;
  var name = (b.name || '').trim();
  var email = (b.email || '').trim();
  var phone = (b.phone || '').trim();
  var category = (b.category || '').trim();
  var description = (b.description || '').trim();
  
  // All required fields must be filled
  if (!name || !email || !phone || !category || !description) {
    return res.json({ success: false, error: 'All required fields must be filled' });
  }
  
  // Must be logged in to submit custom order
  if (!req.session || !req.session.customer) {
    return res.json({ 
      success: false, 
      needLogin: true, 
      error: 'Please sign in or sign up to submit your custom order' 
    });
  }
  
  try {
    var db = getDB();
    if (db) {
      await db.collection('custom_orders').insertOne({
        name, email, phone, category,
        wood: b.wood || '',
        budget: b.budget || '',
        dimensions: b.dimensions || '',
        description,
        customer_id: req.session.customer.id || null,
        status: 'new',
        created_at: new Date()
      });
    }
  } catch(e) {}
  
  res.json({ success: true });
});

// Check if user is logged in (used by JavaScript)
app.post('/api/check-auth', (req, res) => {
  res.json({ loggedIn: !!(req.session && req.session.customer) });
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  var b = req.body;
  var name = (b.name || '').trim();
  var email = (b.email || '').trim();
  var subject = (b.subject || '').trim();
  var message = (b.message || '').trim();
  
  if (!name || !email || !subject || !message) {
    return res.json({ success: false, error: 'All required fields must be filled' });
  }
  
  try {
    var db = getDB();
    if (db) {
      await db.collection('contact_messages').insertOne({
        name, email, phone: b.phone || '',
        subject, message,
        created_at: new Date(),
        read: false
      });
    }
  } catch(e) {}
  
  res.json({ success: true });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 — Page not found (catches all unmatched routes)
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// 500 — Server error (catches all errors)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).render('error', { title: 'Error', error: err.message });
});

// =====================================================
// START SERVER
// =====================================================
// Listen for incoming requests on the specified port
// '0.0.0.0' means accept connections from any IP (needed for deployment)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Trinity Woodenworks running at http://localhost:${PORT}`);
});
