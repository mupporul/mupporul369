import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import App from "../src/App";

const templePayload = [
  {
    house: "மீனம்",
    planets: ["சனி", "குரு"],
    data: [
      {
        id: "a1b2c3d4-0001-0001-0001-000000000001",
        temple: "Some Temple",
        location: "Madurai",
        state: "Tamil Nadu",
        url: "https://example.com",
      },
    ],
  },
];

describe("temples page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("mupporul369.authToken", "valid-token");
    vi.restoreAllMocks();
  });

  it("shows load error state", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (String(url).includes("/api/auth/me")) {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "u1" }), { status: 200 }),
        );
      }
      if (String(url).includes("/api/temples")) {
        return Promise.resolve(
          new Response(JSON.stringify({ message: "boom" }), { status: 500 }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    render(<App />);
    await screen.findByText("boom");
  });

  it("queues add and edit requests including noChanges feedback", async () => {
    const createCalls = [];
    const editCalls = [];
    let reviewsReadCount = 0;

    vi.spyOn(global, "fetch").mockImplementation(async (url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/me") && method === "GET") {
        return new Response(
          JSON.stringify({
            id: "u1",
            mobile: "919876543210",
            initials: "TR",
            name: "Thangaraj",
            role: "contributor",
          }),
          { status: 200 },
        );
      }
      if (String(url).includes("/api/users/contributors") && method === "GET") {
        return new Response(
          JSON.stringify([
            { id: "u1", initials: "TR", role: "contributor" },
            { id: "u2", initials: "RR", role: "contributor" },
            { id: "u3", initials: "RA", role: "contributor" },
          ]),
          { status: 200 },
        );
      }
      if (String(url).includes("/api/temples") && method === "GET") {
        return new Response(JSON.stringify(templePayload), { status: 200 });
      }
      if (String(url).includes("/api/temples") && method === "POST") {
        createCalls.push(JSON.parse(options.body));
        return new Response(JSON.stringify({ queuedReview: { id: "r1" } }), {
          status: 200,
        });
      }
      if (String(url).includes("/api/reviews") && method === "GET") {
        reviewsReadCount += 1;
        if (reviewsReadCount >= 1) {
          return new Response(
            JSON.stringify([
              {
                id: "r1",
                action: "add",
                status: "pending",
                approvals: [],
                payload: {
                  temple: "New Temple",
                  location: "Chennai",
                  state: "Tamil Nadu",
                  house: "",
                  planets: ["சனி"],
                },
                createdBy: { initials: "TR" },
              },
            ]),
            { status: 200 },
          );
        }
      }
      if (String(url).includes("/api/temples/") && method === "PATCH") {
        editCalls.push(JSON.parse(options.body));
        return new Response(JSON.stringify({ noChanges: true }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify([]), { status: 200 });
    });

    render(<App />);
    await screen.findByText("Some Temple");
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    fireEvent.click(screen.getByRole("button", { name: "Add Temple" }));
    fireEvent.change(screen.getByLabelText("Temple"), {
      target: { value: "New Temple" },
    });
    fireEvent.change(screen.getByLabelText("Location"), {
      target: { value: "Chennai" },
    });
    fireEvent.change(screen.getByLabelText("State"), {
      target: { value: "Tamil Nadu" },
    });
    const createDialog = screen.getByRole("dialog", { name: "Add new temple" });
    fireEvent.click(within(createDialog).getByRole("button", { name: "சனி" }));
    fireEvent.click(screen.getByRole("button", { name: "Queue Add" }));

    await screen.findByText(/pending/i);
    expect(createCalls[0]).toEqual(
      expect.objectContaining({
        temple: "New Temple",
        location: "Chennai",
        state: "Tamil Nadu",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Temples" }));

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Queue Edit" }));

    await screen.findByText(
      "No changes detected. Review request was not created.",
    );
    expect(editCalls.length).toBe(1);
  });
});
