import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';

import Landing from './pages/Landing';
import ProductPage from './pages/ProductPage';
import Checkout from './pages/Checkout';
import Track from './pages/Track';
import Review from './pages/Review';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminSlider from './pages/admin/AdminSlider';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminInvoice from './pages/admin/AdminInvoice';
import ProtectedRoute from './components/admin/ProtectedRoute';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Storefront */}
          <Route path="/" element={<Landing />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<Track />} />
          <Route path="/track/:code" element={<Track />} />
          <Route path="/review/:orderId" element={<Review />} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedRoute>
                <AdminProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/slider"
            element={
              <ProtectedRoute>
                <AdminSlider />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute>
                <AdminOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoice/:orderId"
            element={
              <ProtectedRoute>
                <AdminInvoice />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
