import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import App from "../src/App";

describe("auth 401 handling", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("clears auth and returns to login when authFetch receives 401", async () => {
    localStorage.setItem("mupporul369.authToken", "valid-token");

    vi.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/me") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "u1" }), { status: 200 }),
        );
      }
      if (String(url).includes("/api/temples") && method === "GET") {
        return Promise.resolve(new Response("", { status: 401 }));
      }
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    render(<App />);

    await screen.findByText("Login");
    expect(localStorage.getItem("mupporul369.authToken")).toBeNull();
  });

  it("allows login and persists token", async () => {
    vi.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/login") && method === "POST") {
        return Promise.resolve(
          new Response(
            JSON.stringify({ token: "new-token", user: { id: "u1" } }),
            { status: 200 },
          ),
        );
      }
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
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText("Mobile"), {
      target: { value: "919876543210" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    await screen.findByText("Temple Registry");
    expect(localStorage.getItem("mupporul369.authToken")).toBe("new-token");
  });
});
