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
Route.post("/", async (req, res, next) => {});

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

module.exports = Route;
