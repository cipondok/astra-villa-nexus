
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Camera,
  FileText,
  Users
} from "lucide-react";

const UpcomingTasks = () => {
  const tasks = [
    {
      id: 1,
      title: "Property inspection due",
      description: "Annual inspection for Luxury Beachfront Villa",
      dueDate: "Tomorrow",
      priority: "high",
      type: "inspection",
      icon: AlertCircle
    },
    {
      id: 2,
      title: "Update property photos",
      description: "Add new photos for Modern Penthouse SCBD",
      dueDate: "3 days",
      priority: "medium",
      type: "content",
      icon: Camera
    },
    {
      id: 3,
      title: "Respond to inquiries",
      description: "5 pending inquiries waiting for response",
      dueDate: "Today",
      priority: "high",
      type: "communication",
      icon: Users
    },
    {
      id: 4,
      title: "Lease renewal",
      description: "Traditional Javanese House lease expires soon",
      dueDate: "1 week",
      priority: "medium",
      type: "contract",
      icon: FileText
    },
    {
      id: 5,
      title: "Property maintenance",
      description: "Scheduled maintenance for Commercial Space",
      dueDate: "5 days",
      priority: "low",
      type: "maintenance",
      icon: CheckCircle
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Tasks</CardTitle>
        <CardDescription>Important tasks and deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => {
            const IconComponent = task.icon;
            return (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-muted">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{task.title}</p>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingTasks;
