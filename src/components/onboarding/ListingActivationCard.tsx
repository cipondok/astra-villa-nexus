import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, FilePlus2, Home, Inbox, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/useTranslation';
import { useListerActivation } from '@/hooks/useListerActivation';
import { cn } from '@/lib/utils';

interface Props {
  /** compact: dashboard strip; full: profile / onboarding page */
  variant?: 'compact' | 'full';
  className?: string;
}

const fill = (s: string, vars: Record<string, string>) =>
  Object.entries(vars).reduce((acc, [k, v]) => acc.split(`{${k}}`).join(v), s);

export default function ListingActivationCard({ variant = 'full', className }: Props) {
  const { t, language } = useTranslation();
  const { state, isLoading, counts } = useListerActivation();
  const k = (key: string) => t(`listerOnboarding.${key}`);
  const roleName = (r: string) => k(`roleName.${r}`);
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <section aria-busy="true" className={cn('rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground', className)}>
        {k('status.loading')}
      </section>
    );
  }
  if (!state) return null;

  const tone =
    state.stage === 'active' ? 'border-primary/40' : state.stage === 'rejected' ? 'border-destructive/40' : 'border-border';
  const Icon = state.stage === 'active' ? CheckCircle2 : state.stage === 'pending' ? Clock : state.stage === 'rejected' ? XCircle : Home;

  let title = '';
  let body = '';
  if (state.stage === 'active') {
    title = k('status.activeTitle');
    body = fill(k('status.activeBody'), { role: roleName(state.role) });
  } else if (state.stage === 'pending') {
    title = k('status.pendingTitle');
    body = fill(k('status.pendingBody'), { role: roleName(state.role), date: fmtDate(state.submittedAt) });
  } else if (state.stage === 'rejected') {
    title = k('status.rejectedTitle');
    body = fill(k('status.rejectedBody'), { role: roleName(state.role) });
  } else {
    title = k('status.notStartedTitle');
    body = state.intent ? fill(k('status.intentBody'), { role: roleName(state.intent) }) : k('status.notStartedBody');
  }

  const countItems = counts
    ? ([
        ['listings', counts.listings],
        ['live', counts.live],
        ['inReview', counts.inReview],
        ['needsChanges', counts.needsChanges],
        ['newLeads', counts.newLeads],
        ['followUpsDue', counts.followUpsDue],
      ] as const)
    : [];

  return (
    <section
      aria-labelledby="listing-activation-title"
      data-stage={state.stage}
      className={cn('rounded-xl border bg-card p-4 sm:p-5', tone, className)}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{k('status.title')}</p>
          <h2 id="listing-activation-title" className="text-base font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>

          {state.stage === 'rejected' && state.note && (
            <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="text-xs font-semibold text-foreground">{k('status.reviewerNote')}</p>
              <p className="mt-0.5 whitespace-pre-line text-muted-foreground">{state.note}</p>
            </div>
          )}

          {state.stage === 'active' && countItems.length > 0 && (
            <dl className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {countItems.map(([key, value]) => (
                <div key={key} className="rounded-lg border border-border bg-background/40 px-2 py-2 text-center">
                  <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{k(`counts.${key}`)}</dt>
                  <dd className="text-lg font-semibold tabular-nums text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {state.stage === 'active' && variant === 'full' && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-foreground">{k('next.title')}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex gap-2"><FilePlus2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{k('next.post')}</li>
                <li className="flex gap-2"><Home className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{k('next.manage')}</li>
                <li className="flex gap-2"><Inbox className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{k('next.leads')}</li>
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {state.stage === 'active' && (
              <>
                <Button asChild size="sm" className="min-h-[44px]">
                  <Link to="/post-property"><FilePlus2 className="mr-1.5 h-4 w-4" aria-hidden="true" />{k('actions.postListing')}</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="min-h-[44px]">
                  <Link to="/my-properties">{k('actions.myProperties')}</Link>
                </Button>
              </>
            )}
            {state.stage === 'not_started' && (
              <Button asChild size="sm" className="min-h-[44px]">
                <Link to={state.intent ? `/onboarding/listing?role=${state.intent}` : '/onboarding/listing'}>
                  {state.intent ? k('actions.continue') : k('actions.start')}
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
            {state.stage === 'rejected' && (
              <Button asChild size="sm" variant="outline" className="min-h-[44px]">
                <Link to={`/onboarding/listing?role=${state.role}`}>{k('actions.reapply')}</Link>
              </Button>
            )}
            {state.stage === 'pending' && variant === 'compact' && (
              <Button asChild size="sm" variant="outline" className="min-h-[44px]">
                <Link to="/onboarding/listing">{k('actions.viewStatus')}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
