const express = require('express')

const PetModel = require('../models/petSchema')

const Route = express.Router()

var multer = require('multer')

Route.get('/', async (req, res, next) => {
  console.log('pets')
  try {
    const pets = await PetModel.find({})
    res.json({ succes: true, data: pets })
  } catch (err) {
    next(err)
  }
})

/**
 * Route for new Ad
 */

let storage = multer.diskStorage({
  destination: 'public/images/',
  filename: function (req, file, cb) {
    let picName =
      file.originalname.split('.')[0] +
      '-' +
      Date.now() +
      '.' +
      file.mimetype.split('/')[1]
    cb(null, picName)
    req.picName = picName
  }
})

let upload = multer({ storage: storage })

Route.post('/newpet', upload.any('photos'), async (req, res, next)=> {
  try {
    //contains the file
    console.log('req.files', req.files)
    //contains the text fields
    console.log('req.body',JSON.parse(JSON.stringify(req.body)))

    console.log();

    // let pet = new PetModel({
    //   name: req.body.name,
    //   age: req.body.age
    //   //images: req.files,
    // })
// 
//     pet.save().then(result => {
//       res.send(result)
//     })
    // res.send('respond with a resource');
  } catch (err) {
    console.log('Error in file upload Route =>', err)
  }
})

module.exports = Route
