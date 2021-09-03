const express = require("express");

// temp
const Route = express.Router();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// TODO: make the callback async for mongo
app.use(
  "/",
  Route.get("/", (req, res, next) => {
    res.send("hello sexy paw");
  })
);

app.listen(PORT, () => console.log("Server running on port: ", PORT));
