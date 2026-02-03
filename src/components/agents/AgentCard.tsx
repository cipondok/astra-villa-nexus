import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Star, TrendingUp, Crown, Gem, Medal, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  is_verified: boolean;
  phone?: string | null;
  email?: string | null;
  total_listings: number;
  total_sold: number;
  total_rented: number;
  rating: number;
  response_rate: number;
  level_name?: string | null;
}

interface AgentCardProps {
  agent: Agent;
  showVerifiedBadge?: boolean;
}

const getLevelBadgeStyle = (levelName: string | null | undefined) => {
  if (!levelName) return { bg: 'bg-gray-100', text: 'text-gray-700', icon: null, glow: '' };
  
  const name = levelName.toLowerCase();
  if (name.includes('platinum')) return { 
    bg: 'bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100', 
    text: 'text-slate-700', 
    icon: Gem,
    glow: 'shadow-lg shadow-slate-300/50'
  };
  if (name.includes('gold')) return { 
    bg: 'bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-100', 
    text: 'text-amber-700', 
    icon: Crown,
    glow: 'shadow-lg shadow-amber-300/50'
  };
  if (name.includes('silver')) return { 
    bg: 'bg-gradient-to-r from-gray-100 via-slate-200 to-gray-100', 
    text: 'text-gray-600', 
    icon: Medal,
    glow: ''
  };
  if (name.includes('bronze')) return { 
    bg: 'bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100', 
    text: 'text-orange-700', 
    icon: Medal,
    glow: ''
  };
  if (name.includes('vip')) return { 
    bg: 'bg-gradient-to-r from-purple-100 via-violet-200 to-purple-100', 
    text: 'text-purple-700', 
    icon: Crown,
    glow: 'shadow-lg shadow-purple-300/50'
  };
  if (name.includes('premium')) return { 
    bg: 'bg-gradient-to-r from-blue-100 via-sky-200 to-blue-100', 
    text: 'text-blue-700', 
    icon: Star,
    glow: ''
  };
  return { bg: 'bg-gray-100', text: 'text-gray-700', icon: null, glow: '' };
};

const AgentCard = ({ agent, showVerifiedBadge = false }: AgentCardProps) => {
  const levelStyle = getLevelBadgeStyle(agent.level_name);
  const LevelIcon = levelStyle.icon;
  const isSample = agent.id.startsWith('sample');

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500",
      "bg-gradient-to-br from-background via-background to-muted/30",
      "hover:shadow-2xl hover:-translate-y-1",
      "border border-border/50 hover:border-primary/30",
      levelStyle.glow
    )}>
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-60" />
      
      <CardContent className="p-5">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center mb-4">
          {/* Avatar with Verification */}
          <div className="relative mb-3">
            <div className={cn(
              "w-20 h-20 rounded-full overflow-hidden ring-4 transition-all duration-300",
              agent.is_verified 
                ? "ring-blue-500/30 group-hover:ring-blue-500/50" 
                : "ring-border/30 group-hover:ring-primary/30"
            )}>
              {agent.avatar_url ? (
                <img 
                  src={agent.avatar_url} 
                  alt={agent.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {agent.full_name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Facebook-style Verification Badge */}
            {agent.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-background rounded-full p-0.5 shadow-lg">
                <div className="bg-[#1877F2] rounded-full p-1">
                  <BadgeCheck className="h-4 w-4 text-white" strokeWidth={3} />
                </div>
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">
            {agent.full_name}
          </h3>
          
          {/* Level Badge */}
          {agent.level_name && (
            <Badge className={cn(
              "text-[10px] font-semibold px-2.5 py-0.5 rounded-full border-0",
              levelStyle.bg, 
              levelStyle.text
            )}>
              {LevelIcon && <LevelIcon className="h-3 w-3 mr-1" />}
              {agent.level_name}
            </Badge>
          )}

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
            <MapPin className="h-3 w-3" />
            <span>{agent.location || 'Indonesia'}</span>
          </div>
        </div>

        {/* Rating & Response Row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-sm">{agent.rating.toFixed(1)}</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs">{agent.response_rate}%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1 bg-muted/50 rounded-xl p-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{agent.total_listings}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Listings</div>
          </div>
          <div className="text-center border-x border-border/50">
            <div className="text-lg font-bold text-green-600">{agent.total_sold}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Sold</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{agent.total_rented}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Rented</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={isSample ? '#' : `/profile/${agent.id}`} className="flex-1">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full rounded-full font-medium"
            >
              View Profile
            </Button>
          </Link>
          {agent.phone && (
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full px-3"
              asChild
            >
              <a href={`tel:${agent.phone}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
