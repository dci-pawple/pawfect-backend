const mongoose = require("mongoose");
const faker = require("faker");

const PetModel = require("../models/petSchema");

mongoose.connect("mongodb+srv://admin:admin@pawfect-cluster.gk5xr.mongodb.net/pawfect?retryWrites=true&w=majority", () =>
  console.log("connected to pawfect DB")
);

const seedData = async () => {
  try {
    await PetModel.deleteMany({});

    const pets = Array(10)
      .fill(null)
      .map(() => {
        const pet = new PetModel({
          name: faker.name.firstName(),
          age: Math.round(Math.random() * 15),
        });

        return pet.save();
      });

    await Promise.all(pets);
  } catch (err) {
    console.log(err.message);
  }

  mongoose.connection.close();
};

seedData();
