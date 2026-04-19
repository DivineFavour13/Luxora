import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import products from '../data/products-data.js';
import { addToCart, addToWishlist, getProducts, isInWishlist, removeFromWishlist } from '../utils/storage.js';
import { showNotification } from '../utils/notifications.js';
import { formatCurrency } from '../utils/format.js';
import { slugifyBrand } from '../utils/brands.js';

function byRatingThenReviews(a, b) {
  const byRating = Number(b.rating || 0) - Number(a.rating || 0);
  if (byRating !== 0) return byRating;
  return Number(b.reviews || 0) - Number(a.reviews || 0);
}

function byReviewsThenRating(a, b) {
  const byReviews = Number(b.reviews || 0) - Number(a.reviews || 0);
  if (byReviews !== 0) return byReviews;
  return Number(b.rating || 0) - Number(a.rating || 0);
}

function byNewest(a, b) {
  const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : Number(a.id || 0);
  const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : Number(b.id || 0);
  return bDate - aDate;
}

function selectShowcaseProducts(allProducts, predicate, primarySort, limit = 8) {
  const inStock = allProducts.filter((product) => Number(product.stock || 0) > 0 && product.inStock !== false);
  return inStock.filter(predicate).sort(primarySort).slice(0, limit);
}

function getSourceProductById(productId) {
  const parsed = Number(productId);
  if (!parsed) return null;
  return products.find((product) => Number(product?.id) === parsed) || null;
}

function mergeWithSourceProduct(product) {
  if (!product) return product;
  const sourceProduct = getSourceProductById(product.id);
  return sourceProduct ? { ...product, ...sourceProduct } : product;
}

function getHomeHeroProduct(catalogProducts = []) {
  const sourceHero = getSourceProductById(1);
  if (sourceHero) return sourceHero;

  const catalogHero = catalogProducts.find((product) => Number(product?.id) === 1);
  if (catalogHero) return mergeWithSourceProduct(catalogHero);

  return mergeWithSourceProduct(catalogProducts[0] || null);
}

function getHeroImageForColor(product, color) {
  const normalized = String(color || '').trim().toLowerCase();
  if (!product || !normalized) return product?.image || '';

  const colorSwapImages = product.heroImagesByColor || product.colorSwapImages || product.styleFilterImages || {};
  return colorSwapImages[normalized] || product.image || '';
}

function renderStars(rating = 4.5) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <>
      {Array.from({ length: full }).map((_, index) => <i key={`full-${index}`} className="fas fa-star"></i>)}
      {half ? <i key="half" className="fas fa-star-half-alt"></i> : null}
      {Array.from({ length: empty }).map((_, index) => <i key={`empty-${index}`} className="far fa-star"></i>)}
    </>
  );
}

function HeroCampaignCard({ heroProduct, heroImage, outfitProducts, onShopLook, onOpenProduct }) {
  return (
    <article className="lookbook-card lookbook-hero-card">
      <div className="lookbook-hero-copy">
        <span className="lookbook-chip">Editorial Campaign</span>
        <h1>Summer Street Collection</h1>
        <p>Minimal luxury essentials for everyday wear.</p>
        <button className="lookbook-primary-cta" onClick={onShopLook}>
          Shop This Look
        </button>
        <div className="lookbook-outfit-links">
          {outfitProducts.map((product, index) => (
            <button key={product.id} className="lookbook-outfit-link" onClick={() => onOpenProduct(product)}>
              <span>{`0${index + 1}`}</span>
              {product.name}
            </button>
          ))}
        </div>
      </div>
      <div className="lookbook-hero-visual">
        <img src={heroImage || heroProduct.image} alt={heroProduct.name} />
        <div className="lookbook-hotspots">
          {outfitProducts.map((product, index) => (
            <button
              key={`hotspot-${product.id}`}
              className={`lookbook-hotspot hotspot-${index + 1}`}
              onClick={() => onOpenProduct(product)}
              aria-label={`Open ${product.name}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function ColorFilterCard({ colors, activeColor, onColorSelect }) {
  return (
    <article className="lookbook-card lookbook-color-card">
      <div className="lookbook-card-head">
        <span className="lookbook-overline">Style Filter</span>
        <h3>Popular Colors</h3>
      </div>
      <div className="lookbook-color-swatches">
        {colors.map((color) => (
          <button
            key={color.name}
            className={`lookbook-swatch ${activeColor === color.slug ? 'active' : ''}`}
            style={{ '--swatch': color.value }}
            onClick={() => onColorSelect(color.slug)}
            aria-label={`Filter by ${color.name}`}
          >
            <span></span>
            <strong>{color.name}</strong>
          </button>
        ))}
      </div>
    </article>
  );
}

function NewArrivalCard({ product, onOpenProduct }) {
  return (
    <article className="lookbook-card lookbook-new-arrival-card">
      <div className="lookbook-card-head">
        <span className="lookbook-overline">Spotlight</span>
        <h3>New Arrival</h3>
      </div>
      <div className="lookbook-new-arrival-body">
        <img src={product.image} alt={product.name} />
        <div>
          <span className="lookbook-chip subtle">New Arrival</span>
          <h4>{product.name}</h4>
        </div>
        <button className="lookbook-arrow-btn" onClick={() => onOpenProduct(product)} aria-label={`Open ${product.name}`}>
          <i className="fas fa-arrow-up-right-from-square"></i>
        </button>
      </div>
    </article>
  );
}

function CategoryPromotionCard({ product, onExplore }) {
  const promoImages = useMemo(() => {
    const gallery = Array.isArray(product?.categoryPromoImages) && product.categoryPromoImages.length
      ? product.categoryPromoImages
      : Array.isArray(product?.collectionImages) && product.collectionImages.length
        ? product.collectionImages
        : [product?.image].filter(Boolean);

    return gallery.slice(0, 3);
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product]);

  useEffect(() => {
    if (promoImages.length <= 1) return undefined;

    const interval = setInterval(() => {
      setActiveImageIndex((current) => (current + 1) % promoImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [promoImages]);

  return (
    <article className="lookbook-card lookbook-category-card">
      <div
        className="lookbook-category-bg"
        style={{ backgroundImage: `url(${promoImages[activeImageIndex] || product.image})` }}
        aria-hidden="true"
      ></div>
      <img
        src={promoImages[activeImageIndex] || product.image}
        alt={product.name}
        className="lookbook-category-image"
      />
      <div className="lookbook-category-overlay">
        <span className="lookbook-chip">Collection</span>
        <h3>Luxury Streetwear</h3>
        <p>Premium everyday fits with a polished off-duty edge.</p>
        <button className="lookbook-secondary-cta" onClick={onExplore}>
          Explore Collection
        </button>
      </div>
    </article>
  );
}

function TrendingProductsCard({ products: trendingProducts, onOpenProduct }) {
  return (
    <article className="lookbook-card lookbook-trending-card">
      <div className="lookbook-card-head">
        <span className="lookbook-overline">Trending Now</span>
        <h3>Most Wanted Pieces</h3>
      </div>
      <div className="lookbook-trending-grid">
        {trendingProducts.map((product) => (
          <button key={product.id} className="lookbook-trending-item" onClick={() => onOpenProduct(product)}>
            <img src={product.image} alt={product.name} />
            <span>{product.name}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

function SocialProofCard() {
  return (
    <article className="lookbook-card lookbook-proof-card">
      <span className="lookbook-overline">Social Proof</span>
      <h3>Why Luxora Fashion Works</h3>
      <div className="lookbook-proof-metrics">
        <div>
          <strong>10k+</strong>
          <span>Happy Customers</span>
        </div>
        <div>
          <strong>4.8</strong>
          <span>Average Rating</span>
        </div>
        <div>
          <strong>Free</strong>
          <span>Shipping Over $100</span>
        </div>
      </div>
    </article>
  );
}

function BestSellerCard({ product, onOpenProduct, onAddToCart }) {
  return (
    <article className="lookbook-card lookbook-best-seller-card">
      <div className="lookbook-card-head">
        <span className="lookbook-overline">Best Seller</span>
        <h3>Editors' Favorite</h3>
      </div>
      <div className="lookbook-best-seller-body">
        <img src={product.image} alt={product.name} />
        <h4>{product.name}</h4>
        <div className="lookbook-rating-row">
          <div className="lookbook-stars">{renderStars(product.rating || 4.5)}</div>
          <span>{(product.rating || 4.5).toFixed(1)}</span>
        </div>
        <strong>{formatCurrency(product.price)}</strong>
        <div className="lookbook-best-seller-actions">
          <button className="lookbook-secondary-cta" onClick={() => onOpenProduct(product)}>View Product</button>
          <button className="lookbook-icon-btn" onClick={() => onAddToCart(product)} aria-label={`Add ${product.name} to cart`}>
            <i className="fas fa-shopping-bag"></i>
          </button>
        </div>
      </div>
    </article>
  );
}

function EditorialStrip({ title, route, products: stripProducts, onToggleWishlist, onAddToCart }) {
  return (
    <section className="lookbook-strip">
      <div className="lookbook-strip-head">
        <div>
          <span className="lookbook-overline">Storefront</span>
          <h2>{title}</h2>
        </div>
        <Link to={route} className="lookbook-inline-link">View all</Link>
      </div>
      <div className="lookbook-strip-scroller">
        {stripProducts.map((product) => {
          const inWishlist = isInWishlist(product.id);
          const currentPrice = product.flashPrice || product.price;
          return (
            <article className="lookbook-strip-item" key={product.id}>
              <button className={`lookbook-strip-wishlist ${inWishlist ? 'active' : ''}`} onClick={() => onToggleWishlist(product)} aria-label={`Wishlist ${product.name}`}>
                <i className={inWishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
              </button>
              <Link to={`/product?id=${product.id}`} className="lookbook-strip-image">
                <img src={product.image} alt={product.name} />
              </Link>
              <div className="lookbook-strip-copy">
                <span>{product.brand}</span>
                <h3><Link to={`/product?id=${product.id}`}>{product.name}</Link></h3>
                <strong>{formatCurrency(currentPrice)}</strong>
              </div>
              <button className="lookbook-strip-cta" onClick={() => onAddToCart(product)}>Add to Cart</button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState('12h : 00m : 00s');
  const [, setWishlistVersion] = useState(0);
  const [activeColor, setActiveColor] = useState('');
  const [catalogProducts, setCatalogProducts] = useState(() => {
    const stored = getProducts();
    return stored.length ? stored : products;
  });

  const fashionProducts = useMemo(() => {
    const fashionOnly = catalogProducts.filter((product) => String(product.category || '').toLowerCase() === 'fashion');
    return fashionOnly.length ? fashionOnly : catalogProducts;
  }, [catalogProducts]);

  const editorialProducts = fashionProducts;
  const heroProduct = getHomeHeroProduct(editorialProducts.length ? editorialProducts : catalogProducts);
  const outfitProducts = editorialProducts.slice(0, 3);
  const heroImage = useMemo(
    () => getHeroImageForColor(heroProduct, activeColor),
    [heroProduct, activeColor]
  );
  const newArrivalSpotlight =
    fashionProducts.find((product) => product.isNewArrival) ||
    editorialProducts.find((product) => product.id !== heroProduct?.id) ||
    heroProduct;
  const categoryPromoProduct = editorialProducts[1] || heroProduct;
  const trendingProducts = [...editorialProducts].sort(byReviewsThenRating).slice(0, 4);
  const bestSeller = [...editorialProducts].sort(byReviewsThenRating)[0] || heroProduct;

  const flashProducts = useMemo(
    () => selectShowcaseProducts(catalogProducts, (product) => product.isFlashSale, byRatingThenReviews, 6),
    [catalogProducts]
  );
  const topSellers = useMemo(
    () => selectShowcaseProducts(catalogProducts, (product) => product.isTopSeller, byReviewsThenRating, 6),
    [catalogProducts]
  );
  const newArrivals = useMemo(
    () => selectShowcaseProducts(catalogProducts, (product) => product.isNewArrival, byNewest, 6),
    [catalogProducts]
  );

  useEffect(() => {
    const syncProducts = () => {
      const stored = getProducts();
      setCatalogProducts(stored.length ? stored : products);
    };

    window.addEventListener('productsUpdated', syncProducts);
    return () => window.removeEventListener('productsUpdated', syncProducts);
  }, []);

  useEffect(() => {
    let endTime = localStorage.getItem('flash_sale_end_time');
    if (!endTime) {
      endTime = String(Date.now() + (12 * 60 * 60 * 1000));
      localStorage.setItem('flash_sale_end_time', endTime);
    }

    const tick = () => {
      const distance = parseInt(endTime, 10) - Date.now();
      if (distance <= 0) {
        setCountdown('SALE ENDED');
        localStorage.removeItem('flash_sale_end_time');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown(`${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = (product) => {
    if (!product || Number(product.stock || 0) <= 0 || product.inStock === false) {
      showNotification('This product is out of stock', 'warning');
      return;
    }

    addToCart(product, 1);
    showNotification(`${product.name} added to cart`, 'success');
  };

  const handleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showNotification(`${product.name} removed from wishlist`, 'info');
    } else {
      addToWishlist(product);
      showNotification(`${product.name} added to wishlist`, 'success');
    }

    setWishlistVersion((value) => value + 1);
  };

  const handleColorFilter = (color) => {
    setActiveColor((current) => (current === color ? '' : color));
  };

  const openProduct = (product) => navigate(`/product?id=${product.id}`);
  const openBrandCollection = (brand) => navigate(`/brand/${slugifyBrand(brand)}`);

  const colorOptions = [
    { name: 'Black', slug: 'black', value: '#151515' },
    { name: 'White', slug: 'white', value: '#f6f4ef' },
    { name: 'Beige', slug: 'beige', value: '#cdb8a3' },
    { name: 'Brown', slug: 'brown', value: '#8a5a44' },
    { name: 'Grey', slug: 'grey', value: '#7b8088' },
    { name: 'Green', slug: 'green', value: '#617a57' }
  ];

  if (!heroProduct || !newArrivalSpotlight || !categoryPromoProduct || !bestSeller) {
    return <main><div className="container"><p>No products available.</p></div></main>;
  }

  return (
    <main className="lookbook-home">
      <div className="container">
        <section className="lookbook-grid">
          <HeroCampaignCard
            heroProduct={heroProduct}
            heroImage={heroImage}
            outfitProducts={outfitProducts}
            onShopLook={() => openBrandCollection(heroProduct.brand)}
            onOpenProduct={openProduct}
          />

          <ColorFilterCard colors={colorOptions} activeColor={activeColor} onColorSelect={handleColorFilter} />

          <NewArrivalCard product={newArrivalSpotlight} onOpenProduct={openProduct} />

          <CategoryPromotionCard product={categoryPromoProduct} onExplore={() => openBrandCollection(categoryPromoProduct.brand)} />

          <TrendingProductsCard products={trendingProducts} onOpenProduct={openProduct} />

          <SocialProofCard />

          <BestSellerCard product={bestSeller} onOpenProduct={openProduct} onAddToCart={handleAddToCart} />
        </section>

        <section className="lookbook-status-bar">
          <span className="lookbook-overline">Filters</span>
          <div className="lookbook-status-pills">
            <span className="lookbook-pill">{activeColor ? `Color: ${activeColor}` : 'All Colors'}</span>
            <span className="lookbook-pill">Category: Fashion</span>
            <span className="lookbook-pill">Flash clock: {countdown}</span>
          </div>
        </section>

        <EditorialStrip
          title="Flash Sale Edit"
          route="/flash-sales"
          products={flashProducts}
          onToggleWishlist={handleWishlist}
          onAddToCart={handleAddToCart}
        />

        <EditorialStrip
          title="Top Sellers"
          route="/top-sellers"
          products={topSellers}
          onToggleWishlist={handleWishlist}
          onAddToCart={handleAddToCart}
        />

        <EditorialStrip
          title="New Arrivals"
          route="/new-arrivals"
          products={newArrivals}
          onToggleWishlist={handleWishlist}
          onAddToCart={handleAddToCart}
        />
      </div>

      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h3>Stay Updated with LUXORA</h3>
            <p>Subscribe to our newsletter for exclusive deals and latest updates</p>
            <form
              id="newsletter-form"
              className="newsletter-form"
              onSubmit={(event) => {
                event.preventDefault();
                const email = event.currentTarget.querySelector('#newsletter-email')?.value || '';
                if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  showNotification('Thank you for subscribing to our newsletter!', 'success');
                  event.currentTarget.reset();
                } else {
                  showNotification('Please enter a valid email address', 'error');
                }
              }}
            >
              <input type="email" id="newsletter-email" placeholder="Enter your email address" required />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
            <div className="newsletter-benefits">
              <span><i className="fas fa-check"></i> Exclusive deals</span>
              <span><i className="fas fa-check"></i> New arrivals</span>
              <span><i className="fas fa-check"></i> Special offers</span>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div className="container">
            <div className="row">
              <div className="col">
                <h4>NEW TO LUXORA?</h4>
                <p>Subscribe to our newsletter to get updates on our latest offers!</p>
                <form className="footer-newsletter" onSubmit={(event) => event.preventDefault()}>
                  <input type="email" placeholder="Enter E-mail Address" required />
                  <button type="submit">Subscribe</button>
                </form>
                <div className="policy-links">
                  <label>
                    <input type="checkbox" required />
                    I agree to LUXORA&apos;s Privacy and Cookie Policy
                  </label>
                  <a href="#" className="legal-terms" onClick={(event) => { event.preventDefault(); showNotification('Legal terms page is coming soon.', 'info'); }}>I accept the Legal Terms</a>
                </div>
              </div>
              <div className="col">
                <h4>DOWNLOAD LUXORA FREE APP</h4>
                <p>Get access to exclusive offers!</p>
                <div className="app-links">
                  <a href="#" target="_blank" rel="noreferrer" className="app-store">
                    <i className="fab fa-apple"></i>
                    <div>
                      <span>Download on the</span>
                      <strong>App Store</strong>
                    </div>
                  </a>
                  <a href="#" target="_blank" rel="noreferrer" className="google-play">
                    <i className="fab fa-google-play"></i>
                    <div>
                      <span>Get it on</span>
                      <strong>Google Play</strong>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-middle">
          <div className="container">
            <div className="row">
              <div className="col">
                <h4>NEED HELP?</h4>
                <ul>
                  <li><a href="#" onClick={(event) => { event.preventDefault(); showNotification('Chat support is coming soon.', 'info'); }}><i className="fas fa-comments"></i> Chat with us</a></li>
                  <li><a href="#" onClick={(event) => { event.preventDefault(); showNotification('Help Center is coming soon.', 'info'); }}><i className="fas fa-question-circle"></i> Help Center</a></li>
                  <li><a href="#" onClick={(event) => { event.preventDefault(); showNotification('Contact page is coming soon.', 'info'); }}><i className="fas fa-envelope"></i> Contact Us</a></li>
                </ul>
              </div>
              <div className="col">
                <h4>ABOUT LUXORA</h4>
                <ul>
                  <li><a href="#" onClick={(event) => { event.preventDefault(); showNotification('About Us page is coming soon.', 'info'); }}>About Us</a></li>
                  <li><a href="#" onClick={(event) => { event.preventDefault(); showNotification('Careers page is coming soon.', 'info'); }}>Careers</a></li>
                  <li><a href="#" onClick={(event) => { event.preventDefault(); showNotification('Blog is coming soon.', 'info'); }}>Our Blog</a></li>
                  <li><a href="#" onClick={(event) => { event.preventDefault(); showNotification('Terms & Conditions page is coming soon.', 'info'); }}>Terms & Conditions</a></li>
                  <li><a href="#" onClick={(event) => { event.preventDefault(); showNotification('Privacy Notice page is coming soon.', 'info'); }}>Privacy Notice</a></li>
                </ul>
              </div>
              <div className="col">
                <h4>PAYMENT METHODS & DELIVERY</h4>
                <div className="payment-methods">
                  <i className="fab fa-cc-visa" title="Visa"></i>
                  <i className="fab fa-cc-mastercard" title="Mastercard"></i>
                  <i className="fab fa-cc-paypal" title="PayPal"></i>
                  <i className="fab fa-cc-stripe" title="Stripe"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <p>&copy; 2025 LUXORA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
