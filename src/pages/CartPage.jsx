import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getCart,
  saveCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
  getRecentlyViewed,
  getProducts,
  getCurrentUser,
  getProductById,
  createOrder,
  saveProducts,
  getUserAddresses,
  getUserPayments
} from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';

const PROMO_CODES = [
  { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off your order', minOrderValue: 5000, maxDiscount: 10000, active: true },
  { code: 'SAVE5000', type: 'fixed', value: 5000, description: '₦5,000 off your order', minOrderValue: 25000, active: true },
  { code: 'FREESHIP', type: 'shipping', value: 0, description: 'Free shipping', minOrderValue: 0, active: true }
];

function CheckoutModal({ cart, subtotal, shipping, discount, total, onClose, onConfirm }) {
  const user = getCurrentUser();
  const savedAddresses = user ? getUserAddresses(user) : [];
  const savedCards = user ? getUserPayments(user) : [];

  const [step, setStep] = useState(1); // 1=address, 2=payment, 3=review
  const [addrMode, setAddrMode] = useState(savedAddresses.length ? 'saved' : 'new');
  const [selectedAddr, setSelectedAddr] = useState(savedAddresses.find(a => a.isDefaultShipping) || savedAddresses[0] || null);
  const [newAddr, setNewAddr] = useState({ name: user?.name || '', phone: '', line1: '', line2: '', city: '', state: '', country: 'Nigeria', postal: '' });

  const [payMode, setPayMode] = useState(savedCards.length ? 'saved' : 'new');
  const [selectedCard, setSelectedCard] = useState(savedCards.find(c => c.isDefault) || savedCards[0] || null);
  const [newCard, setNewCard] = useState({ name: '', number: '', exp: '', cvv: '' });
  const [payType, setPayType] = useState('card'); // card | transfer | pay_on_delivery

  const addrSummary = addrMode === 'saved' && selectedAddr
    ? `${selectedAddr.line1}, ${selectedAddr.city}, ${selectedAddr.state}`
    : newAddr.line1 ? `${newAddr.line1}, ${newAddr.city}` : 'Not provided';

  const paymentSummary = payType === 'transfer' ? 'Bank Transfer'
    : payType === 'pay_on_delivery' ? 'Pay on Delivery'
    : payMode === 'saved' && selectedCard ? `${selectedCard.brand} •••• ${selectedCard.last4}`
    : newCard.number ? `Card ending ${newCard.number.slice(-4)}` : 'Not provided';

  const handleConfirm = () => {
    const address = addrMode === 'saved' && selectedAddr
      ? `${selectedAddr.name}, ${selectedAddr.line1}${selectedAddr.line2 ? ', ' + selectedAddr.line2 : ''}, ${selectedAddr.city}, ${selectedAddr.state}, ${selectedAddr.country}`
      : `${newAddr.name}, ${newAddr.line1}${newAddr.line2 ? ', ' + newAddr.line2 : ''}, ${newAddr.city}, ${newAddr.state}, ${newAddr.country}`;

    const payment = payType === 'transfer' ? 'Bank Transfer'
      : payType === 'pay_on_delivery' ? 'Pay on Delivery'
      : payMode === 'saved' && selectedCard ? `${selectedCard.brand} •••• ${selectedCard.last4}`
      : `Card •••• ${newCard.number.slice(-4)}`;

    onConfirm({ shippingAddress: address, paymentMethod: payment });
  };

  return (
    <div className="checkout-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="checkout-modal">
        <button className="checkout-modal-close" onClick={onClose} aria-label="Close">
          <i className="fas fa-times"></i>
        </button>

        {/* Step indicators */}
        <div className="checkout-steps">
          {['Delivery', 'Payment', 'Review'].map((label, i) => (
            <div key={label} className={`checkout-step ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
              <div className="checkout-step-circle">{step > i + 1 ? <i className="fas fa-check"></i> : i + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="checkout-modal-body">
          {/* STEP 1: Delivery Address */}
          {step === 1 && (
            <div className="checkout-section">
              <h3><i className="fas fa-map-marker-alt"></i> Delivery Address</h3>

              {savedAddresses.length > 0 && (
                <div className="checkout-mode-tabs">
                  <button className={addrMode === 'saved' ? 'active' : ''} onClick={() => setAddrMode('saved')}>Saved Addresses</button>
                  <button className={addrMode === 'new' ? 'active' : ''} onClick={() => setAddrMode('new')}>New Address</button>
                </div>
              )}

              {addrMode === 'saved' && savedAddresses.length > 0 ? (
                <div className="checkout-addr-list">
                  {savedAddresses.map(a => (
                    <label key={a.id} className={`checkout-addr-card ${selectedAddr?.id === a.id ? 'selected' : ''}`}>
                      <input type="radio" name="addr" checked={selectedAddr?.id === a.id} onChange={() => setSelectedAddr(a)} />
                      <div>
                        <strong>{a.name}</strong>
                        {a.isDefaultShipping && <span className="addr-badge">Default</span>}
                        <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
                        <p>{a.city}, {a.state}, {a.country}</p>
                        <p>{a.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="checkout-form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input className="form-control" value={newAddr.name} onChange={e => setNewAddr({...newAddr, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input className="form-control" value={newAddr.phone} onChange={e => setNewAddr({...newAddr, phone: e.target.value})} placeholder="+234 800 000 0000" />
                  </div>
                  <div className="form-group full-width">
                    <label>Address Line 1 *</label>
                    <input className="form-control" value={newAddr.line1} onChange={e => setNewAddr({...newAddr, line1: e.target.value})} placeholder="Street address" />
                  </div>
                  <div className="form-group full-width">
                    <label>Address Line 2</label>
                    <input className="form-control" value={newAddr.line2} onChange={e => setNewAddr({...newAddr, line2: e.target.value})} placeholder="Apartment, suite, etc." />
                  </div>
                  <div className="form-group">
                    <label>City *</label>
                    <input className="form-control" value={newAddr.city} onChange={e => setNewAddr({...newAddr, city: e.target.value})} placeholder="Lagos" />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input className="form-control" value={newAddr.state} onChange={e => setNewAddr({...newAddr, state: e.target.value})} placeholder="Lagos State" />
                  </div>
                  <div className="form-group">
                    <label>Country *</label>
                    <input className="form-control" value={newAddr.country} onChange={e => setNewAddr({...newAddr, country: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Postal Code</label>
                    <input className="form-control" value={newAddr.postal} onChange={e => setNewAddr({...newAddr, postal: e.target.value})} placeholder="100001" />
                  </div>
                </div>
              )}

              <div className="checkout-nav-btns">
                <button className="btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={() => {
                  if (addrMode === 'new' && (!newAddr.name || !newAddr.line1 || !newAddr.city || !newAddr.state)) {
                    showNotification('Please fill all required address fields', 'error');
                    return;
                  }
                  if (addrMode === 'saved' && !selectedAddr) {
                    showNotification('Please select a delivery address', 'error');
                    return;
                  }
                  setStep(2);
                }}>Continue to Payment <i className="fas fa-arrow-right"></i></button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="checkout-section">
              <h3><i className="fas fa-credit-card"></i> Payment Method</h3>

              <div className="checkout-pay-types">
                {[
                  { id: 'card', label: 'Credit / Debit Card', icon: 'fas fa-credit-card' },
                  { id: 'transfer', label: 'Bank Transfer', icon: 'fas fa-university' },
                  { id: 'pay_on_delivery', label: 'Pay on Delivery', icon: 'fas fa-truck' },
                ].map(opt => (
                  <label key={opt.id} className={`checkout-pay-option ${payType === opt.id ? 'selected' : ''}`}>
                    <input type="radio" name="paytype" checked={payType === opt.id} onChange={() => setPayType(opt.id)} />
                    <i className={opt.icon}></i>
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {payType === 'card' && (
                <>
                  {savedCards.length > 0 && (
                    <div className="checkout-mode-tabs">
                      <button className={payMode === 'saved' ? 'active' : ''} onClick={() => setPayMode('saved')}>Saved Cards</button>
                      <button className={payMode === 'new' ? 'active' : ''} onClick={() => setPayMode('new')}>New Card</button>
                    </div>
                  )}

                  {payMode === 'saved' && savedCards.length > 0 ? (
                    <div className="checkout-addr-list">
                      {savedCards.map(c => (
                        <label key={c.id} className={`checkout-addr-card ${selectedCard?.id === c.id ? 'selected' : ''}`}>
                          <input type="radio" name="card" checked={selectedCard?.id === c.id} onChange={() => setSelectedCard(c)} />
                          <div>
                            <strong>{c.brand} •••• {c.last4}</strong>
                            {c.isDefault && <span className="addr-badge">Default</span>}
                            <p>Expires {c.expMonth}/{c.expYear} &nbsp;·&nbsp; {c.name}</p>
                          </div>
                          <i className="fab fa-cc-visa" style={{ fontSize: '1.6rem', color: '#1a1f71', marginLeft: 'auto' }}></i>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="checkout-form-grid">
                      <div className="form-group full-width">
                        <label>Name on Card *</label>
                        <input className="form-control" value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} placeholder="John Doe" />
                      </div>
                      <div className="form-group full-width">
                        <label>Card Number *</label>
                        <input className="form-control" value={newCard.number} onChange={e => setNewCard({...newCard, number: e.target.value.replace(/\D/g,'').slice(0,16)})} placeholder="1234 5678 9012 3456" maxLength={16} />
                      </div>
                      <div className="form-group">
                        <label>Expiry (MM/YY) *</label>
                        <input className="form-control" value={newCard.exp} onChange={e => setNewCard({...newCard, exp: e.target.value})} placeholder="12/27" maxLength={5} />
                      </div>
                      <div className="form-group">
                        <label>CVV *</label>
                        <input className="form-control" value={newCard.cvv} onChange={e => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g,'').slice(0,4)})} placeholder="123" maxLength={4} type="password" />
                      </div>
                    </div>
                  )}
                </>
              )}

              {payType === 'transfer' && (
                <div className="checkout-info-box">
                  <i className="fas fa-info-circle"></i>
                  <div>
                    <strong>Bank Transfer Details</strong>
                    <p>Bank: First Bank Nigeria</p>
                    <p>Account: 1234567890</p>
                    <p>Name: LUXORA FASHION LTD</p>
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Use your order number as reference after payment.</p>
                  </div>
                </div>
              )}

              {payType === 'pay_on_delivery' && (
                <div className="checkout-info-box">
                  <i className="fas fa-truck"></i>
                  <div>
                    <strong>Pay on Delivery</strong>
                    <p>Pay cash when your order arrives. Available in Lagos, Abuja, and Port Harcourt only.</p>
                  </div>
                </div>
              )}

              <div className="checkout-nav-btns">
                <button className="btn-outline" onClick={() => setStep(1)}><i className="fas fa-arrow-left"></i> Back</button>
                <button className="btn-primary" onClick={() => {
                  if (payType === 'card') {
                    if (payMode === 'saved' && !selectedCard) { showNotification('Please select a card', 'error'); return; }
                    if (payMode === 'new' && (!newCard.name || !newCard.number || !newCard.exp || !newCard.cvv)) { showNotification('Please fill all card fields', 'error'); return; }
                  }
                  setStep(3);
                }}>Review Order <i className="fas fa-arrow-right"></i></button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Confirm */}
          {step === 3 && (
            <div className="checkout-section">
              <h3><i className="fas fa-clipboard-check"></i> Order Review</h3>

              <div className="checkout-review-grid">
                <div className="checkout-review-block">
                  <h4><i className="fas fa-map-marker-alt"></i> Delivery Address</h4>
                  <p>{addrSummary}</p>
                  <button className="checkout-edit-btn" onClick={() => setStep(1)}>Edit</button>
                </div>
                <div className="checkout-review-block">
                  <h4><i className="fas fa-credit-card"></i> Payment</h4>
                  <p>{paymentSummary}</p>
                  <button className="checkout-edit-btn" onClick={() => setStep(2)}>Edit</button>
                </div>
              </div>

              <div className="checkout-items-list">
                <h4>Items ({cart.length})</h4>
                {cart.map(item => (
                  <div className="checkout-item-row" key={item.id}>
                    <img src={item.image} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div className="checkout-totals">
                <div className="checkout-total-row"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="checkout-total-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span></div>
                {discount > 0 && <div className="checkout-total-row discount"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
                <div className="checkout-total-row total"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <div className="checkout-nav-btns">
                <button className="btn-outline" onClick={() => setStep(2)}><i className="fas fa-arrow-left"></i> Back</button>
                <button className="btn-primary place-order-btn" onClick={handleConfirm}>
                  <i className="fas fa-lock"></i> Place Order · {formatCurrency(total)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderSuccessModal({ order, onClose }) {
  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal success-modal">
        <div className="success-icon"><i className="fas fa-check-circle"></i></div>
        <h2>Order Placed!</h2>
        <p>Your order <strong>#{order.id}</strong> has been placed successfully.</p>
        <p className="success-sub">You'll receive a confirmation shortly. Track your order in <strong>My Orders</strong>.</p>
        <div className="success-actions">
          <button className="btn-outline" onClick={onClose}><i className="fas fa-home"></i> Continue Shopping</button>
          <Link to="/account-settings/orders" className="btn-primary" onClick={onClose}>
            <i className="fas fa-box"></i> View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const [cart, setCart] = useState(() => (getCart() || []).filter((item) => typeof item.price === 'number' && !Number.isNaN(item.price)));
  const [promoInput, setPromoInput] = useState('');
  const [updatedItemId, setUpdatedItemId] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('applied_promo') || 'null'); } catch { return null; }
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { saveCart(cart); }, [cart]);

  useEffect(() => {
    const onCart = () => setCart((getCart() || []).filter((item) => typeof item.price === 'number' && !Number.isNaN(item.price)));
    window.addEventListener('cartUpdated', onCart);
    return () => window.removeEventListener('cartUpdated', onCart);
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const shipping = useMemo(() => {
    if (appliedPromo?.type === 'shipping') return 0;
    return subtotal >= 100000 ? 0 : 2500;
  }, [appliedPromo, subtotal]);
  const discount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percentage') return Math.min(subtotal * (appliedPromo.value / 100), appliedPromo.maxDiscount || Infinity);
    if (appliedPromo.type === 'fixed') return Math.min(appliedPromo.value, subtotal);
    return 0;
  }, [appliedPromo, subtotal]);
  const total = Math.max(0, subtotal + shipping - discount);

  const recentlyViewed = getRecentlyViewed().slice(0, 6);
  const cartProductIds = cart.map((item) => item.id);
  const cartCategories = [...new Set(cart.map((item) => item.category))];
  let recommended = (getProducts() || []).filter((p) => cartCategories.includes(p.category) && !cartProductIds.includes(p.id));
  if (recommended.length < 6) {
    const additional = (getProducts() || []).filter((p) => !cartProductIds.includes(p.id) && !recommended.find((r) => r.id === p.id)).slice(0, 6 - recommended.length);
    recommended = [...recommended, ...additional];
  }
  recommended = recommended.slice(0, 6);

  const refreshCart = () => setCart((getCart() || []).filter((item) => typeof item.price === 'number' && !Number.isNaN(item.price)));

  const handleQty = (id, qty) => {
    const q = parseInt(qty, 10);
    if (!Number.isFinite(q)) return;
    if (q <= 0) return handleRemove(id);
    const product = getProductById(id);
    if (product && q > product.stock) { showNotification(`Only ${product.stock} items available in stock`, 'warning'); return; }
    if (updateCartQuantity(id, q)) {
      setUpdatedItemId(id);
      setTimeout(() => setUpdatedItemId(null), 1000);
      refreshCart();
      showNotification('Cart updated', 'success');
    }
  };

  const handleRemove = (id) => {
    if (!confirm('Remove this item from your cart?')) return;
    removeFromCart(id);
    refreshCart();
    showNotification('Item removed', 'info');
  };

  const handleClear = () => {
    if (!confirm('Clear your entire cart?')) return;
    clearCart();
    setCart([]);
    localStorage.removeItem('applied_promo');
    setAppliedPromo(null);
    showNotification('Cart cleared', 'info');
  };

  const applyPromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const promo = PROMO_CODES.find((p) => p.code === code && p.active);
    if (!promo) { showNotification('Invalid promo code', 'error'); return; }
    if (promo.minOrderValue && subtotal < promo.minOrderValue) {
      showNotification(`Minimum order of ${formatCurrency(promo.minOrderValue)} required`, 'warning');
      return;
    }
    localStorage.setItem('applied_promo', JSON.stringify(promo));
    setAppliedPromo(promo);
    showNotification(`Promo "${code}" applied!`, 'success');
  };

  const removePromo = () => {
    localStorage.removeItem('applied_promo');
    setAppliedPromo(null);
    setPromoInput('');
    showNotification('Promo code removed', 'info');
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) { showNotification('Your cart is empty', 'warning'); return; }
    const user = getCurrentUser();
    if (!user) {
      if (confirm('You need to login to checkout. Login now?')) navigate('/login');
      return;
    }
    for (const item of cart) {
      const p = getProductById(item.id);
      if (!p || p.stock < item.quantity) {
        showNotification(`${item.name} is out of stock or has insufficient quantity`, 'error');
        refreshCart();
        return;
      }
    }
    setShowCheckout(true);
  };

  const handleConfirmOrder = ({ shippingAddress, paymentMethod }) => {
    const user = getCurrentUser();
    if (!user) return;
    const order = createOrder({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      items: cart.map((item) => ({ id: item.id, productId: item.id, name: item.name, price: item.price, quantity: item.quantity, total: item.price * item.quantity })),
      subtotal, shipping, discount, total,
      paymentMethod,
      shippingAddress,
      orderDate: new Date().toISOString()
    });
    if (!order) { showNotification('Failed to place order. Please try again.', 'error'); return; }
    const reducedStockProducts = getProducts().map((product) => {
      const cartItem = cart.find((item) => item.id === product.id);
      if (!cartItem) return product;
      const nextStock = Math.max(0, Number(product.stock || 0) - Number(cartItem.quantity || 0));
      return { ...product, stock: nextStock, inStock: nextStock > 0 };
    });
    saveProducts(reducedStockProducts);
    clearCart();
    localStorage.removeItem('applied_promo');
    setAppliedPromo(null);
    setCart([]);
    setShowCheckout(false);
    setCompletedOrder(order);
  };

  const addRecommendedToCart = (productId) => {
    const product = getProductById(productId);
    if (!product) return;
    if (product.stock === 0) { showNotification('This item is out of stock', 'error'); return; }
    const current = getCart();
    const existing = current.find((item) => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) { existing.quantity += 1; saveCart(current); }
      else { showNotification('Maximum stock limit reached', 'warning'); return; }
    } else {
      current.push({ ...product, quantity: 1 });
      saveCart(current);
    }
    refreshCart();
    showNotification(`${product.name} added to cart`, 'success');
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Shopping Cart</span>
        </div>

        <div className="cart-header">
          <h1><i className="fas fa-shopping-bag"></i> Shopping Cart</h1>
          <div className="cart-actions">
            <button id="clear-cart" className="btn-secondary" onClick={handleClear}>
              <i className="fas fa-trash"></i> Clear Cart
            </button>
            <Link to="/" className="btn-outline">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart" id="empty-cart">
            <div className="empty-cart-content">
              <i className="fas fa-shopping-bag"></i>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any items to your cart yet.</p>
              <Link to="/" className="btn-primary"><i className="fas fa-arrow-left"></i> Continue Shopping</Link>
            </div>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items" id="cart-items">
              {cart.map((item) => {
                const pDiscount = item.originalPrice ? Math.round(100 - (item.price / item.originalPrice) * 100) : 0;
                return (
                  <div className={`cart-item ${updatedItemId === item.id ? 'updated' : ''}`} key={item.id} data-id={item.id}>
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} loading="lazy" />
                    </div>
                    <div className="cart-item-details">
                      <h3><Link to={`/product?id=${item.id}`}>{item.name}</Link></h3>
                      <div className="cart-item-meta">
                        <span>Category: {item.category}</span>
                        <span>SKU: {item.id}</span>
                        {item.color ? <span>Color: {item.color}</span> : null}
                        {item.size ? <span>Size: {item.size}</span> : null}
                      </div>
                      <div className="cart-item-price">
                        {formatCurrency(item.price)}
                        {item.originalPrice ? <span className="cart-item-old-price">{formatCurrency(item.originalPrice)}</span> : null}
                        {pDiscount > 0 ? <span className="discount-info">{pDiscount}% off</span> : null}
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button className="quantity-btn decrease-btn" disabled={item.quantity <= 1} onClick={() => handleQty(item.id, item.quantity - 1)}>
                          <i className="fas fa-minus"></i>
                        </button>
                        <input type="number" className="quantity-input" value={item.quantity} min="1" max={item.stock}
                          onChange={(e) => handleQty(item.id, e.target.value)} />
                        <button className="quantity-btn increase-btn" disabled={item.quantity >= (item.stock || 1)} onClick={() => handleQty(item.id, item.quantity + 1)}>
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <div className="item-total">{formatCurrency(item.price * item.quantity)}</div>
                      <button className="remove-item" onClick={() => handleRemove(item.id)}>
                        <i className="fas fa-trash"></i> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal ({getCartItemCount()} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span style={{color:'var(--success-color)'}}>Free</span> : formatCurrency(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount-row">
                    <span>Discount</span>
                    <span style={{color:'var(--success-color)'}}>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <div className="promo-code">
                  <h4>Promo Code</h4>
                  {appliedPromo ? (
                    <div className="promo-applied">
                      <div className="promo-success">
                        <i className="fas fa-tag"></i> {appliedPromo.code} — {appliedPromo.description}
                      </div>
                      <button className="promo-remove-btn" onClick={removePromo} aria-label="Remove promo">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <form id="promo-form" onSubmit={applyPromo}>
                      <div className="promo-input">
                        <input type="text" id="promo-code" placeholder="Enter promo code (e.g. WELCOME10)"
                          value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                        <button type="submit">Apply</button>
                      </div>
                      <div className="promo-hint">Try: WELCOME10 · SAVE5000 · FREESHIP</div>
                    </form>
                  )}
                </div>

                <button id="checkout-btn" className="btn-primary btn-full" onClick={handleCheckoutClick} disabled={cart.length === 0}>
                  <i className="fas fa-lock"></i> Proceed to Checkout
                </button>

                <div className="payment-methods">
                  <h4>We Accept</h4>
                  <div className="payment-icons">
                    <i className="fab fa-cc-visa"></i>
                    <i className="fab fa-cc-mastercard"></i>
                    <i className="fab fa-cc-paypal"></i>
                    <i className="fas fa-university"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {recentlyViewed.length > 0 && (
          <section className="recently-viewed" id="recently-viewed">
            <h2>Recently Viewed</h2>
            <div className="product-grid" id="recently-viewed-grid">
              {recentlyViewed.map((p) => (
                <div className="product-card" key={p.id}>
                  <div className="product-image">
                    <Link to={`/product?id=${p.id}`}><img src={p.image} alt={p.name} loading="lazy" /></Link>
                  </div>
                  <div className="product-info">
                    <h3><Link to={`/product?id=${p.id}`}>{p.name}</Link></h3>
                    <div className="price">{formatCurrency(p.price)}</div>
                    <button className="add-to-cart btn-primary" onClick={() => addRecommendedToCart(p.id)}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="recommended-products">
          <h2>You Might Also Like</h2>
          <div className="product-grid" id="recommended-grid">
            {recommended.map((p) => {
              const pDiscount = p.originalPrice ? Math.round(100 - (p.price / p.originalPrice) * 100) : 0;
              return (
                <div className="product-card" key={p.id}>
                  <div className="product-image">
                    <Link to={`/product?id=${p.id}`}>
                      <img src={p.image} alt={p.name} loading="lazy" />
                      {pDiscount > 0 && <div className="discount-badge">-{pDiscount}%</div>}
                    </Link>
                  </div>
                  <div className="product-info">
                    <h3><Link to={`/product?id=${p.id}`}>{p.name}</Link></h3>
                    <div className="price">
                      {formatCurrency(p.price)}
                      {p.originalPrice && <span className="old-price">{formatCurrency(p.originalPrice)}</span>}
                    </div>
                    <button className="add-to-cart btn-primary" onClick={() => addRecommendedToCart(p.id)}>Add to Cart</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          subtotal={subtotal}
          shipping={shipping}
          discount={discount}
          total={total}
          onClose={() => setShowCheckout(false)}
          onConfirm={handleConfirmOrder}
        />
      )}

      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => { setCompletedOrder(null); navigate('/'); }}
        />
      )}
    </main>
  );
}
