const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  name: String,
  age: Number,
});

const PetModel = mongoose.model("pets", petSchema);

module.exports = PetModel;
