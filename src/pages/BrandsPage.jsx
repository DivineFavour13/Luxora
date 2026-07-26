import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useMemo } from 'react';
import { getProducts } from '../utils/storage.js';
import { getBrandMap, slugifyBrand } from '../utils/brands.js';

const BRAND_LOGOS = {
  'Nike':                'https://www.google.com/s2/favicons?domain=nike.com&sz=128',
  'Adidas':              'https://www.google.com/s2/favicons?domain=adidas.com&sz=128',
  'Puma':                'https://www.google.com/s2/favicons?domain=puma.com&sz=128',
  'New Balance':         'https://www.google.com/s2/favicons?domain=newbalance.com&sz=128',
  'Timberland':          'https://www.google.com/s2/favicons?domain=timberland.com&sz=128',
  "Levi's":              'https://www.google.com/s2/favicons?domain=levi.com&sz=128',
  'Zara':                'https://www.google.com/s2/favicons?domain=zara.com&sz=128',
  'H&M':                 'https://www.google.com/s2/favicons?domain=hm.com&sz=128',
  'Polo Ralph Lauren':   'https://www.google.com/s2/favicons?domain=ralphlauren.com&sz=128',
  'Massimo Dutti':       'https://www.google.com/s2/favicons?domain=massimodutti.com&sz=128',
  'The North Face':      'https://www.google.com/s2/favicons?domain=thenorthface.com&sz=128',
  'Lululemon':           'https://www.google.com/s2/favicons?domain=lululemon.com&sz=128',
  'Coach':               'https://www.google.com/s2/favicons?domain=coach.com&sz=128',
  'Ray-Ban':             'https://www.google.com/s2/favicons?domain=ray-ban.com&sz=128',
  'Pandora':             'https://www.google.com/s2/favicons?domain=pandora.net&sz=128',
  'Daniel Wellington':   'https://www.google.com/s2/favicons?domain=danielwellington.com&sz=128',
  'CeraVe':              'https://www.google.com/s2/favicons?domain=cerave.com&sz=128',
  'The Ordinary':        'https://www.google.com/s2/favicons?domain=theordinary.com&sz=128',
  'Fenty Beauty':        'https://www.google.com/s2/favicons?domain=fentybeauty.com&sz=128',
  'Laneige':             'https://www.google.com/s2/favicons?domain=laneige.com&sz=128',
  'Charlotte Tilbury':   'https://www.google.com/s2/favicons?domain=charlottetilbury.com&sz=128',
  'NIVEA':               'https://www.google.com/s2/favicons?domain=nivea.com&sz=128',
  'Dyson':               'https://www.google.com/s2/favicons?domain=dyson.com&sz=128',
  'Olaplex':             'https://www.google.com/s2/favicons?domain=olaplex.com&sz=128',
  'Kerasilk':            'https://www.google.com/s2/favicons?domain=kerasilk.com&sz=128',
  'Giorgio Armani':      'https://www.google.com/s2/favicons?domain=armani.com&sz=128',
  'Yves Saint Laurent':  'https://www.google.com/s2/favicons?domain=ysl.com&sz=128',
  'Jo Malone':           'https://www.google.com/s2/favicons?domain=jomalone.com&sz=128',
  'Zara Home':           'https://www.google.com/s2/favicons?domain=zarahome.com&sz=128',
  'Belkin':              'https://www.google.com/s2/favicons?domain=belkin.com&sz=128',
  'Sony':                'https://www.google.com/s2/favicons?domain=sony.com&sz=128',
  'Garnier':             'https://www.google.com/s2/favicons?domain=garnier.com&sz=128',
  'Richard Mille':       'https://www.google.com/s2/favicons?domain=richardmille.com&sz=128',
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

function BrandLogo({ brand }) {
  const logoUrl = BRAND_LOGOS[brand];
  const initials = getBrandInitials(brand);
  const color = getBrandColor(brand);

  if (logoUrl) {
    return (
      <div className="brand-card-logo brand-card-logo--img">
        <img
          src={logoUrl}
          alt={brand}
          onError={(e) => {
            e.target.parentNode.classList.remove('brand-card-logo--img');
            e.target.parentNode.style.background = color;
            e.target.parentNode.innerHTML = `<span>${initials}</span>`;
          }}
        />
      </div>
    );
  }

  return (
    <div className="brand-card-logo" style={{ background: color }}>
      <span>{initials}</span>
    </div>
  );
}

export default function BrandsPage() {
  usePageMeta({ title: 'Brand Stores', description: "Browse all brands on LUXORA — Nike, Zara, CeraVe, Coach, Levi's and more." });
  const products = useMemo(() => getProducts() || [], []);
  const brands = useMemo(
    () => Array.from(getBrandMap(products).values()).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const brandStats = useMemo(() => {
    const stats = {};
    for (const p of products) {
      if (!p.brand) continue;
      if (!stats[p.brand]) stats[p.brand] = { count: 0 };
      stats[p.brand].count++;
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
            return (
              <Link key={brand} to={`/brand/${slugifyBrand(brand)}`} className="brand-card">
                <BrandLogo brand={brand} />
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