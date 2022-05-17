const moment = require("moment");
const request = require("supertest");
const { Rental } = require("../../models/rental");
const { Movie } = require("../../models/movie");
const { User } = require("../../models/user");
const mongoose = require("mongoose");

describe("api/genres", () => {
  let server;
  let customerId;
  let movieId;
  let movie;
  let rental;
  let token;

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../index");
    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();
    token = new User().generateAuthToken();

    movie = new Movie({
      _id: movieId,
      title: "12345",
      dailyRentalRate: 2,
      genre: { name: "12345" },
      numberInStock: 10,
    });

    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "12345",
      },
      movie: {
        _id: movieId,
        title: "12345",
        dailyRentalRate: 2,
      },
    });
    await rental.save();
  });

  afterEach(async () => {
    await Rental.remove({});
    await Movie.remove({});
    await server.close();
  });

  it("should work", async () => {
    const response = await Rental.findById({ _id: rental._id });
    expect(response).not.toBeNull();
  });

  it("should return 401 if client is not logged in", async () => {
    token = "";
    const response = await exec();
    expect(response.status).toBe(401);
  });

  it("should return 400 if customerId is not provided ", async () => {
    customerId = "";
    const response = await exec();
    expect(response.status).toBe(400);
  });

  it("should return 400 if movieId is not provided ", async () => {
    movieId = "";
    const response = await exec();
    expect(response.status).toBe(400);
  });

  it("should return 404 if no rental found for movieId/customerId ", async () => {
    await Rental.remove({});
    const response = await exec();
    expect(response.status).toBe(404);
  });

  it("should return 400 if return already processed ", async () => {
    rental.dateReturned = new Date();
    await rental.save();
    const response = await exec();
    expect(response.status).toBe(400);
  });

  it("should return 200 if request is valid", async () => {
    const response = await exec();
    expect(response.status).toBe(200);
  });

  it("should set the return date if request is valid", async () => {
    const response = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(20 * 1000);
  });

  it("should set the rentalFee if request is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();
    const response = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBeDefined();
  });

  it("should increase movie stock", async () => {
    const response = await exec();
    const movieInDb = await Movie.findById(movieId);
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return rental if input is valid", async () => {
    const response = await exec();
    const rentalInDb = await Rental.findById(rental._id);
    expect(Object.keys(response.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "rentalFee",
        "customer",
        "movie",
      ])
    );
  });
});
