
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
import RoleBasedPropertyForm from "@/components/property/RoleBasedPropertyForm";
import ClientManagement from "./tools/ClientManagement";
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

  const handleViewPortfolio = () => {
    navigate('/my-properties');
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
                  onClick={handleViewPortfolio}
                  size="lg"
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  <Building className="h-5 w-5 mr-2" />
                  My Properties
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
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-10 h-14 p-1 bg-muted/50 overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs font-medium">Overview</TabsTrigger>
          <TabsTrigger value="add-property" className="text-xs font-medium">Add Property</TabsTrigger>
          <TabsTrigger value="my-properties" className="text-xs font-medium">My Properties</TabsTrigger>
          <TabsTrigger value="clients" className="text-xs font-medium">Clients</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs font-medium">Analytics</TabsTrigger>
          <TabsTrigger value="bookings" className="text-xs font-medium">Bookings</TabsTrigger>
          <TabsTrigger value="feedback" className="text-xs font-medium">Feedback</TabsTrigger>
          <TabsTrigger value="support" className="text-xs font-medium">Support</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs font-medium">Tools</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs font-medium">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Agent Profile Summary */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Agent Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-sm text-muted-foreground">Member Since</div>
                    <div className="font-bold">Jan 2024</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <div className="text-sm text-muted-foreground">Total Sales</div>
                    <div className="font-bold">Rp 2.5B</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                    <div className="text-sm text-muted-foreground">Rating</div>
                    <div className="font-bold">4.8/5</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Trophy className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm text-muted-foreground">Rank</div>
                    <div className="font-bold">#12</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Property
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add New Client
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Viewing
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="add-property" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Add New Property Listing
              </CardTitle>
              <CardDescription>Create a new property listing for sale or rent</CardDescription>
            </CardHeader>
            <CardContent>
              <RoleBasedPropertyForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-properties" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Property Portfolio Management</h2>
              <p className="text-muted-foreground">Manage your property listings with advanced tools</p>
            </div>
            <div className="flex gap-2">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Property
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export List
              </Button>
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
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm capitalize">
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
                    
                    <div className="text-xl font-bold text-primary">
                      {formatPrice(property.price, property.listing_type)}
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">Rp 2.5B</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Properties Sold</p>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-xs text-green-600">+8% from last month</p>
                  </div>
                  <Building className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold">48</p>
                    <p className="text-xs text-blue-600">+5 new this week</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg. Deal Time</p>
                    <p className="text-2xl font-bold">21 days</p>
                    <p className="text-xs text-green-600">-3 days improved</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Detailed insights about your agent performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-6">
                  View detailed charts, trends, and performance metrics
                </p>
                <Button size="lg">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  View Full Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Survey & Viewing Bookings
              </CardTitle>
              <CardDescription>Manage property surveys and client viewing appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-20 flex-col gap-2">
                    <Calendar className="h-6 w-6" />
                    Schedule Property Survey
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Clock className="h-6 w-6" />
                    Schedule Client Viewing
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Upcoming Appointments</h4>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Property Survey - Villa in Seminyak</p>
                          <p className="text-sm text-muted-foreground">Tomorrow, 10:00 AM</p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Client Feedback & Reviews
              </CardTitle>
              <CardDescription>Manage and respond to client feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">Sarah Johnson</h4>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <Badge>New</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      "Excellent service! The agent was very professional and helped me find the perfect property."
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm">
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button size="sm" variant="outline">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Thank
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5" />
                Customer Service Communication
              </CardTitle>
              <CardDescription>Get help and communicate with customer service team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Quick Help</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Property Listing Help
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Agent Guidelines
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Recent Support Tickets</h4>
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Property Approval Issue</span>
                          <Badge variant="secondary">In Progress</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Need help with property approval process...
                        </p>
                        <Button size="sm" className="mt-2">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          View Conversation
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
