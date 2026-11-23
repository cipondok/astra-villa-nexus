import { describe, expect, it } from "vitest";
import { buildListingInsert, normalizeIndonesianPhone, validateListingSubmission } from "../listingSubmission";

const good = {
  title: "Villa 3 kamar dengan kolam di Canggu",
  description: "Villa siap huni dengan kolam renang pribadi, taman tropis, dapur terbuka dan akses mudah ke pantai Canggu.",
  property_type: "villa",
  listing_type: "sale",
  price: "4500000000",
  bedrooms: "3",
  bathrooms: "2",
  area_sqm: "220",
  location: "Canggu, Badung, Bali",
  city: "Badung",
  state: "Bali",
  images: ["https://x.supabase.co/a.webp", "https://x.supabase.co/b.webp", "https://x.supabase.co/c.webp"],
  contact_phone: "0812-3456-7890",
  relationship: "owner",
  declaration: true,
};
const fields = (over: object) => validateListingSubmission({ ...good, ...over }).map((i) => i.field);

describe("listing submission rules", () => {
  it("accepts a complete submission", () => {
    expect(validateListingSubmission(good)).toEqual([]);
  });
  it("needs at least 3 photos", () => {
    expect(fields({ images: good.images.slice(0, 2) })).toEqual(["images"]);
  });
  it("needs a price above zero", () => {
    expect(fields({ price: "0" })).toEqual(["price"]);
  });
  it("only accepts sale or rent (the database rejects lease)", () => {
    expect(fields({ listing_type: "lease" })).toEqual(["listing_type"]);
  });
  it("needs a description of at least 80 characters", () => {
    expect(fields({ description: "Rumah bagus." })).toEqual(["description"]);
  });
  it("needs the owner declaration ticked", () => {
    expect(fields({ declaration: false })).toEqual(["declaration"]);
  });
  it("needs a valid Indonesian phone number", () => {
    expect(fields({ contact_phone: "12345" })).toEqual(["contact_phone"]);
    expect(normalizeIndonesianPhone("+62 812 3456 7890")).toBe("+6281234567890");
    expect(normalizeIndonesianPhone("081234567890")).toBe("+6281234567890");
  });
});

describe("listing insert payload", () => {
  const row = buildListingInsert(good, { userId: "u1", isAgent: false, relationship: "owner", features: { pool: true } });
  it("always goes in as pending and never sets approval, featured or demo flags", () => {
    expect(row.status).toBe("pending");
    expect(row).not.toHaveProperty("approval_status");
    expect(row).not.toHaveProperty("featured");
    expect(row).not.toHaveProperty("is_demo");
  });
  it("stores the price in both price columns and the first photo as cover", () => {
    expect(row.price).toBe(4_500_000_000);
    expect(row.price_idr).toBe(4_500_000_000);
    expect(row.cover_image).toBe(good.images[0]);
  });
  it("keeps the phone number off the public listing", () => {
    expect(JSON.stringify(row)).not.toContain("0812");
  });
});
