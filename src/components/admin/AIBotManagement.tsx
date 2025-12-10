
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Bot, Plus, Edit, Trash2, Settings, BarChart3 } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const AIBotManagement = () => {
  const [showBotForm, setShowBotForm] = useState(false);
  const [editingBot, setEditingBot] = useState<any>(null);
  const [botData, setBotData] = useState({
    bot_name: '',
    model_type: 'google/gemini-2.5-flash',
    is_active: true,
    configuration: { temperature: 0.7, max_tokens: 1000, system_prompt: '' }
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: aiBots, isLoading } = useQuery({
    queryKey: ['ai-bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_bot_settings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createBotMutation = useMutation({
    mutationFn: async (botData: any) => {
      const { error } = await supabase
        .from('ai_bot_settings')
        .insert([botData]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Bot Created", "AI bot has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      setShowBotForm(false);
      resetBotForm();
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  const updateBotMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('ai_bot_settings')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Bot Updated", "AI bot has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
      setShowBotForm(false);
      setEditingBot(null);
      resetBotForm();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_bot_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Bot Deleted", "AI bot has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['ai-bots'] });
    },
    onError: (error: any) => {
      showError("Deletion Failed", error.message);
    },
  });

  const resetBotForm = () => {
    setBotData({
      bot_name: '',
      model_type: 'google/gemini-2.5-flash',
      is_active: true,
      configuration: { temperature: 0.7, max_tokens: 1000, system_prompt: '' }
    });
  };

  const handleBotSubmit = () => {
    if (editingBot) {
      updateBotMutation.mutate({ id: editingBot.id, updates: botData });
    } else {
      createBotMutation.mutate(botData);
    }
  };

  const handleEditBot = (bot: any) => {
    setEditingBot(bot);
    const config = bot.configuration || {};
    setBotData({
      bot_name: bot.bot_name,
      model_type: bot.model_type,
      is_active: bot.is_active,
      configuration: {
        temperature: config.temperature ?? 0.7,
        max_tokens: config.max_tokens ?? 1000,
        system_prompt: config.system_prompt ?? ''
      }
    });
    setShowBotForm(true);
  };

  const handleDeleteBot = (id: string) => {
    if (confirm('Are you sure you want to delete this AI bot?')) {
      deleteBotMutation.mutate(id);
    }
  };

  const toggleBotStatus = (id: string, currentStatus: boolean) => {
    updateBotMutation.mutate({ 
      id, 
      updates: { is_active: !currentStatus, updated_at: new Date().toISOString() }
    });
  };

  // Helper function to safely get usage stats
  const getUsageStats = (usageStats: any) => {
    if (!usageStats || typeof usageStats !== 'object') return { total_requests: 0 };
    return usageStats as { total_requests?: number };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Bot Management
              </CardTitle>
              <CardDescription>
                Configure and manage AI chatbots and automation
              </CardDescription>
            </div>
            <Dialog open={showBotForm} onOpenChange={setShowBotForm}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetBotForm(); setEditingBot(null); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bot
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingBot ? 'Edit AI Bot' : 'Create New AI Bot'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBot ? 'Update the bot configuration.' : 'Set up a new AI bot.'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bot_name">Bot Name</Label>
                    <Input
                      id="bot_name"
                      value={botData.bot_name}
                      onChange={(e) => setBotData({ ...botData, bot_name: e.target.value })}
                      placeholder="Customer Support Bot"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="model_type">Model Type</Label>
                    <Select value={botData.model_type} onValueChange={(value) => setBotData({ ...botData, model_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash (Default)</SelectItem>
                        <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                        <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                        <SelectItem value="google/gemini-3-pro-preview">Gemini 3 Pro Preview</SelectItem>
                        <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                        <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
                        <SelectItem value="openai/gpt-5-nano">GPT-5 Nano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={botData.is_active}
                      onCheckedChange={(checked) => setBotData({ ...botData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="configuration">Configuration (JSON)</Label>
                    <Textarea
                      id="configuration"
                      value={JSON.stringify(botData.configuration, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          setBotData({ ...botData, configuration: parsed });
                        } catch (error) {
                          // Invalid JSON, keep the text as is
                        }
                      }}
                      placeholder='{"temperature": 0.7, "max_tokens": 1000, "system_prompt": "You are a helpful assistant..."}'
                      rows={8}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowBotForm(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleBotSubmit}
                    disabled={createBotMutation.isPending || updateBotMutation.isPending}
                  >
                    {editingBot ? 'Update' : 'Create'} Bot
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bot Name</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage Stats</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading AI bots...
                    </TableCell>
                  </TableRow>
                ) : aiBots?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No AI bots found
                    </TableCell>
                  </TableRow>
                ) : (
                  aiBots?.map((bot) => {
                    const stats = getUsageStats(bot.usage_stats);
                    return (
                      <TableRow key={bot.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{bot.bot_name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{bot.model_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={bot.is_active}
                              onCheckedChange={() => toggleBotStatus(bot.id, bot.is_active)}
                            />
                            <Badge variant={bot.is_active ? 'default' : 'secondary'}>
                              {bot.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            <span className="text-sm">
                              {stats.total_requests || 0} requests
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(bot.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditBot(bot)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDeleteBot(bot.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIBotManagement;
