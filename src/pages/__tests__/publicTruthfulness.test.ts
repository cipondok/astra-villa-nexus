import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

describe("public pages make no unbacked claims", () => {
  it("About page has no hard-coded marketing statistics", () => {
    const s = read("src/pages/About.tsx");
    for (const n of ["10,000+", "5,000+", "50+", "15+"]) expect(s).not.toContain(`"${n}"`);
  });
  it("Locations page shows no invented inventory, ROI or partner figures", () => {
    const s = read("src/pages/Locations.tsx");
    for (const n of ["240+", "180+", "60+", "11.4%", "8.2%", "+34%", '"26"', '"14"']) expect(s).not.toContain(n);
  });
  it("Help page shows no placeholder phone number", () => {
    expect(read("src/pages/Help.tsx")).not.toContain("555");
  });
  it("New projects page never falls back to sample projects", () => {
    const s = read("src/pages/NewProjects.tsx");
    expect(s).not.toContain("demoProjects");
    expect(s).toContain("return data ?? [];");
  });
  it("Services copy makes no 100% guarantee, insurance or 24/7 claim", () => {
    for (const l of ["en", "id"]) {
      const s = read(`src/i18n/locales/${l}.ts`);
      const i = s.indexOf("verifiedVendors:");
      const seg = s.slice(i, s.indexOf("support247Desc:", i) + 120);
      expect(seg).not.toMatch(/100%|24\/7|insurance|asuransi/i);
    }
  });
  it("Compliance page does not claim KYC/AML or active escrow", () => {
    const s = read("src/pages/legal/Compliance.tsx");
    expect(s).not.toMatch(/KYC|AML|licensed payment partners/);
    expect(s).toContain("not active on the Platform yet");
  });
});

describe("About/Locations/Projects honesty", () => {
  const read = (p: string) => require("fs").readFileSync(require("path").resolve(__dirname, p), "utf8");
  it("About copy makes no escrow, verified-listing or on-chain claims", () => {
    for (const f of ["../../i18n/locales/en.ts", "../../i18n/locales/id.ts"]) {
      const s = read(f);
      expect(s).not.toMatch(/9-state lifecycle|Verified property listings|Verified vendor profiles|recorded transparently on-chain|siklus 9 tahap/);
    }
  });
  it("Locations no longer claims AI-orchestrated or invitation-only inventory", () => {
    expect(read("../Locations.tsx")).not.toMatch(/orchestrated by our AI|by invitation/);
  });
  it("Projects shows a coming-soon state when nothing is listed", () => {
    expect(read("../NewProjects.tsx")).toContain("New projects coming soon");
  });
});
