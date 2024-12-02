const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, maxLength: 30 },
  description: String,
  image: String 
});

CategorySchema.methods.setImgUrl = function setimgurl(image){
  this.image = "http://localhost:3000" + image;
}


module.exports = mongoose.model('Category', CategorySchema);
