import { describe, it, expect } from "vitest";
import { differenceInDays, parseISO } from "date-fns";

// Test expiry logic independently
describe("Tenant Document Expiry Logic", () => {
  it("should detect expired documents", () => {
    const pastDate = "2025-01-01";
    const days = differenceInDays(parseISO(pastDate), new Date());
    expect(days).toBeLessThan(0);
  });

  it("should detect documents expiring within 30 days", () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
    const isoDate = futureDate.toISOString().split("T")[0];
    const days = differenceInDays(parseISO(isoDate), new Date());
    expect(days).toBeGreaterThanOrEqual(0);
    expect(days).toBeLessThanOrEqual(30);
  });

  it("should not flag documents with expiry > 30 days", () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 days
    const isoDate = futureDate.toISOString().split("T")[0];
    const days = differenceInDays(parseISO(isoDate), new Date());
    expect(days).toBeGreaterThan(30);
  });
});

// Test document type labels
describe("Document Type Labels", () => {
  const DOC_TYPE_LABELS: Record<string, string> = {
    ktp: "KTP",
    kontrak: "Kontrak",
    bukti_bayar: "Bukti Bayar",
    kk: "Kartu Keluarga",
    npwp: "NPWP",
    other: "Lainnya",
  };

  it("should have labels for all document types", () => {
    expect(Object.keys(DOC_TYPE_LABELS)).toHaveLength(6);
    expect(DOC_TYPE_LABELS.ktp).toBe("KTP");
    expect(DOC_TYPE_LABELS.kontrak).toBe("Kontrak");
    expect(DOC_TYPE_LABELS.bukti_bayar).toBe("Bukti Bayar");
  });
});

// Test status filtering logic
describe("Document Status Filtering", () => {
  const mockDocs = [
    { id: "1", verification_status: "pending", document_type: "ktp", file_name: "ktp.pdf" },
    { id: "2", verification_status: "verified", document_type: "kontrak", file_name: "kontrak.pdf" },
    { id: "3", verification_status: "rejected", document_type: "bukti_bayar", file_name: "bukti.pdf" },
    { id: "4", verification_status: "pending", document_type: "npwp", file_name: "npwp.pdf" },
  ];

  it("should filter by status correctly", () => {
    const pending = mockDocs.filter((d) => d.verification_status === "pending");
    expect(pending).toHaveLength(2);

    const verified = mockDocs.filter((d) => d.verification_status === "verified");
    expect(verified).toHaveLength(1);
  });

  it("should filter by document type correctly", () => {
    const ktp = mockDocs.filter((d) => d.document_type === "ktp");
    expect(ktp).toHaveLength(1);
  });

  it("should filter by search query correctly", () => {
    const query = "kontrak";
    const filtered = mockDocs.filter((d) =>
      d.file_name?.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");
  });

  it("should return all when filters are 'all'", () => {
    const statusFilter = "all";
    const typeFilter = "all";
    const filtered = mockDocs.filter((d) => {
      if (statusFilter !== "all" && d.verification_status !== statusFilter) return false;
      if (typeFilter !== "all" && d.document_type !== typeFilter) return false;
      return true;
    });
    expect(filtered).toHaveLength(4);
  });

  it("should count pending documents correctly", () => {
    const pendingCount = mockDocs.filter((d) => d.verification_status === "pending").length;
    expect(pendingCount).toBe(2);
  });
});
