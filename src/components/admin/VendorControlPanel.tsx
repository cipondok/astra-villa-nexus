
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserCheck, 
  Store, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Ban,
  Star,
  DollarSign,
  Calendar,
  FileText,
  Shield
} from 'lucide-react';

const VendorControlPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock vendor data
  const vendors = [
    {
      id: '1',
      name: 'Premium Construction',
      email: 'contact@premiumconstruction.com',
      status: 'approved',
      verification: 'verified',
      joinDate: '2024-01-10',
      rating: 4.8,
      completedJobs: 45,
      revenue: 125000,
      category: 'Construction',
      phone: '+62812345678',
      documents: ['business_license', 'tax_certificate', 'insurance']
    },
    {
      id: '2',
      name: 'Elite Plumbing Services',
      email: 'info@eliteplumbing.com',
      status: 'pending',
      verification: 'pending',
      joinDate: '2024-01-12',
      rating: 0,
      completedJobs: 0,
      revenue: 0,
      category: 'Plumbing',
      phone: '+62987654321',
      documents: ['business_license']
    },
    {
      id: '3',
      name: 'Green Garden Solutions',
      email: 'hello@greengarden.com',
      status: 'suspended',
      verification: 'verified',
      joinDate: '2023-12-15',
      rating: 3.2,
      completedJobs: 12,
      revenue: 25000,
      category: 'Landscaping',
      phone: '+62555123456',
      documents: ['business_license', 'tax_certificate']
    }
  ];

  const pendingApprovals = [
    {
      id: '1',
      vendorName: 'ABC Electrical',
      type: 'New Registration',
      submittedDate: '2024-01-15',
      priority: 'high',
      documents: 3
    },
    {
      id: '2',
      vendorName: 'Quick Fix Repairs',
      type: 'Document Update',
      submittedDate: '2024-01-14',
      priority: 'medium',
      documents: 2
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getVerificationBadge = (verification: string) => {
    switch (verification) {
      case 'verified':
        return <Badge className="bg-blue-100 text-blue-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const handleApproveVendor = (vendorId: string) => {
    console.log('Approving vendor:', vendorId);
    // Implement approval logic
  };

  const handleRejectVendor = (vendorId: string) => {
    console.log('Rejecting vendor:', vendorId);
    // Implement rejection logic
  };

  const handleSuspendVendor = (vendorId: string) => {
    console.log('Suspending vendor:', vendorId);
    // Implement suspension logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Control Panel</h2>
          <p className="text-gray-600">Manage vendor registrations, approvals, and performance</p>
        </div>
        <Button>
          <UserCheck className="h-4 w-4 mr-2" />
          Bulk Actions
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold">89</p>
                <p className="text-xs text-green-600">+12 this month</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold">15</p>
                <p className="text-xs text-yellow-600">Requires action</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold">67</p>
                <p className="text-xs text-green-600">92% approval rate</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">$2.4M</p>
                <p className="text-xs text-green-600">+18% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vendors">All Vendors</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* All Vendors */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vendor Management</CardTitle>
                  <CardDescription>Manage all registered vendors</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
                  <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>ID</TableHead>
                     <TableHead>Vendor</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead>Verification</TableHead>
                     <TableHead>Rating</TableHead>
                     <TableHead>Revenue</TableHead>
                     <TableHead>Actions</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {vendors.map((vendor) => (
                     <TableRow key={vendor.id}>
                       <TableCell>
                         <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                           {vendor.id}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div>
                           <div className="font-medium">{vendor.name}</div>
                           <div className="text-sm text-gray-500">{vendor.email}</div>
                         </div>
                       </TableCell>
                      <TableCell>{vendor.category}</TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell>{getVerificationBadge(vendor.verification)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>${vendor.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {vendor.status === 'approved' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleSuspendVendor(vendor.id)}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          ) : vendor.status === 'pending' ? (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveVendor(vendor.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectVendor(vendor.id)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approvals */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Vendor applications requiring review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Store className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{approval.vendorName}</div>
                          <div className="text-sm text-gray-500">{approval.type}</div>
                          <div className="text-xs text-gray-400">Submitted: {approval.submittedDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getPriorityBadge(approval.priority)}
                        <Badge variant="outline">{approval.documents} docs</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.filter(v => v.rating > 4).map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-gray-500">{vendor.completedJobs} jobs completed</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{vendor.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Revenue Chart Placeholder
                  <br />
                  (Integrate with charting library)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verification */}
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Verification</CardTitle>
              <CardDescription>Document verification and compliance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div key={vendor.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">{vendor.name}</div>
                      {getVerificationBadge(vendor.verification)}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Business License:</span>
                        <span className="ml-2">
                          {vendor.documents.includes('business_license') ? '✅' : '❌'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tax Certificate:</span>
                        <span className="ml-2">
                          {vendor.documents.includes('tax_certificate') ? '✅' : '❌'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Insurance:</span>
                        <span className="ml-2">
                          {vendor.documents.includes('insurance') ? '✅' : '❌'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorControlPanel;
