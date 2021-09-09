const express = require("express");
const {cloudinary} = require("../utils/Cloudinary")


const PetModel = require("../models/petSchema");

const Route = express.Router();

const multer = require("multer");

Route.get("/", async (req, res, next) => {
  console.log("pets");
  try {
    const pets = await PetModel.find({});
    res.json({ succes: true, data: pets });
  } catch (err) {
    next(err);
  }
});

/**
 * Route for new Ad
 */

let storage = multer.diskStorage({
  destination: "public/images/",
  filename: function (req, file, cb) {
    let picName =
      file.originalname.split(".")[0] +
      "-" +
      Date.now() +
      "." +
      file.mimetype.split("/")[1];
    cb(null, picName);
    req.picName = picName;
  },
});

let upload = multer({ storage: storage });

Route.post('/newpet', upload.any('photos'), async (req, res, next)=> {
  try {
    //contains the file
    console.log("req.files", req.files);
    //contains the text fields
    console.log('req.body',JSON.parse(JSON.stringify(req.body)))

    //delete collection pets
    //await PetModel.deleteMany({});

    const photoFiles =req.files;
    if (photoFiles.length===0){
      console.log("No photo attached!");
      return res.status(400).json({ success: false,message: "No photo attached!" });      
}
    let multiplePhotoPromise = photoFiles.map((photo) =>
      cloudinary.uploader.upload(photo.path,{upload_preset:"pawfect"}));

      let photoResponses = await Promise.all(multiplePhotoPromise);

    console.log("imageResponses",photoResponses);

    const photoUrls = photoResponses.map((item)=>{
      return item.url
    })
    console.log("photoUrls",photoUrls);

    let pet = new PetModel({
      name: req.body.name,
      age: req.body.age,
      typeOfPet:req.body.typeOfPet,
      gender: req.body.gender,
      // breed: req.body.name,
      likes: req.body.likes,
      dislikes: req.body.dislikes,
      habits: req.body.habits,
      size: req.body.size,
      extras: req.body.extras,
      photos: photoUrls,
    })
    console.log("pet",pet);

    pet.save().then(result => {
      console.log("Saved in the Database");
      return res.status(400).json({ success: true,message: "Saved in the Database" });  
    })

  } catch (err) {
    console.log("Error in file upload Route =>", err);
    res.status(500).json({
      message: err.message,})
  }
});

module.exports = Route;
