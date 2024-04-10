const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Creating a Review Schema 
const ReviewSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  title: String,
  description: String,
  rating: { type: Number, default: 0},
  created: { type: Date, default: Date.now },
  reply: {type: String, default: ''}
});


//Exporting the Review schema to reuse
module.exports = mongoose.model('Review', ReviewSchema);