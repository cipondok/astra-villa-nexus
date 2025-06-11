
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Eye, 
  Heart, 
  Calendar,
  DollarSign,
  CheckCircle
} from "lucide-react";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "inquiry",
      title: "New inquiry received",
      description: "Someone is interested in your Luxury Beachfront Villa",
      time: "2 hours ago",
      icon: MessageSquare,
      color: "text-blue-500"
    },
    {
      id: 2,
      type: "view",
      title: "Property viewed",
      description: "Your Modern Penthouse SCBD was viewed 5 times today",
      time: "4 hours ago",
      icon: Eye,
      color: "text-green-500"
    },
    {
      id: 3,
      type: "favorite",
      title: "Property favorited",
      description: "Traditional Javanese House was added to 3 wishlists",
      time: "1 day ago",
      icon: Heart,
      color: "text-red-500"
    },
    {
      id: 4,
      type: "payment",
      title: "Payment received",
      description: "Monthly rent payment for Villa Seminyak",
      time: "2 days ago",
      icon: DollarSign,
      color: "text-yellow-500"
    },
    {
      id: 5,
      type: "approved",
      title: "Property approved",
      description: "Your Commercial Space listing is now live",
      time: "3 days ago",
      icon: CheckCircle,
      color: "text-green-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates on your properties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
