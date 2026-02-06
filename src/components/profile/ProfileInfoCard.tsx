import React from 'react';
import { User, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isHighlighted?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, isHighlighted }) => (
  <div className={cn(
    "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
    isHighlighted ? "bg-primary/5 border border-primary/10" : "bg-muted/30"
  )}>
    <span className="text-muted-foreground">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn(
        "text-sm font-medium truncate",
        value.includes('Not set') && "text-muted-foreground italic"
      )}>
        {value}
      </p>
    </div>
  </div>
);

interface ProfileDisplayProps {
  email: string;
  fullName?: string;
  phone?: string;
  companyName?: string;
  businessAddress?: string;
  bio?: string;
  notSetText: string;
  labels: {
    email: string;
    name: string;
    phone: string;
    company: string;
    address: string;
    bio: string;
  };
}

const ProfileInfoCard: React.FC<ProfileDisplayProps> = ({
  email,
  fullName,
  phone,
  companyName,
  businessAddress,
  bio,
  notSetText,
  labels,
}) => {
  // Parse the business address JSON to display formatted location
  const getFormattedAddress = (addressStr?: string): string => {
    if (!addressStr) return notSetText;
    
    try {
      const addr = JSON.parse(addressStr);
      const parts: string[] = [];
      
      if (addr.building_address) parts.push(addr.building_address);
      if (addr.subdistrict_name) parts.push(addr.subdistrict_name);
      if (addr.district_name) parts.push(addr.district_name);
      if (addr.city_name) parts.push(addr.city_name);
      if (addr.province_name) parts.push(addr.province_name);
      
      return parts.length > 0 ? parts.join(', ') : notSetText;
    } catch {
      // If not JSON, return raw string
      return addressStr || notSetText;
    }
  };

  return (
    <div className="space-y-2">
      <InfoRow 
        icon={<Mail className="h-4 w-4" />} 
        label={labels.email} 
        value={email} 
        isHighlighted
      />
      <InfoRow 
        icon={<User className="h-4 w-4" />} 
        label={labels.name} 
        value={fullName || notSetText} 
      />
      <InfoRow 
        icon={<Phone className="h-4 w-4" />} 
        label={labels.phone} 
        value={phone || notSetText} 
      />
      <InfoRow 
        icon={<Building2 className="h-4 w-4" />} 
        label={labels.company} 
        value={(companyName || notSetText).toUpperCase()} 
      />
      <InfoRow 
        icon={<MapPin className="h-4 w-4" />} 
        label={labels.address} 
        value={getFormattedAddress(businessAddress)} 
      />
      {bio && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">{labels.bio}</p>
          <p className="text-sm leading-relaxed">{bio}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileInfoCard;
