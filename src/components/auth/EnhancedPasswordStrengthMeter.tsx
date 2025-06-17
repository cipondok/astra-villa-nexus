
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Info } from "lucide-react";

interface EnhancedPasswordStrengthMeterProps {
  password: string;
  onStrengthChange: (strength: number) => void;
}

interface StrengthCriteria {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

export const EnhancedPasswordStrengthMeter = ({ password, onStrengthChange }: EnhancedPasswordStrengthMeterProps) => {
  const [strength, setStrength] = useState(0);
  const [criteria, setCriteria] = useState<StrengthCriteria[]>([
    { label: "At least 8 characters", test: (p) => p.length >= 8, met: false },
    { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p), met: false },
    { label: "One lowercase letter", test: (p) => /[a-z]/.test(p), met: false },
    { label: "One number", test: (p) => /\d/.test(p), met: false },
    { label: "One special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p), met: false },
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
    if (strength <= 2) return "#E74C3C"; // Red
    if (strength <= 3) return "#F39C12"; // Orange
    if (strength <= 4) return "#3498DB"; // Blue
    return "#2ECC71"; // Green
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  const getStrengthPercentage = () => {
    return (strength / 5) * 100;
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Password Strength</span>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getStrengthColor() }}
          />
          <span 
            className="text-xs font-medium"
            style={{ color: getStrengthColor() }}
          >
            {getStrengthLabel()}
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300 ease-out"
            style={{ 
              width: `${getStrengthPercentage()}%`,
              backgroundColor: getStrengthColor()
            }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {criterion.met ? (
              <CheckCircle className="h-3 w-3 text-[#2ECC71] flex-shrink-0" />
            ) : (
              <XCircle className="h-3 w-3 text-gray-400 flex-shrink-0" />
            )}
            <span className={`${criterion.met ? "text-[#2ECC71]" : "text-gray-500"} transition-colors duration-200`}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>

      {strength >= 3 && (
        <div className="flex items-center gap-2 p-2 bg-[#2ECC71]/10 rounded-lg border border-[#2ECC71]/20">
          <Info className="h-4 w-4 text-[#2ECC71]" />
          <span className="text-xs text-[#2ECC71] font-medium">
            Password meets security requirements
          </span>
        </div>
      )}
    </div>
  );
};
