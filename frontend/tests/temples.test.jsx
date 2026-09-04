import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

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
    const reviewCalls = [];

    vi.spyOn(global, "fetch").mockImplementation(async (url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/me") && method === "GET") {
        return new Response(JSON.stringify({ id: "u1" }), { status: 200 });
      }
      if (String(url).includes("/api/temples") && method === "GET") {
        return new Response(JSON.stringify(templePayload), { status: 200 });
      }
      if (String(url).includes("/api/reviews") && method === "POST") {
        reviewCalls.push(JSON.parse(options.body));
        if (reviewCalls.length === 1) {
          return new Response(JSON.stringify({ id: "r1", status: "pending" }), {
            status: 200,
          });
        }
        return new Response(JSON.stringify({ noChanges: true }), {
          status: 200,
        });
      }
      return new Response(JSON.stringify([]), { status: 200 });
    });

    render(<App />);
    await screen.findByText("Some Temple");

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
    fireEvent.click(screen.getByRole("button", { name: "Queue Add" }));

    await screen.findByText("Temple add request queued for review.");
    expect(reviewCalls[0].action).toBe("add");

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Queue Edit" }));

    await screen.findByText(
      "No changes detected. Review request was not created.",
    );
    expect(reviewCalls[1].action).toBe("edit");
  });
});
