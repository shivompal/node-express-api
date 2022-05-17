//const Joi = require("joi");
//const objectId = require("joi-objectid")(Joi);
require("express-async-errors");
const winston = require("winston");
require("winston-mongodb");
const error = require("./middleware/error");
const config = require("config");
const mongoose = require("mongoose");
const genres = require("./routes/genres");
const customers = require("./routes/customers");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const users = require("./routes/users");
const auth = require("./routes/auth");
const express = require("express");
const app = express();
require("./startup/routes.js")(app);
require("./startup/db.js")();

process.on("uncaughtException", ex => {
  console.log("We got an uncaught exception...");
  winston.error(ex.message, ex);
  process.exit(1); // Anything except zero is failure
});

process.on("unhandledRejection", ex => {
  console.log("We got an unhandled rejection...");
  winston.error(ex.message, ex);
  process.exit(1); // Anything except zero is failure
});

winston.add(new winston.transports.File({ filename: "logfile.log" }));
winston.add(
  new winston.transports.MongoDB({
    db: "mongodb://localhost:27017/vidly",
    level: "info"
  })
);

//throw new Error("Something failed during startup...");
const p = Promise.reject(new Error("Something failed miserably!"));
p.then(() => console.log("Done"));

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

mongoose
  .connect("mongodb://localhost:27017/vidly")
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB..."));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
