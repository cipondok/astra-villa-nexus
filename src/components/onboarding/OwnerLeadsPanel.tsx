import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, ChevronDown, Inbox, Lock, Mail, MessageCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyLeads, useLeadHistory, type PropertyLead } from '@/hooks/usePropertyLeads';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { propertyPath } from '@/lib/propertySeo';
import { cn } from '@/lib/utils';
import {
  LEAD_NOTES_MAX,
  LEAD_STATUSES,
  buildLeadUpdate,
  filterLeads,
  followUpState,
  isoToDateInput,
  leadErrorKey,
  leadSourceKey,
  normalizeLeadStatus,
  statusOptions,
  summarizeLeads,
  telHref,
  validateLeadEdit,
  whatsappNumber,
  type LeadFilter,
} from '@/lib/leadPipeline';

const PAGE = 10;
type PropRef = { id: string; title: string; slug: string | null };

/**
 * Lead inbox for the signed-in owner/agent inside My Properties. Rows come
 * from `property_leads`, which RLS limits to agent_id = auth.uid() (the
 * enquiry trigger sets it to the listing's agent, else its owner); admins can
 * read all. Notes and follow-up dates live on the same row, so buyers and
 * other listers never see them.
 */
export default function OwnerLeadsPanel() {
  const { t, language } = useTranslation();
  const k = (key: string) => t(`leadInbox.${key}`);
  const { leads, isLoading, error } = usePropertyLeads();
  const [params] = useSearchParams();
  const deepLinkId = params.get('lead');
  const [filter, setFilter] = useState<LeadFilter>('all');
  const [openId, setOpenId] = useState<string | null>(deepLinkId);
  const [limit, setLimit] = useState(PAGE);

  const propertyIds = useMemo(() => [...new Set(leads.map((l) => l.property_id).filter(Boolean))] as string[], [leads]);
  const { data: props = {} } = useQuery({
    queryKey: ['lead-property-titles', propertyIds],
    enabled: propertyIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('id, title, slug').in('id', propertyIds.slice(0, 100));
      return Object.fromEntries((data || []).map((p) => [p.id, p])) as Record<string, PropRef>;
    },
  });

  const summary = useMemo(() => summarizeLeads(leads), [leads]);
  const shown = useMemo(() => filterLeads(leads, filter), [leads, filter]);

  useEffect(() => {
    if (!deepLinkId || isLoading) return;
    setOpenId(deepLinkId);
    document.getElementById(`lead-${deepLinkId}`)?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [deepLinkId, isLoading]);

  const locale = language === 'id' ? 'id-ID' : 'en-GB';
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  const filters: LeadFilter[] = ['all', 'due', ...LEAD_STATUSES];
  const summaryItems = [
    ['new', summary.new],
    ['open', summary.open],
    ['followUpsDue', summary.followUpsDue],
    ['won', summary.won],
  ] as const;

  return (
    <section id="leads" aria-labelledby="lead-inbox-title" className="scroll-mt-24 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="flex items-start gap-3">
        <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <h2 id="lead-inbox-title" className="text-base font-semibold text-foreground">
            {k('title')}{leads.length > 0 && <span className="ml-1.5 text-muted-foreground">({leads.length})</span>}
          </h2>
          <p className="text-xs text-muted-foreground">{k('subtitle')}</p>
        </div>
      </div>

      {isLoading && (
        <div className="mt-3 space-y-2" aria-busy="true" aria-label={k('loading')}>
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
          <div className="h-14 animate-pulse rounded-lg bg-muted" />
        </div>
      )}
      {!isLoading && error && <p role="alert" className="mt-3 text-sm text-destructive">{k('error')}</p>}
      {!isLoading && !error && leads.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{k('empty')}</p>}

      {!isLoading && !error && leads.length > 0 && (
        <>
          <dl className="mt-3 grid grid-cols-4 gap-2">
            {summaryItems.map(([key, value]) => (
              <div key={key} className="rounded-lg border border-border bg-background/40 px-1.5 py-2 text-center">
                <dt className="text-[10px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">{k(`summary.${key}`)}</dt>
                <dd className="text-lg font-semibold tabular-nums text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <div role="group" aria-label={k('filterLabel')} className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {filters.map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={filter === f ? 'default' : 'outline'}
                aria-pressed={filter === f}
                className="min-h-[44px] shrink-0 text-xs"
                onClick={() => { setFilter(f); setLimit(PAGE); }}
              >
                {f === 'all' ? k('filter.all') : f === 'due' ? k('filter.due') : k(`status.${f}`)}
              </Button>
            ))}
          </div>

          {shown.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{k('emptyFilter')}</p>}

          <ul className="mt-2 divide-y divide-border">
            {shown.slice(0, limit).map((lead) => {
              const prop = lead.property_id ? props[lead.property_id] : undefined;
              const status = normalizeLeadStatus(lead.status);
              const due = followUpState(lead);
              const open = openId === lead.id;
              return (
                <li key={lead.id} id={`lead-${lead.id}`} className="scroll-mt-24 py-1">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`lead-detail-${lead.id}`}
                    onClick={() => setOpenId(open ? null : lead.id)}
                    className="flex min-h-[44px] w-full items-start justify-between gap-2 rounded-lg px-1 py-2 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-foreground">
                        <span className="truncate">{lead.lead_name}</span>
                        <Badge variant={status === 'new' ? 'default' : 'secondary'} className="text-[10px]">{k(`status.${status}`)}</Badge>
                        {(due === 'overdue' || due === 'today') && (
                          <Badge variant="outline" className={cn('text-[10px]', due === 'overdue' && 'border-destructive/50 text-destructive')}>
                            {k(`followUp.${due}`)}
                          </Badge>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {prop ? `${prop.title} · ` : ''}{k(`source.${leadSourceKey(lead)}`)} · {fmtDate(lead.created_at)}
                      </span>
                    </span>
                    <ChevronDown className={cn('mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} aria-hidden="true" />
                  </button>
                  {open && <LeadDetail lead={lead} prop={prop} />}
                </li>
              );
            })}
          </ul>
          {shown.length > limit && (
            <Button variant="ghost" size="sm" className="mt-1 min-h-[44px]" onClick={() => setLimit((n) => n + PAGE)}>
              {k('showMore')} ({shown.length - limit})
            </Button>
          )}
        </>
      )}
    </section>
  );
}

function LeadDetail({ lead, prop }: { lead: PropertyLead; prop?: PropRef }) {
  const { t, language } = useTranslation();
  const k = (key: string) => t(`leadInbox.${key}`);
  const { updateLead } = usePropertyLeads();
  const history = useLeadHistory(lead.id);
  const [status, setStatus] = useState<string>(normalizeLeadStatus(lead.status));
  const [notes, setNotes] = useState(lead.notes || '');
  const [nextDate, setNextDate] = useState(isoToDateInput(lead.next_action_at));
  const [problem, setProblem] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const locale = language === 'id' ? 'id-ID' : 'en-GB';
  const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const wa = whatsappNumber(lead.lead_phone);
  const statusLabel = (s?: string | null) => (s ? k(`status.${normalizeLeadStatus(s)}`) : '—');

  const edit = { status, notes, nextActionDate: nextDate };
  const update = buildLeadUpdate(lead, edit);
  const dirty = Object.keys(update).length > 0;

  const save = () => {
    setSaved(false);
    const p = validateLeadEdit(lead, edit);
    if (p) { setProblem(p); return; }
    setProblem(null);
    updateLead.mutate(
      { id: lead.id, ...update },
      {
        onSuccess: () => setSaved(true),
        onError: (e) => setProblem(leadErrorKey(e as { message?: string })),
      },
    );
  };

  const ids = { status: `lead-status-${lead.id}`, date: `lead-next-${lead.id}`, notes: `lead-notes-${lead.id}` };

  return (
    <div id={`lead-detail-${lead.id}`} className="mb-2 mt-1 space-y-4 rounded-lg border border-border bg-background/40 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <dl className="space-y-1.5 text-sm">
          <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k('detail.contact')}</dt>
            <dd className="font-medium text-foreground">{lead.lead_name}</dd></div>
          {lead.lead_email && <div><dt className="sr-only">{k('detail.email')}</dt><dd className="break-all text-muted-foreground">{lead.lead_email}</dd></div>}
          {lead.lead_phone && <div><dt className="sr-only">{k('detail.phone')}</dt><dd className="text-muted-foreground">{lead.lead_phone}</dd></div>}
        </dl>
        <dl className="space-y-1.5 text-sm">
          {prop && (
            <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k('detail.listing')}</dt>
              <dd><Link className="text-foreground underline-offset-2 hover:underline" to={propertyPath(prop)}>{prop.title}</Link></dd></div>
          )}
          <div><dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{k('detail.received')}</dt>
            <dd className="text-muted-foreground">{fmtDateTime(lead.created_at)} · {k(`source.${leadSourceKey(lead)}`)}</dd></div>
        </dl>
      </div>

      {lead.enquiry_message && (
        <figure>
          <figcaption className="text-[11px] uppercase tracking-wide text-muted-foreground">{k('detail.message')}</figcaption>
          <blockquote className="mt-1 whitespace-pre-line rounded-md border-l-2 border-primary/50 bg-muted/30 px-3 py-2 text-sm text-foreground">
            {lead.enquiry_message}
          </blockquote>
        </figure>
      )}

      <div className="flex flex-wrap gap-2">
        {lead.lead_phone && (
          <Button asChild size="sm" variant="outline" className="min-h-[44px]">
            <a href={telHref(lead.lead_phone)}><Phone className="mr-1.5 h-4 w-4" aria-hidden="true" />{k('actions.call')}</a>
          </Button>
        )}
        {wa && (
          <Button asChild size="sm" variant="outline" className="min-h-[44px]">
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-1.5 h-4 w-4" aria-hidden="true" />WhatsApp</a>
          </Button>
        )}
        {lead.lead_email && (
          <Button asChild size="sm" variant="outline" className="min-h-[44px]">
            <a href={`mailto:${lead.lead_email}`}><Mail className="mr-1.5 h-4 w-4" aria-hidden="true" />{k('actions.email')}</a>
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={ids.status} className="text-xs">{k('detail.status')}</Label>
          <select
            id={ids.status}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setSaved(false); }}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {statusOptions(lead.status).map((s) => <option key={s} value={s}>{k(`status.${s}`)}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor={ids.date} className="text-xs"><CalendarClock className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />{k('detail.nextAction')}</Label>
          <Input id={ids.date} type="date" value={nextDate} className="h-11" onChange={(e) => { setNextDate(e.target.value); setSaved(false); }} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={ids.notes} className="text-xs">{k('detail.notes')}</Label>
        <Textarea
          id={ids.notes}
          value={notes}
          maxLength={LEAD_NOTES_MAX}
          rows={3}
          aria-describedby={`${ids.notes}-hint`}
          onChange={(e) => { setNotes(e.target.value); setSaved(false); }}
        />
        <p id={`${ids.notes}-hint`} className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" aria-hidden="true" />{k('detail.notesPrivate')}</span>
          <span className="tabular-nums">{notes.length}/{LEAD_NOTES_MAX}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" className="min-h-[44px]" disabled={!dirty || updateLead.isPending} onClick={save}>
          {updateLead.isPending ? k('actions.saving') : k('actions.save')}
        </Button>
        <span aria-live="polite" className="text-xs">
          {problem && <span role="alert" className="text-destructive">{k(`errors.${problem}`)}</span>}
          {!problem && saved && <span className="text-muted-foreground">{k('saved')}</span>}
        </span>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k('detail.history')}</p>
        {history.isLoading && <div className="mt-1 h-6 animate-pulse rounded bg-muted" aria-hidden="true" />}
        {history.isError && <p className="mt-1 text-xs text-destructive">{k('historyError')}</p>}
        {!history.isLoading && !history.isError && (
          <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
            {(history.data || []).map((h) => (
              <li key={h.id}>
                {fmtDateTime(h.created_at)} ·{' '}
                {h.activity_type === 'lead_status_changed'
                  ? `${statusLabel(h.metadata?.from)} → ${statusLabel(h.metadata?.to)}`
                  : `${k('detail.nextAction')}: ${h.metadata?.to ? new Date(h.metadata.to).toLocaleDateString(locale) : '—'}`}
              </li>
            ))}
            <li>{fmtDateTime(lead.created_at)} · {k('historyReceived')}</li>
          </ul>
        )}
      </div>
    </div>
  );
}
