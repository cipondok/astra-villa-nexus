import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import DealScoreBadge from "../DealScoreBadge";

describe("DealScoreBadge", () => {
  it("renders null in compact mode when score is null", () => {
    const { container } = render(<DealScoreBadge score={null} compact />);
    expect(container.innerHTML).toBe("");
  });

  it("renders dash placeholder in non-compact mode when score is null", () => {
    const { container } = render(<DealScoreBadge score={null} />);
    expect(container.textContent).toBe("—");
  });

  it("renders the numeric score", () => {
    const { container } = render(<DealScoreBadge score={85} />);
    expect(container.textContent).toContain("85");
  });

  it("renders hot emoji for score >= 85", () => {
    const { container } = render(<DealScoreBadge score={90} />);
    expect(container.textContent).toContain("🔥");
  });

  it("renders strong emoji for score 70-84", () => {
    const { container } = render(<DealScoreBadge score={75} />);
    expect(container.textContent).toContain("💎");
  });

  it("renders stable emoji for score 50-69", () => {
    const { container } = render(<DealScoreBadge score={55} />);
    expect(container.textContent).toContain("📊");
  });

  it("renders caution emoji for score 30-49", () => {
    const { container } = render(<DealScoreBadge score={35} />);
    expect(container.textContent).toContain("⚠️");
  });

  it("renders cold emoji for score < 30", () => {
    const { container } = render(<DealScoreBadge score={15} />);
    expect(container.textContent).toContain("❄️");
  });

  it("has correct aria-label", () => {
    const { container } = render(<DealScoreBadge score={90} />);
    const button = container.querySelector("button");
    expect(button?.getAttribute("aria-label")).toContain("90");
  });

  it("applies compact sizing classes", () => {
    const { container } = render(<DealScoreBadge score={50} compact />);
    const pill = container.querySelector("[class*='text-[9px]']");
    expect(pill).not.toBeNull();
  });
});
