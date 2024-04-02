const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const OrderSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  address: { type: String},
  totalPrice: { type: Number, default: 0},
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product'},
    quantity: { type: Number, default: 1 }
  }],
  paymentType: { type: Number},
  created: {type: Date, default: Date.now()},
  status: {type: String, default: 'created'},
  statusHistory: { type: [
    {
      status: { type: String},
      when: { type: Date}
    }
  ], default: [{
    status:'created',
    when: Date.now()
  }]},
  transitHistory: {
    type: [{
      status: String,
      when: { type: Date, default: Date.now()}
    }]
  }
});



module.exports = mongoose.model('Order', OrderSchema);