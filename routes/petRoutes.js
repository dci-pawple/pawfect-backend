const express = require("express");
const { cloudinary } = require("../utils/Cloudinary");

const PetModel = require("../models/petSchema");
const UserModel = require("../models/userSchema");

const createError = require("http-errors");

const Route = express.Router();

const multer = require("multer");

Route.get("/", async (req, res, next) => {

  try {
    const pets = await PetModel.find({});
    res.json({ succes: true, data: pets });
  } catch (err) {
    next(err);
  }
});

//! http://localhost:4000/pets/filter?favorites=true&userId=6140a1fff6f5582afa47550b

Route.get("/filter", async (req, res, next) => {

  try {
    // parse all
    const type = req.query.type ? req.query.type : "";
    const age = req.query.age ? JSON.parse(req.query.age) : "";
    const favorites = req.query.favorites
      ? JSON.parse(req.query.favorites)
      : "";

    const userId = req.query.userId ? req.query.userId : "";

    let user = null;


    //   const age = JSON.parse(req.query.age) ? JSON.parse(req.query.age):"";
    //   const favorites = JSON.parse(req.query.favorites) ? JSON.parse(req.query.favorites):"";
    //   const userId = JSON.parse(req.query.userId) && JSON.parse(req.query.userId)!=="" ? JSON.parse(req.query.userId):"";


    let currentFilter = [];
    // if type is not empty and type is not "all" than insert as an filterelement esle empty filter
    type !== "" && type !== "all"
      ? currentFilter.push({ typeOfPet: type })
      : currentFilter.push({});
    // if age is not empty and type is not "all" than insert as an filterelement
    age !== "" && age.length !== 0
      ? currentFilter.push({ age: age })
      : currentFilter.push({});

    // if logged in
    if (userId || (userId && favorites)) {
      [user] = await UserModel.find({ _id: userId }).select(
        "-_id -password -__v"
      );
      if (!user) {
        next(new createError.NotFound("no user with such id found"));
      }

      // get users saved Favorites
      const savedFavorites = user.savedFavorites;

      // put the favorite pet id´s to the current filter
      favorites && currentFilter.push({ _id: savedFavorites });
    }

    currentFilter = {
      $and: currentFilter,
    };

    let filteredData = [];
    filteredData = await PetModel.find(currentFilter);

    // if logged in
    if (user) {
      filteredData.map((pet) => {
        const petId = pet._id.toString();
        if (user.savedFavorites.includes(petId)) {
          pet.usersFavorite = true;
        } else {
          pet.usersFavorite = false;
        }
      });
    }

    if (filteredData) {
      res.json({ success: true, data: filteredData });
    } else {
      res.json({ success: false, message: "no filtered data" });
    }
  } catch (err) {
    next(err);
  }
});

Route.post( "/userads", async ( req, res, next ) => {
  const userId=req.body.userId;


  try {
    const userads = await PetModel.find( {userId: userId} ).select(
      ' -__v'
    )
    if ( userads ) {
      res.json( { success: true, data: userads } )
    } else {
      res.status( 500 ).json( { success: false, error: 'no ads found' } )
    }
  } catch ( err ) {
    next( err )
  }
});


Route.post( "/delete", async ( req, res, next ) => {
  const petId=req.body.petId;
  const userId=req.body.userId;


  try {

    //delete photos on cloudinary
    const pet = await PetModel.findById(petId).select("-__v");
    const deleteAllPhotos=pet.photos.map((photo)=>{
      return photo.publicId;
    })
   

    const result1 =await cloudinary.api.delete_resources(deleteAllPhotos,
  function(error, result) {
    if (error) throw error;
    
  });


    //delete pet from database
    const result = await PetModel.deleteOne({_id: petId});


    //return updated ads
   const userads = await PetModel.find( {userId: userId} ).select(
      ' -__v'
    )


    if ( userads ) {
      res.json( { success: true, data: userads } )
    } else {
      res.status( 500 ).json( { success: false, error: 'no ads found' } )
    }
   
  } catch ( err ) {
    next( err )
  }
});





Route.get("/:id", async (req, res, next) => {
  try {
    // const pet = await PetModel.findOne({ id: req.params.id });
    const pet = await PetModel.findById(req.params.id).select("-__v");
    if (pet) {
      res.json({ success: true, data: pet });
    } else {
      res.json({ success: false, error: "no such pet found" });
    }
  } catch (err) {
    next(err);
  }
});


/**
 * Route for new Ad
 */

let storage = multer.diskStorage({
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

Route.post("/newpet", upload.any("photos"), async (req, res, next) => {
  try {


    //if ther is no photos updated => error in frontend
    if (photoFiles.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No photo attached!" });
    }

    //Send photos to cloudinary
    let multiplePhotoPromise = photoFiles.map( photo =>
      cloudinary.uploader.upload( photo.path, { upload_preset: 'pawfect' } )
    )
    let photoResponses = await Promise.all( multiplePhotoPromise )

    // put the URLs from cloudinary into an object
    const photoUrls = photoResponses.map( item => {
      return { url: item.url, publicId: item.public_id }
    } )


    // make a new dokument in the database
    let pet = new PetModel( {
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
      photos: photoUrls,
      userId: req.body.userId
    } )

    pet.save().then( result => {

      return res
        .json( { success: true, message: 'Saved in the Database',data:result } )
    } )
  } catch ( err ) {
    res.status( 500 ).json( { success: false, message: err.message } )
  }
});

Route.patch( '/updatepet/:id', upload.any( 'photos' ), async ( req, res, next ) => {
  try {

     const pet = await PetModel.findById(req.params.id).select("-__v");

    const deleteThisPhotos= JSON.parse( req.body.deletePhotos);

    //delete imges from pet.photos
    if(deleteThisPhotos.length!==0){
      pet.photos = pet.photos.filter((photo)=>{
        return !deleteThisPhotos.includes(photo.publicId)

      })

      cloudinary.api.delete_resources(deleteThisPhotos,
  function(error, result) {console.log("delete photo on cloudinary",result, error); });
      //! delete button

    }

   

    //! if(!req.body)


    const photoFiles = req.files

    // if ther is a path, than we know it is a new image uploaded
    if(photoFiles)
    {
    let multiplePhotoPromise = photoFiles.map( photo =>
      cloudinary.uploader.upload( photo.path, { upload_preset: 'pawfect' } )
    )

    let photoResponses = await Promise.all( multiplePhotoPromise )

    const newPhotoUrls = photoResponses.map( item => {
      return { url: item.url, publicId: item.public_id }
    } )

    const updatedPhotoUrls= pet.photos.concat(newPhotoUrls);

    let updatedPet =  {
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
      photos: updatedPhotoUrls,
      userId: req.body.userId,
      deletePhotos: req.body.deletePhotos
    } ;

     const updatedPetData = await PetModel.findByIdAndUpdate(req.params.id, updatedPet, {
      new: true,
    }).select("-__v");

    return res.json( { success: true, message: 'Updated into Database',data:updatedPetData } )

    }else{
      res.status( 500 ).json( { success: false, message: "problem updating photos" } )
  }

  } catch ( err ) {
    res.status( 500 ).json( { success: false, message: err.message } )
  }
} )


Route.get( '/:id', async ( req, res, next ) => {
  try {
    // const pet = await PetModel.findOne({ id: req.params.id });
    const pet = await PetModel.findById( req.params.id ).select(
      ' -__v'
    )
    if ( pet ) {
      res.json( { success: true, data: pet } )
    } else {
      res.json( { success: false, error: 'no such pet found' } )
    }
  } catch ( err ) {
    next( err )
  }
} )

module.exports = Route;
