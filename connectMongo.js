const mongoose = require("mongoose");

// Atlas: mongodb+srv://<username>:<password>@pawfect-cluster.gk5xr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
//Mongodb on your own computer mongodb://127.0.0.1:27017

mongoose.connect("mongodb+srv://admin:admin@pawfect-cluster.gk5xr.mongodb.net/users?retryWrites=true&w=majority", {
  dbName: "pawfect", useNewUrlParser: true, useUnifiedTopology: true
});

mongoose.connection.on("open", () => console.log("connected to mongoDB"));

mongoose.connection.on("error", (err) => console.log(err.message));

mongoose.connection.on("disconnected", () =>
  console.log("database disconnected")
);
