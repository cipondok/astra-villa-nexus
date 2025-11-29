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
  ArrowLeft,
  Search
} from "lucide-react";

const PropertyOwnerOverview = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { properties, stats, recentActivity, isLoading } = usePropertyOwnerData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Ultra Compact Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-2.5 py-2 rounded-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="h-8 w-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs font-bold truncate">
                {profile?.full_name?.split(' ')[0] || 'Owner'}
              </h1>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                <span className="text-[8px] text-primary-foreground/80">Property Owner</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              size="sm"
              variant="secondary"
              className="h-6 w-6 p-0"
              onClick={() => navigate('/dashboard/user')}
            >
              <ArrowLeft className="h-3 w-3" />
            </Button>
            <Button 
              size="sm"
              className="h-6 px-2 text-[9px] bg-white/20 hover:bg-white/30"
              onClick={() => navigate('/add-property')}
            >
              <PlusCircle className="h-3 w-3 mr-0.5" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid - 3x2 Ultra Compact */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { icon: Building, value: stats.totalProperties, label: 'Total', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { icon: Activity, value: stats.activeListings, label: 'Active', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Target, value: stats.pendingApprovals, label: 'Pending', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { icon: Eye, value: stats.totalViews, label: 'Views', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { icon: Heart, value: stats.savedCount, label: 'Saved', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { icon: MessageSquare, value: stats.totalInquiries, label: 'Inquiries', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map((stat, i) => (
          <Card key={i} className="p-1.5">
            <div className="flex items-center gap-1.5">
              <div className={`h-6 w-6 rounded flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-bold block leading-none">{stat.value}</span>
                <span className="text-[8px] text-muted-foreground">{stat.label}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions - Slim */}
      <div className="grid grid-cols-4 gap-1">
        {[
          { icon: PlusCircle, label: 'Add', color: 'text-primary', action: () => navigate('/add-property') },
          { icon: Search, label: 'Browse', color: 'text-blue-500', action: () => navigate('/dijual') },
          { icon: TrendingUp, label: 'Stats', color: 'text-green-500', action: () => {} },
          { icon: Settings, label: 'Settings', color: 'text-muted-foreground', action: () => {} },
        ].map((item, i) => (
          <Button 
            key={i}
            variant="outline" 
            className="h-auto py-1.5 flex flex-col items-center gap-0.5 text-[8px] active:scale-95 border-muted"
            onClick={item.action}
          >
            <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
            {item.label}
          </Button>
        ))}
      </div>

      {/* Content Tabs - Compact */}
      <Tabs defaultValue="properties" className="space-y-2">
        <TabsList className="grid w-full grid-cols-3 h-7 p-0.5">
          <TabsTrigger value="properties" className="text-[9px] h-6 gap-1">
            <Home className="h-3 w-3" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-[9px] h-6 gap-1">
            <Activity className="h-3 w-3" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-[9px] h-6 gap-1">
            <TrendingUp className="h-3 w-3" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-1.5 mt-1.5">
          {properties.length === 0 ? (
            <Card className="p-3">
              <div className="text-center py-4">
                <Building className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs font-medium">No properties yet</p>
                <p className="text-[9px] text-muted-foreground mb-2">
                  Add your first property
                </p>
                <Button size="sm" className="h-6 text-[9px]" onClick={() => navigate('/add-property')}>
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Add Property
                </Button>
              </div>
            </Card>
          ) : (
            properties.map((property) => (
              <Card key={property.id} className="p-1.5 active:scale-[0.99] transition-transform">
                <div className="flex gap-2">
                  <div className="h-12 w-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                    {property.thumbnail_url || property.images?.[0] ? (
                      <img 
                        src={property.thumbnail_url || property.images?.[0]} 
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Building className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-[10px] font-medium truncate flex-1 leading-tight">{property.title || 'Untitled'}</h3>
                      <Badge 
                        variant={property.status === 'active' ? 'default' : 'secondary'}
                        className="text-[7px] px-1 py-0 h-3 flex-shrink-0"
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <p className="text-[8px] text-muted-foreground truncate leading-tight">
                      {property.city}, {property.state}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] font-semibold text-primary">
                        Rp {(property.price / 1000000).toFixed(0)}M
                      </span>
                      <Badge variant="outline" className="text-[7px] px-1 py-0 h-3">
                        {property.listing_type}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground self-center flex-shrink-0" />
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-1.5 mt-1.5">
          {recentActivity.length === 0 ? (
            <Card className="p-3">
              <div className="text-center py-4">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs font-medium">No activity yet</p>
                <p className="text-[9px] text-muted-foreground">
                  Your actions will appear here
                </p>
              </div>
            </Card>
          ) : (
            recentActivity.map((activity: any) => (
              <Card key={activity.id} className="p-1.5">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-medium truncate leading-tight">
                      {activity.activity_type?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[8px] text-muted-foreground truncate leading-tight">
                      {activity.activity_description}
                    </p>
                  </div>
                  <span className="text-[7px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-1.5 mt-1.5">
          <Card className="p-2">
            <CardHeader className="p-0 pb-1.5">
              <CardTitle className="text-[10px] flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-1">
              {[
                { label: 'Total Properties', value: stats.totalProperties, color: '' },
                { label: 'Active Listings', value: stats.activeListings, color: 'text-green-600' },
                { label: 'Pending Approval', value: stats.pendingApprovals, color: 'text-orange-600' },
                { label: 'Times Saved', value: stats.savedCount, color: 'text-red-600' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 bg-muted/50 rounded">
                  <span className="text-[9px]">{item.label}</span>
                  <span className={`text-[10px] font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="p-2">
            <CardHeader className="p-0 pb-1.5">
              <CardTitle className="text-[10px] flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-1">
              {[
                { text: '📸 Add quality photos for +40% views', bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-700 dark:text-blue-300' },
                { text: '📝 Complete descriptions get 2x inquiries', bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-700 dark:text-green-300' },
                { text: '💰 Competitive pricing sells faster', bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-700 dark:text-purple-300' },
              ].map((tip, i) => (
                <div key={i} className={`p-1.5 rounded ${tip.bg}`}>
                  <p className={`text-[8px] ${tip.color}`}>{tip.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyOwnerOverview;