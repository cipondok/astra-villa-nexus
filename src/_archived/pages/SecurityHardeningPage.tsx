import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Lock, Key, Eye, FileCheck, AlertTriangle, UserCheck,
  ChevronDown, Search, Fingerprint, Database, Server, Layers,
  RefreshCw, Activity, CheckCircle2, Ban, ShieldAlert, ShieldCheck,
  Globe, HardDrive, Zap, Hash, Clock, ArrowRight, Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type Severity = 'critical' | 'high' | 'medium';
type Status = 'enforced' | 'active' | 'planned';

interface Control {
  name: string;
  description: string;
  implementation: string;
  severity: Severity;
  status: Status;
  techDetails: string[];
}

interface SecurityLayer {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Shield;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  controls: Control[];
}

const SEVERITY_STYLES: Record<Severity, { cls: string; label: string }> = {
  critical: { cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30', label: 'Critical' },
  high: { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'High' },
  medium: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Medium' },
};

const STATUS_STYLES: Record<Status, { cls: string; label: string; icon: typeof CheckCircle2 }> = {
  enforced: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', label: 'Enforced', icon: ShieldCheck },
  active: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Active', icon: CheckCircle2 },
  planned: { cls: 'text-muted-foreground bg-muted/10 border-border/30', label: 'Planned', icon: Clock },
};

const LAYERS: SecurityLayer[] = [
  {
    id: 'auth', title: 'Authentication Security', subtitle: 'JWT sessions, token rotation, and multi-factor',
    icon: Key, accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    controls: [
      {
        name: 'Secure JWT Session Handling',
        description: 'All sessions use signed JWTs with claims-based verification via getClaims(). Tokens validated server-side in every Edge Function.',
        implementation: 'supabase.auth.getClaims(token) in Edge Functions',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'verify_jwt = false in config.toml; manual validation via getClaims()',
          'JWT claims include sub, email, role, exp — no sensitive data in payload',
          'Authorization header required: Bearer <token> on all protected endpoints',
          'Token expiry enforced at 1h with automatic refresh cycle',
        ],
      },
      {
        name: 'Refresh Token Rotation',
        description: 'Supabase Auth automatically rotates refresh tokens on each use, preventing token replay attacks.',
        implementation: 'Supabase Auth built-in + onAuthStateChange listener',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'onAuthStateChange set BEFORE getSession() to prevent race conditions',
          'Refresh tokens are single-use — reuse triggers automatic session invalidation',
          'Session heartbeat Edge Function runs every 5 minutes to validate liveness',
          '30-minute inactivity timeout with 5-minute grace period via user_sessions table',
        ],
      },
      {
        name: 'Browser Fingerprinting & Session Tracking',
        description: 'Sessions linked to browser fingerprint in user_sessions table. Detects session hijacking via device mismatch.',
        implementation: 'user_sessions table + fingerprint comparison',
        severity: 'high', status: 'enforced',
        techDetails: [
          'Fingerprint hash stored on login — compared on each session refresh',
          'Mismatched fingerprint triggers forced re-authentication',
          'IP address and user agent logged per session for audit',
          'Concurrent session limit configurable per role',
        ],
      },
      {
        name: 'Account Lockout Protection',
        description: 'Brute-force prevention via account_lockouts table. Locks accounts after 5 failed attempts.',
        implementation: 'account_lockouts table + IP tracking',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'Failed attempts tracked per email + IP combination',
          'Lock duration: 15 minutes after 5 failures, escalating on repeat',
          'Locked accounts return generic error (no user enumeration)',
          'Admin can manually unlock via admin dashboard',
        ],
      },
      {
        name: 'Leaked Password Protection',
        description: 'Passwords checked against known breach databases during signup and password change flows.',
        implementation: 'Supabase Auth leaked password detection',
        severity: 'high', status: 'enforced',
        techDetails: [
          'HaveIBeenPwned API integration for password breach checking',
          'Blocks registration with compromised passwords',
          'Enforced on both signup and password reset flows',
        ],
      },
    ],
  },
  {
    id: 'rbac', title: 'Role Permission Enforcement', subtitle: 'Granular RBAC with server-side validation',
    icon: Users, accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    controls: [
      {
        name: 'Granular Permission System (12 Roles)',
        description: 'Fine-grained permissions managed via role_permissions table. 12 participant types: Admin, Agent, Developer, Investor, Owner, Buyer, Tenant, Legal Consultant, Service Provider, Notary, Appraiser, Bank Partner.',
        implementation: 'role_permissions table + has_permission() SQL function',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'Permissions stored in separate role_permissions table (never on profiles)',
          'has_permission(user_id, permission_name) — SECURITY DEFINER function',
          'Frontend: usePermissions hook + PermissionGate component',
          'Permissions include: manage_listings, revenue_analytics, document_verify, etc.',
        ],
      },
      {
        name: 'Edge Function Authorization Middleware',
        description: 'Every protected Edge Function validates JWT claims and checks role permissions before processing requests.',
        implementation: 'getClaims() + has_role() in Edge Functions',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'NO_PROPERTY_ID_MODES whitelist for global analysis endpoints',
          'Public read-only analysis modes: price_forecast, similar_properties, etc.',
          'Admin-only modes validated via admin_users table lookup',
          'Dual payload support: snake_case (user_id) and camelCase (userId)',
        ],
      },
      {
        name: 'Document Access by Transaction Ownership',
        description: 'Legal documents restricted to transaction participants only. RLS enforces ownership at database level.',
        implementation: 'RLS policies on document_signatures + document_audit_trail',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'document_signatures: auth.uid() must match signer_id or document owner',
          'document_audit_trail: immutable log, insert-only for participants',
          'transaction-documents bucket: private, RLS on storage.objects',
          'Admin override only via SECURITY DEFINER functions (audited)',
        ],
      },
      {
        name: 'Developer Dashboard Data Isolation',
        description: 'Developer users can only view analytics for their own projects. Cross-developer data access prevented at RLS level.',
        implementation: 'RLS: auth.uid() = developer_id on all developer tables',
        severity: 'high', status: 'enforced',
        techDetails: [
          'developer_projects, developer_units: scoped to developer_id',
          'Fund and hedging tables: owner-scoped with investment_id chain',
          'Admin views use SECURITY DEFINER for cross-developer aggregation',
          'API endpoints validate developer ownership before returning data',
        ],
      },
      {
        name: 'UI Guard + Server Enforcement Separation',
        description: 'Frontend guards (AdminOnlyRoute, ProtectedRoute) are UX helpers only. All authorization enforced at Edge Function and RLS layers.',
        implementation: 'ProtectedRoute component + RLS + Edge Function validation',
        severity: 'high', status: 'enforced',
        techDetails: [
          'AdminOnlyRoute redirects non-admins — but data never exposed without RLS',
          'safeStorage.ts rejects script injection patterns in localStorage',
          'Never check admin status via localStorage — always server-validated',
          'Role checks in UI are purely navigational convenience',
        ],
      },
    ],
  },
  {
    id: 'data', title: 'Data Protection', subtitle: 'Encryption, storage policies, and access control',
    icon: Database, accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    controls: [
      {
        name: 'Sensitive Field Encryption (PGP)',
        description: 'Phone numbers, financial data, and API keys encrypted at rest using pgp_sym_encrypt with Supabase Vault.',
        implementation: 'encrypt_api_key() / decrypt_api_key() + Vault',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'encrypt_api_key(text) → returns "enc:" prefixed ciphertext',
          'decrypt_api_key(text) → handles both "enc:" and legacy "plain:" prefixes',
          'Encryption key stored in Supabase Vault (not in code or env)',
          'Migration path for legacy unencrypted data with backward compatibility',
        ],
      },
      {
        name: 'Storage Bucket Security Policies',
        description: 'Private buckets for sensitive documents. Public buckets only for property images. RLS on all storage.objects.',
        implementation: 'storage.buckets + RLS policies on storage.objects',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'transaction-documents: private bucket, owner-only access',
          'property-images: public bucket, agent/owner upload only',
          'Upload policies: auth.uid()::text = (storage.foldername(name))[1]',
          'No public access to legal, financial, or identity documents',
        ],
      },
      {
        name: 'RLS Hardening Standards',
        description: 'All tables enforce RLS. No permissive "true" write policies. Views use security_invoker=on.',
        implementation: 'ALTER TABLE ... ENABLE ROW LEVEL SECURITY on all tables',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'USING(true) only for public read-only data (property listings)',
          'Write policies always require auth.uid() = owner column',
          'All views created WITH (security_invoker=on)',
          'Functions SET search_path = public to prevent schema injection',
        ],
      },
      {
        name: 'SQL Injection Prevention',
        description: 'No raw SQL execution. All queries use typed Supabase client APIs with parameterized inputs.',
        implementation: 'Supabase SDK typed queries + input validation',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'Never execute arbitrary SQL: no supabase.rpc("execute_sql")',
          'Edge Functions use typed supabase client with parameter binding',
          'User input validated and sanitized before any database operation',
          'DOMPurify for HTML content sanitization on frontend',
        ],
      },
    ],
  },
  {
    id: 'transaction', title: 'Transaction Safety', subtitle: 'Audit trails, rate limiting, and anomaly detection',
    icon: FileCheck, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    controls: [
      {
        name: 'Immutable Audit Trail',
        description: 'All offer changes, price edits, document signatures, and permission changes logged to immutable audit tables.',
        implementation: 'document_audit_trail + activity_logs tables',
        severity: 'critical', status: 'enforced',
        techDetails: [
          'document_audit_trail: insert-only, no UPDATE/DELETE policies',
          'activity_logs: tracks activity_type, user_id, IP, user_agent, metadata',
          'Offer lifecycle: every status change logged with timestamp and actor',
          'Price edit history preserved in price_history table (property_id, recorded_at)',
        ],
      },
      {
        name: 'Negotiation Rate Limiting',
        description: 'Rate limits on offer_messages endpoints to prevent spam and abuse during negotiations.',
        implementation: 'Edge Function rate limiter + ai_batch_locks',
        severity: 'high', status: 'enforced',
        techDetails: [
          'Max 10 messages per minute per user per negotiation thread',
          'ai_batch_locks prevents concurrent processing of same entity',
          'Exponential backoff on repeated rate limit violations',
          'Admin override available for mediation scenarios',
        ],
      },
      {
        name: 'Anomaly Detection Alerts',
        description: 'AI-powered monitoring for suspicious activity: unusual offer patterns, rapid price changes, and account behavior anomalies.',
        implementation: 'ai_event_signals + admin_alerts + alert_rules',
        severity: 'high', status: 'active',
        techDetails: [
          'admin_alert_rules: configurable conditions per event_type',
          'Signals emitted to ai_event_signals for ML processing',
          'Admin alerts generated with priority and urgency_level scoring',
          'Revenue anomaly detection via check_revenue_alerts RPC',
        ],
      },
      {
        name: 'Payment Security (Midtrans)',
        description: 'All payment processing via server-side Edge Function. No client-side payment token handling.',
        implementation: 'payment-engine Edge Function + server-side key storage',
        severity: 'critical', status: 'active',
        techDetails: [
          'MIDTRANS_SERVER_KEY stored as Supabase secret (never in code)',
          'Payment verification via server-to-server callback',
          'Webhook signature validation on payment status updates',
          'Refund and subscription operations require admin authorization',
        ],
      },
      {
        name: 'Commission & Financial Integrity',
        description: 'Commission calculations audited with transaction linkage. Payout processing requires admin verification.',
        implementation: 'transaction_commissions + affiliate_payouts tables',
        severity: 'high', status: 'enforced',
        techDetails: [
          'Commission rates locked at transaction time (not retroactive)',
          'Payout requests require processed_by admin user reference',
          'affiliate_commissions linked to order_id and referral_id chain',
          'Revenue alert monitoring checks thresholds every hour',
        ],
      },
    ],
  },
];

const ARCHITECTURE_SUMMARY = [
  { layer: 'Client', components: 'ProtectedRoute, PermissionGate, safeStorage, DOMPurify', icon: Globe },
  { layer: 'Edge Functions', components: 'getClaims(), has_role(), rate limiter, input validation', icon: Server },
  { layer: 'Database (RLS)', components: 'auth.uid() policies, SECURITY DEFINER functions, security_invoker views', icon: Database },
  { layer: 'Storage', components: 'Private buckets, folder-scoped upload, owner-only read', icon: HardDrive },
  { layer: 'Encryption', components: 'pgp_sym_encrypt, Vault secrets, leaked password protection', icon: Lock },
];

function ControlRow({ control }: { control: Control }) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_STYLES[control.severity];
  const st = STATUS_STYLES[control.status];
  const StIcon = st.icon;

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{control.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${sev.cls}`}>{sev.label}</Badge>
            <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 border ${st.cls}`}><StIcon className="h-2 w-2" /> {st.label}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{control.description}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-1.5">
              <Separator className="opacity-10" />
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider">Implementation</span>
                <code className="block text-violet-400 font-mono mt-0.5">{control.implementation}</code>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Technical Details</span>
                <div className="space-y-0.5 mt-0.5">
                  {control.techDetails.map((d, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <ShieldCheck className="h-2.5 w-2.5 text-emerald-400/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LayerCard({ layer }: { layer: SecurityLayer }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = layer.icon;
  const enforced = layer.controls.filter(c => c.status === 'enforced').length;
  const critical = layer.controls.filter(c => c.severity === 'critical').length;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${layer.borderClass} ${layer.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${layer.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{layer.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{layer.controls.length} controls</Badge>
            <Badge variant="outline" className="text-[9px] h-5 text-emerald-400 border-emerald-400/30">{enforced} enforced</Badge>
            {critical > 0 && <Badge variant="outline" className="text-[9px] h-5 text-rose-400 border-rose-400/30">{critical} critical</Badge>}
          </div>
          <p className="text-[10px] text-muted-foreground">{layer.subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-1.5">
              <Separator className="opacity-15" />
              {layer.controls.map(c => <ControlRow key={c.name} control={c} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SecurityHardeningPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const all = LAYERS.flatMap(l => l.controls);
    return {
      layers: LAYERS.length,
      controls: all.length,
      enforced: all.filter(c => c.status === 'enforced').length,
      critical: all.filter(c => c.severity === 'critical').length,
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return LAYERS;
    const q = searchQuery.toLowerCase();
    return LAYERS.map(l => ({
      ...l,
      controls: l.controls.filter(c =>
        c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) ||
        c.implementation.toLowerCase().includes(q)
      ),
    })).filter(l => l.controls.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-rose-400/10 border border-rose-400/20">
              <ShieldAlert className="h-6 w-6 text-rose-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Security Hardening Blueprint</h1>
              <p className="text-xs text-muted-foreground">Multi-layer protection strategy — authentication, RBAC, encryption, and transaction safety</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Security Layers', value: stats.layers, icon: Layers },
              { label: 'Total Controls', value: stats.controls, icon: Shield },
              { label: 'Enforced', value: stats.enforced, icon: ShieldCheck },
              { label: 'Critical Priority', value: stats.critical, icon: AlertTriangle },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Defense-in-depth architecture */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-rose-400" />
              <span className="text-xs font-bold text-foreground">Defense-in-Depth Architecture</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {ARCHITECTURE_SUMMARY.map((step, i) => (
                <div key={step.layer} className="flex items-center gap-1">
                  <div className="px-2.5 py-1.5 rounded-lg border border-border/20 bg-muted/5 text-center min-w-[120px]">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <step.icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground font-bold">{step.layer}</span>
                    </div>
                    <span className="text-muted-foreground/70 text-[8px] leading-tight block">{step.components}</span>
                  </div>
                  {i < ARCHITECTURE_SUMMARY.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search controls, implementations..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(layer => <LayerCard key={layer.id} layer={layer} />)}
      </div>
    </div>
  );
}
