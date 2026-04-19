import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import products from '../data/products-data.js';
import { addToCart, addToWishlist, removeFromWishlist, isInWishlist, getProducts } from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';

export default function NewArrivalsPage() {
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState('all');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const onProductsUpdated = () => setRefresh((value) => value + 1);
    window.addEventListener('productsUpdated', onProductsUpdated);
    return () => window.removeEventListener('productsUpdated', onProductsUpdated);
  }, []);

  const source = useMemo(() => {
    const stored = getProducts();
    return stored.length ? stored : products;
  }, [refresh]);

  const categories = useMemo(() => {
    const items = source
      .filter((product) => product.isNewArrival)
      .map((product) => String(product.category || '').trim())
      .filter(Boolean);
    return [...new Set(items)];
  }, [source]);

  const list = useMemo(() => {
    const filtered = source
      .filter((product) => product.isNewArrival)
      .filter((product) => category === 'all' || String(product.category || '').toLowerCase() === category.toLowerCase());

    filtered.sort((a, b) => {
      const aDate = a?.createdAt ? new Date(a.createdAt).getTime() : Number(a.id || 0);
      const bDate = b?.createdAt ? new Date(b.createdAt).getTime() : Number(b.id || 0);
      if (sortBy === 'newest') return bDate - aDate;
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
      return 0;
    });
    return filtered;
  }, [source, sortBy, category]);

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showNotification(`${product.name} removed from wishlist`, 'info');
    } else {
      addToWishlist(product);
      showNotification(`${product.name} added to wishlist`, 'success');
    }
    setRefresh((value) => value + 1);
  };

  const addItemToCart = (product) => {
    if (!product || Number(product.stock || 0) <= 0 || product.inStock === false) {
      showNotification('This product is out of stock', 'warning');
      return;
    }
    addToCart(product, 1);
    showNotification(`${product.name} added to cart`, 'success');
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <span>New Arrivals</span>
        </div>

        <section className="showcase-header new-arrivals-theme">
          <div className="showcase-copy">
            <h1><i className="fas fa-star"></i> New Arrivals</h1>
            <p>Freshly added products across all categories, sorted by what is latest.</p>
          </div>
          <div className="showcase-links">
            <Link to="/flash-sales" className="btn-outline">Flash Sales</Link>
            <Link to="/top-sellers" className="btn-outline">Top Sellers</Link>
          </div>
        </section>

        <section className="showcase-toolbar">
          <div className="toolbar-item">
            <label htmlFor="new-category">Category</label>
            <select id="new-category" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="toolbar-item">
            <label htmlFor="new-sort">Sort By</label>
            <select id="new-sort" className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </section>

        <section className="flash-products-grid">
          {list.map((product) => {
            const inWish = isInWishlist(product.id);
            const discount = product.originalPrice
              ? Math.max(0, Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100))
              : 0;
            return (
              <article key={product.id} className="flash-product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {discount > 0 ? <span className="discount-badge">-{discount}%</span> : null}
                  <button className={`wishlist-btn ${inWish ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
                    <i className={inWish ? 'fas fa-heart' : 'far fa-heart'}></i>
                  </button>
                </div>

                <div className="product-info">
                  <h3>
                    <Link to={`/product?id=${product.id}`}>{product.name}</Link>
                  </h3>
                  <div className="price-section">
                    <span className="current-price">{formatCurrency(product.price || 0)}</span>
                    {product.originalPrice ? <span className="old-price">{formatCurrency(product.originalPrice)}</span> : null}
                  </div>
                  <div className="stock-info">
                    <span>{product.stock || 0} items left</span>
                  </div>
                  <button className="btn-primary btn-full" onClick={() => addItemToCart(product)}>
                    <i className="fas fa-shopping-cart"></i> Add to Cart
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
