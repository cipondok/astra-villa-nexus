import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/contexts/AlertContext";
import { Mail, Plus, Edit, Trash2, Copy, Eye } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  template_type: string;
  is_active: boolean;
  created_at: string;
}

const CSEmailTemplatesManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [formData, setFormData] = useState({
    template_name: '',
    subject: '',
    body_html: '',
    body_text: '',
    template_type: 'general'
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['cs-email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cs_email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Create/Update template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      if (selectedTemplate) {
        const { error } = await supabase
          .from('cs_email_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cs_email_templates')
          .insert([{ ...templateData, created_by: (await supabase.auth.getUser()).data.user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-email-templates'] });
      showSuccess("Template Saved", "Email template has been saved successfully.");
      setTemplateDialog(false);
      resetForm();
    },
    onError: () => {
      showError("Save Failed", "Failed to save email template.");
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('cs_email_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cs-email-templates'] });
      showSuccess("Template Deleted", "Email template has been deleted successfully.");
    },
    onError: () => {
      showError("Delete Failed", "Failed to delete email template.");
    },
  });

  const resetForm = () => {
    setFormData({
      template_name: '',
      subject: '',
      body_html: '',
      body_text: '',
      template_type: 'general'
    });
    setSelectedTemplate(null);
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      template_name: template.template_name,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text || '',
      template_type: template.template_type
    });
    setTemplateDialog(true);
  };

  const handleSave = () => {
    if (!formData.template_name || !formData.subject || !formData.body_html) {
      showError("Validation Error", "Please fill in all required fields.");
      return;
    }
    saveTemplateMutation.mutate(formData);
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'welcome': return 'bg-blue-100 text-blue-800';
      case 'follow_up': return 'bg-green-100 text-green-800';
      case 'resolution': return 'bg-purple-100 text-purple-800';
      case 'escalation': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Templates Manager
            </CardTitle>
            <CardDescription>
              Create and manage email templates for customer service responses
            </CardDescription>
          </div>
          <Dialog open={templateDialog} onOpenChange={setTemplateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemplate ? 'Edit Email Template' : 'Create New Email Template'}
                </DialogTitle>
                <DialogDescription>
                  Design email templates for consistent customer communication
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Template Name *</label>
                    <Input
                      value={formData.template_name}
                      onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                      placeholder="Welcome Email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Template Type</label>
                    <Select value={formData.template_type} onValueChange={(value) => setFormData({ ...formData, template_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="resolution">Resolution</SelectItem>
                        <SelectItem value="escalation">Escalation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject Line *</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Thank you for contacting us!"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Email Body (HTML) *</label>
                  <Textarea
                    value={formData.body_html}
                    onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                    placeholder="<p>Dear {{customer_name}},</p><p>Thank you for reaching out...</p>"
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use variables: {{customer_name}}, {{ticket_id}}, {{agent_name}}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Plain Text Version</label>
                  <Textarea
                    value={formData.body_text}
                    onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                    placeholder="Dear {{customer_name}}, Thank you for reaching out..."
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTemplateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saveTemplateMutation.isPending}>
                    {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading templates...</div>
        ) : templates?.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No email templates found. Create your first template!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates?.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.template_name}</TableCell>
                  <TableCell>
                    <Badge className={getTypeVariant(template.template_type)}>
                      {template.template_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(template.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setPreviewDialog(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(template.body_html)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTemplateMutation.mutate(template.id)}
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
        
        {/* Preview Dialog */}
        <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {selectedTemplate?.template_name}</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject:</label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedTemplate.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">HTML Preview:</label>
                  <div 
                    className="border rounded p-4 bg-white text-black min-h-[200px]"
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.body_html.replace(/{{.*?}}/g, '[VARIABLE]') }}
                  />
                </div>
                {selectedTemplate.body_text && (
                  <div>
                    <label className="text-sm font-medium">Plain Text:</label>
                    <pre className="text-sm bg-muted p-2 rounded whitespace-pre-wrap">
                      {selectedTemplate.body_text}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CSEmailTemplatesManager;