const express = require("express");
require("./connectMongo");

// const Route = require("./routes/userRoutes");

const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// TODO: make the callback async for mongo
// app.use(
//   "/",
//   Route.get("/", (req, res, next) => {
//     res.send("hello sexy paw");
//   })
// );

app.use("/users", userRoutes);
app.use("/pets", petRoutes);

app.listen(PORT, () => console.log("Server running on port: ", PORT));
