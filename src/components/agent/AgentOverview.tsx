
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calendar
} from "lucide-react";

const AgentOverview = () => {
  const { user } = useAuth();

  // Fetch agent's properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const stats = {
    totalListings: properties?.length || 0,
    activeListings: properties?.filter(p => p.status === 'active').length || 0,
    pendingListings: properties?.filter(p => p.approval_status === 'pending').length || 0,
    totalClients: 0, // This would come from a clients table
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agent Dashboard</h1>
            <p className="text-blue-100 mt-2">Manage your listings and track your performance</p>
          </div>
          <Users className="h-8 w-8" />
        </div>
      </div>

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

          {isLoading ? (
            <div className="text-center py-8">Loading listings...</div>
          ) : properties?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Listings Yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first property listing</p>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {properties?.map((property) => (
                <Card key={property.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{property.title}</h3>
                        <p className="text-sm text-gray-600">{property.location}</p>
                        <div className="flex gap-2">
                          <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                            {property.status}
                          </Badge>
                          <Badge variant="outline">
                            {property.approval_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        {property.price && (
                          <p className="font-semibold">${property.price.toLocaleString()}</p>
                        )}
                        <p className="text-sm text-gray-500">{property.property_type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>Manage your client relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">Client management system coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track your sales and listing performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Agent Tools</CardTitle>
              <CardDescription>Useful tools for real estate agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Phone className="h-6 w-6" />
                  <span>Call Log</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Mail className="h-6 w-6" />
                  <span>Email Templates</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span>Schedule Viewings</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Market Analysis</span>
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
