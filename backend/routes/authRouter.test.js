"use strict";

const request = require("supertest");

describe("auth routes", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = "test";
    app = require("../index");
  });

  it("POST /api/auth/login returns token and user for valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      mobile: "919876543210",
      password: "test1234",
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe("string");
    expect(response.body.user.role).toBe("contributor");
    expect(response.body.user.name).toBe("Thangaraj");
  });

  it("POST /api/auth/login returns 401 for invalid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      mobile: "919876543210",
      password: "wrong",
    });

    expect(response.status).toBe(401);
  });

  it("GET /api/auth/me returns current user for valid token", async () => {
    const login = await request(app).post("/api/auth/login").send({
      mobile: "919876543200",
      password: "Specsavers2016!",
    });

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user.role).toBe("admin");
    expect(me.body.user.name).toBe("SA");
  });

  it("uses an in-memory session store instead of sessions.json", async () => {
    const fs = require("fs");
    const originalWriteFileSync = fs.writeFileSync;
    const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementation((filePath, ...args) => {
      if (String(filePath).includes("sessions.json")) {
        throw new Error("sessions.json should not be used for auth sessions");
      }
      return originalWriteFileSync.call(fs, filePath, ...args);
    });

    try {
      const login = await request(app).post("/api/auth/login").send({
        mobile: "919876543210",
        password: "test1234",
      });

      const me = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${login.body.token}`);

      expect(login.status).toBe(200);
      expect(login.body.user.mobile).toBe("919876543210");
      expect(me.status).toBe(200);
      expect(me.body.user.name).toBe("Thangaraj");
    } finally {
      writeSpy.mockRestore();
    }
  });
});
