import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import App from "../src/App";

describe("auth 401 handling", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("clears auth and returns to login when authFetch receives 401", async () => {
    const user = {
      id: "u1",
      mobile: "919876543210",
      initials: "TR",
      role: "contributor",
    };

    localStorage.setItem(
      "mupporul369-auth",
      JSON.stringify({ token: "valid-token", user }),
    );

    vi.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/me") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify({ user }), { status: 200 }),
        );
      }
      if (String(url).includes("/api/temples") && method === "GET") {
        return Promise.resolve(new Response("", { status: 401 }));
      }
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    render(<App />);

    await screen.findByLabelText("மொபைல் எண்");
    expect(localStorage.getItem("mupporul369-auth")).toBeNull();
  });

  it("allows login and persists token", async () => {
    const user = {
      id: "u2",
      mobile: "919876543210",
      initials: "TR",
      role: "contributor",
    };

    vi.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/login") && method === "POST") {
        return Promise.resolve(
          new Response(JSON.stringify({ token: "new-token", user }), {
            status: 200,
          }),
        );
      }
      if (String(url).includes("/api/auth/me") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify({ user }), { status: 200 }),
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

    fireEvent.change(screen.getByLabelText("மொபைல் எண்"), {
      target: { value: "919876543210" },
    });
    fireEvent.change(screen.getByLabelText("கடவுச்சொல்"), {
      target: { value: "pass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "உள்நுழை" }));

    await screen.findByRole("button", { name: "கோவில்கள்" });
    const saved = JSON.parse(localStorage.getItem("mupporul369-auth"));
    expect(saved.token).toBe("new-token");
    expect(saved.user.id).toBe("u2");
  });
});
