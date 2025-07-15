import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Save, TestTube, CheckCircle, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BPJSApiSetting {
  id: string;
  api_name: string;
  api_key: string | null;
  api_endpoint: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BPJSAPISettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testingApi, setTestingApi] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Predefined BPJS API configurations
  const bpjsApis = [
    {
      key: "BPJS_KESEHATAN_API",
      name: "BPJS Kesehatan API",
      description: "API for BPJS Kesehatan verification and member status checking",
      defaultEndpoint: "https://api.bpjs-kesehatan.go.id/vclaim-rest/",
      type: "kesehatan"
    },
    {
      key: "BPJS_KETENAGAKERJAAN_API", 
      name: "BPJS Ketenagakerjaan API",
      description: "API for BPJS Ketenagakerjaan (employment) verification",
      defaultEndpoint: "https://api.bpjsketenagakerjaan.go.id/",
      type: "ketenagakerjaan"
    }
  ];

  // Fetch BPJS API settings
  const { data: apiSettings, isLoading } = useQuery({
    queryKey: ["bpjs-api-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_settings")
        .select("*")
        .in("api_name", bpjsApis.map(api => api.key))
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BPJSApiSetting[];
    },
  });

  // Create/Update API setting mutation
  const saveApiMutation = useMutation({
    mutationFn: async ({ apiName, apiKey, endpoint, isActive }: { 
      apiName: string; 
      apiKey: string; 
      endpoint: string; 
      isActive: boolean; 
    }) => {
      const existingSetting = apiSettings?.find(setting => setting.api_name === apiName);
      const apiConfig = bpjsApis.find(api => api.key === apiName);
      
      if (existingSetting) {
        // Update existing
        const { data, error } = await supabase
          .from("api_settings")
          .update({
            api_key: apiKey,
            api_endpoint: endpoint,
            is_active: isActive,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingSetting.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("api_settings")
          .insert([{
            api_name: apiName,
            api_key: apiKey,
            api_endpoint: endpoint,
            description: apiConfig?.description || "",
            is_active: isActive
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bpjs-api-settings"] });
      toast({
        title: "BPJS API Setting Saved",
        description: "The BPJS API configuration has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save BPJS API setting",
        variant: "destructive",
      });
    },
  });

  // Test API connection
  const testApiConnection = async (apiType: string) => {
    setTestingApi(apiType);
    try {
      const { data, error } = await supabase.functions.invoke('verify-bpjs', {
        body: {
          vendorId: 'test-vendor-id',
          bpjsType: apiType === 'BPJS_KESEHATAN_API' ? 'kesehatan' : 'ketenagakerjaan',
          bpjsNumber: '0001234567890' // Test number
        }
      });

      if (error) throw error;

      setTestResults(prev => ({
        ...prev,
        [apiType]: { success: true, message: 'Connection successful', data }
      }));

      toast({
        title: "API Test Successful",
        description: `${apiType} connection is working properly.`,
      });
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [apiType]: { success: false, message: error.message || 'Connection failed' }
      }));

      toast({
        title: "API Test Failed",
        description: error.message || `Failed to connect to ${apiType}`,
        variant: "destructive",
      });
    } finally {
      setTestingApi(null);
    }
  };

  const toggleKeyVisibility = (apiId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [apiId]: !prev[apiId]
    }));
  };

  const maskApiKey = (key: string | null) => {
    if (!key) return "Not configured";
    if (key.length <= 8) return key;
    return key.substring(0, 4) + "•".repeat(Math.max(0, key.length - 8)) + key.substring(key.length - 4);
  };

  const getApiSetting = (apiKey: string) => {
    return apiSettings?.find(setting => setting.api_name === apiKey);
  };

  const BPJSApiCard = ({ apiConfig }: { apiConfig: typeof bpjsApis[0] }) => {
    const [formData, setFormData] = useState(() => {
      const existing = getApiSetting(apiConfig.key);
      return {
        apiKey: existing?.api_key || "",
        endpoint: existing?.api_endpoint || apiConfig.defaultEndpoint,
        isActive: existing?.is_active ?? false
      };
    });

    const existing = getApiSetting(apiConfig.key);
    const testResult = testResults[apiConfig.key];

    return (
      <Card key={apiConfig.key}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {apiConfig.name}
              </CardTitle>
              <CardDescription>{apiConfig.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {existing?.is_active && (
                <Badge variant="default" className="bg-green-600">
                  Active
                </Badge>
              )}
              {testResult && (
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {testResult.success ? "Connected" : "Failed"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`endpoint-${apiConfig.key}`}>API Endpoint</Label>
            <Input
              id={`endpoint-${apiConfig.key}`}
              value={formData.endpoint}
              onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder={apiConfig.defaultEndpoint}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`key-${apiConfig.key}`}>API Key</Label>
            <div className="flex items-center gap-2">
              <Input
                id={`key-${apiConfig.key}`}
                type={showKeys[apiConfig.key] ? "text" : "password"}
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your BPJS API key"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toggleKeyVisibility(apiConfig.key)}
                className="px-3"
              >
                {showKeys[apiConfig.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {existing?.api_key && (
              <p className="text-xs text-muted-foreground">
                Current: {maskApiKey(existing.api_key)}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`active-${apiConfig.key}`}
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor={`active-${apiConfig.key}`}>Enable API</Label>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button
              onClick={() => saveApiMutation.mutate({
                apiName: apiConfig.key,
                apiKey: formData.apiKey,
                endpoint: formData.endpoint,
                isActive: formData.isActive
              })}
              disabled={saveApiMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
            
            {existing?.api_key && formData.isActive && (
              <Button
                variant="outline"
                onClick={() => testApiConnection(apiConfig.key)}
                disabled={testingApi === apiConfig.key}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                {testingApi === apiConfig.key ? "Testing..." : "Test Connection"}
              </Button>
            )}
          </div>

          {testResult && (
            <div className={`p-3 rounded-md text-sm ${
              testResult.success 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              <p className="font-medium">
                {testResult.success ? "✅ Test Successful" : "❌ Test Failed"}
              </p>
              <p className="mt-1">{testResult.message}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>BPJS API Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            BPJS API Settings
          </CardTitle>
          <CardDescription>
            Configure your BPJS Kesehatan and Ketenagakerjaan API credentials for real vendor verification
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {bpjsApis.map((apiConfig) => (
          <BPJSApiCard key={apiConfig.key} apiConfig={apiConfig} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">BPJS Kesehatan API:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
              <li>Obtain API credentials from BPJS Kesehatan official portal</li>
              <li>Register your application and get the API key</li>
              <li>Used for health insurance verification</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">BPJS Ketenagakerjaan API:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4 list-disc">
              <li>Obtain API credentials from BPJS Ketenagakerjaan portal</li>
              <li>Register your company for API access</li>
              <li>Used for employment insurance verification</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These APIs are currently in simulation mode for development. 
              Configure your real API keys here for production use. Test connections will validate 
              your credentials against the actual BPJS systems.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BPJSAPISettings;