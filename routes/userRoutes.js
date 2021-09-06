const express = require("express");

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


// add a new User 
Route.post("/", async (req, res, next) => {
})


module.exports = Route;
