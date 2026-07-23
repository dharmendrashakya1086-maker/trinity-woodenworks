import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/ui/ProtectedRoute'

import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Account from './pages/Account'
import Orders from './pages/Orders'
import TrackOrder from './pages/TrackOrder'
import About from './pages/About'
import Contact from './pages/Contact'
import Categories from './pages/Categories'
import CustomOrder from './pages/CustomOrder'
import TrackCustomOrder from './pages/TrackCustomOrder'

import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminSeedData from './pages/admin/SeedData'
import AdminLogin from './pages/admin/Login'

export default function App() {
  const { isAdmin } = useAuth()

  return (
    <Routes>
      {/* Public routes with header/footer */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/shop" element={<Layout><Shop /></Layout>} />
      <Route path="/shop/:category" element={<Layout><Shop /></Layout>} />
      <Route path="/product/:id" element={<Layout><Product /></Layout>} />
      <Route path="/categories" element={<Layout><Categories /></Layout>} />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/custom-order" element={<ProtectedRoute><Layout><CustomOrder /></Layout></ProtectedRoute>} />
      <Route path="/track-custom-order" element={<ProtectedRoute><Layout><TrackCustomOrder /></Layout></ProtectedRoute>} />

      {/* Auth routes */}
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/signup" element={<Layout><Signup /></Layout>} />
      <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />

      {/* Protected user routes */}
      <Route path="/cart" element={<ProtectedRoute><Layout><Cart /></Layout></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Layout><Account /></Layout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
      <Route path="/track-order" element={<ProtectedRoute><Layout><TrackOrder /></Layout></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/admin/login" />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="seed" element={<AdminSeedData />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
