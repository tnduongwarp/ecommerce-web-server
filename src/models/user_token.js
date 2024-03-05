const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Creating a Review Schema 
const UserTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  token : String,
  created: { type: Date, default: Date.now }
});


//Exporting the Review schema to reuse
module.exports = mongoose.model('UserToken', UserTokenSchema);