import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App.jsx";

const SAMPLE_TEMPLE_GROUPS = [
  {
    house: "மேஷம்",
    planets: ["சூரி", "செ"],
    data: [
      {
        id: "t-1",
        temple: "Arulmigu Subramania Swami Temple",
        location: "Tiruchendur",
        state: "Tamilnadu",
      },
    ],
  },
];

function mockFetchForUser(user) {
  globalThis.fetch = vi.fn((url) => {
    if (url === "/api/auth/me") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user }),
      });
    }

    if (url === "/api/temples") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(SAMPLE_TEMPLE_GROUPS),
      });
    }

    if (url === "/api/reviews") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }

    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

function setStoredAuth(user, token) {
  localStorage.setItem(
    "mupporul369-auth",
    JSON.stringify({
      token,
      user,
    }),
  );
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn((url) => {
      if (url === "/api/temples") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(SAMPLE_TEMPLE_GROUPS),
        });
      }

      if (url === "/api/reviews") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  it("renders login page by default", () => {
    render(<App />);
    expect(screen.getByText("MupporuL369")).toBeInTheDocument();
    expect(screen.getByLabelText("மொபைல் எண்")).toBeInTheDocument();
    expect(screen.getByLabelText("கடவுச்சொல்")).toBeInTheDocument();
  });

  it("shows contributor tabs and add/edit access for contributor role", async () => {
    const storedUser = {
      id: "u-contrib-001",
      mobile: "919876543210",
      initials: "TR",
      role: "contributor",
    };

    mockFetchForUser(storedUser);
    setStoredAuth(storedUser, "test-token");

    render(<App />);

    expect(
      await screen.findByRole("button", { name: "கோவில்கள்" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Arulmigu Subramania Swami Temple"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "வினாடி வினா" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "பரிசீலனை" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "பயனர்கள்" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "கோவில் சேர்" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /திருத்து/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("combobox", { name: /ராசி தேர்வு/i }),
    ).toBeInTheDocument();
  });

  it("shows all admin tabs and add/edit access for admin role", async () => {
    const storedUser = {
      id: "u-admin-001",
      mobile: "919876543200",
      initials: "SA",
      role: "admin",
    };

    mockFetchForUser(storedUser);
    setStoredAuth(storedUser, "admin-token");

    render(<App />);

    expect(
      await screen.findByRole("button", { name: "கோவில்கள்" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Arulmigu Subramania Swami Temple"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "வினாடி வினா" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "பரிசீலனை" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "பயனர்கள்" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "கோவில் சேர்" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /திருத்து/i }).length,
    ).toBeGreaterThan(0);
  });

  it("hides add/edit/review/users for user role", async () => {
    const storedUser = {
      id: "u-user-001",
      mobile: "919876543214",
      initials: "US",
      role: "user",
    };

    mockFetchForUser(storedUser);
    setStoredAuth(storedUser, "user-token");

    render(<App />);

    expect(
      await screen.findByRole("button", { name: "கோவில்கள்" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Arulmigu Subramania Swami Temple"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "வினாடி வினா" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "பரிசீலனை" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "பயனர்கள்" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "கோவில் சேர்" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /திருத்து/i }),
    ).not.toBeInTheDocument();
  });

  it("submits temple edits to PATCH /api/temples/:id", async () => {
    const storedUser = {
      id: "u-contrib-001",
      mobile: "919876543210",
      initials: "TR",
      role: "contributor",
    };

    mockFetchForUser(storedUser);
    setStoredAuth(storedUser, "test-token");

    render(<App />);

    expect(
      await screen.findByText("Arulmigu Subramania Swami Temple"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /திருத்து/i })[0]);
    fireEvent.click(
      await screen.findByRole("button", { name: /சேமி|Queue Edit/i }),
    );

    await waitFor(() => {
      expect(
        globalThis.fetch.mock.calls.some(
          ([url, options]) =>
            url === "/api/temples/t-1" && options?.method === "PATCH",
        ),
      ).toBe(true);
    });
  });
});
