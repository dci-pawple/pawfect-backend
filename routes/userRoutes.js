const express = require("express");
const createError = require("http-errors");

const UserModel = require("../models/userSchema");

const Route = express.Router();

Route.get("/", async (req, res, next) => {
  console.log("users");
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
    const user = await UserModel.findById(req.params.id).select(
      "-_id -password -__v"
    );
    if (user) {
      res.json({ success: true, data: user });
    } else {
      console.log("no such user found");
    }
  } catch (err) {
    next(err);
  }
});

// add a new User
Route.post("/", async (req, res, next) => {
  console.log(req.body);
  const { firstName, lastName, email, password } = req.body;
  console.log(firstName, lastName, email, password);
  try {
    const user = await UserModel.findOne({ email });
    console.log("User=>", user);
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
      console.log("you are registered");
    } else {
      console.log(email + " already registered!");
      next(new createError.Conflict(email + " already registered!"));
    }
  } catch (err) {
    console.log("Error in Rout Add User =>", err);
    next("Error in Rout Add User =>", err);
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
  console.log("in save favorites");
  try {

    //$set

    const userId = req.body.user_id;
    const petId=req.body.pet_id;
    console.log("userId",userId);
    console.log("petId",petId);

    const user = await UserModel.findOne({ _id: userId });
    console.log("user",user);

    if (!userId) {
      next(new createError.NotFound("no user with such id found"));
    } else {

        if(user.savedFavorites.includes(petId))
        {
          //delete petId from favorites
          console.log("old user.savedFavorites",user.savedFavorites);
          console.log("old user",user);
          user.savedFavorites=user.savedFavorites.filter( favorite => favorite!==petId)
           console.log("new user.savedFavorites",user.savedFavorites);
           console.log("new user",user);
          user.save();
          return res.json({ success: true, message: "unsaved successfully",savedFavorites: user.savedFavorites });
        }
        
        else{
          //create new petId in favorites
        console.log("user.savedFavorites=>",user.savedFavorites);
        user.savedFavorites.push(petId);
        user.save();
        console.log("user=>",user);
        
         return res.json({ success: true, message: "Saved successfully",savedFavorites: user.savedFavorites });
         }

        
    }
  } catch (err) {
    next(err);
  }

});



Route.patch("/:id", async (req, res, next) => {
  try {
    // const user = await UserModel.findOne({ id: req.params.id });
    const user = await UserModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-_id -password -__v");
    console.log(user);
    if (user) {
      res.json({ success: true, data: user });
    } else {
      console.log("no such user found");
    }
  } catch (err) {
    next(err);
  }
});

module.exports = Route;
