
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, FileText, Send } from "lucide-react";

const EmailTemplates = () => {
  const [templates] = useState([
    {
      id: 1,
      name: "Welcome New Client",
      subject: "Welcome to AstraVilla - Your Property Journey Begins",
      category: "welcome",
      lastUsed: "2024-02-15"
    },
    {
      id: 2,
      name: "Property Viewing Confirmation",
      subject: "Your Property Viewing is Confirmed",
      category: "booking",
      lastUsed: "2024-02-14"
    },
    {
      id: 3,
      name: "Follow-up After Viewing",
      subject: "Thank you for viewing our property",
      category: "follow-up",
      lastUsed: "2024-02-13"
    },
    {
      id: 4,
      name: "Market Update Newsletter",
      subject: "Latest Market Trends & New Listings",
      category: "newsletter",
      lastUsed: "2024-02-10"
    }
  ]);

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
            <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{template.name}</span>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{template.subject}</p>
                <p className="text-xs text-muted-foreground">Last used: {template.lastUsed}</p>
              </div>
              <Button size="sm" variant="outline">
                <Send className="h-4 w-4 mr-1" />
                Use
              </Button>
            </div>
          ))}
          <Button className="w-full" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTemplates;
