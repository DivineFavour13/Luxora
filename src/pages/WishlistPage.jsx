import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getWishlist,
  saveWishlist,
  removeFromWishlist,
  addToCart,
  getProductById,
  getProducts
} from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(() => getWishlist());

  useEffect(() => {
    const onUpdate = () => setWishlist(getWishlist());
    window.addEventListener('wishlistUpdated', onUpdate);
    return () => window.removeEventListener('wishlistUpdated', onUpdate);
  }, []);

  const handleClear = () => {
    if (!confirm('Clear all items from your wishlist?')) return;
    saveWishlist([]);
    setWishlist([]);
    showNotification('Wishlist cleared', 'info');
  };

  const handleRemove = (id) => {
    removeFromWishlist(id);
    setWishlist(getWishlist());
  };

  const handleAddToCart = (id) => {
    const product = getProductById(id) || wishlist.find(w => w.id === id);
    if (!product) return;
    addToCart(product, 1);
    showNotification(`${product.name} added to cart`, 'success');
  };

  const recommendations = (getProducts() || []).filter(p => !wishlist.find(w => w.id === p.id)).slice(0, 6);

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Wishlist</span>
        </div>

        <div className="wishlist-header">
          <h1><i className="fas fa-heart"></i> My Wishlist</h1>
          <div className="wishlist-actions">
            <button id="clear-wishlist" className="btn-secondary" onClick={handleClear}>
              <i className="fas fa-trash"></i> Clear Wishlist
            </button>
            <Link to="/" className="btn-outline">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>

        <div className="wishlist-summary">
          <span id="wishlist-count">{wishlist.length}</span> items saved
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist" id="empty-wishlist">
            <div className="empty-wishlist-content">
              <i className="fas fa-heart"></i>
              <h2>Your wishlist is empty</h2>
              <p>Save items you love to find them all in one place.</p>
              <Link to="/" className="btn-primary">
                <i className="fas fa-arrow-left"></i> Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="wishlist-grid" id="wishlist-grid">
            {wishlist.map(item => (
              <div className="wishlist-card product-card" key={item.id}>
                <div className="product-image">
                  <img src={item.image} alt={item.name} />
                  <div className="product-actions">
                    <Link to={`/product?id=${item.id}`} title="View Product">
                      <i className="fas fa-eye"></i>
                    </Link>
                    <button type="button" title="Remove" onClick={() => handleRemove(item.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="product-info">
                  <div className="product-category">{item.category || 'General'}</div>
                  <h4>{item.name}</h4>
                  <div className="product-price">
                    <span className="current-price">{formatCurrency(item.price)}</span>
                    {item.originalPrice ? <span className="original-price">{formatCurrency(item.originalPrice)}</span> : null}
                  </div>
                  <div className="wishlist-card-actions">
                    <button className="btn-primary" onClick={() => handleAddToCart(item.id)}>
                      <i className="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button className="btn-outline" onClick={() => handleRemove(item.id)}>
                      <i className="fas fa-heart-broken"></i> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <section className="recommended-products" id="wishlist-recommendations">
          <h2>You Might Also Like</h2>
          <div className="wishlist-recommended-grid" id="wishlist-recommended-grid">
            {recommendations.map(p => (
              <div className="wishlist-card product-card" key={p.id}>
                <div className="product-image">
                  <img src={p.image} alt={p.name} />
                </div>
                <div className="product-info">
                  <div className="product-category">{p.category || 'General'}</div>
                  <h4>{p.name}</h4>
                  <div className="product-price">
                    <span className="current-price">{formatCurrency(p.price)}</span>
                  </div>
                  <div className="wishlist-card-actions">
                    <button className="btn-primary" onClick={() => handleAddToCart(p.id)}>
                      <i className="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <Link to={`/product?id=${p.id}`} className="btn-outline">
                      <i className="fas fa-eye"></i> View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
