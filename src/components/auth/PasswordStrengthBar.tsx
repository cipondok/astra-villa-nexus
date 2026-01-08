import React, { useMemo } from "react";
import { CheckCircle, XCircle, Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface PasswordStrengthBarProps {
  password: string;
  showTips?: boolean;
}

interface Criteria {
  label: string;
  met: boolean;
}

export const PasswordStrengthBar = ({ password, showTips = true }: PasswordStrengthBarProps) => {
  const analysis = useMemo(() => {
    const criteria: Criteria[] = [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /\d/.test(password) },
      { label: "Contains special character (!@#$%^&*)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const score = criteria.filter(c => c.met).length;
    
    let strength: 'weak' | 'fair' | 'good' | 'strong';
    let color: string;
    let bgColor: string;
    
    if (score <= 2) {
      strength = 'weak';
      color = 'bg-red-500';
      bgColor = 'bg-red-100';
    } else if (score === 3) {
      strength = 'fair';
      color = 'bg-amber-500';
      bgColor = 'bg-amber-100';
    } else if (score === 4) {
      strength = 'good';
      color = 'bg-blue-500';
      bgColor = 'bg-blue-100';
    } else {
      strength = 'strong';
      color = 'bg-green-500';
      bgColor = 'bg-green-100';
    }

    // Generate tips based on unmet criteria
    const tips = criteria.filter(c => !c.met).map(c => c.label);

    return { criteria, score, strength, color, bgColor, tips };
  }, [password]);

  if (!password) return null;

  const strengthLabels = {
    weak: { text: 'Weak', icon: ShieldAlert, color: 'text-red-600' },
    fair: { text: 'Fair', icon: Shield, color: 'text-amber-600' },
    good: { text: 'Good', icon: Shield, color: 'text-blue-600' },
    strong: { text: 'Strong', icon: ShieldCheck, color: 'text-green-600' },
  };

  const StrengthIcon = strengthLabels[analysis.strength].icon;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength indicator header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Password Strength</span>
        <div className="flex items-center gap-1.5">
          <StrengthIcon className={`h-4 w-4 ${strengthLabels[analysis.strength].color}`} />
          <span className={`text-xs font-semibold ${strengthLabels[analysis.strength].color}`}>
            {strengthLabels[analysis.strength].text}
          </span>
        </div>
      </div>

      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              segment <= analysis.score ? analysis.color : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Criteria checklist */}
      {showTips && (
        <div className="space-y-1.5">
          {analysis.criteria.map((criterion, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              {criterion.met ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
              )}
              <span className={criterion.met ? "text-green-600" : "text-muted-foreground"}>
                {criterion.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Improvement tips */}
      {showTips && analysis.tips.length > 0 && analysis.strength !== 'strong' && (
        <div className="p-2.5 bg-muted/50 rounded-lg border border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-1">💡 Tips to strengthen:</p>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {analysis.tips.slice(0, 2).map((tip, i) => (
              <li key={i}>• Add {tip.toLowerCase()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
