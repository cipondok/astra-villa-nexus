import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Search, Filter, CheckSquare, X, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface KYCSubmission {
  id: string;
  vendor_id: string;
  kyc_status: string;
  created_at: string;
  verified_at: string | null;
  compliance_score: number;
  access_level: string;
  verification_notes: string | null;
  vendor?: {
    full_name: string;
    email: string;
    company_name: string;
  };
}

export const BulkKYCOperations = () => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [bulkAction, setBulkAction] = React.useState<'approve' | 'reject' | null>(null);
  const [bulkNotes, setBulkNotes] = React.useState('');
  const [showBulkDialog, setShowBulkDialog] = React.useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch KYC submissions with vendor details
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['bulk-kyc-submissions', searchQuery, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('vendor_kyc_status')
        .select(`
          *,
          vendor:profiles!vendor_kyc_status_vendor_id_fkey(full_name, email, company_name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('kyc_status', statusFilter as any);
      }

      if (searchQuery) {
        // Search by vendor email or company name
        // Simple text search for now - will filter in client
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as any;
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ action, notes, selectedIds }: { 
      action: 'approve' | 'reject'; 
      notes: string; 
      selectedIds: string[] 
    }) => {
      const user = await supabase.auth.getUser();
      const updates = selectedIds.map(id => ({
        id,
        kyc_status: action === 'approve' ? 'verified' as const : 'rejected' as const,
        verified_at: new Date().toISOString(),
        verified_by: user.data.user?.id,
        verification_notes: notes,
        compliance_score: action === 'approve' ? 85 : 0,
        access_level: action === 'approve' ? 'full' : 'none'
      }));

      const { error } = await supabase
        .from('vendor_kyc_status')
        .upsert(updates);

      if (error) throw error;
      return updates;
    },
    onSuccess: (data) => {
      toast({
        title: 'Bulk Update Successful',
        description: `${data.length} KYC submissions have been updated.`
      });
      queryClient.invalidateQueries({ queryKey: ['bulk-kyc-submissions'] });
      setSelectedIds([]);
      setShowBulkDialog(false);
      setBulkNotes('');
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: 'An error occurred while updating the submissions.',
        variant: 'destructive'
      });
      console.error('Bulk update error:', error);
    }
  });

  const handleSelectAll = () => {
    if (selectedIds.length === submissions?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(submissions?.map(s => s.id) || []);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedIds.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one submission to perform bulk action.',
        variant: 'destructive'
      });
      return;
    }
    setBulkAction(action);
    setShowBulkDialog(true);
  };

  const executeBulkAction = () => {
    if (!bulkAction || selectedIds.length === 0) return;
    
    bulkUpdateMutation.mutate({
      action: bulkAction,
      notes: bulkNotes,
      selectedIds
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'under_verification':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Under Review</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = !searchQuery || 
      submission.vendor?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.vendor?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.vendor?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }) || [];

  if (isLoading) {
    return <div className="p-6">Loading KYC submissions...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk KYC Operations</h1>
          <p className="text-muted-foreground">Manage multiple KYC submissions efficiently</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleBulkAction('approve')}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve ({selectedIds.length})
            </Button>
            <Button 
              onClick={() => handleBulkAction('reject')}
              variant="destructive"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject ({selectedIds.length})
            </Button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Vendors</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by email, company, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="documents_submitted">Documents Submitted</SelectItem>
                  <SelectItem value="under_verification">Under Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSelectedIds([]);
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredSubmissions.length} submissions found
          {selectedIds.length > 0 && ` • ${selectedIds.length} selected`}
        </p>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedIds.length === filteredSubmissions.length && filteredSubmissions.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <Label className="text-sm">Select All</Label>
        </div>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Access Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(submission.id)}
                      onCheckedChange={() => handleSelectItem(submission.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.vendor?.full_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{submission.vendor?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {submission.vendor?.company_name || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(submission.kyc_status)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(submission.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{submission.compliance_score}</span>
                      {submission.compliance_score >= 80 && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {submission.compliance_score < 50 && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={submission.access_level === 'full' ? 'default' : 'secondary'}>
                      {submission.access_level}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bulk {bulkAction === 'approve' ? 'Approve' : 'Reject'} KYC Submissions
            </DialogTitle>
            <DialogDescription>
              You are about to {bulkAction} {selectedIds.length} KYC submissions. 
              This action will update their status and send notifications to the vendors.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="bulk-notes">Review Notes</Label>
              <Textarea
                id="bulk-notes"
                placeholder={`Enter reason for ${bulkAction === 'approve' ? 'approval' : 'rejection'}...`}
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Selected Submissions ({selectedIds.length})</h4>
              <div className="max-h-32 overflow-y-auto">
                {submissions?.filter(s => selectedIds.includes(s.id)).map(submission => (
                  <div key={submission.id} className="text-sm py-1">
                    {submission.vendor?.full_name} - {submission.vendor?.email}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeBulkAction}
              disabled={bulkUpdateMutation.isPending}
              className={bulkAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={bulkAction === 'reject' ? 'destructive' : 'default'}
            >
              {bulkUpdateMutation.isPending ? 'Processing...' : `${bulkAction === 'approve' ? 'Approve' : 'Reject'} Selected`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};