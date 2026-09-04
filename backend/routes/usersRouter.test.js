"use strict";

const express = require("express");
const request = require("supertest");

jest.mock("../middleware/requireAuth", () => (_req, _res, next) => next());
jest.mock(
  "../middleware/requireRole",
  () => () => (_req, _res, next) => next(),
);
jest.mock("../services/userService", () => ({
  getAllUsers: jest.fn(),
  createUser: jest.fn(),
  deleteUser: jest.fn(),
}));

const {
  getAllUsers,
  createUser,
  deleteUser,
} = require("../services/userService");
const usersRouter = require("./usersRouter");

describe("users router", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/users", usersRouter);

    getAllUsers.mockReset();
    createUser.mockReset();
    deleteUser.mockReset();
  });

  it("GET /api/users returns user list", async () => {
    getAllUsers.mockReturnValue([
      {
        id: "u-1",
        mobile: "919876543210",
        name: "Thangaraj",
        initials: "TR",
        role: "contributor",
      },
    ]);

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body[0].name).toBe("Thangaraj");
  });

  it("POST /api/users requires name", async () => {
    const response = await request(app).post("/api/users").send({
      mobile: "919876543215",
      password: "pass1234",
      initials: "AB",
      role: "user",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Missing required fields");
    expect(createUser).not.toHaveBeenCalled();
  });

  it("POST /api/users creates user with name", async () => {
    createUser.mockReturnValue({
      id: "u-2",
      mobile: "919876543215",
      name: "Arun Babu",
      initials: "AB",
      role: "user",
    });

    const response = await request(app).post("/api/users").send({
      mobile: "919876543215",
      password: "pass1234",
      name: "Arun Babu",
      initials: "AB",
      role: "user",
    });

    expect(response.status).toBe(201);
    expect(createUser).toHaveBeenCalledWith(
      "919876543215",
      "pass1234",
      "Arun Babu",
      "AB",
      "user",
    );
    expect(response.body.name).toBe("Arun Babu");
  });
});
