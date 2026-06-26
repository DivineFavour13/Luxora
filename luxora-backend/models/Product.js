const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  brand:        { type: String, required: true },
  category:     { type: String, required: true },
  price:        { type: Number, required: true },
  originalPrice:{ type: Number },
  description:  { type: String },
  image:        { type: String },
  images:       [String],
  stock:        { type: Number, default: 10 },
  inStock:      { type: Boolean, default: true },
  rating:       { type: Number, default: 0 },
  reviews:      { type: Number, default: 0 },
  isTopSeller:  { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isFlashSale:  { type: Boolean, default: false },
  flashPrice:   { type: Number },
  sizes:        [String],
  colors:       [{ name: String, hex: String }],
  features:     [String],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);