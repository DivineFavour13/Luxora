import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { getProducts } from '../utils/storage.js';
import { getBrandMap, slugifyBrand } from '../utils/brands.js';

const BRAND_ICONS = {
  default: 'fas fa-store',
  sport: 'fas fa-running',
  luxury: 'fas fa-gem',
  fashion: 'fas fa-tshirt',
};

function getBrandInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getBrandColor(name) {
  const colors = [
    '#1a1a2e','#16213e','#2d2d5e','#3d2c8d','#1e3a5f',
    '#2c4a3e','#4a2c2c','#2c2c4a','#3e2c4a','#1a3a2c',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function BrandsPage() {
  const products = useMemo(() => getProducts() || [], []);
  const brands = useMemo(
    () => Array.from(getBrandMap(products).values()).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const brandStats = useMemo(() => {
    const stats = {};
    for (const p of products) {
      if (!p.brand) continue;
      if (!stats[p.brand]) stats[p.brand] = { count: 0, minPrice: Infinity, maxPrice: 0 };
      stats[p.brand].count++;
      stats[p.brand].minPrice = Math.min(stats[p.brand].minPrice, p.price || 0);
      stats[p.brand].maxPrice = Math.max(stats[p.brand].maxPrice, p.price || 0);
    }
    return stats;
  }, [products]);

  return (
    <main>
      <div className="container brands-page">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <i className="fas fa-chevron-right"></i>
          <span>Brand Stores</span>
        </div>

        <div className="brands-page-header">
          <div>
            <h1>Brand Stores</h1>
            <p>{brands.length} brands available on LUXORA</p>
          </div>
          <div className="brands-count-badge">
            <i className="fas fa-store"></i> {brands.length} Brands
          </div>
        </div>

        <div className="brands-grid">
          {brands.map((brand) => {
            const stats = brandStats[brand] || { count: 0 };
            const color = getBrandColor(brand);
            const initials = getBrandInitials(brand);
            return (
              <Link key={brand} to={`/brand/${slugifyBrand(brand)}`} className="brand-card">
                <div className="brand-card-logo" style={{ background: color }}>
                  <span>{initials}</span>
                </div>
                <div className="brand-card-body">
                  <h3>{brand}</h3>
                  <p className="brand-card-count">
                    <i className="fas fa-box-open"></i> {stats.count} {stats.count === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <div className="brand-card-arrow">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
