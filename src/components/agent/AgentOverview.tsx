
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import AgentTools from "./AgentTools";
import AgentSettings from "./AgentSettings";
import AgentNotifications from "./AgentNotifications";
import AgentProfileProgress from "./AgentProfileProgress";
import RoleBasedPropertyForm from "@/components/property/RoleBasedPropertyForm";
import ClientManagement from "./tools/ClientManagement";
import BookingPaymentManager from "./BookingPaymentManager";
import PayoutManagement from "./PayoutManagement";
import { 
  Building, 
  PlusCircle, 
  BarChart3, 
  Users,
  DollarSign,
  TrendingUp,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Star,
  Crown,
  ChevronRight,
  Eye,
  Edit,
  Activity,
  Target,
  MessageSquare,
  Clock,
  Trash2,
  BookOpen,
  HelpCircle,
  HeadphonesIcon,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Send,
  FileText,
  Settings,
  Trophy
} from "lucide-react";

const AgentOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real properties from database
  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Agent membership data
  const agentMembership = {
    currentLevel: {
      name: "Gold",
      level: 3,
      icon: Crown,
      color: "bg-gradient-to-r from-yellow-400 to-yellow-600",
      textColor: "text-yellow-600"
    },
    nextLevel: {
      name: "Platinum",
      level: 4,
      icon: Star
    },
    progress: {
      current: 8,
      required: 10,
      percentage: 80
    },
    benefits: [
      "2.5% Commission Rate",
      "Premium Support",
      "Advanced Analytics",
      "3 Featured Listings/month",
      "Marketing Tools Access"
    ]
  };

  const stats = {
    totalListings: properties?.length || 0,
    activeListings: properties?.filter(p => p.status === 'active').length || 0,
    pendingListings: properties?.filter(p => p.approval_status === 'pending').length || 0,
    totalClients: 12,
  };

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === "rent") {
      return `Rp ${price.toLocaleString()}/month`;
    }
    return `Rp ${price.toLocaleString()}`;
  };

  const handleViewProperty = (propertyId: string) => {
    window.open(`/properties/${propertyId}`, '_blank');
  };

  const handleEditProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}/edit`);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('agent_id', user?.id);
      
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const handleAddListing = () => {
    navigate('/add-property');
  };

  const handleViewPortfolio = () => {
    navigate('/my-properties');
  };

  const CurrentIcon = agentMembership.currentLevel.icon;

  return (
    <div className="space-y-3">
      {/* Unified Agent Control Panel with Membership Status */}
      <div className="glass-card bg-gradient-to-br from-teal-50/50 via-card to-cyan-50/30 dark:from-teal-950/30 dark:via-card dark:to-cyan-950/20 rounded-lg overflow-hidden shadow-lg shadow-teal-500/20 border border-teal-200/50 dark:border-teal-800/50 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300">
        <div className="p-2.5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/40">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xs font-bold text-teal-900 dark:text-teal-100">Agent Control Panel</h1>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-teal-600 dark:text-teal-400">Online</span>
                  <Badge className="ml-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-1.5 py-0 text-[8px] shadow-sm">
                    <CurrentIcon className="h-2 w-2 mr-0.5" />
                    {agentMembership.currentLevel.name}
                  </Badge>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleAddListing}
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white h-6 text-[9px] px-2 shadow-md"
            >
              <PlusCircle className="h-2.5 w-2.5 mr-0.5" />
              Add
            </Button>
          </div>
          
          {/* Stats + Membership Progress Row */}
          <div className="grid grid-cols-5 gap-1.5 mt-2 pt-2 border-t border-teal-200/50 dark:border-teal-800/50">
            <div className="text-center p-1.5 bg-teal-100/50 dark:bg-teal-900/30 rounded-md">
              <div className="text-sm font-bold text-teal-800 dark:text-teal-200">{stats.totalListings}</div>
              <div className="text-[8px] text-teal-600 dark:text-teal-400">Properties</div>
            </div>
            <div className="text-center p-1.5 bg-teal-100/50 dark:bg-teal-900/30 rounded-md">
              <div className="text-sm font-bold text-teal-800 dark:text-teal-200">{stats.activeListings}</div>
              <div className="text-[8px] text-teal-600 dark:text-teal-400">Active</div>
            </div>
            <div className="text-center p-1.5 bg-teal-100/50 dark:bg-teal-900/30 rounded-md">
              <div className="text-sm font-bold text-teal-800 dark:text-teal-200">{stats.pendingListings}</div>
              <div className="text-[8px] text-teal-600 dark:text-teal-400">Pending</div>
            </div>
            <div className="text-center p-1.5 bg-teal-100/50 dark:bg-teal-900/30 rounded-md">
              <div className="text-sm font-bold text-teal-800 dark:text-teal-200">{stats.totalClients}</div>
              <div className="text-[8px] text-teal-600 dark:text-teal-400">Clients</div>
            </div>
            {/* Membership Progress Mini */}
            <div className="p-1.5 bg-gradient-to-br from-teal-200/50 to-cyan-200/50 dark:from-teal-800/50 dark:to-cyan-800/50 rounded-md">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[8px] text-teal-700 dark:text-teal-300 font-medium">Lv.{agentMembership.currentLevel.level}</span>
                <span className="text-[8px] font-bold text-teal-800 dark:text-teal-200">{agentMembership.progress.percentage}%</span>
              </div>
              <Progress value={agentMembership.progress.percentage} className="h-1" />
              <div className="text-[7px] text-teal-600 dark:text-teal-400 mt-0.5 text-center">
                {agentMembership.progress.current}/{agentMembership.progress.required} → {agentMembership.nextLevel.name}
              </div>
            </div>
          </div>
          
          {/* Benefits Row */}
          <div className="flex flex-wrap gap-0.5 mt-1.5">
            {agentMembership.benefits.slice(0, 3).map((benefit, index) => (
              <Badge key={index} variant="outline" className="text-[7px] px-1 py-0 border-teal-400/50 text-teal-700 dark:text-teal-300 bg-teal-50/50 dark:bg-teal-900/30">
                {benefit}
              </Badge>
            ))}
            <Badge variant="outline" className="text-[7px] px-1 py-0 text-teal-500 border-teal-300/50">
              +{agentMembership.benefits.length - 3}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs - Mobile App Style */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
        <TabsList className="flex w-full h-8 p-0.5 bg-muted/30 border border-border/50 rounded-lg overflow-x-auto gap-0.5 scrollbar-hide">
          <TabsTrigger value="overview" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
          <TabsTrigger value="add-property" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Add</TabsTrigger>
          <TabsTrigger value="my-properties" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Properties</TabsTrigger>
          <TabsTrigger value="clients" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Clients</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Analytics</TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bookings</TabsTrigger>
          <TabsTrigger value="payouts" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Payouts</TabsTrigger>
          <TabsTrigger value="feedback" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Feedback</TabsTrigger>
          <TabsTrigger value="support" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Support</TabsTrigger>
          <TabsTrigger value="tools" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tools</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 min-w-fit text-[9px] px-1.5 py-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-2">
          {/* Profile Progress Section - Prominent Display */}
          <AgentProfileProgress onEditProfile={() => {
            // Switch to settings tab when clicked
            setActiveTab("settings");
          }} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Agent Performance Summary */}
            <Card className="lg:col-span-2 bg-card/80">
              <CardHeader className="p-2 pb-1.5">
                <CardTitle className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3 text-primary" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="text-center p-1.5 bg-muted/30 rounded-md">
                    <Calendar className="h-3 w-3 mx-auto mb-0.5 text-primary" />
                    <div className="text-[8px] text-muted-foreground">Member</div>
                    <div className="text-[10px] font-bold">Jan 2024</div>
                  </div>
                  <div className="text-center p-1.5 bg-muted/30 rounded-md">
                    <TrendingUp className="h-3 w-3 mx-auto mb-0.5 text-green-600" />
                    <div className="text-[8px] text-muted-foreground">Sales</div>
                    <div className="text-[10px] font-bold">Rp 2.5B</div>
                  </div>
                  <div className="text-center p-1.5 bg-muted/30 rounded-md">
                    <Star className="h-3 w-3 mx-auto mb-0.5 text-primary" />
                    <div className="text-[8px] text-muted-foreground">Rating</div>
                    <div className="text-[10px] font-bold">4.8/5</div>
                  </div>
                  <div className="text-center p-1.5 bg-muted/30 rounded-md">
                    <Trophy className="h-3 w-3 mx-auto mb-0.5 text-accent" />
                    <div className="text-[8px] text-muted-foreground">Rank</div>
                    <div className="text-[10px] font-bold">#12</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-card/80">
              <CardHeader className="p-2 pb-1.5">
                <CardTitle className="text-xs">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0 space-y-1">
                <Button className="w-full justify-start h-7 text-[10px]" variant="outline" size="sm">
                  <PlusCircle className="h-2.5 w-2.5 mr-1" />
                  Add Property
                </Button>
                <Button className="w-full justify-start h-7 text-[10px]" variant="outline" size="sm">
                  <Users className="h-2.5 w-2.5 mr-1" />
                  Add Client
                </Button>
                <Button className="w-full justify-start h-7 text-[10px]" variant="outline" size="sm">
                  <Calendar className="h-2.5 w-2.5 mr-1" />
                  Schedule Viewing
                </Button>
                <Button className="w-full justify-start h-7 text-[10px]" variant="outline" size="sm">
                  <MessageSquare className="h-2.5 w-2.5 mr-1" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-property" className="space-y-2">
          <Card className="bg-card/80">
            <CardHeader className="p-2 pb-1.5">
              <CardTitle className="flex items-center gap-1 text-xs">
                <PlusCircle className="h-3 w-3 text-primary" />
                Add New Property
              </CardTitle>
              <CardDescription className="text-[9px]">Create a listing for sale or rent</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <RoleBasedPropertyForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-properties" className="space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
            <div>
              <h2 className="text-xs font-bold">Property Portfolio</h2>
              <p className="text-[9px] text-muted-foreground">Manage your listings</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" className="h-6 text-[9px] bg-primary hover:bg-primary/90">
                <PlusCircle className="h-2.5 w-2.5 mr-0.5" />
                Add
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-[9px]">
                <FileText className="h-2.5 w-2.5 mr-0.5" />
                Export
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto mb-1.5"></div>
              <p className="text-[10px]">Loading...</p>
            </div>
          ) : properties?.length === 0 ? (
            <div className="text-center py-4">
              <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-xs font-semibold mb-1">No Properties</h3>
              <p className="text-[9px] text-muted-foreground mb-2">Create your first listing</p>
              <Button onClick={handleAddListing} size="sm" className="h-6 text-[10px] bg-primary hover:bg-primary/90">
                <PlusCircle className="h-2.5 w-2.5 mr-0.5" />
                Create Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {properties?.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-md transition-all duration-300 group bg-card/80">
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    {property.images?.[0] || property.image_urls?.[0] ? (
                      <img 
                        src={property.images?.[0] || property.image_urls?.[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1">
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="text-[8px] px-1 py-0">
                        {property.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="absolute bottom-1 left-1">
                      <Badge variant="outline" className="bg-background/90 text-[8px] px-1 py-0 capitalize">
                        {property.listing_type}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-2">
                    <div className="space-y-1">
                      <div>
                        <h3 className="font-bold text-[10px] line-clamp-1 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                        <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-2 w-2" />
                          {property.location}
                        </p>
                      </div>
                      
                      <div className="text-xs font-bold text-primary">
                        {formatPrice(property.price, property.listing_type)}
                      </div>
                      
                      <div className="flex justify-between text-[8px] text-muted-foreground bg-muted/30 rounded px-1 py-0.5">
                        <span><strong>{property.bedrooms}</strong>BR</span>
                        <span><strong>{property.bathrooms}</strong>BA</span>
                        <span><strong>{property.area_sqm}</strong>m²</span>
                      </div>
                      
                      <div className="flex gap-0.5">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-5 text-[8px] px-1"
                          onClick={() => handleViewProperty(property.id)}
                        >
                          <Eye className="h-2 w-2" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-5 text-[8px] px-1"
                          onClick={() => handleEditProperty(property.id)}
                        >
                          <Edit className="h-2 w-2" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-5 text-[8px] px-1 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-2">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
            <Card className="bg-card/80">
              <CardContent className="p-2">
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Revenue</p>
                    <p className="text-xs font-bold">Rp 2.5B</p>
                    <p className="text-[8px] text-green-600">+12%</p>
                  </div>
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80">
              <CardContent className="p-2">
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Sold</p>
                    <p className="text-xs font-bold">24</p>
                    <p className="text-[8px] text-green-600">+8%</p>
                  </div>
                  <Building className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80">
              <CardContent className="p-2">
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Clients</p>
                    <p className="text-xs font-bold">48</p>
                    <p className="text-[8px] text-blue-600">+5 new</p>
                  </div>
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/80">
              <CardContent className="p-2">
                <div className="flex items-center justify-between gap-1">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Deal Time</p>
                    <p className="text-xs font-bold">21 days</p>
                    <p className="text-[8px] text-green-600">-3 days</p>
                  </div>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-card/80">
            <CardHeader className="p-2 pb-1.5">
              <CardTitle className="text-xs">Analytics</CardTitle>
              <CardDescription className="text-[9px]">Performance insights</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="text-center py-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-1.5" />
                <h3 className="text-xs font-semibold mb-0.5">Analytics Dashboard</h3>
                <p className="text-[9px] text-muted-foreground mb-2">
                  View charts, trends, and metrics
                </p>
                <Button size="sm" className="h-6 text-[9px] bg-primary hover:bg-primary/90">
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <BookingPaymentManager />
        </TabsContent>

        <TabsContent value="payouts">
          <PayoutManagement />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-2">
          <Card className="bg-card/80">
            <CardHeader className="p-2 pb-1.5">
              <CardTitle className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3 text-primary" />
                Client Feedback
              </CardTitle>
              <CardDescription className="text-[9px]">Manage client reviews</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="space-y-1.5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border border-border/50 rounded-md p-1.5 bg-muted/20">
                    <div className="flex items-start justify-between mb-1 gap-1">
                      <div>
                        <h4 className="text-[10px] font-semibold">Sarah Johnson</h4>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-2 w-2 fill-primary text-primary" />
                          ))}
                        </div>
                      </div>
                      <Badge className="text-[8px] px-1 py-0 bg-primary text-primary-foreground">New</Badge>
                    </div>
                    <p className="text-[9px] text-muted-foreground mb-1.5 line-clamp-2">
                      "Excellent service! Professional and helpful."
                    </p>
                    <div className="flex items-center gap-0.5">
                      <Button size="sm" className="h-5 text-[8px] bg-primary hover:bg-primary/90">
                        <Reply className="h-2 w-2 mr-0.5" />
                        Reply
                      </Button>
                      <Button size="sm" variant="outline" className="h-5 text-[8px] px-1.5">
                        <ThumbsUp className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-2">
          <Card className="bg-card/80">
            <CardHeader className="p-2 pb-1.5">
              <CardTitle className="flex items-center gap-1 text-xs">
                <HeadphonesIcon className="h-3 w-3 text-primary" />
                Support
              </CardTitle>
              <CardDescription className="text-[9px]">Get help from our team</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <h4 className="text-[10px] font-semibold mb-1.5">Quick Help</h4>
                  <div className="space-y-0.5">
                    <Button variant="outline" className="w-full justify-start h-6 text-[9px]" size="sm">
                      <HelpCircle className="h-2.5 w-2.5 mr-1" />
                      Listing Help
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-6 text-[9px]" size="sm">
                      <BookOpen className="h-2.5 w-2.5 mr-1" />
                      Guidelines
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-6 text-[9px]" size="sm">
                      <MessageSquare className="h-2.5 w-2.5 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-semibold mb-1.5">Recent Tickets</h4>
                  <div className="space-y-1">
                    {[1, 2].map((item) => (
                      <div key={item} className="border border-border/50 rounded-md p-1.5 bg-muted/20">
                        <div className="flex items-center justify-between mb-0.5 gap-1">
                          <span className="font-medium text-[9px] truncate">Property Approval</span>
                          <Badge variant="secondary" className="text-[8px] px-1 py-0">In Progress</Badge>
                        </div>
                        <p className="text-[8px] text-muted-foreground truncate mb-1">
                          Need help with approval...
                        </p>
                        <Button size="sm" className="h-5 text-[8px] bg-primary hover:bg-primary/90">
                          <MessageSquare className="h-2 w-2 mr-0.5" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <AgentTools />
        </TabsContent>

        <TabsContent value="settings">
          <AgentSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentOverview;

/**
 * Note: This AgentOverview component is getting quite large (780+ lines). 
 * Consider refactoring it into smaller, focused components:
 * - AgentDashboardHeader
 * - AgentMembershipCard  
 * - AgentOverviewTab
 * - AgentPropertiesTab
 * - AgentAnalyticsTab
 * - AgentBookingsTab
 * - AgentFeedbackTab
 * - AgentSupportTab
 * 
 * This would improve maintainability and make the code more modular.
 */
