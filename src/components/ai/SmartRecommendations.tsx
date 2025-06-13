
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sparkles, 
  Heart, 
  MapPin, 
  Home,
  TrendingUp,
  Eye,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  property_type: string;
  image_urls?: string[];
  score?: number;
}

interface SmartRecommendationsProps {
  type?: 'properties' | 'vendors';
  limit?: number;
  className?: string;
}

const SmartRecommendations = ({ type = 'properties', limit = 4, className = "" }: SmartRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>({});
  const { user } = useAuth();

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-recommendations', {
        body: {
          userId: user?.id,
          type,
          limit
        }
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      setUserPreferences(data.userProfile || {});
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user?.id, type, limit]);

  const trackPropertyView = async (propertyId: string, property: Property) => {
    if (!user?.id) return;

    try {
      await supabase.from('user_interactions').insert([{
        user_id: user.id,
        interaction_type: 'property_view',
        interaction_data: {
          propertyId,
          propertyType: property.property_type,
          location: property.location,
          price: property.price,
          source: 'ai_recommendation'
        }
      }]);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  if (!user) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI-Powered Recommendations</h3>
          <p className="text-gray-600 mb-4">Sign in to get personalized property and vendor recommendations based on your preferences.</p>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            Sign In for Smart Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Smart Recommendations
            <Badge className="bg-purple-100 text-purple-800">AI</Badge>
          </CardTitle>
          <Button
            onClick={fetchRecommendations}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {userPreferences.propertyTypes?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-gray-600">Based on your interest in:</span>
            {userPreferences.propertyTypes.slice(0, 3).map((type: string) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-0">
            {recommendations.map((property, index) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                onClick={() => trackPropertyView(property.id, property)}
                className="block p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
              >
                <div className="flex gap-3">
                  <div className="relative">
                    <img
                      src={property.image_urls?.[0] || "/placeholder.svg"}
                      alt={property.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    {property.score && property.score > 50 && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {Math.round(property.score)}%
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {property.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <Home className="h-3 w-3" />
                      {property.property_type}
                    </div>
                    <div className="text-sm font-bold text-purple-600 mt-2">
                      ${property.price?.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center">
                    <Eye className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">View</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="text-gray-500 mb-2">No recommendations yet</div>
            <div className="text-sm text-gray-400">
              Browse some properties to get personalized recommendations!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartRecommendations;
