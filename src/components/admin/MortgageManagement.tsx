import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2, Plus, Edit, Trash2, MoreVertical, 
  Percent, TrendingUp, Users, DollarSign, Eye, 
  Phone, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { MortgageBank, MortgageRate } from '@/hooks/useMortgageCalculator';

const MortgageManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('banks');
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [editingBank, setEditingBank] = useState<MortgageBank | null>(null);

  // Fetch banks
  const { data: banks = [], isLoading: loadingBanks } = useQuery({
    queryKey: ['admin-mortgage-banks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mortgage_banks')
        .select('*')
        .order('bank_name');
      if (error) throw error;
      return data as MortgageBank[];
    }
  });

  // Fetch rates
  const { data: rates = [], isLoading: loadingRates } = useQuery({
    queryKey: ['admin-mortgage-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mortgage_rates')
        .select('*')
        .order('interest_rate_year1');
      if (error) throw error;
      return data as MortgageRate[];
    }
  });

  // Fetch inquiries
  const { data: inquiries = [], isLoading: loadingInquiries } = useQuery({
    queryKey: ['mortgage-inquiries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mortgage_inquiries')
        .select('*, mortgage_banks(bank_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  // Fetch simulation stats
  const { data: stats } = useQuery({
    queryKey: ['mortgage-stats'],
    queryFn: async () => {
      const { count: totalSimulations } = await supabase
        .from('mortgage_simulations')
        .select('*', { count: 'exact', head: true });

      const { count: totalInquiries } = await supabase
        .from('mortgage_inquiries')
        .select('*', { count: 'exact', head: true });

      const { count: pendingInquiries } = await supabase
        .from('mortgage_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      return {
        totalBanks: banks.length,
        totalSimulations: totalSimulations || 0,
        totalInquiries: totalInquiries || 0,
        pendingInquiries: pendingInquiries || 0
      };
    },
    enabled: banks.length > 0
  });

  // Toggle bank active status
  const toggleBankMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('mortgage_banks')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mortgage-banks'] });
      toast.success('Bank status updated');
    }
  });

  // Update inquiry status
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, any> = { status };
      if (status === 'contacted') updates.contacted_at = new Date().toISOString();
      if (status === 'processing' || status === 'approved' || status === 'rejected') {
        updates.processed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('mortgage_inquiries')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-inquiries'] });
      toast.success('Inquiry status updated');
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="text-blue-600"><Phone className="h-3 w-3 mr-1" />Contacted</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-yellow-600">Processing</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mortgage Management</h2>
          <p className="text-muted-foreground">
            Manage KPR banks, rates, and customer inquiries
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Partner Banks</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banks.filter(b => b.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {banks.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Simulations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSimulations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInquiries || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.pendingInquiries || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="banks">Banks & Rates</TabsTrigger>
          <TabsTrigger value="inquiries">
            Inquiries
            {(stats?.pendingInquiries || 0) > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 justify-center" variant="destructive">
                {stats?.pendingInquiries}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Banks Tab */}
        <TabsContent value="banks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Partner Banks</CardTitle>
                  <CardDescription>Manage KPR partner banks and their rates</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bank</TableHead>
                    <TableHead>Rates</TableHead>
                    <TableHead>Min DP</TableHead>
                    <TableHead>Max Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banks.map(bank => {
                    const bankRates = rates.filter(r => r.bank_id === bank.id);
                    const lowestRate = bankRates.length > 0 
                      ? Math.min(...bankRates.map(r => r.interest_rate_year1))
                      : null;

                    return (
                      <TableRow key={bank.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{bank.bank_name}</p>
                              <p className="text-xs text-muted-foreground">{bank.bank_code}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{bankRates.length} rates</Badge>
                            {lowestRate && (
                              <span className="text-sm text-green-600">
                                from {lowestRate}%
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{bank.min_down_payment_percent}%</TableCell>
                        <TableCell>{bank.max_loan_term_years} years</TableCell>
                        <TableCell>
                          <Switch
                            checked={bank.is_active}
                            onCheckedChange={(checked) => 
                              toggleBankMutation.mutate({ id: bank.id, is_active: checked })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Bank
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Percent className="h-4 w-4 mr-2" />
                                Manage Rates
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Inquiries</CardTitle>
              <CardDescription>Manage KPR application inquiries from customers</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingInquiries ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No inquiries yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Loan Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquiries.map((inquiry: any) => (
                      <TableRow key={inquiry.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{inquiry.full_name}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {inquiry.mortgage_banks?.bank_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {inquiry.loan_amount_requested 
                            ? new Intl.NumberFormat('id-ID', { 
                                style: 'currency', 
                                currency: 'IDR',
                                minimumFractionDigits: 0 
                              }).format(inquiry.loan_amount_requested)
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(inquiry.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {inquiry.status === 'pending' && (
                                <DropdownMenuItem
                                  onClick={() => updateInquiryMutation.mutate({ 
                                    id: inquiry.id, 
                                    status: 'contacted' 
                                  })}
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Mark as Contacted
                                </DropdownMenuItem>
                              )}
                              {inquiry.status === 'contacted' && (
                                <DropdownMenuItem
                                  onClick={() => updateInquiryMutation.mutate({ 
                                    id: inquiry.id, 
                                    status: 'processing' 
                                  })}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Mark as Processing
                                </DropdownMenuItem>
                              )}
                              {inquiry.status === 'processing' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => updateInquiryMutation.mutate({ 
                                      id: inquiry.id, 
                                      status: 'approved' 
                                    })}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => updateInquiryMutation.mutate({ 
                                      id: inquiry.id, 
                                      status: 'rejected' 
                                    })}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MortgageManagement;
