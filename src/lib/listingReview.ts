/**
 * Moderation vocabulary shared by the owner pages and the admin review queue.
 * Server rules live in private.enforce_property_moderation + the properties
 * public SELECT policy; this file only describes them for the UI.
 */

export type ApprovalStatus = "pending" | "approved" | "rejected" | "revision_requested";
export type ReviewDecision = "approve" | "reject" | "revision" | "publish" | "unpublish";

export interface ReviewMeta {
  decision?: ReviewDecision;
  note?: string | null;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface ModeratedListing {
  status?: string | null;
  approval_status?: string | null;
  is_demo?: boolean | null;
  meta?: unknown;
}

/** Same rule as the public RLS policy: approved + live (+ not a sample unless samples are switched on). */
export function isPubliclyVisible(l: ModeratedListing, showDemo = false): boolean {
  return (
    l.approval_status === "approved" &&
    (l.status === "active" || l.status === "published") &&
    (!l.is_demo || showDemo)
  );
}

export function readReviewMeta(meta: unknown): ReviewMeta | null {
  if (!meta || typeof meta !== "object") return null;
  const r = (meta as Record<string, unknown>).review;
  return r && typeof r === "object" ? (r as ReviewMeta) : null;
}

/** The status + listing changes an admin decision writes. Rejections and correction requests need a note. */
export function reviewUpdate(
  decision: ReviewDecision,
  opts: { note?: string; reviewerId: string; currentMeta?: unknown; now?: string },
): { approval_status?: ApprovalStatus; status?: string; meta: Record<string, unknown> } {
  const note = (opts.note ?? "").trim();
  if ((decision === "reject" || decision === "revision") && !note) {
    throw new Error("A note is required when rejecting or requesting corrections.");
  }
  const base = opts.currentMeta && typeof opts.currentMeta === "object" ? { ...(opts.currentMeta as Record<string, unknown>) } : {};
  const meta = {
    ...base,
    review: { decision, note: note || null, reviewed_at: opts.now ?? new Date().toISOString(), reviewed_by: opts.reviewerId },
  };
  switch (decision) {
    case "approve":
    case "publish":
      return { approval_status: "approved", status: "active", meta };
    case "unpublish":
      return { status: "inactive", meta };
    case "reject":
      return { approval_status: "rejected", status: "inactive", meta };
    case "revision":
      return { approval_status: "revision_requested", status: "pending", meta };
  }
}

export interface ReviewInfo {
  key: "live" | "offline" | "pending" | "revision" | "rejected" | "draft" | "demo";
  label: { en: string; id: string };
  tone: "ok" | "neutral" | "warning";
  note: string | null;
  needsResubmit: boolean;
}

export function getReviewInfo(l: ModeratedListing | null | undefined): ReviewInfo {
  const note = readReviewMeta(l?.meta)?.note ?? null;
  const mk = (key: ReviewInfo["key"], en: string, id: string, tone: ReviewInfo["tone"], needsResubmit = false): ReviewInfo =>
    ({ key, label: { en, id }, tone, note, needsResubmit });
  if (!l) return mk("pending", "Waiting for review", "Menunggu tinjauan", "neutral");
  if (l.is_demo) return mk("demo", "Sample listing (DEMO)", "Listing contoh (DEMO)", "neutral");
  if (l.approval_status === "rejected") return mk("rejected", "Rejected", "Ditolak", "warning", true);
  if (l.approval_status === "revision_requested") return mk("revision", "Corrections requested", "Perlu perbaikan", "warning", true);
  if (l.status === "draft") return mk("draft", "Draft (not submitted)", "Draf (belum dikirim)", "neutral");
  if (l.approval_status === "approved") {
    return l.status === "active" || l.status === "published"
      ? mk("live", "Live on the site", "Tayang di situs", "ok")
      : mk("offline", "Approved, offline", "Disetujui, tidak tayang", "neutral");
  }
  return mk("pending", "Waiting for review", "Menunggu tinjauan", "neutral");
}
