import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

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

describe("app auth bootstrap", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("loads authenticated app when stored token validates", async () => {
    localStorage.setItem("mupporul369.authToken", "valid-token");

    vi.spyOn(global, "fetch").mockImplementation((url, options = {}) => {
      const method = options.method || "GET";
      if (String(url).includes("/api/auth/me") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "u1", name: "Tester" }), {
            status: 200,
          }),
        );
      }
      if (String(url).includes("/api/temples") && method === "GET") {
        return Promise.resolve(
          new Response(JSON.stringify(templePayload), { status: 200 }),
        );
      }
      return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
    });

    render(<App />);

    await screen.findByText("Temple Registry");
    expect(await screen.findByText("Some Temple")).toBeInTheDocument();
  });
});
