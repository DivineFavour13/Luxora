import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProducts, addToCart, addToWishlist, removeFromWishlist, isInWishlist } from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';
import { findBrandBySlug, normalizeBrand } from '../utils/brands.js';
import { getBrandStoreTaxonomy } from '../data/brand-store-taxonomy.js';

function buildProductSearchText(product) {
  return [
    product.name,
    product.category,
    product.brand,
    product.description,
    ...Object.values(product?.specifications || {})
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function matchesKeywordGroup(searchText, keywords = []) {
  const normalized = keywords.map((word) => String(word).toLowerCase()).filter(Boolean);
  if (!normalized.length) return true;
  return normalized.some((word) => searchText.includes(word));
}

function sortProducts(list, sortBy) {
  if (sortBy === 'price-asc') list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  if (sortBy === 'price-desc') list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  if (sortBy === 'rating') list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  if (sortBy === 'latest') list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
}

function formatCategoryLabel(category) {
  return String(category || '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function BrandStorePage() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [discountOnly, setDiscountOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [selectedProductCategory, setSelectedProductCategory] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [, setWishlistVersion] = useState(0);

  const catalogProducts = useMemo(() => getProducts() || [], []);
  const brandName = useMemo(() => findBrandBySlug(catalogProducts, brandSlug), [catalogProducts, brandSlug]);

  const brandProducts = useMemo(() => {
    if (!brandName) return [];
    const target = normalizeBrand(brandName);
    return catalogProducts.filter((product) => normalizeBrand(product.brand) === target);
  }, [catalogProducts, brandName]);

  const categories = useMemo(
    () => Array.from(new Set(brandProducts.map((product) => String(product.category || '').toLowerCase()))).filter(Boolean),
    [brandProducts]
  );

  const storageOptions = useMemo(() => {
    const values = new Set();
    brandProducts.forEach((product) => {
      const storage = product?.specifications?.Storage;
      if (storage) values.add(String(storage));
    });
    return Array.from(values);
  }, [brandProducts]);

  const colors = useMemo(() => {
    const values = new Set();
    brandProducts.forEach((product) => {
      const color = product?.specifications?.Color;
      if (color) values.add(String(color));
    });
    return Array.from(values);
  }, [brandProducts]);

  const modelYears = useMemo(() => {
    const values = new Set();
    brandProducts.forEach((product) => {
      const yearInName = String(product.name || '').match(/\b(20\d{2})\b/)?.[1];
      if (yearInName) values.add(yearInName);
    });
    return Array.from(values).sort((a, b) => Number(b) - Number(a));
  }, [brandProducts]);

  const brandTaxonomy = useMemo(
    () => getBrandStoreTaxonomy(brandName, brandProducts),
    [brandName, brandProducts]
  );

  const heroSlides = useMemo(() => {
    const unique = new Set();
    brandProducts.forEach((product) => {
      const main = String(product.image || '').trim();
      if (main) unique.add(main);
      if (Array.isArray(product.images)) {
        product.images
          .map((image) => String(image || '').trim())
          .filter(Boolean)
          .forEach((image) => unique.add(image));
      }
    });
    return Array.from(unique).slice(0, 6);
  }, [brandProducts]);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  const resetBrandFilters = () => {
    setSelectedProductCategory('all');
    setSelectedAudience('all');
    setSelectedSport('all');
    setSelectedCategory('all');
    setMinRating(0);
    setDiscountOnly(false);
    setSearchText('');
    setSortBy('featured');
  };

  useEffect(() => {
    setHeroSlideIndex(0);
    resetBrandFilters();
  }, [brandSlug]);

  useEffect(() => {
    if (heroSlides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [heroSlides]);

  const filteredProducts = useMemo(() => {
    let list = brandProducts.map((product) => ({ ...product, __searchText: buildProductSearchText(product) }));

    if (selectedCategory !== 'all') {
      list = list.filter((product) => String(product.category || '').toLowerCase() === selectedCategory);
    }

    if (selectedProductCategory !== 'all') {
      const config = brandTaxonomy.productCategories.find((item) => item.label === selectedProductCategory);
      list = list.filter((product) => matchesKeywordGroup(product.__searchText, config?.keywords || []));
    }

    if (selectedAudience !== 'all') {
      const config = brandTaxonomy.audiences.find((item) => item.label === selectedAudience);
      list = list.filter((product) => matchesKeywordGroup(product.__searchText, config?.keywords || []));
    }

    if (selectedSport !== 'all') {
      const config = brandTaxonomy.sports.find((item) => item.label === selectedSport);
      list = list.filter((product) => matchesKeywordGroup(product.__searchText, config?.keywords || []));
    }

    if (minRating > 0) {
      list = list.filter((product) => Number(product.rating || 0) >= minRating);
    }

    if (discountOnly) {
      list = list.filter((product) => product.isFlashSale || Number(product.originalPrice || 0) > Number(product.price || 0));
    }

    const term = String(searchText || '').trim().toLowerCase();
    if (term) {
      list = list.filter((product) => product.__searchText.includes(term));
    }

    sortProducts(list, sortBy);

    return list.map(({ __searchText, ...product }) => product);
  }, [
    brandProducts,
    selectedCategory,
    selectedProductCategory,
    selectedAudience,
    selectedSport,
    minRating,
    discountOnly,
    searchText,
    sortBy,
    brandTaxonomy
  ]);

  if (!brandName) {
    return (
      <main>
        <div className="container">
          <div className="brand-store-empty">
            <h2>Brand store not found</h2>
            <p>We could not find this brand in Luxora yet.</p>
            <Link to="/" className="btn-primary">Go back home</Link>
          </div>
        </div>
      </main>
    );
  }

  const handleAddToCart = (product) => {
    if (!product || Number(product.stock || 0) <= 0) {
      showNotification('This product is out of stock', 'warning');
      return;
    }
    addToCart(product, 1);
    showNotification(`${product.name} added to cart`, 'success');
  };

  const handleToggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showNotification(`${product.name} removed from wishlist`, 'info');
    } else {
      addToWishlist(product);
      showNotification(`${product.name} added to wishlist`, 'success');
    }
    setWishlistVersion((value) => value + 1);
  };

  return (
    <main>
      <div className="brand-breadcrumb-bar">
        <div className="breadcrumb product-breadcrumb brand-product-breadcrumb">
          <div className="product-breadcrumb-list">
            <div className="product-breadcrumb-item">
              <Link to="/">Home</Link>
              <span className="product-breadcrumb-separator">&gt;</span>
            </div>
            <div className="product-breadcrumb-item">
              <Link to="/brands">Brand Stores</Link>
              <span className="product-breadcrumb-separator">&gt;</span>
            </div>
            <div className="product-breadcrumb-item current">
              <span>{brandName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container brand-store-page">
        <h1 className="brand-store-title">{brandName} Store</h1>

        <section className="brand-hero">
          <div className="brand-hero-slider">
            {heroSlides.length ? (
              heroSlides.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${brandName} banner ${index + 1}`}
                  className={`brand-hero-slide ${heroSlideIndex === index ? 'active' : ''}`}
                />
              ))
            ) : (
              <div className="brand-hero-fallback">Shop authentic {brandName} products on Luxora</div>
            )}
            {heroSlides.length > 1 ? (
              <div className="brand-hero-dots">
                {heroSlides.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    className={`brand-hero-dot ${heroSlideIndex === index ? 'active' : ''}`}
                    onClick={() => setHeroSlideIndex(index)}
                    aria-label={`Show banner ${index + 1}`}
                  ></button>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="brand-content">
          <aside className="brand-sidebar">
            <div className="brand-filter-panel">
              <section className="brand-filter-section">
                <h3>Categories</h3>
                <button className={`brand-link ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`brand-link ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {formatCategoryLabel(category)}
                  </button>
                ))}
              </section>

              {brandTaxonomy.productCategories.length ? (
                <section className="brand-filter-section">
                  <h3>Product Category</h3>
                  <button
                    className={`brand-link ${selectedProductCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedProductCategory('all')}
                  >
                    All
                  </button>
                  {brandTaxonomy.productCategories.map((item) => (
                    <button
                      key={item.label}
                      className={`brand-link ${selectedProductCategory === item.label ? 'active' : ''}`}
                      onClick={() => setSelectedProductCategory(item.label)}
                    >
                      {item.label}
                    </button>
                  ))}
                </section>
              ) : null}

              {brandTaxonomy.audiences.length ? (
                <section className="brand-filter-section">
                  <h3>Shop by Audience</h3>
                  <button
                    className={`brand-link ${selectedAudience === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedAudience('all')}
                  >
                    All
                  </button>
                  {brandTaxonomy.audiences.map((item) => (
                    <button
                      key={item.label}
                      className={`brand-link ${selectedAudience === item.label ? 'active' : ''}`}
                      onClick={() => setSelectedAudience(item.label)}
                    >
                      {item.label}
                    </button>
                  ))}
                </section>
              ) : null}

              {brandTaxonomy.sports.length ? (
                <section className="brand-filter-section">
                  <h3>Shop by Sport</h3>
                  <button
                    className={`brand-link ${selectedSport === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedSport('all')}
                  >
                    All
                  </button>
                  {brandTaxonomy.sports.map((item) => (
                    <button
                      key={item.label}
                      className={`brand-link ${selectedSport === item.label ? 'active' : ''}`}
                      onClick={() => setSelectedSport(item.label)}
                    >
                      {item.label}
                    </button>
                  ))}
                </section>
              ) : null}

              <section className="brand-filter-section">
                <h3>Customer Reviews</h3>
                <button className={`brand-link ${minRating === 4 ? 'active' : ''}`} onClick={() => setMinRating(minRating === 4 ? 0 : 4)}>
                  4 Stars &amp; Up
                </button>
              </section>

              <section className="brand-filter-section">
                <h3>Storage Capacity</h3>
                {storageOptions.length ? storageOptions.slice(0, 8).map((storage) => (
                  <button key={storage} className="brand-link" onClick={() => setSearchText(storage)}>{storage}</button>
                )) : <p className="brand-note">No storage data</p>}
              </section>

              <section className="brand-filter-section">
                <h3>Model Year</h3>
                {modelYears.length ? modelYears.map((year) => (
                  <button key={year} className="brand-link" onClick={() => setSearchText(year)}>{year}</button>
                )) : <p className="brand-note">No model year data</p>}
              </section>

              <section className="brand-filter-section">
                <h3>Color</h3>
                {colors.length ? colors.slice(0, 8).map((color) => (
                  <button key={color} className="brand-link" onClick={() => setSearchText(color)}>{color}</button>
                )) : <p className="brand-note">No color data</p>}
              </section>
            </div>
          </aside>

          <div className="brand-products-area">
            <div className="brand-toolbar">
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder={`Search inside ${brandName} store...`}
              />
              <label>
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(event) => setDiscountOnly(event.target.checked)}
                />
                Deals only
              </label>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="featured">Featured</option>
                <option value="latest">Latest</option>
                <option value="rating">Top Rated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            <div className="brand-products-grid">
              {filteredProducts.length ? filteredProducts.map((product) => {
                const original = Number(product.originalPrice || 0);
                const current = Number(product.flashPrice || product.price || 0);
                const discountPct = original > current ? Math.round(((original - current) / original) * 100) : 0;
                return (
                  <article className="brand-product-card" key={product.id}>
                    <button className={`brand-card-wishlist ${isInWishlist(product.id) ? 'active' : ''}`} onClick={() => handleToggleWishlist(product)}>
                      <i className={isInWishlist(product.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                    </button>
                    <Link to={`/product?id=${product.id}`} className="brand-product-image-link">
                      <img src={product.image} alt={product.name} loading="lazy" />
                      {discountPct > 0 ? <span className="discount-badge">-{discountPct}%</span> : null}
                    </Link>
                    <div className="brand-product-info">
                      <h4 title={product.name}>{product.name}</h4>
                      <p>{formatCategoryLabel(product.category)}</p>
                      <div className="brand-product-price">
                        <strong>{formatCurrency(current)}</strong>
                        {original > current ? <span>{formatCurrency(original)}</span> : null}
                      </div>
                      <button className="btn-primary" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                      <button className="btn-secondary" onClick={() => navigate(`/product?id=${product.id}`)}>View Details</button>
                    </div>
                  </article>
                );
              }) : (
                <div className="brand-store-empty">
                  <h3>No products match your filters</h3>
                  <p>Try changing category, rating, or search text.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
