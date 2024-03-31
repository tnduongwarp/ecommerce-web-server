import mongoose from "mongoose";

const Schema = mongoose.Schema;
const UserMessageSchema = new Schema({
    owner: { type: Schema.Types.ObjectId},
    receivers: {type: Array, default: []},
});

let UserMessage = mongoose.model('UserMessage', UserMessageSchema);
module.exports = UserMessage;