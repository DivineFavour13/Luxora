import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AccountNav from '../../components/AccountNav.jsx';
import { getCurrentUser, getOrders } from '../../utils/storage.js';
import { formatCurrency } from '../../utils/format.js';
import { showNotification } from '../../utils/notifications.js';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: 'fas fa-clock' },
  processing: { label: 'Processing', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: 'fas fa-spinner' },
  shipped:    { label: 'Shipped',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  icon: 'fas fa-shipping-fast' },
  delivered:  { label: 'Delivered',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: 'fas fa-check-circle' },
  cancelled:  { label: 'Cancelled',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: 'fas fa-times-circle' },
};

function OrderCard({ order, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown';
  const itemCount = (order.items || []).reduce((s, it) => s + (it.quantity || 1), 0);
  const status = order.status || 'pending';
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <div className="order-card-v2">
      <div className="order-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="order-id-col">
          <span className="order-id-label">Order</span>
          <strong>#{order.id}</strong>
        </div>
        <div className="order-date-col">
          <span className="order-id-label">Placed</span>
          <span>{createdAt}</span>
        </div>
        <div className="order-items-col">
          <span className="order-id-label">Items</span>
          <span>{itemCount}</span>
        </div>
        <div className="order-total-col">
          <span className="order-id-label">Total</span>
          <strong>{formatCurrency(order.total || 0)}</strong>
        </div>
        <div className="order-status-col">
          <span className="order-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
            <i className={cfg.icon}></i> {cfg.label}
          </span>
        </div>
        <div className="order-expand-col">
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
        </div>
      </div>

      {expanded && (
        <div className="order-card-body">
          <div className="order-items-grid">
            {(order.items || []).map((item, i) => (
              <div className="order-item-row" key={i}>
                <div className="order-item-name">
                  <i className="fas fa-box-open" style={{ color: 'var(--accent-color)' }}></i>
                  <span>{item.name}</span>
                </div>
                <span className="order-item-qty">×{item.quantity || 1}</span>
                <span className="order-item-price">{formatCurrency(item.price * (item.quantity || 1))}</span>
              </div>
            ))}
          </div>


          <div className="order-tracking-timeline">
            <h4><i className="fas fa-map-marker-alt"></i> Order Progress</h4>
            <div className="tracking-steps">
              {['pending','processing','shipped','delivered'].map((step, i) => {
                const steps = ['pending','processing','shipped','delivered'];
                const currentIdx = steps.indexOf(status === 'cancelled' ? 'pending' : status);
                const isDone = i <= currentIdx && status !== 'cancelled';
                const isCurrent = i === currentIdx && status !== 'cancelled';
                const labels = { pending: 'Order Placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };
                const icons = { pending: 'fas fa-check', processing: 'fas fa-cog', shipped: 'fas fa-truck', delivered: 'fas fa-home' };
                return (
                  <div key={step} className={`tracking-step ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="tracking-dot"><i className={icons[step]}></i></div>
                    <span>{labels[step]}</span>
                    {i < 3 && <div className={`tracking-line ${i < currentIdx && status !== 'cancelled' ? 'done' : ''}`}></div>}
                  </div>
                );
              })}
            </div>
            {status === 'cancelled' && (
              <div className="tracking-cancelled"><i className="fas fa-times-circle"></i> This order was cancelled</div>
            )}
          </div>

          <div className="order-detail-footer">
            <div className="order-detail-meta">
              {order.shippingAddress && (
                <div className="order-meta-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{order.shippingAddress}</span>
                </div>
              )}
              {order.paymentMethod && (
                <div className="order-meta-item">
                  <i className="fas fa-credit-card"></i>
                  <span>{order.paymentMethod}</span>
                </div>
              )}
            </div>
            <div className="order-totals-mini">
              {order.discount > 0 && <div className="order-totals-row"><span>Discount</span><span style={{color:'var(--success-color)'}}>-{formatCurrency(order.discount)}</span></div>}
              <div className="order-totals-row"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping || 0)}</span></div>
              <div className="order-totals-row total-row"><span>Total</span><strong>{formatCurrency(order.total || 0)}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) { navigate('/login'); return; }
    const all = getOrders() || [];
    const filtered = all.filter(o =>
      (o.userEmail || o.customerEmail || '').toLowerCase() === (user.email || '').toLowerCase()
    );
    setOrders(filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
  }, [navigate]);

  const statusFilters = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const displayed = filter === 'all' ? orders : orders.filter(o => (o.status || 'pending') === filter);

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <Link to="/account">Account Settings</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Orders</span>
        </div>

        <div className="account-header">
          <h1><i className="fas fa-box"></i> My Orders</h1>
          <p className="account-subtitle">Track and manage your orders.</p>
        </div>

        <div className="account-grid">
          <AccountNav />

          <section className="account-content">
            <div className="card">
              <div className="card-header">
                <h3>Order History</h3>
                <span className="card-hint">{orders.length} total orders</span>
              </div>

              {/* Status filter tabs */}
              <div className="orders-filter-tabs">
                {statusFilters.map(s => (
                  <button key={s} className={`orders-filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
                    {s === 'all' ? 'All' : (STATUS_CONFIG[s]?.label || s)}
                    {s !== 'all' && <span className="tab-count">{orders.filter(o => (o.status || 'pending') === s).length}</span>}
                  </button>
                ))}
              </div>

              <div className="orders-list-v2">
                {displayed.length === 0 ? (
                  <div className="orders-empty">
                    <i className="fas fa-box-open"></i>
                    <p>{filter === 'all' ? 'No orders yet. Start shopping!' : `No ${filter} orders.`}</p>
                    {filter === 'all' && <Link to="/" className="btn-primary"><i className="fas fa-shopping-bag"></i> Shop Now</Link>}
                  </div>
                ) : displayed.map(o => <OrderCard key={o.id} order={o} />)}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
