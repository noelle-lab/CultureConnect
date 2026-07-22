import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RequireAdmin from './components/RequireAdmin'

import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Services from './pages/Services'
import RequestStore from './pages/RequestStore'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'

import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Discovery from './pages/admin/Discovery'
import Stores from './pages/admin/Stores'
import Listings from './pages/admin/Listings'
import CrossListing from './pages/admin/CrossListing'
import Finance from './pages/admin/Finance'
import CityRequestsAdmin from './pages/admin/CityRequests'
import Orders from './pages/admin/Orders'

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // When a link targets an in-page anchor (e.g. /services#pricing), scroll to
    // that element instead of jumping to the top. Fall back to the top on plain
    // route changes.
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

// The public site gets the standard chrome (navbar + footer). The admin area
// renders its own full-screen shell.
function PublicShell({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin area (protected) */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="discovery" element={<Discovery />} />
          <Route path="stores" element={<Stores />} />
          <Route path="listings" element={<Listings />} />
          <Route path="crosslisting" element={<CrossListing />} />
          <Route path="finance" element={<Finance />} />
          <Route path="city-requests" element={<CityRequestsAdmin />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* Public site */}
        <Route path="/" element={<PublicShell><Home /></PublicShell>} />
        <Route path="/shop" element={<PublicShell><Shop /></PublicShell>} />
        <Route
          path="/product/:id"
          element={<PublicShell><ProductDetail /></PublicShell>}
        />
        <Route path="/cart" element={<PublicShell><Cart /></PublicShell>} />
        <Route path="/services" element={<PublicShell><Services /></PublicShell>} />
        <Route
          path="/request-store"
          element={<PublicShell><RequestStore /></PublicShell>}
        />
        <Route path="/about" element={<PublicShell><About /></PublicShell>} />
        <Route
          path="/how-it-works"
          element={<PublicShell><HowItWorks /></PublicShell>}
        />
        <Route path="/contact" element={<PublicShell><Contact /></PublicShell>} />
        <Route path="*" element={<PublicShell><NotFound /></PublicShell>} />
      </Routes>
    </>
  )
}
