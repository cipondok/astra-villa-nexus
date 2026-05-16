import { getEdgeFunctionStatus } from "@/lib/supabaseFunctionErrors";

const STORAGE_KEY = "ai_disabled_until";

function now() {
  return Date.now();
}

export function getAiDisabledUntil(): number {
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : 0;
}

export function isAiTemporarilyDisabled(): boolean {
  return getAiDisabledUntil() > now();
}

/**
 * When we detect 402/429/503, pause AI calls for a short time to avoid
 * repeated failures and blank-screen cascades.
 */
export function markAiTemporarilyDisabled(ms: number) {
  localStorage.setItem(STORAGE_KEY, String(now() + ms));
}

export function markAiTemporarilyDisabledFromError(err: unknown) {
  const status = getEdgeFunctionStatus(err);
  if (status === 402) markAiTemporarilyDisabled(10 * 60 * 1000); // 10 min
  if (status === 429) markAiTemporarilyDisabled(60 * 1000); // 1 min
  if (status === 503) markAiTemporarilyDisabled(60 * 1000); // 1 min
}
