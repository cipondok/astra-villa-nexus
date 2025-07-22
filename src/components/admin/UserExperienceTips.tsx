import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, Camera, Clock, FileText, Upload, Bell, MapPin } from "lucide-react";

const UserExperienceTips = () => {
  const performanceTips = [
    {
      icon: <Camera className="h-4 w-4" />,
      text: "Use image compression before uploading (recommended: WebP format)",
      priority: "High"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      text: "Keep property descriptions under 500 words for better readability",
      priority: "Medium"
    },
    {
      icon: <Upload className="h-4 w-4" />,
      text: "Use the bulk upload feature for multiple properties",
      priority: "Medium"
    },
    {
      icon: <Bell className="h-4 w-4" />,
      text: "Enable browser notifications for real-time updates",
      priority: "Low"
    }
  ];

  const engagementTips = [
    {
      icon: <Camera className="h-4 w-4" />,
      text: "Add high-quality photos (minimum 1200x800px resolution)",
      impact: "Essential"
    },
    {
      icon: <Users className="h-4 w-4" />,
      text: "Include virtual tours to increase engagement by 40%",
      impact: "High"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      text: "Respond to inquiries within 2 hours for better conversion",
      impact: "Critical"
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      text: "Use descriptive titles with location and key features",
      impact: "Medium"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "destructive";
      case "Medium": return "default";
      case "Low": return "secondary";
      default: return "default";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Critical": return "destructive";
      case "Essential": return "destructive";
      case "High": return "default";
      case "Medium": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Performance Tips
          </CardTitle>
          <CardDescription>
            Optimize your platform's performance with these best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                <div className="text-muted-foreground mt-0.5">
                  {tip.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{tip.text}</p>
                </div>
                <Badge variant={getPriorityColor(tip.priority)} className="text-xs">
                  {tip.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Engagement
          </CardTitle>
          <CardDescription>
            Improve user engagement and conversion rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {engagementTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                <div className="text-muted-foreground mt-0.5">
                  {tip.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{tip.text}</p>
                </div>
                <Badge variant={getImpactColor(tip.impact)} className="text-xs">
                  {tip.impact}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserExperienceTips;