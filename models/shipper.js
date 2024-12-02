const mongoose = require('mongoose');

const ShipperSchema = new mongoose.Schema({
  companyname: String,
  phone: Number,
  image: String 
});

ShipperSchema.methods.setImgUrl = function setimgurl(image){
  this.image = "http://localhost:3000" + image;
}

module.exports = mongoose.model('Shipper', ShipperSchema);
