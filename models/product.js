const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  supplierName: { type: String, ref: 'Supplier' }, 
  categoryName: { type: String, ref: 'Category' }, 
  price: Number,
  description: String,
  unitsInStock: Number,
  discontinued: Boolean,
  image: String
});

ProductSchema.methods.setImgUrl = function setImgUrl(image) {
  this.image = "http://localhost:3000" + image;
};

module.exports = mongoose.model('Product', ProductSchema);
