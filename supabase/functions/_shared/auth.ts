// Shared server-side access checks for edge functions.
// Never trust client-decoded JWT claims: every user is verified with Supabase Auth.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const ADMIN_ROLES = ["admin", "super_admin"];

export interface AuthContext {
  /** Verified user id, or null for trusted internal (cron/service) calls. */
  userId: string | null;
  isAdmin: boolean;
  /** True when the call came from the scheduler or another server function. */
  isInternal: boolean;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

let _admin: SupabaseClient | null = null;
export function serviceClient(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return _admin;
}

function bearer(req: Request): string | null {
  const h = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!h || !h.toLowerCase().startsWith("bearer ")) return null;
  const t = h.slice(7).trim();
  return t || null;
}

/** Scheduler / server-to-server call: cron secret header (env or vault) or the service role key. */
export async function isInternalCall(req: Request): Promise<boolean> {
  const token = bearer(req);
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (token && service && token === service) return true;
  const cron = req.headers.get("x-cron-secret");
  if (!cron) return false;
  const envSecrets = [Deno.env.get("CRON_SECRET"), Deno.env.get("INTERNAL_SECRET")].filter(
    (s): s is string => !!s,
  );
  if (envSecrets.includes(cron)) return true;
  if (cron.length < 32) return false;
  const { data, error } = await serviceClient().rpc("verify_edge_cron_secret", { p_secret: cron });
  return !error && data === true;
}

/** Returns the verified user id from the Authorization header, or null. */
export async function getVerifiedUserId(req: Request): Promise<string | null> {
  const token = bearer(req);
  if (!token) return null;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (anonKey && token === anonKey) return null;
  const { data, error } = await serviceClient().auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

export async function userIsAdmin(userId: string): Promise<boolean> {
  const { data } = await serviceClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ADMIN_ROLES)
    .eq("is_active", true)
    .limit(1);
  return !!data && data.length > 0;
}

export async function getAuthContext(req: Request): Promise<AuthContext> {
  if (await isInternalCall(req)) return { userId: null, isAdmin: true, isInternal: true };
  const userId = await getVerifiedUserId(req);
  if (!userId) return { userId: null, isAdmin: false, isInternal: false };
  return { userId, isAdmin: await userIsAdmin(userId), isInternal: false };
}

/** Requires a signed-in user (internal calls are also allowed). */
export async function requireUser(req: Request): Promise<AuthContext> {
  const ctx = await getAuthContext(req);
  if (!ctx.isInternal && !ctx.userId) throw new HttpError(401, "Authentication required");
  return ctx;
}

/** Requires a signed-in user and returns their id (internal calls rejected). */
export async function requireUserId(req: Request): Promise<string> {
  const userId = await getVerifiedUserId(req);
  if (!userId) throw new HttpError(401, "Authentication required");
  return userId;
}

/** Requires an admin user or a trusted internal call. */
export async function requireAdmin(req: Request): Promise<AuthContext> {
  const ctx = await getAuthContext(req);
  if (ctx.isInternal || ctx.isAdmin) return ctx;
  throw new HttpError(ctx.userId ? 403 : 401, ctx.userId ? "Admin access required" : "Authentication required");
}

/** Ensures the caller acts only on their own records unless admin/internal. */
export function assertSelfOrAdmin(ctx: AuthContext, targetUserId: string | null | undefined): string {
  if (ctx.isInternal || ctx.isAdmin) {
    const id = targetUserId || ctx.userId;
    if (!id) throw new HttpError(400, "user_id required");
    return id;
  }
  if (!ctx.userId) throw new HttpError(401, "Authentication required");
  if (targetUserId && targetUserId !== ctx.userId) throw new HttpError(403, "Forbidden");
  return ctx.userId;
}

export function errorResponse(err: unknown, headers: Record<string, string> = corsHeaders): Response {
  if (err instanceof HttpError) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: err.status,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
  console.error("Unhandled error:", err instanceof Error ? err.message : err);
  return new Response(JSON.stringify({ error: "Internal server error" }), {
    status: 500,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

/** Keeps only user/assistant chat turns with bounded string content. */
export function sanitizeChatMessages(raw: unknown, maxMessages = 30, maxLen = 8000) {
  if (!Array.isArray(raw)) return [] as { role: "user" | "assistant"; content: string }[];
  return raw
    .filter((m) => m && typeof m === "object" && typeof (m as any).content === "string")
    .map((m: any) => ({
      role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: String(m.content).slice(0, maxLen),
    }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-maxMessages);
}

/** Masks an email for logs: j***@d***.com */
export function maskEmail(email: unknown): string {
  if (typeof email !== "string" || !email.includes("@")) return "[redacted]";
  const [u, d] = email.split("@");
  const dot = d.lastIndexOf(".");
  return `${u.slice(0, 1)}***@${d.slice(0, 1)}***${dot > 0 ? d.slice(dot) : ""}`;
}
