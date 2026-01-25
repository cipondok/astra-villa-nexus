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
