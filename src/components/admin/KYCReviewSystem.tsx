import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, FileText, CheckCircle, XCircle, Clock, Search, Users, AlertCircle } from 'lucide-react';
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
    const styles: Record<string, string> = {
      pending: "bg-chart-3/10 text-chart-3 border-chart-3/30",
      approved: "bg-chart-1/10 text-chart-1 border-chart-1/30",
      rejected: "bg-destructive/10 text-destructive border-destructive/30"
    };
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <CheckCircle className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />
    };
    return (
      <Badge variant="outline" className={`text-[10px] ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const totalApplications = kycApplications.pending.length + kycApplications.approved.length + kycApplications.rejected.length;

  return (
    <div className="space-y-4">
      {/* Professional Header */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              KYC Review System
              <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/30 text-[10px]">
                {kycApplications.pending.length} Pending
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">Review and manage Know Your Customer (KYC) applications</p>
          </div>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold text-chart-3">{kycApplications.pending.length}</p>
              </div>
              <div className="p-2 bg-chart-3/10 rounded-lg">
                <Clock className="h-4 w-4 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Approved</p>
                <p className="text-xl font-bold text-chart-1">{kycApplications.approved.length}</p>
              </div>
              <div className="p-2 bg-chart-1/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Rejected</p>
                <p className="text-xl font-bold text-destructive">{kycApplications.rejected.length}</p>
              </div>
              <div className="p-2 bg-destructive/10 rounded-lg">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-primary">{totalApplications}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            KYC Applications
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search applications..." 
                className="pl-10 h-8 text-sm"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-40 h-8 text-xs">
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
        <CardContent className="pt-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
            <TabsList className="h-9 p-1 bg-muted/50">
              <TabsTrigger value="pending" className="text-xs h-7 px-3">
                <Clock className="h-3 w-3 mr-1" />
                Pending ({kycApplications.pending.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="text-xs h-7 px-3">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approved ({kycApplications.approved.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="text-xs h-7 px-3">
                <XCircle className="h-3 w-3 mr-1" />
                Rejected ({kycApplications.rejected.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-3">
              {kycApplications.pending.map((application) => (
                <div key={application.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{application.name}</h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{application.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Submitted: {application.submitDate}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {application.documents} docs
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleApprove(application.id, application.name)}
                      className="h-7 text-xs text-chart-1 border-chart-1/30 hover:bg-chart-1/10"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReject(application.id, application.name)}
                      className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="approved" className="space-y-3">
              {kycApplications.approved.map((application) => (
                <div key={application.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{application.name}</h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{application.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Approved: {application.submitDate}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {application.documents} docs
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-3">
              {kycApplications.rejected.map((application) => (
                <div key={application.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{application.name}</h4>
                      {getStatusBadge(application.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{application.email}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Rejected: {application.submitDate}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {application.documents} docs
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs text-chart-3 border-chart-3/30 hover:bg-chart-3/10">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Review Again
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
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
