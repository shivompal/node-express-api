const request = require("supertest");
const { Genre } = require("../../models/genre");
const { User } = require("../../models/user");

let server;
describe("api/genres", () => {
  beforeEach(() => {
    server = require("../../index");
  });

  afterEach(async () => {
    await server.close();
    await Genre.remove({});
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
        { name: "genre3" },
        { name: "genre4" },
      ]);
      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(4);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
    });
  });

  describe("GET/:ID", () => {
    it("should return a genre if a valid is passed", async () => {
      const genre = new Genre({ name: "mygenre" });
      await genre.save();
      const res = await request(server).get("/api/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(server).get("/api/genres/1");
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    // First define the happy path, and then in each test we change one
    // parameter that clearly aligns with the name of the test.
    let name;
    let token;
    const exec = async () => {
      return await request(server)
        .post("/api/genres/")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "Action";
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 5 characters in length", async () => {
      name = "Act";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is greater than 50 characters in length", async () => {
      name = new Array(52).join("g");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save genre in database if input is valid", async () => {
      await exec();

      const genre = Genre.find({ name: "Action" });

      expect(genre).not.toBeNull();
    });

    it("should save genre in database and also return if input is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");

      expect(res.body).toHaveProperty("name", "Action");
    });
  });
});
