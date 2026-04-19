import { normalizeBrand } from '../utils/brands.js';

const fashionTaxonomy = {
  productCategories: [
    { label: 'Footwear', keywords: ['shoe', 'sneaker', 'boot', 'trainer', 'loafer', 'sandal', 'heel'] },
    { label: 'Tops', keywords: ['shirt', 'tee', 't-shirt', 'blouse', 'top', 'sweatshirt', 'hoodie'] },
    { label: 'Bottoms', keywords: ['trouser', 'jean', 'denim', 'chino', 'pant', 'skirt', 'short', 'legging'] },
    { label: 'Dresses & Suits', keywords: ['dress', 'suit', 'blazer', 'jumpsuit', 'co-ord'] },
    { label: 'Outerwear', keywords: ['jacket', 'coat', 'overcoat', 'puffer', 'vest', 'trench'] },
    { label: 'Accessories', keywords: ['bag', 'wallet', 'belt', 'sunglasses', 'watch', 'necklace', 'scarf', 'hat', 'cap'] },
  ],
  audiences: [
    { label: 'Men', keywords: ['men', "men's", 'male', 'his'] },
    { label: 'Women', keywords: ['women', "women's", 'female', 'ladies', 'her'] },
    { label: 'Unisex', keywords: ['unisex', 'everyone', 'all'] },
  ],
  sports: [],
};

const beautyTaxonomy = {
  productCategories: [
    { label: 'Skincare', keywords: ['serum', 'moisturiser', 'moisturizer', 'cleanser', 'toner', 'sunscreen', 'spf', 'lotion', 'cream', 'mask'] },
    { label: 'Makeup', keywords: ['foundation', 'lipstick', 'mascara', 'eyeliner', 'blush', 'concealer', 'eyeshadow', 'contour'] },
    { label: 'Haircare', keywords: ['shampoo', 'conditioner', 'treatment', 'mask', 'serum', 'keratin', 'olaplex'] },
    { label: 'Fragrance', keywords: ['perfume', 'eau de', 'edt', 'edp', 'cologne', 'scent'] },
    { label: 'Body', keywords: ['body lotion', 'body wash', 'deodorant', 'scrub'] },
  ],
  audiences: [
    { label: 'All Skin Types', keywords: ['all', 'every'] },
    { label: 'Dry Skin', keywords: ['dry', 'hydrating', 'moisturising'] },
    { label: 'Oily Skin', keywords: ['oily', 'matte', 'control', 'blemish'] },
  ],
  sports: [],
};

const lifestyleTaxonomy = {
  productCategories: [
    { label: 'Activewear', keywords: ['legging', 'sports bra', 'running', 'hoodie', 'jacket', 'workout', 'gym', 'yoga'] },
    { label: 'Home & Living', keywords: ['candle', 'blanket', 'throw', 'mat', 'bottle', 'home'] },
    { label: 'Fragrance', keywords: ['perfume', 'eau de', 'edt', 'edp', 'scent'] },
    { label: 'Accessories & Tech', keywords: ['charger', 'earbuds', 'earphones', 'passport', 'wallet', 'bag'] },
  ],
  audiences: [
    { label: 'Men', keywords: ['men', "men's", 'male'] },
    { label: 'Women', keywords: ['women', "women's", 'female'] },
    { label: 'Unisex', keywords: ['unisex'] },
  ],
  sports: [],
};

export const brandTaxonomyMap = {
  nike: fashionTaxonomy,
  adidas: fashionTaxonomy,
  puma: fashionTaxonomy,
  timberland: fashionTaxonomy,
  'new balance': fashionTaxonomy,
  'polo ralph lauren': fashionTaxonomy,
  zara: fashionTaxonomy,
  hm: fashionTaxonomy,
  'h&m': fashionTaxonomy,
  levis: fashionTaxonomy,
  "levi's": fashionTaxonomy,
  coach: fashionTaxonomy,
  'ray-ban': fashionTaxonomy,
  'daniel wellington': fashionTaxonomy,
  pandora: fashionTaxonomy,
  'massimo dutti': fashionTaxonomy,
  'the north face': fashionTaxonomy,
  'zara home': lifestyleTaxonomy,
  cerave: beautyTaxonomy,
  'fenty beauty': beautyTaxonomy,
  laneige: beautyTaxonomy,
  'the ordinary': beautyTaxonomy,
  'charlotte tilbury': beautyTaxonomy,
  nivea: beautyTaxonomy,
  dyson: beautyTaxonomy,
  olaplex: beautyTaxonomy,
  kerasilk: beautyTaxonomy,
  'giorgio armani': lifestyleTaxonomy,
  'yves saint laurent': lifestyleTaxonomy,
  'jo malone': lifestyleTaxonomy,
  lululemon: lifestyleTaxonomy,
  sony: lifestyleTaxonomy,
  belkin: lifestyleTaxonomy,
};

export function getBrandTaxonomy(brand) {
  const key = normalizeBrand(brand);
  return brandTaxonomyMap[key] || fashionTaxonomy;
}

export default brandTaxonomyMap;

// Backward-compatible alias
export const getBrandStoreTaxonomy = getBrandTaxonomy;
