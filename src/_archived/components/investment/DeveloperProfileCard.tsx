import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Building2, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeveloperProfile {
  id: string;
  name: string;
  logoUrl?: string;
  rating: number;
  totalProjects: number;
  completedProjects: number;
  onTimeDeliveryPct: number;
  avgAppreciation: number;
  badges: string[];
}

interface DeveloperProfileCardProps {
  developer: DeveloperProfile;
  className?: string;
}

export default function DeveloperProfileCard({ developer, className }: DeveloperProfileCardProps) {
  return (
    <Card className={cn('border-border/50 bg-card hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
            {developer.logoUrl ? (
              <img src={developer.logoUrl} alt={developer.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate">{developer.name}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn('h-3 w-3', i < Math.floor(developer.rating) ? 'fill-gold-primary text-gold-primary' : 'text-muted')}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">{developer.rating}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-md bg-muted/30 border border-border/30">
            <div className="flex items-center gap-1 mb-0.5">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Projects</span>
            </div>
            <p className="text-xs font-bold text-foreground">{developer.completedProjects}/{developer.totalProjects}</p>
          </div>
          <div className="p-2 rounded-md bg-muted/30 border border-border/30">
            <div className="flex items-center gap-1 mb-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">On-Time</span>
            </div>
            <p className="text-xs font-bold text-foreground">{developer.onTimeDeliveryPct}%</p>
          </div>
          <div className="col-span-2 p-2 rounded-md bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-[9px] text-muted-foreground">Avg. Appreciation</span>
            </div>
            <p className="text-xs font-bold text-primary">+{developer.avgAppreciation}%</p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {developer.badges.map(badge => (
            <Badge key={badge} variant="secondary" className="text-[9px] h-5 gap-1 bg-primary/10 text-primary border-primary/20">
              <CheckCircle2 className="h-2.5 w-2.5" />
              {badge}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
