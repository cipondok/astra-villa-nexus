
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Star, 
  TrendingUp, 
  Gift,
  CheckCircle,
  Clock
} from "lucide-react";

const MembershipLevel = () => {
  // Mock membership data
  const currentLevel = {
    name: "Silver",
    level: 2,
    icon: Star,
    color: "bg-gradient-to-r from-gray-400 to-gray-600",
    textColor: "text-gray-600"
  };

  const nextLevel = {
    name: "Gold",
    level: 3,
    icon: Crown,
    color: "bg-gradient-to-r from-yellow-400 to-yellow-600"
  };

  const progress = {
    current: 7,
    required: 10,
    percentage: 70
  };

  const benefits = [
    { name: "Lower Commission", current: "3.5%", next: "2.5%", unlocked: true },
    { name: "Priority Support", current: "Standard", next: "Premium", unlocked: true },
    { name: "Advanced Analytics", current: "Basic", next: "Advanced", unlocked: false },
    { name: "Featured Listings", current: "1/month", next: "3/month", unlocked: false },
  ];

  const requirements = [
    { name: "Active Properties", current: 5, required: 10, completed: false },
    { name: "Positive Reviews", current: 23, required: 25, completed: false },
    { name: "Response Time", current: "2.4h", required: "< 2h", completed: false },
    { name: "Account Age", current: "8 months", required: "6 months", completed: true }
  ];

  const CurrentIcon = currentLevel.icon;
  const NextIcon = nextLevel.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CurrentIcon className={`h-4 w-4 ${currentLevel.textColor}`} />
              Membership Level
            </CardTitle>
            <CardDescription className="text-sm">Track your progress and unlock new benefits</CardDescription>
          </div>
          <Badge className={currentLevel.color} variant="secondary">
            {currentLevel.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Horizontal Layout - Current Level & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Level Status */}
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full ${currentLevel.color} flex items-center justify-center flex-shrink-0`}>
              <CurrentIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Level {currentLevel.level}: {currentLevel.name}</h3>
              <p className="text-sm text-muted-foreground">Keep up the great work!</p>
            </div>
          </div>

          {/* Progress to Next Level */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Progress to {nextLevel.name}</span>
              <span className="text-muted-foreground">{progress.current}/{progress.required}</span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <NextIcon className="h-4 w-4" />
              <span>{progress.required - progress.current} more to unlock {nextLevel.name}</span>
            </div>
          </div>
        </div>

        {/* Horizontal Layout - Requirements & Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Requirements
            </h4>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                  <div className="flex items-center gap-2">
                    {req.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="text-sm font-medium">{req.name}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${req.completed ? "text-green-600" : "text-muted-foreground"}`}>
                      {req.current}
                    </div>
                    <div className="text-xs text-muted-foreground">/{req.required}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Benefits
            </h4>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                  <span className="text-sm font-medium">{benefit.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={benefit.unlocked ? "default" : "secondary"} className="text-xs">
                      {benefit.current}
                    </Badge>
                    <span className="text-xs text-muted-foreground">→</span>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700 text-xs">
                      {benefit.next}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button variant="outline" className="w-full max-w-xs">
            <NextIcon className="h-4 w-4 mr-2" />
            View Upgrade Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MembershipLevel;
