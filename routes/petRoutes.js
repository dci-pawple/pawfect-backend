const express = require("express");

const PetModel = require("../models/petSchema");

const Route = express.Router();

Route.get("/", async (req, res, next) => {
  console.log("pets");
  try {
    const pets = await PetModel.find({});
    res.json({ succes: true, data: pets });
  } catch (err) {
    next(err);
  }
});

module.exports = Route;
