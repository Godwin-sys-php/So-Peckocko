const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');// Le plugin pour avoir des champs unique

// Schema pour les utilisateurs

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);// On ajoute le mongoose-unique-validator au Schema

module.exports = mongoose.model('User', userSchema); 