import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { 
  User, 
  MapPin, 
  Home, 
  DollarSign, 
  Sparkles,
  Eye,
  Heart,
  MessageSquare,
  Clock,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useUserProfile, usePreferencesUpdate } from '@/hooks/useSmartRecommendations';
import { useState } from 'react';

interface UserProfileCardProps {
  onEditPreferences?: () => void;
}

const UserProfileCard = ({ onEditPreferences }: UserProfileCardProps) => {
  const { data, isLoading } = useUserProfile();
  const updatePrefs = usePreferencesUpdate();
  const [discoveryOpenness, setDiscoveryOpenness] = useState<number[]>([20]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { profile, activitySummary } = data || {};

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Build Your Profile</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Browse properties to help us learn your preferences
          </p>
          <Button onClick={onEditPreferences}>Set Preferences</Button>
        </CardContent>
      </Card>
    );
  }

  const handleDiscoveryChange = (value: number[]) => {
    setDiscoveryOpenness(value);
    updatePrefs.mutate({ discoveryOpenness: value[0] / 100 });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Property Profile
          </span>
          <Button variant="ghost" size="icon" onClick={onEditPreferences}>
            <Settings className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Activity Summary */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            <Eye className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{activitySummary?.totalViews || 0}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div className="text-center">
            <Heart className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{activitySummary?.totalSaves || 0}</div>
            <div className="text-xs text-muted-foreground">Saves</div>
          </div>
          <div className="text-center">
            <MessageSquare className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{activitySummary?.totalInquiries || 0}</div>
            <div className="text-xs text-muted-foreground">Inquiries</div>
          </div>
        </div>

        {/* Explicit Preferences */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget Range
          </h4>
          {profile.explicit.minBudget || profile.explicit.maxBudget ? (
            <p className="text-sm">
              ${profile.explicit.minBudget?.toLocaleString() || '0'} - $
              {profile.explicit.maxBudget?.toLocaleString() || '∞'}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Not set</p>
          )}
        </div>

        {/* Preferred Locations */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Preferred Locations
          </h4>
          <div className="flex flex-wrap gap-1">
            {profile.explicit.preferredLocations?.length > 0 ? (
              profile.explicit.preferredLocations.map((loc: string) => (
                <Badge key={loc} variant="secondary" className="text-xs">
                  {loc}
                </Badge>
              ))
            ) : profile.implicit.locationClusters?.length > 0 ? (
              <>
                {profile.implicit.locationClusters.slice(0, 3).map((loc: string) => (
                  <Badge key={loc} variant="outline" className="text-xs">
                    {loc} <span className="text-muted-foreground ml-1">(learned)</span>
                  </Badge>
                ))}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Browse to discover preferences</span>
            )}
          </div>
        </div>

        {/* Property Types */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Property Types
          </h4>
          <div className="flex flex-wrap gap-1">
            {profile.explicit.preferredPropertyTypes?.length > 0 ? (
              profile.explicit.preferredPropertyTypes.map((type: string) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))
            ) : profile.implicit.stylePreferences?.length > 0 ? (
              profile.implicit.stylePreferences.slice(0, 3).map((type: string) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type} <span className="text-muted-foreground ml-1">(learned)</span>
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No preference yet</span>
            )}
          </div>
        </div>

        {/* Learned Patterns */}
        {Object.keys(profile.implicit.dwellTimeByType || {}).length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your Interests
            </h4>
            <div className="space-y-2">
              {Object.entries(profile.implicit.dwellTimeByType)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 3)
                .map(([type, time]) => {
                  const maxTime = Math.max(...Object.values(profile.implicit.dwellTimeByType) as number[]);
                  const percentage = ((time as number) / maxTime) * 100;
                  return (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{type}</span>
                        <span className="text-muted-foreground">
                          {Math.round((time as number) / 60)}min viewed
                        </span>
                      </div>
                      <Progress value={percentage} className="h-1" />
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Discovery Openness */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Discovery Mode
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            How open are you to unexpected property suggestions?
          </p>
          <Slider
            value={discoveryOpenness}
            onValueChange={handleDiscoveryChange}
            max={100}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Focused</span>
            <span>{discoveryOpenness[0]}%</span>
            <span>Adventurous</span>
          </div>
        </div>

        {/* Browsing Patterns */}
        {profile.implicit.timePatterns?.length > 0 && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock className="h-3 w-3" />
            You typically browse in the {profile.implicit.timePatterns.join(', ')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
