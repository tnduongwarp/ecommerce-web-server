import mongoose from "mongoose";
const mongoDB = 'mongodb://duong:duong@localhost:27017/ecommerce?authMechanism=DEFAULT&authSource=ecommerce'
let connect = async () => {
    try {
        mongoose.connect(mongoDB);
        console.log('Connection has been established successfully.');
      } catch (error) {
        console.error('Unable to connect to the database:', error);
      }
}
module.exports = connect;