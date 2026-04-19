import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import CartPage from './pages/CartPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import AccountPreferencesPage from './pages/AccountPreferencesPage.jsx';
import ProfilePage from './pages/account/ProfilePage.jsx';
import SecurityPage from './pages/account/SecurityPage.jsx';
import AddressesPage from './pages/account/AddressesPage.jsx';
import PaymentsPage from './pages/account/PaymentsPage.jsx';
import OrdersPage from './pages/account/OrdersPage.jsx';
import FlashSalesPage from './pages/FlashSalesPage.jsx';
import TopSellersPage from './pages/TopSellersPage.jsx';
import NewArrivalsPage from './pages/NewArrivalsPage.jsx';
import BrandStorePage from './pages/BrandStorePage.jsx';
import BrandsPage from './pages/BrandsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/product" element={<ProductPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/account" element={<AccountPreferencesPage />} />
        <Route path="/account-settings/profile" element={<ProfilePage />} />
        <Route path="/account-settings/security" element={<SecurityPage />} />
        <Route path="/account-settings/addresses" element={<AddressesPage />} />
        <Route path="/account-settings/payments" element={<PaymentsPage />} />
        <Route path="/account-settings/orders" element={<OrdersPage />} />
        <Route path="/flash-sales" element={<FlashSalesPage />} />
        <Route path="/top-sellers" element={<TopSellersPage />} />
        <Route path="/new-arrivals" element={<NewArrivalsPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/brand/:brandSlug" element={<BrandStorePage />} />
      </Route>
    </Routes>
  );
}
