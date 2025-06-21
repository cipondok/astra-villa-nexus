
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
            <Badge variant="outline">{properties.length} properties</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {properties.length <= 3 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <CarouselContent className="-ml-2">
                {properties.map((property) => (
                  <CarouselItem key={property.id} className="pl-2 basis-1/2 sm:basis-1/3 lg:basis-1/4">
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
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Agent Properties Section */}
      {agentId && (
        <PropertyCarouselSection
          properties={agentProperties}
          title="More Properties by This Agent"
          icon={User}
          badgeText="Agent Listings"
        />
      )}

      {/* Owner Properties Section */}
      <PropertyCarouselSection
        properties={ownerProperties}
        title={`More Properties by This ${ownerType === 'company' ? 'Company' : 'Owner'}`}
        icon={Building2}
        badgeText="Owner Listings"
      />
    </div>
  );
};

export default AgentPropertyCarousel;
