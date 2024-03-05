import mongoose from "mongoose";
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: { type: String, unique: true, lowercase: true },
    firstname: String,
    lastname: String,
    password: String,
    picture: String,
    isSeller: { type: Boolean, default: false },
    address: {
      addr1: String,
      addr2: String
    },
    role: String,
    created: { type: Date, default: Date.now },
});
UserSchema.methods.gravatar = function(size) {
    if (!this.size) size = 200;
    if (!this.email) {
      return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
    } else {
      var md5 = crypto.createHash('md5').update(this.email).digest('hex');
      return 'https://gravatar.com/avatar/' + md5 + '?s' + size + '&d=retro'; 
    }
  
  }
module.exports = mongoose.model('User', UserSchema);
