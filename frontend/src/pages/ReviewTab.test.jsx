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
              significance:
                "A long note, comma-separated, symbols @#$%^&*(), and more.",
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
        contributorInitials={["TR", "RR", "RA", "MA"]}
        onDelete={async () => {}}
      />,
    );

    const link = screen.getByRole("link", { name: /watch this video/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=pX5VBhaVPas",
    );
    expect(
      screen.getByText(
        "முக்கியத்துவம்: A long note, comma-separated, symbols @#$%^&*(), and more.",
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText("RA")).not.toBeInTheDocument();
    expect(screen.getByText("TR")).toBeInTheDocument();
    expect(screen.getByText("RR")).toBeInTheDocument();
    expect(screen.getByText("MA")).toBeInTheDocument();
  });

  it("shows only other contributors with eyes/ticks for pending/approved", () => {
    const { container } = renderWithLang(
      <ReviewTab
        reviews={[
          {
            id: "r-2",
            action: "add",
            status: "pending",
            payload: {
              temple: "Temple Review Flow",
              location: "Trichy",
              state: "Tamilnadu",
              house: "மேஷம்",
              planets: ["சூரி"],
            },
            createdBy: { initials: "TR" },
            approvals: [{ userId: "u-rr", initials: "RR" }],
          },
        ]}
        loading={false}
        error={null}
        currentUser={{ id: "u-tr", initials: "TR", role: "contributor" }}
        contributorInitials={["TR", "RR", "RA", "MA"]}
        onDelete={async () => {}}
      />,
    );

    expect(screen.queryByRole("button", { name: "TR" })).not.toBeInTheDocument();

    const chipInitials = Array.from(
      container.querySelectorAll(
        ".review-item__approver-text .review-item__approver-initial",
      ),
    ).map((node) => node.textContent?.trim());
    expect(chipInitials).toEqual(["RR", "RA", "MA"]);

    const chipIndicators = Array.from(
      container.querySelectorAll(
        ".review-item__approver-text .review-item__approver-indicator",
      ),
    ).map((node) => node.textContent?.trim());
    expect(chipIndicators).toEqual(["✓✓", "👀", "👀"]);
  });
});
