import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { User, Building2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Rumah123PropertyCard from "@/components/property/Rumah123PropertyCard";
import { motion } from "framer-motion";

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
      const { data: ownerProps } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', ownerId)
        .neq('id', currentPropertyId)
        .eq('status', 'active')
        .limit(limit);

      setOwnerProperties(ownerProps || []);

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
          <div className="h-5 sm:h-6 bg-muted rounded w-1/3 mb-3 sm:mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-36 sm:h-48 md:h-64 bg-muted rounded-lg"></div>
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="p-3 sm:p-4 md:p-5 pb-2 sm:pb-3 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
              <span className="truncate flex-1 font-semibold text-foreground">{title}</span>
              <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5 bg-primary/10 text-primary border-0">
                {properties.length} listings
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-5">
            {properties.length <= 3 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {properties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Rumah123PropertyCard
                      property={property}
                      language="en"
                      isSaved={false}
                      onSave={() => {}}
                      onView={() => window.open(`/property/${property.id}`, '_blank')}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent className="-ml-2">
                  {properties.map((property, index) => (
                    <CarouselItem key={property.id} className="pl-2 basis-1/2 sm:basis-1/3 lg:basis-1/4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Rumah123PropertyCard
                          property={property}
                          language="en"
                          isSaved={false}
                          onSave={() => {}}
                          onView={() => window.open(`/property/${property.id}`, '_blank')}
                        />
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex -left-3 bg-card/90 backdrop-blur border-border/50 hover:bg-card" />
                <CarouselNext className="hidden sm:flex -right-3 bg-card/90 backdrop-blur border-border/50 hover:bg-card" />
              </Carousel>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {agentId && (
        <PropertyCarouselSection
          properties={agentProperties}
          title="More from Agent"
          icon={User}
          badgeText="Agent Listings"
        />
      )}

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
