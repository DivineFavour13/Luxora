import { useMemo, useState } from 'react';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, addToCart, addToWishlist, removeFromWishlist, isInWishlist } from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';

function renderStars(r = 4.5) {
  const full = Math.floor(r), half = r % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return (<>
    {Array.from({ length: full }).map((_, i) => <i key={`f${i}`} className="fas fa-star"></i>)}
    {half && <i className="fas fa-star-half-alt"></i>}
    {Array.from({ length: empty }).map((_, i) => <i key={`e${i}`} className="far fa-star"></i>)}
  </>);
}

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';

  // ✅ query is defined BEFORE usePageMeta uses it
  usePageMeta({
    title: query ? `Search: "${query}"` : 'Search',
    description: query ? `Search results for "${query}" on LUXORA.` : 'Browse all products on LUXORA.'
  });

  const [sort, setSort] = useState('relevance');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [wishRefresh, setWishRefresh] = useState(0);

  const allProducts = useMemo(() => getProducts() || [], []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(p =>
      String(p.name || '').toLowerCase().includes(q) ||
      String(p.brand || '').toLowerCase().includes(q) ||
      String(p.category || '').toLowerCase().includes(q) ||
      String(p.description || '').toLowerCase().includes(q)
    );
  }, [allProducts, query]);

  const categories = useMemo(() => [...new Set(results.map(p => p.category).filter(Boolean))], [results]);

  const filtered = useMemo(() => {
    let list = categoryFilter ? results.filter(p => p.category === categoryFilter) : results;
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'newest') list = [...list].filter(p => p.isNewArrival).concat([...list].filter(p => !p.isNewArrival));
    return list;
  }, [results, categoryFilter, sort]);

  const handleCart = (p) => {
    if (!p.stock) { showNotification('Out of stock', 'warning'); return; }
    addToCart(p, 1);
    showNotification(`${p.name} added to cart`, 'success');
  };

  const handleWishlist = (p) => {
    if (isInWishlist(p.id)) { removeFromWishlist(p.id); showNotification(`${p.name} removed from wishlist`, 'info'); }
    else { addToWishlist(p); showNotification(`${p.name} added to wishlist`, 'success'); }
    setWishRefresh(v => v + 1);
  };

  return (
    <main className="search-page">
      <div className="container">
        <div className="search-page-header">
          <div className="search-hero-bar">
            <i className="fas fa-search"></i>
            <h1>
              {query
                ? <>Results for <span className="search-query-highlight">"{query}"</span></>
                : 'All Products'}
            </h1>
          </div>
          <p className="search-result-count">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
            {categoryFilter && <> in <strong>{categoryFilter}</strong></>}
          </p>
        </div>

        <div className="search-layout">
          {/* Sidebar */}
          <aside className="search-sidebar">
            <div className="search-filter-card">
              <h3>Category</h3>
              <div className="search-filter-options">
                <label className={`search-filter-opt ${!categoryFilter ? 'active' : ''}`}>
                  <input type="radio" name="cat" checked={!categoryFilter} onChange={() => setCategoryFilter('')} />
                  <span>All ({results.length})</span>
                </label>
                {categories.map(c => (
                  <label key={c} className={`search-filter-opt ${categoryFilter === c ? 'active' : ''}`}>
                    <input type="radio" name="cat" checked={categoryFilter === c} onChange={() => setCategoryFilter(c)} />
                    <span style={{ textTransform: 'capitalize' }}>{c} ({results.filter(p => p.category === c).length})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="search-filter-card">
              <h3>Sale Tags</h3>
              <div className="search-filter-tags">
                {[
                  { label: 'Flash Sale', icon: 'fas fa-bolt', to: '/flash-sales' },
                  { label: 'Top Sellers', icon: 'fas fa-fire', to: '/top-sellers' },
                  { label: 'New Arrivals', icon: 'fas fa-star', to: '/new-arrivals' },
                ].map(tag => (
                  <Link key={tag.label} to={tag.to} className="search-tag-chip">
                    <i className={tag.icon}></i> {tag.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="search-results">
            <div className="search-toolbar">
              <span className="search-toolbar-count">{filtered.length} products</span>
              <div className="search-sort-wrap">
                <label>Sort by</label>
                <select className="admin-select" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="relevance">Relevance</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="search-empty">
                <i className="fas fa-search"></i>
                <h2>No results found</h2>
                <p>We couldn't find anything matching <strong>"{query}"</strong>.</p>
                <div className="search-suggestions">
                  <p>Try:</p>
                  <ul>
                    <li>Checking your spelling</li>
                    <li>Using fewer or different keywords</li>
                    <li>Searching a brand name like <strong>Nike</strong> or <strong>Zara</strong></li>
                  </ul>
                </div>
                <Link to="/" className="btn-primary"><i className="fas fa-home"></i> Back to Home</Link>
              </div>
            ) : (
              <div className="search-grid">
                {filtered.map(p => {
                  const inWish = isInWishlist(p.id);
                  const discount = p.originalPrice ? Math.round(100 - (p.price / p.originalPrice) * 100) : 0;
                  const price = p.flashPrice || p.price;
                  return (
                    <article key={p.id} className="search-product-card">
                      <div className="search-product-img">
                        <Link to={`/product?id=${p.id}`}>
                          <img src={p.image} alt={p.name} loading="lazy" />
                        </Link>
                        {discount > 0 && <span className="search-discount-badge">-{discount}%</span>}
                        {p.isNewArrival && <span className="search-new-badge">New</span>}
                        <button
                          className={`search-wish-btn ${inWish ? 'active' : ''}`}
                          onClick={() => handleWishlist(p)}
                          aria-label="Wishlist"
                        >
                          <i className={inWish ? 'fas fa-heart' : 'far fa-heart'}></i>
                        </button>
                      </div>
                      <div className="search-product-info">
                        <span className="search-product-brand">{p.brand}</span>
                        <h3><Link to={`/product?id=${p.id}`}>{p.name}</Link></h3>
                        <div className="search-product-rating">
                          <div className="search-stars">{renderStars(p.rating || 4.5)}</div>
                          <span>({(p.reviews || 0).toLocaleString()})</span>
                        </div>
                        <div className="search-product-price">
                          <strong>{formatCurrency(price)}</strong>
                          {p.originalPrice && <s>{formatCurrency(p.originalPrice)}</s>}
                        </div>
                        <button
                          className="search-add-btn btn-primary"
                          disabled={!p.stock}
                          onClick={() => handleCart(p)}
                        >
                          <i className="fas fa-shopping-bag"></i>
                          {p.stock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
