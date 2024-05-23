const { number } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Creating a new Product Schema
const ProductSchema = new Schema({
  
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  owner:  { type: Schema.Types.ObjectId, ref: 'User'},
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review'}],
  image: String,
  title: String,
  description: String,
  price: Number,
  created: { type: Date, default: new Date() },
  sold: {type: Number, default: 0},
  amount: Number,
  delete: {type: Boolean, default: false},
  status: { type: String, default: 'created'}
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
let Model =  mongoose.model('Product', ProductSchema);
module.exports = Model