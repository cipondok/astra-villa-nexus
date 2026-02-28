
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Building2, 
  Users, 
  Coins, 
  Key, 
  FileText, 
  TrendingUp,
  Settings,
  PlusCircle,
  RefreshCw,
  Eye,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Package,
  BarChart3,
  Globe,
  Palette,
  Download,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { getCurrencyFormatterShort } from "@/stores/currencyStore";

const B2BMarketplaceManagement = () => {
  const [activeTab, setActiveTab] = useState("clients");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [newClient, setNewClient] = useState({
    company_name: '',
    client_type: 'agency',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    tier: 'starter'
  });
  const queryClient = useQueryClient();

  // Fetch B2B Clients
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['b2b-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('b2b_clients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Fetch Credit Packages
  const { data: packages } = useQuery({
    queryKey: ['b2b-credit-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('b2b_credit_packages')
        .select('*')
        .order('credits', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Fetch Leads
  const { data: leads } = useQuery({
    queryKey: ['b2b-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('b2b_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  // Fetch API Usage Stats
  const { data: apiUsage } = useQuery({
    queryKey: ['b2b-api-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('b2b_api_usage')
        .select('*, b2b_clients(company_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Create Client Mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: typeof newClient) => {
      const { data, error } = await supabase
        .from('b2b_clients')
        .insert({
          company_name: clientData.company_name,
          client_type: clientData.client_type as 'agency' | 'investor' | 'developer' | 'bank' | 'other',
          contact_name: clientData.contact_name,
          contact_email: clientData.contact_email,
          contact_phone: clientData.contact_phone,
          tier: clientData.tier as 'starter' | 'professional' | 'enterprise'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['b2b-clients'] });
      toast.success('B2B client created successfully');
      setShowAddClientDialog(false);
      setNewClient({
        company_name: '',
        client_type: 'agency',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        tier: 'starter'
      });
    },
    onError: (error: any) => {
      toast.error('Failed to create client: ' + error.message);
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['b2b-clients'] });
    await queryClient.invalidateQueries({ queryKey: ['b2b-leads'] });
    await queryClient.invalidateQueries({ queryKey: ['b2b-api-usage'] });
    setIsRefreshing(false);
    toast.success('Data refreshed');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getClientTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      agency: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
      investor: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
      developer: 'bg-chart-4/10 text-chart-4 border-chart-4/30',
      bank: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
      other: 'bg-muted text-muted-foreground border-border'
    };
    return <Badge className={colors[type] || colors.other}>{type}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      starter: 'bg-muted text-muted-foreground',
      professional: 'bg-chart-2/10 text-chart-2',
      enterprise: 'bg-chart-4/10 text-chart-4'
    };
    return <Badge className={colors[tier] || colors.starter}>{tier}</Badge>;
  };

  // Calculate stats
  const totalClients = clients?.length || 0;
  const activeClients = clients?.filter(c => c.is_active)?.length || 0;
  const totalCredits = clients?.reduce((sum, c) => sum + (c.credits_balance || 0), 0) || 0;
  const totalLeads = leads?.length || 0;
  const soldLeads = leads?.filter(l => l.is_sold)?.length || 0;

  return (
    <div className="space-y-4 p-1 md:p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-lg border border-border/50 p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">B2B Data Marketplace</h2>
                <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/30 text-[10px] px-1.5">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Manage B2B clients, leads, API access, and data products</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add B2B Client</DialogTitle>
                  <DialogDescription>Register a new business client for the data marketplace</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input 
                      value={newClient.company_name}
                      onChange={(e) => setNewClient({...newClient, company_name: e.target.value})}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Type</Label>
                    <Select value={newClient.client_type} onValueChange={(v) => setNewClient({...newClient, client_type: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agency">Real Estate Agency</SelectItem>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="bank">Bank/Financial</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Name</Label>
                    <Input 
                      value={newClient.contact_name}
                      onChange={(e) => setNewClient({...newClient, contact_name: e.target.value})}
                      placeholder="Primary contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input 
                      type="email"
                      value={newClient.contact_email}
                      onChange={(e) => setNewClient({...newClient, contact_email: e.target.value})}
                      placeholder="email@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input 
                      value={newClient.contact_phone}
                      onChange={(e) => setNewClient({...newClient, contact_phone: e.target.value})}
                      placeholder="+62..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select value={newClient.tier} onValueChange={(v) => setNewClient({...newClient, tier: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddClientDialog(false)}>Cancel</Button>
                  <Button 
                    onClick={() => createClientMutation.mutate(newClient)}
                    disabled={!newClient.company_name || !newClient.contact_name || !newClient.contact_email}
                  >
                    Create Client
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Total Clients</p>
                <p className="text-xl font-bold text-foreground">{totalClients}</p>
              </div>
              <Users className="h-5 w-5 text-chart-2" />
            </div>
            <p className="text-[10px] text-chart-1 mt-1">{activeClients} active</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Credits Balance</p>
                <p className="text-xl font-bold text-foreground">{totalCredits.toLocaleString()}</p>
              </div>
              <Coins className="h-5 w-5 text-chart-3" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Across all clients</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Available Leads</p>
                <p className="text-xl font-bold text-foreground">{totalLeads - soldLeads}</p>
              </div>
              <FileText className="h-5 w-5 text-chart-1" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{soldLeads} sold</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">API Calls (24h)</p>
                <p className="text-xl font-bold text-foreground">{apiUsage?.length || 0}</p>
              </div>
              <Key className="h-5 w-5 text-chart-4" />
            </div>
            <p className="text-[10px] text-chart-1 mt-1 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +12%
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">Revenue (MTD)</p>
                <p className="text-xl font-bold text-foreground">{getCurrencyFormatterShort()(45_000_000)}</p>
              </div>
              <DollarSign className="h-5 w-5 text-chart-1" />
            </div>
            <p className="text-[10px] text-chart-1 mt-1 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +28%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-1 shadow-sm overflow-x-auto">
          <TabsList className="flex w-full bg-muted/50 gap-0.5 h-9 p-0.5">
            <TabsTrigger value="clients" className="flex-1 flex items-center gap-1.5 text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex-1 flex items-center gap-1.5 text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex-1 flex items-center gap-1.5 text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Package className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex-1 flex items-center gap-1.5 text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Key className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">API Usage</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 flex items-center gap-1.5 text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="whitelabel" className="flex-1 flex items-center gap-1.5 text-xs px-2 h-7 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">White Label</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    B2B Clients
                  </CardTitle>
                  <CardDescription className="text-xs">Manage registered business clients</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search clients..." className="pl-8 h-8 w-48 text-xs" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {clientsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : clients && clients.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Company</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Tier</TableHead>
                      <TableHead className="text-xs">Contact</TableHead>
                      <TableHead className="text-xs">Credits</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium text-xs">{client.company_name}</TableCell>
                        <TableCell>{getClientTypeBadge(client.client_type)}</TableCell>
                        <TableCell>{getTierBadge(client.tier)}</TableCell>
                        <TableCell className="text-xs">
                          <div>{client.contact_name}</div>
                          <div className="text-muted-foreground">{client.contact_email}</div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{client.credits_balance?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          {client.is_active ? (
                            <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/30 text-[10px]">Active</Badge>
                          ) : (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Key className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Coins className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No B2B clients yet</p>
                  <Button size="sm" className="mt-3" onClick={() => setShowAddClientDialog(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Client
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leads Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Lead Marketplace
              </CardTitle>
              <CardDescription className="text-xs">Property inquiry leads available for purchase</CardDescription>
            </CardHeader>
            <CardContent>
              {leads && leads.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Source</TableHead>
                      <TableHead className="text-xs">Property Type</TableHead>
                      <TableHead className="text-xs">Location</TableHead>
                      <TableHead className="text-xs">Budget</TableHead>
                      <TableHead className="text-xs">Score</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="text-xs">{lead.lead_source}</TableCell>
                        <TableCell className="text-xs">{lead.property_type || 'Any'}</TableCell>
                        <TableCell className="text-xs">{lead.property_location || 'N/A'}</TableCell>
                        <TableCell className="text-xs">
                          {lead.lead_budget ? `Rp ${(lead.lead_budget / 1000000000).toFixed(1)}B` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={lead.lead_score >= 70 ? 'default' : 'outline'} className="text-[10px]">
                            {lead.lead_score}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.is_sold ? (
                            <Badge className="bg-muted text-muted-foreground text-[10px]">Sold</Badge>
                          ) : (
                            <Badge className="bg-chart-1/10 text-chart-1 text-[10px]">Available</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-7 text-xs">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No leads in marketplace</p>
                  <p className="text-xs text-muted-foreground mt-1">Leads are automatically added from property inquiries</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages?.map((pkg) => (
              <Card key={pkg.id} className={`border-border/50 ${pkg.is_featured ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="pb-2">
                  {pkg.is_featured && (
                    <Badge className="w-fit mb-2 bg-primary/10 text-primary">Most Popular</Badge>
                  )}
                  <CardTitle className="text-sm">{pkg.name}</CardTitle>
                  <CardDescription className="text-xs">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold">
                    {pkg.credits.toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">credits</span>
                  </div>
                  {pkg.bonus_credits > 0 && (
                    <Badge variant="outline" className="text-chart-1 border-chart-1/30">
                      +{pkg.bonus_credits} bonus
                    </Badge>
                  )}
                  <div className="text-sm">
                    <span className="font-semibold">Rp {(pkg.price_idr / 1000000).toFixed(1)}M</span>
                    <span className="text-muted-foreground ml-2">(${pkg.price_usd})</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Edit Package
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Usage Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Key className="h-4 w-4" />
                API Usage Logs
              </CardTitle>
              <CardDescription className="text-xs">Recent API calls from B2B clients</CardDescription>
            </CardHeader>
            <CardContent>
              {apiUsage && apiUsage.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Endpoint</TableHead>
                      <TableHead className="text-xs">Method</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Credits</TableHead>
                      <TableHead className="text-xs">Response Time</TableHead>
                      <TableHead className="text-xs">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiUsage.map((usage: any) => (
                      <TableRow key={usage.id}>
                        <TableCell className="text-xs font-medium">
                          {usage.b2b_clients?.company_name || 'Unknown'}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{usage.endpoint}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{usage.method}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={usage.response_status < 400 
                              ? 'bg-chart-1/10 text-chart-1 text-[10px]' 
                              : 'bg-destructive/10 text-destructive text-[10px]'
                            }
                          >
                            {usage.response_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{usage.credits_used}</TableCell>
                        <TableCell className="text-xs">{usage.response_time_ms}ms</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(usage.created_at).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No API usage yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Custom Reports
              </CardTitle>
              <CardDescription className="text-xs">Generate and manage data reports for clients</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Create customizable reports for market insights, demographics, and valuations
              </p>
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Report Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* White Label Tab */}
        <TabsContent value="whitelabel" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4" />
                White Label Configurations
              </CardTitle>
              <CardDescription className="text-xs">Custom branding options for enterprise clients</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Enterprise clients can customize branding, domains, and report templates
              </p>
              <Button size="sm" variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Manage Configurations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default B2BMarketplaceManagement;
