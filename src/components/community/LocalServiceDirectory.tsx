import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Wrench,
  Star,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  ExternalLink,
  MessageCircle,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceProvider {
  id: string;
  business_name: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  logo_url: string;
  contact_phone: string;
  contact_whatsapp: string;
  city: string;
  service_areas: string[];
  price_range: string;
  rating_avg: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
}

const categories = [
  { value: 'all', label: 'All Services', icon: Wrench },
  { value: 'plumbing', label: 'Plumbing', icon: Wrench },
  { value: 'electrical', label: 'Electrical', icon: Wrench },
  { value: 'cleaning', label: 'Cleaning', icon: Wrench },
  { value: 'moving', label: 'Moving', icon: Wrench },
  { value: 'renovation', label: 'Renovation', icon: Wrench },
  { value: 'landscaping', label: 'Landscaping', icon: Wrench },
  { value: 'security', label: 'Security', icon: Wrench },
  { value: 'pest_control', label: 'Pest Control', icon: Wrench },
];

interface LocalServiceDirectoryProps {
  city?: string;
  className?: string;
}

const LocalServiceDirectory: React.FC<LocalServiceDirectoryProps> = ({ city, className }) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState(city || '');

  useEffect(() => {
    fetchProviders();
  }, [selectedCategory, selectedCity]);

  const fetchProviders = async () => {
    try {
      let query = supabase
        .from('local_service_providers')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('rating_avg', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProviders = providers.filter(provider => 
    !searchQuery || 
    provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredProviders = filteredProviders.filter(p => p.is_featured);
  const regularProviders = filteredProviders.filter(p => !p.is_featured);

  const handleWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hi, I found your business "${name}" on Astra Villa. I'd like to inquire about your services.`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const ProviderCard = ({ provider, featured = false }: { provider: ServiceProvider; featured?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className={cn(
        'overflow-hidden transition-shadow hover:shadow-lg',
        featured && 'ring-2 ring-primary'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className={cn('shrink-0', featured ? 'h-16 w-16' : 'h-12 w-12')}>
              <AvatarImage src={provider.logo_url} />
              <AvatarFallback className="text-lg">
                {provider.business_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {provider.business_name}
                    {provider.is_verified && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs capitalize">
                      {provider.category.replace('_', ' ')}
                    </Badge>
                    {provider.subcategory && (
                      <span className="text-xs">{provider.subcategory}</span>
                    )}
                  </div>
                </div>
                
                {featured && (
                  <Badge className="bg-primary shrink-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              {provider.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {provider.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {provider.rating_avg?.toFixed(1) || 'New'} ({provider.review_count || 0})
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {provider.city}
                </span>
                {provider.price_range && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {provider.price_range}
                  </span>
                )}
              </div>
              
              {provider.service_areas?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {provider.service_areas.slice(0, 3).map((area, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {provider.service_areas.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{provider.service_areas.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 mt-3">
                {provider.contact_whatsapp && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleWhatsApp(provider.contact_whatsapp, provider.business_name)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                )}
                {provider.contact_phone && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`tel:${provider.contact_phone}`, '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Local Service Providers
          </h2>
          <p className="text-muted-foreground">
            Trusted professionals recommended by the community
          </p>
        </div>
        <Button variant="outline">
          Add Your Business
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Pills */}
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

      {/* Featured Providers */}
      {featuredProviders.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Featured Providers
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {featuredProviders.map(provider => (
              <ProviderCard key={provider.id} provider={provider} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Providers */}
      <div>
        <h3 className="font-semibold mb-4">
          {selectedCategory === 'all' ? 'All Providers' : categories.find(c => c.value === selectedCategory)?.label}
        </h3>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : regularProviders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {regularProviders.map(provider => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No providers found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedCategory !== 'all' 
                ? `No ${selectedCategory.replace('_', ' ')} providers available yet.`
                : 'Be the first to list your business!'}
            </p>
            <Button>List Your Business</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LocalServiceDirectory;
