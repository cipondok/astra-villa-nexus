import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  RefreshCw, 
  Filter, 
  Lightbulb,
  TrendingUp,
  Settings
} from 'lucide-react';
import SmartPropertyCard from './SmartPropertyCard';
import UserProfileCard from './UserProfileCard';
import PreferencesEditor from './PreferencesEditor';
import { useSmartRecommendations } from '@/hooks/useSmartRecommendations';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface RecommendationEngineProps {
  limit?: number;
  showProfile?: boolean;
  className?: string;
}

const RecommendationEngine = ({ 
  limit = 12, 
  showProfile = true,
  className = '' 
}: RecommendationEngineProps) => {
  const { user } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);
  const { 
    recommendations, 
    userProfile, 
    meta, 
    isLoading, 
    refetch 
  } = useSmartRecommendations(limit);

  const preferenceMatches = recommendations.filter(r => !r.isDiscoveryMatch);
  const discoveryMatches = recommendations.filter(r => r.isDiscoveryMatch);

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
          <p className="text-muted-foreground mb-4">
            Sign in to get AI-powered property recommendations tailored to your preferences
          </p>
          <Button>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Smart Recommendations
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Properties matched to your preferences with 20% discovery suggestions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Your Preferences</DialogTitle>
              </DialogHeader>
              <PreferencesEditor onSave={() => setShowPreferences(false)} />
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      {meta && (
        <div className="flex gap-4 text-sm">
          <Badge variant="outline">
            <Filter className="h-3 w-3 mr-1" />
            {meta.totalCandidates} properties analyzed
          </Badge>
          <Badge variant="secondary">
            <TrendingUp className="h-3 w-3 mr-1" />
            {meta.preferenceMatches} preference matches
          </Badge>
          <Badge className="bg-purple-100 text-purple-700">
            <Lightbulb className="h-3 w-3 mr-1" />
            {meta.discoveryMatches} discoveries
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({recommendations.length})
              </TabsTrigger>
              <TabsTrigger value="preference">
                <TrendingUp className="h-3 w-3 mr-1" />
                Best Matches ({preferenceMatches.length})
              </TabsTrigger>
              <TabsTrigger value="discovery">
                <Lightbulb className="h-3 w-3 mr-1" />
                Discoveries ({discoveryMatches.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {isLoading ? (
                <LoadingGrid />
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recommendations.map((rec) => (
                    <SmartPropertyCard key={rec.propertyId} recommendation={rec} />
                  ))}
                </div>
              ) : (
                <EmptyState onSetPreferences={() => setShowPreferences(true)} />
              )}
            </TabsContent>

            <TabsContent value="preference">
              {preferenceMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {preferenceMatches.map((rec) => (
                    <SmartPropertyCard key={rec.propertyId} recommendation={rec} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No strong preference matches yet. Try adjusting your preferences.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="discovery">
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  Discovery Recommendations
                </h4>
                <p className="text-sm text-muted-foreground">
                  These properties don't match all your criteria but might surprise you based on 
                  market trends, value opportunities, or emerging patterns we've noticed.
                </p>
              </div>
              {discoveryMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {discoveryMatches.map((rec) => (
                    <SmartPropertyCard key={rec.propertyId} recommendation={rec} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No discovery suggestions right now. Check back later!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Profile */}
        {showProfile && (
          <div className="lg:col-span-1">
            <UserProfileCard onEditPreferences={() => setShowPreferences(true)} />
          </div>
        )}
      </div>
    </div>
  );
};

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <div className="h-48 bg-muted" />
        <CardContent className="p-4 space-y-3">
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const EmptyState = ({ onSetPreferences }: { onSetPreferences: () => void }) => (
  <Card>
    <CardContent className="p-12 text-center">
      <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start by setting your preferences or browse some properties so our AI can 
        learn what you're looking for.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={onSetPreferences}>
          Set Preferences
        </Button>
        <Button variant="outline" asChild>
          <a href="/properties">Browse Properties</a>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default RecommendationEngine;
