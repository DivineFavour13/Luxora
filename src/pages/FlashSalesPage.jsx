import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import products from '../data/products-data.js';
import { addToCart, addToWishlist, removeFromWishlist, isInWishlist } from '../utils/storage.js';
import { formatCurrency } from '../utils/format.js';
import { showNotification } from '../utils/notifications.js';

export default function FlashSalesPage() {
  const [sortBy, setSortBy] = useState('discount');
  const [refresh, setRefresh] = useState(0);

  const list = useMemo(() => {
    const flash = products.filter(p => p.isFlashSale);
    const withDiscount = flash.map(p => {
      const current = p.flashPrice || p.price || 0;
      const original = p.originalPrice || current;
      const discount = original > 0 ? Math.max(0, Math.round(((original - current) / original) * 100)) : 0;
      return { ...p, __discount: discount, __current: current };
    });

    if (sortBy === 'price-asc') withDiscount.sort((a, b) => a.__current - b.__current);
    if (sortBy === 'price-desc') withDiscount.sort((a, b) => b.__current - a.__current);
    if (sortBy === 'discount') withDiscount.sort((a, b) => b.__discount - a.__discount);
    return withDiscount;
  }, [sortBy, refresh]);

  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showNotification(`${product.name} removed from wishlist`, 'info');
    } else {
      addToWishlist(product);
      showNotification(`${product.name} added to wishlist`, 'success');
    }
    setRefresh((v) => v + 1);
  };

  const addItemToCart = (product) => {
    addToCart(product, 1);
    showNotification(`${product.name} added to cart`, 'success');
  };

  return (
    <main>
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Flash Sales</span>
        </div>

        <section className="flash-sales-header">
          <div>
            <h1><i className="fas fa-bolt"></i> Flash Sales</h1>
            <p>Limited-time offers on selected products.</p>
          </div>
          <div className="flash-filters">
            <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="discount">Top Discount</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </section>

        <section className="flash-products-grid">
          {list.map((product) => {
            const inWish = isInWishlist(product.id);
            return (
              <article key={product.id} className="flash-product-card">
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                  {product.__discount > 0 ? <span className="discount-badge">-{product.__discount}%</span> : null}
                  <button className={`wishlist-btn ${inWish ? 'active' : ''}`} onClick={() => toggleWishlist(product)}>
                    <i className={inWish ? 'fas fa-heart' : 'far fa-heart'}></i>
                  </button>
                </div>

                <div className="product-info">
                  <h3>
                    <Link to={`/product?id=${product.id}`}>{product.name}</Link>
                  </h3>
                  <div className="price-section">
                    <span className="current-price">{formatCurrency(product.__current)}</span>
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
