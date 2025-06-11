
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Star, 
  TrendingUp, 
  Gift
} from "lucide-react";

const MembershipLevel = () => {
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

  const CurrentIcon = currentLevel.icon;
  const NextIcon = nextLevel.icon;

  return (
    <Card className="w-full h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CurrentIcon className={`h-4 w-4 ${currentLevel.textColor}`} />
              Membership
            </CardTitle>
          </div>
          <Badge className={currentLevel.color} variant="secondary">
            {currentLevel.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Compact Level Status */}
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 mx-auto rounded-full ${currentLevel.color} flex items-center justify-center`}>
            <CurrentIcon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-sm font-semibold">Level {currentLevel.level}: {currentLevel.name}</h3>
        </div>

        {/* Compact Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Progress to {nextLevel.name}</span>
            <span className="text-muted-foreground">{progress.current}/{progress.required}</span>
          </div>
          <Progress value={progress.percentage} className="h-1" />
        </div>

        {/* Compact Action */}
        <Button className="w-full" variant="outline" size="sm">
          <NextIcon className="h-3 w-3 mr-2" />
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipLevel;
