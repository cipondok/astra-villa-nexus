import { describe, expect, it } from "vitest";
import id from "../locales/id";
import en from "../locales/en";

const flatKeys = (obj: Record<string, unknown>, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? flatKeys(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

const english = en as Record<string, any>;
const indonesian = id as Record<string, any>;

describe("owner & agent onboarding texts", () => {
  it.each(["listerOnboarding", "ownerLeads", "propertyEnquiry", "leadInbox"])("Indonesian has every %s text English has", (ns) => {
    expect(flatKeys(indonesian[ns]).sort()).toEqual(flatKeys(english[ns]).sort());
  });

  it("Indonesian onboarding is actually translated", () => {
    expect(indonesian.listerOnboarding.hero.title).toBe("Pasang properti Anda di ASTRA Villa");
    expect(indonesian.listerOnboarding.roles.property_owner.title).toBe("Pemilik properti");
  });
});

describe("lead inbox texts", () => {
  it("Indonesian lead statuses are translated", () => {
    expect(indonesian.leadInbox.status).toEqual({
      new: "Baru", contacted: "Sudah dihubungi", viewing_scheduled: "Jadwal kunjungan",
      negotiation: "Negosiasi", won: "Berhasil", lost: "Batal",
    });
  });
});
