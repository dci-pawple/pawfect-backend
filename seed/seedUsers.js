const mongoose = require("mongoose");
const faker = require("faker");

const UserModel = require("../models/userSchema");

mongoose.connect(
  "mongodb+srv://admin:admin@pawfect-cluster.gk5xr.mongodb.net/pawfect?retryWrites=true&w=majority",
  () => console.log("connected to pawfect DB")
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
          email: faker.internet.email(),
          password: "123456",
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
