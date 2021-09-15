const mongoose = require('mongoose')

const petSchema = new mongoose.Schema({
  name: String,
  age: String,
  typeOfPet: String,
  gender: String,
  // breed: String,
  likes: String,
  dislikes: String,
  habits: String,
  size: String,
  extras: String,
  photos: [],
  userId: String
})

const PetModel = mongoose.model('pets', petSchema)

module.exports = PetModel
