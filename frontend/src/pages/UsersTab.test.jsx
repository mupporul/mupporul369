import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import UsersTab from "./UsersTab";
import { LangProvider } from "../context/LangContext";

function renderWithLang(ui) {
  return render(<LangProvider>{ui}</LangProvider>);
}

function jsonResponse(data, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
}

describe("UsersTab", () => {
  it("sends name when adding a user", async () => {
    const authFetch = vi.fn((url, options = {}) => {
      if (url === "/api/users" && !options.method) {
        return jsonResponse([]);
      }

      if (url === "/api/export/files") {
        return jsonResponse(["users.json"]);
      }

      if (url === "/api/users" && options.method === "POST") {
        return jsonResponse({
          id: "u-2",
          mobile: "919876543215",
          name: "Arun Babu",
          initials: "AB",
          role: "user",
        });
      }

      return jsonResponse({});
    });

    renderWithLang(<UsersTab authFetch={authFetch} />);

    await screen.findByText("தரவு காப்பு");

    await userEvent.type(
      screen.getByPlaceholderText("Mobile (12 digits)"),
      "919876543215",
    );
    await userEvent.type(screen.getByPlaceholderText("Password"), "pass1234");
    await userEvent.type(screen.getByPlaceholderText("Name"), "Arun Babu");
    await userEvent.type(
      screen.getByPlaceholderText("Initials (2 chars)"),
      "ab",
    );

    await userEvent.click(screen.getByRole("button", { name: "பயனர் சேர்" }));

    await waitFor(() => {
      const postCall = authFetch.mock.calls.find(
        ([url, options]) => url === "/api/users" && options?.method === "POST",
      );
      expect(postCall).toBeTruthy();
      expect(JSON.parse(postCall[1].body)).toMatchObject({
        mobile: "919876543215",
        password: "pass1234",
        name: "Arun Babu",
        initials: "AB",
        role: "contributor",
      });
    });
  });
});
