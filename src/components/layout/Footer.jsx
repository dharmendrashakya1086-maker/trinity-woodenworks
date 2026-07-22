import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="glass border-t border-dark-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold gold-text mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Trinity Woodenworks
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Handcrafted wooden furniture and home décor, made with love and precision.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/shop" className="block text-sm text-text-muted hover:text-gold no-underline transition-colors">Shop</Link>
              <Link to="/categories" className="block text-sm text-text-muted hover:text-gold no-underline transition-colors">Categories</Link>
              <Link to="/custom-order" className="block text-sm text-text-muted hover:text-gold no-underline transition-colors">Custom Order</Link>
              <Link to="/track-order" className="block text-sm text-text-muted hover:text-gold no-underline transition-colors">Track Order</Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Account</h4>
            <div className="space-y-2">
              <Link to="/login" className="block text-sm text-text-muted hover:text-gold no-underline transition-colors">Sign In</Link>
              <Link to="/signup" className="block text-sm text-text-muted hover:text-gold no-underline transition-colors">Sign Up</Link>
              <Link to="/account" className="block text-sm text-text-muted hover:text-gold no-underline transition-colors">My Account</Link>
              <Link to="/orders" className="block text-sm text-text-muted hover:text-gold no-underline transition-colors">My Orders</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Contact</h4>
            <div className="space-y-2 text-sm text-text-muted">
              <p>📍 Varanasi, India</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ hello@trinitywoodenworks.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-dark-border mt-8 pt-6 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} Trinity Woodenworks. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
