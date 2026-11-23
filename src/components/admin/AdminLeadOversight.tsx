import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Inbox, MailWarning } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/i18n/useTranslation';
import { Badge } from '@/components/ui/badge';
import { LEAD_STATUSES, followUpState, normalizeLeadStatus, summarizeLeads } from '@/lib/leadPipeline';

const STALE_MS = 48 * 60 * 60 * 1000;

/**
 * Admin read-only view of listing leads. RLS ("Listing admins read all
 * property leads") is what grants access; non-admins get only their own rows.
 * Buyer contact details and lister notes are deliberately not shown here.
 */
export default function AdminLeadOversight() {
  const { t, language } = useTranslation();
  const k = (key: string) => t(`leadInbox.${key}`);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-lead-oversight'],
    queryFn: async () => {
      const { data: leads, error: e } = await supabase
        .from('property_leads')
        .select('id, agent_id, property_id, lead_name, status, next_action_at, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
      if (e) throw e;
      const rows = leads || [];
      const agentIds = [...new Set(rows.map((r) => r.agent_id))].slice(0, 100);
      const propIds = [...new Set(rows.map((r) => r.property_id).filter(Boolean))].slice(0, 100) as string[];
      const [people, props] = await Promise.all([
        agentIds.length ? supabase.from('profiles').select('id, full_name').in('id', agentIds) : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
        propIds.length ? supabase.from('properties').select('id, title').in('id', propIds) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
      ]);
      return {
        rows,
        names: Object.fromEntries((people.data || []).map((p) => [p.id, p.full_name || '—'])) as Record<string, string>,
        titles: Object.fromEntries((props.data || []).map((p) => [p.id, p.title])) as Record<string, string>,
      };
    },
  });

  const rows = data?.rows || [];
  const summary = useMemo(() => summarizeLeads(rows), [rows]);
  const byStatus = useMemo(() => {
    const m: Record<string, number> = {};
    rows.forEach((r) => { const s = normalizeLeadStatus(r.status); m[s] = (m[s] || 0) + 1; });
    return m;
  }, [rows]);
  const stale = rows.filter((r) => normalizeLeadStatus(r.status) === 'new' && Date.now() - new Date(r.created_at).getTime() > STALE_MS).length;
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section aria-labelledby="admin-leads-title" className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 id="admin-leads-title" className="text-base font-semibold text-foreground">{k('admin.title')}</h2>
          <p className="text-xs text-muted-foreground">{k('admin.subtitle')}</p>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
        <MailWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{k('admin.emailBlocked')}
      </p>

      {isLoading && <div className="mt-3 h-16 animate-pulse rounded-lg bg-muted" aria-hidden="true" />}
      {!isLoading && error && <p role="alert" className="mt-3 text-sm text-destructive">{k('admin.error')}</p>}
      {!isLoading && !error && rows.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{k('admin.empty')}</p>}

      {!isLoading && !error && rows.length > 0 && (
        <>
          <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {LEAD_STATUSES.map((s) => (
              <div key={s} className="rounded-lg border border-border px-2 py-1.5 text-center">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{k(`status.${s}`)}</dt>
                <dd className="text-base font-semibold tabular-nums">{byStatus[s] || 0}</dd>
              </div>
            ))}
            <div className="rounded-lg border border-border px-2 py-1.5 text-center">
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{k('summary.followUpsDue')}</dt>
              <dd className="text-base font-semibold tabular-nums">{summary.followUpsDue}</dd>
            </div>
            <div className="rounded-lg border border-border px-2 py-1.5 text-center">
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{k('admin.stale')}</dt>
              <dd className="text-base font-semibold tabular-nums">{stale}</dd>
            </div>
          </dl>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">{k('admin.received')}</th>
                  <th className="py-2 pr-3 font-medium">{k('admin.listing')}</th>
                  <th className="py-2 pr-3 font-medium">{k('admin.lister')}</th>
                  <th className="py-2 pr-3 font-medium">{k('admin.buyer')}</th>
                  <th className="py-2 pr-3 font-medium">{k('admin.status')}</th>
                  <th className="py-2 font-medium">{k('admin.nextAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.slice(0, 25).map((r) => {
                  const due = followUpState(r);
                  return (
                    <tr key={r.id}>
                      <td className="py-2 pr-3 text-muted-foreground">{fmt(r.created_at)}</td>
                      <td className="py-2 pr-3">{(r.property_id && data?.titles[r.property_id]) || '—'}</td>
                      <td className="py-2 pr-3">{data?.names[r.agent_id] || '—'}</td>
                      <td className="py-2 pr-3">{r.lead_name}</td>
                      <td className="py-2 pr-3"><Badge variant="secondary" className="text-[10px]">{k(`status.${normalizeLeadStatus(r.status)}`)}</Badge></td>
                      <td className="py-2 text-muted-foreground">
                        {r.next_action_at ? fmt(r.next_action_at) : '—'}
                        {due === 'overdue' && <span className="ml-1 text-destructive">!</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
