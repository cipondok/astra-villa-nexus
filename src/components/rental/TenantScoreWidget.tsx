import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Star, UserCheck, ShieldCheck, History, CreditCard, ShieldAlert, Shield } from "lucide-react";
import { useTenantScore } from "@/hooks/useTenantScore";

const riskConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  low: { label: "Risiko Rendah", color: "bg-chart-1/10 text-chart-1 border-chart-1/20", icon: ShieldCheck },
  medium: { label: "Risiko Sedang", color: "bg-chart-3/10 text-chart-3 border-chart-3/20", icon: Shield },
  high: { label: "Risiko Tinggi", color: "bg-destructive/10 text-destructive border-destructive/20", icon: ShieldAlert },
  unknown: { label: "Belum Dinilai", color: "bg-muted text-muted-foreground border-border", icon: Shield },
};

const TenantScoreWidget = () => {
  const { data: score, isLoading } = useTenantScore();

  if (isLoading) {
    return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  if (!score) {
    return (
      <Card className="p-4 border-border">
        <div className="text-center">
          <Star className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Skor belum tersedia. Lengkapi profil untuk meningkatkan skor.</p>
        </div>
      </Card>
    );
  }

  const risk = riskConfig[score.risk_level] || riskConfig.unknown;
  const RiskIcon = risk.icon;

  const categories = [
    { label: "Profil", value: score.profile_score, max: 25, icon: UserCheck, tip: "Lengkapi nama, email, telepon, foto, dan bio" },
    { label: "Verifikasi", value: score.verification_score, max: 25, icon: ShieldCheck, tip: "Verifikasi identitas dan KYC" },
    { label: "Riwayat Sewa", value: score.rental_history_score, max: 25, icon: History, tip: "Riwayat booking & penyelesaian" },
    { label: "Pembayaran", value: score.payment_score, max: 25, icon: CreditCard, tip: "Ketepatan pembayaran invoice" },
  ];

  return (
    <div className="space-y-3">
      {/* Overall score card */}
      <Card className="p-4 border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Star className="h-4 w-4 text-chart-3" /> Skor Penyewa Anda
          </h3>
          <Badge className={`${risk.color} text-[10px] border`}>
            <RiskIcon className="h-3 w-3 mr-0.5" /> {risk.label}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">{score.overall_score}</div>
            <div className="text-[9px] text-muted-foreground">dari 100</div>
          </div>
          <div className="flex-1">
            <Progress value={score.overall_score} className="h-2.5" />
          </div>
        </div>

        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.label} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <cat.icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{cat.label}</span>
                </div>
                <span className="text-[10px] font-semibold text-foreground">{cat.value}/{cat.max}</span>
              </div>
              <Progress value={(cat.value / cat.max) * 100} className="h-1" />
              <p className="text-[8px] text-muted-foreground">{cat.tip}</p>
            </div>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground mt-3 pt-2 border-t border-border">
          Terakhir diperbarui: {new Date(score.last_calculated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </p>
      </Card>
    </div>
  );
};

export default TenantScoreWidget;
