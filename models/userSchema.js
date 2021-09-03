const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
