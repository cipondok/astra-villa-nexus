import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAlert } from "@/contexts/AlertContext";
import { Settings, Plus, Edit, Trash2, Play, BarChart3 } from "lucide-react";

interface AutomationRule {
  id: string;
  rule_name: string;
  trigger_conditions: any;
  actions: any;
  is_active: boolean;
  execution_count: number;
  created_at: string;
}

const CSAutomationRulesManager = () => {
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [ruleDialog, setRuleDialog] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: '',
    trigger_type: 'keyword',
    trigger_value: '',
    action_type: 'assign_agent',
    action_value: '',
    priority_condition: 'any'
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch automation rules
  const { data: rules, isLoading } = useQuery({
    queryKey: ['cs-automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cs_automation_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Create/Update rule mutation
  const saveRuleMutation = useMutation({
    mutationFn: async (ruleData: any) => {
      const triggers = {
        type: ruleData.trigger_type,
        value: ruleData.trigger_value,
        priority: ruleData.priority_condition
      };
      
      const actions = {
        type: ruleData.action_type,
        value: ruleData.action_value
      };

      const dataToSave = {
        rule_name: ruleData.rule_name,
        trigger_conditions: triggers,
        actions: actions,
        is_active: true
      };

      if (selectedRule) {
        const { error } = await supabase
          .from('cs_automation_rules')
          .update(dataToSave)
          .eq('id', selectedRule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cs_automation_rules')
          .insert([{ ...dataToSave, created_by: (await supabase.auth.getUser()).data.user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-automation-rules'] });
      showSuccess("Rule Saved", "Automation rule has been saved successfully.");
      setRuleDialog(false);
      resetForm();
    },
    onError: () => {
      showError("Save Failed", "Failed to save automation rule.");
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('cs_automation_rules')
        .delete()
        .eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-automation-rules'] });
      showSuccess("Rule Deleted", "Automation rule has been deleted successfully.");
    },
    onError: () => {
      showError("Delete Failed", "Failed to delete automation rule.");
    },
  });

  // Toggle rule status
  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('cs_automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-automation-rules'] });
      showSuccess("Rule Status Updated", "Automation rule status has been updated.");
    },
    onError: () => {
      showError("Update Failed", "Failed to update rule status.");
    },
  });

  const resetForm = () => {
    setFormData({
      rule_name: '',
      trigger_type: 'keyword',
      trigger_value: '',
      action_type: 'assign_agent',
      action_value: '',
      priority_condition: 'any'
    });
    setSelectedRule(null);
  };

  const handleEdit = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      trigger_type: rule.trigger_conditions?.type || 'keyword',
      trigger_value: rule.trigger_conditions?.value || '',
      action_type: rule.actions?.type || 'assign_agent',
      action_value: rule.actions?.value || '',
      priority_condition: rule.trigger_conditions?.priority || 'any'
    });
    setRuleDialog(true);
  };

  const handleSave = () => {
    if (!formData.rule_name || !formData.trigger_value) {
      showError("Validation Error", "Please fill in rule name and trigger value.");
      return;
    }
    saveRuleMutation.mutate(formData);
  };

  const getTriggerDisplay = (conditions: any) => {
    if (!conditions) return "N/A";
    const type = conditions.type || "unknown";
    const value = conditions.value || "";
    
    switch (type) {
      case 'keyword':
        return `Contains: "${value}"`;
      case 'priority':
        return `Priority: ${value}`;
      case 'category':
        return `Category: ${value}`;
      case 'time':
        return `Time-based: ${value}`;
      default:
        return type;
    }
  };

  const getActionDisplay = (actions: any) => {
    if (!actions) return "N/A";
    const type = actions.type || "unknown";
    const value = actions.value || "";
    
    switch (type) {
      case 'assign_agent':
        return `Assign to: ${value}`;
      case 'set_priority':
        return `Set priority: ${value}`;
      case 'send_email':
        return `Send email: ${value}`;
      case 'add_tag':
        return `Add tag: ${value}`;
      case 'escalate':
        return 'Escalate ticket';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Automation Rules Manager
            </CardTitle>
            <CardDescription>
              Set up automated ticket routing and response rules
            </CardDescription>
          </div>
          <Dialog open={ruleDialog} onOpenChange={setRuleDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedRule ? 'Edit Automation Rule' : 'Create New Automation Rule'}
                </DialogTitle>
                <DialogDescription>
                  Define triggers and actions for automated ticket handling
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Rule Name *</label>
                  <Input
                    value={formData.rule_name}
                    onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                    placeholder="Auto-assign billing tickets"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Trigger Type</label>
                    <Select value={formData.trigger_type} onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="keyword">Keyword Match</SelectItem>
                        <SelectItem value="priority">Priority Level</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="time">Time-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Trigger Value *</label>
                    <Input
                      value={formData.trigger_value}
                      onChange={(e) => setFormData({ ...formData, trigger_value: e.target.value })}
                      placeholder={
                        formData.trigger_type === 'keyword' ? 'billing, payment' :
                        formData.trigger_type === 'priority' ? 'high' :
                        formData.trigger_type === 'category' ? 'technical' : '30m'
                      }
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Priority Condition</label>
                  <Select value={formData.priority_condition} onValueChange={(value) => setFormData({ ...formData, priority_condition: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Priority</SelectItem>
                      <SelectItem value="high">High Priority Only</SelectItem>
                      <SelectItem value="medium">Medium Priority Only</SelectItem>
                      <SelectItem value="low">Low Priority Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Action Type</label>
                    <Select value={formData.action_type} onValueChange={(value) => setFormData({ ...formData, action_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assign_agent">Assign to Agent</SelectItem>
                        <SelectItem value="set_priority">Set Priority</SelectItem>
                        <SelectItem value="send_email">Send Email Template</SelectItem>
                        <SelectItem value="add_tag">Add Tag</SelectItem>
                        <SelectItem value="escalate">Escalate Ticket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Action Value</label>
                    <Input
                      value={formData.action_value}
                      onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                      placeholder={
                        formData.action_type === 'assign_agent' ? 'agent@example.com' :
                        formData.action_type === 'set_priority' ? 'high' :
                        formData.action_type === 'send_email' ? 'welcome_template' : 
                        formData.action_type === 'add_tag' ? 'auto-processed' : ''
                      }
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setRuleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saveRuleMutation.isPending}>
                    {saveRuleMutation.isPending ? 'Saving...' : 'Save Rule'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading automation rules...</div>
        ) : rules?.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No automation rules found. Create your first rule!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Executions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules?.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.rule_name}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm">
                      {getTriggerDisplay(rule.trigger_conditions)}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-sm">
                      {getActionDisplay(rule.actions)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => 
                          toggleRuleMutation.mutate({ ruleId: rule.id, isActive: checked })
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      {rule.execution_count}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(rule.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => showSuccess("Rule Tested", "Automation rule test completed successfully.")}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteRuleMutation.mutate(rule.id)}
                      >
                        <Trash2 className="h-3 w-3" />
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
  );
};

export default CSAutomationRulesManager;