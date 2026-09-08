import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TopAppBar from "./TopAppBar";
import { LangProvider } from "../context/LangContext";
import { ThemeProvider } from "../context/ThemeContext";

function renderWithProviders(ui) {
  return render(
    <ThemeProvider>
      <LangProvider>{ui}</LangProvider>
    </ThemeProvider>,
  );
}

describe("TopAppBar profile card", () => {
  it("shows user name in view profile", async () => {
    renderWithProviders(
      <TopAppBar
        user={{
          id: "u-1",
          mobile: "919876543210",
          name: "Thangaraj",
          initials: "TR",
          role: "contributor",
        }}
        onLogout={() => {}}
      />,
    );

    await userEvent.click(screen.getByLabelText("Account menu"));
    await userEvent.click(screen.getByRole("button", { name: "சுயவிவரம்" }));

    expect(screen.getByText("பெயர்: Thangaraj")).toBeInTheDocument();
    expect(screen.getByText("மொபைல்: 919876543210")).toBeInTheDocument();
  });

  it("falls back to initials when name is missing", async () => {
    renderWithProviders(
      <TopAppBar
        user={{
          id: "u-2",
          mobile: "919876543200",
          initials: "SA",
          role: "admin",
        }}
        onLogout={() => {}}
      />,
    );

    await userEvent.click(screen.getByLabelText("Account menu"));
    await userEvent.click(screen.getByRole("button", { name: "சுயவிவரம்" }));

    expect(screen.getByText("பெயர்: SA")).toBeInTheDocument();
  });
});
