import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Supabase edge function invoke errors can be FunctionsHttpError with a Response in `context`.
 * We avoid depending on internal classes and just extract what we need.
 */
export function getEdgeFunctionStatus(err: unknown): number | undefined {
  const anyErr = err as any;
  const ctx = anyErr?.context;

  // supabase-js FunctionsHttpError
  const statusFromContext = typeof ctx?.status === "number" ? (ctx.status as number) : undefined;
  if (statusFromContext) return statusFromContext;

  // sometimes callers pass the Response itself
  const statusFromErr = typeof anyErr?.status === "number" ? (anyErr.status as number) : undefined;
  return statusFromErr;
}

/**
 * Some edge functions may return HTTP 200 even when the upstream provider failed
 * (e.g. 402/429/503), to avoid preview blank-screen overlays.
 * In those cases, the function returns JSON: { status: number, error: string }.
 */
export function throwIfEdgeFunctionReturnedError(data: unknown): void {
  const anyData = data as any;
  const status = typeof anyData?.status === "number" ? (anyData.status as number) : undefined;
  if (status && status >= 400) {
    const msg = typeof anyData?.error === "string" && anyData.error.trim()
      ? anyData.error
      : "Edge function error";
    throw Object.assign(new Error(msg), { status });
  }
}

export function getEdgeFunctionUserMessage(err: unknown): {
  title: string;
  description: string;
  variant?: "default" | "destructive";
} {
  const status = getEdgeFunctionStatus(err);

  if (status === 402) {
    return {
      title: "AI credits required",
      description: "AI is currently unavailable because your workspace is out of credits. Please add credits and try again.",
      variant: "destructive",
    };
  }

  if (status === 429) {
    return {
      title: "Too many requests",
      description: "AI is rate-limited right now. Please wait a moment and try again.",
      variant: "destructive",
    };
  }

  if (status === 503) {
    return {
      title: "AI temporarily unavailable",
      description: "The AI service is temporarily unavailable. Please try again in a moment.",
      variant: "destructive",
    };
  }

  // Generic fallback
  const message = (err as PostgrestError as any)?.message || (err as any)?.message;
  return {
    title: "AI error",
    description: typeof message === "string" && message.trim() ? message : "Failed to contact AI. Please try again.",
    variant: "destructive",
  };
}
