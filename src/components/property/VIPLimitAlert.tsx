import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Crown, AlertTriangle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface VIPLimitAlertProps {
  currentCount: number;
  maxCount: number;
  type: 'property' | 'listing';
  membershipLevel: string;
  showUpgrade?: boolean;
}

export function VIPLimitAlert({ 
  currentCount, 
  maxCount, 
  type, 
  membershipLevel,
  showUpgrade = true 
}: VIPLimitAlertProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const remaining = maxCount - currentCount;
  const percentage = (currentCount / maxCount) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = remaining <= 0;

  const typeLabel = type === 'property' 
    ? (language === 'en' ? 'properties' : 'properti')
    : (language === 'en' ? 'active listings' : 'listing aktif');

  if (isAtLimit) {
    return (
      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-sm font-semibold">
          {language === 'en' ? `${type === 'property' ? 'Property' : 'Listing'} Limit Reached` : 'Batas Tercapai'}
        </AlertTitle>
        <AlertDescription className="text-xs space-y-2">
          <p>
            {language === 'en' 
              ? `You've reached your maximum of ${maxCount} ${typeLabel} for the ${membershipLevel} tier.`
              : `Anda telah mencapai maksimum ${maxCount} ${typeLabel} untuk level ${membershipLevel}.`
            }
          </p>
          {showUpgrade && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs mt-2"
              onClick={() => navigate('/membership')}
            >
              <Crown className="h-3 w-3 mr-1" />
              {language === 'en' ? 'Upgrade VIP Level' : 'Upgrade Level VIP'}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isNearLimit) {
    return (
      <Alert className="border-warning/50 bg-warning/10">
        <Sparkles className="h-4 w-4 text-warning" />
        <AlertTitle className="text-sm font-semibold text-warning">
          {language === 'en' ? 'Approaching Limit' : 'Mendekati Batas'}
        </AlertTitle>
        <AlertDescription className="text-xs space-y-2">
          <p className="text-muted-foreground">
            {language === 'en' 
              ? `You have ${remaining} ${typeLabel} remaining (${currentCount}/${maxCount}).`
              : `Anda memiliki ${remaining} ${typeLabel} tersisa (${currentCount}/${maxCount}).`
            }
          </p>
          <Progress value={percentage} className="h-1.5" />
          {showUpgrade && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 text-[10px] p-1"
              onClick={() => navigate('/membership')}
            >
              <Crown className="h-2.5 w-2.5 mr-1" />
              {language === 'en' ? 'Get more with VIP' : 'Dapatkan lebih dengan VIP'}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

export default VIPLimitAlert;
