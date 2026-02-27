import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Star, TrendingUp, Crown, Gem, Medal, BadgeCheck, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  review_count?: number;
  latest_review?: string | null;
}

interface AgentCardProps {
  agent: Agent;
  showVerifiedBadge?: boolean;
  index?: number;
}

const getLevelBadgeStyle = (levelName: string | null | undefined) => {
  if (!levelName) return { bg: 'bg-muted', text: 'text-muted-foreground', icon: null, glow: '', ring: 'ring-border/30' };
  
  const name = levelName.toLowerCase();
  if (name.includes('platinum')) return { 
    bg: 'bg-gradient-to-r from-gold-primary/15 via-gold-primary/25 to-gold-primary/15', 
    text: 'text-gold-primary', 
    icon: Gem,
    glow: 'shadow-lg shadow-gold-primary/20',
    ring: 'ring-gold-primary/40'
  };
  if (name.includes('gold')) return { 
    bg: 'bg-gradient-to-r from-gold-primary/10 via-gold-primary/20 to-gold-primary/10', 
    text: 'text-gold-primary', 
    icon: Crown,
    glow: 'shadow-md shadow-gold-primary/15',
    ring: 'ring-gold-primary/30'
  };
  if (name.includes('silver')) return { 
    bg: 'bg-gradient-to-r from-muted via-muted/80 to-muted', 
    text: 'text-muted-foreground', 
    icon: Medal,
    glow: '',
    ring: 'ring-border/40'
  };
  if (name.includes('bronze')) return { 
    bg: 'bg-gradient-to-r from-chart-3/10 via-chart-3/5 to-chart-3/10', 
    text: 'text-chart-3', 
    icon: Medal,
    glow: '',
    ring: 'ring-chart-3/20'
  };
  if (name.includes('vip')) return { 
    bg: 'bg-gradient-to-r from-gold-primary/10 via-gold-primary/20 to-gold-primary/10', 
    text: 'text-gold-primary', 
    icon: Crown,
    glow: 'shadow-md shadow-gold-primary/15',
    ring: 'ring-gold-primary/30'
  };
  if (name.includes('premium')) return { 
    bg: 'bg-gradient-to-r from-chart-4/10 via-chart-4/20 to-chart-4/10', 
    text: 'text-chart-4', 
    icon: Star,
    glow: '',
    ring: 'ring-chart-4/20'
  };
  return { bg: 'bg-muted', text: 'text-muted-foreground', icon: null, glow: '', ring: 'ring-border/30' };
};

const renderStars = (rating: number) => {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < full
              ? "fill-gold-primary text-gold-primary"
              : i === full && hasHalf
              ? "fill-gold-primary/50 text-gold-primary"
              : "text-border fill-transparent"
          )}
        />
      ))}
    </div>
  );
};

const AgentCard = ({ agent, showVerifiedBadge = false, index = 0 }: AgentCardProps) => {
  const levelStyle = getLevelBadgeStyle(agent.level_name);
  const LevelIcon = levelStyle.icon;
  const isSample = agent.id.startsWith('sample');
  const reviewCount = agent.review_count ?? Math.floor(agent.total_sold * 0.6 + agent.total_rented * 0.3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-500",
        "bg-card/80 backdrop-blur-sm",
        "hover:shadow-xl hover:shadow-gold-primary/10 hover:-translate-y-1",
        "border border-border/50 hover:border-gold-primary/40",
        levelStyle.glow
      )}>
        {/* Gold accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardContent className="p-5">
          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mb-4">
            {/* Avatar */}
            <div className="relative mb-3">
              <div className={cn(
                "w-20 h-20 rounded-full overflow-hidden ring-[3px] transition-all duration-300",
                agent.is_verified 
                  ? "ring-gold-primary/30 group-hover:ring-gold-primary/60" 
                  : levelStyle.ring + " group-hover:ring-gold-primary/30"
              )}>
                {agent.avatar_url ? (
                  <img 
                    src={agent.avatar_url} 
                    alt={agent.full_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gold-primary/20 to-gold-primary/40 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gold-primary">
                      {agent.full_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Verified Badge */}
              {agent.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-md">
                  <div className="bg-gold-primary rounded-full p-1">
                    <BadgeCheck className="h-3.5 w-3.5 text-background" strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="font-semibold text-foreground text-base leading-tight mb-1 group-hover:text-gold-primary transition-colors duration-300">
              {agent.full_name}
            </h3>
            
            {/* Level Badge */}
            {agent.level_name && (
              <Badge className={cn(
                "text-[9px] font-semibold px-2.5 py-0.5 rounded-full border-0 mb-1.5",
                levelStyle.bg, 
                levelStyle.text
              )}>
                {LevelIcon && <LevelIcon className="h-2.5 w-2.5 mr-1" />}
                {agent.level_name}
              </Badge>
            )}

            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{agent.location || 'Indonesia'}</span>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {renderStars(agent.rating)}
            <span className="text-sm font-bold text-foreground">{agent.rating.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Response Rate */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-chart-1/10">
              <TrendingUp className="h-3 w-3 text-chart-1" />
              <span className="text-[10px] font-medium text-chart-1">{agent.response_rate}% response</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-1 bg-muted/40 rounded-xl p-2.5 mb-3">
            <div className="text-center">
              <div className="text-base font-bold text-foreground">{agent.total_listings}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Listings</div>
            </div>
            <div className="text-center border-x border-border/30">
              <div className="text-base font-bold text-chart-1">{agent.total_sold}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Sold</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-chart-4">{agent.total_rented}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Rented</div>
            </div>
          </div>

          {/* Review snippet */}
          {agent.latest_review && (
            <div className="mb-3 px-3 py-2 bg-gold-primary/5 rounded-lg border border-gold-primary/10">
              <div className="flex items-start gap-1.5">
                <MessageSquare className="h-3 w-3 text-gold-primary mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-muted-foreground italic line-clamp-2">
                  "{agent.latest_review}"
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link to={isSample ? '#' : `/profile/${agent.id}`} className="flex-1">
              <Button 
                variant="default" 
                size="sm" 
                className="w-full rounded-full font-medium bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background hover:from-gold-primary/90 hover:to-gold-primary/70 shadow-sm shadow-gold-primary/20"
              >
                View Profile
              </Button>
            </Link>
            {agent.phone && (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full px-3 border-gold-primary/20 hover:bg-gold-primary/10 hover:border-gold-primary/40"
                asChild
              >
                <a href={`tel:${agent.phone}`}>
                  <Phone className="h-4 w-4 text-gold-primary" />
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AgentCard;
