import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  getProducts,
  saveProducts,
  getUsers,
  getOrders,
  updateOrderStatus,
  getSettings,
  saveSettings
} from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';

const STATUS_META = {
  pending:    { label: 'Pending',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: 'fas fa-clock' },
  processing: { label: 'Processing', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: 'fas fa-spinner' },
  shipped:    { label: 'Shipped',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  icon: 'fas fa-shipping-fast' },
  delivered:  { label: 'Delivered',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: 'fas fa-check-circle' },
  cancelled:  { label: 'Cancelled',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: 'fas fa-times-circle' },
};

function getProductStatus(product) {
  const stock = Number(product.stock || 0);
  if (stock <= 0) return 'out-of-stock';
  if (product.inStock === false) return 'inactive';
  return 'active';
}

function formatDate(v) {
  if (!v) return '—';
  try { return new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; }
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className="admin-status-badge" style={{ color: m.color, background: m.bg }}>
      <i className={m.icon}></i> {m.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon" style={{ background: accent + '18', color: accent }}>
        <i className={icon}></i>
      </div>
      <div className="admin-stat-body">
        <p className="admin-stat-label">{label}</p>
        <h2 className="admin-stat-value">{value}</h2>
        <span className="admin-stat-sub">{sub}</span>
      </div>
    </div>
  );
}

function CategoryBar({ products }) {
  const cats = useMemo(() => {
    const map = {};
    for (const p of products) {
      const c = p.category || 'other';
      map[c] = (map[c] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [products]);
  const max = cats[0]?.[1] || 1;
  const COLORS = ['var(--accent-color)', '#3b82f6', '#22c55e', '#8b5cf6', '#ef4444', '#f59e0b'];
  return (
    <div className="admin-cat-bars">
      {cats.map(([cat, count], i) => (
        <div key={cat} className="admin-cat-row">
          <span className="admin-cat-name">{cat}</span>
          <div className="admin-cat-track">
            <div className="admin-cat-fill" style={{ width: `${(count / max) * 100}%`, background: COLORS[i % COLORS.length] }}></div>
          </div>
          <span className="admin-cat-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

function MiniOrderList({ orders }) {
  return (
    <div className="admin-mini-orders">
      {orders.length === 0 && <p className="admin-empty-msg">No orders yet.</p>}
      {orders.map(o => {
        const m = STATUS_META[o.status || 'pending'] || STATUS_META.pending;
        return (
          <div key={o.id} className="admin-mini-order">
            <div className="admin-mini-order-info">
              <strong>#{o.id}</strong>
              <span>{o.userName || o.userEmail || 'Guest'}</span>
            </div>
            <div className="admin-mini-order-right">
              <span className="admin-status-badge" style={{ color: m.color, background: m.bg, fontSize: '0.75rem' }}>
                {m.label}
              </span>
              <strong>{formatCurrency(o.total || 0)}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState(() => getSettings());
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [productForm, setProductForm] = useState({
    id: '', name: '', brand: '', category: '', price: '', oldPrice: '',
    stock: '', description: '', image: '', isFlashSale: false,
    flashPrice: '', isTopSeller: false, isNewArrival: false
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') {
      showNotification('Access denied. Admin privileges required.', 'error');
      navigate('/');
      return;
    }
    setProducts(getProducts());
    setUsers(getUsers());
    setOrders(getOrders());
    setSettings(getSettings());
  }, [navigate]);

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + Number(o.total || 0), 0), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => (o.status || 'pending') === 'pending').length, [orders]);
  const categories = useMemo(() => [...new Set(products.map(p => String(p.category || '').trim()).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    const bySearch = !productSearch.trim() ||
      String(p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      String(p.brand || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      String(p.category || '').toLowerCase().includes(productSearch.toLowerCase());
    const byCat = !categoryFilter || String(p.category || '').toLowerCase() === categoryFilter.toLowerCase();
    const bySt = !statusFilter || getProductStatus(p) === statusFilter;
    return bySearch && byCat && bySt;
  }), [products, productSearch, categoryFilter, statusFilter]);

  const filteredOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return sorted.filter(o => {
      const bySearch = !orderSearch.trim() ||
        String(o.id).includes(orderSearch) ||
        String(o.userName || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        String(o.userEmail || '').toLowerCase().includes(orderSearch.toLowerCase());
      const bySt = !orderStatusFilter || (o.status || 'pending') === orderStatusFilter;
      return bySearch && bySt;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5), [orders]);

  const resetForm = () => {
    setProductForm({ id: '', name: '', brand: '', category: '', price: '', oldPrice: '', stock: '', description: '', image: '', isFlashSale: false, flashPrice: '', isTopSeller: false, isNewArrival: false });
    setShowProductForm(false);
  };

  const startEdit = (p) => {
    setProductForm({
      id: p.id, name: p.name || '', brand: p.brand || '', category: p.category || '',
      price: p.price || '', oldPrice: p.originalPrice || '', stock: Number(p.stock || 0),
      description: p.description || '', image: p.image || '',
      isFlashSale: !!p.isFlashSale, flashPrice: p.flashPrice || '',
      isTopSeller: !!p.isTopSeller, isNewArrival: !!p.isNewArrival
    });
    setShowProductForm(true);
    setSection('products');
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.category || !productForm.price || productForm.stock === '' || !productForm.description || !productForm.image) {
      showNotification('Please fill all required fields', 'error');
      return;
    }
    const id = productForm.id ? Number(productForm.id) : Date.now();
    const nextStock = Number(productForm.stock || 0);
    const updated = {
      ...products.find(p => p.id === id),
      id, name: productForm.name.trim(), brand: productForm.brand.trim(),
      category: productForm.category.trim().toLowerCase(),
      price: Number(productForm.price),
      originalPrice: productForm.oldPrice ? Number(productForm.oldPrice) : undefined,
      stock: nextStock, inStock: nextStock > 0,
      description: productForm.description.trim(),
      image: productForm.image.trim(),
      isFlashSale: productForm.isFlashSale,
      flashPrice: productForm.isFlashSale && productForm.flashPrice ? Number(productForm.flashPrice) : undefined,
      isTopSeller: productForm.isTopSeller,
      isNewArrival: productForm.isNewArrival,
    };
    const next = [updated, ...products.filter(p => p.id !== id)];
    if (!saveProducts(next)) { showNotification('Failed to save product', 'error'); return; }
    setProducts(next);
    resetForm();
    showNotification(productForm.id ? 'Product updated' : 'Product added', 'success');
  };

  const handleDelete = (pid) => {
    if (!window.confirm('Delete this product?')) return;
    const next = products.filter(p => p.id !== pid);
    if (!saveProducts(next)) { showNotification('Failed to delete', 'error'); return; }
    setProducts(next);
    showNotification('Product deleted', 'success');
  };

  const handleOrderStatus = (orderId, status) => {
    if (!updateOrderStatus(orderId, status)) { showNotification('Failed to update', 'error'); return; }
    setOrders(getOrders());
    showNotification('Order updated', 'success');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!saveSettings(settings)) { showNotification('Failed to save settings', 'error'); return; }
    showNotification('Settings saved', 'success');
  };

  const pf = (k, v) => setProductForm(prev => ({ ...prev, [k]: v }));

  const NAV = [
    { id: 'dashboard', icon: 'fas fa-th-large', label: 'Dashboard' },
    { id: 'products', icon: 'fas fa-box-open', label: 'Products' },
    { id: 'orders', icon: 'fas fa-receipt', label: 'Orders' },
    { id: 'users', icon: 'fas fa-users', label: 'Users' },
    { id: 'analytics', icon: 'fas fa-chart-bar', label: 'Analytics' },
    { id: 'settings', icon: 'fas fa-sliders-h', label: 'Settings' },
  ];

  return (
    <main>
      <div className="admin-shell">

        {/* ── Sidebar ── */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <i className="fas fa-crown"></i>
            <span>Admin Panel</span>
          </div>
          <nav className="admin-nav">
            {NAV.map(n => (
              <button key={n.id} className={`admin-nav-item ${section === n.id ? 'active' : ''}`} onClick={() => setSection(n.id)}>
                <i className={n.icon}></i>
                <span>{n.label}</span>
                {n.id === 'orders' && pendingOrders > 0 && <span className="admin-nav-badge">{pendingOrders}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <div className="admin-body">

          {/* ══ DASHBOARD ══ */}
          {section === 'dashboard' && (
            <div className="admin-page">
              <div className="admin-page-header">
                <div>
                  <h1>Dashboard</h1>
                  <p className="admin-page-sub">Welcome back — here's what's happening today.</p>
                </div>
                <span className="admin-date-chip"><i className="fas fa-calendar-alt"></i> {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}</span>
              </div>

              <div className="admin-stats-grid">
                <StatCard icon="fas fa-naira-sign" label="Total Revenue" value={formatCurrency(totalRevenue)} sub="All time" accent="var(--accent-color)" />
                <StatCard icon="fas fa-receipt" label="Total Orders" value={orders.length} sub={`${pendingOrders} pending`} accent="#3b82f6" />
                <StatCard icon="fas fa-users" label="Registered Users" value={users.length} sub="Accounts" accent="#22c55e" />
                <StatCard icon="fas fa-box-open" label="Products" value={products.length} sub={`${products.filter(p => Number(p.stock || 0) < 5).length} low stock`} accent="#8b5cf6" />
              </div>

              <div className="admin-dashboard-grid">
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3>Recent Orders</h3>
                    <button className="admin-link-btn" onClick={() => setSection('orders')}>View all <i className="fas fa-arrow-right"></i></button>
                  </div>
                  <MiniOrderList orders={recentOrders} />
                </div>

                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3>Products by Category</h3>
                    <span className="admin-card-hint">{products.length} total</span>
                  </div>
                  <CategoryBar products={products} />
                </div>

                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3>Quick Actions</h3>
                  </div>
                  <div className="admin-quick-actions">
                    {[
                      { icon: 'fas fa-plus', label: 'Add Product', action: () => { resetForm(); setShowProductForm(true); setSection('products'); } },
                      { icon: 'fas fa-receipt', label: 'View Orders', action: () => setSection('orders') },
                      { icon: 'fas fa-users', label: 'Manage Users', action: () => setSection('users') },
                      { icon: 'fas fa-sliders-h', label: 'Settings', action: () => setSection('settings') },
                    ].map(a => (
                      <button key={a.label} className="admin-quick-btn" onClick={a.action}>
                        <span className="admin-quick-icon"><i className={a.icon}></i></span>
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3>Low Stock Alert</h3>
                    <span className="admin-card-hint admin-card-hint--danger">{products.filter(p => Number(p.stock || 0) < 10).length} items</span>
                  </div>
                  <div className="admin-low-stock">
                    {products.filter(p => Number(p.stock || 0) < 10 && Number(p.stock || 0) > 0).slice(0, 5).map(p => (
                      <div key={p.id} className="admin-low-stock-row">
                        <img src={p.image} alt={p.name} />
                        <div>
                          <strong>{p.name}</strong>
                          <span>{p.brand}</span>
                        </div>
                        <span className="admin-stock-pill">{p.stock} left</span>
                      </div>
                    ))}
                    {products.filter(p => Number(p.stock || 0) < 10 && Number(p.stock || 0) > 0).length === 0 && (
                      <p className="admin-empty-msg"><i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }}></i> All products well-stocked</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {section === 'products' && (
            <div className="admin-page">
              <div className="admin-page-header">
                <div>
                  <h1>Products</h1>
                  <p className="admin-page-sub">{filteredProducts.length} of {products.length} products</p>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setShowProductForm(true); }}>
                  <i className="fas fa-plus"></i> Add Product
                </button>
              </div>

              {/* Product form */}
              {showProductForm && (
                <div className="admin-card admin-form-card">
                  <div className="admin-card-header">
                    <h3><i className={productForm.id ? 'fas fa-edit' : 'fas fa-plus-circle'}></i> {productForm.id ? 'Edit Product' : 'New Product'}</h3>
                    <button className="admin-close-btn" onClick={resetForm}><i className="fas fa-times"></i></button>
                  </div>
                  <form onSubmit={handleSaveProduct} className="admin-product-form">
                    <div className="apf-grid">
                      <div className="form-group">
                        <label>Product Name *</label>
                        <input className="form-control" value={productForm.name} onChange={e => pf('name', e.target.value)} placeholder="e.g. Nike Air Force 1" />
                      </div>
                      <div className="form-group">
                        <label>Brand *</label>
                        <input className="form-control" value={productForm.brand} onChange={e => pf('brand', e.target.value)} placeholder="e.g. Nike" />
                      </div>
                      <div className="form-group">
                        <label>Category *</label>
                        <input className="form-control" list="admin-cats" value={productForm.category} onChange={e => pf('category', e.target.value)} placeholder="fashion / beauty / lifestyle" />
                        <datalist id="admin-cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
                      </div>
                      <div className="form-group">
                        <label>Price (₦) *</label>
                        <input className="form-control" type="number" min="0" value={productForm.price} onChange={e => pf('price', e.target.value)} placeholder="89999" />
                      </div>
                      <div className="form-group">
                        <label>Original Price (₦)</label>
                        <input className="form-control" type="number" min="0" value={productForm.oldPrice} onChange={e => pf('oldPrice', e.target.value)} placeholder="109999" />
                      </div>
                      <div className="form-group">
                        <label>Stock Quantity *</label>
                        <input className="form-control" type="number" min="0" value={productForm.stock} onChange={e => pf('stock', e.target.value)} placeholder="50" />
                      </div>
                      <div className="form-group apf-full">
                        <label>Image URL *</label>
                        <input className="form-control" value={productForm.image} onChange={e => pf('image', e.target.value)} placeholder="https://... or /images/product.jpg" />
                      </div>
                      <div className="form-group apf-full">
                        <label>Description *</label>
                        <textarea className="form-control" rows="3" value={productForm.description} onChange={e => pf('description', e.target.value)} placeholder="Describe the product..."></textarea>
                      </div>
                    </div>

                    <div className="apf-flags">
                      <label className="apf-flag-row">
                        <div className="apf-flag-toggle">
                          <input type="checkbox" checked={productForm.isFlashSale} onChange={e => pf('isFlashSale', e.target.checked)} />
                          <span className="apf-toggle-slider"></span>
                        </div>
                        <span><i className="fas fa-bolt" style={{ color: 'var(--accent-color)' }}></i> Flash Sale</span>
                        {productForm.isFlashSale && (
                          <input className="form-control apf-flash-price" type="number" min="0" value={productForm.flashPrice} onChange={e => pf('flashPrice', e.target.value)} placeholder="Flash price (₦)" />
                        )}
                      </label>
                      <label className="apf-flag-row">
                        <div className="apf-flag-toggle">
                          <input type="checkbox" checked={productForm.isTopSeller} onChange={e => pf('isTopSeller', e.target.checked)} />
                          <span className="apf-toggle-slider"></span>
                        </div>
                        <span><i className="fas fa-fire" style={{ color: '#ef4444' }}></i> Top Seller</span>
                      </label>
                      <label className="apf-flag-row">
                        <div className="apf-flag-toggle">
                          <input type="checkbox" checked={productForm.isNewArrival} onChange={e => pf('isNewArrival', e.target.checked)} />
                          <span className="apf-toggle-slider"></span>
                        </div>
                        <span><i className="fas fa-star" style={{ color: '#3b82f6' }}></i> New Arrival</span>
                      </label>
                    </div>

                    <div className="apf-actions">
                      <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                      <button type="submit" className="btn-primary"><i className="fas fa-save"></i> {productForm.id ? 'Update Product' : 'Add Product'}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Filters */}
              <div className="admin-filters">
                <div className="admin-search-wrap">
                  <i className="fas fa-search"></i>
                  <input className="admin-search-input" type="text" placeholder="Search by name, brand, category…" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                </div>
                <select className="admin-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="admin-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>

              {/* Product table */}
              <div className="admin-card admin-table-card">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Tags</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 && (
                        <tr><td colSpan="7" className="admin-table-empty"><i className="fas fa-box-open"></i> No products found</td></tr>
                      )}
                      {filteredProducts.map(p => {
                        const st = getProductStatus(p);
                        const stockNum = Number(p.stock || 0);
                        return (
                          <tr key={p.id}>
                            <td>
                              <div className="admin-product-cell">
                                <img src={p.image} alt={p.name} className="admin-product-thumb" />
                                <div>
                                  <strong>{p.name}</strong>
                                  <span>{p.brand}</span>
                                </div>
                              </div>
                            </td>
                            <td><span className="admin-cat-pill">{p.category}</span></td>
                            <td>
                              <div className="admin-price-cell">
                                <strong>{formatCurrency(p.price || 0)}</strong>
                                {p.originalPrice && <s>{formatCurrency(p.originalPrice)}</s>}
                              </div>
                            </td>
                            <td>
                              <span className={`admin-stock-badge ${stockNum <= 0 ? 'empty' : stockNum < 10 ? 'low' : stockNum < 30 ? 'medium' : 'good'}`}>
                                {stockNum}
                              </span>
                            </td>
                            <td>
                              <div className="admin-tag-pills">
                                {p.isFlashSale && <span className="admin-tag flash"><i className="fas fa-bolt"></i></span>}
                                {p.isTopSeller && <span className="admin-tag top"><i className="fas fa-fire"></i></span>}
                                {p.isNewArrival && <span className="admin-tag new"><i className="fas fa-star"></i></span>}
                              </div>
                            </td>
                            <td>
                              <span className={`admin-prod-status ${st}`}>
                                {st === 'active' ? 'Active' : st === 'inactive' ? 'Inactive' : 'Out of Stock'}
                              </span>
                            </td>
                            <td>
                              <div className="admin-row-actions">
                                <button className="admin-action-btn edit" onClick={() => startEdit(p)} title="Edit"><i className="fas fa-edit"></i></button>
                                <button className="admin-action-btn delete" onClick={() => handleDelete(p.id)} title="Delete"><i className="fas fa-trash"></i></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {section === 'orders' && (
            <div className="admin-page">
              <div className="admin-page-header">
                <div>
                  <h1>Orders</h1>
                  <p className="admin-page-sub">{filteredOrders.length} of {orders.length} orders</p>
                </div>
                <div className="admin-order-stats-row">
                  {Object.entries(STATUS_META).map(([key, m]) => (
                    <span key={key} className="admin-mini-stat" style={{ color: m.color, background: m.bg }}>
                      <i className={m.icon}></i> {orders.filter(o => (o.status || 'pending') === key).length}
                    </span>
                  ))}
                </div>
              </div>

              <div className="admin-filters">
                <div className="admin-search-wrap">
                  <i className="fas fa-search"></i>
                  <input className="admin-search-input" type="text" placeholder="Search by order ID, name, or email…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                </div>
                <select className="admin-select" value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                </select>
              </div>

              <div className="admin-card admin-table-card">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Update</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 && (
                        <tr><td colSpan="7" className="admin-table-empty"><i className="fas fa-receipt"></i> No orders found</td></tr>
                      )}
                      {filteredOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>
                            <div className="admin-customer-cell">
                              <div className="admin-customer-avatar">{(o.userName || o.userEmail || 'G')[0].toUpperCase()}</div>
                              <div>
                                <strong>{o.userName || 'Guest'}</strong>
                                <span>{o.userEmail || '—'}</span>
                              </div>
                            </div>
                          </td>
                          <td>{formatDate(o.createdAt || o.orderDate)}</td>
                          <td><span className="admin-items-count">{(o.items || []).reduce((s, it) => s + (it.quantity || 1), 0)} items</span></td>
                          <td><strong>{formatCurrency(o.total || 0)}</strong></td>
                          <td><StatusBadge status={o.status || 'pending'} /></td>
                          <td>
                            <select className="admin-select admin-status-select" value={o.status || 'pending'} onChange={e => handleOrderStatus(o.id, e.target.value)}>
                              {Object.entries(STATUS_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {section === 'users' && (
            <div className="admin-page">
              <div className="admin-page-header">
                <div>
                  <h1>Users</h1>
                  <p className="admin-page-sub">{users.length} registered accounts</p>
                </div>
              </div>
              <div className="admin-card admin-table-card">
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Orders</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr><td colSpan="6" className="admin-table-empty"><i className="fas fa-users"></i> No users yet</td></tr>
                      )}
                      {users.map(u => {
                        const userOrders = orders.filter(o => (o.userEmail || '').toLowerCase() === (u.email || '').toLowerCase());
                        return (
                          <tr key={u.id || u.email}>
                            <td>
                              <div className="admin-customer-cell">
                                <div className="admin-customer-avatar" style={u.role === 'admin' ? { background: 'var(--accent-color)', color: 'var(--primary-color)' } : {}}>
                                  {(u.name || u.email || 'U')[0].toUpperCase()}
                                </div>
                                <strong>{u.name || '—'}</strong>
                              </div>
                            </td>
                            <td>{u.email || '—'}</td>
                            <td>
                              <span className={`admin-role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                                {u.role === 'admin' ? <><i className="fas fa-crown"></i> Admin</> : <><i className="fas fa-user"></i> User</>}
                              </span>
                            </td>
                            <td>{formatDate(u.createdAt || u.joinedDate)}</td>
                            <td><span className="admin-items-count">{userOrders.length} orders</span></td>
                            <td><span className="admin-prod-status active">Active</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {section === 'analytics' && (
            <div className="admin-page">
              <div className="admin-page-header">
                <div>
                  <h1>Analytics</h1>
                  <p className="admin-page-sub">Store performance overview</p>
                </div>
              </div>
              <div className="admin-stats-grid">
                <StatCard icon="fas fa-naira-sign" label="Total Revenue" value={formatCurrency(totalRevenue)} sub="All orders" accent="var(--accent-color)" />
                <StatCard icon="fas fa-shopping-bag" label="Avg. Order Value" value={orders.length ? formatCurrency(Math.round(totalRevenue / orders.length)) : '₦0'} sub="Per order" accent="#3b82f6" />
                <StatCard icon="fas fa-box-open" label="Products Listed" value={products.length} sub="In catalog" accent="#8b5cf6" />
                <StatCard icon="fas fa-star" label="Flash Sale Items" value={products.filter(p => p.isFlashSale).length} sub="On sale now" accent="#ef4444" />
              </div>

              <div className="admin-analytics-grid">
                <div className="admin-card">
                  <div className="admin-card-header"><h3>Order Status Breakdown</h3></div>
                  <div className="admin-donut-list">
                    {Object.entries(STATUS_META).map(([key, m]) => {
                      const count = orders.filter(o => (o.status || 'pending') === key).length;
                      const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                      return (
                        <div key={key} className="admin-donut-row">
                          <span className="admin-donut-dot" style={{ background: m.color }}></span>
                          <span className="admin-donut-label">{m.label}</span>
                          <div className="admin-donut-track">
                            <div className="admin-donut-fill" style={{ width: `${pct}%`, background: m.color }}></div>
                          </div>
                          <span className="admin-donut-val">{count}</span>
                        </div>
                      );
                    })}
                    {orders.length === 0 && <p className="admin-empty-msg">No orders yet — place some orders to see stats.</p>}
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card-header"><h3>Products by Category</h3></div>
                  <CategoryBar products={products} />
                </div>

                <div className="admin-card">
                  <div className="admin-card-header"><h3>Top Products by Stock</h3></div>
                  <div className="admin-top-products">
                    {[...products].sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0)).slice(0, 6).map(p => (
                      <div key={p.id} className="admin-top-prod-row">
                        <img src={p.image} alt={p.name} />
                        <div>
                          <strong>{p.name}</strong>
                          <span>{p.brand}</span>
                        </div>
                        <span className="admin-stock-pill">{p.stock} units</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card-header"><h3>Catalog Health</h3></div>
                  <div className="admin-health-grid">
                    {[
                      { label: 'In Stock', value: products.filter(p => Number(p.stock || 0) > 0).length, color: '#22c55e', icon: 'fas fa-check-circle' },
                      { label: 'Low Stock (< 10)', value: products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) < 10).length, color: '#f59e0b', icon: 'fas fa-exclamation-triangle' },
                      { label: 'Out of Stock', value: products.filter(p => Number(p.stock || 0) <= 0).length, color: '#ef4444', icon: 'fas fa-times-circle' },
                      { label: 'On Flash Sale', value: products.filter(p => p.isFlashSale).length, color: 'var(--accent-color)', icon: 'fas fa-bolt' },
                      { label: 'Top Sellers', value: products.filter(p => p.isTopSeller).length, color: '#8b5cf6', icon: 'fas fa-fire' },
                      { label: 'New Arrivals', value: products.filter(p => p.isNewArrival).length, color: '#3b82f6', icon: 'fas fa-star' },
                    ].map(h => (
                      <div key={h.label} className="admin-health-item">
                        <i className={h.icon} style={{ color: h.color }}></i>
                        <strong style={{ color: h.color }}>{h.value}</strong>
                        <span>{h.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {section === 'settings' && (
            <div className="admin-page">
              <div className="admin-page-header">
                <div>
                  <h1>Settings</h1>
                  <p className="admin-page-sub">Manage your store configuration</p>
                </div>
              </div>
              <div className="admin-settings-grid">
                <div className="admin-card">
                  <div className="admin-card-header"><h3><i className="fas fa-store"></i> Store Information</h3></div>
                  <form onSubmit={handleSaveSettings} className="admin-settings-form">
                    <div className="form-group">
                      <label>Store Name</label>
                      <input className="form-control" value={settings.siteName || ''} onChange={e => setSettings(p => ({ ...p, siteName: e.target.value }))} placeholder="LUXORA" />
                    </div>
                    <div className="form-group">
                      <label>Store Description</label>
                      <textarea className="form-control" rows="3" value={settings.siteDescription || ''} onChange={e => setSettings(p => ({ ...p, siteDescription: e.target.value }))} placeholder="Your store tagline..."></textarea>
                    </div>
                    <div className="form-group">
                      <label>Contact Email</label>
                      <input className="form-control" type="email" value={settings.contactEmail || ''} onChange={e => setSettings(p => ({ ...p, contactEmail: e.target.value }))} placeholder="hello@luxora.com" />
                    </div>
                    <button type="submit" className="btn-primary"><i className="fas fa-save"></i> Save Changes</button>
                  </form>
                </div>

                <div className="admin-card">
                  <div className="admin-card-header"><h3><i className="fas fa-bell"></i> Notifications</h3></div>
                  <form onSubmit={handleSaveSettings} className="admin-settings-form">
                    {[
                      { key: 'emailNotifications', label: 'Email alerts for new orders', icon: 'fas fa-envelope' },
                      { key: 'smsNotifications', label: 'SMS alerts for urgent issues', icon: 'fas fa-sms' },
                      { key: 'dailyReports', label: 'Daily sales digest', icon: 'fas fa-chart-bar' },
                    ].map(item => (
                      <div key={item.key} className="admin-toggle-row">
                        <div className="admin-toggle-label">
                          <i className={item.icon}></i>
                          <span>{item.label}</span>
                        </div>
                        <label className="switch">
                          <input type="checkbox" checked={!!settings[item.key]} onChange={e => setSettings(p => ({ ...p, [item.key]: e.target.checked }))} />
                          <span className="slider"></span>
                        </label>
                      </div>
                    ))}
                    <button type="submit" className="btn-primary"><i className="fas fa-save"></i> Save Settings</button>
                  </form>
                </div>

                <div className="admin-card">
                  <div className="admin-card-header"><h3><i className="fas fa-info-circle"></i> System Info</h3></div>
                  <div className="admin-sys-info">
                    {[
                      { label: 'Total Products', value: products.length },
                      { label: 'Total Orders', value: orders.length },
                      { label: 'Total Users', value: users.length },
                      { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
                      { label: 'Backend', value: 'Mock (localStorage)' },
                      { label: 'Version', value: '2.0.0' },
                    ].map(row => (
                      <div key={row.label} className="admin-sys-row">
                        <span>{row.label}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
