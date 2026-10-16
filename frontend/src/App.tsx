import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { RiderLayout } from './components/layout/RiderLayout';

// Guard
import { ProtectedRoute } from './components/guards/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { ProductsPage } from './pages/public/ProductsPage';
import { HowToOrderPage } from './pages/public/HowToOrderPage';
import { DeliveryInfoPage } from './pages/public/DeliveryInfoPage';
import { ContactPage } from './pages/public/ContactPage';
import { FAQPage } from './pages/public/FAQPage';
import { SafetyPage } from './pages/public/SafetyPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { RefundPolicyPage } from './pages/public/RefundPolicyPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { QuickBookPage } from './pages/public/QuickBookPage';
import { AdminLoginPage } from './pages/public/AdminLoginPage';
import { RiderLoginPage } from './pages/public/RiderLoginPage';

// Customer Pages
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { NewOrder } from './pages/customer/NewOrder';
import { MyOrders } from './pages/customer/MyOrders';
import { OrderDetail } from './pages/customer/OrderDetail';
import { OrderTracking } from './pages/customer/OrderTracking';
import { Profile } from './pages/customer/Profile';
import { SavedAddresses } from './pages/customer/SavedAddresses';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';
import { RiderManagement } from './pages/admin/RiderManagement';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { ProductManagement } from './pages/admin/ProductManagement';
import { Reports } from './pages/admin/Reports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { WebsiteCms } from './pages/admin/WebsiteCms';
import { AdminEnquiries } from './pages/admin/AdminEnquiries';

// Rider Pages
import { RiderDashboard } from './pages/rider/RiderDashboard';
import { RiderOrders } from './pages/rider/RiderOrders';
import { RiderOrderDetail } from './pages/rider/RiderOrderDetail';
import { CompletedDeliveries } from './pages/rider/CompletedDeliveries';
import { RiderProfile } from './pages/rider/RiderProfile';

// Not Found Page
const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-gray-50">
    <div className="w-16 h-16 rounded-2xl bg-red-100 text-accent flex items-center justify-center font-black text-2xl mb-4">
      404
    </div>
    <h1 className="text-2xl font-black text-gray-900">Page Not Found</h1>
    <p className="text-sm text-gray-500 mt-1 max-w-sm">
      The cylinder portal page you requested does not exist or has been relocated.
    </p>
    <Link
      to="/"
      className="mt-6 px-6 py-2.5 rounded-xl bg-primary hover:bg-primaryDark text-white font-bold text-sm shadow"
    >
      Return to Home
    </Link>
  </div>
);

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/how-to-order" element={<HowToOrderPage />} />
        <Route path="/delivery" element={<DeliveryInfoPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/quick-book" element={<QuickBookPage />} />
        <Route path="/book" element={<QuickBookPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/rider/login" element={<RiderLoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Protected Customer Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="orders" element={<MyOrders />} />
        <Route path="orders/new" element={<NewOrder />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="orders/:id/track" element={<OrderTracking />} />
        <Route path="profile" element={<Profile />} />
        <Route path="addresses" element={<SavedAddresses />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="riders" element={<RiderManagement />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="cms" element={<WebsiteCms />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* Protected Rider Routes */}
      <Route
        path="/rider"
        element={
          <ProtectedRoute allowedRoles={['RIDER']}>
            <RiderLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RiderDashboard />} />
        <Route path="orders" element={<RiderOrders />} />
        <Route path="orders/:id" element={<RiderOrderDetail />} />
        <Route path="completed" element={<CompletedDeliveries />} />
        <Route path="profile" element={<RiderProfile />} />
      </Route>
    </Routes>
  );
};

export default App;
