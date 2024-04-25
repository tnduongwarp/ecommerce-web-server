import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: { type: String, unique: true, lowercase: true },
    firstname: {type: String, default:''},
    lastname: {type: String, default:''},
    password: {type: String},
    picture: {type: String, default: '/assets/img/default-avatar.jpg'},
    isSeller: { type: Boolean, default: false },
    address: {
      type: Array, default: []
    },
    role: String,
    metadata : { type: Object},
    created: { type: Date, default: Date.now },
    isDelete: {type: Boolean, default: false}
});

let User = mongoose.model('User', UserSchema);
module.exports = User;