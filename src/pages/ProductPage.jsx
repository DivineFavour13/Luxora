import { usePageMeta } from '../hooks/usePageMeta.js';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getProductById,
  getProducts,
  getCart,
  saveCart,
  addToCart,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  addToRecentlyViewed,
  getProductReviews,
  addProductReview,
  hasUserReviewed,
  getCurrentUser,
} from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';
import { slugifyBrand } from '../utils/brands.js';

/* ── helpers ── */
function renderStars(rating = 4.5) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <>
      {Array.from({ length: full }).map((_, i) => <i key={`f-${i}`} className="fas fa-star"></i>)}
      {half && <i className="fas fa-star-half-alt"></i>}
      {Array.from({ length: empty }).map((_, i) => <i key={`e-${i}`} className="far fa-star"></i>)}
    </>
  );
}

function getStockClass(stock) {
  if (stock === 0) return 'out-of-stock';
  if (stock <= 5) return 'low';
  if (stock <= 20) return 'medium';
  return 'high';
}

function getStockText(stock) {
  if (stock === 0) return 'Out of Stock';
  if (stock <= 5) return `Only ${stock} left!`;
  if (stock <= 20) return `${stock} in stock`;
  return 'In Stock';
}

function formatCategoryLabel(category) {
  if (!category) return 'Products';
  return category.toString().replace(/[-_]+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase());
}

/* ══ COMPONENT ══ */
export default function ProductPage() {
  const [params] = useSearchParams();
  const productId = params.get('id');

  const product = useMemo(() => {
    const parsed = parseInt(productId || '', 10);
    if (!parsed || Number.isNaN(parsed)) return null;
    return getProductById(parsed);
  }, [productId]);

  const allProducts = useMemo(() => getProducts() || [], []);

  usePageMeta({
    title: product ? `${product.name} — ${product.brand}` : 'Product',
    description: product ? product.description : 'Shop premium products on LUXORA.',
  });

  /* state */
  const [qty, setQty] = useState(1);
  const [inWish, setInWish] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  /* review state */
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [reviewRefresh, setReviewRefresh] = useState(0);

  /* load product */
  useEffect(() => {
    if (!product) return;
    addToRecentlyViewed(product);
    setReviews(getProductReviews(product.id));
    setShowReviewForm(false);
    setReviewForm({ rating: 5, title: '', body: '' });
    setInWish(isInWishlist(product.id));
    setSelectedImage(product.image || '');
    setSelectedColor(product.colors?.[0]?.name || product.colors?.[0] || null);
    setSelectedSize(product.sizes?.[0] || null);
    setQty(1);
  }, [product]);

  /* reload reviews after submit */
  useEffect(() => {
    if (!product) return;
    setReviews(getProductReviews(product.id));
  }, [product, reviewRefresh]);

  /* computed */
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : (product?.rating || 4.5).toFixed(1);

  const totalReviewCount = reviews.length || product?.reviews || 0;

  const discount = product?.originalPrice
    ? Math.round(100 - (product.price / product.originalPrice) * 100)
    : 0;

  const stockPercentage = product?.stockMax
    ? Math.floor(((product.stockMax - product.stock) / product.stockMax) * 100)
    : 0;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return [product.image, ...product.images.filter(img => img !== product.image)].slice(0, 6);
    }
    return [product.image];
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    let related = allProducts.filter(p => p.category === product.category && p.id !== product.id);
    if (related.length < 6) {
      const extra = allProducts
        .filter(p => p.id !== product.id && !related.find(r => r.id === p.id))
        .slice(0, 6 - related.length);
      related = [...related, ...extra];
    }
    return related.slice(0, 6);
  }, [allProducts, product]);

  const breadcrumbItems = useMemo(() => {
    if (!product) return [];
    const path = [{ label: 'Home', to: '/' }];
    if (product.category) path.push({ label: formatCategoryLabel(product.category), to: `/search?q=${product.category}` });
    if (product.brand) path.push({ label: product.brand, to: `/brand/${slugifyBrand(product.brand)}` });
    path.push({ label: product.name });
    return path;
  }, [product]);

  /* not found */
  if (!product) {
    return (
      <main>
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <i className="fas fa-box-open" style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'block' }}></i>
          <h2>Product not found</h2>
          <Link to="/" className="btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>
            <i className="fas fa-home"></i> Back to Home
          </Link>
        </div>
      </main>
    );
  }

  /* handlers */
  const handleToggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showNotification(`${product.name} removed from wishlist`, 'info');
      setInWish(false);
    } else {
      addToWishlist(product);
      showNotification(`${product.name} added to wishlist`, 'success');
      setInWish(true);
    }
  };

  const handleAddToCart = () => {
    if (product.stock === 0) { showNotification('This item is out of stock', 'error'); return; }
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id && item.color === selectedColor && item.size === selectedSize);
    if (existing) { existing.quantity += qty; saveCart(cart); }
    else { addToCart({ ...product, color: selectedColor, size: selectedSize }, qty); }
    showNotification(`${product.name} added to cart`, 'success');
  };

  const handleBuyNow = () => { handleAddToCart(); window.location.href = '/cart'; };

  const handleAddRelated = (p) => {
    if (p.stock === 0) { showNotification('This item is out of stock', 'error'); return; }
    addToCart(p, 1);
    showNotification(`${p.name} added to cart`, 'success');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) { showNotification('Please log in to write a review', 'warning'); return; }
    if (!reviewForm.title.trim() || !reviewForm.body.trim()) { showNotification('Please fill in all fields', 'error'); return; }
    if (hasUserReviewed(product.id, user.email)) { showNotification('You have already reviewed this product', 'info'); return; }
    addProductReview(product.id, {
      rating: reviewForm.rating,
      title: reviewForm.title.trim(),
      body: reviewForm.body.trim(),
      userName: user.name || 'Anonymous',
      userEmail: user.email,
    });
    setReviewForm({ rating: 5, title: '', body: '' });
    setShowReviewForm(false);
    setReviewRefresh(v => v + 1);
    showNotification('Review submitted! Thank you.', 'success');
  };

  /* Size Guide — defined inside so it closes over product + setSizeGuideOpen */
  const SizeGuideModal = () => {
    const sizes = product.sizes || [];
    const isShoe = sizes.some(s => !isNaN(Number(s)) && Number(s) > 20);
    const isClothing = sizes.some(s => ['XS', 'S', 'M', 'L', 'XL'].includes(String(s).toUpperCase()));
    const isWaist = sizes.some(s => !isNaN(Number(s)) && Number(s) >= 26 && Number(s) <= 44);
    return (
      <div className="size-guide-overlay" onClick={() => setSizeGuideOpen(false)}>
        <div className="size-guide-modal" onClick={e => e.stopPropagation()}>
          <div className="size-guide-header">
            <h3><i className="fas fa-ruler"></i> Size Guide</h3>
            <button className="size-guide-close" onClick={() => setSizeGuideOpen(false)}><i className="fas fa-times"></i></button>
          </div>
          <div className="size-guide-body">
            {isShoe && (
              <table className="size-table">
                <thead><tr><th>EU</th><th>UK</th><th>US</th><th>CM</th></tr></thead>
                <tbody>
                  {[[36,'3.5','4.5','22.5'],[37,'4','5','23.5'],[38,'5','6','24'],[39,'5.5','6.5','24.5'],[40,'6','7','25.5'],[41,'7','8','26'],[42,'7.5','8.5','26.5'],[43,'8.5','9.5','27.5'],[44,'9','10','28'],[45,'10','11','28.5'],[46,'11','12','29.5']].map(([eu,uk,us,cm]) => (
                    <tr key={eu} className={sizes.includes(String(eu)) ? 'size-available' : 'size-unavailable'}>
                      <td>{eu}</td><td>{uk}</td><td>{us}</td><td>{cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {isClothing && (
              <table className="size-table">
                <thead><tr><th>Size</th><th>Chest (cm)</th><th>Waist (cm)</th><th>Hips (cm)</th></tr></thead>
                <tbody>
                  {[['XS','80-84','60-64','86-90'],['S','84-88','64-68','90-94'],['M','88-92','68-72','94-98'],['L','92-96','72-76','98-102'],['XL','96-100','76-80','102-106'],['2XL','100-104','80-84','106-110']].map(([s,c,w,h]) => (
                    <tr key={s} className={sizes.includes(s) ? 'size-available' : 'size-unavailable'}>
                      <td><strong>{s}</strong></td><td>{c}</td><td>{w}</td><td>{h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {isWaist && !isClothing && (
              <table className="size-table">
                <thead><tr><th>Waist (in)</th><th>Waist (cm)</th><th>Hip (cm)</th></tr></thead>
                <tbody>
                  {[['28','71','91'],['30','76','96'],['32','81','101'],['34','86','106'],['36','91','111'],['38','97','117'],['40','102','122']].map(([w,wc,h]) => (
                    <tr key={w} className={sizes.includes(w) ? 'size-available' : 'size-unavailable'}>
                      <td><strong>{w}"</strong></td><td>{wc}</td><td>{h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!isShoe && !isClothing && !isWaist && (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Please refer to the product description for sizing details.</p>
            )}
            <p className="size-guide-tip"><i className="fas fa-info-circle"></i> Highlighted rows = sizes available for this product. When in doubt, size up.</p>
          </div>
        </div>
      </div>
    );
  };

  /* ── RENDER ── */
  return (
    <main>
      <div className="container">

        {/* Breadcrumb */}
        <div className="breadcrumb product-breadcrumb">
          <div className="product-breadcrumb-list">
            {breadcrumbItems.map((item, i) => {
              const isLast = i === breadcrumbItems.length - 1;
              return (
                <div key={`${item.label}-${i}`} className={`product-breadcrumb-item ${isLast ? 'current' : ''}`}>
                  {!isLast && item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
                  {!isLast && <span className="product-breadcrumb-separator">&gt;</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Product detail */}
        <div className="product-details" id="product-details">

          {/* Images */}
          <div className="product-images">
            <div className="main-image">
              <img src={selectedImage || product.image} alt={product.name} id="main-product-image" />
              {discount > 0 && <div className="image-badge">-{discount}% OFF</div>}
              <button className={`wishlist-btn ${inWish ? 'active' : ''}`} onClick={handleToggleWishlist}>
                <i className={inWish ? 'fas fa-heart' : 'far fa-heart'}></i>
              </button>
            </div>
            <div className="thumbnail-images">
              {galleryImages.map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  className={`thumbnail ${img === (selectedImage || product.image) ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={product.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating">
              <div className="rating-stars">
                <div className="stars">{renderStars(parseFloat(avgRating))}</div>
                <span className="rating-score">{avgRating}</span>
              </div>
              <div className="rating-count">
                <button
                  className="review-anchor-btn"
                  onClick={() => setActiveTab('reviews')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: 'inherit', padding: 0, textDecoration: 'underline' }}
                >
                  ({totalReviewCount} reviews)
                </button>
              </div>
            </div>

            <div className="product-price">
              <span className="current-price">{formatCurrency(product.price)}</span>
              {product.originalPrice && <span className="old-price">{formatCurrency(product.originalPrice)}</span>}
              {discount > 0 && <span className="discount-percentage">-{discount}%</span>}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {Array.isArray(product.features) && product.features.length > 0 && (
              <div className="product-features">
                <h4>Key Features</h4>
                <ul className="features-list">
                  {product.features.map((f, i) => <li key={i}><i className="fas fa-check"></i> {f}</li>)}
                </ul>
              </div>
            )}

            <div className="stock-info">
              <div className="stock-status">
                <span>Availability:</span>
                <span className={`stock-count ${getStockClass(product.stock)}`}>{getStockText(product.stock)}</span>
              </div>
              {product.stock > 0 && (
                <>
                  <div className="stock-bar">
                    <div className="stock-progress" style={{ width: `${stockPercentage}%` }}></div>
                  </div>
                  <p className="stock-text">{product.stock} items left</p>
                </>
              )}
            </div>

            {/* Colors */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div className="product-options">
                <div className="option-group">
                  <h4>Color: <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{selectedColor}</span></h4>
                  <div className="color-options">
                    {product.colors.map((color, idx) => {
                      const name = color.name || color;
                      const hex = color.hex || color.value || color;
                      return (
                        <div
                          key={`${name}-${idx}`}
                          className={`color-option ${selectedColor === name ? 'active' : ''}`}
                          style={{ backgroundColor: hex }}
                          title={name}
                          onClick={() => setSelectedColor(name)}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Sizes */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="product-options">
                <div className="option-group">
                  <div className="size-guide-row">
                    <h4>Size: <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{selectedSize}</span></h4>
                    <button className="size-guide-link" onClick={() => setSizeGuideOpen(true)}>
                      <i className="fas fa-ruler"></i> Size Guide
                    </button>
                  </div>
                  <div className="size-options">
                    {product.sizes.map((size, idx) => (
                      <div
                        key={`${size}-${idx}`}
                        className={`size-option ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="product-actions">
              <div className="quantity-selector">
                <label htmlFor="quantity-input">Quantity:</label>
                <div className="quantity-controls">
                  <button className="quantity-btn" disabled={qty <= 1 || product.stock === 0} onClick={() => setQty(q => Math.max(1, q - 1))}>
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    id="quantity-input"
                    className="quantity-input"
                    value={qty}
                    min="1"
                    max={product.stock}
                    disabled={product.stock === 0}
                    onChange={e => {
                      const next = parseInt(e.target.value || '1', 10);
                      if (!Number.isNaN(next)) setQty(Math.max(1, Math.min(product.stock || 1, next)));
                    }}
                  />
                  <button className="quantity-btn" disabled={qty >= (product.stock || 1) || product.stock === 0} onClick={() => setQty(q => Math.min(product.stock || 1, q + 1))}>
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
              <button className="add-to-cart-btn" disabled={product.stock === 0} onClick={handleAddToCart}>
                <i className="fas fa-shopping-cart"></i>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button className="buy-now-btn" disabled={product.stock === 0} onClick={handleBuyNow}>
                <i className="fas fa-bolt"></i> Buy Now
              </button>
            </div>

            {/* Meta */}
            <div className="product-meta">
              <div className="meta-row"><span>Category:</span><span style={{ textTransform: 'capitalize' }}>{product.category}</span></div>
              <div className="meta-row"><span>SKU:</span><span>LUX-{product.id}</span></div>
              <div className="meta-row">
                <span>Brand:</span>
                <span>{product.brand ? <Link to={`/brand/${slugifyBrand(product.brand)}`}>{product.brand}</Link> : 'LUXORA'}</span>
              </div>
              {product.warranty && <div className="meta-row"><span>Warranty:</span><span>{product.warranty}</span></div>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tab-nav">
            <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
            <button className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`} onClick={() => setActiveTab('specifications')}>Specifications</button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              Reviews ({totalReviewCount})
            </button>
            <button className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>Shipping & Returns</button>
          </div>

          <div className="tab-content">

            {/* Description tab */}
            <div className={`tab-pane ${activeTab === 'description' ? 'active' : ''}`}>
              <div className="product-description">
                <p>{product.description}</p>
                {product.longDescription && <p>{product.longDescription}</p>}
                {Array.isArray(product.features) && product.features.length > 0 && (
                  <>
                    <h3>Features & Benefits</h3>
                    <ul>{product.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
                  </>
                )}
              </div>
            </div>

            {/* Specifications tab */}
            <div className={`tab-pane ${activeTab === 'specifications' ? 'active' : ''}`}>
              <div className="product-specs">
                <div className="spec-category">
                  <h4>General</h4>
                  <div className="spec-list">
                    <div className="spec-item"><span className="spec-label">Brand:</span><span className="spec-value">{product.brand || 'LUXORA'}</span></div>
                    <div className="spec-item"><span className="spec-label">SKU:</span><span className="spec-value">LUX-{product.id}</span></div>
                    <div className="spec-item"><span className="spec-label">Category:</span><span className="spec-value" style={{ textTransform: 'capitalize' }}>{product.category}</span></div>
                  </div>
                </div>
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="spec-category">
                    <h4>Details</h4>
                    <div className="spec-list">
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <div className="spec-item" key={key}>
                          <span className="spec-label">{key}:</span>
                          <span className="spec-value">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews tab — FULLY LIVE */}
            <div className={`tab-pane ${activeTab === 'reviews' ? 'active' : ''}`}>
              <div className="product-reviews">

                {/* Summary */}
                <div className="reviews-summary">
                  <div className="rating-overview">
                    <div className="overall-rating">
                      <span className="rating-score">{avgRating}</span>
                      <div className="stars">{renderStars(parseFloat(avgRating))}</div>
                      <span className="rating-count">Based on {totalReviewCount} reviews</span>
                    </div>
                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const pct = reviews.length ? Math.round((count / reviews.length) * 100) : star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1;
                        return (
                          <div key={star} className="rating-bar-row">
                            <span>{star} <i className="fas fa-star" style={{ color: 'var(--accent-color)', fontSize: '0.7rem' }}></i></span>
                            <div className="rating-bar-track"><div className="rating-bar-fill" style={{ width: `${pct}%` }}></div></div>
                            <span>{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => setShowReviewForm(v => !v)}>
                    <i className="fas fa-pen"></i> {showReviewForm ? 'Cancel' : 'Write a Review'}
                  </button>
                </div>

                {/* Review form */}
                {showReviewForm && (
                  <form className="review-form" onSubmit={handleSubmitReview}>
                    <h4>Your Review</h4>
                    <div className="review-star-picker">
                      <label>Rating</label>
                      <div className="star-picker">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            className={`star-pick ${reviewForm.rating >= n ? 'filled' : ''}`}
                            onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                          >
                            <i className="fas fa-star"></i>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        className="form-control"
                        value={reviewForm.title}
                        onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Summarise your experience"
                        maxLength={80}
                      />
                    </div>
                    <div className="form-group">
                      <label>Review *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={reviewForm.body}
                        onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                        placeholder="What did you like or dislike? How was the quality, fit, or delivery?"
                        maxLength={1000}
                      ></textarea>
                    </div>
                    <button type="submit" className="btn-primary"><i className="fas fa-check"></i> Submit Review</button>
                  </form>
                )}

                {/* Review list */}
                <div className="reviews-list">
                  {reviews.length === 0 ? (
                    <div className="reviews-empty">
                      <i className="fas fa-comment-dots"></i>
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  ) : reviews.map(r => (
                    <div key={r.id} className="review-card">
                      <div className="review-card-header">
                        <div className="review-avatar">{(r.userName || 'A')[0].toUpperCase()}</div>
                        <div className="review-meta">
                          <strong>{r.userName || 'Anonymous'}</strong>
                          <div className="review-stars">{renderStars(r.rating)}</div>
                        </div>
                        <span className="review-date">
                          {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <h5 className="review-title">{r.title}</h5>
                      <p className="review-body">{r.body}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Shipping tab */}
            <div className={`tab-pane ${activeTab === 'shipping' ? 'active' : ''}`}>
              <div className="shipping-info">
                <h3>Shipping Information</h3>
                <div className="shipping-options">
                  <div className="shipping-option">
                    <i className="fas fa-shipping-fast"></i>
                    <div><h4>Express Delivery</h4><p>1-2 business days — ₦2,500</p></div>
                  </div>
                  <div className="shipping-option">
                    <i className="fas fa-truck"></i>
                    <div><h4>Standard Delivery</h4><p>3-5 business days — ₦1,500</p></div>
                  </div>
                  <div className="shipping-option">
                    <i className="fas fa-map-marker-alt"></i>
                    <div><h4>Lagos Same-Day</h4><p>Order before 12pm — ₦3,500</p></div>
                  </div>
                </div>
                <h3>Returns Policy</h3>
                <ul>
                  <li>Free returns within 7 days of delivery</li>
                  <li>Items must be unused and in original packaging</li>
                  <li>Full refund or store credit available</li>
                  <li>Contact support to initiate a return</li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>You May Also Like</h2>
            <div className="product-grid">
              {relatedProducts.map(p => {
                const d = p.originalPrice ? Math.round(100 - (p.price / p.originalPrice) * 100) : 0;
                return (
                  <div className="product-card" key={p.id}>
                    <div className="product-image">
                      <Link to={`/product?id=${p.id}`}>
                        <img src={p.image} alt={p.name} loading="lazy" />
                        {d > 0 && <div className="discount-badge">-{d}%</div>}
                      </Link>
                    </div>
                    <div className="product-info">
                      <h3><Link to={`/product?id=${p.id}`}>{p.name}</Link></h3>
                      <div className="rating">
                        <div className="stars">{renderStars(p.rating || 4.5)}</div>
                      </div>
                      <div className="price">
                        {formatCurrency(p.flashPrice || p.price)}
                        {p.originalPrice && <span className="old-price">{formatCurrency(p.originalPrice)}</span>}
                      </div>
                      <button className="add-to-cart btn-primary" onClick={() => handleAddRelated(p)}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>

      {sizeGuideOpen && <SizeGuideModal />}
    </main>
  );
}
