import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Code, 
  Zap, 
  Database, 
  Settings, 
  FileText, 
  Users, 
  CreditCard,
  Shield,
  BarChart3,
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Eye,
  Trash2,
  Play,
  Copy
} from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FunctionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  complexity: 'simple' | 'medium' | 'complex';
  requirements: string[];
  example: string;
}

const VendorFunctionGenerator = () => {
  const [selectedFunction, setSelectedFunction] = useState<FunctionTemplate | null>(null);
  const [customFunctionName, setCustomFunctionName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("templates");
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch generated functions
  const { data: generatedFunctions, isLoading: functionsLoading } = useQuery({
    queryKey: ['generated-functions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_functions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Generate function mutation
  const generateFunctionMutation = useMutation({
    mutationFn: async ({ functionTemplate, customName, customDescription }: {
      functionTemplate?: FunctionTemplate;
      customName?: string;
      customDescription?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('vendor-function-generator', {
        body: {
          functionTemplate,
          customName,
          customDescription,
          userId: user?.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      showSuccess("Function Generated!", data.message);
      queryClient.invalidateQueries({ queryKey: ['generated-functions'] });
      if (activeTab === "custom") {
        setCustomFunctionName("");
        setCustomDescription("");
      }
    },
    onError: (error: any) => {
      showError("Generation Failed", error.message || "Failed to generate function");
    }
  });

  // Delete function mutation
  const deleteFunctionMutation = useMutation({
    mutationFn: async (functionId: string) => {
      const { error } = await supabase
        .from('generated_functions')
        .delete()
        .eq('id', functionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Function Deleted", "Function has been successfully removed");
      queryClient.invalidateQueries({ queryKey: ['generated-functions'] });
    },
    onError: () => {
      showError("Delete Failed", "Failed to delete function");
    }
  });

  const functionTemplates: FunctionTemplate[] = [
    {
      id: 'automated-scoring',
      name: 'Automated Vendor Scoring',
      description: 'AI-powered vendor performance scoring based on multiple metrics',
      category: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      complexity: 'complex',
      requirements: ['AI Integration', 'Performance Data', 'Scoring Algorithm'],
      example: 'Automatically calculate vendor reliability scores based on completion rates, customer feedback, and response times'
    },
    {
      id: 'smart-matching',
      name: 'Smart Vendor-Job Matching',
      description: 'Intelligent matching system between vendors and service requests',
      category: 'Automation',
      icon: <Zap className="h-5 w-5" />,
      complexity: 'complex',
      requirements: ['Machine Learning', 'Job Database', 'Vendor Profiles'],
      example: 'Match plumbing jobs with the best available plumbers based on location, skills, and availability'
    },
    {
      id: 'fraud-detection',
      name: 'Fraud Detection System',
      description: 'Advanced fraud detection for vendor applications and activities',
      category: 'Security',
      icon: <Shield className="h-5 w-5" />,
      complexity: 'complex',
      requirements: ['Pattern Recognition', 'Risk Assessment', 'Alert System'],
      example: 'Detect suspicious patterns in vendor registrations or service bookings'
    },
    {
      id: 'payment-automation',
      name: 'Automated Payment Processing',
      description: 'Streamlined payment processing with multiple gateway support',
      category: 'Payment',
      icon: <CreditCard className="h-5 w-5" />,
      complexity: 'medium',
      requirements: ['Payment Gateway API', 'Vendor Bank Details', 'Transaction Logs'],
      example: 'Automatically process vendor payouts based on completed jobs and commission calculations'
    },
    {
      id: 'notification-system',
      name: 'Multi-Channel Notifications',
      description: 'Comprehensive notification system (email, SMS, push, in-app)',
      category: 'Communication',
      icon: <Bell className="h-5 w-5" />,
      complexity: 'medium',
      requirements: ['Email Service', 'SMS Gateway', 'Push Notifications'],
      example: 'Send booking confirmations, payment notifications, and system alerts across multiple channels'
    },
    {
      id: 'review-management',
      name: 'Review & Rating System',
      description: 'Customer review and vendor rating management system',
      category: 'Quality Control',
      icon: <Star className="h-5 w-5" />,
      complexity: 'medium',
      requirements: ['Review Database', 'Rating Algorithm', 'Moderation Tools'],
      example: 'Collect and manage customer reviews, calculate vendor ratings, and moderate content'
    },
    {
      id: 'scheduling-system',
      name: 'Advanced Scheduling',
      description: 'Smart scheduling system with calendar integration',
      category: 'Operations',
      icon: <Calendar className="h-5 w-5" />,
      complexity: 'medium',
      requirements: ['Calendar API', 'Availability Management', 'Booking System'],
      example: 'Manage vendor availability, schedule appointments, and handle reschedules automatically'
    },
    {
      id: 'location-tracking',
      name: 'Real-time Location Tracking',
      description: 'GPS tracking for service providers and delivery tracking',
      category: 'Logistics',
      icon: <MapPin className="h-5 w-5" />,
      complexity: 'complex',
      requirements: ['GPS Integration', 'Real-time Updates', 'Privacy Controls'],
      example: 'Track vendor location during service delivery and provide real-time updates to customers'
    },
    {
      id: 'document-processing',
      name: 'AI Document Processing',
      description: 'Automated document verification and data extraction',
      category: 'Automation',
      icon: <FileText className="h-5 w-5" />,
      complexity: 'complex',
      requirements: ['OCR Technology', 'AI Processing', 'Document Validation'],
      example: 'Automatically extract and verify information from uploaded business licenses and certifications'
    },
    {
      id: 'chat-support',
      name: 'Integrated Chat System',
      description: 'Real-time messaging between vendors, customers, and support',
      category: 'Communication',
      icon: <MessageSquare className="h-5 w-5" />,
      complexity: 'medium',
      requirements: ['Real-time Database', 'WebSocket Connection', 'File Sharing'],
      example: 'Enable real-time communication with file sharing and message history'
    },
    {
      id: 'performance-analytics',
      name: 'Advanced Performance Analytics',
      description: 'Comprehensive analytics dashboard with predictive insights',
      category: 'Analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      complexity: 'complex',
      requirements: ['Data Warehouse', 'Analytics Engine', 'Visualization Tools'],
      example: 'Generate detailed performance reports with trends, forecasts, and actionable insights'
    },
    {
      id: 'compliance-checker',
      name: 'Automated Compliance Checker',
      description: 'Continuous compliance monitoring and reporting',
      category: 'Compliance',
      icon: <CheckCircle className="h-5 w-5" />,
      complexity: 'medium',
      requirements: ['Regulatory Database', 'Monitoring System', 'Alert System'],
      example: 'Monitor vendor compliance with local regulations and automatically flag non-compliance issues'
    }
  ];

  const getComplexityBadge = (complexity: string) => {
    const variants = {
      simple: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800", 
      complex: "bg-red-100 text-red-800"
    };
    return <Badge className={variants[complexity as keyof typeof variants]}>{complexity.toUpperCase()}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Analytics': 'text-blue-600',
      'Automation': 'text-purple-600',
      'Security': 'text-red-600',
      'Payment': 'text-green-600',
      'Communication': 'text-orange-600',
      'Quality Control': 'text-pink-600',
      'Operations': 'text-indigo-600',
      'Logistics': 'text-teal-600',
      'Compliance': 'text-cyan-600'
    };
    return colors[category] || 'text-gray-600';
  };

  const generateFunction = async (functionTemplate: FunctionTemplate) => {
    generateFunctionMutation.mutate({ functionTemplate });
  };

  const generateCustomFunction = async () => {
    if (!customFunctionName || !customDescription) {
      showError("Missing Information", "Please provide both function name and description.");
      return;
    }

    generateFunctionMutation.mutate({ 
      customName: customFunctionName, 
      customDescription: customDescription 
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess("Copied!", "Code copied to clipboard");
  };

  const getStatusBadge = (isDeployed: boolean) => {
    return (
      <Badge variant={isDeployed ? "default" : "secondary"}>
        {isDeployed ? "Deployed" : "Generated"}
      </Badge>
    );
  };

  const categories = [...new Set(functionTemplates.map(f => f.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-500" />
            Vendor Function Generator
          </h3>
          <p className="text-sm text-muted-foreground">
            Create and integrate new functions into the vendor management system
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          12 Ready Templates
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">Function Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Function</TabsTrigger>
          <TabsTrigger value="generated">Generated Functions ({generatedFunctions?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Function Templates</CardTitle>
              <CardDescription>
                Pre-built functions that can be instantly integrated into your vendor system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {categories.map((category) => (
                  <div key={category} className="space-y-3">
                    <h4 className={`font-semibold text-sm ${getCategoryColor(category)}`}>
                      {category} Functions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {functionTemplates
                        .filter(f => f.category === category)
                        .map((func) => (
                          <Card key={func.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                  {func.icon}
                                </div>
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium text-sm">{func.name}</h5>
                                    {getComplexityBadge(func.complexity)}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{func.description}</p>
                                  <p className="text-xs text-blue-600 italic">{func.example}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {func.requirements.slice(0, 2).map((req, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs px-1 py-0">
                                        {req}
                                      </Badge>
                                    ))}
                                    {func.requirements.length > 2 && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        +{func.requirements.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                  <Button 
                                    size="sm" 
                                    className="w-full mt-2"
                                    onClick={() => generateFunction(func)}
                                    disabled={generateFunctionMutation.isPending}
                                  >
                                    {isGenerating ? 'Generating...' : 'Generate Function'}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Function</CardTitle>
              <CardDescription>
                Describe your custom function and we'll generate it for your vendor system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="function-name">Function Name</Label>
                <Input
                  id="function-name"
                  value={customFunctionName}
                  onChange={(e) => setCustomFunctionName(e.target.value)}
                  placeholder="e.g. Vendor Performance Tracker"
                />
              </div>

              <div>
                <Label htmlFor="function-description">Function Description</Label>
                <Textarea
                  id="function-description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe what this function should do, its purpose, and any specific requirements..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={generateCustomFunction}
                disabled={generateFunctionMutation.isPending || !customFunctionName || !customDescription}
                className="w-full"
              >
                {generateFunctionMutation.isPending ? 'Generating Custom Function...' : 'Generate Custom Function'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Functions Registry</CardTitle>
              <CardDescription>
                Manage and monitor your generated vendor management functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {functionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading functions...</p>
                </div>
              ) : generatedFunctions && generatedFunctions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Function Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedFunctions.map((func: any) => (
                      <TableRow key={func.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{func.function_name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-48">
                              {func.function_description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {func.function_type === 'template' ? 'Template' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getCategoryColor(func.function_category || 'Custom')}>
                            {func.function_category || 'Custom'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(func.is_deployed)}
                        </TableCell>
                        <TableCell>
                          {new Date(func.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{func.function_name}</DialogTitle>
                                  <DialogDescription>
                                    Generated code for {func.function_name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline">{func.function_type}</Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => copyToClipboard(func.generated_code)}
                                    >
                                      <Copy className="h-4 w-4 mr-1" />
                                      Copy Code
                                    </Button>
                                  </div>
                                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                                    <code>{func.generated_code}</code>
                                  </pre>
                                  {func.deployment_url && (
                                    <div className="flex items-center gap-2">
                                      <ExternalLink className="h-4 w-4" />
                                      <a 
                                        href={func.deployment_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-sm"
                                      >
                                        {func.deployment_url}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {func.deployment_url && (
                              <Button size="sm" variant="outline">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => deleteFunctionMutation.mutate(func.id)}
                              disabled={deleteFunctionMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Functions Generated Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate your first function using the templates or create a custom one
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setActiveTab("templates")} variant="outline">
                      Browse Templates
                    </Button>
                    <Button onClick={() => setActiveTab("custom")}>
                      Create Custom Function
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorFunctionGenerator;