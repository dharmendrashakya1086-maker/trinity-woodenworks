# Trinity Woodenworks

Premium handcrafted wooden items e-commerce website.

## What is this project?

This is a full-stack e-commerce website for selling wooden products. It's built with:
- **Node.js + Express** — Backend (server)
- **EJS** — HTML templates
- **MongoDB / lowdb** — Database
- **Vanilla JS + GSAP** — Frontend animations

## Features
- Dark premium theme with gold accents
- Product catalog with categories
- Shopping cart & checkout
- Admin panel with product/category management
- Order tracking
- Responsive design (mobile + desktop)
- Futuristic animations & effects

## Project Structure

```
trinity-woodenworks/
├── server.js           # Main server file (entry point)
├── database.js         # Database connection & helpers
├── routes/             # URL handlers (pages, cart, orders, admin)
├── views/              # EJS templates (HTML files)
│   ├── partials/       # Reusable parts (header, footer)
│   ├── home.ejs        # Homepage
│   ├── shop.ejs        # Product listing
│   ├── product.ejs     # Single product page
│   ├── cart.ejs        # Shopping cart
│   ├── checkout.ejs    # Checkout page
│   ├── login.ejs       # Customer login
│   ├── signup.ejs      # Customer registration
│   ├── account.ejs     # Customer account
│   └── admin/          # Admin panel pages
├── public/             # Static files (CSS, JS, images)
│   ├── css/            # Stylesheets
│   ├── js/             # JavaScript files
│   └── images/         # Product/category images
├── data/               # Database files (lowdb)
├── uploads/            # User uploaded files
├── .env                # Environment variables (secrets)
└── package.json        # Project dependencies
```

## Free Deployment (Render.com)

### Step 1: Upload to GitHub
1. Create a GitHub account (free)
2. Create a new repository
3. Push all project files to GitHub

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - **Name:** trinity-woodenworks
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add Environment Variable:
   - **Key:** SESSION_SECRET
   - **Value:** (any random string, e.g., `my-super-secret-key-2026`)
6. Click "Create Web Service"

### Step 3: Done!
Your website will be live at: `https://trinity-woodenworks.onrender.com`

**Note:** Free tier spins down after 15 min of inactivity. First load takes ~30 seconds.

## Local Development

### Prerequisites
- Node.js installed (version 14 or higher)
- Git installed

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/your-username/trinity-woodenworks.git

# 2. Go into the project folder
cd trinity-woodenworks

# 3. Install dependencies
npm install

# 4. Start the server
npm start
```

Visit: http://localhost:3000

## Admin Panel
- URL: `/admin/dashboard`
- Username: `admin`
- Password: `admin123`

## Tech Stack
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (cloud) or lowdb (local JSON file)
- **Frontend:** EJS templates + CSS3 + Vanilla JS
- **Animations:** GSAP + ScrollTrigger
- **Hosting:** Render.com (free)

## How It Works

### Request Flow
```
User clicks link → Browser sends request → Express finds matching route →
Route handler runs → EJS renders HTML → Browser receives page
```

### Database
- **MongoDB Atlas** — Cloud database (used in production)
- **lowdb** — Local JSON file (fallback for development)

The app automatically uses whichever is available.

### Key Files
- `server.js` — Main entry point, sets up Express and routes
- `database.js` — Database connection and helper functions
- `routes/pages.js` — Homepage, shop, product, about, contact pages
- `routes/customers.js` — Login, signup, account, logout
- `routes/cart.js` — Add/remove items from cart
- `routes/orders.js` — Checkout and order history
- `routes/admin.js` — Admin dashboard and management

## Need Help?

If you're a beginner, start by:
1. Reading `server.js` — it's the entry point
2. Looking at `routes/pages.js` — see how pages are served
3. Checking `views/home.ejs` — see how HTML is rendered
4. Exploring `public/css/style.css` — see the styling
