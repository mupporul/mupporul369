"use strict";

const request = require("supertest");

describe("starter routes", () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = "test";
    app = require("../index");
  });

  it("returns a health payload without authentication", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.app).toBe("MupporuL369");
    expect(typeof response.body.timestamp).toBe("number");
  });

  it("returns the starter message payload", async () => {
    const response = await request(app).get("/api/message");

    expect(response.status).toBe(200);
    expect(response.body.name).toBe("MupporuL369");
    expect(response.body.message).toMatch(/MupporuL369/i);
    expect(response.body.stack).toEqual({
      client: "React 18 + Vite",
      server: "Node.js + Express",
    });
  });

  it("returns 404 for unknown routes", async () => {
    const response = await request(app).get("/missing-route");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found" });
  });
});
