import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Percent,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShoppingCart,
  Sparkles,
  Target,
  Gift,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInDays, differenceInHours } from 'date-fns';

interface GroupDeal {
  id: string;
  creator_id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  cover_image_url: string;
  provider_name: string;
  original_price: number;
  group_price: number;
  discount_percentage: number;
  min_participants: number;
  max_participants: number;
  current_participants: number;
  target_neighborhoods: string[];
  target_cities: string[];
  start_date: string;
  end_date: string;
  status: string;
  is_featured: boolean;
}

const categories = [
  { value: 'all', label: 'All Deals' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'appliances', label: 'Appliances' },
  { value: 'renovation', label: 'Renovation' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'internet', label: 'Internet' },
  { value: 'moving', label: 'Moving' },
];

interface GroupBuyingDealsProps {
  city?: string;
  className?: string;
}

const GroupBuyingDeals: React.FC<GroupBuyingDealsProps> = ({ city, className }) => {
  const { toast } = useToast();
  const [deals, setDeals] = useState<GroupDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [joiningDeal, setJoiningDeal] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
  }, [selectedCategory, city]);

  const fetchDeals = async () => {
    try {
      let query = supabase
        .from('group_deals')
        .select('*')
        .in('status', ['active', 'target_met'])
        .gte('end_date', new Date().toISOString())
        .order('is_featured', { ascending: false })
        .order('discount_percentage', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinDeal = async (dealId: string) => {
    setJoiningDeal(dealId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in', description: 'You need to be signed in to join deals', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('group_deal_participants')
        .insert({
          deal_id: dealId,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already Joined', description: 'You have already joined this deal.', variant: 'destructive' });
        } else {
          throw error;
        }
        return;
      }

      // Update participant count
      const deal = deals.find(d => d.id === dealId);
      if (deal) {
        await supabase
          .from('group_deals')
          .update({ current_participants: (deal.current_participants || 0) + 1 })
          .eq('id', dealId);
      }

      toast({ title: 'Joined Successfully!', description: 'You are now part of this group deal.' });
      fetchDeals();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setJoiningDeal(null);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const days = differenceInDays(end, now);
    const hours = differenceInHours(end, now) % 24;

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const getProgress = (current: number, min: number) => {
    return Math.min((current / min) * 100, 100);
  };

  const DealCard = ({ deal, featured = false }: { deal: GroupDeal; featured?: boolean }) => {
    const progress = getProgress(deal.current_participants || 0, deal.min_participants);
    const isTargetMet = progress >= 100;
    const savings = (deal.original_price || 0) - (deal.group_price || 0);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
      >
        <Card className={cn(
          'overflow-hidden transition-shadow hover:shadow-lg',
          featured && 'ring-2 ring-primary',
          isTargetMet && 'ring-2 ring-green-500'
        )}>
          <div className="relative">
            <img
              src={deal.cover_image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'}
              alt={deal.title}
              className="w-full h-40 object-cover"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              {deal.is_featured && (
                <Badge className="bg-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {isTargetMet && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Target Met!
                </Badge>
              )}
            </div>
            <div className="absolute top-2 right-2">
              <Badge className="bg-red-500 text-white text-lg font-bold px-3">
                -{deal.discount_percentage}%
              </Badge>
            </div>
            <div className="absolute bottom-2 right-2">
              <Badge variant="secondary" className="bg-black/60 text-white">
                <Clock className="h-3 w-3 mr-1" />
                {getTimeRemaining(deal.end_date)}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <Badge variant="outline" className="text-xs capitalize mb-2">
              {deal.category}
            </Badge>

            <h3 className="font-semibold line-clamp-2 mb-1">{deal.title}</h3>

            {deal.provider_name && (
              <p className="text-sm text-muted-foreground mb-3">
                by {deal.provider_name}
              </p>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-primary">
                Rp {(deal.group_price || 0).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                Rp {(deal.original_price || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-green-600 mb-4">
              <Gift className="h-4 w-4" />
              <span>Save Rp {savings.toLocaleString()}</span>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {deal.current_participants || 0} joined
                </span>
                <span className="text-muted-foreground">
                  {deal.min_participants} needed
                </span>
              </div>
              <Progress 
                value={progress} 
                className={cn('h-2', isTargetMet && '[&>div]:bg-green-500')} 
              />
              {!isTargetMet && (
                <p className="text-xs text-muted-foreground text-center">
                  {deal.min_participants - (deal.current_participants || 0)} more to unlock deal
                </p>
              )}
            </div>

            {deal.target_neighborhoods?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {deal.target_neighborhoods.slice(0, 2).map((area, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
                {deal.target_neighborhoods.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{deal.target_neighborhoods.length - 2}
                  </Badge>
                )}
              </div>
            )}

            <Button
              className="w-full"
              disabled={joiningDeal === deal.id}
              onClick={() => handleJoinDeal(deal.id)}
            >
              {joiningDeal === deal.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isTargetMet ? 'Join Now - Deal Active!' : 'Join Group'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const featuredDeals = deals.filter(d => d.is_featured);
  const regularDeals = deals.filter(d => !d.is_featured);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Group Buying Power
          </h2>
          <p className="text-muted-foreground">
            Join neighbors for exclusive group discounts
          </p>
        </div>
        <Button variant="outline">
          Propose a Deal
        </Button>
      </div>

      {/* Stats Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{deals.length}</div>
              <div className="text-sm text-muted-foreground">Active Deals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {deals.reduce((acc, d) => acc + (d.current_participants || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {Math.max(...deals.map(d => d.discount_percentage || 0), 0)}%
              </div>
              <div className="text-sm text-muted-foreground">Max Discount</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
            className="shrink-0"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Featured Deals */}
      {featuredDeals.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Hot Deals
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Deals */}
      <div>
        <h3 className="font-semibold mb-4">All Group Deals</h3>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : regularDeals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularDeals.map(deal => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : featuredDeals.length === 0 ? (
          <Card className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No active deals</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to propose a group deal for your neighborhood!
            </p>
            <Button>Propose a Deal</Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default GroupBuyingDeals;
