
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  Edit
} from "lucide-react";

const AgentOverview = () => {
  const { user } = useAuth();

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

  const CurrentIcon = agentMembership.currentLevel.icon;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agent Dashboard</h1>
            <p className="text-blue-100 mt-2">Welcome back! Manage your listings and track your performance</p>
          </div>
          <Users className="h-8 w-8" />
        </div>
      </div>

      {/* Agent Membership Card */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${agentMembership.currentLevel.color} flex items-center justify-center`}>
                <CurrentIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Level {agentMembership.currentLevel.level}: {agentMembership.currentLevel.name} Agent
                </CardTitle>
                <CardDescription>
                  Progress to {agentMembership.nextLevel.name}: {agentMembership.progress.current}/{agentMembership.progress.required}
                </CardDescription>
              </div>
            </div>
            <Badge className={agentMembership.currentLevel.color} variant="secondary">
              {agentMembership.currentLevel.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to next level</span>
                <span>{agentMembership.progress.percentage}%</span>
              </div>
              <Progress value={agentMembership.progress.percentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {agentMembership.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">Properties you manage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingListings}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="listings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Property Listings</h2>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Listing
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img 
                    src={property.image_url} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                      {property.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(property.price, property.listing_type)}
                      </div>
                      <Badge variant="outline">
                        {property.property_type}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{property.bedrooms}BR • {property.bathrooms}BA</span>
                      <span>{property.area_sqm}m²</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
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
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>Manage your client relationships and track interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Client Management System</h3>
                <p className="text-muted-foreground mb-4">Track your clients, their preferences, and communication history</p>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Client
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track your sales and listing performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">View detailed insights about your performance and market trends</p>
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Agent Tools</CardTitle>
              <CardDescription>Useful tools to enhance your productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <Phone className="h-6 w-6" />
                  <span className="text-sm">Call Log</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <Mail className="h-6 w-6" />
                  <span className="text-sm">Email Templates</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Schedule Viewings</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Market Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentOverview;
