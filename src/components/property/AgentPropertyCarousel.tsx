
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { User, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";

interface AgentPropertyCarouselProps {
  currentPropertyId: string;
  ownerId: string;
  agentId?: string;
  ownerType?: string;
  limit?: number;
}

const AgentPropertyCarousel = ({ 
  currentPropertyId, 
  ownerId, 
  agentId, 
  ownerType = 'individual',
  limit = 6 
}: AgentPropertyCarouselProps) => {
  const [agentProperties, setAgentProperties] = useState<any[]>([]);
  const [ownerProperties, setOwnerProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProperties();
  }, [currentPropertyId, ownerId, agentId]);

  const fetchRelatedProperties = async () => {
    setIsLoading(true);
    try {
      // Fetch properties by the same owner
      const { data: ownerProps } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .neq('id', currentPropertyId)
        .eq('status', 'active')
        .limit(limit);

      setOwnerProperties(ownerProps || []);

      // Fetch properties by the same agent (if agent exists)
      if (agentId) {
        const { data: agentProps } = await supabase
          .from('properties')
          .select('*')
          .eq('agent_id', agentId)
          .neq('id', currentPropertyId)
          .eq('status', 'active')
          .limit(limit);

        setAgentProperties(agentProps || []);
      }
    } catch (error) {
      console.error('Error fetching related properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          <div className="h-5 sm:h-6 bg-muted/50 rounded w-1/3 mb-3 sm:mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 sm:h-48 md:h-64 bg-muted/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const PropertyCarouselSection = ({ 
    properties, 
    title, 
    icon: Icon, 
    badgeText 
  }: { 
    properties: any[], 
    title: string, 
    icon: any, 
    badgeText: string 
  }) => {
    if (properties.length === 0) return null;

    return (
      <Card className="border border-primary/10 bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
            <span className="truncate flex-1">{title}</span>
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 flex-shrink-0">{properties.length} properties</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-6">
          {properties.length <= 3 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {properties.map((property) => (
                <CompactPropertyCard
                  key={property.id}
                  property={property}
                  language="en"
                  isSaved={false}
                  onSave={() => {}}
                  onView={() => window.open(`/property/${property.id}`, '_blank')}
                  onView3D={() => {}}
                />
              ))}
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent className="-ml-1.5 sm:-ml-2">
                {properties.map((property) => (
                  <CarouselItem key={property.id} className="pl-1.5 sm:pl-2 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                    <CompactPropertyCard
                      property={property}
                      language="en"
                      isSaved={false}
                      onSave={() => {}}
                      onView={() => window.open(`/property/${property.id}`, '_blank')}
                      onView3D={() => {}}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Agent Properties Section */}
      {agentId && (
        <PropertyCarouselSection
          properties={agentProperties}
          title="More from Agent"
          icon={User}
          badgeText="Agent Listings"
        />
      )}

      {/* Owner Properties Section */}
      <PropertyCarouselSection
        properties={ownerProperties}
        title={`More from ${ownerType === 'company' ? 'Company' : 'Owner'}`}
        icon={Building2}
        badgeText="Owner Listings"
      />
    </div>
  );
};

export default AgentPropertyCarousel;
