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

  it("renders review status chips for all contributors", async () => {
    const approveCalls = [];
    vi.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/me") && method === "GET") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              id: "u1",
              mobile: "919876543210",
              initials: "TR",
              name: "Thangaraj",
              role: "contributor",
            }),
            { status: 200 },
          ),
        );
      }
      if (String(url).includes("/api/users/contributors") && method === "GET") {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              { id: "u1", initials: "TR", role: "contributor" },
              { id: "u2", initials: "RR", role: "contributor" },
              { id: "u3", initials: "RA", role: "contributor" },
            ]),
            { status: 200 },
          ),
        );
      }
      if (String(url).includes("/api/temples") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200 }),
        );
      }
      if (String(url).includes("/api/reviews") && method === "GET") {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              {
                ...reviewItems[0],
                approvals: [{ userId: "u2", initials: "RR" }],
              },
            ]),
            { status: 200 },
          ),
        );
      }
      if (String(url).includes("/api/reviews/") && String(url).includes("/approve") && method === "POST") {
        approveCalls.push(String(url));
        return Promise.resolve(
          new Response(
            JSON.stringify({ reviews: [], temples: [], applied: false }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    const { container } = render(<App />);
    await screen.findByRole("searchbox");
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    fireEvent.click(screen.getByRole("button", { name: "Reviews" }));
    await screen.findByText(/pending/i);

    const chipInitials = Array.from(
      container.querySelectorAll(
        ".review-item__approver-text .review-item__approver-initial",
      ),
    ).map((node) => node.textContent?.trim());
    expect(chipInitials).toEqual(["TR", "RR", "RA"]);

    const chipIndicators = Array.from(
      container.querySelectorAll(
        ".review-item__approver-text .review-item__approver-indicator",
      ),
    ).map((node) => node.textContent?.trim());
    expect(chipIndicators).toEqual(["👀", "✓✓", "👀"]);

    await screen.findByRole("button", { name: "Approve TR" });
    fireEvent.click(screen.getByRole("button", { name: "Approve TR" }));
    expect(approveCalls[0]).toContain("/api/reviews/review-uuid/approve");
  });
});
