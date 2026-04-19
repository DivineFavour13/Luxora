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
  addToRecentlyViewed
} from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';
import { slugifyBrand } from '../utils/brands.js';

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <>
      {Array.from({ length: full }).map((_, i) => <i key={`f-${i}`} className="fas fa-star"></i>)}
      {half ? <i className="fas fa-star-half-alt"></i> : null}
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
  return category
    .toString()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ProductPage() {
  const [params] = useSearchParams();
  const productId = params.get('id');
  const product = useMemo(() => {
    const parsed = parseInt(productId || '', 10);
    if (!parsed || Number.isNaN(parsed)) return null;
    return getProductById(parsed);
  }, [productId]);

  const allProducts = useMemo(() => getProducts() || [], []);

  const [qty, setQty] = useState(1);
  const [inWish, setInWish] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviewCount] = useState(() => Math.floor(Math.random() * 500) + 50);

  useEffect(() => {
    if (!product) return;
    addToRecentlyViewed(product);
    setInWish(isInWishlist(product.id));
    setSelectedImage(product.image || '');
    setSelectedColor(product.colors?.[0]?.name || product.colors?.[0] || null);
    setSelectedSize(product.sizes?.[0] || null);
    setQty(1);
  }, [product]);

  const discount = product?.originalPrice ? Math.round(100 - (product.price / product.originalPrice) * 100) : 0;
  const stockPercentage = product?.stockMax ? Math.floor(((product.stockMax - product.stock) / product.stockMax) * 100) : 0;

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return [product.image, ...product.images.filter((img) => img !== product.image)].slice(0, 6);
    }
    if (typeof product.image === 'string') {
      const base = product.image;
      return [
        base,
        base.replace(/\.jpg/i, '_2.jpg'),
        base.replace(/\.jpg/i, '_3.jpg'),
        base.replace(/\.jpg/i, '_4.jpg')
      ];
    }
    return [product.image];
  }, [product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    let related = allProducts.filter((p) => p.category === product.category && p.id !== product.id);
    if (related.length < 6) {
      const additional = allProducts
        .filter((p) => p.id !== product.id && !related.find((r) => r.id === p.id))
        .slice(0, 6 - related.length);
      related = [...related, ...additional];
    }
    return related.slice(0, 6);
  }, [allProducts, product]);

  const breadcrumbItems = useMemo(() => {
    if (!product) return [];

    const path = [{ label: 'Home', to: '/' }];

    if (product.category) {
      path.push({
        label: formatCategoryLabel(product.category),
        to: `/?category=${encodeURIComponent(product.category)}`
      });
    }

    if (product.brand) {
      path.push({ label: product.brand, to: `/brand/${slugifyBrand(product.brand)}` });
    }

    path.push({ label: product.name });
    return path;
  }, [product]);

  if (!product) {
    return (
      <main>
        <div className="container">
          <p>Product not found.</p>
        </div>
      </main>
    );
  }

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
    if (product.stock === 0) {
      showNotification('This item is out of stock', 'error');
      return;
    }

    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id && item.color === selectedColor && item.size === selectedSize);

    if (existing) {
      existing.quantity += qty;
      saveCart(cart);
    } else {
      addToCart({ ...product, color: selectedColor, size: selectedSize }, qty);
    }
    showNotification(`${product.name} added to cart`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/cart';
  };

  const handleAddRelated = (p) => {
    if (p.stock === 0) {
      showNotification('This item is out of stock', 'error');
      return;
    }
    addToCart(p, 1);
    showNotification(`${p.name} added to cart`, 'success');
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb product-breadcrumb">
          <div className="product-breadcrumb-list">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;
              return (
                <div
                  key={`${item.label}-${index}`}
                  className={`product-breadcrumb-item ${isLast ? 'current' : ''}`}
                >
                  {!isLast && item.to ? (
                    <Link to={item.to}>{item.label}</Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                  {!isLast ? <span className="product-breadcrumb-separator">&gt;</span> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="product-details" id="product-details">
          <div className="product-images">
            <div className="main-image">
              <img src={selectedImage || product.image} alt={product.name} id="main-product-image" />
              {discount > 0 ? <div className="image-badge">-{discount}% OFF</div> : null}
              <button className={`wishlist-btn ${inWish ? 'active' : ''}`} data-id={product.id} onClick={handleToggleWishlist}>
                <i className={inWish ? 'fas fa-heart' : 'far fa-heart'}></i>
              </button>
            </div>
            <div className="thumbnail-images">
              {galleryImages.map((img, idx) => (
                <div key={`${img}-${idx}`} className={`thumbnail ${img === (selectedImage || product.image) ? 'active' : ''}`} onClick={() => setSelectedImage(img)}>
                  <img src={img} alt={product.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
              ))}
            </div>
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>

            <div className="product-rating">
              <div className="rating-stars">
                <div className="stars">{renderStars(product.rating || 4.5)}</div>
                <span className="rating-score">{(product.rating || 4.5).toFixed(1)}</span>
              </div>
              <div className="rating-count">
                <a href="#reviews-tab">({reviewCount} reviews)</a>
              </div>
            </div>

            <div className="product-price">
              <span className="current-price">{formatCurrency(product.price)}</span>
              {product.originalPrice ? <span className="old-price">{formatCurrency(product.originalPrice)}</span> : null}
              {discount > 0 ? <span className="discount-percentage">-{discount}%</span> : null}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {Array.isArray(product.features) && product.features.length > 0 ? (
              <div className="product-features">
                <h4>Key Features</h4>
                <ul className="features-list">
                  {product.features.map((feature, idx) => (
                    <li key={idx}><i className="fas fa-check"></i> {feature}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="stock-info">
              <div className="stock-status">
                <span>Availability:</span>
                <span className={`stock-count ${getStockClass(product.stock)}`}>{getStockText(product.stock)}</span>
              </div>
              {product.stock > 0 ? (
                <>
                  <div className="stock-bar">
                    <div className="stock-progress" style={{ width: `${stockPercentage}%` }}></div>
                  </div>
                  <p className="stock-text">{product.stock} items left - {stockPercentage}% sold</p>
                </>
              ) : null}
            </div>

            {Array.isArray(product.colors) && product.colors.length > 0 ? (
              <div className="product-options">
                <div className="option-group">
                  <h4>Color:</h4>
                  <div className="color-options">
                    {product.colors.map((color, idx) => {
                      const name = color.name || color;
                      const value = color.value || color;
                      return (
                        <div
                          key={`${name}-${idx}`}
                          className={`color-option ${selectedColor === name ? 'active' : ''}`}
                          style={{ backgroundColor: value }}
                          data-color={name}
                          title={name}
                          onClick={() => setSelectedColor(name)}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {Array.isArray(product.sizes) && product.sizes.length > 0 ? (
              <div className="product-options">
                <div className="option-group">
                  <h4>Size:</h4>
                  <div className="size-options">
                    {product.sizes.map((size, idx) => (
                      <div
                        key={`${size}-${idx}`}
                        className={`size-option ${selectedSize === size ? 'active' : ''}`}
                        data-size={size}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="product-actions">
              <div className="quantity-selector">
                <label htmlFor="quantity-input">Quantity:</label>
                <div className="quantity-controls">
                  <button className="quantity-btn" id="decrease-qty" disabled={qty <= 1 || product.stock === 0} onClick={() => setQty((q) => Math.max(1, q - 1))}>
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
                    onChange={(e) => {
                      const next = parseInt(e.target.value || '1', 10);
                      if (Number.isNaN(next)) return setQty(1);
                      setQty(Math.max(1, Math.min(product.stock || 1, next)));
                    }}
                  />
                  <button className="quantity-btn" id="increase-qty" disabled={qty >= (product.stock || 1) || product.stock === 0} onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}>
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <button className="add-to-cart-btn" id="add-to-cart-btn" disabled={product.stock === 0} onClick={handleAddToCart}>
                <i className="fas fa-shopping-cart"></i>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button className="buy-now-btn" id="buy-now-btn" disabled={product.stock === 0} onClick={handleBuyNow}>
                <i className="fas fa-bolt"></i>
                Buy Now
              </button>
            </div>

            <div className="product-meta">
              <div className="meta-row">
                <span>Category:</span>
                <span><Link to={`/?category=${product.category}`}>{product.category}</Link></span>
              </div>
              <div className="meta-row">
                <span>SKU:</span>
                <span>LUX-{product.id}</span>
              </div>
              <div className="meta-row">
                <span>Brand:</span>
                <span>
                  {product.brand ? <Link to={`/brand/${slugifyBrand(product.brand)}`}>{product.brand}</Link> : 'LUXORA'}
                </span>
              </div>
              {product.warranty ? (
                <div className="meta-row">
                  <span>Warranty:</span>
                  <span>{product.warranty}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="product-tabs">
          <div className="tab-nav">
            <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} data-tab="description" onClick={() => setActiveTab('description')}>Description</button>
            <button className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`} data-tab="specifications" onClick={() => setActiveTab('specifications')}>Specifications</button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} data-tab="reviews" onClick={() => setActiveTab('reviews')}>Reviews (<span id="review-count">{reviewCount}</span>)</button>
            <button className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`} data-tab="shipping" onClick={() => setActiveTab('shipping')}>Shipping & Returns</button>
          </div>

          <div className="tab-content">
            <div className={`tab-pane ${activeTab === 'description' ? 'active' : ''}`} id="description-tab">
              <div className="product-description" id="product-description">
                <p>{product.description}</p>
                {product.longDescription ? <p>{product.longDescription}</p> : null}
                {Array.isArray(product.features) && product.features.length > 0 ? (
                  <>
                    <h3>Features & Benefits</h3>
                    <ul>
                      {product.features.map((feature, idx) => <li key={idx}>{feature}</li>)}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>

            <div className={`tab-pane ${activeTab === 'specifications' ? 'active' : ''}`} id="specifications-tab">
              <div className="product-specs" id="product-specs">
                <div className="spec-category">
                  <h4>General</h4>
                  <div className="spec-list">
                    <div className="spec-item"><span className="spec-label">Brand:</span><span className="spec-value">{product.brand || 'LUXORA'}</span></div>
                    <div className="spec-item"><span className="spec-label">Model:</span><span className="spec-value">LUX-{product.id}</span></div>
                    <div className="spec-item"><span className="spec-label">Category:</span><span className="spec-value">{product.category}</span></div>
                    <div className="spec-item"><span className="spec-label">Weight:</span><span className="spec-value">{product.weight || 'N/A'}</span></div>
                    <div className="spec-item"><span className="spec-label">Dimensions:</span><span className="spec-value">{product.dimensions || 'N/A'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`tab-pane ${activeTab === 'reviews' ? 'active' : ''}`} id="reviews-tab">
              <div className="product-reviews">
                <div className="reviews-summary">
                  <div className="rating-overview">
                    <div className="overall-rating">
                      <span className="rating-score">4.5</span>
                      <div className="stars">{renderStars(4.5)}</div>
                      <span className="rating-count">Based on {reviewCount} reviews</span>
                    </div>
                  </div>
                  <button className="btn-primary" id="write-review-btn">Write a Review</button>
                </div>
                <div className="reviews-list" id="reviews-list"></div>
              </div>
            </div>

            <div className={`tab-pane ${activeTab === 'shipping' ? 'active' : ''}`} id="shipping-tab">
              <div className="shipping-info">
                <h3>Shipping Information</h3>
                <div className="shipping-options">
                  <div className="shipping-option">
                    <i className="fas fa-shipping-fast"></i>
                    <div>
                      <h4>Express Delivery</h4>
                      <p>1-2 business days - ₦2,500</p>
                    </div>
                  </div>
                  <div className="shipping-option">
                    <i className="fas fa-truck"></i>
                    <div>
                      <h4>Standard Delivery</h4>
                      <p>3-5 business days - ₦1,500</p>
                    </div>
                  </div>
                </div>
                <h3>Returns Policy</h3>
                <ul>
                  <li>Free returns within 7 days</li>
                  <li>Items must be in original condition</li>
                  <li>Full refund or exchange available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="related-products">
          <h2>Related Products</h2>
          <div className="product-grid" id="related-products-grid">
            {relatedProducts.map((p) => {
              const d = p.originalPrice ? Math.round(100 - (p.price / p.originalPrice) * 100) : 0;
              return (
                <div className="product-card" key={p.id}>
                  <div className="product-image">
                    <Link to={`/product?id=${p.id}`}>
                      <img src={p.image} alt={p.name} loading="lazy" />
                      {d > 0 ? <div className="discount-badge">-{d}%</div> : null}
                    </Link>
                  </div>
                  <div className="product-info">
                    <h3><Link to={`/product?id=${p.id}`}>{p.name}</Link></h3>
                    <div className="rating">
                      <div className="stars">{renderStars(p.rating || 4.5)}</div>
                    </div>
                    <div className="price">
                      {formatCurrency(p.price)}
                      {p.originalPrice ? <span className="old-price">{formatCurrency(p.originalPrice)}</span> : null}
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
      </div>
    </main>
  );
}
