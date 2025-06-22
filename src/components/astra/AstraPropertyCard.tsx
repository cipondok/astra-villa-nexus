
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building, AlertTriangle, Coins } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description?: string;
  price?: number;
}

interface AstraPropertyCardProps {
  property: Property;
  showTokenFeatures?: boolean;
}

const AstraPropertyCard = ({ property, showTokenFeatures = true }: AstraPropertyCardProps) => {
  // Check if ASTRA tokens are enabled
  const { data: tokenSystemEnabled } = useQuery({
    queryKey: ['astra-token-system-enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'astra_tokens_enabled')
        .eq('category', 'tools')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value === true;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {property.title}
        </CardTitle>
        {property.description && (
          <CardDescription>{property.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {property.price && (
          <div className="mb-4">
            <p className="text-2xl font-bold">${property.price.toLocaleString()}</p>
          </div>
        )}

        {showTokenFeatures && !tokenSystemEnabled && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ASTRA Token features are currently disabled for this property.
            </AlertDescription>
          </Alert>
        )}

        {showTokenFeatures && tokenSystemEnabled && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Coins className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">ASTRA Token Features Available</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Token-gated features and rewards available for this property.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AstraPropertyCard;
