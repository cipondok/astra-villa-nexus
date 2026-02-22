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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2, Plus, Edit, Trash2, MoreVertical, 
  Percent, TrendingUp, Users, Clock, Eye, 
  Phone, CheckCircle, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { MortgageBank, MortgageRate } from '@/hooks/useMortgageCalculator';

interface BankFormData {
  bank_name: string;
  bank_code: string;
  description: string;
  website_url: string;
  min_loan_amount: number;
  max_loan_amount: number;
  min_down_payment_percent: number;
  max_loan_term_years: number;
  processing_fee_percent: number;
  admin_fee: number;
  appraisal_fee: number;
  notary_fee_percent: number;
  is_active: boolean;
  is_featured: boolean;
}

interface RateFormData {
  bank_id: string;
  rate_name: string;
  rate_type: 'fixed' | 'floating' | 'promotional';
  interest_rate_year1: number;
  interest_rate_year2: number | null;
  interest_rate_year3_plus: number | null;
  min_term_years: number;
  max_term_years: number;
  is_active: boolean;
}

const defaultBankForm: BankFormData = {
  bank_name: '',
  bank_code: '',
  description: '',
  website_url: '',
  min_loan_amount: 100000000,
  max_loan_amount: 10000000000,
  min_down_payment_percent: 10,
  max_loan_term_years: 25,
  processing_fee_percent: 0.5,
  admin_fee: 500000,
  appraisal_fee: 750000,
  notary_fee_percent: 0.5,
  is_active: true,
  is_featured: false,
};

const defaultRateForm: RateFormData = {
  bank_id: '',
  rate_name: '',
  rate_type: 'fixed',
  interest_rate_year1: 7.5,
  interest_rate_year2: null,
  interest_rate_year3_plus: null,
  min_term_years: 5,
  max_term_years: 25,
  is_active: true,
};

const MortgageManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('banks');
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [editingBank, setEditingBank] = useState<MortgageBank | null>(null);
  const [editingRate, setEditingRate] = useState<MortgageRate | null>(null);
  const [bankForm, setBankForm] = useState<BankFormData>(defaultBankForm);
  const [rateForm, setRateForm] = useState<RateFormData>(defaultRateForm);
  const [selectedBankForRates, setSelectedBankForRates] = useState<string | null>(null);

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

  // Create/Update bank mutation
  const saveBankMutation = useMutation({
    mutationFn: async (data: BankFormData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('mortgage_banks')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mortgage_banks')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mortgage-banks'] });
      setShowBankDialog(false);
      setEditingBank(null);
      setBankForm(defaultBankForm);
      toast.success(editingBank ? 'Bank updated successfully' : 'Bank added successfully');
    },
    onError: (error) => {
      toast.error('Failed to save bank: ' + error.message);
    }
  });

  // Delete bank mutation
  const deleteBankMutation = useMutation({
    mutationFn: async (id: string) => {
      // First delete related rates
      await supabase.from('mortgage_rates').delete().eq('bank_id', id);
      // Then delete the bank
      const { error } = await supabase.from('mortgage_banks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mortgage-banks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-mortgage-rates'] });
      toast.success('Bank deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete bank: ' + error.message);
    }
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

  // Create/Update rate mutation
  const saveRateMutation = useMutation({
    mutationFn: async (data: RateFormData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('mortgage_rates')
          .update(data)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mortgage_rates')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mortgage-rates'] });
      setShowRateDialog(false);
      setEditingRate(null);
      setRateForm(defaultRateForm);
      toast.success(editingRate ? 'Rate updated successfully' : 'Rate added successfully');
    },
    onError: (error) => {
      toast.error('Failed to save rate: ' + error.message);
    }
  });

  // Delete rate mutation
  const deleteRateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('mortgage_rates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-mortgage-rates'] });
      toast.success('Rate deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete rate: ' + error.message);
    }
  });

  // Update inquiry status
  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
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

  const handleOpenBankDialog = (bank?: MortgageBank) => {
    if (bank) {
      setEditingBank(bank);
      setBankForm({
        bank_name: bank.bank_name,
        bank_code: bank.bank_code,
        description: bank.description || '',
        website_url: bank.website_url || '',
        min_loan_amount: bank.min_loan_amount,
        max_loan_amount: bank.max_loan_amount,
        min_down_payment_percent: bank.min_down_payment_percent,
        max_loan_term_years: bank.max_loan_term_years,
        processing_fee_percent: bank.processing_fee_percent,
        admin_fee: bank.admin_fee,
        appraisal_fee: bank.appraisal_fee,
        notary_fee_percent: bank.notary_fee_percent,
        is_active: bank.is_active,
        is_featured: bank.is_featured,
      });
    } else {
      setEditingBank(null);
      setBankForm(defaultBankForm);
    }
    setShowBankDialog(true);
  };

  const handleOpenRateDialog = (bankId: string, rate?: MortgageRate) => {
    if (rate) {
      setEditingRate(rate);
      setRateForm({
        bank_id: rate.bank_id,
        rate_name: rate.rate_name,
        rate_type: rate.rate_type as 'fixed' | 'floating' | 'promotional',
        interest_rate_year1: rate.interest_rate_year1,
        interest_rate_year2: rate.interest_rate_year2,
        interest_rate_year3_plus: rate.interest_rate_year3_plus,
        min_term_years: rate.min_term_years,
        max_term_years: rate.max_term_years,
        is_active: rate.is_active,
      });
    } else {
      setEditingRate(null);
      setRateForm({ ...defaultRateForm, bank_id: bankId });
    }
    setShowRateDialog(true);
  };

  const handleSaveBank = () => {
    if (!bankForm.bank_name || !bankForm.bank_code) {
      toast.error('Please fill in required fields');
      return;
    }
    saveBankMutation.mutate(editingBank ? { ...bankForm, id: editingBank.id } : bankForm);
  };

  const handleSaveRate = () => {
    if (!rateForm.bank_id || !rateForm.rate_name) {
      toast.error('Please fill in required fields');
      return;
    }
    saveRateMutation.mutate(editingRate ? { ...rateForm, id: editingRate.id } : rateForm);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="text-chart-2"><Phone className="h-3 w-3 mr-1" />Contacted</Badge>;
      case 'processing':
        return <Badge variant="outline" className="text-chart-3">Processing</Badge>;
      case 'approved':
        return <Badge className="bg-chart-1 text-chart-1-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0 
    }).format(value);
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
            <div className="text-2xl font-bold text-chart-3">{stats?.pendingInquiries || 0}</div>
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
                <Button onClick={() => handleOpenBankDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingBanks ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
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
                        <React.Fragment key={bank.id}>
                          <TableRow>
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
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedBankForRates(
                                    selectedBankForRates === bank.id ? null : bank.id
                                  )}
                                >
                                  {bankRates.length} rates
                                </Button>
                                {lowestRate && (
                                  <span className="text-sm text-chart-1">
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
                                  <DropdownMenuItem onClick={() => handleOpenBankDialog(bank)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Bank
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleOpenRateDialog(bank.id)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Rate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => {
                                      if (confirm(`Delete ${bank.bank_name}? This will also delete all its rates.`)) {
                                        deleteBankMutation.mutate(bank.id);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                          
                          {/* Expandable rates section */}
                          {selectedBankForRates === bank.id && bankRates.length > 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/30 p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-sm">Interest Rates</h4>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleOpenRateDialog(bank.id)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Rate
                                    </Button>
                                  </div>
                                  <div className="grid gap-2">
                                    {bankRates.map(rate => (
                                      <div key={rate.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                        <div className="flex items-center gap-4">
                                          <div>
                                            <p className="font-medium text-sm">{rate.rate_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <Badge variant="outline" className="text-xs">
                                                {rate.rate_type}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground">
                                                {rate.min_term_years}-{rate.max_term_years} years
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <div className="text-right">
                                            <p className="font-bold text-chart-1">{rate.interest_rate_year1}%</p>
                                            <p className="text-xs text-muted-foreground">Year 1</p>
                                          </div>
                                          {rate.interest_rate_year2 && (
                                            <div className="text-right">
                                              <p className="font-medium">{rate.interest_rate_year2}%</p>
                                              <p className="text-xs text-muted-foreground">Year 2</p>
                                            </div>
                                          )}
                                          {rate.interest_rate_year3_plus && (
                                            <div className="text-right">
                                              <p className="font-medium">{rate.interest_rate_year3_plus}%</p>
                                              <p className="text-xs text-muted-foreground">Year 3+</p>
                                            </div>
                                          )}
                                          <div className="flex gap-1">
                                            <Button 
                                              size="icon" 
                                              variant="ghost"
                                              onClick={() => handleOpenRateDialog(bank.id, rate)}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button 
                                              size="icon" 
                                              variant="ghost"
                                              className="text-destructive"
                                              onClick={() => {
                                                if (confirm('Delete this rate?')) {
                                                  deleteRateMutation.mutate(rate.id);
                                                }
                                              }}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
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
                            ? formatCurrency(inquiry.loan_amount_requested)
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

      {/* Add/Edit Bank Dialog */}
      <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBank ? 'Edit Bank' : 'Add New Bank'}</DialogTitle>
            <DialogDescription>
              {editingBank ? 'Update bank details and settings' : 'Add a new KPR partner bank'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input
                  id="bank_name"
                  value={bankForm.bank_name}
                  onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                  placeholder="e.g., Bank Central Asia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_code">Bank Code *</Label>
                <Input
                  id="bank_code"
                  value={bankForm.bank_code}
                  onChange={(e) => setBankForm({ ...bankForm, bank_code: e.target.value })}
                  placeholder="e.g., BCA"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={bankForm.description}
                onChange={(e) => setBankForm({ ...bankForm, description: e.target.value })}
                placeholder="Brief description about the bank..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                value={bankForm.website_url}
                onChange={(e) => setBankForm({ ...bankForm, website_url: e.target.value })}
                placeholder="https://www.bank.co.id"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_loan_amount">Min Loan Amount (IDR)</Label>
                <Input
                  id="min_loan_amount"
                  type="number"
                  value={bankForm.min_loan_amount}
                  onChange={(e) => setBankForm({ ...bankForm, min_loan_amount: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_loan_amount">Max Loan Amount (IDR)</Label>
                <Input
                  id="max_loan_amount"
                  type="number"
                  value={bankForm.max_loan_amount}
                  onChange={(e) => setBankForm({ ...bankForm, max_loan_amount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_down_payment_percent">Min Down Payment (%)</Label>
                <Input
                  id="min_down_payment_percent"
                  type="number"
                  value={bankForm.min_down_payment_percent}
                  onChange={(e) => setBankForm({ ...bankForm, min_down_payment_percent: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_loan_term_years">Max Loan Term (Years)</Label>
                <Input
                  id="max_loan_term_years"
                  type="number"
                  value={bankForm.max_loan_term_years}
                  onChange={(e) => setBankForm({ ...bankForm, max_loan_term_years: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="processing_fee_percent">Processing Fee (%)</Label>
                <Input
                  id="processing_fee_percent"
                  type="number"
                  step="0.1"
                  value={bankForm.processing_fee_percent}
                  onChange={(e) => setBankForm({ ...bankForm, processing_fee_percent: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notary_fee_percent">Notary Fee (%)</Label>
                <Input
                  id="notary_fee_percent"
                  type="number"
                  step="0.1"
                  value={bankForm.notary_fee_percent}
                  onChange={(e) => setBankForm({ ...bankForm, notary_fee_percent: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_fee">Admin Fee (IDR)</Label>
                <Input
                  id="admin_fee"
                  type="number"
                  value={bankForm.admin_fee}
                  onChange={(e) => setBankForm({ ...bankForm, admin_fee: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appraisal_fee">Appraisal Fee (IDR)</Label>
                <Input
                  id="appraisal_fee"
                  type="number"
                  value={bankForm.appraisal_fee}
                  onChange={(e) => setBankForm({ ...bankForm, appraisal_fee: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={bankForm.is_active}
                  onCheckedChange={(checked) => setBankForm({ ...bankForm, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={bankForm.is_featured}
                  onCheckedChange={(checked) => setBankForm({ ...bankForm, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBankDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBank} disabled={saveBankMutation.isPending}>
              {saveBankMutation.isPending ? 'Saving...' : (editingBank ? 'Update Bank' : 'Add Bank')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Rate Dialog */}
      <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRate ? 'Edit Rate' : 'Add New Rate'}</DialogTitle>
            <DialogDescription>
              {editingRate ? 'Update interest rate details' : 'Add a new interest rate for this bank'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rate_name">Rate Name *</Label>
              <Input
                id="rate_name"
                value={rateForm.rate_name}
                onChange={(e) => setRateForm({ ...rateForm, rate_name: e.target.value })}
                placeholder="e.g., KPR Fixed 5 Years"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate_type">Rate Type</Label>
              <Select
                value={rateForm.rate_type}
                onValueChange={(value: 'fixed' | 'floating' | 'promotional') => 
                  setRateForm({ ...rateForm, rate_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="floating">Floating</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest_rate_year1">Year 1 Rate (%) *</Label>
                <Input
                  id="interest_rate_year1"
                  type="number"
                  step="0.1"
                  value={rateForm.interest_rate_year1}
                  onChange={(e) => setRateForm({ ...rateForm, interest_rate_year1: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate_year2">Year 2 Rate (%)</Label>
                <Input
                  id="interest_rate_year2"
                  type="number"
                  step="0.1"
                  value={rateForm.interest_rate_year2 || ''}
                  onChange={(e) => setRateForm({ ...rateForm, interest_rate_year2: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interest_rate_year3_plus">Year 3+ Rate (%)</Label>
                <Input
                  id="interest_rate_year3_plus"
                  type="number"
                  step="0.1"
                  value={rateForm.interest_rate_year3_plus || ''}
                  onChange={(e) => setRateForm({ ...rateForm, interest_rate_year3_plus: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_term_years">Min Term (Years)</Label>
                <Input
                  id="min_term_years"
                  type="number"
                  value={rateForm.min_term_years}
                  onChange={(e) => setRateForm({ ...rateForm, min_term_years: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_term_years">Max Term (Years)</Label>
                <Input
                  id="max_term_years"
                  type="number"
                  value={rateForm.max_term_years}
                  onChange={(e) => setRateForm({ ...rateForm, max_term_years: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="rate_is_active"
                checked={rateForm.is_active}
                onCheckedChange={(checked) => setRateForm({ ...rateForm, is_active: checked })}
              />
              <Label htmlFor="rate_is_active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRate} disabled={saveRateMutation.isPending}>
              {saveRateMutation.isPending ? 'Saving...' : (editingRate ? 'Update Rate' : 'Add Rate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MortgageManagement;
