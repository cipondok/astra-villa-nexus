import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Crown, 
  Users, 
  Camera, 
  FileText, 
  Truck, 
  Home,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Building2,
  Sparkles,
  Shield,
  Award,
  TrendingUp,
  Package,
  Settings,
  UserCheck,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ConciergeServiceManagement = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("requests");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch concierge packages
  const { data: packages = [] } = useQuery({
    queryKey: ['concierge-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concierge_packages')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch concierge requests
  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['concierge-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concierge_requests')
        .select('*, profiles:user_id(full_name, email, avatar_url, phone), packages:package_id(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch concierge team
  const { data: team = [] } = useQuery({
    queryKey: ['concierge-team'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concierge_team')
        .select('*')
        .order('role', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch concierge vendors
  const { data: vendors = [] } = useQuery({
    queryKey: ['concierge-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concierge_vendors')
        .select('*')
        .order('vendor_type', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Update request status
  const updateRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('concierge_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concierge-requests'] });
      toast.success('Status updated');
    }
  });

  // Stats
  const activeRequests = requests.filter(r => ['confirmed', 'in_progress'].includes(r.status)).length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const totalRevenue = requests.filter(r => r.status === 'completed').reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const avgSatisfaction = requests.filter(r => r.satisfaction_rating).reduce((sum, r, _, arr) => sum + (r.satisfaction_rating || 0) / arr.length, 0);
  const availableTeam = team.filter(t => t.is_available).length;

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-chart-1/20 text-chart-1';
      case 'in_progress': return 'bg-primary/20 text-primary';
      case 'confirmed': return 'bg-chart-2/20 text-chart-2';
      case 'proposal_sent': case 'negotiating': return 'bg-chart-3/20 text-chart-3';
      case 'inquiry': case 'consultation': return 'bg-chart-4/20 text-chart-4';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPackageTier = (tier: string) => {
    switch (tier) {
      case 'luxury': return <Badge className="bg-gradient-to-r from-chart-2 to-chart-5 text-primary-foreground gap-1"><Crown className="h-3 w-3" /> Luxury</Badge>;
      case 'premium': return <Badge className="bg-gradient-to-r from-primary to-chart-2 text-primary-foreground gap-1"><Star className="h-3 w-3" /> Premium</Badge>;
      case 'essential': return <Badge className="bg-chart-1/20 text-chart-1">Essential</Badge>;
      default: return <Badge variant="outline">{tier}</Badge>;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'photographer': case 'videographer': return <Camera className="h-4 w-4" />;
      case 'lawyer': case 'notary': return <FileText className="h-4 w-4" />;
      case 'moving_company': return <Truck className="h-4 w-4" />;
      case 'home_staging': case 'interior_designer': return <Home className="h-4 w-4" />;
      case 'inspector': return <Shield className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Crown className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Concierge Service</h2>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white gap-1">
              <Sparkles className="h-3 w-3" />
              2% Commission
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">White-glove property services vs traditional 5-6%</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Users className="h-4 w-4" />
          Assign Concierge
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRequests}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-1/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-1/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedRequests}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-2/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-3/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-5/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-5/20 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableTeam}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-4/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-4/20 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vendors.length}</p>
                <p className="text-xs text-muted-foreground">Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-10">
          <TabsTrigger value="requests" className="text-xs gap-1">
            <Package className="h-3 w-3" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="packages" className="text-xs gap-1">
            <Crown className="h-3 w-3" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs gap-1">
            <Users className="h-3 w-3" />
            Team
          </TabsTrigger>
          <TabsTrigger value="vendors" className="text-xs gap-1">
            <Building2 className="h-3 w-3" />
            Vendors
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1">
            <TrendingUp className="h-3 w-3" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Requests</CardTitle>
                  <CardDescription>Manage concierge service requests</CardDescription>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="inquiry">Inquiry</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No requests found</p>
                  <p className="text-sm text-muted-foreground">Service requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.slice(0, 10).map((request: any) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={request.profiles?.avatar_url} />
                            <AvatarFallback>{request.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{request.profiles?.full_name || 'Client'}</h4>
                              {request.packages && getPackageTier(request.packages.package_tier)}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Home className="h-3 w-3" />
                                {request.request_type}
                              </span>
                              {request.property_value && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {(request.property_value / 1000000000).toFixed(1)}B IDR
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(request.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getStatusColor(request.status)}>{request.status.replace('_', ' ')}</Badge>
                            {request.commission_amount && (
                              <span className="text-sm font-semibold text-chart-1">
                                ${(request.commission_amount / 1000000).toFixed(1)}M
                              </span>
                            )}
                          </div>
                        </div>
                        {request.special_requirements && (
                          <div className="mt-3 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
                            {request.special_requirements}
                          </div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <Select 
                            value={request.status}
                            onValueChange={(status) => updateRequestStatus.mutate({ id: request.id, status })}
                          >
                            <SelectTrigger className="w-40 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="inquiry">Inquiry</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                              <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" className="h-8 text-xs">View Details</Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                            <Phone className="h-3 w-3" />
                            Contact
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg: any) => (
              <Card key={pkg.id} className={`relative overflow-hidden ${
                pkg.package_tier === 'luxury' ? 'border-chart-2/50 dark:border-chart-2/30' :
                pkg.package_tier === 'premium' ? 'border-primary/50 dark:border-primary/30' : ''
              }`}>
                {pkg.featured && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-chart-2 to-chart-5 text-primary-foreground text-xs px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {getPackageTier(pkg.package_tier)}
                    <Badge variant="outline" className="text-lg font-bold">
                      {pkg.commission_percentage}%
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{pkg.package_name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Min Property Value: {pkg.min_property_value ? `${(pkg.min_property_value / 1000000000).toFixed(1)}B IDR` : 'No minimum'}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Included Services:</h4>
                    <div className="space-y-1.5">
                      {pkg.included_services && Object.entries(pkg.included_services).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {value ? (
                            <CheckCircle className="h-4 w-4 text-chart-1" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-border" />
                          )}
                          <span className={value ? '' : 'text-muted-foreground'}>
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            {typeof value === 'string' && value !== 'true' && ` (${value})`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" variant={pkg.package_tier === 'luxury' ? 'default' : 'outline'}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Concierge Team</CardTitle>
                  <CardDescription>Personal property assistants</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  Add Team Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {team.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No team members yet</p>
                  <p className="text-sm text-muted-foreground">Add your concierge team</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.map((member: any) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-semibold">{member.full_name}</h4>
                            <Badge variant="outline" className="text-[10px]">{member.role.replace('_', ' ')}</Badge>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${member.is_available ? 'bg-chart-1' : 'bg-muted-foreground'}`} />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Active Clients</p>
                            <p className="font-medium">{member.current_active_clients}/{member.max_active_clients}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rating</p>
                            <p className="font-medium flex items-center gap-1">
                              <Star className="h-3 w-3 text-chart-3" />
                              {member.avg_satisfaction_rating?.toFixed(1) || 'N/A'}
                            </p>
                          </div>
                        </div>
                        {member.specializations && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {member.specializations.slice(0, 3).map((spec: string) => (
                              <Badge key={spec} variant="secondary" className="text-[9px]">{spec}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Vendors</CardTitle>
                  <CardDescription>Photographers, movers, lawyers, and more</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Add Vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {vendors.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No vendors registered</p>
                  <p className="text-sm text-muted-foreground">Add service vendors for concierge services</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendors.map((vendor: any) => (
                    <Card key={vendor.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            {getServiceIcon(vendor.vendor_type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{vendor.vendor_name}</h4>
                            <p className="text-sm text-muted-foreground">{vendor.vendor_type.replace('_', ' ')}</p>
                          </div>
                          {vendor.is_preferred && (
                            <Badge className="bg-chart-3/20 text-chart-3">
                              <Award className="h-3 w-3 mr-1" />
                              Preferred
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Jobs</p>
                            <p className="font-medium">{vendor.total_jobs}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rating</p>
                            <p className="font-medium flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {vendor.avg_rating?.toFixed(1) || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {vendor.insurance_verified && (
                            <Badge variant="outline" className="text-[9px] gap-1">
                              <Shield className="h-3 w-3" /> Insured
                            </Badge>
                          )}
                          {vendor.background_check && (
                            <Badge variant="outline" className="text-[9px] gap-1">
                              <CheckCircle className="h-3 w-3" /> Verified
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by Package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {packages.map((pkg: any) => {
                    const pkgRevenue = requests
                      .filter((r: any) => r.package_id === pkg.id && r.status === 'completed')
                      .reduce((sum: number, r: any) => sum + (r.commission_amount || 0), 0);
                    return (
                      <div key={pkg.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{pkg.package_name}</span>
                          <span className="font-semibold">${(pkgRevenue / 1000000).toFixed(1)}M</span>
                        </div>
                        <Progress value={(pkgRevenue / (totalRevenue || 1)) * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Savings vs Traditional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-4xl font-bold text-green-600">
                    ${((totalRevenue * 2.5) / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-muted-foreground mt-2">Saved by clients vs 5% traditional commission</p>
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Our Rate</p>
                      <p className="font-bold text-green-600">2%</p>
                    </div>
                    <div className="text-muted-foreground">vs</div>
                    <div>
                      <p className="text-muted-foreground">Traditional</p>
                      <p className="font-bold text-red-600">5-6%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConciergeServiceManagement;
