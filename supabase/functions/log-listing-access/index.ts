import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LISTING_ROLES = [
  "agent",
  "property_owner",
  "vendor",
  "developer",
  "admin",
  "super_admin",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const correlationIdFallback = crypto.randomUUID();

  try {
    const body = await req.json().catch(() => ({}));
    const correlationId =
      typeof body.correlation_id === "string" &&
      /^[0-9a-f-]{36}$/i.test(body.correlation_id)
        ? body.correlation_id
        : correlationIdFallback;

    const route = typeof body.route === "string" ? body.route : "/add-property";
    const clientState =
      typeof body.access_state === "string" ? body.access_state : "unknown";

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Re-derive identity and roles server-side; never trust the client payload.
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    let userId: string | null = null;

    if (token) {
      const { data } = await admin.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    let detectedRoles: string[] = [];
    let profileRole: string | null = null;

    if (userId) {
      const [{ data: roleRows }, { data: profile }] = await Promise.all([
        admin.from("user_roles").select("role").eq("user_id", userId),
        admin.from("profiles").select("role").eq("id", userId).maybeSingle(),
      ]);
      detectedRoles = (roleRows ?? []).map((r: { role: string }) => r.role);
      profileRole = (profile as { role?: string } | null)?.role ?? null;
    }

    const isAdmin =
      detectedRoles.includes("admin") ||
      detectedRoles.includes("super_admin") ||
      profileRole === "admin" ||
      profileRole === "super_admin";

    const allowed =
      !!userId &&
      (isAdmin ||
        detectedRoles.some((r) => LISTING_ROLES.includes(r)) ||
        (profileRole ? LISTING_ROLES.includes(profileRole) : false));

    const accessState = !userId ? "guest" : allowed ? "allowed" : "upgrade_required";

    let denialReason: string | null = null;
    if (accessState === "guest") denialReason = "not_authenticated";
    else if (accessState === "upgrade_required") {
      denialReason =
        detectedRoles.length === 0 && !profileRole
          ? "no_roles_assigned"
          : "role_not_permitted";
    }

    // Only denied attempts are persisted.
    if (denialReason) {
      const forwarded = req.headers.get("x-forwarded-for") ?? "";
      const { error } = await admin.from("listing_access_logs").insert({
        correlation_id: correlationId,
        user_id: userId,
        route,
        access_state: accessState,
        denial_reason: denialReason,
        required_roles: LISTING_ROLES,
        detected_roles: detectedRoles,
        profile_role: profileRole,
        is_admin: isAdmin,
        authenticated: !!userId,
        ip_address: forwarded.split(",")[0]?.trim() || null,
        user_agent: req.headers.get("user-agent"),
      });
      if (error) console.error("insert failed", correlationId, error.message);
    }

    if (clientState !== accessState) {
      console.warn(
        `[listing-access] client/server mismatch ${correlationId}: client=${clientState} server=${accessState}`,
      );
    }

    return new Response(
      JSON.stringify({
        correlation_id: correlationId,
        access_state: accessState,
        denial_reason: denialReason,
        required_roles: LISTING_ROLES,
        detected_roles: detectedRoles,
        logged: !!denialReason,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("log-listing-access error", correlationIdFallback, e);
    return new Response(
      JSON.stringify({ error: "log_failed", correlation_id: correlationIdFallback }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
