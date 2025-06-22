
import React from 'react';
import { AlertTriangle, Shield, AlertCircle } from 'lucide-react';

interface RiskAssessmentProps {
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  className?: string;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ 
  riskLevel, 
  factors, 
  className = '' 
}) => {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'high':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          textColor: 'text-red-700',
          title: 'High Risk Detected'
        };
      case 'medium':
        return {
          icon: AlertCircle,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-500',
          textColor: 'text-orange-700',
          title: 'Medium Risk Activity'
        };
      default:
        return {
          icon: Shield,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          textColor: 'text-green-700',
          title: 'Low Risk'
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <div className={`p-3 ${config.bgColor} border ${config.borderColor} rounded-lg ${className}`}>
      <div className="flex items-start gap-2">
        <Icon className={`h-4 w-4 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h4>
          {factors.length > 0 && (
            <ul className={`text-xs ${config.textColor} mt-1 space-y-0.5`}>
              {factors.map((factor, index) => (
                <li key={index}>• {factor}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
