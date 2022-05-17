const { Rental } = require("../models/rental");
const Joi = require("joi");
const { Movie } = require("../models/movie");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const express = require("express");
const router = express.Router();

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

  if (!rental) return res.status(404).send("Rental not found");

  if (rental.dateReturned)
    return res.status(400).send("Rental already processed");

  rental.return();
  await rental.save();

  await Movie.update(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 }
    }
  );

  //res.status(200).send(rental);
  res.send(rental);

  //res.status(401).send("Unauthorized");
});

function validateReturn(genre) {
  console.log(genre);
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(genre, schema);
}

module.exports = router;
