import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, UserCheck, ShieldAlert, ShieldCheck, Shield, Star, FileText, CreditCard, History } from "lucide-react";
import { useOwnerTenantScores } from "@/hooks/useTenantScore";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const riskConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  low: { label: "Risiko Rendah", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: ShieldCheck },
  medium: { label: "Risiko Sedang", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Shield },
  high: { label: "Risiko Tinggi", color: "bg-destructive/10 text-destructive border-destructive/20", icon: ShieldAlert },
  unknown: { label: "Belum Dinilai", color: "bg-muted text-muted-foreground border-border", icon: Shield },
};

const ScoreBar = ({ label, value, max, icon: Icon }: { label: string; value: number; max: number; icon: React.ElementType }) => (
  <div className="space-y-0.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Icon className="h-2.5 w-2.5 text-muted-foreground" />
        <span className="text-[9px] text-muted-foreground">{label}</span>
      </div>
      <span className="text-[9px] font-semibold text-foreground">{value}/{max}</span>
    </div>
    <Progress value={(value / max) * 100} className="h-1" />
  </div>
);

const OwnerTenantScreening = () => {
  const { data: scores = [], isLoading } = useOwnerTenantScores();

  // Fetch tenant profiles
  const tenantIds = scores.map((s: any) => s.tenant_id);
  const { data: profiles = [] } = useQuery({
    queryKey: ["tenant-profiles", tenantIds],
    queryFn: async () => {
      if (tenantIds.length === 0) return [];
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, phone, verification_status")
        .in("id", tenantIds);
      return data || [];
    },
    enabled: tenantIds.length > 0,
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (scores.length === 0) {
    return (
      <Card className="p-8 border-border">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
            <UserCheck className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Belum Ada Tenant</h3>
          <p className="text-sm text-muted-foreground">Skor penyewa akan muncul saat ada booking aktif.</p>
        </div>
      </Card>
    );
  }

  const lowRisk = scores.filter((s: any) => s.risk_level === "low").length;
  const medRisk = scores.filter((s: any) => s.risk_level === "medium").length;
  const highRisk = scores.filter((s: any) => s.risk_level === "high").length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Risiko Rendah</p>
          <p className="text-xl font-bold text-chart-1">{lowRisk}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Risiko Sedang</p>
          <p className="text-xl font-bold text-chart-3">{medRisk}</p>
        </Card>
        <Card className="p-3 border-border">
          <p className="text-xs text-muted-foreground">Risiko Tinggi</p>
          <p className="text-xl font-bold text-destructive">{highRisk}</p>
        </Card>
      </div>

      {/* Tenant list */}
      <div className="space-y-3">
        {scores.map((score: any) => {
          const profile = profiles.find((p: any) => p.id === score.tenant_id);
          const risk = riskConfig[score.risk_level] || riskConfig.unknown;
          const RiskIcon = risk.icon;

          return (
            <Card key={score.id} className="p-4 border-border">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {profile?.full_name || "Tenant"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground truncate">{profile?.email}</p>
                  </div>
                </div>
                <Badge className={`${risk.color} text-[10px] border flex-shrink-0`}>
                  <RiskIcon className="h-3 w-3 mr-0.5" /> {risk.label}
                </Badge>
              </div>

              {/* Overall score */}
              <div className="flex items-center gap-3 mb-3 bg-muted/40 rounded-lg p-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{score.overall_score}</div>
                  <div className="text-[8px] text-muted-foreground">/ 100</div>
                </div>
                <div className="flex-1">
                  <Progress value={score.overall_score} className="h-2" />
                </div>
                <Star className="h-4 w-4 text-chart-3 flex-shrink-0" />
              </div>

              {/* Score breakdown */}
              <div className="space-y-1.5">
                <ScoreBar label="Profil" value={score.profile_score} max={25} icon={UserCheck} />
                <ScoreBar label="Verifikasi" value={score.verification_score} max={25} icon={ShieldCheck} />
                <ScoreBar label="Riwayat Sewa" value={score.rental_history_score} max={25} icon={History} />
                <ScoreBar label="Pembayaran" value={score.payment_score} max={25} icon={CreditCard} />
              </div>

              {/* Details */}
              {score.score_breakdown && (
                <div className="mt-2 pt-2 border-t border-border grid grid-cols-2 gap-1 text-[9px] text-muted-foreground">
                  <span>Booking: {score.score_breakdown.booking_count || 0}</span>
                  <span>Selesai: {score.score_breakdown.completed_bookings || 0}</span>
                  <span>Invoice dibayar: {score.score_breakdown.paid_invoices || 0}/{score.score_breakdown.total_invoices || 0}</span>
                  <span>KYC: {score.score_breakdown.has_kyc ? "✓" : "✗"}</span>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground mt-2">
                Terakhir dihitung: {new Date(score.last_calculated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OwnerTenantScreening;
