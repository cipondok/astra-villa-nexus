import React, { useMemo } from "react";
import { CheckCircle, XCircle, Shield, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { analyzePassword } from "@/lib/passwordPolicy";

interface PasswordStrengthBarProps {
  password: string;
  showTips?: boolean;
  /** Used to warn when the password contains the person's email or name. */
  email?: string;
  name?: string;
}

const strengthStyles = {
  weak: { text: "Weak", icon: ShieldAlert, color: "text-destructive", bar: "bg-destructive" },
  fair: { text: "Fair", icon: Shield, color: "text-chart-3", bar: "bg-chart-3" },
  good: { text: "Good", icon: Shield, color: "text-chart-4", bar: "bg-chart-4" },
  strong: { text: "Strong", icon: ShieldCheck, color: "text-chart-1", bar: "bg-chart-1" },
} as const;

export const PasswordStrengthBar = ({ password, showTips = true, email, name }: PasswordStrengthBarProps) => {
  const analysis = useMemo(() => analyzePassword(password, { email, name }), [password, email, name]);

  if (!password) return null;

  const style = strengthStyles[analysis.strength];
  const StrengthIcon = style.icon;
  const warning = analysis.isCommon || analysis.hasPersonalInfo || analysis.isPredictable ? analysis.error : null;
  const tips = analysis.criteria.filter((c) => !c.met && ["length", "upper", "lower", "number", "special"].includes(c.id));

  return (
    <div className="space-y-2 mt-2" aria-live="polite">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground">Password strength</span>
        <div className="flex items-center gap-1.5">
          <StrengthIcon className={`h-3.5 w-3.5 ${style.color}`} aria-hidden="true" />
          <span className={`text-[10px] font-semibold ${style.color}`}>{style.text}</span>
        </div>
      </div>

      <div className="flex gap-1" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={5} aria-valuenow={analysis.score} aria-valuetext={style.text}>
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${segment <= analysis.score ? style.bar : "bg-muted"}`}
          />
        ))}
      </div>

      {warning && (
        <div className="flex items-start gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-px" aria-hidden="true" />
          <p className="text-[10px] leading-snug text-destructive">{warning}</p>
        </div>
      )}

      {showTips ? (
        <div className="space-y-1">
          {analysis.criteria.map((criterion) => (
            <div key={criterion.id} className="flex items-center gap-2 text-[10px]">
              {criterion.met ? (
                <CheckCircle className="h-3 w-3 text-chart-1 flex-shrink-0" aria-hidden="true" />
              ) : (
                <XCircle className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" aria-hidden="true" />
              )}
              <span className={criterion.met ? "text-chart-1" : "text-muted-foreground"}>{criterion.label}</span>
            </div>
          ))}
        </div>
      ) : (
        !warning && tips.length > 0 && (
          <p className="text-[10px] text-muted-foreground">Add: {tips.map((t) => t.label.replace(/^(At least|Contains) /, "").toLowerCase()).join(", ")}</p>
        )
      )}
    </div>
  );
};
