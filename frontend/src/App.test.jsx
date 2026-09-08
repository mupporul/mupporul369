import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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
    if (String(url).includes("/api/auth/me")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user }),
      });
    }

    if (String(url).includes("/api/users/contributors")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: "u-contrib-001", initials: "TR", role: "contributor" },
            { id: "u-contrib-002", initials: "RR", role: "contributor" },
            { id: "u-contrib-003", initials: "RA", role: "contributor" },
          ]),
      });
    }

    if (String(url).includes("/api/temples")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(SAMPLE_TEMPLE_GROUPS),
      });
    }

    if (String(url).includes("/api/reviews")) {
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
      if (String(url).includes("/api/temples")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(SAMPLE_TEMPLE_GROUPS),
        });
      }

      if (String(url).includes("/api/reviews")) {
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
            String(url).includes("/api/temples/t-1") &&
            options?.method === "PATCH",
        ),
      ).toBe(true);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "பரிசீலனை" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  it("refreshes data when entering the temples and review tabs", async () => {
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
    globalThis.fetch.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "பரிசீலனை" }));
    await waitFor(() => {
      expect(
        globalThis.fetch.mock.calls.some(([url]) =>
          String(url).includes("/api/reviews"),
        ),
      ).toBe(true);
    });

    globalThis.fetch.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "கோவில்கள்" }));
    await waitFor(() => {
      expect(
        globalThis.fetch.mock.calls.some(([url]) =>
          String(url).includes("/api/temples"),
        ),
      ).toBe(true);
    });
  });

  it("redirects to review tab after add temple and avoids temple queued message", async () => {
    const storedUser = {
      id: "u-contrib-001",
      mobile: "919876543210",
      initials: "TR",
      role: "contributor",
    };

    globalThis.fetch = vi.fn((url, options = {}) => {
      if (String(url).includes("/api/auth/me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ user: storedUser }),
        });
      }

      if (String(url).includes("/api/users/contributors")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: "u-contrib-001", initials: "TR", role: "contributor" },
              { id: "u-contrib-002", initials: "RR", role: "contributor" },
              { id: "u-contrib-003", initials: "RA", role: "contributor" },
            ]),
        });
      }

      if (String(url).includes("/api/temples") && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ queuedReview: { id: "r-add-1" } }),
        });
      }

      if (String(url).includes("/api/temples") && !options.method) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(SAMPLE_TEMPLE_GROUPS),
        });
      }

      if (String(url).includes("/api/reviews")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    setStoredAuth(storedUser, "test-token");
    render(<App />);

    expect(
      await screen.findByText("Arulmigu Subramania Swami Temple"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "கோவில் சேர்" }));
    expect(
      await screen.findByRole("dialog", { name: "புதிய கோவில் சேர்" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("கோவில்", { selector: "input" }), {
      target: { value: "Integration Add Temple" },
    });
    fireEvent.change(screen.getByLabelText("இடம்", { selector: "input" }), {
      target: { value: "Chennai" },
    });
    const addDialog = await screen.findByRole("dialog", {
      name: "புதிய கோவில் சேர்",
    });
    fireEvent.click(within(addDialog).getByRole("button", { name: "சனி" }));
    fireEvent.click(screen.getByRole("button", { name: "சேர்க்கவும்" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "பரிசீலனை" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    expect(
      screen.queryByText("பரிசீலனைக்கு அனுப்பப்பட்டது"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Temple add request queued for review."),
    ).not.toBeInTheDocument();
  });
});
