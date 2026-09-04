import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import App from "../src/App";

describe("users page", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("mupporul369.authToken", "valid-token");
    vi.restoreAllMocks();
  });

  it("creates and deletes users", async () => {
    const users = [];

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
      if (String(url).includes("/api/users") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify(users), { status: 200 }),
        );
      }
      if (String(url).includes("/api/users") && method === "POST") {
        const payload = JSON.parse(options.body);
        const nextUser = { ...payload, id: "u-created" };
        users.push(nextUser);
        return Promise.resolve(
          new Response(JSON.stringify(nextUser), { status: 200 }),
        );
      }
      if (String(url).includes("/api/users/u-created") && method === "DELETE") {
        users.splice(0, users.length);
        return Promise.resolve(
          new Response(JSON.stringify({ ok: true }), { status: 200 }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    render(<App />);
    await screen.findByText("Temple Registry");

    fireEvent.click(screen.getByRole("button", { name: "Users" }));
    await screen.findByText("Create User");

    fireEvent.change(screen.getByLabelText("Mobile"), {
      target: { value: "919876543210" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "pass" },
    });
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByLabelText("Initials"), {
      target: { value: "NU" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create User" }));

    await screen.findByText("New User");
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.queryByText("New User")).not.toBeInTheDocument();
    });
  });
});
