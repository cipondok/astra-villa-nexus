import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getCurrencyFormatter } from '@/stores/currencyStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  FileText,
  DollarSign
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRefundDispute, RefundRequest } from '@/hooks/useRefundDispute';

const statusColors: Record<string, string> = {
  pending: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  approved: 'bg-primary/10 text-primary border-primary/20',
  processing: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  completed: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const categoryLabels: Record<string, string> = {
  service_not_delivered: 'Service Not Delivered',
  duplicate_payment: 'Duplicate Payment',
  wrong_amount: 'Wrong Amount',
  customer_request: 'Customer Request',
  other: 'Other',
};

export const RefundManagement: React.FC = () => {
  const { refunds, isLoading, fetchRefunds, processRefund } = useRefundDispute();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = 
      refund.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProcess = async () => {
    if (!selectedRefund) return;
    
    const success = await processRefund(selectedRefund.id, processAction, adminNotes);
    if (success) {
      setShowProcessDialog(false);
      setSelectedRefund(null);
      setAdminNotes('');
      fetchRefunds();
    }
  };

  const formatCurrency = getCurrencyFormatter();

  const stats = {
    total: refunds.length,
    pending: refunds.filter(r => r.status === 'pending').length,
    processing: refunds.filter(r => r.status === 'processing').length,
    completed: refunds.filter(r => r.status === 'completed').length,
    totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0),
    pendingAmount: refunds.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <Clock className="h-4 w-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <RotateCcw className="h-4 w-4 text-chart-2" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Processing</p>
              <p className="text-lg font-bold">{stats.processing}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <CheckCircle className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-lg font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <DollarSign className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Amount</p>
              <p className="text-sm font-bold">{formatCurrency(stats.pendingAmount)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Refunds Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Refund Requests</CardTitle>
          <CardDescription>
            {filteredRefunds.length} refund request{filteredRefunds.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No refund requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRefunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="font-mono text-sm">{refund.order_id}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(refund.amount)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{refund.reason}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {categoryLabels[refund.reason_category] || refund.reason_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[refund.status]}>
                          {refund.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(refund.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        {refund.status === 'pending' && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setProcessAction('approve');
                                setShowProcessDialog(true);
                              }}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-destructive"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setProcessAction('reject');
                                setShowProcessDialog(true);
                              }}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {refund.status !== 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => setSelectedRefund(refund)}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Process Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processAction === 'approve' ? 'Approve' : 'Reject'} Refund
            </DialogTitle>
            <DialogDescription>
              {processAction === 'approve' 
                ? 'This will process the refund to the customer.'
                : 'This will reject the refund request.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRefund && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Order ID:</span>
                    <p className="font-mono">{selectedRefund.order_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p className="font-medium">{formatCurrency(selectedRefund.amount)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-muted-foreground text-sm">Reason:</span>
                  <p className="text-sm">{selectedRefund.reason}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  placeholder="Add notes for this decision..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcess}
              variant={processAction === 'reject' ? 'destructive' : 'default'}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : processAction === 'approve' ? 'Approve Refund' : 'Reject Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundManagement;
