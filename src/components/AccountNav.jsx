import { Link, useLocation } from 'react-router-dom';

export default function AccountNav() {
  const { pathname } = useLocation();
  const isActive = (path) => pathname === path;

  return (
    <aside className="account-nav">
      <Link to="/account" className={`nav-item ${isActive('/account') ? 'active' : ''}`} data-section="preferences">
        <i className="fas fa-sliders-h"></i> Preferences
      </Link>
      <Link to="/account-settings/profile" className={`nav-item ${isActive('/account-settings/profile') ? 'active' : ''}`} data-section="profile">
        <i className="fas fa-user"></i> Profile
      </Link>
      <Link to="/account-settings/security" className={`nav-item ${isActive('/account-settings/security') ? 'active' : ''}`} data-section="security">
        <i className="fas fa-lock"></i> Security
      </Link>
      <Link to="/account-settings/addresses" className={`nav-item ${isActive('/account-settings/addresses') ? 'active' : ''}`} data-section="addresses">
        <i className="fas fa-map-marker-alt"></i> Addresses
      </Link>
      <Link to="/account-settings/payments" className={`nav-item ${isActive('/account-settings/payments') ? 'active' : ''}`} data-section="payments">
        <i className="fas fa-credit-card"></i> Payment Methods
      </Link>
      <Link to="/account-settings/orders" className={`nav-item ${isActive('/account-settings/orders') ? 'active' : ''}`} data-section="orders">
        <i className="fas fa-box"></i> Orders
      </Link>
    </aside>
  );
}
