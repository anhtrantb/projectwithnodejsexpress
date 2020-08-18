const mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: String,
  account: String,
  password:String
});
var User = mongoose.model('User', userSchema, 'users');
module.exports = User;