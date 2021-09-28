const express = require("express");
const createError = require("http-errors");
const { cloudinary } = require("../utils/Cloudinary");

const UserModel = require("../models/userSchema");

const Route = express.Router();

const multer = require("multer");

Route.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find({});
    res.json({ succes: true, data: users });
  } catch (err) {
    next(err);
  }
});

Route.get("/:id", async (req, res, next) => {
  try {
    // const user = await UserModel.findOne({ id: req.params.id });
    const user = await UserModel.findById(req.params.id).select("-__v");
    if (user) {
      res.json({ success: true, data: user });
    } 
  } catch (err) {
    next(err);
  }
});

// add a new User
Route.post("/", async (req, res, next) => {

  const { firstName, lastName, email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      new UserModel({
        email,
        firstName,
        lastName,
        password,
      }).save((err) => {
        if (err) console.log(err);
      });
      res.json({ success: true, info: "you are registered" });

    } else {

      next(new createError.Conflict(email + " already registered!"));
    }
  } catch (err) {

    next("Error in Route Add User =>", err);
  }
});




Route.post("/login", async (req, res, next) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      next(new createError.NotFound("no user with such email found"));
    } else {
      const check = req.body.password === user.password;
      if (!check) {
        next(new createError.NotFound("incorrect password"));
      } else {
        res.json({ success: true, data: user });
      }
    }
  } catch (err) {
    next(err);
  }
});

// save favorites
Route.patch("/save", async (req, res, next) => {

  try {
    //$set

    const userId = req.body.user_id;
    const petId = req.body.pet_id;

    const user = await UserModel.findOne({ _id: userId });


    if (!userId) {
      next(new createError.NotFound("no user with such id found"));
    } else {
      if (user.savedFavorites.includes(petId)) {
        //delete petId from favorites

        user.savedFavorites = user.savedFavorites.filter(
          (favorite) => favorite !== petId
        );

        user.save();
        return res.json({
          success: true,
          message: "unsaved successfully",
          savedFavorites: user.savedFavorites,
        });
      } else {
        //create new petId in favorites

        user.savedFavorites.push(petId);
        user.save();


        return res.json({
          success: true,
          message: "Saved successfully",
          savedFavorites: user.savedFavorites,
        });
      }
    }
  } catch (err) {
    next(err);
  }
});

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

Route.patch("/:id", upload.any("photos"), async (req, res, next) => {
  try {

    const photoFiles = req.files;

    // if (photoFiles.length === 0) {
    //   console.log("No photo attached!");
    //   return res
    //     .status(400)
    //     .json({ success: false, message: "No photo attached!" });
    // }
    let multiplePhotoPromise = photoFiles.map((photo) =>
      cloudinary.uploader.upload(photo.path, { upload_preset: "pawfect" })
    );

    let photoResponses = await Promise.all(multiplePhotoPromise);

    const photoUrls = photoResponses.map((item) => {
      return { url: item.url, publicId: item.public_id };
    });
    // HERE WE STILL NEED TO CHANGE SOMETHING
    // IN REQ.BODY WE GET OBJECT OBJECT (SUPPOSED TO GET ARRAY HERE) SO NOW IN USER IT IS EMPTY
    const body = photoUrls.length
      ? { ...req.body, profilePhoto: photoUrls }
      : req.body;
    let user = await UserModel.findByIdAndUpdate(
      req.params.id,
      body,
      //  { firstName: req.body.firstName,
      // lastName: req.body.lastName,
      // phoneNumber: req.body.phoneNumber,
      // city: req.body.city,
      // postalCode: req.body.postalCode,
      // street: req.body.street,
      // email: req.body.email,
      // password: req.body.password,
      // profilePhoto: photoUrls,
      // savedFavorites: req.body.savedFavorites, }
      {
        new: true,
      }
    ).select("-_id -__v");

    // const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    // }).select("-_id -password -__v");

    if (user) {
      res.json({ success: true, data: user });
    } 
  } catch (err) {
    next(err);
  }
});

// Route.patch("/:id", async (req, res, next) => {
//   try {
//     // const user = await UserModel.findOne({ id: req.params.id });
//     const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     }).select("-_id -password -__v");
//     console.log(user);
//     if (user) {
//       res.json({ success: true, data: user });
//     } else {
//       console.log("no such user found");
//     }
//   } catch (err) {
//     next(err);
//   }
// });

module.exports = Route;
