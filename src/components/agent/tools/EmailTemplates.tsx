
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, FileText, Send } from "lucide-react";

const EmailTemplates = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Welcome New Client",
      subject: "Welcome to AstraVilla - Your Property Journey Begins",
      category: "welcome",
      lastUsed: "2024-02-15",
      content: "Dear [Client Name],\n\nWelcome to AstraVilla! We're excited to help you find your perfect property..."
    },
    {
      id: 2,
      name: "Property Viewing Confirmation",
      subject: "Your Property Viewing is Confirmed",
      category: "booking",
      lastUsed: "2024-02-14",
      content: "Dear [Client Name],\n\nYour property viewing has been confirmed for [Date] at [Time]..."
    },
    {
      id: 3,
      name: "Follow-up After Viewing",
      subject: "Thank you for viewing our property",
      category: "follow-up",
      lastUsed: "2024-02-13",
      content: "Dear [Client Name],\n\nThank you for taking the time to view our property..."
    },
    {
      id: 4,
      name: "Market Update Newsletter",
      subject: "Latest Market Trends & New Listings",
      category: "newsletter",
      lastUsed: "2024-02-10",
      content: "Dear Valued Client,\n\nHere are the latest market trends and new listings..."
    }
  ]);

  const handleUseTemplate = (template: any) => {
    // Open default email client with template
    const mailtoLink = `mailto:?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.content)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Templates
        </CardTitle>
        <CardDescription>Pre-written email templates for quick communication</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{template.name}</span>
                  <Badge variant="outline" className="text-xs">{template.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{template.subject}</p>
                <p className="text-xs text-muted-foreground">Last used: {template.lastUsed}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleUseTemplate(template)}
              >
                <Send className="h-4 w-4 mr-1" />
                Use Template
              </Button>
            </div>
          ))}
          <div className="pt-4 border-t">
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTemplates;
