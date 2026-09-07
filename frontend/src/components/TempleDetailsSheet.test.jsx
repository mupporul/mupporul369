import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import TempleDetailsSheet from "./TempleDetailsSheet";
import { LangProvider } from "../context/LangContext";

function renderWithLang(ui) {
  return render(<LangProvider>{ui}</LangProvider>);
}

describe("TempleDetailsSheet", () => {
  it("renders full details and closes on close button", async () => {
    const onClose = vi.fn();
    renderWithLang(
      <TempleDetailsSheet
        temple={{
          id: "t-20",
          temple: "arulmigu very very long temple name for testing",
          location: "tiruchendur",
          state: "tamil nadu",
          significance: "Pariharam, lineage vow, symbols @#$%^&*()",
          house: "விருச்சிகம்",
          planets: ["செ", "குரு"],
        }}
        onClose={onClose}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "கோவில் விவரம்" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Arulmigu Very Very Long Temple Name For Testing"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pariharam, lineage vow, symbols @#$%^&*()"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "மூடு" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when overlay is clicked", async () => {
    const onClose = vi.fn();
    renderWithLang(
      <TempleDetailsSheet
        temple={{
          id: "t-21",
          temple: "thirupparamkundram",
          location: "madurai",
          state: "tamil nadu",
          house: "மீனம்",
          planets: ["சனி"],
        }}
        onClose={onClose}
      />,
    );

    const overlay = document.querySelector(".temple-details-overlay");
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
