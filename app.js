const express = require("express");
require("./connectMongo");

// const Route = require("./routes/userRoutes");

const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");
const cors = require( "cors" );

const app = express();
const PORT = process.env.PORT || 4000;

app.use( cors( { origin: "*" } ) )

//app.use( express.urlencoded( { extended: true } ) );
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

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ success: false, message: err.message });
});

app.listen(PORT, () => console.log("Server running on port: ", PORT));
