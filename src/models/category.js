//Category.JS to create Category Schema in the application 

const mongoose = require('mongoose');          //Placing mongoose package in a variable mongoose
const Schema = mongoose.Schema;                // Assigning mongoose schema to variable 



//creating CategorySchema
const CategorySchema = new Schema({
  name: { type: String, unique: true, lowercase: true },
  created: { type: Date, default: new Date() }
});


//Exporting the category schema to reuse  
module.exports = mongoose.model('Category', CategorySchema);
