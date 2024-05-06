const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BidSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product'},
    image: { type: String}
  }],
  price: {type: Number},
  created: {type: Date, default: Date.now()},
  status: {type: String, default: 'created'},
  isActive: {type: Boolean, default: false}
});

module.exports = mongoose.model('Bid', BidSchema);