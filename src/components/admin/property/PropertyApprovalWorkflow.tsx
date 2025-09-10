import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  MessageSquare, 
  FileCheck, 
  UserCheck,
  Flag,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PropertyApproval {
  id: string;
  property_id: string;
  submitted_by: string;
  current_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_changes';
  assigned_reviewer?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submitted_at: string;
  reviewed_at?: string;
  approved_at?: string;
  rejection_reason?: string;
  compliance_check?: {
    documents: boolean;
    legal_requirements: boolean;
    content_quality: boolean;
    image_quality: boolean;
    pricing_accuracy: boolean;
  };
  property: {
    title: string;
    location: string;
    price: number;
    property_type: string;
    listing_type: string;
  };
  submitter: {
    full_name: string;
    email: string;
  };
  reviewer?: {
    full_name: string;
    email: string;
  };
}

interface ApprovalAction {
  id: string;
  approval_id: string;
  action_type: 'submitted' | 'assigned' | 'reviewed' | 'approved' | 'rejected' | 'requested_changes';
  performed_by: string;
  performed_at: string;
  notes?: string;
  user: {
    full_name: string;
    email: string;
  };
}

const PropertyApprovalWorkflow = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedApproval, setSelectedApproval] = useState<PropertyApproval | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_changes'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Mock data - in real implementation, this would come from Supabase
  const mockApprovals: PropertyApproval[] = [
    {
      id: '1',
      property_id: 'prop-1',
      submitted_by: 'user-1',
      current_status: 'pending',
      priority: 'high',
      submitted_at: '2024-01-15T10:00:00Z',
      compliance_check: {
        documents: true,
        legal_requirements: false,
        content_quality: true,
        image_quality: true,
        pricing_accuracy: true
      },
      property: {
        title: 'Modern Villa in Seminyak',
        location: 'Seminyak, Bali',
        price: 8500000000,
        property_type: 'villa',
        listing_type: 'sale'
      },
      submitter: {
        full_name: 'John Doe',
        email: 'john@example.com'
      }
    },
    {
      id: '2',
      property_id: 'prop-2',
      submitted_by: 'user-2',
      current_status: 'under_review',
      assigned_reviewer: 'admin-1',
      priority: 'medium',
      submitted_at: '2024-01-14T15:30:00Z',
      compliance_check: {
        documents: true,
        legal_requirements: true,
        content_quality: true,
        image_quality: false,
        pricing_accuracy: true
      },
      property: {
        title: 'Luxury Apartment Jakarta',
        location: 'Kemang, Jakarta Selatan',
        price: 2500000000,
        property_type: 'apartment',
        listing_type: 'sale'
      },
      submitter: {
        full_name: 'Jane Smith',
        email: 'jane@example.com'
      },
      reviewer: {
        full_name: 'Admin User',
        email: 'admin@example.com'
      }
    }
  ];

  const mockActions: ApprovalAction[] = [
    {
      id: '1',
      approval_id: '1',
      action_type: 'submitted',
      performed_by: 'user-1',
      performed_at: '2024-01-15T10:00:00Z',
      notes: 'Property submitted for approval',
      user: {
        full_name: 'John Doe',
        email: 'john@example.com'
      }
    }
  ];

  // Filter approvals based on status and filters
  const filteredApprovals = mockApprovals.filter(approval => {
    if (activeTab !== 'all' && approval.current_status !== activeTab) return false;
    if (filterPriority !== 'all' && approval.priority !== filterPriority) return false;
    if (filterAssignee !== 'all') {
      if (filterAssignee === 'unassigned' && approval.assigned_reviewer) return false;
      if (filterAssignee === 'assigned' && !approval.assigned_reviewer) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      under_review: { variant: 'outline' as const, icon: Eye, label: 'Under Review' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejected' },
      requires_changes: { variant: 'outline' as const, icon: AlertTriangle, label: 'Requires Changes' }
    };
    
    const { variant, icon: Icon, label } = config[status as keyof typeof config] || config.pending;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors]} variant="outline">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getComplianceScore = (compliance: any) => {
    if (!compliance) return 0;
    const checks = Object.values(compliance) as boolean[];
    const passed = checks.filter(Boolean).length;
    return (passed / checks.length) * 100;
  };

  const handleReviewSubmit = async () => {
    if (!selectedApproval) return;

    try {
      // In real implementation, this would update the approval status in Supabase
      showSuccess(
        'Review Submitted',
        `Property has been ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'marked for changes'}`
      );
      
      setIsReviewDialogOpen(false);
      setSelectedApproval(null);
      setReviewNotes('');
    } catch (error: any) {
      showError('Error', error.message);
    }
  };

  const assignReviewer = async (approvalId: string, reviewerId: string) => {
    try {
      // In real implementation, this would assign a reviewer in Supabase
      showSuccess('Reviewer Assigned', 'Reviewer has been assigned to this property');
    } catch (error: any) {
      showError('Error', error.message);
    }
  };

  const stats = {
    total: mockApprovals.length,
    pending: mockApprovals.filter(a => a.current_status === 'pending').length,
    under_review: mockApprovals.filter(a => a.current_status === 'under_review').length,
    approved: mockApprovals.filter(a => a.current_status === 'approved').length,
    rejected: mockApprovals.filter(a => a.current_status === 'rejected').length,
    avg_review_time: '2.5 days'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Property Approval Workflow
          </CardTitle>
          <CardDescription>
            Manage property approval process, compliance checks, and review workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.under_review}</div>
              <div className="text-sm text-muted-foreground">Under Review</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.avg_review_time}</div>
              <div className="text-sm text-muted-foreground">Avg Review Time</div>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="under_review">Under Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="requires_changes">Requires Changes</TabsTrigger>
            </TabsList>

            {/* Filters */}
            <div className="flex gap-4">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Approvals Table */}
            <TabsContent value={activeTab} className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Submitter</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApprovals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No approvals found for the selected criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApprovals.map((approval) => (
                        <TableRow key={approval.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{approval.property.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {approval.property.location} • Rp {approval.property.price.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {approval.property.property_type} • {approval.property.listing_type}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{approval.submitter.full_name}</div>
                              <div className="text-sm text-muted-foreground">{approval.submitter.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(approval.current_status)}</TableCell>
                          <TableCell>{getPriorityBadge(approval.priority)}</TableCell>
                          <TableCell>
                            {approval.compliance_check && (
                              <div className="space-y-1">
                                <Progress value={getComplianceScore(approval.compliance_check)} className="h-2" />
                                <div className="text-xs text-muted-foreground">
                                  {getComplianceScore(approval.compliance_check).toFixed(0)}% Complete
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {approval.reviewer ? (
                              <div>
                                <div className="font-medium">{approval.reviewer.full_name}</div>
                                <div className="text-sm text-muted-foreground">{approval.reviewer.email}</div>
                              </div>
                            ) : (
                              <Badge variant="outline">Unassigned</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{new Date(approval.submitted_at).toLocaleDateString()}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(approval.submitted_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedApproval(approval)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {(approval.current_status === 'pending' || approval.current_status === 'under_review') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedApproval(approval);
                                    setIsReviewDialogOpen(true);
                                  }}
                                >
                                  <FileCheck className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Property Details Modal */}
      {selectedApproval && !isReviewDialogOpen && (
        <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Property Approval Details</DialogTitle>
              <DialogDescription>
                Review property information and compliance status
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Property Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedApproval.property.title}</CardTitle>
                  <CardDescription>{selectedApproval.property.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price</Label>
                      <div className="font-medium">Rp {selectedApproval.property.price.toLocaleString()}</div>
                    </div>
                    <div>
                      <Label>Type</Label>
                      <div className="font-medium capitalize">
                        {selectedApproval.property.property_type} • {selectedApproval.property.listing_type}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Check */}
              {selectedApproval.compliance_check && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Check</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedApproval.compliance_check).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="capitalize">{key.replace('_', ' ')}</span>
                          {value ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Action History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockActions
                      .filter(action => action.approval_id === selectedApproval.id)
                      .map((action) => (
                        <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium capitalize">
                              {action.action_type.replace('_', ' ')} by {action.user.full_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(action.performed_at).toLocaleString()}
                            </div>
                            {action.notes && (
                              <div className="text-sm mt-1 p-2 bg-muted rounded">
                                {action.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApproval(null)}>
                Close
              </Button>
              {(selectedApproval.current_status === 'pending' || selectedApproval.current_status === 'under_review') && (
                <Button onClick={() => setIsReviewDialogOpen(true)}>
                  Review Property
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Property</DialogTitle>
            <DialogDescription>
              Make a decision on this property submission
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Review Decision</Label>
              <Select value={reviewAction} onValueChange={(value: any) => setReviewAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve Property</SelectItem>
                  <SelectItem value="reject">Reject Property</SelectItem>
                  <SelectItem value="request_changes">Request Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Review Notes</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about your review decision..."
                rows={4}
              />
            </div>
            {reviewAction === 'reject' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please provide detailed feedback to help the submitter improve their listing.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyApprovalWorkflow;