import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, User, Store, Briefcase, ArrowRight, 
  CheckCircle, Clock, XCircle, Shield, Sparkles 
} from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';
import AgentRegistrationModal from '@/components/agent/AgentRegistrationModal';
import { cn } from '@/lib/utils';

interface RoleOption {
  id: string;
  role: string;
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  icon: React.ReactNode;
  benefits: string[];
  benefitsId: string[];
  registrationPath?: string;
  color: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'property_owner',
    role: 'property_owner',
    title: 'Property Owner',
    titleId: 'Pemilik Properti',
    description: 'List and manage your own properties',
    descriptionId: 'Daftarkan dan kelola properti Anda sendiri',
    icon: <Building2 className="h-5 w-5" />,
    benefits: ['List unlimited properties', 'Direct buyer inquiries', 'Property analytics'],
    benefitsId: ['Listing properti tak terbatas', 'Pertanyaan langsung pembeli', 'Analitik properti'],
    color: 'text-chart-2 bg-chart-2/10 border-chart-2/30'
  },
  {
    id: 'agent',
    role: 'agent',
    title: 'Real Estate Agent',
    titleId: 'Agen Properti',
    description: 'Become a verified property agent',
    descriptionId: 'Jadi agen properti terverifikasi',
    icon: <Briefcase className="h-5 w-5" />,
    benefits: ['Agent dashboard', 'Lead management', 'Commission tracking', 'Featured listings'],
    benefitsId: ['Dashboard agen', 'Manajemen leads', 'Tracking komisi', 'Listing unggulan'],
    registrationPath: '/agent-registration',
    color: 'text-accent-foreground bg-accent/10 border-accent/30'
  },
  {
    id: 'vendor',
    role: 'vendor',
    title: 'Service Vendor',
    titleId: 'Vendor Layanan',
    description: 'Offer property-related services',
    descriptionId: 'Tawarkan layanan terkait properti',
    icon: <Store className="h-5 w-5" />,
    benefits: ['Service listings', 'Customer bookings', 'Vendor dashboard'],
    benefitsId: ['Listing layanan', 'Booking pelanggan', 'Dashboard vendor'],
    registrationPath: '/vendor-registration',
    color: 'text-chart-1 bg-chart-1/10 border-chart-1/30'
  }
];

const RoleUpgradeSection: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { user } = useAuth();
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();
  const [showAgentModal, setShowAgentModal] = useState(false);

  // Check for pending registration requests
  const { data: pendingRequests } = useQuery({
    queryKey: ['pending-role-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('agent_registration_requests')
        .select('id, status, business_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const text = {
    en: {
      title: 'Account Roles',
      subtitle: 'Upgrade your account to access more features',
      currentRoles: 'Your Current Roles',
      availableUpgrades: 'Available Upgrades',
      pendingRequest: 'Pending Review',
      approved: 'Approved',
      rejected: 'Rejected',
      apply: 'Apply Now',
      active: 'Active',
      benefits: 'Benefits'
    },
    id: {
      title: 'Role Akun',
      subtitle: 'Upgrade akun Anda untuk akses lebih banyak fitur',
      currentRoles: 'Role Anda Saat Ini',
      availableUpgrades: 'Upgrade Tersedia',
      pendingRequest: 'Menunggu Review',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      apply: 'Daftar Sekarang',
      active: 'Aktif',
      benefits: 'Keuntungan'
    }
  };

  const t = text[language];

  const hasRole = (role: string) => userRoles.includes(role as any);
  
  const getPendingStatus = (role: string) => {
    const request = pendingRequests?.find(r => {
      // Map business_type to role
      if (role === 'agent' && ['individual_agent', 'agency', 'developer'].includes(r.business_type)) {
        return true;
      }
      return false;
    });
    return request?.status;
  };

  const handleApply = (option: RoleOption) => {
    if (option.role === 'agent') {
      setShowAgentModal(true);
    } else if (option.registrationPath) {
      navigate(option.registrationPath);
    } else if (option.role === 'property_owner') {
      // For property owner, we can enable directly or show a simple form
      setShowAgentModal(true); // Reuse modal for now
    }
  };

  const activeRoles = ROLE_OPTIONS.filter(opt => hasRole(opt.role));
  const availableRoles = ROLE_OPTIONS.filter(opt => !hasRole(opt.role));

  if (rolesLoading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{t.title}</CardTitle>
              <p className="text-xs text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Current Roles */}
          {activeRoles.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {t.currentRoles}
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeRoles.map(role => (
                  <Badge 
                    key={role.id} 
                    variant="secondary"
                    className={cn("gap-1.5 py-1 px-2.5", role.color)}
                  >
                    {role.icon}
                    <span>{language === 'id' ? role.titleId : role.title}</span>
                    <CheckCircle className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {userRoles.includes('general_user') && activeRoles.length === 0 && (
                  <Badge variant="secondary" className="gap-1.5 py-1 px-2.5">
                    <User className="h-4 w-4" />
                    General User
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Available Upgrades */}
          {availableRoles.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t.availableUpgrades}
              </h4>
              <div className="space-y-3">
                {availableRoles.map(option => {
                  const pendingStatus = getPendingStatus(option.role);
                  const isPending = pendingStatus === 'pending';
                  const isApproved = pendingStatus === 'approved';
                  const isRejected = pendingStatus === 'rejected';

                  return (
                    <div 
                      key={option.id}
                      className={cn(
                        "p-3 rounded-lg border transition-all",
                        isPending ? "bg-chart-3/5 border-chart-3/30" :
                        isRejected ? "bg-destructive/5 border-destructive/30" :
                        "bg-card hover:bg-muted/50 border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          option.color.split(' ')[1]
                        )}>
                          <span className={option.color.split(' ')[0]}>{option.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-sm">
                              {language === 'id' ? option.titleId : option.title}
                            </h5>
                            {isPending && (
                              <Badge variant="outline" className="text-[10px] h-5 gap-1 border-chart-3/50 text-chart-3">
                                <Clock className="h-3 w-3" />
                                {t.pendingRequest}
                              </Badge>
                            )}
                            {isRejected && (
                              <Badge variant="outline" className="text-[10px] h-5 gap-1 border-destructive/50 text-destructive">
                                <XCircle className="h-3 w-3" />
                                {t.rejected}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {language === 'id' ? option.descriptionId : option.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(language === 'id' ? option.benefitsId : option.benefits).slice(0, 3).map((benefit, i) => (
                              <span 
                                key={i}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                              >
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                        {!isPending && (
                          <Button
                            size="sm"
                            onClick={() => handleApply(option)}
                            className="h-8 text-xs gap-1.5 shrink-0"
                          >
                            <Sparkles className="h-3 w-3" />
                            {t.apply}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All roles acquired */}
          {availableRoles.length === 0 && activeRoles.length === ROLE_OPTIONS.length && (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-chart-1 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                You have access to all available roles!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent Registration Modal */}
      <AgentRegistrationModal 
        isOpen={showAgentModal} 
        onClose={() => setShowAgentModal(false)} 
      />
    </>
  );
};

export default RoleUpgradeSection;
