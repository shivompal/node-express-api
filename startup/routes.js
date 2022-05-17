const express = require("express");

const genres = require("../routes/genres");
const customers = require("../routes/customers");
const movies = require("../routes/movies");
const rentals = require("../routes/rentals");
const users = require("../routes/users");
const returns = require("../routes/returns");
const auth = require("../routes/auth");

const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Access-Control-Allow-Headers, X-Requested-With, x-auth-token"
    );

    next();
  });
  app.use("/api/genres", genres);
  app.use("/api/customers", customers);
  app.use("/api/movies", movies);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/returns", returns);
  app.use("/api/auth", auth);

  app.use(error);
};
