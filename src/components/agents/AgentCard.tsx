import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Phone, Star, CheckCircle, TrendingUp, Crown, Gem, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  if (!levelName) return { bg: 'bg-gray-100', text: 'text-gray-700', icon: null };
  
  const name = levelName.toLowerCase();
  if (name.includes('platinum')) return { bg: 'bg-gradient-to-r from-slate-200 to-slate-300', text: 'text-slate-800', icon: Gem };
  if (name.includes('gold')) return { bg: 'bg-gradient-to-r from-amber-200 to-yellow-300', text: 'text-amber-800', icon: Crown };
  if (name.includes('silver')) return { bg: 'bg-gradient-to-r from-gray-200 to-slate-300', text: 'text-gray-700', icon: Medal };
  if (name.includes('bronze')) return { bg: 'bg-gradient-to-r from-orange-200 to-amber-200', text: 'text-orange-800', icon: Medal };
  if (name.includes('vip')) return { bg: 'bg-purple-100', text: 'text-purple-700', icon: Crown };
  if (name.includes('premium')) return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Star };
  return { bg: 'bg-gray-100', text: 'text-gray-700', icon: null };
};

const AgentCard = ({ agent, showVerifiedBadge = false }: AgentCardProps) => {
  const levelStyle = getLevelBadgeStyle(agent.level_name);
  const LevelIcon = levelStyle.icon;
  const isSample = agent.id.startsWith('sample');

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 bg-background border-border overflow-hidden">
      <CardContent className="p-4">
        {/* Agent Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative">
            <Avatar className="w-14 h-14 border-2 border-primary/20">
              <AvatarImage src={agent.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {agent.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {agent.is_verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                <CheckCircle className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">{agent.full_name}</h3>
            </div>
            
            {/* Level Badge */}
            {agent.level_name && (
              <Badge className={`${levelStyle.bg} ${levelStyle.text} text-[10px] mt-1`}>
                {LevelIcon && <LevelIcon className="h-2.5 w-2.5 mr-1" />}
                {agent.level_name}
              </Badge>
            )}
            
            {agent.is_verified && showVerifiedBadge && !agent.level_name && (
              <Badge className="bg-green-100 text-green-700 text-xs mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}

            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{agent.location || 'Indonesia'}</span>
            </div>
          </div>
        </div>

        {/* Rating & Response */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{agent.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{agent.response_rate}% respon</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center bg-muted/50 rounded-lg p-3 mb-4">
          <div>
            <div className="text-base font-bold text-foreground">{agent.total_listings}</div>
            <div className="text-xs text-muted-foreground">Iklan</div>
          </div>
          <div>
            <div className="text-base font-bold text-foreground">{agent.total_sold}</div>
            <div className="text-xs text-muted-foreground">Terjual</div>
          </div>
          <div>
            <div className="text-base font-bold text-foreground">{agent.total_rented}</div>
            <div className="text-xs text-muted-foreground">Tersewa</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={isSample ? '#' : `/profile/${agent.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              Lihat Profil
            </Button>
          </Link>
          {agent.phone && (
            <Button variant="outline" size="sm" asChild>
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
