
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircle, 
  BarChart3, 
  MessageSquare, 
  Calendar,
  Camera,
  Settings
} from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  const handleUploadPhotos = () => {
    // Navigate to add property page where photos can be uploaded
    navigate('/add-property');
  };

  const handleScheduleTour = () => {
    // For now, we'll show an alert. In the future, this could open a scheduling modal
    alert('Schedule Tour feature - This will open a tour scheduling interface');
  };

  const handleMessages = () => {
    // For now, we'll show an alert. In the future, this could navigate to a messages page
    alert('Messages feature - This will open your messages inbox');
  };

  const actions = [
    {
      title: "Add Property",
      description: "List a new property",
      icon: PlusCircle,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => navigate('/add-property')
    },
    {
      title: "View Analytics",
      description: "Check performance",
      icon: BarChart3,
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => navigate('/dashboard/property-owner')
    },
    {
      title: "Messages",
      description: "Reply to inquiries",
      icon: MessageSquare,
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: handleMessages
    },
    {
      title: "Schedule Tour",
      description: "Set up viewing",
      icon: Calendar,
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: handleScheduleTour
    },
    {
      title: "Upload Photos",
      description: "Add new images",
      icon: Camera,
      color: "bg-pink-500 hover:bg-pink-600",
      onClick: handleUploadPhotos
    },
    {
      title: "Settings",
      description: "Manage account",
      icon: Settings,
      color: "bg-gray-500 hover:bg-gray-600",
      onClick: () => navigate('/profile')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
                onClick={action.onClick}
              >
                <div className={`p-2 rounded-full ${action.color} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
