import { describe, expect, it } from "vitest";
import { getReviewInfo, isPubliclyVisible, reviewUpdate } from "../listingReview";

describe("public visibility", () => {
  it("shows only approved, live listings", () => {
    expect(isPubliclyVisible({ approval_status: "approved", status: "active" })).toBe(true);
    expect(isPubliclyVisible({ approval_status: "pending", status: "active" })).toBe(false);
    expect(isPubliclyVisible({ approval_status: "rejected", status: "inactive" })).toBe(false);
    expect(isPubliclyVisible({ approval_status: "approved", status: "inactive" })).toBe(false);
  });
  it("hides sample listings unless samples are switched on", () => {
    expect(isPubliclyVisible({ approval_status: "approved", status: "active", is_demo: true })).toBe(false);
    expect(isPubliclyVisible({ approval_status: "approved", status: "active", is_demo: true }, true)).toBe(true);
  });
});

describe("admin decisions", () => {
  const opts = { reviewerId: "admin-1", now: "2026-11-23T00:00:00Z" };
  it("approve publishes the listing", () => {
    expect(reviewUpdate("approve", opts)).toMatchObject({ approval_status: "approved", status: "active" });
  });
  it("reject takes it offline and needs a reason", () => {
    expect(() => reviewUpdate("reject", opts)).toThrow();
    expect(reviewUpdate("reject", { ...opts, note: "Foto bukan properti ini" })).toMatchObject({ approval_status: "rejected", status: "inactive" });
  });
  it("correction request keeps it hidden and saves the note for the owner", () => {
    const u = reviewUpdate("revision", { ...opts, note: "Tambahkan foto kamar mandi", currentMeta: { submission: { relationship: "owner" } } });
    expect(u).toMatchObject({ approval_status: "revision_requested", status: "pending" });
    expect(u.meta).toMatchObject({ submission: { relationship: "owner" }, review: { note: "Tambahkan foto kamar mandi" } });
  });
  it("unpublish only takes it offline without changing approval", () => {
    const u = reviewUpdate("unpublish", opts);
    expect(u.status).toBe("inactive");
    expect(u).not.toHaveProperty("approval_status");
  });
});

describe("owner status", () => {
  it("asks the owner to resubmit after a correction request", () => {
    const info = getReviewInfo({ approval_status: "revision_requested", status: "pending", meta: { review: { note: "Perbaiki harga" } } });
    expect(info.needsResubmit).toBe(true);
    expect(info.note).toBe("Perbaiki harga");
  });
});
