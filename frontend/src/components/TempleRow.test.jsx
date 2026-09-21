import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import TempleRow from "./TempleRow";
import { LangProvider } from "../context/LangContext";

function renderWithLang(ui) {
  return render(<LangProvider>{ui}</LangProvider>);
}

describe("TempleRow", () => {
  it("expands details when temple name is tapped", async () => {
    const row = {
      id: "t-11",
      temple: "arulmigu dheerga peyar kovil",
      location: "madurai",
      state: "tamil nadu",
      house: "மீனம்",
      planets: ["சனி", "சுக்"],
    };

    renderWithLang(
      <TempleRow row={row} onEdit={null} />,
    );

    const nameButton = screen.getByRole("button", {
      name: "Arulmigu Dheerga Peyar Kovil",
    });
    expect(nameButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("மீனம்")).not.toBeInTheDocument();

    await userEvent.click(nameButton);

    expect(nameButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("மீனம்")).toBeInTheDocument();

    await userEvent.click(nameButton);
    expect(nameButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("மீனம்")).not.toBeInTheDocument();
  });

  it("still supports edit action independently", async () => {
    const onEdit = vi.fn();
    const row = {
      id: "t-12",
      temple: "kapaleeshwarar temple",
      location: "chennai",
      state: "tamil nadu",
      house: "மேஷம்",
      planets: ["சூரி"],
    };

    renderWithLang(
      <TempleRow row={row} onEdit={onEdit} />,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "kapaleeshwarar temple திருத்து",
      }),
    );

    expect(onEdit).toHaveBeenCalledWith(row);
  });

  it("renders a YouTube launch link when url exists", async () => {
    const row = {
      id: "t-13",
      temple: "kuzhandhai velappar",
      location: "kodaikanal",
      state: "tamilnadu",
      significance: "Pariharam, family-vow, symbols @#$%",
      house: "விருச்சிகம்",
      planets: ["செ", "குரு"],
      url: "https://www.youtube.com/watch?v=pX5VBhaVPas",
    };

    renderWithLang(
      <TempleRow row={row} onEdit={null} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Kuzhandhai Velappar" }),
    );
    const link = screen.getByRole("link", {
      name: "kuzhandhai velappar Watch this video",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=pX5VBhaVPas",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      screen.getByText("முக்கியத்துவம்: Pariharam, family-vow, symbols @#$%"),
    ).toBeInTheDocument();
  });

  it("does not render a YouTube launch link when url is missing", () => {
    const row = {
      id: "t-14",
      temple: "bhavani sangameshwarar",
      location: "bhavani",
      state: "tamilnadu",
      house: "விருச்சிகம்",
      planets: ["செ", "ராகு"],
    };

    renderWithLang(
      <TempleRow row={row} onEdit={null} />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
