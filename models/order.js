const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderDate: Date,
  requireDate: Date,
  shippedDate: Date,
  shipVia: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipper' },
  freight: Number,
  userCity: String,
  userPostalCode: String,
  userColony: String,
  userAddress: String,
  products: [{ productId: String, quantity: Number, price: Number }],
});

module.exports = mongoose.model('Order', OrderSchema);
