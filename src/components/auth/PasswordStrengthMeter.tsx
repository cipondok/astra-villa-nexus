
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange: (strength: number) => void;
}

interface StrengthCriteria {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export const PasswordStrengthMeter = ({ password, onStrengthChange }: PasswordStrengthMeterProps) => {
  const [strength, setStrength] = useState(0);
  const [criteria, setCriteria] = useState<StrengthCriteria[]>([
    { label: "At least 8 characters", test: (p) => p.length >= 8, met: false },
    { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p), met: false },
    { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p), met: false },
    { label: "Contains number", test: (p) => /\d/.test(p), met: false },
    { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), met: false },
  ]);

  useEffect(() => {
    const updatedCriteria = criteria.map(criterion => ({
      ...criterion,
      met: criterion.test(password)
    }));
    
    setCriteria(updatedCriteria);
    
    const metCount = updatedCriteria.filter(c => c.met).length;
    const newStrength = Math.min(metCount, 5);
    setStrength(newStrength);
    onStrengthChange(newStrength);
  }, [password, onStrengthChange]);

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const getStrengthVariant = (): "destructive" | "secondary" | "default" => {
    if (strength <= 2) return "destructive";
    if (strength <= 3) return "secondary";
    return "default";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Password Strength</span>
        <Badge variant={getStrengthVariant()}>
          {getStrengthLabel()}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={(strength / 5) * 100} 
          className="h-2"
        />
        <div className={`h-1 rounded-full transition-all duration-300 ${getStrengthColor()}`} 
             style={{ width: `${(strength / 5) * 100}%` }} />
      </div>
      
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {criterion.met ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <XCircle className="h-3 w-3 text-gray-400" />
            )}
            <span className={criterion.met ? "text-green-600" : "text-gray-500"}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
