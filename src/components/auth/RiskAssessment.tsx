
import React from "react";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface RiskAssessmentProps {
  riskLevel: "low" | "medium" | "high";
  factors: string[];
  className?: string;
}

export const RiskAssessment = ({ riskLevel, factors, className }: RiskAssessmentProps) => {
  const getRiskIcon = () => {
    switch (riskLevel) {
      case "low":
        return <Shield className="h-4 w-4 text-green-600" />;
      case "medium":
        return <Info className="h-4 w-4 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getRiskVariant = () => {
    switch (riskLevel) {
      case "low":
        return "default" as const;
      case "medium":
        return "secondary" as const;
      case "high":
        return "destructive" as const;
    }
  };

  const getRiskDescription = () => {
    switch (riskLevel) {
      case "low":
        return "Normal security behavior detected";
      case "medium":
        return "Some unusual activity detected - additional verification recommended";
      case "high":
        return "High-risk activity detected - multi-factor authentication required";
    }
  };

  return (
    <div className={className}>
      <Alert variant={getRiskVariant()}>
        {getRiskIcon()}
        <AlertDescription>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Security Assessment</span>
            <Badge variant={getRiskVariant()}>
              {riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
          <p className="text-sm mb-3">{getRiskDescription()}</p>
          
          {factors.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">Risk Factors:</p>
              <ul className="text-xs space-y-1">
                {factors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-current rounded-full" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};
