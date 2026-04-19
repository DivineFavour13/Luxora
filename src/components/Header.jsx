import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCartItemCount, getCurrentUser, getProducts, logout } from '../utils/storage.js';
import { showNotification } from '../utils/notifications.js';
import { findBrandByQuery, slugifyBrand } from '../utils/brands.js';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [user, setUser] = useState(() => getCurrentUser());
  const [cartCount, setCartCount] = useState(() => getCartItemCount());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onUser = () => setUser(getCurrentUser());
    const onCart = () => setCartCount(getCartItemCount());
    window.addEventListener('userUpdated', onUser);
    window.addEventListener('cartUpdated', onCart);
    return () => {
      window.removeEventListener('userUpdated', onUser);
      window.removeEventListener('cartUpdated', onCart);
    };
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown && !dropdown.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = (e) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to logout?')) return;
    logout();
    showNotification('Logged out successfully', 'info');
    setOpen(false);
    navigate('/');
  };

  const handleSearch = () => {
    const query = String(searchValue || '').trim();
    if (!query) return;
    const products = getProducts();
    const matchedBrand = findBrandByQuery(products, query);
    if (matchedBrand) {
      navigate(`/brand/${slugifyBrand(matchedBrand)}`);
      setSearchValue('');
      return;
    }
    const matched = products.filter(p =>
      String(p.name || '').toLowerCase().includes(query.toLowerCase()) ||
      String(p.category || '').toLowerCase().includes(query.toLowerCase())
    );
    if (matched.length === 1) {
      navigate(`/product?id=${matched[0].id}`);
    } else {
      navigate(`/?q=${encodeURIComponent(query)}`);
      showNotification(`Showing results for "${query}"`, 'info');
    }
    setSearchValue('');
  };

  const navLinks = [
    { to: '/flash-sales', label: 'Flash Sales', icon: 'fas fa-bolt' },
    { to: '/top-sellers', label: 'Top Sellers', icon: 'fas fa-fire' },
    { to: '/new-arrivals', label: 'New Arrivals', icon: 'fas fa-star' },
    { to: '/brands', label: 'Brands', icon: 'fas fa-store' },
  ];

  return (
    <header id="main-header">
      <div className="header-container">
        <div className="logo">
          <h2><Link to="/">LUXORA</Link></h2>
        </div>

        <div className="search-bar">
          <i className="fas fa-search search-icon-prefix"></i>
          <input
            type="text"
            id="search-input"
            placeholder="Search products, brands..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
          />
          <button id="search-btn" onClick={handleSearch} aria-label="Search">
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <nav className="header-nav">
          <div className="header-nav-links">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className={`header-nav-link ${location.pathname === link.to ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <Link to="/cart" id="cart-link" className={`cart-link ${cartCount > 0 ? 'has-items' : ''}`}>
            <i className="fas fa-shopping-bag"></i>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <div className={`user-dropdown ${open ? 'active' : ''}`} id="user-dropdown">
            <button className="user-dropdown-btn" id="user-dropdown-btn"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}>
              <i className="fas fa-user-circle"></i>
              <span id="user-name">{user ? (user.name?.split(' ')[0] || 'Account') : 'Account'}</span>
              {user?.role === 'admin' && <span className="admin-badge" id="admin-badge">Admin</span>}
              <i className="fas fa-chevron-down dropdown-arrow"></i>
            </button>
            <div className="dropdown-menu" id="dropdown-menu">
              {user?.role === 'admin' ? (
                location.pathname === '/admin'
                  ? <Link to="/" className="dropdown-item" onClick={() => setOpen(false)}><i className="fas fa-home"></i> Home</Link>
                  : <Link to="/admin" className="dropdown-item" onClick={() => setOpen(false)}><i className="fas fa-tachometer-alt"></i> Admin Panel</Link>
              ) : null}
              <Link to="/wishlist" className="dropdown-item" onClick={() => setOpen(false)}><i className="fas fa-heart"></i> Wishlist</Link>
              <Link to={user ? '/account' : '/login'} className="dropdown-item" onClick={() => setOpen(false)}><i className="fas fa-user-cog"></i> Account Settings</Link>
              {user && <Link to="/account-settings/orders" className="dropdown-item" onClick={() => setOpen(false)}><i className="fas fa-box"></i> My Orders</Link>}
              <div className="dropdown-divider"></div>
              {!user && <Link to="/login" className="dropdown-item" onClick={() => setOpen(false)}><i className="fas fa-sign-in-alt"></i> Login / Register</Link>}
              {user && <a href="#" className="dropdown-item logout-item" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</a>}
            </div>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <i className={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
          </button>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}>
              <i className={link.icon}></i> {link.label}
            </Link>
          ))}
          <div className="mobile-nav-divider"></div>
          <Link to="/cart" className="mobile-nav-link"><i className="fas fa-shopping-bag"></i> Cart {cartCount > 0 && `(${cartCount})`}</Link>
          <Link to="/wishlist" className="mobile-nav-link"><i className="fas fa-heart"></i> Wishlist</Link>
          <Link to={user ? '/account' : '/login'} className="mobile-nav-link"><i className="fas fa-user"></i> {user ? 'My Account' : 'Login / Register'}</Link>
          {user && <a href="#" className="mobile-nav-link" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i> Logout</a>}
        </div>
      )}
    </header>
  );
}
