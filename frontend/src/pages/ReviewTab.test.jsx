import { render, screen } from "@testing-library/react";
import ReviewTab from "./ReviewTab";
import { LangProvider } from "../context/LangContext";

function renderWithLang(ui) {
  return render(<LangProvider>{ui}</LangProvider>);
}

describe("ReviewTab", () => {
  it("shows queued video link when review payload includes url", () => {
    renderWithLang(
      <ReviewTab
        reviews={[
          {
            id: "r-1",
            action: "add",
            status: "pending",
            payload: {
              temple: "Temple With Video",
              location: "Kodaikanal",
              state: "Tamilnadu",
              url: "https://www.youtube.com/watch?v=pX5VBhaVPas",
              house: "விருச்சிகம்",
              planets: ["செ", "குரு"],
            },
            createdBy: { initials: "TR" },
            approvals: [],
          },
        ]}
        loading={false}
        error={null}
        currentUser={{ id: "u-1", initials: "RA" }}
        onApprove={async () => {}}
        onDelete={async () => {}}
      />,
    );

    const link = screen.getByRole("link", { name: /watch this video/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=pX5VBhaVPas",
    );
  });
});
