import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import EditModal from "./EditModal";
import { LangProvider } from "../context/LangContext";

function renderWithLang(ui) {
  return render(<LangProvider>{ui}</LangProvider>);
}

describe("EditModal cancel behavior", () => {
  it("calls onClose when cancel is clicked in edit mode", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const onCreate = vi.fn();

    renderWithLang(
      <EditModal
        temple={{
          id: "id-1",
          temple: "Meenakshi Amman Temple",
          location: "Madurai",
          state: "Tamil Nadu",
          house: "மீனம்",
          planets: ["சனி"],
        }}
        mode="edit"
        onSave={onSave}
        onCreate={onCreate}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "ரத்து செய்" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("calls onClose when cancel is clicked in create mode", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    const onCreate = vi.fn();

    renderWithLang(
      <EditModal
        temple={null}
        mode="create"
        onSave={onSave}
        onCreate={onCreate}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "ரத்து செய்" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("calls onClose when overlay is clicked", async () => {
    const onClose = vi.fn();

    renderWithLang(
      <EditModal
        temple={{
          id: "id-2",
          temple: "Kapaleeshwarar Temple",
          location: "Coimbatore",
          state: "Tamil Nadu",
          house: "மேஷம்",
          planets: ["சூரி"],
        }}
        mode="edit"
        onSave={vi.fn()}
        onCreate={vi.fn()}
        onClose={onClose}
      />,
    );

    const overlay = document.querySelector(".edit-modal-overlay");
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits create payload with optional url", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);

    renderWithLang(
      <EditModal
        temple={null}
        mode="create"
        onSave={vi.fn()}
        onCreate={onCreate}
        onClose={vi.fn()}
      />,
    );

    await userEvent.type(
      screen.getByLabelText("கோவில்", { selector: "input" }),
      "Arulmigu Kuzhandhai Velappar Thirukkovil",
    );
    await userEvent.type(
      screen.getByLabelText("இடம்", { selector: "input" }),
      "Kodaikanal",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "மாநிலம் தேர்வு" }),
      "Tamilnadu",
    );
    await userEvent.type(
      screen.getByLabelText("YouTube URL", { selector: "input" }),
      "https://www.youtube.com/watch?v=pX5VBhaVPas",
    );
    await userEvent.click(screen.getByRole("button", { name: "செ" }));

    await userEvent.click(screen.getByRole("button", { name: "சேர்க்கவும்" }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        temple: "Arulmigu Kuzhandhai Velappar Thirukkovil",
        location: "Kodaikanal",
        state: "Tamilnadu",
        url: "https://www.youtube.com/watch?v=pX5VBhaVPas",
      }),
    );
  });

  it("submits edit payload with empty url when cleared", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    renderWithLang(
      <EditModal
        temple={{
          id: "id-3",
          temple: "Arulmigu Kuzhandhai Velappar Thirukkovil",
          location: "Kodaikanal",
          state: "Tamilnadu",
          url: "https://www.youtube.com/watch?v=pX5VBhaVPas",
          house: "விருச்சிகம்",
          planets: ["செ", "குரு"],
        }}
        mode="edit"
        onSave={onSave}
        onCreate={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const urlInput = screen.getByLabelText("YouTube URL", {
      selector: "input",
    });
    await userEvent.clear(urlInput);
    await userEvent.click(screen.getByRole("button", { name: "சேமி" }));

    expect(onSave).toHaveBeenCalledWith(
      "id-3",
      expect.objectContaining({
        url: "",
      }),
    );
  });

  it("allows saving when both rasi and video url are empty", async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);

    renderWithLang(
      <EditModal
        temple={null}
        mode="create"
        onSave={vi.fn()}
        onCreate={onCreate}
        onClose={vi.fn()}
      />,
    );

    await userEvent.type(
      screen.getByLabelText("கோவில்", { selector: "input" }),
      "Arulmigu Test Temple",
    );
    await userEvent.type(
      screen.getByLabelText("இடம்", { selector: "input" }),
      "Madurai",
    );
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "மாநிலம் தேர்வு" }),
      "Tamilnadu",
    );
    await userEvent.click(screen.getByRole("button", { name: "சனி" }));
    await userEvent.click(screen.getByRole("button", { name: "சேர்க்கவும்" }));

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        house: "",
        url: "",
      }),
    );
  });

  it("shows no-change notice in edit mode and closes with OK", async () => {
    const onClose = vi.fn();
    const onSave = vi.fn().mockResolvedValue({ noChanges: true });

    renderWithLang(
      <EditModal
        temple={{
          id: "id-4",
          temple: "Meenakshi Amman Temple",
          location: "Madurai",
          state: "Tamil Nadu",
          house: "மீனம்",
          planets: ["சனி"],
          url: "",
        }}
        mode="edit"
        onSave={onSave}
        onCreate={vi.fn()}
        onClose={onClose}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "சேமி" }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByText("நீங்கள் எந்த மாற்றமும் செய்யவில்லை.")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "சரி" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
