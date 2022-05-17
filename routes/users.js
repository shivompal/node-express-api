const auth = require("../middleware/auth");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered...");

  /*user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });*/

  user = new User(_.pick(req.body, ["name", "email", "password"])); // Using Lodash library

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  //res.send(user);
  //const token = jwt.sign({ _id: user._id }, config.get("jwtPrivateKey"));
  const token = user.generateAuthToken();
  //res.send(_.pick(user, ["_id", "name", "email"])); // Using Lodash library
  res
    .header("x-auth-token", token) // Setting header
    .header("access-control-expose-headers", "x-auth-token") // lets the web server whitelist the headers that the browsers or clients are allowed to access.
    .send(_.pick(user, ["_id", "name", "email"])); // Using Lodash library
});

module.exports = router;
