import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Inbox, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyLeads } from '@/hooks/usePropertyLeads';
import { useTranslation } from '@/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { propertyPath } from '@/lib/propertySeo';

const PREVIEW = 5;

/**
 * Buyer enquiries for the signed-in owner/agent. Rows come from the existing
 * property_leads table, which RLS limits to leads where agent_id = auth.uid()
 * (the enquiry trigger sets it to the listing's agent, else its owner).
 */
export default function OwnerLeadsPanel() {
  const { t, language } = useTranslation();
  const k = (key: string) => t(`ownerLeads.${key}`);
  const { leads, isLoading, error, updateLead } = usePropertyLeads();
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(
    () => [...leads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [leads],
  );
  const propertyIds = useMemo(() => [...new Set(sorted.map((l) => l.property_id).filter(Boolean))] as string[], [sorted]);

  const { data: titles = {} } = useQuery({
    queryKey: ['lead-property-titles', propertyIds],
    enabled: propertyIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('id, title, slug').in('id', propertyIds.slice(0, 50));
      return Object.fromEntries((data || []).map((p) => [p.id, p])) as Record<string, { id: string; title: string; slug: string | null }>;
    },
  });

  const visible = showAll ? sorted : sorted.slice(0, PREVIEW);
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <section aria-labelledby="owner-leads-title" className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <h2 id="owner-leads-title" className="text-base font-semibold text-foreground">
            {k('title')}{sorted.length > 0 && <span className="ml-1.5 text-muted-foreground">({sorted.length})</span>}
          </h2>
          <p className="text-xs text-muted-foreground">{k('subtitle')}</p>
        </div>
      </div>

      {isLoading && <div className="mt-3 h-12 animate-pulse rounded-lg bg-muted" aria-hidden="true" />}
      {!isLoading && error && <p role="alert" className="mt-3 text-sm text-destructive">{k('error')}</p>}
      {!isLoading && !error && sorted.length === 0 && <p className="mt-3 text-sm text-muted-foreground">{k('empty')}</p>}

      {visible.length > 0 && (
        <ul className="mt-3 divide-y divide-border">
          {visible.map((lead) => {
            const prop = lead.property_id ? titles[lead.property_id] : undefined;
            const status = ['new', 'contacted', 'qualified', 'converted', 'lost'].includes(lead.status) ? lead.status : 'new';
            return (
              <li key={lead.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                    {lead.lead_name}
                    <Badge variant={status === 'new' ? 'default' : 'secondary'} className="text-[10px]">{k(`status.${status}`)}</Badge>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {prop ? (
                      <>{k('listing')}: <Link className="underline-offset-2 hover:underline" to={propertyPath(prop)}>{prop.title}</Link> · </>
                    ) : null}
                    {k('received')} {fmt(lead.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lead.lead_phone && (
                    <Button asChild size="sm" variant="outline" className="min-h-[44px]">
                      <a href={`tel:${lead.lead_phone.replace(/[^\d+]/g, '')}`}><Phone className="mr-1.5 h-4 w-4" aria-hidden="true" />{k('call')}</a>
                    </Button>
                  )}
                  {lead.lead_email && (
                    <Button asChild size="sm" variant="outline" className="min-h-[44px]">
                      <a href={`mailto:${lead.lead_email}`}><Mail className="mr-1.5 h-4 w-4" aria-hidden="true" />{k('email')}</a>
                    </Button>
                  )}
                  {status === 'new' && (
                    <Button size="sm" variant="ghost" className="min-h-[44px]" disabled={updateLead.isPending}
                      onClick={() => updateLead.mutate({ id: lead.id, status: 'contacted', last_contacted_at: new Date().toISOString() })}>
                      {k('markContacted')}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {sorted.length > PREVIEW && (
        <Button variant="ghost" size="sm" className="mt-1 min-h-[44px]" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
          {showAll ? '−' : `+${sorted.length - PREVIEW}`}
        </Button>
      )}
    </section>
  );
}
