import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DealScoreBadge from "../DealScoreBadge";

describe("DealScoreBadge", () => {
  it("renders null in compact mode when score is null", () => {
    const { container } = render(<DealScoreBadge score={null} compact />);
    expect(container.innerHTML).toBe("");
  });

  it("renders dash placeholder in non-compact mode when score is null", () => {
    render(<DealScoreBadge score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders the numeric score", () => {
    render(<DealScoreBadge score={85} />);
    expect(screen.getByText("85")).toBeInTheDocument();
  });

  it("renders hot emoji for score >= 85", () => {
    render(<DealScoreBadge score={90} />);
    expect(screen.getByText("🔥")).toBeInTheDocument();
  });

  it("renders strong emoji for score 70-84", () => {
    render(<DealScoreBadge score={75} />);
    expect(screen.getByText("💎")).toBeInTheDocument();
  });

  it("renders stable emoji for score 50-69", () => {
    render(<DealScoreBadge score={55} />);
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("renders caution emoji for score 30-49", () => {
    render(<DealScoreBadge score={35} />);
    expect(screen.getByText("⚠️")).toBeInTheDocument();
  });

  it("renders cold emoji for score < 30", () => {
    render(<DealScoreBadge score={15} />);
    expect(screen.getByText("❄️")).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<DealScoreBadge score={90} />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      expect.stringContaining("90")
    );
  });

  it("applies compact sizing classes", () => {
    const { container } = render(<DealScoreBadge score={50} compact />);
    const pill = container.querySelector(".text-\\[9px\\]");
    expect(pill).toBeInTheDocument();
  });
});
