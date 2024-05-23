import mongoose from "mongoose";

const Schema = mongoose.Schema;
const MessageSchema = new Schema({
    owner: { type: Schema.Types.ObjectId},
    receiver: {type: Schema.Types.ObjectId},
    content: { type: String },
    created: { type: Date, default: new Date() },
});

let Message = mongoose.model('Message', MessageSchema);
module.exports = Message;