import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Star,
  Heart,
  Eye,
  Clock,
  User,
  Shield,
  Train,
  Building2,
  Users,
  DollarSign,
  ChevronRight,
  Search,
  Plus,
  TrendingUp,
  Sparkles,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NeighborhoodGuide {
  id: string;
  neighborhood_name: string;
  city: string;
  title: string;
  slug: string;
  summary: string;
  cover_image_url: string;
  tags: string[];
  ratings: {
    safety: number;
    transport: number;
    amenities: number;
    community: number;
    value: number;
  };
  view_count: number;
  like_count: number;
  is_featured: boolean;
  author_id: string;
  created_at: string;
}

const ratingCategories = [
  { key: 'safety', label: 'Safety', icon: Shield },
  { key: 'transport', label: 'Transport', icon: Train },
  { key: 'amenities', label: 'Amenities', icon: Building2 },
  { key: 'community', label: 'Community', icon: Users },
  { key: 'value', label: 'Value', icon: DollarSign },
];

const NeighborhoodGuides: React.FC = () => {
  const { toast } = useToast();
  const [guides, setGuides] = useState<NeighborhoodGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      const { data, error } = await supabase
        .from('neighborhood_guides')
        .select('*')
        .eq('status', 'published')
        .order('is_featured', { ascending: false })
        .order('view_count', { ascending: false });

      if (error) throw error;
      setGuides((data || []).map(g => ({
        ...g,
        ratings: g.ratings as NeighborhoodGuide['ratings']
      })));
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = !searchQuery || 
      guide.neighborhood_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = !selectedCity || guide.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const cities = [...new Set(guides.map(g => g.city))];
  const featuredGuides = filteredGuides.filter(g => g.is_featured);
  const regularGuides = filteredGuides.filter(g => !g.is_featured);

  const RatingBar = ({ value, label, icon: Icon }: { value: number; label: string; icon: React.ElementType }) => (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <Progress value={value * 20} className="h-1.5 flex-1" />
      <span className="text-xs font-medium w-6 text-right">{value}</span>
    </div>
  );

  const GuideCard = ({ guide, featured = false }: { guide: NeighborhoodGuide; featured?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'overflow-hidden cursor-pointer transition-shadow hover:shadow-lg',
        featured && 'ring-2 ring-primary'
      )}>
        <div className="relative">
          <img 
            src={guide.cover_image_url || 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800'} 
            alt={guide.neighborhood_name}
            className={cn('w-full object-cover', featured ? 'h-48' : 'h-36')}
          />
          {guide.is_featured && (
            <Badge className="absolute top-2 left-2 bg-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          <div className="absolute bottom-2 right-2 flex gap-2">
            <Badge variant="secondary" className="bg-black/60 text-white">
              <Eye className="h-3 w-3 mr-1" />
              {guide.view_count}
            </Badge>
            <Badge variant="secondary" className="bg-black/60 text-white">
              <Heart className="h-3 w-3 mr-1" />
              {guide.like_count}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold line-clamp-1">{guide.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {guide.neighborhood_name}, {guide.city}
              </p>
            </div>
          </div>
          
          {guide.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {guide.summary}
            </p>
          )}
          
          {featured && (
            <div className="space-y-1.5 mb-3">
              {ratingCategories.map(cat => (
                <RatingBar 
                  key={cat.key} 
                  value={guide.ratings?.[cat.key as keyof typeof guide.ratings] || 0}
                  label={cat.label}
                  icon={cat.icon}
                />
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-1">
            {guide.tags?.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Neighborhood Guides
          </h2>
          <p className="text-muted-foreground">
            Discover local insights from community members
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Guide
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search neighborhoods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedCity === null ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setSelectedCity(null)}
          >
            All
          </Button>
          {cities.slice(0, 5).map(city => (
            <Button
              key={city}
              variant={selectedCity === city ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Guides */}
      {featuredGuides.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Featured Guides
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredGuides.map(guide => (
              <GuideCard key={guide.id} guide={guide} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Guides */}
      <div>
        <h3 className="font-semibold mb-4">All Guides</h3>
        {regularGuides.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regularGuides.map(guide => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No guides yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to share your neighborhood insights!
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create the First Guide
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NeighborhoodGuides;
