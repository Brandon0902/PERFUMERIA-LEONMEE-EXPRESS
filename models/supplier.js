const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  companyName: { type: String, maxLength: 20 },
  address: String,
  city: String,
  region: String,
  postalCode: String,
  country: String,
  phone: String,
});

module.exports = mongoose.model('Supplier', SupplierSchema);