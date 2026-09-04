import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import App from "../src/App";

const reviewItems = [
  {
    id: "review-uuid",
    action: "edit",
    templeId: "a1b2c3d4-0001-0001-0001-000000000001",
    payload: {},
    status: "pending",
    approvals: [],
    createdBy: {},
    createdAt: "2026-09-04T10:00:00.000Z",
    modifiedBy: {},
    modifiedAt: "2026-09-04T10:00:00.000Z",
  },
];

describe("reviews page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("mupporul369.authToken", "valid-token");
    vi.restoreAllMocks();
  });

  it("renders review status and approval action", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/me") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "u1" }), { status: 200 }),
        );
      }
      if (String(url).includes("/api/temples") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200 }),
        );
      }
      if (String(url).includes("/api/reviews/") && method === "POST") {
        return Promise.resolve(
          new Response(JSON.stringify({ status: "approved" }), { status: 200 }),
        );
      }
      if (String(url).includes("/api/reviews") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify(reviewItems), { status: 200 }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    render(<App />);
    await screen.findByText("Temple Registry");

    fireEvent.click(screen.getByRole("button", { name: "Reviews" }));
    await screen.findByText(/pending/i);
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    await screen.findByText(/approved/i);
  });
});
