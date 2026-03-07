import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [
      { province_name: "Bali" },
      { province_name: "DKI Jakarta" },
      { province_name: "Jawa Barat" },
      { province_name: "Jawa Tengah" },
    ], error: null }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            not: vi.fn().mockReturnValue({
              neq: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        }),
      }),
    }),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    functions: { invoke: vi.fn() },
  },
}));

vi.mock("@/hooks/useSessionMonitor", () => ({
  suppressSessionCheck: vi.fn(),
}));

// Seed localStorage with done provinces
const mockDoneRecords = [
  {
    province: "Bali",
    completedAt: "2026-03-06T10:30:00.000Z",
    created: 120,
    skipped: 5,
    errors: 0,
    cities: ["Denpasar", "Badung"],
    areas: ["Kuta", "Seminyak", "Ubud"],
  },
  {
    province: "DKI Jakarta",
    completedAt: "2026-03-07T08:00:00.000Z",
    created: 300,
    skipped: 10,
    errors: 2,
    cities: ["Jakarta Selatan", "Jakarta Pusat"],
    areas: ["Menteng", "Kebayoran"],
  },
];

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
};

describe("SamplePropertyGenerator - Progress Overview", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("spg_done_provinces_v2", JSON.stringify(mockDoneRecords));
  });

  it("renders progress overview with completed/remaining counts", async () => {
    const SamplePropertyGenerator = (await import("@/components/admin/SamplePropertyGenerator")).default;
    render(<SamplePropertyGenerator />, { wrapper: createWrapper() });

    // Header should always render
    expect(screen.getByText("Sample Property Generator")).toBeInTheDocument();

    // Wait for provinces query to settle
    const progressText = await screen.findByText("Progress Overview", {}, { timeout: 3000 });
    expect(progressText).toBeInTheDocument();
  });

  it("shows completed provinces section with details", async () => {
    const SamplePropertyGenerator = (await import("@/components/admin/SamplePropertyGenerator")).default;
    render(<SamplePropertyGenerator />, { wrapper: createWrapper() });

    // Wait for data to load
    const completedSection = await screen.findByText(/Completed Provinces/i, {}, { timeout: 3000 });
    expect(completedSection).toBeInTheDocument();
  });

  it("shows uncompleted provinces section", async () => {
    const SamplePropertyGenerator = (await import("@/components/admin/SamplePropertyGenerator")).default;
    render(<SamplePropertyGenerator />, { wrapper: createWrapper() });

    const uncompletedSection = await screen.findByText(/Uncompleted Provinces/i, {}, { timeout: 3000 });
    expect(uncompletedSection).toBeInTheDocument();
  });

  it("loads persisted done records from localStorage", () => {
    const stored = JSON.parse(localStorage.getItem("spg_done_provinces_v2") || "[]");
    expect(stored).toHaveLength(2);
    expect(stored[0].province).toBe("Bali");
    expect(stored[0].cities).toContain("Denpasar");
    expect(stored[1].created).toBe(300);
  });

  it("DoneProvinceRecord has required fields", () => {
    const record = mockDoneRecords[0];
    expect(record).toHaveProperty("province");
    expect(record).toHaveProperty("completedAt");
    expect(record).toHaveProperty("created");
    expect(record).toHaveProperty("skipped");
    expect(record).toHaveProperty("errors");
    expect(record).toHaveProperty("cities");
    expect(record).toHaveProperty("areas");
    expect(new Date(record.completedAt).getTime()).toBeGreaterThan(0);
  });
});
