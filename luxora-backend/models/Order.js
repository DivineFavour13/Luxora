const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true },
  image:     { type: String },
});

const orderSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:           [orderItemSchema],
  subtotal:        { type: Number, default: 0 },
  shipping:        { type: Number, default: 0 },
  discount:        { type: Number, default: 0 },
  total:           { type: Number, required: true },
  status:          { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shippingAddress: { type: String },
  paymentMethod:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
