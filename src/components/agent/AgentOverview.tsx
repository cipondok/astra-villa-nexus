
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
      {/* Compact Agent Control Panel */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-lg overflow-hidden shadow-md">
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold">Agent Control Panel</h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span className="text-[10px] text-slate-300">Online</span>
                  <div className={`flex items-center gap-0.5 ml-1 ${agentMembership.currentLevel.color} px-1.5 py-0.5 rounded text-[9px]`}>
                    <CurrentIcon className="h-2.5 w-2.5" />
                    <span>{agentMembership.currentLevel.name}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleAddListing}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 h-7 text-[10px] px-2"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Property
            </Button>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2 mt-2 pt-2 border-t border-white/10">
            <div className="text-center">
              <div className="text-base font-bold">{stats.totalListings}</div>
              <div className="text-[9px] text-slate-300">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold">{stats.activeListings}</div>
              <div className="text-[9px] text-slate-300">Active</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold">{stats.pendingListings}</div>
              <div className="text-[9px] text-slate-300">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-base font-bold">{stats.totalClients}</div>
              <div className="text-[9px] text-slate-300">Clients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Membership Progress Card */}
      <Card className="border-l-2 border-l-yellow-500 shadow-sm">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg ${agentMembership.currentLevel.color} flex items-center justify-center shadow`}>
                <CurrentIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Level {agentMembership.currentLevel.level}: {agentMembership.currentLevel.name}
                </CardTitle>
                <CardDescription className="text-[10px]">
                  {agentMembership.progress.current}/{agentMembership.progress.required} to {agentMembership.nextLevel.name}
                </CardDescription>
              </div>
            </div>
            <Badge className={`${agentMembership.currentLevel.color} text-white px-2 py-0.5 text-[10px]`}>
              {agentMembership.currentLevel.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span>Progress</span>
                <span className="font-bold">{agentMembership.progress.percentage}%</span>
              </div>
              <Progress value={agentMembership.progress.percentage} multiColor className="h-1.5" />
            </div>
            <div className="flex flex-wrap gap-1">
              {agentMembership.benefits.slice(0, 3).map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-[9px] px-1.5 py-0.5">
                  {benefit}
                </Badge>
              ))}
              <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 text-muted-foreground">
                +{agentMembership.benefits.length - 3} more
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="flex w-full h-9 p-0.5 bg-muted/50 rounded-lg overflow-x-auto gap-0.5">
          <TabsTrigger value="overview" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Overview</TabsTrigger>
          <TabsTrigger value="add-property" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Add</TabsTrigger>
          <TabsTrigger value="my-properties" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Properties</TabsTrigger>
          <TabsTrigger value="clients" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Clients</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Analytics</TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Bookings</TabsTrigger>
          <TabsTrigger value="payouts" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Payouts</TabsTrigger>
          <TabsTrigger value="feedback" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Feedback</TabsTrigger>
          <TabsTrigger value="support" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Support</TabsTrigger>
          <TabsTrigger value="tools" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Tools</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 min-w-fit text-[10px] px-2 py-1.5">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          {/* Profile Progress Section - Prominent Display */}
          <AgentProfileProgress onEditProfile={() => {
            // Switch to settings tab when clicked
            setActiveTab("settings");
          }} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Agent Performance Summary */}
            <Card className="lg:col-span-2">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm">
                  <Users className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <div className="text-[9px] text-muted-foreground">Member</div>
                    <div className="text-xs font-bold">Jan 2024</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <div className="text-[9px] text-muted-foreground">Sales</div>
                    <div className="text-xs font-bold">Rp 2.5B</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <Star className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                    <div className="text-[9px] text-muted-foreground">Rating</div>
                    <div className="text-xs font-bold">4.8/5</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <Trophy className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                    <div className="text-[9px] text-muted-foreground">Rank</div>
                    <div className="text-xs font-bold">#12</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5">
                <Button className="w-full justify-start h-8 text-xs" variant="outline" size="sm">
                  <PlusCircle className="h-3 w-3 mr-1.5" />
                  Add Property
                </Button>
                <Button className="w-full justify-start h-8 text-xs" variant="outline" size="sm">
                  <Users className="h-3 w-3 mr-1.5" />
                  Add Client
                </Button>
                <Button className="w-full justify-start h-8 text-xs" variant="outline" size="sm">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  Schedule Viewing
                </Button>
                <Button className="w-full justify-start h-8 text-xs" variant="outline" size="sm">
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-property" className="space-y-3">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <PlusCircle className="h-4 w-4" />
                Add New Property
              </CardTitle>
              <CardDescription className="text-[10px]">Create a listing for sale or rent</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <RoleBasedPropertyForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-properties" className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-sm font-bold">Property Portfolio</h2>
              <p className="text-[10px] text-muted-foreground">Manage your listings</p>
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" className="h-7 text-[10px]">
                <PlusCircle className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px]">
                <FileText className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-xs">Loading...</p>
            </div>
          ) : properties?.length === 0 ? (
            <div className="text-center py-6">
              <Building className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-semibold mb-2">No Properties</h3>
              <p className="text-[10px] text-muted-foreground mb-3">Create your first listing</p>
              <Button onClick={handleAddListing} size="sm" className="h-7 text-xs">
                <PlusCircle className="h-3 w-3 mr-1" />
                Create Property
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {properties?.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-md transition-all duration-300 group">
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    {property.images?.[0] || property.image_urls?.[0] ? (
                      <img 
                        src={property.images?.[0] || property.image_urls?.[0]} 
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-1.5 right-1.5">
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="text-[9px] px-1.5 py-0.5">
                        {property.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="absolute bottom-1.5 left-1.5">
                      <Badge variant="outline" className="bg-background/90 text-[9px] px-1.5 py-0.5 capitalize">
                        {property.listing_type}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-2.5">
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-bold text-xs line-clamp-1 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {property.location}
                        </p>
                      </div>
                      
                      <div className="text-sm font-bold text-primary">
                        {formatPrice(property.price, property.listing_type)}
                      </div>
                      
                      <div className="flex justify-between text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5">
                        <span><strong>{property.bedrooms}</strong>BR</span>
                        <span><strong>{property.bathrooms}</strong>BA</span>
                        <span><strong>{property.area_sqm}</strong>m²</span>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-6 text-[10px]"
                          onClick={() => handleViewProperty(property.id)}
                        >
                          <Eye className="h-3 w-3 mr-0.5" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-6 text-[10px]"
                          onClick={() => handleEditProperty(property.id)}
                        >
                          <Edit className="h-3 w-3 mr-0.5" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 h-6 text-[10px] text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProperty(property.id)}
                        >
                          <Trash2 className="h-3 w-3" />
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

        <TabsContent value="analytics" className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Revenue</p>
                    <p className="text-sm font-bold">Rp 2.5B</p>
                    <p className="text-[9px] text-green-600">+12%</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Sold</p>
                    <p className="text-sm font-bold">24</p>
                    <p className="text-[9px] text-green-600">+8%</p>
                  </div>
                  <Building className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Clients</p>
                    <p className="text-sm font-bold">48</p>
                    <p className="text-[9px] text-blue-600">+5 new</p>
                  </div>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Deal Time</p>
                    <p className="text-sm font-bold">21 days</p>
                    <p className="text-[9px] text-green-600">-3 days</p>
                  </div>
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">Analytics</CardTitle>
              <CardDescription className="text-[10px]">Performance insights</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-center py-6">
                <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h3 className="text-sm font-semibold mb-1">Analytics Dashboard</h3>
                <p className="text-[10px] text-muted-foreground mb-3">
                  View charts, trends, and metrics
                </p>
                <Button size="sm" className="h-7 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
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

        <TabsContent value="feedback" className="space-y-3">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <MessageSquare className="h-4 w-4" />
                Client Feedback
              </CardTitle>
              <CardDescription className="text-[10px]">Manage client reviews</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border rounded-lg p-2">
                    <div className="flex items-start justify-between mb-1.5 gap-2">
                      <div>
                        <h4 className="text-xs font-semibold">Sarah Johnson</h4>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <Badge className="text-[9px] px-1.5 py-0">New</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">
                      "Excellent service! Professional and helped me find the perfect property."
                    </p>
                    <div className="flex items-center gap-1">
                      <Button size="sm" className="h-6 text-[10px]">
                        <Reply className="h-3 w-3 mr-0.5" />
                        Reply
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px]">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-3">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm">
                <HeadphonesIcon className="h-4 w-4" />
                Support
              </CardTitle>
              <CardDescription className="text-[10px]">Get help from our team</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h4 className="text-xs font-semibold mb-2">Quick Help</h4>
                  <div className="space-y-1">
                    <Button variant="outline" className="w-full justify-start h-7 text-[10px]" size="sm">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Listing Help
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-7 text-[10px]" size="sm">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Guidelines
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-7 text-[10px]" size="sm">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold mb-2">Recent Tickets</h4>
                  <div className="space-y-1.5">
                    {[1, 2].map((item) => (
                      <div key={item} className="border rounded p-2">
                        <div className="flex items-center justify-between mb-1 gap-1">
                          <span className="font-medium text-[10px] truncate">Property Approval</span>
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">In Progress</Badge>
                        </div>
                        <p className="text-[9px] text-muted-foreground truncate">
                          Need help with approval...
                        </p>
                        <Button size="sm" className="mt-1.5 h-5 text-[9px]">
                          <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
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
