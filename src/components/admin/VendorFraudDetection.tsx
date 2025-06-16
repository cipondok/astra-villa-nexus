import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Brain,
  Activity,
  TrendingDown,
  Flag,
  CheckCircle
} from "lucide-react";

const VendorFraudDetection = () => {
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [actionTaken, setActionTaken] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch fraud detection cases
  const { data: fraudCases, isLoading } = useQuery({
    queryKey: ['vendor-fraud-detection'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_fraud_detection')
        .select(`
          *,
          vendor_profiles:vendor_id (
            full_name,
            email
          ),
          reviewed_by_profile:reviewed_by (
            full_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Update fraud case action
  const updateFraudCaseMutation = useMutation({
    mutationFn: async ({ caseId, action }: any) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('vendor_fraud_detection')
        .update({
          action_taken: action,
          reviewed_by: user.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Fraud case updated successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-fraud-detection'] });
      setIsReviewModalOpen(false);
    },
    onError: () => {
      showError("Error", "Failed to update fraud case");
    }
  });

  const getRiskLevelColor = (level: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getDetectionTypeIcon = (type: string) => {
    const icons = {
      fake_reviews: <Activity className="h-4 w-4" />,
      payment_fraud: <TrendingDown className="h-4 w-4" />,
      profile_anomaly: <Flag className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <AlertTriangle className="h-4 w-4" />;
  };

  const handleReviewCase = (fraudCase: any) => {
    setSelectedCase(fraudCase);
    setActionTaken(fraudCase.action_taken || "");
    setIsReviewModalOpen(true);
  };

  const handleUpdateCase = () => {
    if (!selectedCase || !actionTaken) return;
    
    updateFraudCaseMutation.mutate({
      caseId: selectedCase.id,
      action: actionTaken
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading fraud detection data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            AI Fraud Detection
          </h2>
          <p className="text-muted-foreground">Automated fraud detection with ML-powered risk assessment</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Cases</p>
                <p className="text-2xl font-bold">{fraudCases?.length || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {fraudCases?.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {fraudCases?.filter(c => !c.action_taken || c.action_taken === 'investigating').length || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">
                  {fraudCases?.filter(c => c.action_taken === 'cleared' || c.action_taken === 'suspended').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Cases Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Cases</TabsTrigger>
          <TabsTrigger value="high-risk">High Risk</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Fraud Detection Cases</CardTitle>
              <CardDescription>Complete list of AI-detected fraud cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudCases?.map((fraudCase) => (
                  <div key={fraudCase.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getDetectionTypeIcon(fraudCase.detection_type)}
                        <div>
                          <h3 className="font-semibold">{fraudCase.vendor_profiles?.full_name || 'Unknown Vendor'}</h3>
                          <p className="text-sm text-muted-foreground">{fraudCase.vendor_profiles?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskLevelColor(fraudCase.risk_level)}>
                          {fraudCase.risk_level.toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleReviewCase(fraudCase)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="font-medium">Detection Type</Label>
                        <p className="capitalize">{fraudCase.detection_type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Fraud Probability</Label>
                        <p className="font-bold text-red-600">{fraudCase.fraud_probability}%</p>
                      </div>
                      <div>
                        <Label className="font-medium">Model Version</Label>
                        <p>{fraudCase.model_version || 'v1.0'}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Status</Label>
                        <p className="capitalize">{fraudCase.action_taken || 'Pending'}</p>
                      </div>
                    </div>

                    {fraudCase.detection_details && Object.keys(fraudCase.detection_details).length > 0 && (
                      <div className="mt-3 p-2 bg-gray-50 rounded">
                        <Label className="text-sm font-medium">Detection Details:</Label>
                        <pre className="text-xs mt-1 whitespace-pre-wrap">
                          {JSON.stringify(fraudCase.detection_details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="high-risk">
          <Card>
            <CardHeader>
              <CardTitle>High Risk Cases</CardTitle>
              <CardDescription>Cases requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudCases?.filter(c => c.risk_level === 'high' || c.risk_level === 'critical').map((fraudCase) => (
                  <div key={fraudCase.id} className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                    {/* Same content structure as above */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getDetectionTypeIcon(fraudCase.detection_type)}
                        <div>
                          <h3 className="font-semibold">{fraudCase.vendor_profiles?.full_name || 'Unknown Vendor'}</h3>
                          <p className="text-sm text-muted-foreground">{fraudCase.vendor_profiles?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskLevelColor(fraudCase.risk_level)}>
                          {fraudCase.risk_level.toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleReviewCase(fraudCase)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                    {/* Rest of the content */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents would follow similar pattern */}
      </Tabs>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Fraud Detection Case</DialogTitle>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <p className="font-medium">{selectedCase.vendor_profiles?.full_name}</p>
                </div>
                <div>
                  <Label>Risk Level</Label>
                  <Badge className={getRiskLevelColor(selectedCase.risk_level)}>
                    {selectedCase.risk_level.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Detection Type</Label>
                  <p className="capitalize">{selectedCase.detection_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label>Fraud Probability</Label>
                  <p className="font-bold text-red-600">{selectedCase.fraud_probability}%</p>
                </div>
              </div>

              <div>
                <Label>Detection Details</Label>
                <div className="p-3 bg-gray-50 rounded mt-2 max-h-40 overflow-y-auto">
                  <pre className="text-xs">{JSON.stringify(selectedCase.detection_details, null, 2)}</pre>
                </div>
              </div>

              <div>
                <Label>Action to Take</Label>
                <Select value={actionTaken} onValueChange={setActionTaken}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investigating">Under Investigation</SelectItem>
                    <SelectItem value="flagged">Flag Account</SelectItem>
                    <SelectItem value="suspended">Suspend Account</SelectItem>
                    <SelectItem value="cleared">Clear - False Positive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleUpdateCase} className="w-full">
                Update Case
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorFraudDetection;
