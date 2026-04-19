export function normalizeBrand(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function slugifyBrand(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getBrandMap(products = []) {
  const map = new Map();
  products.forEach((product) => {
    const brand = String(product?.brand || '').trim();
    if (!brand) return;
    const key = slugifyBrand(brand);
    if (!map.has(key)) map.set(key, brand);
  });
  return map;
}

export function findBrandBySlug(products = [], slug = '') {
  const map = getBrandMap(products);
  return map.get(String(slug || '').toLowerCase()) || null;
}

export function findBrandByQuery(products = [], query = '') {
  const term = normalizeBrand(query);
  if (!term) return null;

  const brands = Array.from(getBrandMap(products).values());
  const exact = brands.find((brand) => normalizeBrand(brand) === term);
  if (exact) return exact;

  const startsWith = brands.find((brand) => normalizeBrand(brand).startsWith(term));
  if (startsWith) return startsWith;

  const contains = brands.find((brand) => normalizeBrand(brand).includes(term));
  return contains || null;
}
