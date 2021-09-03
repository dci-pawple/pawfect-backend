const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017", {
  dbName: "pawfect",
});

mongoose.connection.on("open", () => console.log("connected to mongoDB"));

mongoose.connection.on("error", (err) => console.log(err.message));

mongoose.connection.on("disconnected", () =>
  console.log("database disconnected")
);
