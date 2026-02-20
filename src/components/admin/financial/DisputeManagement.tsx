import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Send,
  Paperclip,
  Scale,
  User,
  Store,
  Shield,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useRefundDispute, Dispute, DisputeMessage } from '@/hooks/useRefundDispute';
import { useAuth } from '@/contexts/AuthContext';

const statusColors: Record<string, string> = {
  open: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
  under_review: 'bg-primary/10 text-primary border-primary/20',
  resolved_buyer: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
  resolved_seller: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  escalated: 'bg-destructive/10 text-destructive border-destructive/20',
  closed: 'bg-muted text-muted-foreground border-border',
};

const categoryIcons: Record<string, React.ElementType> = {
  service_quality: AlertTriangle,
  non_delivery: XCircle,
  billing: Scale,
  fraud: Shield,
  other: MessageSquare,
};

const categoryLabels: Record<string, string> = {
  service_quality: 'Service Quality',
  non_delivery: 'Non-Delivery',
  billing: 'Billing Issue',
  fraud: 'Fraud',
  other: 'Other',
};

export const DisputeManagement: React.FC = () => {
  const { user } = useAuth();
  const { disputes, isLoading, fetchDisputes, addDisputeMessage, resolveDispute } = useRefundDispute();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [resolution, setResolution] = useState<'resolved_buyer' | 'resolved_seller' | 'closed'>('resolved_buyer');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionAmount, setResolutionAmount] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendMessage = async () => {
    if (!selectedDispute || !newMessage.trim()) return;
    
    const success = await addDisputeMessage(selectedDispute.id, newMessage, 'admin');
    if (success) {
      setNewMessage('');
      fetchDisputes();
      // Update selected dispute
      const updated = disputes.find(d => d.id === selectedDispute.id);
      if (updated) setSelectedDispute(updated);
    }
  };

  const handleResolve = async () => {
    if (!selectedDispute) return;
    
    const amount = resolutionAmount ? parseFloat(resolutionAmount) : undefined;
    const success = await resolveDispute(selectedDispute.id, resolution, resolutionNotes, amount);
    
    if (success) {
      setShowResolveDialog(false);
      setShowDetailSheet(false);
      setSelectedDispute(null);
      setResolutionNotes('');
      setResolutionAmount('');
      fetchDisputes();
    }
  };

  const formatCurrency = (amount: number) => 
    `Rp ${amount.toLocaleString('id-ID')}`;

  const getSenderIcon = (type: DisputeMessage['sender_type']) => {
    switch (type) {
      case 'buyer': return User;
      case 'seller': return Store;
      case 'admin': return Shield;
    }
  };

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    underReview: disputes.filter(d => d.status === 'under_review').length,
    escalated: disputes.filter(d => d.status === 'escalated').length,
    resolved: disputes.filter(d => ['resolved_buyer', 'resolved_seller', 'closed'].includes(d.status)).length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-3/10">
              <AlertTriangle className="h-4 w-4 text-chart-3" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-lg font-bold">{stats.open}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Under Review</p>
              <p className="text-lg font-bold">{stats.underReview}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Shield className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Escalated</p>
              <p className="text-lg font-bold">{stats.escalated}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <CheckCircle className="h-4 w-4 text-chart-1" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-lg font-bold">{stats.resolved}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or description..."
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved_buyer">Resolved (Buyer)</SelectItem>
            <SelectItem value="resolved_seller">Resolved (Seller)</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes List */}
      <div className="grid gap-3">
        {filteredDisputes.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No disputes found
          </Card>
        ) : (
          filteredDisputes.map((dispute) => {
            const CategoryIcon = categoryIcons[dispute.category] || MessageSquare;
            const isOverdue = new Date(dispute.due_date) < new Date() && 
              !['resolved_buyer', 'resolved_seller', 'closed'].includes(dispute.status);

            return (
              <Card 
                key={dispute.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${isOverdue ? 'border-destructive/50' : ''}`}
                onClick={() => {
                  setSelectedDispute(dispute);
                  setShowDetailSheet(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        dispute.category === 'fraud' ? 'bg-destructive/10' :
                        dispute.category === 'billing' ? 'bg-primary/10' :
                        'bg-chart-3/10'
                      }`}>
                        <CategoryIcon className={`h-5 w-5 ${
                          dispute.category === 'fraud' ? 'text-destructive' :
                          dispute.category === 'billing' ? 'text-primary' :
                          'text-chart-3'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm">{dispute.order_id}</span>
                          <Badge className={statusColors[dispute.status]}>
                            {dispute.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[dispute.category]}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {dispute.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            {formatCurrency(dispute.amount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {format(new Date(dispute.due_date), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {dispute.messages.length} messages
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right shrink-0">
                      {formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={showDetailSheet} onOpenChange={setShowDetailSheet}>
        <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Dispute: {selectedDispute?.order_id}
            </SheetTitle>
            <SheetDescription>
              {selectedDispute && categoryLabels[selectedDispute.category]} dispute
            </SheetDescription>
          </SheetHeader>

          {selectedDispute && (
            <>
              {/* Dispute Info */}
              <div className="p-4 border-b bg-muted/30">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount</span>
                    <p className="font-medium">{formatCurrency(selectedDispute.amount)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={`${statusColors[selectedDispute.status]} mt-1`}>
                      {selectedDispute.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Description</span>
                    <p className="text-sm">{selectedDispute.description}</p>
                  </div>
                </div>

                {!['resolved_buyer', 'resolved_seller', 'closed'].includes(selectedDispute.status) && (
                  <Button
                    className="w-full mt-3"
                    onClick={() => setShowResolveDialog(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve Dispute
                  </Button>
                )}

                {selectedDispute.resolution && (
                  <div className="mt-3 p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
                    <p className="text-sm font-medium text-chart-1">
                      Resolution
                    </p>
                    <p className="text-sm mt-1">{selectedDispute.resolution}</p>
                    {selectedDispute.resolution_amount && (
                      <p className="text-sm font-medium mt-2">
                        Refund Amount: {formatCurrency(selectedDispute.resolution_amount)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedDispute.messages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet
                    </p>
                  ) : (
                    selectedDispute.messages.map((msg) => {
                      const SenderIcon = getSenderIcon(msg.sender_type);
                      return (
                        <div key={msg.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={
                              msg.sender_type === 'admin' ? 'bg-primary/10 text-primary' :
                              msg.sender_type === 'seller' ? 'bg-chart-2/10 text-chart-2' :
                              'bg-chart-4/10 text-chart-4'
                            }>
                              <SenderIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">
                                {msg.sender_type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm mt-1 p-3 rounded-lg bg-muted/50">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              {!['resolved_buyer', 'resolved_seller', 'closed'].includes(selectedDispute.status) && (
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Choose how to resolve this dispute
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resolution</label>
              <Select value={resolution} onValueChange={(v: any) => setResolution(v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resolved_buyer">Resolve in Buyer's Favor</SelectItem>
                  <SelectItem value="resolved_seller">Resolve in Seller's Favor</SelectItem>
                  <SelectItem value="closed">Close Without Resolution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {resolution === 'resolved_buyer' && (
              <div>
                <label className="text-sm font-medium">Refund Amount (optional)</label>
                <Input
                  type="number"
                  placeholder="Enter refund amount"
                  value={resolutionAmount}
                  onChange={(e) => setResolutionAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                placeholder="Explain the resolution..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={!resolutionNotes.trim() || isLoading}>
              {isLoading ? 'Processing...' : 'Resolve Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisputeManagement;
