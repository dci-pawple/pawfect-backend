const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  city: String,
  postalCode: String,
  street: String,
  email: String,
  password: String,
  profilePhoto: [],
  savedFavorites: [String],
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
