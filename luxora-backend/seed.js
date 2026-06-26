require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // ─── FASHION — Footwear ───────────────────────────────────────────────
  {
    name: "Nike Air Force 1 '07", price: 89999, originalPrice: 109999,
    category: "fashion", brand: "Nike", rating: 4.8, reviews: 1243,
    image: "/images/nike-black.jpg",
    images: ["/images/nike-black.jpg", "/images/nike3.jpg", "/images/nike2.jpg"],
    description: "The legend lives on. The Nike Air Force 1 '07 brings classic hoops style to the streets with its durable leather upper and comfortable Air cushioning.",
    features: ["Genuine leather upper", "Air-Sole unit for cushioning", "Rubber outsole for durability"],
    sizes: ["36","37","38","39","40","41","42","43","44","45","46"],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 89, isTopSeller: true, isFlashSale: true, flashPrice: 74999
  },
  {
    name: "Adidas Ultraboost 22", price: 119999, originalPrice: 149999,
    category: "fashion", brand: "Adidas", rating: 4.7, reviews: 876,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop"],
    description: "Feel the energy return with every step. The Ultraboost 22 features a Primeknit upper and responsive Boost midsole.",
    features: ["Primeknit+ upper", "Continental™ Rubber outsole", "BOOST midsole"],
    sizes: ["37","38","39","40","41","42","43","44","45"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 54, isTopSeller: true
  },
  {
    name: "Timberland Premium 6-Inch Boot", price: 134999, originalPrice: 159999,
    category: "fashion", brand: "Timberland", rating: 4.6, reviews: 542,
    image: "/images/The-6-inch-Boot-Timberland.jpg",
    images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&h=600&fit=crop"],
    description: "The original waterproof boot that became a cultural icon. Premium nubuck leather and direct-attach construction.",
    features: ["Premium waterproof nubuck leather", "Anti-fatigue technology", "Rubber lug outsole"],
    sizes: ["38","39","40","41","42","43","44","45","46"],
    colors: [{ name: "Wheat", hex: "#C4A35A" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 38, isNewArrival: true, isTopSeller: true
  },
  {
    name: "New Balance 550 Retro Sneaker", price: 94999, originalPrice: 114999,
    category: "fashion", brand: "New Balance", rating: 4.5, reviews: 389,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&h=600&fit=crop"],
    description: "A retro basketball silhouette reimagined for everyday wear. Clean leather panels and vintage NB branding.",
    sizes: ["36","37","38","39","40","41","42","43","44","45"],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Beige", hex: "#D4C5A9" }],
    inStock: true, stock: 62, isNewArrival: true, isFlashSale: true, flashPrice: 82999
  },
  {
    name: "Puma RS-X³ Puzzle Sneaker", price: 69999, originalPrice: 84999,
    category: "fashion", brand: "Puma", rating: 4.3, reviews: 215,
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop"],
    description: "Bold, chunky, and colourful. The RS-X³ takes Puma's iconic running system and amplifies it.",
    sizes: ["36","37","38","39","40","41","42","43","44"],
    inStock: true, stock: 44, isFlashSale: true, flashPrice: 59999
  },
  // ─── FASHION — Men's Clothing ──────────────────────────────────────────
  {
    name: "Classic Oxford Button-Down Shirt", price: 29999, originalPrice: 39999,
    category: "fashion", brand: "Polo Ralph Lauren", rating: 4.7, reviews: 834,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=600&fit=crop"],
    description: "A timeless Oxford shirt crafted from soft, breathable cotton. The perfect foundation for any smart-casual wardrobe.",
    features: ["100% combed cotton", "Button-down collar", "Box pleat at back"],
    sizes: ["XS","S","M","L","XL","2XL","3XL"],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Blue", hex: "#5B8DB8" }],
    inStock: true, stock: 120, isTopSeller: true
  },
  {
    name: "Slim-Fit Chino Trousers", price: 34999, originalPrice: 44999,
    category: "fashion", brand: "Zara", rating: 4.4, reviews: 567,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop"],
    description: "Versatile slim-fit chinos in a stretch fabric that moves with you.",
    sizes: ["28","30","32","34","36","38","40"],
    colors: [{ name: "Beige", hex: "#D4C5A9" }, { name: "Navy", hex: "#1a1a2e" }],
    inStock: true, stock: 95, isFlashSale: true, flashPrice: 27999
  },
  {
    name: "Essential Crewneck Sweatshirt", price: 24999, originalPrice: 32999,
    category: "fashion", brand: "H&M", rating: 4.3, reviews: 721,
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&h=600&fit=crop"],
    description: "A wardrobe essential. This heavyweight French terry sweatshirt offers comfort and warmth.",
    sizes: ["XS","S","M","L","XL","2XL"],
    colors: [{ name: "Grey", hex: "#888888" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 145, isTopSeller: true, isNewArrival: true
  },
  {
    name: "Raw Selvedge Denim Jeans", price: 64999, originalPrice: 79999,
    category: "fashion", brand: "Levi's", rating: 4.6, reviews: 943,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=600&fit=crop"],
    description: "Japanese selvedge denim in a classic straight cut. Raw, rigid, and built to age beautifully.",
    features: ["12oz Japanese selvedge denim", "5-pocket construction", "Button fly"],
    sizes: ["28","29","30","31","32","33","34","36","38"],
    colors: [{ name: "Indigo", hex: "#3F5F8A" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 72, isTopSeller: true
  },
  {
    name: "Oversized Graphic Tee", price: 14999, originalPrice: 19999,
    category: "fashion", brand: "Zara", rating: 4.2, reviews: 456,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=600&fit=crop"],
    description: "Street-ready oversized tee with bold graphic print. 100% heavyweight cotton.",
    sizes: ["S","M","L","XL","2XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 200, isFlashSale: true, flashPrice: 11999, isNewArrival: true
  },
  // ─── FASHION — Women's Clothing ───────────────────────────────────────
  {
    name: "Floral Wrap Midi Dress", price: 44999, originalPrice: 59999,
    category: "fashion", brand: "Zara", rating: 4.6, reviews: 612,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=600&fit=crop"],
    description: "A feminine wrap dress in a vibrant floral print. Adjustable tie waist flatters all body types.",
    sizes: ["XS","S","M","L","XL"],
    inStock: true, stock: 83, isTopSeller: true, isNewArrival: true
  },
  {
    name: "High-Waist Tailored Blazer", price: 74999, originalPrice: 94999,
    category: "fashion", brand: "H&M", rating: 4.7, reviews: 398,
    image: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=600&h=600&fit=crop"],
    description: "A sharp, structured blazer that transitions effortlessly from boardroom to brunch.",
    sizes: ["XS","S","M","L","XL","2XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Beige", hex: "#D4C5A9" }],
    inStock: true, stock: 47, isTopSeller: true, isFlashSale: true, flashPrice: 62999
  },
  {
    name: "Ribbed Knit Crop Top", price: 17999, originalPrice: 22999,
    category: "fashion", brand: "Zara", rating: 4.4, reviews: 534,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop"],
    description: "Effortlessly cool ribbed knit crop top.",
    sizes: ["XS","S","M","L","XL"],
    colors: [{ name: "Beige", hex: "#D4C5A9" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 115, isNewArrival: true
  },
  {
    name: "Wide-Leg Linen Trousers", price: 39999, originalPrice: 49999,
    category: "fashion", brand: "Massimo Dutti", rating: 4.5, reviews: 287,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=600&fit=crop"],
    description: "Relaxed wide-leg trousers in breathable linen.",
    sizes: ["XS","S","M","L","XL"],
    colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Beige", hex: "#D4C5A9" }],
    inStock: true, stock: 68, isFlashSale: true, flashPrice: 33999
  },
  // ─── FASHION — Bags & Accessories ─────────────────────────────────────
  {
    name: "Mini Leather Crossbody Bag", price: 54999, originalPrice: 69999,
    category: "fashion", brand: "Coach", rating: 4.8, reviews: 756,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop"],
    description: "Compact and practical genuine leather crossbody bag with adjustable strap.",
    features: ["Genuine pebbled leather", "Adjustable crossbody strap", "Gold-tone hardware"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Tan", hex: "#C4A35A" }],
    inStock: true, stock: 55, isTopSeller: true, isNewArrival: true
  },
  {
    name: "Canvas Tote Bag", price: 18999, originalPrice: 24999,
    category: "fashion", brand: "Polo Ralph Lauren", rating: 4.4, reviews: 421,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=600&h=600&fit=crop"],
    description: "A sturdy, spacious canvas tote with leather handles.",
    colors: [{ name: "Natural", hex: "#D4C5A9" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 90, isFlashSale: true, flashPrice: 14999
  },
  {
    name: "Structured Leather Handbag", price: 129999, originalPrice: 159999,
    category: "fashion", brand: "Coach", rating: 4.9, reviews: 332,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=600&fit=crop"],
    description: "A timeless structured handbag crafted from full-grain leather.",
    features: ["Full-grain leather", "Suede lining", "Magnetic snap closure"],
    colors: [{ name: "Tan", hex: "#C4A35A" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 28, isTopSeller: true, isNewArrival: true
  },
  {
    name: "Premium Leather Wallet", price: 22999, originalPrice: 29999,
    category: "fashion", brand: "Levi's", rating: 4.5, reviews: 678,
    image: "https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=600&fit=crop"],
    description: "Slim bifold wallet in full-grain leather with RFID blocking. 6 card slots.",
    colors: [{ name: "Brown", hex: "#8B4513" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 110, isFlashSale: true, flashPrice: 18999
  },
  {
    name: "Aviator Sunglasses", price: 34999, originalPrice: 44999,
    category: "fashion", brand: "Ray-Ban", rating: 4.7, reviews: 892,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop"],
    description: "The iconic Ray-Ban Aviator in gold metal frame with green G-15 lenses. UV400 protection.",
    colors: [{ name: "Gold/Green", hex: "#C4A35A" }, { name: "Silver/Blue", hex: "#5B8DB8" }],
    inStock: true, stock: 65, isTopSeller: true
  },
  {
    name: "Minimalist Leather Belt", price: 19999, originalPrice: 26999,
    category: "fashion", brand: "Levi's", rating: 4.4, reviews: 312,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"],
    description: "Clean, minimal leather belt with a brushed silver pin buckle.",
    colors: [{ name: "Black", hex: "#111111" }, { name: "Brown", hex: "#8B4513" }],
    inStock: true, stock: 130, isFlashSale: true, flashPrice: 15999
  },
  // ─── FASHION — Watches & Jewellery ────────────────────────────────────
  {
    name: "Classic Stainless Steel Watch", price: 189999, originalPrice: 229999,
    category: "fashion", brand: "Daniel Wellington", rating: 4.7, reviews: 1024,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"],
    description: "A timeless watch with 40mm stainless steel case, sapphire crystal glass.",
    features: ["Sapphire crystal glass", "Japanese quartz movement", "5ATM water resistance"],
    colors: [{ name: "Silver", hex: "#C0C0C0" }, { name: "Gold", hex: "#C4A35A" }],
    inStock: true, stock: 42, isTopSeller: true, isNewArrival: true
  },
  {
    name: "Gold-Plated Chain Necklace", price: 29999, originalPrice: 39999,
    category: "fashion", brand: "Pandora", rating: 4.6, reviews: 523,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop"],
    description: "Delicate 18k gold-plated curb chain necklace. Hypoallergenic and tarnish-resistant.",
    inStock: true, stock: 88, isFlashSale: true, flashPrice: 24999, isNewArrival: true
  },
  // ─── BEAUTY & SKINCARE ─────────────────────────────────────────────────
  {
    name: "Vitamin C Brightening Serum", price: 24999, originalPrice: 31999,
    category: "beauty", brand: "CeraVe", rating: 4.8, reviews: 2341,
    image: "/images/Vitamin-C-Brightening-Serum.jpg",
    images: ["/images/Vitamin-C-Brightening-Serum2.jpg"],
    description: "20% stabilised Vitamin C serum that brightens, evens skin tone, and reduces dark spots.",
    features: ["20% L-Ascorbic Acid", "Hyaluronic acid", "Fragrance-free"],
    inStock: true, stock: 154, isTopSeller: true, isFlashSale: true, flashPrice: 20999
  },
  {
    name: "Hydrating Moisturiser SPF 30", price: 18999, originalPrice: 23999,
    category: "beauty", brand: "CeraVe", rating: 4.7, reviews: 3215,
    image: "/images/Hydrating-Moisturiser-SPF-30.jpg",
    images: ["/images/Hydrating-Moisturiser-SPF-30-2.jpg"],
    description: "Daily moisturiser with SPF 30. Developed with dermatologists to restore the skin's natural barrier.",
    features: ["3 essential ceramides", "Hyaluronic acid", "Broad spectrum SPF 30"],
    inStock: true, stock: 189, isTopSeller: true
  },
  {
    name: "Fenty Beauty Pro Filt'r Foundation", price: 36999, originalPrice: 44999,
    category: "beauty", brand: "Fenty Beauty", rating: 4.7, reviews: 4521,
    image: "/images/Fenty-Beauty-Pro-Filtr-Foundation.jpg",
    images: ["/images/Fenty-Beauty-Pro-Filtr-Foundation2.jpg"],
    description: "Pro Filt'r Soft Matte Longwear Foundation. 50 shades. Buildable medium-to-full coverage.",
    features: ["50 inclusive shades", "Soft matte finish", "24-hour wear"],
    inStock: true, stock: 96, isTopSeller: true
  },
  {
    name: "Laneige Lip Sleeping Mask", price: 19999, originalPrice: 24999,
    category: "beauty", brand: "Laneige", rating: 4.9, reviews: 6743,
    image: "/images/Laneige-Lip-Sleeping-Mask.jpg",
    images: ["/images/Laneige-Lip-Sleeping-Mask2.jpg"],
    description: "Overnight lip treatment enriched with Berry Mix Complex and Vitamin C.",
    features: ["Berry Mix Complex antioxidants", "Moisture Wrap technology", "Vitamin C brightening"],
    inStock: true, stock: 213, isTopSeller: true, isFlashSale: true, flashPrice: 16999
  },
  {
    name: "Niacinamide 10% + Zinc 1% Serum", price: 13999, originalPrice: 17999,
    category: "beauty", brand: "The Ordinary", rating: 4.6, reviews: 8921,
    image: "/images/Niacinamide-Serum.jpg",
    images: ["/images/Niacinamide-Serum2.jpg"],
    description: "High-strength vitamin and mineral blemish formula. Reduces blemishes and congestion.",
    features: ["10% Niacinamide", "1% Zinc PCA", "Fragrance-free"],
    inStock: true, stock: 312, isTopSeller: true, isFlashSale: true, flashPrice: 10999, isNewArrival: true
  },
  {
    name: "Charlotte Tilbury Pillow Talk Lipstick", price: 28999, originalPrice: 34999,
    category: "beauty", brand: "Charlotte Tilbury", rating: 4.8, reviews: 3421,
    image: "/images/Charlotte-Tilbury-Pillow-Talk-Lipstick.jpg",
    images: ["/images/Charlotte-Tilbury-Pillow-Talk-Lipstick2.jpg"],
    description: "The iconic Pillow Talk Matte Revolution Lipstick in universally flattering rose pink.",
    inStock: true, stock: 78, isNewArrival: true
  },
  {
    name: "NIVEA Luminous Glow Body Lotion", price: 8999, originalPrice: 11999,
    category: "beauty", brand: "NIVEA", rating: 4.4, reviews: 1876,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&h=600&fit=crop"],
    description: "Luminous 630 anti dark-spot body lotion for luminous, even-toned skin.",
    inStock: true, stock: 245, isFlashSale: true, flashPrice: 6999, isTopSeller: true
  },
  {
    name: "Dyson Airwrap Multi-Styler", price: 649999, originalPrice: 749999,
    category: "beauty", brand: "Dyson", rating: 4.8, reviews: 1243,
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&h=600&fit=crop"],
    description: "Style and dry simultaneously with Dyson's Coanda effect technology. No extreme heat.",
    features: ["Coanda airflow styling", "No extreme heat", "5 attachments included"],
    inStock: true, stock: 18, isTopSeller: true, isNewArrival: true
  },
  // ─── LIFESTYLE — Fragrance ─────────────────────────────────────────────
  {
    name: "Acqua di Giò Eau de Toilette", price: 189999, originalPrice: 224999,
    category: "lifestyle", brand: "Giorgio Armani", rating: 4.9, reviews: 2341,
    image: "/images/Acqua-di-Gio-Eau-de-Toilette.jpg",
    images: ["/images/Acqua-di-Gio-Eau-de-Toilette2.jpg"],
    description: "Fresh citrus and marine notes blend with a warm base of cedarwood and patchouli.",
    features: ["Top: Bergamot, Neroli", "Heart: Marine notes", "Base: Cedar, Patchouli"],
    inStock: true, stock: 35, isTopSeller: true, isFlashSale: true, flashPrice: 164999
  },
  {
    name: "Black Opium Eau de Parfum", price: 209999, originalPrice: 249999,
    category: "lifestyle", brand: "Yves Saint Laurent", rating: 4.8, reviews: 1876,
    image: "/images/Black-Opium-Eau-de-Parfum.jpg",
    images: ["/images/Black-Opium-Eau-de-Parfum2.jpg"],
    description: "Coffee, white flowers and vanilla create a bold feminine scent.",
    features: ["Top: Pink pepper", "Heart: Coffee, Jasmine", "Base: Vanilla, Patchouli"],
    inStock: true, stock: 28, isTopSeller: true, isNewArrival: true
  },
  // ─── LIFESTYLE — Home & Living ─────────────────────────────────────────
  {
    name: "Luxury Scented Candle Set", price: 34999, originalPrice: 44999,
    category: "lifestyle", brand: "Jo Malone", rating: 4.7, reviews: 543,
    image: "/images/Luxury-Scented-Candle-Set.jpg",
    images: ["/images/Luxury-Scented-Candle-Set-2.jpg"],
    description: "A curated set of three hand-poured soy wax candles. Burn time 45 hours each.",
    inStock: true, stock: 67, isNewArrival: true, isTopSeller: true, isFlashSale: true, flashPrice: 28999
  },
  {
    name: "Cashmere Throw Blanket", price: 79999, originalPrice: 99999,
    category: "lifestyle", brand: "Zara Home", rating: 4.8, reviews: 312,
    image: "/images/Cashmere-Throw-Blanket.jpg",
    images: ["/images/Cashmere-Throw-Blanket2.jpg"],
    description: "Luxuriously soft cashmere-blend throw. Perfect for cool evenings.",
    colors: [{ name: "Camel", hex: "#C4A35A" }, { name: "Grey", hex: "#888888" }],
    inStock: true, stock: 34, isTopSeller: true
  },
  {
    name: "Premium Yoga Mat", price: 29999, originalPrice: 39999,
    category: "lifestyle", brand: "Lululemon", rating: 4.7, reviews: 1243,
    image: "/images/pro-yoga-mat.jpg",
    images: ["/images/pro-yoga-mat2.jpg"],
    description: "Non-slip, sweat-resistant yoga mat with alignment lines. 5mm thick.",
    colors: [{ name: "Purple", hex: "#6B2FA0" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 88, isFlashSale: true, flashPrice: 24999, isNewArrival: true
  },
  {
    name: "Stainless Steel Water Bottle", price: 14999, originalPrice: 19999,
    category: "lifestyle", brand: "Lululemon", rating: 4.6, reviews: 2134,
    image: "/images/Stainless-Steel-Water-Bottle.jpg",
    images: ["/images/Stainless-Steel-Water-Bottle2.jpg"],
    description: "Double-wall vacuum insulated bottle. Keeps drinks cold 24hrs or hot 12hrs.",
    colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 167, isTopSeller: true
  },
  // ─── LIFESTYLE — Fitness ───────────────────────────────────────────────
  {
    name: "Lightweight Running Jacket", price: 49999, originalPrice: 64999,
    category: "lifestyle", brand: "Nike", rating: 4.6, reviews: 678,
    image: "/images/Lightweight-Running-Jacket.jpg",
    images: ["/images/Lightweight-Running-Jacket2.jpg"],
    description: "Packable running jacket with windproof and water-resistant fabric.",
    sizes: ["XS","S","M","L","XL","2XL","3XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Navy", hex: "#1a1a2e" }],
    inStock: true, stock: 56, isFlashSale: true, flashPrice: 41999, isNewArrival: true
  },
  {
    name: "High-Waist Workout Leggings", price: 32999, originalPrice: 42999,
    category: "lifestyle", brand: "Lululemon", rating: 4.8, reviews: 2341,
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=600&fit=crop"],
    description: "Four-way stretch leggings with moisture-wicking fabric. Squat-proof.",
    features: ["Four-way stretch", "Moisture-wicking", "Squat-proof", "Hidden pocket"],
    sizes: ["XS","S","M","L","XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Navy", hex: "#1a1a2e" }],
    inStock: true, stock: 102, isTopSeller: true
  },
  {
    name: "Sports Bra — Medium Support", price: 22999, originalPrice: 29999,
    category: "lifestyle", brand: "Nike", rating: 4.5, reviews: 1456,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"],
    description: "Medium-support sports bra with Dri-FIT technology.",
    sizes: ["XS","S","M","L","XL"],
    inStock: true, stock: 134, isFlashSale: true, flashPrice: 18999
  },
  {
    name: "Adidas Fleece Hoodie", price: 39999, originalPrice: 49999,
    category: "lifestyle", brand: "Adidas", rating: 4.5, reviews: 934,
    image: "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=600&h=600&fit=crop"],
    description: "Classic Adidas trefoil hoodie in soft cotton-blend fleece.",
    sizes: ["XS","S","M","L","XL","2XL"],
    colors: [{ name: "Grey", hex: "#888888" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 78, isTopSeller: true, isNewArrival: true
  },
  // ─── FASHION — Outerwear ───────────────────────────────────────────────
  {
    name: "Wool Overcoat", price: 189999, originalPrice: 239999,
    category: "fashion", brand: "Massimo Dutti", rating: 4.8, reviews: 421,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop"],
    description: "A beautifully structured wool overcoat. An investment piece for every wardrobe.",
    features: ["80% Wool, 20% Polyamide", "Fully lined", "Single-breasted"],
    sizes: ["XS","S","M","L","XL","2XL"],
    colors: [{ name: "Camel", hex: "#C4A35A" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 24, isTopSeller: true, isFlashSale: true, flashPrice: 159999
  },
  {
    name: "Denim Trucker Jacket", price: 54999, originalPrice: 69999,
    category: "fashion", brand: "Levi's", rating: 4.6, reviews: 789,
    image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&h=600&fit=crop"],
    description: "The iconic Levi's Trucker Jacket. 100% cotton denim with adjustable side tabs.",
    sizes: ["XS","S","M","L","XL","2XL"],
    colors: [{ name: "Medium Indigo", hex: "#4B6FA0" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 61, isNewArrival: true
  },
  {
    name: "Puffer Vest", price: 44999, originalPrice: 54999,
    category: "fashion", brand: "The North Face", rating: 4.5, reviews: 512,
    image: "https://images.unsplash.com/photo-1545594861-3bef43ff621e?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1545594861-3bef43ff621e?w=600&h=600&fit=crop"],
    description: "Lightweight but warm puffer vest with 550-fill down insulation. Packable.",
    sizes: ["XS","S","M","L","XL","2XL"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "Olive", hex: "#556B2F" }],
    inStock: true, stock: 45, isFlashSale: true, flashPrice: 37999
  },
  // ─── FASHION — Swimwear & Loungewear ──────────────────────────────────
  {
    name: "Linen Lounge Set", price: 49999, originalPrice: 62999,
    category: "fashion", brand: "Zara", rating: 4.6, reviews: 343,
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=600&fit=crop"],
    description: "A relaxed matching linen set. Shirt and wide-leg trousers in 100% linen.",
    sizes: ["XS","S","M","L","XL"],
    colors: [{ name: "Natural", hex: "#D4C5A9" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 52, isNewArrival: true, isTopSeller: true
  },
  {
    name: "High-Leg Swimsuit", price: 27999, originalPrice: 34999,
    category: "fashion", brand: "H&M", rating: 4.4, reviews: 421,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=600&fit=crop"],
    description: "A classic high-leg one-piece swimsuit with UV50+ sun protection.",
    sizes: ["XS","S","M","L","XL"],
    colors: [{ name: "Red", hex: "#C0392B" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 73, isFlashSale: true, flashPrice: 22999
  },
  // ─── BEAUTY — Hair Care ────────────────────────────────────────────────
  {
    name: "Olaplex No. 3 Hair Perfector", price: 34999, originalPrice: 42999,
    category: "beauty", brand: "Olaplex", rating: 4.8, reviews: 5432,
    image: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=600&h=600&fit=crop"],
    description: "At-home hair treatment that reduces breakage and visibly strengthens hair.",
    features: ["Repairs broken bonds", "Reduces breakage", "Colour-safe"],
    inStock: true, stock: 143, isTopSeller: true, isFlashSale: true, flashPrice: 29999
  },
  {
    name: "Kerasilk Keratin Treatment", price: 49999, originalPrice: 62999,
    category: "beauty", brand: "Kerasilk", rating: 4.7, reviews: 876,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=600&fit=crop"],
    description: "Professional at-home keratin smoothing treatment. Eliminates frizz for up to 3 months.",
    inStock: true, stock: 55, isNewArrival: true
  },
  // ─── LIFESTYLE — Tech Accessories ─────────────────────────────────────
  {
    name: "Leather Passport Holder & Wallet", price: 24999, originalPrice: 32999,
    category: "lifestyle", brand: "Coach", rating: 4.6, reviews: 432,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=600&fit=crop"],
    description: "Full-grain leather passport holder with 6 card slots and RFID-blocking layer.",
    colors: [{ name: "Brown", hex: "#8B4513" }, { name: "Black", hex: "#111111" }],
    inStock: true, stock: 87, isFlashSale: true, flashPrice: 19999, isTopSeller: true
  },
  {
    name: "Wireless Charging Pad", price: 22999, originalPrice: 29999,
    category: "lifestyle", brand: "Belkin", rating: 4.5, reviews: 1243,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=600&fit=crop"],
    description: "15W fast wireless charging pad compatible with iPhone, Samsung, and all Qi-enabled devices.",
    inStock: true, stock: 112, isTopSeller: true, isFlashSale: true, flashPrice: 18999
  },
  {
    name: "Noise-Cancelling Wireless Earbuds", price: 149999, originalPrice: 184999,
    category: "lifestyle", brand: "Sony", rating: 4.8, reviews: 3421,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&h=600&fit=crop"],
    description: "Industry-leading noise cancellation. 8 hours battery + 24 hours with case.",
    features: ["Active noise cancellation", "LDAC for Hi-Res Audio", "IPX4 water resistance"],
    colors: [{ name: "Black", hex: "#111111" }, { name: "White", hex: "#FFFFFF" }],
    inStock: true, stock: 67, isTopSeller: true, isFlashSale: true, flashPrice: 129999
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const existing = await Product.countDocuments();
    if (existing > 0) {
      console.log(`⚠️  Products collection already has ${existing} documents. Skipping seed.`);
      console.log('   To reseed, run: node seed.js --force');
      if (!process.argv.includes('--force')) {
        process.exit(0);
      }
      await Product.deleteMany({});
      console.log('🗑️  Cleared existing products');
    }

    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products into MongoDB`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();