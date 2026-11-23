import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Briefcase, CheckCircle2, Eye, EyeOff, Home, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';
import { useListerActivation } from '@/hooks/useListerActivation';
import SEOHead from '@/components/SEOHead';
import ListingActivationCard from '@/components/onboarding/ListingActivationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  LISTER_ROLES,
  OWNER_PROPERTY_COUNTS,
  OWNER_PROPERTY_TYPES,
  FIELD_VISIBILITY,
  BIO_MAX,
  emptyListerApplication,
  validateListerApplication,
  buildProfileUpdate,
  buildOwnerRequest,
  buildAgentRequest,
  requiresCompany,
  requiresBio,
  applicationErrorKey,
  type ListerApplicationInput,
  type ListerField,
  type ListerRole,
} from '@/lib/listerOnboarding';

const ROLE_ICONS: Record<ListerRole, typeof Home> = {
  property_owner: Home,
  agent: Briefcase,
  developer: Building2,
};

const isListerRole = (v: string | null): v is ListerRole => !!v && (LISTER_ROLES as readonly string[]).includes(v);

export default function ListerOnboarding() {
  const { t } = useTranslation();
  const k = (key: string) => t(`listerOnboarding.${key}`);
  const { user, profile, refreshProfile } = useAuth();
  const { state, isLoading } = useListerActivation();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const roleParam = params.get('role');

  const [form, setForm] = useState<ListerApplicationInput>(() =>
    emptyListerApplication({ role: isListerRole(roleParam) ? roleParam : null }),
  );
  const [errors, setErrors] = useState<Partial<Record<ListerField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const seeded = useRef(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Prefill from the user's own profile once.
  useEffect(() => {
    if (seeded.current || !user) return;
    seeded.current = true;
    setForm((f) => ({
      ...f,
      fullName: f.fullName || profile?.full_name || '',
      phone: f.phone || profile?.phone || '',
      email: f.email || profile?.email || user.email || '',
      companyName: f.companyName || profile?.company_name || '',
      licenseNumber: f.licenseNumber || profile?.license_number || '',
      yearsExperience: f.yearsExperience || (profile?.years_experience ?? ''),
      bio: f.bio || profile?.bio || '',
    }));
  }, [user, profile]);

  // Prefer the role from the user's signup purpose / earlier application.
  useEffect(() => {
    if (form.role || !state) return;
    const r = state.stage === 'not_started' ? state.intent : state.stage === 'rejected' ? state.role : null;
    if (r) setForm((f) => ({ ...f, role: r }));
  }, [state, form.role]);

  const set = <K extends ListerField>(key: K, value: ListerApplicationInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const showForm = !!user && !submitted && (state?.stage === 'not_started' || state?.stage === 'rejected');
  const companyRequired = requiresCompany(form);
  const bioRequired = requiresBio(form.role);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    setSubmitError(null);
    const found = validateListerApplication(form);
    if (Object.keys(found).length) {
      setErrors(Object.fromEntries(Object.entries(found).map(([f, key]) => [f, k(`errors.${key}`)])));
      setSubmitError(k('errors.fixFields'));
      requestAnimationFrame(() => {
        const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        (first ?? errorRef.current)?.focus();
      });
      return;
    }
    setSubmitting(true);
    try {
      const { error: profileError } = await supabase.from('profiles').update(buildProfileUpdate(form)).eq('id', user.id);
      if (profileError) throw profileError;

      const { error } =
        form.role === 'property_owner'
          ? await supabase.from('property_owner_requests').insert(buildOwnerRequest(form, user.id))
          : await supabase.from('agent_registration_requests').insert(buildAgentRequest(form, user.id));
      if (error) throw error;

      setSubmitted(true);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lister-applications', user.id] }),
        queryClient.invalidateQueries({ queryKey: ['pending-applications', user.id] }),
        refreshProfile?.(),
      ]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(k(`errors.${applicationErrorKey(err as { message?: string })}`));
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  };

  const visibilityTag = (field: keyof typeof FIELD_VISIBILITY) => {
    const pub = FIELD_VISIBILITY[field] === 'public';
    const VIcon = pub ? Eye : EyeOff;
    return (
      <span className={cn('inline-flex items-center gap-1 text-[10px] font-medium', pub ? 'text-primary' : 'text-muted-foreground')}>
        <VIcon className="h-3 w-3" aria-hidden="true" />
        {pub ? k('visibility.public') : k('visibility.private')}
      </span>
    );
  };

  const field = (
    name: ListerField,
    label: string,
    input: React.ReactNode,
    opts: { hint?: string; visibility?: keyof typeof FIELD_VISIBILITY; required?: boolean } = {},
  ) => (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={`lo-${name}`} className="text-sm">
          {label}
          {opts.required && <span className="text-destructive" aria-hidden="true"> *</span>}
        </Label>
        {opts.visibility && visibilityTag(opts.visibility)}
      </div>
      {input}
      {opts.hint && !errors[name] && <p id={`lo-${name}-hint`} className="text-xs text-muted-foreground">{opts.hint}</p>}
      {errors[name] && <p id={`lo-${name}-error`} className="text-xs font-medium text-destructive">{errors[name]}</p>}
    </div>
  );

  const inputProps = (name: ListerField, hint?: boolean) => ({
    id: `lo-${name}`,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `lo-${name}-error` : hint ? `lo-${name}-hint` : undefined,
    className: 'min-h-[44px]',
  });

  const sectionCls = 'rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4';
  const headingCls = 'flex items-center gap-2 text-base font-semibold text-foreground';
  const stepNum = (n: number) => (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary" aria-hidden="true">{n}</span>
  );

  const roleCards = useMemo(() => LISTER_ROLES, []);

  return (
    <main className="min-h-screen bg-background pb-24 pt-4 md:pt-8">
      <SEOHead title={k('meta.title')} description={k('meta.description')} noIndex />
      <div className="mx-auto w-full max-w-3xl px-4">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{k('hero.eyebrow')}</p>
          <h1 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">{k('hero.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{k('hero.subtitle')}</p>
        </header>

        {!user && (
          <section className={sectionCls} aria-labelledby="lo-signed-out">
            <h2 id="lo-signed-out" className={headingCls}>{k('signedOut.title')}</h2>
            <p className="text-sm text-muted-foreground">{k('signedOut.body')}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="min-h-[44px]"><Link to="/auth">{k('actions.signIn')}</Link></Button>
              <Button asChild variant="outline" className="min-h-[44px]"><Link to="/auth?mode=signup">{k('actions.createAccount')}</Link></Button>
            </div>
          </section>
        )}

        {user && isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />{k('status.loading')}
          </div>
        )}

        {user && submitted && (
          <div role="status" className="mb-4 flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">{k('submitted.title')}</p>
              <p className="text-sm text-muted-foreground">{k('submitted.body')}</p>
            </div>
          </div>
        )}

        {user && state && (submitted || state.stage !== 'not_started') && <ListingActivationCard className="mb-6" />}

        {showForm && (
          <form onSubmit={onSubmit} noValidate className="space-y-5" aria-label={k('hero.title')}>
            <fieldset className={sectionCls}>
              <legend className="sr-only">{k('sections.role')}</legend>
              <h2 className={headingCls}>{stepNum(1)}{k('sections.role')}</h2>
              <div role="radiogroup" aria-label={k('sections.role')} aria-invalid={errors.role ? true : undefined} className="grid gap-3 sm:grid-cols-3">
                {roleCards.map((r) => {
                  const RIcon = ROLE_ICONS[r];
                  const selected = form.role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => set('role', r)}
                      className={cn(
                        'flex min-h-[44px] flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/40',
                      )}
                    >
                      <RIcon className={cn('h-5 w-5', selected ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
                      <span className="text-sm font-semibold text-foreground">{k(`roles.${r}.title`)}</span>
                      <span className="text-xs text-muted-foreground">{k(`roles.${r}.desc`)}</span>
                    </button>
                  );
                })}
              </div>
              {errors.role && <p className="text-xs font-medium text-destructive">{errors.role}</p>}

              {form.role === 'property_owner' && (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={k('ownerType.label')}>
                  {(['individual', 'business'] as const).map((o) => (
                    <button key={o} type="button" role="radio" aria-checked={form.ownerType === o} onClick={() => set('ownerType', o)}
                      className={cn('min-h-[44px] rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        form.ownerType === o ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/50')}>
                      {k(`ownerType.${o}`)}
                    </button>
                  ))}
                </div>
              )}
              {form.role === 'agent' && (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={k('agentKind.label')}>
                  {(['individual_agent', 'agency'] as const).map((o) => (
                    <button key={o} type="button" role="radio" aria-checked={form.agentKind === o} onClick={() => set('agentKind', o)}
                      className={cn('min-h-[44px] rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        form.agentKind === o ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/50')}>
                      {k(`agentKind.${o}`)}
                    </button>
                  ))}
                </div>
              )}
            </fieldset>

            <fieldset className={sectionCls}>
              <legend className="sr-only">{k('sections.profile')}</legend>
              <h2 className={headingCls}>{stepNum(2)}{k('sections.profile')}</h2>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5 font-semibold text-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{k('visibility.title')}</p>
                <p className="mt-1">{k('visibility.publicBody')}</p>
                <p className="mt-1">{k('visibility.privateBody')}</p>
                <p className="mt-1">{k('visibility.noDocuments')}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {field('fullName', k('fields.fullName'),
                  <Input {...inputProps('fullName')} autoComplete="name" maxLength={100} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />,
                  { visibility: 'fullName', required: true })}
                {field('companyName', companyRequired ? k('fields.companyName') : k('fields.companyOptional'),
                  <Input {...inputProps('companyName')} autoComplete="organization" maxLength={150} value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />,
                  { visibility: 'companyName', required: companyRequired })}
                {field('phone', k('fields.phone'),
                  <Input {...inputProps('phone', true)} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={form.phone} onChange={(e) => set('phone', e.target.value)} />,
                  { visibility: 'phone', required: true, hint: k('fields.phoneHint') })}
                {field('email', k('fields.email'),
                  <Input {...inputProps('email')} type="email" autoComplete="email" maxLength={254} value={form.email} onChange={(e) => set('email', e.target.value)} />,
                  { visibility: 'email', required: true })}
                {form.role !== 'property_owner' && field('licenseNumber', k('fields.licenseNumber'),
                  <Input {...inputProps('licenseNumber', true)} maxLength={60} value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} />,
                  { visibility: 'licenseNumber', hint: k('fields.licenseHint') })}
                {form.role !== 'property_owner' && field('yearsExperience', k('fields.yearsExperience'),
                  <Input {...inputProps('yearsExperience')} inputMode="numeric" maxLength={2} value={form.yearsExperience} onChange={(e) => set('yearsExperience', e.target.value.replace(/\D/g, ''))} />,
                  { visibility: 'yearsExperience' })}
              </div>
              {field('bio', bioRequired ? k('fields.bio') : k('fields.bioOwner'),
                <Textarea {...inputProps('bio', bioRequired)} className="min-h-[110px]" maxLength={BIO_MAX} value={form.bio} onChange={(e) => set('bio', e.target.value)} />,
                { visibility: 'bio', required: bioRequired, hint: bioRequired ? k('fields.bioHint') : undefined })}
            </fieldset>

            <fieldset className={sectionCls}>
              <legend className="sr-only">{k('sections.area')}</legend>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className={headingCls}>{stepNum(3)}{k('sections.area')}</h2>
                {visibilityTag('serviceArea')}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {field('province', k('fields.province'),
                  <Input {...inputProps('province')} autoComplete="address-level1" maxLength={80} value={form.province} onChange={(e) => set('province', e.target.value)} />,
                  { required: true })}
                {field('city', k('fields.city'),
                  <Input {...inputProps('city')} autoComplete="address-level2" maxLength={80} value={form.city} onChange={(e) => set('city', e.target.value)} />,
                  { required: true })}
                {field('area', k('fields.area'),
                  <Input {...inputProps('area')} maxLength={120} value={form.area} onChange={(e) => set('area', e.target.value)} />)}
              </div>

              {form.role === 'property_owner' && (
                <div className="space-y-4 border-t border-border pt-4">
                  <div className="space-y-1.5">
                    <p id="lo-propertyTypes-label" className="text-sm font-medium">{k('fields.propertyTypes')}<span className="text-destructive" aria-hidden="true"> *</span></p>
                    <div className="flex flex-wrap gap-2" role="group" aria-labelledby="lo-propertyTypes-label">
                      {OWNER_PROPERTY_TYPES.map((pt) => {
                        const on = form.propertyTypes.includes(pt);
                        return (
                          <button key={pt} type="button" aria-pressed={on}
                            aria-invalid={errors.propertyTypes ? true : undefined}
                            onClick={() => set('propertyTypes', on ? form.propertyTypes.filter((x) => x !== pt) : [...form.propertyTypes, pt])}
                            className={cn('min-h-[44px] rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                              on ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:border-primary/50')}>
                            {k(`propertyTypes.${pt}`)}
                          </button>
                        );
                      })}
                    </div>
                    {errors.propertyTypes && <p className="text-xs font-medium text-destructive">{errors.propertyTypes}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lo-propertyCount">{k('fields.propertyCount')}</Label>
                    <select id="lo-propertyCount" value={form.propertyCount} onChange={(e) => set('propertyCount', e.target.value)}
                      className="flex min-h-[44px] w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56">
                      {OWNER_PROPERTY_COUNTS.map((c) => <option key={c} value={c}>{k(`propertyCount.${c}`)}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </fieldset>

            <fieldset className={sectionCls}>
              <legend className="sr-only">{k('sections.confirm')}</legend>
              <h2 className={headingCls}>{stepNum(4)}{k('sections.confirm')}</h2>
              <div className="flex items-start gap-3">
                <Checkbox id="lo-declaration" checked={form.declaration} onCheckedChange={(v) => set('declaration', v === true)}
                  aria-invalid={errors.declaration ? true : undefined} className="mt-0.5 h-5 w-5" />
                <Label htmlFor="lo-declaration" className="text-sm font-normal leading-snug">{k('fields.declaration')}</Label>
              </div>
              {errors.declaration && <p className="text-xs font-medium text-destructive">{errors.declaration}</p>}

              {submitError && (
                <div ref={errorRef} tabIndex={-1} role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}
              <Button type="submit" disabled={submitting} className="min-h-[44px] w-full sm:w-auto">
                {submitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />{k('actions.submitting')}</>) : k('actions.submit')}
              </Button>
            </fieldset>
          </form>
        )}
      </div>
    </main>
  );
}
