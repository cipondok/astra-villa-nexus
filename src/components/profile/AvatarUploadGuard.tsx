import React from 'react';
import { AlertTriangle, Mail, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AvatarUploadGuardProps {
  hasEmail: boolean;
  hasPhone: boolean;
  onEditProfile?: () => void;
  className?: string;
}

const AvatarUploadGuard: React.FC<AvatarUploadGuardProps> = ({
  hasEmail,
  hasPhone,
  onEditProfile,
  className,
}) => {
  const canUpload = hasEmail && hasPhone;

  if (canUpload) return null;

  const missingItems = [];
  if (!hasEmail) missingItems.push('email');
  if (!hasPhone) missingItems.push('phone number');

  return (
    <div className={cn(
      "flex flex-col items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-center",
      className
    )}>
      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
        <Shield className="h-5 w-5 text-destructive" />
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium">Verification Required</p>
        <p className="text-xs text-muted-foreground">
          To prevent spam and inappropriate content, please add your{' '}
          {missingItems.join(' and ')} before uploading a profile photo.
        </p>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className={cn(
          "flex items-center gap-1.5",
          hasEmail ? "text-primary" : "text-muted-foreground"
        )}>
          <Mail className="h-3.5 w-3.5" />
          <span>{hasEmail ? 'Email ✓' : 'Email required'}</span>
        </div>
        <div className={cn(
          "flex items-center gap-1.5",
          hasPhone ? "text-primary" : "text-muted-foreground"
        )}>
          <Phone className="h-3.5 w-3.5" />
          <span>{hasPhone ? 'Phone ✓' : 'Phone required'}</span>
        </div>
      </div>

      {onEditProfile && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditProfile}
          className="mt-2"
        >
          Complete Profile
        </Button>
      )}
    </div>
  );
};

export default AvatarUploadGuard;
