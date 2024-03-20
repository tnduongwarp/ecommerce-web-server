const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const Schema = mongoose.Schema;


//Creating a Order Schema 
const OrderSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  totalPrice: { type: Number, default: 0},
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product'},
    quantity: { type: Number, default: 1 }
  }],
  created: {type: Date, default: Date.now()},
  status: {type: String, default: 'created'}
});


//Using deep-populate to facilitate rating feature
OrderSchema.plugin(deepPopulate);

//Exporting the Order schema to reuse 
module.exports = mongoose.model('Order', OrderSchema);