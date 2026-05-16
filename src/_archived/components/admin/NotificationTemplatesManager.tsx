import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Bell, Plus, Edit2, Trash2, Eye, Send, Copy, Search } from "lucide-react";

interface NotificationTemplate {
  id: string;
  name: string;
  channel: "email" | "push" | "sms" | "in-app";
  subject: string;
  body: string;
  variables: string[];
  is_active: boolean;
  category: string;
  last_sent?: string;
  send_count: number;
}

const defaultTemplates: NotificationTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    channel: "email",
    subject: "Welcome to Astra Villa Realty, {{user_name}}!",
    body: "Hi {{user_name}},\n\nThank you for joining Astra Villa Realty. Start exploring premium properties in Bali today.\n\nBest regards,\nAstra Villa Team",
    variables: ["user_name", "user_email"],
    is_active: true,
    category: "onboarding",
    send_count: 0,
  },
  {
    id: "inquiry-received",
    name: "Inquiry Confirmation",
    channel: "email",
    subject: "Your inquiry for {{property_title}} has been received",
    body: "Hi {{user_name}},\n\nWe've received your inquiry for {{property_title}} in {{property_location}}. Our agent will contact you within 24 hours.\n\nProperty Price: {{property_price}}\n\nThank you!",
    variables: ["user_name", "property_title", "property_location", "property_price"],
    is_active: true,
    category: "inquiry",
    send_count: 0,
  },
  {
    id: "kyc-approved",
    name: "KYC Approved",
    channel: "email",
    subject: "Your identity verification is approved!",
    body: "Hi {{user_name}},\n\nCongratulations! Your KYC verification has been approved. You now have full access to all platform features.\n\nVerification Level: {{verification_level}}",
    variables: ["user_name", "verification_level"],
    is_active: true,
    category: "verification",
    send_count: 0,
  },
  {
    id: "price-drop",
    name: "Price Drop Alert",
    channel: "push",
    subject: "Price dropped on {{property_title}}!",
    body: "Great news! {{property_title}} just dropped from {{old_price}} to {{new_price}}. Don't miss this deal!",
    variables: ["property_title", "old_price", "new_price"],
    is_active: true,
    category: "marketing",
    send_count: 0,
  },
  {
    id: "booking-confirmed",
    name: "Booking Confirmed",
    channel: "email",
    subject: "Booking confirmed for {{property_title}}",
    body: "Hi {{user_name}},\n\nYour viewing appointment is confirmed.\n\nProperty: {{property_title}}\nDate: {{booking_date}}\nTime: {{booking_time}}\nAgent: {{agent_name}}\n\nSee you there!",
    variables: ["user_name", "property_title", "booking_date", "booking_time", "agent_name"],
    is_active: true,
    category: "booking",
    send_count: 0,
  },
  {
    id: "payment-receipt",
    name: "Payment Receipt",
    channel: "email",
    subject: "Payment receipt #{{transaction_id}}",
    body: "Hi {{user_name}},\n\nYour payment of {{amount}} has been processed.\n\nTransaction ID: {{transaction_id}}\nDate: {{payment_date}}\nMethod: {{payment_method}}\n\nThank you!",
    variables: ["user_name", "amount", "transaction_id", "payment_date", "payment_method"],
    is_active: true,
    category: "payment",
    send_count: 0,
  },
];

const channelIcons = {
  email: Mail,
  push: Bell,
  sms: Send,
  "in-app": Bell,
};

const channelColors = {
  email: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  push: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  sms: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "in-app": "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

const NotificationTemplatesManager = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>(defaultTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<NotificationTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const filtered = templates.filter((t) => {
    const matchSearch =
      !searchTerm ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchChannel = channelFilter === "all" || t.channel === channelFilter;
    return matchSearch && matchChannel;
  });

  const handleSave = (template: NotificationTemplate) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === template.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = template;
        return next;
      }
      return [...prev, template];
    });
    setEditingTemplate(null);
    setShowEditor(false);
    toast.success("Template saved");
  };

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    toast.success("Template deleted");
  };

  const handleDuplicate = (template: NotificationTemplate) => {
    const dup = { ...template, id: `${template.id}-copy-${Date.now()}`, name: `${template.name} (Copy)` };
    setTemplates((prev) => [...prev, dup]);
    toast.success("Template duplicated");
  };

  const handleToggle = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_active: !t.is_active } : t))
    );
  };

  const renderPreview = (template: NotificationTemplate) => {
    const sampleData: Record<string, string> = {
      user_name: "John Doe",
      user_email: "john@example.com",
      property_title: "Luxury Villa Seminyak",
      property_location: "Seminyak, Bali",
      property_price: "Rp 8.500.000.000",
      old_price: "Rp 9.000.000.000",
      new_price: "Rp 8.500.000.000",
      booking_date: "March 15, 2026",
      booking_time: "10:00 AM",
      agent_name: "Sarah Williams",
      verification_level: "Level 3 - Verified",
      amount: "Rp 2.500.000",
      transaction_id: "TXN-2026-0315",
      payment_date: "March 5, 2026",
      payment_method: "Bank Transfer (BCA)",
    };

    let subject = template.subject;
    let body = template.body;
    template.variables.forEach((v) => {
      const re = new RegExp(`\\{\\{${v}\\}\\}`, "g");
      subject = subject.replace(re, sampleData[v] || `[${v}]`);
      body = body.replace(re, sampleData[v] || `[${v}]`);
    });

    return { subject, body };
  };

  const categories = [...new Set(templates.map((t) => t.category))];

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Notification Templates</h2>
          <Badge variant="outline" className="text-xs">{templates.length} templates</Badge>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingTemplate({
              id: `new-${Date.now()}`,
              name: "",
              channel: "email",
              subject: "",
              body: "",
              variables: [],
              is_active: true,
              category: "general",
              send_count: 0,
            });
            setShowEditor(true);
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {(["email", "push", "sms", "in-app"] as const).map((ch) => {
          const Icon = channelIcons[ch];
          const count = templates.filter((t) => t.channel === ch).length;
          const active = templates.filter((t) => t.channel === ch && t.is_active).length;
          return (
            <Card key={ch} className="border-border/40">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${channelColors[ch]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground capitalize">{ch}</p>
                  <p className="text-sm font-bold text-foreground">{count} <span className="text-xs font-normal text-muted-foreground">({active} active)</span></p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-9 text-sm" />
        </div>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-32 h-9 text-sm">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="push">Push</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="in-app">In-App</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template list */}
      <div className="space-y-2">
        {filtered.map((template) => {
          const Icon = channelIcons[template.channel];
          return (
            <Card key={template.id} className={`border-border/40 transition-all ${!template.is_active ? "opacity-50" : ""}`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${channelColors[template.channel]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground">{template.name}</span>
                      <Badge variant="outline" className="text-[9px] px-1">{template.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{template.subject}</p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {template.variables.slice(0, 4).map((v) => (
                        <Badge key={v} variant="secondary" className="text-[9px] px-1 py-0">{`{{${v}}}`}</Badge>
                      ))}
                      {template.variables.length > 4 && (
                        <Badge variant="secondary" className="text-[9px] px-1 py-0">+{template.variables.length - 4}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch checked={template.is_active} onCheckedChange={() => handleToggle(template.id)} />
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7"
                      onClick={() => { setEditingTemplate(template); setShowEditor(true); }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDuplicate(template)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (() => {
            const { subject, body } = renderPreview(previewTemplate);
            return (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                  <p className="text-[10px] text-muted-foreground mb-1">SUBJECT</p>
                  <p className="text-sm font-medium text-foreground">{subject}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
                  <p className="text-[10px] text-muted-foreground mb-1">BODY</p>
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{body}</pre>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">{editingTemplate?.name ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Channel</Label>
                  <Select value={editingTemplate.channel} onValueChange={(v: any) => setEditingTemplate({ ...editingTemplate, channel: v })}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in-app">In-App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Input
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="h-8 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Subject</Label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="h-8 text-sm mt-1"
                  placeholder="Use {{variable_name}} for dynamic content"
                />
              </div>
              <div>
                <Label className="text-xs">Body</Label>
                <Textarea
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                  className="text-sm mt-1 min-h-[140px]"
                  placeholder="Use {{variable_name}} for dynamic content"
                />
              </div>
              <div>
                <Label className="text-xs">Variables (comma-separated)</Label>
                <Input
                  value={editingTemplate.variables.join(", ")}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      variables: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                    })
                  }
                  className="h-8 text-sm mt-1"
                  placeholder="user_name, property_title"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowEditor(false)}>Cancel</Button>
                <Button size="sm" onClick={() => handleSave(editingTemplate)}>Save Template</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationTemplatesManager;
