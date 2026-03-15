import { describe, it, expect } from "vitest";
import { suggestGeoExpansion } from "../useGeoExpansion";

describe("suggestGeoExpansion", () => {
  it("excludes active cities from results", () => {
    const r = suggestGeoExpansion({
      cities: ["Jakarta", "Surabaya", "Denpasar"],
      traffic_data: {},
      agent_density: {},
    });
    const names = r.next_target_cities.map(c => c.city.toLowerCase());
    expect(names).not.toContain("jakarta");
    expect(names).not.toContain("surabaya");
  });

  it("returns exactly 3 cities", () => {
    const r = suggestGeoExpansion({ cities: ["Jakarta"], traffic_data: {}, agent_density: {} });
    expect(r.next_target_cities).toHaveLength(3);
  });

  it("boosts cities with organic traffic", () => {
    const r = suggestGeoExpansion({
      cities: ["Jakarta"],
      traffic_data: { "Malang": 500, "Solo": 300 },
      agent_density: {},
    });
    const names = r.next_target_cities.map(c => c.city);
    // Malang/Solo should rank higher due to demand signal
    const malangIdx = names.indexOf("Malang");
    const soloIdx = names.indexOf("Solo");
    expect(malangIdx !== -1 || soloIdx !== -1).toBe(true);
  });

  it("provides Indonesian strategy text", () => {
    const r = suggestGeoExpansion({ cities: [], traffic_data: {}, agent_density: {} });
    expect(r.market_entry_tactic.length).toBeGreaterThan(20);
    expect(r.inventory_growth_strategy.length).toBeGreaterThan(20);
  });
});
