
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
  Target
} from "lucide-react";

const AgentOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sample properties for agent cs@astravilla.com
  const sampleProperties = [
    {
      id: "1",
      title: "Luxury Villa in Seminyak",
      location: "Seminyak, Bali",
      price: 15000000000,
      property_type: "villa",
      listing_type: "sale",
      bedrooms: 4,
      bathrooms: 3,
      area_sqm: 350,
      status: "active",
      approval_status: "approved",
      created_at: "2024-01-15T10:00:00Z",
      image_url: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop"
    },
    {
      id: "2",
      title: "Modern Apartment in Kuningan",
      location: "Kuningan, Jakarta Selatan",
      price: 150000000,
      property_type: "apartment",
      listing_type: "rent",
      bedrooms: 2,
      bathrooms: 2,
      area_sqm: 85,
      status: "active",
      approval_status: "approved",
      created_at: "2024-01-20T14:30:00Z",
      image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop"
    },
    {
      id: "3",
      title: "Townhouse in Pondok Indah",
      location: "Pondok Indah, Jakarta Selatan",
      price: 8500000000,
      property_type: "townhouse",
      listing_type: "sale",
      bedrooms: 3,
      bathrooms: 3,
      area_sqm: 180,
      status: "active",
      approval_status: "approved",
      created_at: "2024-02-01T09:15:00Z",
      image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop"
    },
    {
      id: "4",
      title: "Penthouse in SCBD",
      location: "SCBD, Jakarta Selatan",
      price: 450000000,
      property_type: "apartment",
      listing_type: "rent",
      bedrooms: 3,
      bathrooms: 2,
      area_sqm: 120,
      status: "active",
      approval_status: "approved",
      created_at: "2024-02-10T16:45:00Z",
      image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"
    },
    {
      id: "5",
      title: "Beach House in Canggu",
      location: "Canggu, Bali",
      price: 12000000000,
      property_type: "house",
      listing_type: "sale",
      bedrooms: 5,
      bathrooms: 4,
      area_sqm: 280,
      status: "pending_approval",
      approval_status: "pending",
      created_at: "2024-02-15T11:20:00Z",
      image_url: "https://images.unsplash.com/photo-1520637836862-4d197d17c13a?w=400&h=300&fit=crop"
    }
  ];

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
    totalListings: sampleProperties.length,
    activeListings: sampleProperties.filter(p => p.status === 'active').length,
    pendingListings: sampleProperties.filter(p => p.approval_status === 'pending').length,
    totalClients: 12,
  };

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === "rent") {
      return `Rp ${price.toLocaleString()}/month`;
    }
    return `Rp ${price.toLocaleString()}`;
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleEditProperty = (propertyId: string) => {
    alert(`Edit property ${propertyId} - This feature will be implemented soon`);
  };

  const handleAddListing = () => {
    navigate('/add-property');
  };

  const CurrentIcon = agentMembership.currentLevel.icon;

  return (
    <div className="space-y-6">
      {/* Professional Agent Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white rounded-2xl overflow-hidden shadow-2xl">
        <div className="relative p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]"></div>
          
          <div className="relative z-10">
            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">Agent Control Panel</h1>
                    <p className="text-blue-100 text-lg">Professional Property Management Dashboard</p>
                  </div>
                </div>
                
                {/* Agent Status */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-100 text-sm font-medium">Online & Active</span>
                  </div>
                  <div className={`flex items-center gap-2 ${agentMembership.currentLevel.color} px-4 py-2 rounded-full`}>
                    <CurrentIcon className="h-4 w-4 text-white" />
                    <span className="text-white text-sm font-medium">{agentMembership.currentLevel.name} Agent</span>
                  </div>
                </div>
              </div>
              
              {/* Main Action Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleAddListing}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add New Property
                </Button>
                <Button 
                  onClick={() => navigate('/properties')}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  <Building className="h-5 w-5 mr-2" />
                  View Portfolio
                </Button>
              </div>
            </div>
            
            {/* Performance Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Building className="h-5 w-5 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalListings}</div>
                    <div className="text-blue-100 text-sm">Total Properties</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Activity className="h-5 w-5 text-green-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.activeListings}</div>
                    <div className="text-blue-100 text-sm">Active Listings</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-yellow-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.pendingListings}</div>
                    <div className="text-blue-100 text-sm">Pending Review</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalClients}</div>
                    <div className="text-blue-100 text-sm">Active Clients</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Membership Progress Card */}
      <Card className="border-l-4 border-l-yellow-500 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${agentMembership.currentLevel.color} flex items-center justify-center shadow-lg`}>
                <CurrentIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Level {agentMembership.currentLevel.level}: {agentMembership.currentLevel.name} Agent
                </CardTitle>
                <CardDescription className="text-base">
                  Progress to {agentMembership.nextLevel.name}: {agentMembership.progress.current}/{agentMembership.progress.required} properties
                </CardDescription>
              </div>
            </div>
            <Badge className={`${agentMembership.currentLevel.color} text-white px-4 py-2 text-sm`}>
              {agentMembership.currentLevel.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Progress to next level</span>
                <span className="font-bold">{agentMembership.progress.percentage}%</span>
              </div>
              <Progress value={agentMembership.progress.percentage} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {agentMembership.progress.required - agentMembership.progress.current} more properties needed for {agentMembership.nextLevel.name} level
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Current Benefits</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {agentMembership.benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs justify-center py-2">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-14 p-1 bg-muted/50">
          <TabsTrigger value="listings" className="text-sm font-medium">My Properties</TabsTrigger>
          <TabsTrigger value="clients" className="text-sm font-medium">Clients</TabsTrigger>
          <TabsTrigger value="analytics" className="text-sm font-medium">Analytics</TabsTrigger>
          <TabsTrigger value="tools" className="text-sm font-medium">Tools</TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm font-medium">Notifications</TabsTrigger>
          <TabsTrigger value="settings" className="text-sm font-medium">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Property Portfolio</h2>
              <p className="text-muted-foreground">Manage your property listings and track performance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={property.image_url} 
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'} className="shadow-lg">
                      {property.status}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                      {property.property_type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-bold text-primary">
                        {formatPrice(property.price, property.listing_type)}
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                      <span className="flex items-center gap-1">
                        <strong>{property.bedrooms}</strong>BR
                      </span>
                      <span className="flex items-center gap-1">
                        <strong>{property.bathrooms}</strong>BA
                      </span>
                      <span className="flex items-center gap-1">
                        <strong>{property.area_sqm}</strong>m²
                      </span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleViewProperty(property.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleEditProperty(property.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Client Management</CardTitle>
              <CardDescription>Manage your client relationships and track interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Client Management System</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Track your clients, their preferences, and communication history in one centralized location
                </p>
                <Button size="lg">
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add New Client
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Performance Analytics</CardTitle>
              <CardDescription>Track your sales and listing performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  View detailed insights about your performance, market trends, and client engagement
                </p>
                <Button size="lg">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <AgentTools />
        </TabsContent>

        <TabsContent value="notifications">
          <AgentNotifications />
        </TabsContent>

        <TabsContent value="settings">
          <AgentSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentOverview;
