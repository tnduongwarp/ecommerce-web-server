const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CartSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product'},
    quantity: { type: Number, default: 1 }
  }],
  created: {type: Date, default: new Date()},
});

module.exports = mongoose.model('Cart', CartSchema);