
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Crown, 
  Lock, 
  Unlock,
  AlertTriangle,
  Coins,
  Star
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description?: string;
  price?: number;
  isPremium?: boolean;
  tokenRequirement?: number;
}

interface PremiumListingProps {
  property: Property;
  onUnlock?: () => void;
}

const PremiumListing = ({ property, onUnlock }: PremiumListingProps) => {
  const { user, isAuthenticated } = useAuth();

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

  // Mock user token balance (would be fetched from actual balance table when implemented)
  const mockUserBalance = 100;
  const requiredTokens = property.tokenRequirement || 50;
  const hasEnoughTokens = mockUserBalance >= requiredTokens;

  const handleUnlock = () => {
    if (!isAuthenticated) {
      return;
    }

    if (!tokenSystemEnabled) {
      return;
    }

    if (hasEnoughTokens && onUnlock) {
      onUnlock();
    }
  };

  if (!property.isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
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
          <Badge variant="outline">Standard Listing</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          {property.title}
          <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
        </CardTitle>
        {property.description && (
          <CardDescription>{property.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {property.price && (
          <div className="mb-4">
            <p className="text-2xl font-bold">${property.price.toLocaleString()}</p>
          </div>
        )}

        {!tokenSystemEnabled ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ASTRA Token system is currently disabled. Premium features are not available.
            </AlertDescription>
          </Alert>
        ) : !isAuthenticated ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access premium listings with ASTRA tokens.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Token Requirement</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{requiredTokens} ASTRA</div>
                <div className="text-sm text-muted-foreground">
                  Your balance: {mockUserBalance} ASTRA
                </div>
              </div>
            </div>

            {hasEnoughTokens ? (
              <Button 
                onClick={handleUnlock}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                <Unlock className="h-4 w-4 mr-2" />
                Unlock Premium Details ({requiredTokens} ASTRA)
              </Button>
            ) : (
              <div className="space-y-3">
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    You need {requiredTokens - mockUserBalance} more ASTRA tokens to unlock this premium listing.
                  </AlertDescription>
                </Alert>
                <Button 
                  disabled
                  variant="outline"
                  className="w-full"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Insufficient Tokens
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-yellow-200">
          <h4 className="font-medium mb-2">Premium Features Include:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Detailed property analytics</li>
            <li>• Virtual tour access</li>
            <li>• Direct owner contact</li>
            <li>• Investment insights</li>
            <li>• Priority viewing slots</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumListing;
