import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Building2, 
  Landmark, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle,
  BadgeCheck,
  Building,
  Award,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { UserMembershipBadge } from '@/components/user/UserMembershipBadge';
import UserStatusBadge from '@/components/ui/UserStatusBadge';

interface PosterInfo {
  id: string;
  name: string;
  avatar_url?: string;
  poster_type?: 'personal' | 'pt' | 'developer';
  company_name?: string;
  company_pt_name?: string;
  developer_name?: string;
  position?: string;
  rating?: number;
  user_level?: string;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'trusted' | 'premium';
  total_properties?: number;
  joining_date?: string;
  customer_feedback_rating?: number;
  customer_feedback_count?: number;
  whatsapp_number?: string;
  phone_number?: string;
  office_address?: string;
  license_number?: string;
  experience_years?: number;
}

interface PropertyPosterInfoProps {
  poster: PosterInfo;
  onWhatsApp?: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  onScheduleViewing?: () => void;
  isAuthenticated?: boolean;
  className?: string;
}

export const PropertyPosterInfo: React.FC<PropertyPosterInfoProps> = ({
  poster,
  onWhatsApp,
  onCall,
  onEmail,
  onScheduleViewing,
  isAuthenticated = false,
  className,
}) => {
  const getPosterTypeInfo = (type?: string) => {
    switch (type) {
      case 'developer':
        return {
          icon: Landmark,
          label: 'Developer',
          color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          description: 'Pengembang Properti Resmi'
        };
      case 'pt':
        return {
          icon: Building2,
          label: 'Perusahaan (PT)',
          color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          description: 'Agen Properti Terdaftar'
        };
      default:
        return {
          icon: User,
          label: 'Perorangan',
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
          description: 'Pemilik Langsung'
        };
    }
  };

  const getVerificationInfo = (status?: string) => {
    switch (status) {
      case 'premium':
        return {
          icon: Award,
          label: 'Premium Verified',
          color: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white',
          description: 'Terverifikasi Premium'
        };
      case 'trusted':
        return {
          icon: ShieldCheck,
          label: 'Trusted',
          color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
          description: 'Terpercaya & Terverifikasi'
        };
      case 'verified':
        return {
          icon: BadgeCheck,
          label: 'Verified',
          color: 'bg-green-500/10 text-green-600 border-green-500/20',
          description: 'Identitas Terverifikasi'
        };
      case 'pending':
        return {
          icon: Shield,
          label: 'Pending',
          color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
          description: 'Sedang Diverifikasi'
        };
      default:
        return {
          icon: ShieldAlert,
          label: 'Unverified',
          color: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
          description: 'Belum Terverifikasi'
        };
    }
  };

  const posterType = getPosterTypeInfo(poster.poster_type);
  const verificationInfo = getVerificationInfo(poster.verification_status);
  const PosterIcon = posterType.icon;
  const VerifyIcon = verificationInfo.icon;

  return (
    <Card className={`border border-primary/10 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          Informasi Pemasang
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Section */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-0.5 shadow-lg">
              <Avatar className="w-full h-full rounded-[10px]">
                <AvatarImage src={poster.avatar_url} alt={poster.name} className="object-cover" />
                <AvatarFallback className="rounded-[10px] bg-gradient-to-br from-primary/30 to-accent/30 text-lg font-bold">
                  {poster.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="absolute -bottom-1 -right-1">
              <UserStatusBadge status={poster.verification_status || 'unverified'} size="sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-bold text-sm sm:text-base text-foreground truncate">{poster.name}</h4>
              {poster.user_level && (
                <UserMembershipBadge 
                  membershipLevel={poster.user_level} 
                  size="xs" 
                  variant="pill"
                  showIcon={true}
                />
              )}
            </div>
            
            {/* Poster Type Badge */}
            <div className="flex items-center gap-1.5 mb-2">
              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 gap-1 ${posterType.color}`}>
                <PosterIcon className="h-3 w-3" />
                {posterType.label}
              </Badge>
            </div>

            {/* Rating & Experience */}
            <div className="flex items-center gap-3 text-xs">
              {poster.customer_feedback_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{poster.customer_feedback_rating}</span>
                  {poster.customer_feedback_count && (
                    <span className="text-muted-foreground">({poster.customer_feedback_count})</span>
                  )}
                </div>
              )}
              {poster.experience_years && (
                <span className="text-muted-foreground">
                  {poster.experience_years} tahun pengalaman
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
          poster.verification_status === 'premium' || poster.verification_status === 'trusted'
            ? 'bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 border-green-500/20'
            : 'bg-muted/30 border-border/30'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            poster.verification_status === 'premium' 
              ? 'bg-gradient-to-br from-amber-400 to-yellow-500' 
              : poster.verification_status === 'trusted' || poster.verification_status === 'verified'
                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                : 'bg-muted'
          }`}>
            <VerifyIcon className={`h-5 w-5 ${
              poster.verification_status === 'premium' || poster.verification_status === 'trusted' || poster.verification_status === 'verified'
                ? 'text-white'
                : 'text-muted-foreground'
            }`} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">{verificationInfo.label}</div>
            <div className="text-xs text-muted-foreground">{verificationInfo.description}</div>
          </div>
        </div>

        {/* Company Info (for PT or Developer) */}
        {(poster.poster_type === 'pt' || poster.poster_type === 'developer') && poster.company_name && (
          <div className="p-3 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">{poster.company_name}</span>
            </div>
            {poster.company_pt_name && (
              <p className="text-xs text-muted-foreground mb-1">{poster.company_pt_name}</p>
            )}
            {poster.office_address && (
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>{poster.office_address}</span>
              </div>
            )}
            {poster.license_number && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Shield className="h-3 w-3" />
                <span>Lisensi: {poster.license_number}</span>
              </div>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {poster.total_properties && (
            <div className="text-center p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/15">
              <div className="font-bold text-lg text-primary">{poster.total_properties}+</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Properti Terdaftar</div>
            </div>
          )}
          {poster.joining_date && (
            <div className="text-center p-3 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/15">
              <div className="font-bold text-sm text-accent flex items-center justify-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDistanceToNow(new Date(poster.joining_date), { locale: id, addSuffix: false })}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">Bergabung</div>
            </div>
          )}
        </div>

        {/* Contact Buttons */}
        <div className="space-y-2.5 pt-2">
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-11 text-sm font-semibold shadow-lg shadow-green-500/20 rounded-xl"
            onClick={onWhatsApp}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <div className="grid grid-cols-2 gap-2.5">
            <Button 
              variant="outline" 
              className="h-10 text-sm rounded-xl border-border/50 bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/30"
              onClick={onCall}
            >
              <Phone className="h-4 w-4 mr-1.5" />
              Telepon
            </Button>
            <Button 
              variant="outline" 
              className="h-10 text-sm rounded-xl border-border/50 bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/30"
              onClick={onEmail}
            >
              <Mail className="h-4 w-4 mr-1.5" />
              Email
            </Button>
          </div>
          {onScheduleViewing && (
            <Button 
              variant="outline"
              className="w-full mt-2 h-11 text-sm font-semibold rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={onScheduleViewing}
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Jadwalkan Kunjungan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyPosterInfo;
