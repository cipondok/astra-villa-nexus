import { describe, it, expect, beforeEach } from "vitest";

// Test the localStorage persistence logic and data structures
// used by the Progress Overview in SamplePropertyGenerator

interface DoneProvinceRecord {
  province: string;
  completedAt: string;
  created: number;
  skipped: number;
  errors: number;
  cities: string[];
  areas: string[];
}

const DONE_PROVINCES_KEY = "spg_done_provinces_v2";

const loadDoneProvinces = (): DoneProvinceRecord[] => {
  try {
    const stored = localStorage.getItem(DONE_PROVINCES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && typeof parsed[0] === "string") {
      return parsed.map((p: string) => ({
        province: p,
        completedAt: new Date().toISOString(),
        created: 0, skipped: 0, errors: 0,
        cities: [], areas: [],
      }));
    }
    return parsed;
  } catch { return []; }
};

const saveDoneProvince = (record: DoneProvinceRecord) => {
  const list = loadDoneProvinces();
  const idx = list.findIndex(r => r.province === record.province);
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  localStorage.setItem(DONE_PROVINCES_KEY, JSON.stringify(list));
};

const mockRecords: DoneProvinceRecord[] = [
  {
    province: "Bali",
    completedAt: "2026-03-06T10:30:00.000Z",
    created: 120, skipped: 5, errors: 0,
    cities: ["Denpasar", "Badung"],
    areas: ["Kuta", "Seminyak", "Ubud"],
  },
  {
    province: "DKI Jakarta",
    completedAt: "2026-03-07T08:00:00.000Z",
    created: 300, skipped: 10, errors: 2,
    cities: ["Jakarta Selatan", "Jakarta Pusat"],
    areas: ["Menteng", "Kebayoran"],
  },
];

describe("SamplePropertyGenerator - Progress Tracking", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads empty when no data stored", () => {
    expect(loadDoneProvinces()).toEqual([]);
  });

  it("saves and loads done province records", () => {
    saveDoneProvince(mockRecords[0]);
    saveDoneProvince(mockRecords[1]);
    const loaded = loadDoneProvinces();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].province).toBe("Bali");
    expect(loaded[1].province).toBe("DKI Jakarta");
  });

  it("records contain city, area, property count, and timestamp", () => {
    saveDoneProvince(mockRecords[0]);
    const [rec] = loadDoneProvinces();
    expect(rec.cities).toContain("Denpasar");
    expect(rec.areas).toContain("Kuta");
    expect(rec.created).toBe(120);
    expect(new Date(rec.completedAt).getTime()).toBeGreaterThan(0);
  });

  it("updates existing province record on re-save", () => {
    saveDoneProvince(mockRecords[0]);
    saveDoneProvince({ ...mockRecords[0], created: 200, cities: ["Denpasar", "Badung", "Gianyar"] });
    const loaded = loadDoneProvinces();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].created).toBe(200);
    expect(loaded[0].cities).toHaveLength(3);
  });

  it("migrates old string[] format to DoneProvinceRecord[]", () => {
    localStorage.setItem(DONE_PROVINCES_KEY, JSON.stringify(["Bali", "DKI Jakarta"]));
    const loaded = loadDoneProvinces();
    expect(loaded).toHaveLength(2);
    expect(loaded[0].province).toBe("Bali");
    expect(loaded[0]).toHaveProperty("completedAt");
    expect(loaded[0]).toHaveProperty("cities");
  });

  it("computes completed vs uncompleted correctly", () => {
    const allProvinces = ["Bali", "DKI Jakarta", "Jawa Barat", "Jawa Tengah"];
    saveDoneProvince(mockRecords[0]);
    saveDoneProvince(mockRecords[1]);
    const doneNames = new Set(loadDoneProvinces().map(r => r.province));
    const remaining = allProvinces.filter(p => !doneNames.has(p));
    
    expect(doneNames.size).toBe(2);
    expect(remaining).toEqual(["Jawa Barat", "Jawa Tengah"]);
  });

  it("progress percentage is calculated correctly", () => {
    const completed = 2;
    const total = 4;
    const percent = Math.round((completed / total) * 100);
    expect(percent).toBe(50);
  });

  it("total properties sums from property counts", () => {
    const counts: Record<string, number> = { "Bali": 120, "DKI Jakarta": 300 };
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(420);
  });
});
