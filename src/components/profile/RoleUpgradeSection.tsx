import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Store, Briefcase, ArrowRight, CheckCircle, Clock, XCircle, Shield, Hammer } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useApplicationsList } from '@/hooks/usePendingApplications';
import { useTranslation } from '@/i18n/useTranslation';
import ListingActivationCard from '@/components/onboarding/ListingActivationCard';
import { cn } from '@/lib/utils';

const ROLE_BADGES: Record<string, { en: string; id: string; icon: React.ReactNode }> = {
  property_owner: { en: 'Property Owner', id: 'Pemilik Properti', icon: <Building2 className="h-4 w-4" /> },
  agent: { en: 'Agent', id: 'Agen', icon: <Briefcase className="h-4 w-4" /> },
  developer: { en: 'Developer', id: 'Developer', icon: <Hammer className="h-4 w-4" /> },
  vendor: { en: 'Service Vendor', id: 'Vendor Layanan', icon: <Store className="h-4 w-4" /> },
  investor: { en: 'Investor', id: 'Investor', icon: <User className="h-4 w-4" /> },
};

const text = {
  en: {
    title: 'Account Roles',
    subtitle: 'Your roles and applications',
    currentRoles: 'Your current roles',
    general: 'Buyer / renter',
    vendorTitle: 'Service vendor',
    vendorDesc: 'Offer property-related services. Applications are reviewed by our team.',
    pending: 'Pending review',
    rejected: 'Not approved',
    apply: 'Apply',
  },
  id: {
    title: 'Role Akun',
    subtitle: 'Role dan pengajuan Anda',
    currentRoles: 'Role Anda saat ini',
    general: 'Pembeli / penyewa',
    vendorTitle: 'Vendor layanan',
    vendorDesc: 'Tawarkan layanan terkait properti. Pengajuan ditinjau oleh tim kami.',
    pending: 'Menunggu tinjauan',
    rejected: 'Belum disetujui',
    apply: 'Ajukan',
  },
};

/**
 * Profile → Roles. Owner/agent/developer access is handled by the shared
 * ListingActivationCard (application → admin approval → role); vendor keeps
 * its existing registration flow. Roles are only ever granted server-side.
 */
const RoleUpgradeSection: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();
  const { data: applications } = useApplicationsList();
  const t = language === 'id' ? text.id : text.en;

  const activeBadges = userRoles.filter((r) => ROLE_BADGES[r]);
  const vendorApp = applications.find((a) => a.type === 'vendor');
  const isVendor = userRoles.includes('vendor');
  const vendorPending = vendorApp?.status === 'pending' || vendorApp?.status === 'under_review';
  const vendorRejected = vendorApp?.status === 'rejected';

  return (
    <div className="space-y-4">
      <ListingActivationCard />

      <Card className="border-border overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-base">{t.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.currentRoles}</h4>
            {rolesLoading ? (
              <div className="h-7 w-40 animate-pulse rounded bg-muted" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeBadges.map((r) => (
                  <Badge key={r} variant="secondary" className="gap-1.5 py-1 px-2.5">
                    {ROLE_BADGES[r].icon}
                    <span>{language === 'id' ? ROLE_BADGES[r].id : ROLE_BADGES[r].en}</span>
                    <CheckCircle className="h-3 w-3 ml-1" aria-hidden="true" />
                  </Badge>
                ))}
                {activeBadges.length === 0 && (
                  <Badge variant="secondary" className="gap-1.5 py-1 px-2.5">
                    <User className="h-4 w-4" aria-hidden="true" />
                    {t.general}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {!isVendor && (
            <div className={cn(
              'p-3 rounded-lg border flex items-start gap-3',
              vendorPending ? 'border-chart-3/30' : vendorRejected ? 'border-destructive/30' : 'border-border',
            )}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-muted">
                <Store className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h5 className="font-semibold text-sm">{t.vendorTitle}</h5>
                  {vendorPending && (
                    <Badge variant="outline" className="text-[10px] h-5 gap-1"><Clock className="h-3 w-3" />{t.pending}</Badge>
                  )}
                  {vendorRejected && (
                    <Badge variant="outline" className="text-[10px] h-5 gap-1 border-destructive/50 text-destructive"><XCircle className="h-3 w-3" />{t.rejected}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t.vendorDesc}</p>
              </div>
              {!vendorPending && (
                <Button size="sm" variant="outline" onClick={() => navigate('/vendor-registration')} className="min-h-[44px] text-xs gap-1.5 shrink-0">
                  {t.apply}<ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleUpgradeSection;
