import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, FileText, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const KYCReviewSystem = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pending');

  const kycApplications = {
    pending: [
      { id: '1', name: 'John Doe', email: 'john@example.com', submitDate: '2024-01-15', documents: 3, status: 'pending' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', submitDate: '2024-01-14', documents: 2, status: 'pending' },
    ],
    approved: [
      { id: '3', name: 'Mike Johnson', email: 'mike@example.com', submitDate: '2024-01-10', documents: 3, status: 'approved' },
    ],
    rejected: [
      { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', submitDate: '2024-01-08', documents: 2, status: 'rejected' },
    ]
  };

  const handleApprove = (id: string, name: string) => {
    toast({
      title: "Application Approved",
      description: `${name}'s KYC application has been approved.`,
    });
  };

  const handleReject = (id: string, name: string) => {
    toast({
      title: "Application Rejected",
      description: `${name}'s KYC application has been rejected.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-6 h-6" />
          KYC Review System
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review and manage Know Your Customer (KYC) applications
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{kycApplications.pending.length}</div>
            <Badge variant="secondary" className="mt-1">Needs attention</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{kycApplications.approved.length}</div>
            <Badge variant="outline" className="mt-1">This week</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{kycApplications.rejected.length}</div>
            <Badge variant="outline" className="mt-1">This week</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {kycApplications.pending.length + kycApplications.approved.length + kycApplications.rejected.length}
            </div>
            <Badge variant="secondary" className="mt-1">All time</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>KYC Applications</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search applications..." 
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="text-xs sm:text-sm">
                Pending ({kycApplications.pending.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs sm:text-sm">
                Approved ({kycApplications.approved.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs sm:text-sm">
                Rejected ({kycApplications.rejected.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {kycApplications.pending.map((application) => (
                <div key={application.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{application.name}</h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Submitted: {application.submitDate}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {application.documents} documents
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApprove(application.id, application.name)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReject(application.id, application.name)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              {kycApplications.approved.map((application) => (
                <div key={application.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{application.name}</h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Approved: {application.submitDate}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {application.documents} documents
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              {kycApplications.rejected.map((application) => (
                <div key={application.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{application.name}</h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{application.email}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Rejected: {application.submitDate}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {application.documents} documents
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <Button size="sm" variant="outline">
                      Review Again
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCReviewSystem;