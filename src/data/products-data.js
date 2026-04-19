const ASSET_BASE = import.meta.env.BASE_URL || '/';

function withBaseAssetPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/images/')) return path;
  return `${ASSET_BASE.replace(/\/$/, '')}${path}`;
}

function normalizeProductAssets(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeProductAssets);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeProductAssets(entry)])
    );
  }

  return withBaseAssetPath(value);
}

const products = [

  // ─── FASHION — Footwear ───────────────────────────────────────────────
  {
    id: 1,
    name: "Nike Air Force 1 '07",
    price: 89999,
    originalPrice: 109999,
    category: "fashion",
    brand: "Nike",
    rating: 4.8,
    reviews: 1243,
    image: "/images/nike-black.jpg",
    images: [
      // "/images/nike-red.jpg",
      "/images/nike-black.jpg",
      "/images/nike3.jpg",
      "/images/nike2.jpg",
      // "/images/nike-brown.jpg",
      // "/images/nike-grey.jpg",
      // "/images/nike-green.jpg"
    ],
    heroImagesByColor: {
      black: "/images/nike-black.jpg",
      white: "/images/nike-white.jpg",
      beige: "/images/nike-beige.jpg",
      brown: "/images/nike-brown.jpg",
      grey: "/images/nike-grey.jpg",
      green: "/images/nike-green.jpg"
    },
    description: "The legend lives on. The Nike Air Force 1 '07 brings classic hoops style to the streets with its durable leather upper and comfortable Air cushioning.",
    longDescription: "Born on the hardwood and built for the streets, the Air Force 1 Low is a legendary sneaker that's become a timeless style icon. Its clean, minimalist silhouette pairs effortlessly with any outfit.",
    features: ["Genuine leather upper", "Air-Sole unit for cushioning", "Rubber outsole for durability", "Pivot circle on outsole"],
    specifications: { "Material": "Leather upper", "Sole": "Rubber outsole", "Closure": "Lace-up", "Size Range": "EU 36–47", "Color": "White", "Style": "Low-top" },
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 89,
    isTopSeller: true, isFlashSale: true, flashPrice: 74999,
    warranty: "6 months manufacturer warranty"
  },
  {
    id: 2,
    name: "Adidas Ultraboost 22",
    price: 119999,
    originalPrice: 149999,
    category: "fashion",
    brand: "Adidas",
    rating: 4.7,
    reviews: 876,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556048219-bb6978360b84?w=600&h=600&fit=crop"
    ],
    categoryPromoImages: [
      "/images/streetwear-1.jpg",
      "/images/streetwear-2.jpg",
      "/images/streetwear-3.jpg",
      "/images/streetwear-4.jpg",
      "/images/streetwear-5.jpg"
    ],
    description: "Feel the energy return with every step. The Ultraboost 22 features a Primeknit upper and responsive Boost midsole for all-day comfort.",
    features: ["Primeknit+ upper adapts to your foot", "Continental™ Rubber outsole", "BOOST midsole for energy return", "Linear Energy Push system"],
    specifications: { "Material": "Primeknit upper", "Sole": "Continental Rubber", "Closure": "Lace-up", "Size Range": "EU 36–47", "Color": "Black", "Technology": "BOOST" },
    sizes: ["37", "38", "39", "40", "41", "42", "43", "44", "45"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }, { name: "Grey", hex: "#888888" }],
    inStock: true, stock: 54,
    isTopSeller: true, isNewArrival: false,
  },
  {
    id: 3,
    name: "Timberland Premium 6-Inch Boot",
    price: 134999,
    originalPrice: 159999,
    category: "fashion",
    brand: "Timberland",
    rating: 4.6,
    reviews: 542,
    image: "/images/The-6-inch-Boot-Timberland.jpg",
    images: [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&h=600&fit=crop",
      "/images/Timberland-Icon-6-Inch-Premium-Boots.jpg"
    ],
    description: "The original waterproof boot that became a cultural icon. Premium nubuck leather and direct-attach construction for all-weather durability.",
    features: ["Premium waterproof nubuck leather", "Seam-sealed waterproof construction", "Anti-fatigue technology", "Rubber lug outsole"],
    specifications: { "Material": "Premium nubuck leather", "Waterproof": "Yes", "Closure": "Lace-up", "Size Range": "EU 38–47", "Color": "Wheat/Brown" },
    sizes: ["38", "39", "40", "41", "42", "43", "44", "45", "46"],
    colors: [{ name: "Wheat", hex: "#C4A35A" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 38,
    isNewArrival: true, isTopSeller: true
  },
  {
    id: 4,
    name: "New Balance 550 Retro Sneaker",
    price: 94999,
    originalPrice: 114999,
    category: "fashion",
    brand: "New Balance",
    rating: 4.5,
    reviews: 389,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop"
    ],
    description: "A retro basketball silhouette reimagined for everyday wear. Clean leather panels and vintage NB branding make this an instant classic.",
    specifications: { "Material": "Leather / mesh upper", "Sole": "Rubber", "Closure": "Lace-up", "Size Range": "EU 36–46", "Color": "White/Green" },
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Beige", hex: "#D4C5A9" }],
    inStock: true, stock: 62,
    isNewArrival: true, isFlashSale: true, flashPrice: 82999
  },
  {
    id: 5,
    name: "Puma RS-X³ Puzzle Sneaker",
    price: 69999,
    originalPrice: 84999,
    category: "fashion",
    brand: "Puma",
    rating: 4.3,
    reviews: 215,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop"
    ],
    description: "Bold, chunky, and colourful. The RS-X³ takes Puma's iconic running system and amplifies it with exaggerated proportions and multi-layered materials.",
    specifications: { "Material": "Mesh / synthetic upper", "Sole": "Rubber", "Closure": "Lace-up", "Size Range": "EU 36–46", "Color": "Multicolor" },
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
    inStock: true, stock: 44,
    isFlashSale: true, flashPrice: 59999
  },

  // ─── FASHION — Men's Clothing ─────────────────────────────────────────
  {
    id: 6,
    name: "Classic Oxford Button-Down Shirt",
    price: 29999,
    originalPrice: 39999,
    category: "fashion",
    brand: "Polo Ralph Lauren",
    rating: 4.7,
    reviews: 834,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4f4e?w=600&h=600&fit=crop"
    ],
    description: "A timeless Oxford shirt crafted from soft, breathable cotton. The perfect foundation for any smart-casual wardrobe.",
    features: ["100% combed cotton", "Button-down collar", "Box pleat at back", "Two-button barrel cuffs"],
    specifications: { "Material": "100% Cotton", "Fit": "Regular fit", "Collar": "Button-down", "Care": "Machine washable", "Color": "White", "Sizes": "XS–3XL" },
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Blue", hex: "#5B8DB8" }, { name: "Pink", hex: "#E8B4B8" }],
    inStock: true, stock: 120,
    isTopSeller: true
  },
  {
    id: 7,
    name: "Slim-Fit Chino Trousers",
    price: 34999,
    originalPrice: 44999,
    category: "fashion",
    brand: "Zara",
    rating: 4.4,
    reviews: 567,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop"
    ],
    description: "Versatile slim-fit chinos in a stretch fabric that moves with you. Dress them up or keep it casual — they work both ways.",
    specifications: { "Material": "97% Cotton, 3% Elastane", "Fit": "Slim fit", "Rise": "Mid rise", "Care": "Machine washable", "Color": "Beige" },
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    colors: [{ name: "Beige", hex: "#D4C5A9" }, { name: "Navy", hex: "#1a1a2e" }, { name: "Olive", hex: "#556B2F" }],
    inStock: true, stock: 95,
    isFlashSale: true, flashPrice: 27999
  },
  {
    id: 8,
    name: "Essential Crewneck Sweatshirt",
    price: 24999,
    originalPrice: 32999,
    category: "fashion",
    brand: "H&M",
    rating: 4.3,
    reviews: 721,
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=600&fit=crop"
    ],
    description: "A wardrobe essential. This heavyweight French terry sweatshirt offers comfort and warmth without sacrificing style.",
    specifications: { "Material": "80% Cotton, 20% Polyester", "Fit": "Regular fit", "Neckline": "Crewneck", "Care": "Machine washable", "Color": "Grey" },
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Grey", hex: "#888888" }, { name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 145,
    isTopSeller: true, isNewArrival: true
  },
  {
    id: 9,
    name: "Raw Selvedge Denim Jeans",
    price: 64999,
    originalPrice: 79999,
    category: "fashion",
    brand: "Levi's",
    rating: 4.6,
    reviews: 943,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=600&h=600&fit=crop"
    ],
    description: "Japanese selvedge denim in a classic straight cut. Raw, rigid, and built to age beautifully with every wear.",
    features: ["12oz Japanese selvedge denim", "5-pocket construction", "Riveted stress points", "Button fly"],
    specifications: { "Material": "100% Japanese selvedge denim", "Fit": "Straight", "Rise": "Mid rise", "Waist": "28–38 inches", "Color": "Indigo" },
    sizes: ["28", "29", "30", "31", "32", "33", "34", "36", "38"],
    colors: [{ name: "Indigo", hex: "#3F5F8A" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 72,
    isTopSeller: true
  },
  {
    id: 10,
    name: "Oversized Graphic Tee",
    price: 14999,
    originalPrice: 19999,
    category: "fashion",
    brand: "Zara",
    rating: 4.2,
    reviews: 456,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop"
    ],
    description: "Street-ready oversized tee with bold graphic print. 100% heavyweight cotton for structure and durability.",
    specifications: { "Material": "100% Cotton 250gsm", "Fit": "Oversized", "Neckline": "Crew neck", "Color": "Black" },
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }, { name: "Grey", hex: "#888888" }],
    inStock: true, stock: 200,
    isFlashSale: true, flashPrice: 11999, isNewArrival: true
  },

  // ─── FASHION — Women's Clothing ──────────────────────────────────────
  {
    id: 11,
    name: "Floral Wrap Midi Dress",
    price: 44999,
    originalPrice: 59999,
    category: "fashion",
    brand: "Zara",
    rating: 4.6,
    reviews: 612,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop"
    ],
    description: "A feminine wrap dress in a vibrant floral print. Adjustable tie waist flatters all body types.",
    features: ["Viscose blend fabric", "Adjustable wrap tie", "V-neckline", "Midi length"],
    specifications: { "Material": "100% Viscose", "Fit": "Wrap", "Length": "Midi", "Care": "Hand wash", "Color": "Floral" },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Floral Blue", hex: "#5B8DB8" }, { name: "Floral Red", hex: "#C0392B" }],
    inStock: true, stock: 83,
    isTopSeller: true, isNewArrival: true
  },
  {
    id: 12,
    name: "High-Waist Tailored Blazer",
    price: 74999,
    originalPrice: 94999,
    category: "fashion",
    brand: "H&M",
    rating: 4.7,
    reviews: 398,
    image: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4f4e?w=600&h=600&fit=crop"
    ],
    description: "A sharp, structured blazer that transitions effortlessly from boardroom to brunch. Lined interior and quality buttons.",
    specifications: { "Material": "Polyester blend", "Fit": "Tailored", "Lining": "Fully lined", "Color": "Black", "Buttons": "Gold-tone" },
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Beige", hex: "#D4C5A9" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 47,
    isTopSeller: true, isFlashSale: true, flashPrice: 62999
  },
  {
    id: 13,
    name: "Ribbed Knit Crop Top",
    price: 17999,
    originalPrice: 22999,
    category: "fashion",
    brand: "Zara",
    rating: 4.4,
    reviews: 534,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop"
    ],
    description: "Effortlessly cool ribbed knit crop top. Pairs perfectly with high-waist jeans, skirts, or tailored trousers.",
    specifications: { "Material": "92% Viscose, 8% Elastane", "Fit": "Slim", "Length": "Crop", "Color": "Beige" },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Beige", hex: "#D4C5A9" }, { name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 115,
    isNewArrival: true
  },
  {
    id: 14,
    name: "Wide-Leg Linen Trousers",
    price: 39999,
    originalPrice: 49999,
    category: "fashion",
    brand: "Massimo Dutti",
    rating: 4.5,
    reviews: 287,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop"
    ],
    description: "Relaxed wide-leg trousers in breathable linen. The perfect warm-weather bottom for effortless dressing.",
    specifications: { "Material": "100% Linen", "Fit": "Wide leg", "Rise": "High waist", "Care": "Hand wash", "Color": "White" },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Beige", hex: "#D4C5A9" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 68,
    isFlashSale: true, flashPrice: 33999
  },

  // ─── FASHION — Bags & Accessories ────────────────────────────────────
  {
    id: 15,
    name: "Mini Leather Crossbody Bag",
    price: 54999,
    originalPrice: 69999,
    category: "fashion",
    brand: "Coach",
    rating: 4.8,
    reviews: 756,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"
    ],
    description: "Compact and practical, this genuine leather crossbody bag features an adjustable strap, zip closure, and interior pockets for everything you need.",
    features: ["Genuine pebbled leather", "Adjustable crossbody strap", "Interior zip pocket", "Gold-tone hardware"],
    specifications: { "Material": "Genuine leather", "Dimensions": "22 × 16 × 8 cm", "Closure": "Zip", "Strap": "Adjustable", "Color": "Black" },
    colors: [{ name: "Black", hex: "#111111" }, { name: "Tan", hex: "#C4A35A" }, { name: "Red", hex: "#C0392B" }],
    inStock: true, stock: 55,
    isTopSeller: true, isNewArrival: true
  },
  {
    id: 16,
    name: "Canvas Tote Bag",
    price: 18999,
    originalPrice: 24999,
    category: "fashion",
    brand: "Polo Ralph Lauren",
    rating: 4.4,
    reviews: 421,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=600&h=600&fit=crop"
    ],
    description: "A sturdy, spacious canvas tote with leather handles. Carry your essentials in style.",
    specifications: { "Material": "Heavy canvas + leather handles", "Dimensions": "40 × 35 × 12 cm", "Closure": "Open top", "Color": "Natural" },
    colors: [{ name: "Natural", hex: "#D4C5A9" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 90,
    isFlashSale: true, flashPrice: 14999
  },
  {
    id: 17,
    name: "Structured Leather Handbag",
    price: 129999,
    originalPrice: 159999,
    category: "fashion",
    brand: "Coach",
    rating: 4.9,
    reviews: 332,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
    ],
    description: "A timeless structured handbag crafted from full-grain leather. Magnetic snap closure and suede lining give it a luxurious feel.",
    features: ["Full-grain leather", "Suede lining", "Magnetic snap closure", "Removable crossbody strap"],
    specifications: { "Material": "Full-grain leather", "Dimensions": "30 × 22 × 12 cm", "Closure": "Magnetic snap", "Hardware": "Gold-tone", "Color": "Tan" },
    colors: [{ name: "Tan", hex: "#C4A35A" }, { name: "Black", hex: "#111111" }, { name: "Burgundy", hex: "#6D2B2B" }],
    inStock: true, stock: 28,
    isTopSeller: true, isNewArrival: true
  },
  {
    id: 18,
    name: "Premium Leather Wallet",
    price: 22999,
    originalPrice: 29999,
    category: "fashion",
    brand: "Levi's",
    rating: 4.5,
    reviews: 678,
    image: "https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=600&fit=crop"
    ],
    description: "Slim bifold wallet in full-grain leather with RFID blocking. 6 card slots, 2 currency compartments.",
    specifications: { "Material": "Full-grain leather", "Card Slots": "6", "RFID Blocking": "Yes", "Color": "Brown" },
    colors: [{ name: "Brown", hex: "#8B4513" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 110,
    isFlashSale: true, flashPrice: 18999
  },
  {
    id: 19,
    name: "Aviator Sunglasses",
    price: 34999,
    originalPrice: 44999,
    category: "fashion",
    brand: "Ray-Ban",
    rating: 4.7,
    reviews: 892,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=600&h=600&fit=crop"
    ],
    description: "The iconic Ray-Ban Aviator in gold metal frame with green G-15 lenses. UV400 protection.",
    specifications: { "Frame Material": "Metal", "Lens": "G-15 glass", "UV Protection": "UV400", "Frame Colour": "Gold", "Lens Colour": "Green" },
    colors: [{ name: "Gold/Green", hex: "#C4A35A" }, { name: "Silver/Blue", hex: "#5B8DB8" }],
    inStock: true, stock: 65,
    isTopSeller: true
  },
  {
    id: 20,
    name: "Minimalist Leather Belt",
    price: 19999,
    originalPrice: 26999,
    category: "fashion",
    brand: "Levi's",
    rating: 4.4,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
    ],
    description: "Clean, minimal leather belt with a brushed silver pin buckle. Works with jeans or tailored trousers.",
    specifications: { "Material": "Full-grain leather", "Width": "35mm", "Buckle": "Silver pin buckle", "Size Range": "75–110cm", "Color": "Black" },
    colors: [{ name: "Black", hex: "#111111" }, { name: "Brown", hex: "#8B4513" }],
    inStock: true, stock: 130,
    isFlashSale: true, flashPrice: 15999
  },

  // ─── FASHION — Watches & Jewellery ───────────────────────────────────
  {
    id: 21,
    name: "Classic Stainless Steel Watch",
    price: 189999,
    originalPrice: 229999,
    category: "fashion",
    brand: "Daniel Wellington",
    rating: 4.7,
    reviews: 1024,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600&h=600&fit=crop"
    ],
    description: "A timeless watch with a 40mm stainless steel case, sapphire crystal glass, and interchangeable strap system.",
    features: ["Sapphire crystal glass", "Japanese quartz movement", "5ATM water resistance", "Interchangeable strap"],
    specifications: { "Case Diameter": "40mm", "Movement": "Japanese Quartz", "Crystal": "Sapphire", "Water Resistance": "5ATM", "Color": "Silver/White" },
    colors: [{ name: "Silver", hex: "#C0C0C0" }, { name: "Gold", hex: "#C4A35A" }, { name: "Rose Gold", hex: "#E8B4B8" }],
    inStock: true, stock: 42,
    isTopSeller: true, isNewArrival: true
  },
  {
    id: 22,
    name: "Gold-Plated Chain Necklace",
    price: 29999,
    originalPrice: 39999,
    category: "fashion",
    brand: "Pandora",
    rating: 4.6,
    reviews: 523,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop"
    ],
    description: "Delicate 18k gold-plated curb chain necklace. Hypoallergenic and tarnish-resistant.",
    specifications: { "Material": "18k gold-plated brass", "Length": "45cm + 5cm extension", "Clasp": "Lobster claw", "Hypoallergenic": "Yes", "Color": "Gold" },
    inStock: true, stock: 88,
    isFlashSale: true, flashPrice: 24999, isNewArrival: true
  },

  // ─── BEAUTY & SKINCARE ────────────────────────────────────────────────
  {
    id: 23,
    name: "Vitamin C Brightening Serum",
    price: 24999,
    originalPrice: 31999,
    category: "beauty",
    brand: "CeraVe",
    rating: 4.8,
    reviews: 2341,
    image: "/images/Vitamin-C-Brightening-Serum.jpg",
    images: [
      "/images/Vitamin-C-Brightening-Serum2.jpg",
      "/images/Vitamin-C-Brightening-Serum3.jpg"
    ],
    description: "20% stabilised Vitamin C serum that brightens, evens skin tone, and reduces the appearance of dark spots with daily use.",
    features: ["20% L-Ascorbic Acid", "Hyaluronic acid for hydration", "Vitamin E and Ferulic acid", "Fragrance-free"],
    specifications: { "Key Ingredient": "20% Vitamin C", "Volume": "30ml", "Skin Type": "All skin types", "Fragrance": "Fragrance-free", "pH": "3.5" },
    inStock: true, stock: 154,
    isTopSeller: true, isFlashSale: true, flashPrice: 20999
  },
  {
    id: 24,
    name: "Hydrating Moisturiser SPF 30",
    price: 18999,
    originalPrice: 23999,
    category: "beauty",
    brand: "CeraVe",
    rating: 4.7,
    reviews: 3215,
    image: "/images/Hydrating-Moisturiser-SPF-30.jpg",
    images: [
      "/images/Hydrating-Moisturiser-SPF-30-2.jpg",
      "/images/Hydrating-Moisturiser-SPF-30-3.jpg"
    ],
    description: "Daily moisturiser with SPF 30. Developed with dermatologists to restore and maintain the skin's natural barrier.",
    features: ["3 essential ceramides", "Hyaluronic acid", "MVE technology for 24hr hydration", "Broad spectrum SPF 30"],
    specifications: { "SPF": "30", "Volume": "52ml", "Skin Type": "Normal to dry", "Fragrance": "Fragrance-free", "Key Ingredients": "Ceramides, Hyaluronic Acid" },
    inStock: true, stock: 189,
    isTopSeller: true
  },
  {
    id: 25,
    name: "Fenty Beauty Pro Filt'r Foundation",
    price: 36999,
    originalPrice: 44999,
    category: "beauty",
    brand: "Fenty Beauty",
    rating: 4.7,
    reviews: 4521,
    image: "/images/Fenty-Beauty-Pro-Filt'r-Foundation.jpg",
    images: [
      "/images/Fenty-Beauty-Pro-Filt'r-Foundation2.jpg",
      "/images/Fenty-Beauty-Pro-Filt'r-Foundation3.jpg"
    ],
    description: "Pro Filt'r Soft Matte Longwear Foundation. 50 shades for every skin tone. Buildable medium-to-full coverage that lasts up to 24 hours.",
    features: ["50 inclusive shades", "Buildable medium-to-full coverage", "Soft matte finish", "24-hour wear"],
    specifications: { "Volume": "32ml", "Coverage": "Medium to full", "Finish": "Soft matte", "Shades": "50 shades", "SPF": "None" },
    inStock: true, stock: 96,
    isTopSeller: true, isNewArrival: false
  },
  {
    id: 26,
    name: "Laneige Lip Sleeping Mask",
    price: 19999,
    originalPrice: 24999,
    category: "beauty",
    brand: "Laneige",
    rating: 4.9,
    reviews: 6743,
    image: "/images/Laneige-Lip-Sleeping-Mask.jpg",
    images: [
      "/images/Laneige-Lip-Sleeping-Mask2.jpg",
      "/images/Laneige-Lip-Sleeping-Mask3.jpg"
    ],
    description: "Overnight lip treatment enriched with Berry Mix Complex and Vitamin C to deliver intensely hydrated, smooth lips by morning.",
    features: ["Berry Mix Complex antioxidants", "Moisture Wrap technology", "Vitamin C brightening", "Sweet scent"],
    specifications: { "Volume": "20g", "Type": "Overnight mask", "Scent": "Berry", "Key Ingredient": "Berry Mix Complex" },
    inStock: true, stock: 213,
    isTopSeller: true, isFlashSale: true, flashPrice: 16999
  },
  {
    id: 27,
    name: "Niacinamide 10% + Zinc 1% Serum",
    price: 13999,
    originalPrice: 17999,
    category: "beauty",
    brand: "The Ordinary",
    rating: 4.6,
    reviews: 8921,
    image: "/images/Niacinamide-10%-+-Zinc-1%-Serum.jpg",
    images: [
      "/images/Niacinamide-10%-+-Zinc-1%-Serum2.jpg",
      "/images/Niacinamide-10%-+-Zinc-1%-Serum3.jpg"
    ],
    description: "High-strength vitamin and mineral blemish formula. Reduces the appearance of blemishes and congestion.",
    features: ["10% Niacinamide", "1% Zinc PCA", "Reduces blemishes", "Minimises pore appearance"],
    specifications: { "Volume": "30ml", "Key Ingredients": "Niacinamide, Zinc PCA", "Skin Type": "Oily / Blemish-prone", "Fragrance": "Fragrance-free" },
    inStock: true, stock: 312,
    isTopSeller: true, isFlashSale: true, flashPrice: 10999, isNewArrival: true
  },
  {
    id: 28,
    name: "Charlotte Tilbury Pillow Talk Lipstick",
    price: 28999,
    originalPrice: 34999,
    category: "beauty",
    brand: "Charlotte Tilbury",
    rating: 4.8,
    reviews: 3421,
    image: "/images/Charlotte-Tilbury-Pillow-Talk-Lipstick.jpg",
    images: [
      "/images/Charlotte-Tilbury-Pillow-Talk-Lipstick2.jpg",
      "/images/Charlotte-Tilbury-Pillow-Talk-Lipstick3.jpg"
    ],
    description: "The iconic Pillow Talk Matte Revolution Lipstick in the universally flattering rose pink that suits every skin tone.",
    specifications: { "Weight": "3.5g", "Finish": "Matte", "Shade": "Pillow Talk", "Vegan": "Yes", "Longevity": "Up to 8 hours" },
    inStock: true, stock: 78,
    isNewArrival: true
  },
  {
    id: 29,
    name: "NIVEA Luminous Glow Body Lotion",
    price: 8999,
    originalPrice: 11999,
    category: "beauty",
    brand: "NIVEA",
    rating: 4.4,
    reviews: 1876,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop"
    ],
    description: "Luminous 630 anti dark-spot body lotion. Visibly reduces dark spots with regular use for luminous, even-toned skin.",
    specifications: { "Volume": "400ml", "Key Ingredient": "LUMINOUS 630", "Skin Type": "All skin types", "Fragrance": "Light floral" },
    inStock: true, stock: 245,
    isFlashSale: true, flashPrice: 6999, isTopSeller: true
  },
  {
    id: 30,
    name: "Dyson Airwrap Multi-Styler",
    price: 649999,
    originalPrice: 749999,
    category: "beauty",
    brand: "Dyson",
    rating: 4.8,
    reviews: 1243,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop"
    ],
    description: "Style and dry simultaneously with Dyson's Coanda effect technology. No extreme heat. Multiple attachments for curls, waves, and straight styles.",
    features: ["Coanda airflow styling", "No extreme heat", "5 attachments included", "Frizz control filter"],
    specifications: { "Voltage": "220-240V", "Cord Length": "2.7m", "Attachments": "5 included", "Heat Settings": "3 speed / 4 heat" },
    inStock: true, stock: 18,
    isTopSeller: true, isNewArrival: true
  },

  // ─── LIFESTYLE — Fragrance ────────────────────────────────────────────
  {
    id: 31,
    name: "Acqua di Giò Eau de Toilette",
    price: 189999,
    originalPrice: 224999,
    category: "lifestyle",
    brand: "Giorgio Armani",
    rating: 4.9,
    reviews: 2341,
    image: "/images/Acqua-di-Giò-Eau-de-Toilette.jpg",
    images: [
      "/images/Acqua-di-Giò-Eau-de-Toilette2.jpg",
      "/images/Acqua-di-Giò-Eau-de-Toilette3.jpg"
    ],
    description: "An ode to the Mediterranean sea. Fresh citrus and marine notes blend with a warm base of cedarwood and patchouli.",
    features: ["Top: Bergamot, Neroli, Green Tangerine", "Heart: Marine notes, Rosemary", "Base: Cedar, Vetiver, Patchouli"],
    specifications: { "Volume": "100ml", "Type": "Eau de Toilette", "Concentration": "EDT", "Gender": "Men", "Longevity": "6-8 hours" },
    inStock: true, stock: 35,
    isTopSeller: true, isFlashSale: true, flashPrice: 164999
  },
  {
    id: 32,
    name: "Black Opium Eau de Parfum",
    price: 209999,
    originalPrice: 249999,
    category: "lifestyle",
    brand: "Yves Saint Laurent",
    rating: 4.8,
    reviews: 1876,
    image: "/images/Black-Opium-Eau-de-Parfum.jpg",
    images: [
      "/images/Black-Opium-Eau-de-Parfum2.jpg",
      "/images/Black-Opium-Eau-de-Parfum3.jpg"
    ],
    description: "A rock 'n' roll fragrance with an intoxicating, addictive quality. Coffee, white flowers and vanilla create a bold feminine scent.",
    features: ["Top: Pink pepper, Orange blossom", "Heart: Coffee, Jasmine", "Base: Vanilla, Woody notes, Patchouli"],
    specifications: { "Volume": "90ml", "Type": "Eau de Parfum", "Concentration": "EDP", "Gender": "Women", "Longevity": "8-10 hours" },
    inStock: true, stock: 28,
    isTopSeller: true, isNewArrival: true
  },

  // ─── LIFESTYLE — Home & Living ────────────────────────────────────────
  {
    id: 33,
    name: "Luxury Scented Candle Set",
    price: 34999,
    originalPrice: 44999,
    category: "lifestyle",
    brand: "Jo Malone",
    rating: 4.7,
    reviews: 543,
    image: "/images/Luxury-Scented-Candle-Set.jpg",
    images: [
      "/images/Luxury-Scented-Candle-Set-2.jpg",
      "/images/Luxury-Scented-Candle-Set-3.jpg"
    ],
    description: "A curated set of three hand-poured soy wax candles in elegant amber glass jars. Burn time 45 hours each.",
    specifications: { "Wax": "Premium soy blend", "Burn Time": "45 hours each", "Volume": "3 × 200g", "Wick": "Cotton wick", "Scents": "Rose, Sandalwood, Citrus" },
    inStock: true, stock: 67,
    isNewArrival: true, isTopSeller: true, isFlashSale: true, flashPrice: 28999
  },
  {
    id: 34,
    name: "Cashmere Throw Blanket",
    price: 79999,
    originalPrice: 99999,
    category: "lifestyle",
    brand: "Zara Home",
    rating: 4.8,
    reviews: 312,
    image: "/images/Cashmere-Throw-Blanket.jpg",
    images: [
      "/images/Cashmere-Throw-Blanket2.jpg",
      "/images/Cashmere-Throw-Blanket3.jpg"
    ],
    description: "Luxuriously soft cashmere-blend throw. Perfect for cool evenings. Available in neutral tones to complement any interior.",
    specifications: { "Material": "70% Cashmere, 30% Wool", "Dimensions": "130 × 180cm", "Care": "Dry clean only", "Color": "Camel" },
    colors: [{ name: "Camel", hex: "#C4A35A" }, { name: "Grey", hex: "#888888" }, { name: "Ivory", hex: "#FFFFF0" }],
    inStock: true, stock: 34,
    isTopSeller: true
  },
  {
    id: 35,
    name: "Premium Yoga Mat",
    price: 29999,
    originalPrice: 39999,
    category: "lifestyle",
    brand: "Lululemon",
    rating: 4.7,
    reviews: 1243,
    image: "/images/pro-yoga-mat.jpg",
    images: [
      "/images/pro-yoga-mat2.jpg",
      "/images/pro-yoga-mat3.jpg"
    ],
    description: "Non-slip, sweat-resistant yoga mat with alignment lines. 5mm thick for joint support.",
    specifications: { "Material": "Natural rubber", "Thickness": "5mm", "Dimensions": "183 × 61cm", "Non-Slip": "Yes", "Color": "Purple" },
    colors: [{ name: "Purple", hex: "#6B2FA0" }, { name: "Black", hex: "#111111" }, { name: "Teal", hex: "#008080" }],
    inStock: true, stock: 88,
    isFlashSale: true, flashPrice: 24999, isNewArrival: true
  },
  {
    id: 36,
    name: "Stainless Steel Water Bottle",
    price: 14999,
    originalPrice: 19999,
    category: "lifestyle",
    brand: "Lululemon",
    rating: 4.6,
    reviews: 2134,
    image: "/images/Stainless-Steel-Water-Bottle.jpg",
    images: [
      "/images/Stainless-Steel-Water-Bottle2.jpg",
      "/images/Stainless-Steel-Water-Bottle3.jpg"
    ],

    description: "Double-wall vacuum insulated bottle. Keeps drinks cold 24hrs or hot 12hrs. Leak-proof lid.",
    specifications: { "Material": "18/8 stainless steel", "Capacity": "750ml", "Cold": "24 hours", "Hot": "12 hours", "Color": "Black" },
    colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }, { name: "Sage", hex: "#8FBC8F" }],
    inStock: true, stock: 167,
    isTopSeller: true
  },

  // ─── LIFESTYLE — Fitness ──────────────────────────────────────────────
  {
    id: 37,
    name: "Lightweight Running Jacket",
    price: 49999,
    originalPrice: 64999,
    category: "lifestyle",
    brand: "Nike",
    rating: 4.6,
    reviews: 678,
    image: "/images/Lightweight-Running-Jacket.jpg",
    images: [
      "/images/Lightweight-Running-Jacket2.jpg",
      "/images/Lightweight-Running-Jacket3.jpg"
    ],
    description: "Packable running jacket with windproof and water-resistant fabric. Stows in its own pocket.",
    specifications: { "Material": "100% Polyester", "Water Resistant": "Yes", "Packable": "Yes", "Size Range": "XS–3XL", "Color": "Black" },
    sizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Navy", hex: "#1a1a2e" }, { name: "Red", hex: "#C0392B" }],
    inStock: true, stock: 56,
    isFlashSale: true, flashPrice: 41999, isNewArrival: true
  },
  {
    id: 38,
    name: "High-Waist Workout Leggings",
    price: 32999,
    originalPrice: 42999,
    category: "lifestyle",
    brand: "Lululemon",
    rating: 4.8,
    reviews: 2341,
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop"
    ],
    description: "Four-way stretch leggings with moisture-wicking fabric and hidden waistband pocket. Squat-proof.",
    features: ["Four-way stretch", "Moisture-wicking", "Squat-proof", "Hidden pocket"],
    specifications: { "Material": "78% Nylon, 22% Elastane", "Rise": "High waist", "Length": "Full length", "Squat-Proof": "Yes", "Color": "Black" },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Navy", hex: "#1a1a2e" }, { name: "Burgundy", hex: "#6D2B2B" }],
    inStock: true, stock: 102,
    isTopSeller: true
  },
  {
    id: 39,
    name: "Sports Bra — Medium Support",
    price: 22999,
    originalPrice: 29999,
    category: "lifestyle",
    brand: "Nike",
    rating: 4.5,
    reviews: 1456,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"
    ],
    description: "Medium-support sports bra with Dri-FIT technology. Padded cups and racerback design for freedom of movement.",
    specifications: { "Support Level": "Medium", "Technology": "Dri-FIT", "Cups": "Removable pads", "Back Style": "Racerback", "Color": "Black" },
    sizes: ["XS", "S", "M", "L", "XL"],
    inStock: true, stock: 134,
    isFlashSale: true, flashPrice: 18999
  },
  {
    id: 40,
    name: "Adidas Fleece Hoodie",
    price: 39999,
    originalPrice: 49999,
    category: "lifestyle",
    brand: "Adidas",
    rating: 4.5,
    reviews: 934,
    image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=600&fit=crop"
    ],
    description: "Classic Adidas trefoil hoodie in soft cotton-blend fleece with a front kangaroo pocket.",
    specifications: { "Material": "70% Cotton, 30% Polyester", "Fit": "Regular", "Pockets": "Kangaroo pocket", "Color": "Grey" },
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Grey", hex: "#888888" }, { name: "Black", hex: "#111111" }, { name: "Navy", hex: "#1a1a2e" }],
    inStock: true, stock: 78,
    isTopSeller: true, isNewArrival: true
  },

  // ─── FASHION — Outerwear ──────────────────────────────────────────────
  {
    id: 41,
    name: "Wool Overcoat",
    price: 189999,
    originalPrice: 239999,
    category: "fashion",
    brand: "Massimo Dutti",
    rating: 4.8,
    reviews: 421,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop"
    ],
    description: "A beautifully structured wool overcoat with a single-breasted button closure and notched lapels. An investment piece for every wardrobe.",
    features: ["80% Wool, 20% Polyamide", "Fully lined", "Single-breasted", "Side pockets"],
    specifications: { "Material": "80% Wool, 20% Polyamide", "Lining": "Fully lined", "Length": "Long", "Color": "Camel" },
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Camel", hex: "#C4A35A" }, { name: "Black", hex: "#111111" }, { name: "Grey", hex: "#888888" }],
    inStock: true, stock: 24,
    isTopSeller: true, isFlashSale: true, flashPrice: 159999
  },
  {
    id: 42,
    name: "Denim Trucker Jacket",
    price: 54999,
    originalPrice: 69999,
    category: "fashion",
    brand: "Levi's",
    rating: 4.6,
    reviews: 789,
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=600&fit=crop"
    ],
    description: "The iconic Levi's Trucker Jacket. 100% cotton denim with adjustable side tabs and multiple pockets.",
    specifications: { "Material": "100% Cotton denim", "Fit": "Regular", "Pockets": "4 front pockets", "Closure": "Button", "Color": "Medium Indigo" },
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Medium Indigo", hex: "#4B6FA0" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 61,
    isNewArrival: true
  },
  {
    id: 43,
    name: "Puffer Vest",
    price: 44999,
    originalPrice: 54999,
    category: "fashion",
    brand: "The North Face",
    rating: 4.5,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1545594861-3bef43ff621e?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1545594861-3bef43ff621e?w=600&h=600&fit=crop"
    ],
    description: "Lightweight but warm puffer vest with 550-fill down insulation. Packable into its own pocket.",
    specifications: { "Fill": "550-fill down", "Shell": "Nylon ripstop", "Packable": "Yes", "Pockets": "2 hand + 1 chest", "Color": "Black" },
    sizes: ["XS", "S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Olive", hex: "#556B2F" }, { name: "Navy", hex: "#1a1a2e" }],
    inStock: true, stock: 45,
    isFlashSale: true, flashPrice: 37999
  },

  // ─── FASHION — Swimwear & Loungewear ─────────────────────────────────
  {
    id: 44,
    name: "Linen Lounge Set",
    price: 49999,
    originalPrice: 62999,
    category: "fashion",
    brand: "Zara",
    rating: 4.6,
    reviews: 343,
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=600&fit=crop"
    ],
    description: "A relaxed matching linen set. Shirt and wide-leg trousers in 100% linen for breathable all-day comfort.",
    specifications: { "Material": "100% Linen", "Set Includes": "Shirt + Trousers", "Care": "Hand wash", "Color": "Natural" },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Natural", hex: "#D4C5A9" }, { name: "White", hex: "#FFFFFF" }, { name: "Sage", hex: "#8FBC8F" }],
    inStock: true, stock: 52,
    isNewArrival: true, isTopSeller: true
  },
  {
    id: 45,
    name: "High-Leg Swimsuit",
    price: 27999,
    originalPrice: 34999,
    category: "fashion",
    brand: "H&M",
    rating: 4.4,
    reviews: 421,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop"
    ],
    description: "A classic high-leg one-piece swimsuit in a bright solid colour. Adjustable straps and UV50+ sun protection.",
    specifications: { "Material": "80% Nylon, 20% Elastane", "UV Protection": "50+", "Straps": "Adjustable", "Style": "High-leg", "Color": "Red" },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [{ name: "Red", hex: "#C0392B" }, { name: "Black", hex: "#111111" }, { name: "Navy", hex: "#1a1a2e" }],
    inStock: true, stock: 73,
    isFlashSale: true, flashPrice: 22999
  },

  // ─── BEAUTY — Hair Care ───────────────────────────────────────────────
  {
    id: 46,
    name: "Olaplex No. 3 Hair Perfector",
    price: 34999,
    originalPrice: 42999,
    category: "beauty",
    brand: "Olaplex",
    rating: 4.8,
    reviews: 5432,
    image: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&h=600&fit=crop"
    ],
    description: "At-home hair treatment that reduces breakage and visibly strengthens hair, minimising damage from any chemical service.",
    features: ["Repairs broken bonds", "Reduces breakage", "Safe for all hair types", "Colour-safe"],
    specifications: { "Volume": "100ml", "Hair Type": "All types", "Usage": "1-3x per week", "Vegan": "Yes", "Fragrance": "Light fresh scent" },
    inStock: true, stock: 143,
    isTopSeller: true, isFlashSale: true, flashPrice: 29999
  },
  {
    id: 47,
    name: "Kerasilk Keratin Treatment",
    price: 49999,
    originalPrice: 62999,
    category: "beauty",
    brand: "Kerasilk",
    rating: 4.7,
    reviews: 876,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop"
    ],
    description: "Professional at-home keratin smoothing treatment. Eliminates frizz and adds mirror-like shine for up to 3 months.",
    specifications: { "Volume": "200ml", "Longevity": "Up to 3 months", "Scent": "Floral", "Usage": "At-home treatment", "Hair Type": "All types" },
    inStock: true, stock: 55,
    isNewArrival: true
  },

  // ─── LIFESTYLE — Stationery / Tech Accessories ────────────────────────
  {
    id: 48,
    name: "Leather Passport Holder & Wallet",
    price: 24999,
    originalPrice: 32999,
    category: "lifestyle",
    brand: "Coach",
    rating: 4.6,
    reviews: 432,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop"
    ],
    description: "Full-grain leather passport holder with 6 card slots and an RFID-blocking layer. Your travel essential.",
    specifications: { "Material": "Full-grain leather", "Card Slots": "6", "RFID Blocking": "Yes", "Dimensions": "10 × 14cm", "Color": "Brown" },
    colors: [{ name: "Brown", hex: "#8B4513" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 87,
    isFlashSale: true, flashPrice: 19999, isTopSeller: true
  },
  {
    id: 49,
    name: "Wireless Charging Pad",
    price: 22999,
    originalPrice: 29999,
    category: "lifestyle",
    brand: "Belkin",
    rating: 4.5,
    reviews: 1243,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop"
    ],
    description: "15W fast wireless charging pad compatible with iPhone, Samsung, and all Qi-enabled devices.",
    specifications: { "Output": "Up to 15W", "Compatibility": "Qi-enabled devices", "Cable Length": "1.2m", "Color": "Black", "Input": "USB-C" },
    inStock: true, stock: 112,
    isTopSeller: true, isFlashSale: true, flashPrice: 18999
  },
  {
    id: 50,
    name: "Noise-Cancelling Wireless Earbuds",
    price: 149999,
    originalPrice: 184999,
    category: "lifestyle",
    brand: "Sony",
    rating: 4.8,
    reviews: 3421,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop"
    ],
    description: "Industry-leading noise cancellation in a compact earbud. 8 hours battery + 24 hours with case.",
    features: ["Active noise cancellation", "LDAC for Hi-Res Audio", "Multipoint connection", "IPX4 water resistance"],
    specifications: { "Battery (Buds)": "8 hours", "Battery (Total)": "32 hours", "Noise Cancelling": "Active NC", "Water Resistance": "IPX4", "Color": "Black" },
    colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 67,
    isTopSeller: true, isFlashSale: true, flashPrice: 129999
  }
];

export default products.map(normalizeProductAssets);
