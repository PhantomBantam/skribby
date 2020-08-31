const mongoose = require('mongoose');

let GameSchema = mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique:true
  }, 
  password: {
    type: String,
    default: ''
  }
});


module.exports = mongoose.model('Game', GameSchema);