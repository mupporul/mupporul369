"use strict";

const request = require("supertest");
const fs = require("fs");
const path = require("path");

const DATA_PATH = path.join(__dirname, "../data/temples.json");
const REVIEW_PATH = path.join(__dirname, "../data/review.json");

describe("temples routes", () => {
  let app;
  let originalData;
  let originalReview;

  async function loginAndGetToken(mobile, password) {
    const res = await request(app).post("/api/auth/login").send({
      mobile,
      password,
    });
    return res.body.token;
  }

  beforeEach(() => {
    jest.resetModules();
    process.env.NODE_ENV = "test";
    originalData = fs.readFileSync(DATA_PATH, "utf8");
    originalReview = fs.readFileSync(REVIEW_PATH, "utf8");
    fs.writeFileSync(REVIEW_PATH, "[]", "utf8");
    app = require("../index");
  });

  afterEach(() => {
    fs.writeFileSync(DATA_PATH, originalData, "utf8");
    fs.writeFileSync(REVIEW_PATH, originalReview, "utf8");
  });

  it("GET /api/temples returns an array", async () => {
    const res = await request(app).get("/api/temples");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("GET /api/temples groups have house, planets, and data", async () => {
    const res = await request(app).get("/api/temples");
    const group = res.body[0];
    expect(typeof group.house).toBe("string");
    expect(Array.isArray(group.planets)).toBe(true);
    expect(Array.isArray(group.data)).toBe(true);
    expect(typeof group.data[0].id).toBe("string");
  });

  it("PATCH /api/temples/:id queues a temple edit for review", async () => {
    const getRes = await request(app).get("/api/temples");
    const firstGroup = getRes.body[0];
    const firstTemple = firstGroup.data[0];
    const token = await loginAndGetToken("919876543210", "test1234");

    const patchRes = await request(app)
      .patch(`/api/temples/${firstTemple.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        temple: "Updated Temple Name",
        location: "Updated Location",
        state: "Updated State",
        house: firstGroup.house,
        planets: firstGroup.planets,
      });

    expect(patchRes.status).toBe(202);
    expect(patchRes.body.queuedReview.action).toBe("edit");
  });

  it("PATCH /api/temples/:id does not queue review when payload has no changes", async () => {
    const getRes = await request(app).get("/api/temples");
    const firstGroup = getRes.body[0];
    const firstTemple = firstGroup.data[0];
    const token = await loginAndGetToken("919876543210", "test1234");

    const patchRes = await request(app)
      .patch(`/api/temples/${firstTemple.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        temple: firstTemple.temple,
        location: firstTemple.location,
        state: firstTemple.state,
        url: firstTemple.url || "",
        house: firstGroup.house,
        planets: firstGroup.planets,
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.noChanges).toBe(true);

    const reviewsRes = await request(app)
      .get("/api/reviews")
      .set("Authorization", `Bearer ${token}`);
    expect(reviewsRes.status).toBe(200);
    expect(reviewsRes.body).toEqual([]);
  });

  it("PATCH /api/temples/:id returns 401 for unauthenticated request", async () => {
    const res = await request(app).patch("/api/temples/some-id").send({
      temple: "Temple",
      location: "Loc",
      state: "State",
      house: "மேஷம்",
      planets: [],
    });
    expect(res.status).toBe(401);
  });

  it("PATCH /api/temples/:id returns 404 for unknown id", async () => {
    const token = await loginAndGetToken("919876543210", "test1234");
    const res = await request(app)
      .patch("/api/temples/non-existent-uuid")
      .set("Authorization", `Bearer ${token}`)
      .send({
        temple: "T",
        location: "L",
        state: "S",
        house: "மேஷம்",
        planets: ["சூரி"],
      });
    expect(res.status).toBe(404);
  });

  it("PATCH /api/temples/:id returns 400 when required fields are missing", async () => {
    const token = await loginAndGetToken("919876543210", "test1234");
    const res = await request(app)
      .patch("/api/temples/some-id")
      .set("Authorization", `Bearer ${token}`)
      .send({ temple: "Only temple field" });
    expect(res.status).toBe(400);
  });

  it("PATCH /api/temples/:id returns 400 when temple is empty string", async () => {
    const token = await loginAndGetToken("919876543210", "test1234");
    const res = await request(app)
      .patch("/api/temples/some-id")
      .set("Authorization", `Bearer ${token}`)
      .send({
        temple: "  ",
        location: "Loc",
        state: "State",
        house: "மேஷம்",
        planets: [],
      });
    expect(res.status).toBe(400);
  });

  it("POST /api/temples queues a new temple record for review", async () => {
    const token = await loginAndGetToken("919876543210", "test1234");
    const res = await request(app)
      .post("/api/temples")
      .set("Authorization", `Bearer ${token}`)
      .send({
        temple: "Test New Temple",
        location: "Madurai",
        state: "Tamil Nadu",
        house: "மீனம்",
        planets: ["சனி", "குரு"],
      });

    expect(res.status).toBe(202);
    expect(res.body.queuedReview.action).toBe("add");
  });

  it("POST /api/temples queues optional url in review payload", async () => {
    const token = await loginAndGetToken("919876543210", "test1234");
    const res = await request(app)
      .post("/api/temples")
      .set("Authorization", `Bearer ${token}`)
      .send({
        temple: "URL Temple",
        location: "Kodaikanal",
        state: "Tamilnadu",
        url: "https://www.youtube.com/watch?v=pX5VBhaVPas",
        house: "விருச்சிகம்",
        planets: ["செ", "குரு"],
      });

    expect(res.status).toBe(202);
    expect(res.body.queuedReview.payload.url).toBe(
      "https://www.youtube.com/watch?v=pX5VBhaVPas",
    );
  });

  it("POST /api/temples returns 400 when payload is invalid", async () => {
    const token = await loginAndGetToken("919876543210", "test1234");
    const res = await request(app)
      .post("/api/temples")
      .set("Authorization", `Bearer ${token}`)
      .send({
        temple: "",
        location: "",
      });
    expect(res.status).toBe(400);
  });

  it("POST /api/temples returns 403 for user role", async () => {
    const token = await loginAndGetToken("919876543214", "test1234");
    const res = await request(app)
      .post("/api/temples")
      .set("Authorization", `Bearer ${token}`)
      .send({
        temple: "Blocked Temple",
        location: "Madurai",
        state: "Tamil Nadu",
        house: "மீனம்",
        planets: ["சனி"],
      });
    expect(res.status).toBe(403);
  });

  it("review approval with two distinct users applies queued temple and clears it", async () => {
    const contributorOne = await loginAndGetToken("919876543210", "test1234");
    const contributorTwo = await loginAndGetToken("919876543211", "test1234");

    const queueRes = await request(app)
      .post("/api/temples")
      .set("Authorization", `Bearer ${contributorOne}`)
      .send({
        temple: "Two Approvals Temple",
        location: "Chennai",
        state: "Tamil Nadu",
        house: "மீனம்",
        planets: ["சனி", "குரு"],
      });

    const reviewId = queueRes.body.queuedReview.id;

    const pendingBeforeApproval = await request(app)
      .get("/api/reviews")
      .set("Authorization", `Bearer ${contributorOne}`);
    expect(pendingBeforeApproval.status).toBe(200);
    expect(
      pendingBeforeApproval.body.some((item) => item.id === reviewId),
    ).toBe(true);

    const approveOne = await request(app)
      .post(`/api/reviews/${reviewId}/approve`)
      .set("Authorization", `Bearer ${contributorOne}`);
    expect(approveOne.status).toBe(200);
    expect(approveOne.body.applied).toBe(false);

    const stillPendingAfterOneApproval = await request(app)
      .get("/api/reviews")
      .set("Authorization", `Bearer ${contributorOne}`);
    expect(
      stillPendingAfterOneApproval.body.some((item) => item.id === reviewId),
    ).toBe(true);

    const templesBeforeSecondApproval = await request(app).get("/api/temples");
    const notYetCreated = templesBeforeSecondApproval.body
      .flatMap((group) => group.data)
      .find((temple) => temple.temple === "Two Approvals Temple");
    expect(notYetCreated).toBeUndefined();

    const approveTwo = await request(app)
      .post(`/api/reviews/${reviewId}/approve`)
      .set("Authorization", `Bearer ${contributorTwo}`);
    expect(approveTwo.status).toBe(200);
    expect(approveTwo.body.applied).toBe(true);

    const templesRes = await request(app).get("/api/temples");
    const created = templesRes.body
      .flatMap((group) => group.data)
      .find((temple) => temple.temple === "Two Approvals Temple");
    expect(created).toBeDefined();

    const reviewsRes = await request(app)
      .get("/api/reviews")
      .set("Authorization", `Bearer ${contributorOne}`);
    expect(reviewsRes.body.some((item) => item.id === reviewId)).toBe(false);
  });

  it("does not apply when same user approves twice; applies on second distinct approval", async () => {
    const contributorOne = await loginAndGetToken("919876543210", "test1234");
    const contributorTwo = await loginAndGetToken("919876543211", "test1234");

    const queueRes = await request(app)
      .post("/api/temples")
      .set("Authorization", `Bearer ${contributorOne}`)
      .send({
        temple: "Distinct Approval Rule Temple",
        location: "Chennai",
        state: "Tamil Nadu",
        house: "மீனம்",
        planets: ["சனி", "குரு"],
      });

    const reviewId = queueRes.body.queuedReview.id;

    const approveOne = await request(app)
      .post(`/api/reviews/${reviewId}/approve`)
      .set("Authorization", `Bearer ${contributorOne}`);
    expect(approveOne.status).toBe(200);
    expect(approveOne.body.applied).toBe(false);

    const approveOneAgain = await request(app)
      .post(`/api/reviews/${reviewId}/approve`)
      .set("Authorization", `Bearer ${contributorOne}`);
    expect(approveOneAgain.status).toBe(200);
    expect(approveOneAgain.body.applied).toBe(false);

    const stillPendingRes = await request(app)
      .get("/api/reviews")
      .set("Authorization", `Bearer ${contributorOne}`);
    const pendingItem = stillPendingRes.body.find((item) => item.id === reviewId);
    expect(pendingItem).toBeDefined();
    expect(pendingItem.approvals.length).toBe(1);

    const approveTwo = await request(app)
      .post(`/api/reviews/${reviewId}/approve`)
      .set("Authorization", `Bearer ${contributorTwo}`);
    expect(approveTwo.status).toBe(200);
    expect(approveTwo.body.applied).toBe(true);

    const templesRes = await request(app).get("/api/temples");
    const appliedTemple = templesRes.body
      .flatMap((group) => group.data)
      .find((temple) => temple.temple === "Distinct Approval Rule Temple");
    expect(appliedTemple).toBeDefined();
  });

  it("review approval persists url for add and edit flows", async () => {
    const contributorOne = await loginAndGetToken("919876543210", "test1234");
    const contributorTwo = await loginAndGetToken("919876543211", "test1234");
    const addSignificance =
      "Pariharam, 108 deepam, special symbols @#$%^&*(), and long text support.";

    const addQueue = await request(app)
      .post("/api/temples")
      .set("Authorization", `Bearer ${contributorOne}`)
      .send({
        temple: "Temple With Url",
        location: "Kodaikanal",
        state: "Tamilnadu",
        url: "https://www.youtube.com/watch?v=pX5VBhaVPas",
        significance: addSignificance,
        house: "விருச்சிகம்",
        planets: ["செ", "குரு"],
      });

    const addReviewId = addQueue.body.queuedReview.id;

    await request(app)
      .post(`/api/reviews/${addReviewId}/approve`)
      .set("Authorization", `Bearer ${contributorOne}`);
    await request(app)
      .post(`/api/reviews/${addReviewId}/approve`)
      .set("Authorization", `Bearer ${contributorTwo}`);

    let templesRes = await request(app).get("/api/temples");
    const addedTemple = templesRes.body
      .flatMap((group) => group.data)
      .find((temple) => temple.temple === "Temple With Url");
    expect(addedTemple).toBeDefined();
    expect(addedTemple.url).toBe("https://www.youtube.com/watch?v=pX5VBhaVPas");
    expect(addedTemple.significance).toBe(addSignificance);

    const patchQueue = await request(app)
      .patch(`/api/temples/${addedTemple.id}`)
      .set("Authorization", `Bearer ${contributorOne}`)
      .send({
        temple: "Temple With Url",
        location: "Kodaikanal",
        state: "Tamilnadu",
        url: "",
        significance: "",
        house: "விருச்சிகம்",
        planets: ["செ", "குரு"],
      });
    expect(patchQueue.status).toBe(202);

    const patchReviewId = patchQueue.body.queuedReview.id;
    await request(app)
      .post(`/api/reviews/${patchReviewId}/approve`)
      .set("Authorization", `Bearer ${contributorOne}`);
    await request(app)
      .post(`/api/reviews/${patchReviewId}/approve`)
      .set("Authorization", `Bearer ${contributorTwo}`);

    templesRes = await request(app).get("/api/temples");
    const editedTemple = templesRes.body
      .flatMap((group) => group.data)
      .find((temple) => temple.id === addedTemple.id);
    expect(editedTemple).toBeDefined();
    expect(editedTemple.url).toBeUndefined();
    expect(editedTemple.significance).toBeUndefined();
  });

  it("editing a pending review resets approvals and keeps the same review", async () => {
    const contributorOne = await loginAndGetToken("919876543210", "test1234");
    const contributorTwo = await loginAndGetToken("919876543211", "test1234");
    const templesBefore = await request(app).get("/api/temples");
    const sourceGroup = templesBefore.body[0];
    const sourceTemple = sourceGroup.data[0];

    const queued = await request(app)
      .patch(`/api/temples/${sourceTemple.id}`)
      .set("Authorization", `Bearer ${contributorOne}`)
      .send({
        temple: "First Pending Edit",
        location: sourceTemple.location,
        state: sourceTemple.state,
        house: sourceGroup.house,
        planets: sourceGroup.planets,
      });
    const reviewId = queued.body.queuedReview.id;

    await request(app)
      .post(`/api/reviews/${reviewId}/approve`)
      .set("Authorization", `Bearer ${contributorOne}`);

    const edited = await request(app)
      .patch(`/api/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${contributorTwo}`)
      .send({
        temple: "Second Pending Edit",
        location: sourceTemple.location,
        state: sourceTemple.state,
        house: sourceGroup.house,
        planets: sourceGroup.planets,
      });

    expect(edited.status).toBe(200);
    expect(edited.body.review.id).toBe(reviewId);
    expect(edited.body.review.payload.temple).toBe("Second Pending Edit");
    expect(edited.body.review.approvals).toEqual([]);

    const stillOriginal = await request(app).get("/api/temples");
    expect(
      stillOriginal.body
        .flatMap((group) => group.data)
        .find((temple) => temple.id === sourceTemple.id).temple,
    ).toBe(sourceTemple.temple);

    const approveAgainOne = await request(app)
      .post(`/api/reviews/${reviewId}/approve`)
      .set("Authorization", `Bearer ${contributorOne}`);
    expect(approveAgainOne.body.applied).toBe(false);

    const approveAgainTwo = await request(app)
      .post(`/api/reviews/${reviewId}/approve`)
      .set("Authorization", `Bearer ${contributorTwo}`);
    expect(approveAgainTwo.body.applied).toBe(true);

    const updatedTemples = await request(app).get("/api/temples");
    expect(
      updatedTemples.body
        .flatMap((group) => group.data)
        .find((temple) => temple.id === sourceTemple.id).temple,
    ).toBe("Second Pending Edit");
  });
});
