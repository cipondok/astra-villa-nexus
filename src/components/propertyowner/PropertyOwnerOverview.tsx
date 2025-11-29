import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePropertyOwnerData } from "@/hooks/usePropertyOwnerData";
import { formatDistanceToNow } from "date-fns";
import { 
  Building, 
  Eye, 
  Heart, 
  MessageSquare, 
  PlusCircle,
  Activity,
  Target,
  Home,
  TrendingUp,
  Clock,
  ChevronRight,
  Settings,
  ArrowLeft
} from "lucide-react";

const PropertyOwnerOverview = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { properties, stats, recentActivity, isLoading } = usePropertyOwnerData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 py-3 rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-10 w-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold truncate">
                Hi, {profile?.full_name?.split(' ')[0] || 'Owner'}!
              </h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] sm:text-xs text-primary-foreground/80">Property Owner</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button 
              size="sm"
              variant="secondary"
              className="h-8 px-2 text-xs"
              onClick={() => navigate('/dashboard/user')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Button 
              size="sm"
              className="h-8 px-2.5 text-xs bg-white/20 hover:bg-white/30"
              onClick={() => navigate('/add-property')}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - 2x3 Mobile */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-2.5">
          <div className="flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-1">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-lg font-bold">{stats.totalProperties}</span>
            <span className="text-[9px] text-muted-foreground">Properties</span>
          </div>
        </Card>
        
        <Card className="p-2.5">
          <div className="flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-1">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-lg font-bold">{stats.activeListings}</span>
            <span className="text-[9px] text-muted-foreground">Active</span>
          </div>
        </Card>
        
        <Card className="p-2.5">
          <div className="flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-orange-600" />
            </div>
            <span className="text-lg font-bold">{stats.pendingApprovals}</span>
            <span className="text-[9px] text-muted-foreground">Pending</span>
          </div>
        </Card>
        
        <Card className="p-2.5">
          <div className="flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-1">
              <Eye className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-lg font-bold">{stats.totalViews}</span>
            <span className="text-[9px] text-muted-foreground">Views</span>
          </div>
        </Card>
        
        <Card className="p-2.5">
          <div className="flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-1">
              <Heart className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-lg font-bold">{stats.savedCount}</span>
            <span className="text-[9px] text-muted-foreground">Saved</span>
          </div>
        </Card>
        
        <Card className="p-2.5">
          <div className="flex flex-col items-center text-center">
            <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-1">
              <MessageSquare className="h-4 w-4 text-yellow-600" />
            </div>
            <span className="text-lg font-bold">{stats.totalInquiries}</span>
            <span className="text-[9px] text-muted-foreground">Inquiries</span>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        <Button 
          variant="outline" 
          className="h-auto py-2.5 flex flex-col items-center gap-1 text-[10px] active:scale-95"
          onClick={() => navigate('/add-property')}
        >
          <PlusCircle className="h-4 w-4 text-primary" />
          Add New
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-2.5 flex flex-col items-center gap-1 text-[10px] active:scale-95"
          onClick={() => navigate('/dijual')}
        >
          <Building className="h-4 w-4 text-blue-500" />
          Browse
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-2.5 flex flex-col items-center gap-1 text-[10px] active:scale-95"
        >
          <TrendingUp className="h-4 w-4 text-green-500" />
          Analytics
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-2.5 flex flex-col items-center gap-1 text-[10px] active:scale-95"
        >
          <Settings className="h-4 w-4 text-gray-500" />
          Settings
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="properties" className="space-y-3">
        <TabsList className="grid w-full grid-cols-3 h-9 p-0.5">
          <TabsTrigger value="properties" className="text-[10px] sm:text-xs h-8">
            <Home className="h-3.5 w-3.5 mr-1" />
            My Properties
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-[10px] sm:text-xs h-8">
            <Activity className="h-3.5 w-3.5 mr-1" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-[10px] sm:text-xs h-8">
            <TrendingUp className="h-3.5 w-3.5 mr-1" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-2 mt-2">
          {properties.length === 0 ? (
            <Card className="p-4">
              <div className="text-center py-6">
                <Building className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No properties yet</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Start by adding your first property
                </p>
                <Button size="sm" onClick={() => navigate('/add-property')}>
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Add Property
                </Button>
              </div>
            </Card>
          ) : (
            properties.map((property) => (
              <Card key={property.id} className="p-2.5 active:scale-[0.99] transition-transform">
                <div className="flex gap-2.5">
                  <div className="h-16 w-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                    {property.thumbnail_url || property.images?.[0] ? (
                      <img 
                        src={property.thumbnail_url || property.images?.[0]} 
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-xs font-medium truncate flex-1">{property.title || 'Untitled'}</h3>
                      <Badge 
                        variant={property.status === 'active' ? 'default' : 'secondary'}
                        className="text-[8px] px-1.5 py-0 h-4 flex-shrink-0"
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {property.city}, {property.state}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-semibold text-primary">
                        Rp {(property.price / 1000000).toFixed(0)}M
                      </span>
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4">
                        {property.listing_type}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground self-center flex-shrink-0" />
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-2 mt-2">
          {recentActivity.length === 0 ? (
            <Card className="p-4">
              <div className="text-center py-6">
                <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No activity yet</p>
                <p className="text-xs text-muted-foreground">
                  Your recent actions will appear here
                </p>
              </div>
            </Card>
          ) : (
            recentActivity.map((activity: any) => (
              <Card key={activity.id} className="p-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {activity.activity_type?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {activity.activity_description}
                    </p>
                  </div>
                  <span className="text-[9px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-2 mt-2">
          <Card className="p-3">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-xs">Total Properties</span>
                <span className="text-sm font-bold">{stats.totalProperties}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-xs">Active Listings</span>
                <span className="text-sm font-bold text-green-600">{stats.activeListings}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-xs">Pending Approval</span>
                <span className="text-sm font-bold text-orange-600">{stats.pendingApprovals}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-xs">Times Saved by Users</span>
                <span className="text-sm font-bold text-red-600">{stats.savedCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Tips to Improve
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-1.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-[10px] text-blue-700 dark:text-blue-300">
                  💡 Add high-quality photos to increase views by up to 40%
                </p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-[10px] text-green-700 dark:text-green-300">
                  📝 Complete property descriptions get 2x more inquiries
                </p>
              </div>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-[10px] text-purple-700 dark:text-purple-300">
                  🏷️ Competitive pricing helps properties sell faster
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyOwnerOverview;
