import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import App from "../src/App";

const templePayload = [
  {
    house: "மேஷம்",
    planets: ["சூரி", "செ"],
    data: [
      {
        id: "t-1",
        temple: "Arulmigu Subramania Swami Temple",
        location: "Tiruchendur",
        state: "Tamilnadu",
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
          new Response(JSON.stringify({ user }), {
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

    expect(
      await screen.findByText("Arulmigu Subramania Swami Temple"),
    ).toBeInTheDocument();
  });
});
