const express = require('express')
const { cloudinary } = require('../utils/Cloudinary')

const PetModel = require('../models/petSchema')

const Route = express.Router()

const multer = require('multer')

Route.get('/', async (req, res, next) => {
  console.log('pets')
  try {
    const pets = await PetModel.find({})
    res.json({ succes: true, data: pets })
  } catch (err) {
    next(err)
  }
})


Route.get("/:id", async (req, res, next) => {
  try {
    // const pet = await PetModel.findOne({ id: req.params.id });
    const pet = await PetModel.findById(req.params.id).select(
      "-_id -password -__v"
    );
    if (pet) {
      res.json({ success: true, data: pet });
    } else {
      res.json({ success: false, error: "no such pet found" });
    
    }
  } catch (err) {
     console.log('Error in pet /:id =>', err)
    next(err);
  }
});


/**
 * Route for new Ad
 */

let storage = multer.diskStorage({
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

Route.post('/newpet', upload.any('photos'), async (req, res, next) => {
  try {
    //contains the file
    console.log('req.files', req.files)
    //contains the text fields
    console.log('req.body', JSON.parse(JSON.stringify(req.body)))

    //delete collection pets
    //await PetModel.deleteMany({});

    const photoFiles = req.files
    if (photoFiles.length === 0) {
      console.log('No photo attached!')
      return res
        .status(400)
        .json({ success: false, message: 'No photo attached!' })
    }
    let multiplePhotoPromise = photoFiles.map(photo =>
      cloudinary.uploader.upload(photo.path, { upload_preset: 'pawfect' })
    )

    let photoResponses = await Promise.all(multiplePhotoPromise)

    const photoUrls = photoResponses.map(item => {
      return { url: item.url, publicId: item.public_id }
    })
    console.log('photoUrls', photoUrls)

    let pet = new PetModel({
      name: req.body.name,
      age: req.body.age,
      typeOfPet: req.body.typeOfPet,
      gender: req.body.gender,
      // breed: req.body.name,
      likes: req.body.likes,
      dislikes: req.body.dislikes,
      habits: req.body.habits,
      size: req.body.size,
      extras: req.body.extras,
      photos: photoUrls
    })

    pet.save().then(result => {
      console.log('Saved in the Database')
      return res
        .status(400)
        .json({ success: true, message: 'Saved in the Database' })
    })
  } catch (err) {
    console.log('Error in file upload Route =>', err)
    res.status(500).json({success: false,
      message: err.message
    })
  }
})

module.exports = Route
