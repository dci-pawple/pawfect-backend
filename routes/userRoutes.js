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
  console.log(req.body);
  const { firstName, lastName, email , password} = req.body;
  console.log(firstName, lastName, email , password);
  try{
     const user = await UserModel.findOne({ email });
     console.log("User=>",user);
    if(!user){
      
      res.json({ success: "you are registered" });
       new UserModel({
          email,
          firstName,
          lastName,
          password,
        }).save((err) => {
          if (err) console.log(err);
        })
        console.log("you are registered");


    }else{
      console.log(email + " already registered!");
      res.json({ error: email + " already registered!" });
    }
  } catch(e){
      console.log("Error in Rout Add User =>",e);
  }
})


module.exports = Route;
