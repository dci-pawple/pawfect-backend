const mongoose = require("mongoose");
const faker = require("faker");

const UserModel = require("../models/userSchema");

mongoose.connect("mongodb://127.0.0.1:27017/pawfect", () =>
  console.log("connected to pawfect DB")
);

const seedData = async () => {
  try {
    await UserModel.deleteMany({});

    const users = Array(10)
      .fill(null)
      .map(() => {
        const user = new UserModel({
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
        });

        return user.save();
      });

    await Promise.all(users);
  } catch (err) {
    console.log(err.message);
  }

  mongoose.connection.close();
};

seedData();
