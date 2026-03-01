import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, TrendingUp, PiggyBank, Building2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import ConstructionTimeline, { ConstructionPhase } from './ConstructionTimeline';
import Price from '@/components/ui/Price';

export interface OffPlanProject {
  id: string;
  title: string;
  imageUrl: string;
  location: string;
  city: string;
  developerName: string;
  developerRating: number;
  startingPrice: number;
  estimatedCompletionValue: number;
  completionPct: number;
  launchDate: string;
  estimatedCompletion: string;
  phases: ConstructionPhase[];
  appreciationPct: number;
  rentalYieldPct: number;
  propertyType: string;
  isEarlyBird?: boolean;
  isPreLaunch?: boolean;
  totalUnits?: number;
  unitsSold?: number;
}

interface OffPlanProjectCardProps {
  project: OffPlanProject;
  onClick?: (id: string) => void;
  className?: string;
}

export default function OffPlanProjectCard({ project, onClick, className }: OffPlanProjectCardProps) {
  const capitalGain = ((project.estimatedCompletionValue - project.startingPrice) / project.startingPrice * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn('overflow-hidden border-border/50 bg-card cursor-pointer group hover:shadow-lg transition-all', className)}
        onClick={() => onClick?.(project.id)}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {project.isEarlyBird && (
              <Badge className="text-[9px] bg-gold-primary text-gold-primary-foreground border-0 shadow-sm">
                🐣 Early Bird
              </Badge>
            )}
            {project.isPreLaunch && (
              <Badge className="text-[9px] bg-primary text-primary-foreground border-0 shadow-sm">
                🚀 Pre-Launch
              </Badge>
            )}
          </div>

          {/* Completion ring */}
          <div className="absolute bottom-2 right-2 w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <motion.circle
                cx="18" cy="18" r="15.5" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${project.completionPct * 0.9742} 97.42`}
                initial={{ strokeDasharray: '0 97.42' }}
                animate={{ strokeDasharray: `${project.completionPct * 0.9742} 97.42` }}
                transition={{ duration: 1.2, delay: 0.3 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black text-foreground">{project.completionPct}%</span>
            </div>
          </div>

          {/* Price */}
          <div className="absolute bottom-2 left-2">
            <p className="text-[9px] text-muted-foreground">Starting from</p>
            <p className="text-sm font-black text-foreground"><Price amount={project.startingPrice} short /></p>
          </div>
        </div>

        <CardContent className="p-3 space-y-2.5">
          {/* Title & Location */}
          <div>
            <h3 className="text-sm font-bold text-foreground line-clamp-1">{project.title}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{project.location}</span>
            </div>
          </div>

          {/* Developer */}
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-medium text-foreground">{project.developerName}</span>
            <div className="flex items-center gap-0.5 ml-auto">
              <Star className="h-3 w-3 fill-gold-primary text-gold-primary" />
              <span className="text-[10px] text-muted-foreground">{project.developerRating}</span>
            </div>
          </div>

          {/* Timeline */}
          <ConstructionTimeline phases={project.phases} compact />

          {/* ROI Mini Stats */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="p-1.5 rounded-md bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-[8px] text-muted-foreground">Capital Gain</span>
              </div>
              <p className="text-xs font-bold text-primary">+{capitalGain}%</p>
            </div>
            <div className="p-1.5 rounded-md bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-1">
                <PiggyBank className="h-3 w-3 text-primary" />
                <span className="text-[8px] text-muted-foreground">Rental Yield</span>
              </div>
              <p className="text-xs font-bold text-primary">{project.rentalYieldPct}%</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/30">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Launch: {project.launchDate}</span>
            <span>Handover: {project.estimatedCompletion}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
