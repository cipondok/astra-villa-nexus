import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, Save, TestTube, CheckCircle, XCircle } from "lucide-react";

interface MaskedApiSetting {
  id: string;
  api_name: string;
  api_key_masked: string | null;
  api_endpoint: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BPJSAPISettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testingApi, setTestingApi] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

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

  // Fetch BPJS API settings using secure RPC function (returns masked keys)
  const { data: apiSettings, isLoading } = useQuery({
    queryKey: ["bpjs-api-settings-masked"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_masked_api_settings");

      if (error) throw error;
      
      // Filter to only BPJS-related settings
      const bpjsKeys = bpjsApis.map(api => api.key);
      return (data as MaskedApiSetting[]).filter(
        setting => bpjsKeys.includes(setting.api_name)
      );
    },
  });

  // Create/Update API setting mutation using secure RPC function
  const saveApiMutation = useMutation({
    mutationFn: async ({ apiName, apiKey, endpoint, isActive }: { 
      apiName: string; 
      apiKey: string; 
      endpoint: string; 
      isActive: boolean; 
    }) => {
      const apiConfig = bpjsApis.find(api => api.key === apiName);
      
      // Use secure RPC function for inserting/updating API settings
      const { data, error } = await supabase.rpc("insert_api_setting_secure", {
        p_api_name: apiName,
        p_api_key: apiKey,
        p_api_endpoint: endpoint,
        p_description: apiConfig?.description || "",
        p_is_active: isActive
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bpjs-api-settings-masked"] });
      toast({
        title: "BPJS API Setting Saved",
        description: "The BPJS API configuration has been saved securely.",
      });
    },
    onError: (error: Error) => {
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
          vendorId: '00000000-0000-0000-0000-000000000000', // Test UUID
          bpjsType: apiType === 'BPJS_KESEHATAN_API' ? 'kesehatan' : 'ketenagakerjaan',
          bpjsNumber: '0001234567890' // Test number
        }
      });

      if (error) throw error;

      setTestResults(prev => ({
        ...prev,
        [apiType]: { success: true, message: 'Connection successful' }
      }));

      toast({
        title: "API Test Successful",
        description: `${apiType} connection is working properly.`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setTestResults(prev => ({
        ...prev,
        [apiType]: { success: false, message: errorMessage }
      }));

      toast({
        title: "API Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTestingApi(null);
    }
  };

  const getApiSetting = (apiKey: string) => {
    return apiSettings?.find(setting => setting.api_name === apiKey);
  };

  const BPJSApiCard = ({ apiConfig }: { apiConfig: typeof bpjsApis[0] }) => {
    const existing = getApiSetting(apiConfig.key);
    const [formData, setFormData] = useState({
      apiKey: "", // Always empty - user must enter new key each time for security
      endpoint: existing?.api_endpoint || apiConfig.defaultEndpoint,
      isActive: existing?.is_active ?? false
    });

    // Update form when existing data loads
    useEffect(() => {
      if (existing) {
        setFormData(prev => ({
          ...prev,
          endpoint: existing.api_endpoint || apiConfig.defaultEndpoint,
          isActive: existing.is_active
        }));
      }
    }, [existing, apiConfig.defaultEndpoint]);

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
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter new API key to update"
                className="flex-1"
              />
            </div>
            {existing?.api_key_masked && (
              <p className="text-xs text-muted-foreground">
                Current: {existing.api_key_masked}
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
              disabled={saveApiMutation.isPending || !formData.apiKey}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </Button>
            
            {existing?.api_key_masked && formData.isActive && (
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
              <strong>Security Note:</strong> API keys are stored encrypted and never exposed to the client. 
              Only masked versions are displayed for reference.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BPJSAPISettings;
