const express = require("express");
const { cloudinary } = require("../utils/Cloudinary");

const PetModel = require("../models/petSchema");
const UserModel = require("../models/userSchema");

const createError = require("http-errors");

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

//! http://localhost:4000/pets/filter?favorites=true&userId=6140a1fff6f5582afa47550b

Route.get("/filter", async (req, res, next) => {
  console.log("req.query", req.query);
  try {
    // parse all
    const type = req.query.type ? req.query.type : "";
    const age = req.query.age ? JSON.parse(req.query.age) : "";
    const favorites = req.query.favorites
      ? JSON.parse(req.query.favorites)
      : "";

    const userId = req.query.userId ? req.query.userId : "";

    let user = null;

    //log all
    console.log({ type });
    console.log({ age });
    console.log({ userId });
    console.log({ favorites });

    //   const age = JSON.parse(req.query.age) ? JSON.parse(req.query.age):"";
    //   const favorites = JSON.parse(req.query.favorites) ? JSON.parse(req.query.favorites):"";
    //   const userId = JSON.parse(req.query.userId) && JSON.parse(req.query.userId)!=="" ? JSON.parse(req.query.userId):"";
    //
    //   console.log('type', type)
    //   console.log({ age })
    //   //  console.log({ user })
    //   console.log({ userId })
    //   console.log({ favorites })

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
      console.log("logged in user");
      console.log({ userId });
      [user] = await UserModel.find({ _id: userId }).select(
        "-_id -password -__v"
      );
      console.log("user in filter route", user);
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
    //
    console.log("current Filter", currentFilter);

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
    console.log("Error in pet /:id =>", err);
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
    //contains the file
    console.log("req.files", req.files);
    //contains the text fields
    console.log("req.body", JSON.parse(JSON.stringify(req.body)));

    //delete collection pets
    //await PetModel.deleteMany({});

    const photoFiles = req.files;
    if (photoFiles.length === 0) {
      console.log("No photo attached!");
      return res
        .status(400)
        .json({ success: false, message: "No photo attached!" });
    }
    let multiplePhotoPromise = photoFiles.map((photo) =>
      cloudinary.uploader.upload(photo.path, { upload_preset: "pawfect" })
    );

    let photoResponses = await Promise.all(multiplePhotoPromise);

    const photoUrls = photoResponses.map((item) => {
      return { url: item.url, publicId: item.public_id };
    });
    console.log("photoUrls", photoUrls);

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
      photos: photoUrls,
      userId: req.body.userId,
    });

    pet.save().then((result) => {
      console.log("Saved in the Database");
      return res.json({ success: true, message: "Saved in the Database" });
    });
  } catch (err) {
    console.log("Error in file upload Route =>", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = Route;
