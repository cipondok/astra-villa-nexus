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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Edit, Plus, Save, X, Key } from "lucide-react";

interface ApiSetting {
  id: string;
  api_name: string;
  api_key: string | null;
  api_endpoint: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const APISettingsManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showApiForm, setShowApiForm] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiSetting | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiData, setApiData] = useState({
    api_name: "",
    api_key: "",
    api_endpoint: "",
    description: "",
    is_active: true,
  });

  // Fetch API settings
  const { data: apiSettings, isLoading } = useQuery({
    queryKey: ["api-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_settings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ApiSetting[];
    },
  });

  // Create API setting mutation
  const createApiMutation = useMutation({
    mutationFn: async (newApi: typeof apiData) => {
      const { data, error } = await supabase
        .from("api_settings")
        .insert([newApi])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-settings"] });
      toast({
        title: "API Setting Created",
        description: "The API configuration has been created successfully.",
      });
      resetApiForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API setting",
        variant: "destructive",
      });
    },
  });

  // Update API setting mutation
  const updateApiMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<typeof apiData> }) => {
      const { data, error } = await supabase
        .from("api_settings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-settings"] });
      toast({
        title: "API Setting Updated",
        description: "The API configuration has been updated successfully.",
      });
      resetApiForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update API setting",
        variant: "destructive",
      });
    },
  });

  // Delete API setting mutation
  const deleteApiMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("api_settings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-settings"] });
      toast({
        title: "API Setting Deleted",
        description: "The API configuration has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete API setting",
        variant: "destructive",
      });
    },
  });

  const resetApiForm = () => {
    setApiData({
      api_name: "",
      api_key: "",
      api_endpoint: "",
      description: "",
      is_active: true,
    });
    setEditingApi(null);
    setShowApiForm(false);
  };

  const handleApiSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingApi) {
      updateApiMutation.mutate({
        id: editingApi.id,
        updates: apiData,
      });
    } else {
      createApiMutation.mutate(apiData);
    }
  };

  const handleEditApi = (api: ApiSetting) => {
    setEditingApi(api);
    setApiData({
      api_name: api.api_name,
      api_key: api.api_key || "",
      api_endpoint: api.api_endpoint || "",
      description: api.description || "",
      is_active: api.is_active,
    });
    setShowApiForm(true);
  };

  const toggleKeyVisibility = (apiId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [apiId]: !prev[apiId]
    }));
  };

  const maskApiKey = (key: string | null) => {
    if (!key) return "Not set";
    if (key.length <= 8) return key;
    return key.substring(0, 4) + "•".repeat(Math.max(0, key.length - 8)) + key.substring(key.length - 4);
  };

  const getStatusBadge = (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Settings Management</CardTitle>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Settings Management
              </CardTitle>
              <CardDescription>
                Configure and manage API keys for external services
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowApiForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add API Setting
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!apiSettings || apiSettings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API settings configured yet. Add your first API configuration.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiSettings.map((api) => (
                  <TableRow key={api.id}>
                    <TableCell className="font-medium">{api.api_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {showKeys[api.id] ? api.api_key || "Not set" : maskApiKey(api.api_key)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(api.id)}
                          className="h-6 w-6 p-0"
                        >
                          {showKeys[api.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {api.api_endpoint || "Not set"}
                    </TableCell>
                    <TableCell>{getStatusBadge(api.is_active)}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {api.description || "No description"}
                    </TableCell>
                    <TableCell>
                      {new Date(api.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditApi(api)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteApiMutation.mutate(api.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* API Form Dialog */}
      <Dialog open={showApiForm} onOpenChange={setShowApiForm}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleApiSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingApi ? "Edit API Setting" : "Add New API Setting"}
              </DialogTitle>
              <DialogDescription>
                Configure API settings for external service integration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api_name">API Name</Label>
                <Input
                  id="api_name"
                  value={apiData.api_name}
                  onChange={(e) =>
                    setApiData({ ...apiData, api_name: e.target.value })
                  }
                  placeholder="e.g., OPENAI_API_KEY"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={apiData.api_key}
                  onChange={(e) =>
                    setApiData({ ...apiData, api_key: e.target.value })
                  }
                  placeholder="Enter API key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_endpoint">API Endpoint (Optional)</Label>
                <Input
                  id="api_endpoint"
                  value={apiData.api_endpoint}
                  onChange={(e) =>
                    setApiData({ ...apiData, api_endpoint: e.target.value })
                  }
                  placeholder="https://api.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={apiData.description}
                  onChange={(e) =>
                    setApiData({ ...apiData, description: e.target.value })
                  }
                  placeholder="Describe what this API is used for"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={apiData.is_active}
                  onCheckedChange={(checked) =>
                    setApiData({ ...apiData, is_active: checked })
                  }
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetApiForm}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createApiMutation.isPending || updateApiMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingApi ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APISettingsManagement;