
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    { name: "Lower Commission Rates", current: "3.5%", next: "2.5%", unlocked: true },
    { name: "Priority Support", current: "Standard", next: "Premium", unlocked: true },
    { name: "Advanced Analytics", current: "Basic", next: "Advanced", unlocked: false },
    { name: "Featured Listings", current: "1/month", next: "3/month", unlocked: false },
    { name: "Marketing Tools", current: "Limited", next: "Full Access", unlocked: false }
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CurrentIcon className={`h-5 w-5 ${currentLevel.textColor}`} />
              Membership Level
            </CardTitle>
            <CardDescription>Track your progress and unlock new benefits</CardDescription>
          </div>
          <Badge className={currentLevel.color} variant="secondary">
            {currentLevel.name} Member
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Level Status */}
        <div className="text-center space-y-2">
          <div className={`w-16 h-16 mx-auto rounded-full ${currentLevel.color} flex items-center justify-center`}>
            <CurrentIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold">Level {currentLevel.level}: {currentLevel.name}</h3>
          <p className="text-sm text-muted-foreground">You're doing great! Keep it up.</p>
        </div>

        {/* Progress to Next Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress to {nextLevel.name}</span>
            <span className="text-sm text-muted-foreground">{progress.current}/{progress.required} completed</span>
          </div>
          <Progress value={progress.percentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Current: {currentLevel.name}</span>
            <span>Next: {nextLevel.name}</span>
          </div>
        </div>

        {/* Requirements Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Requirements for {nextLevel.name}
          </h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-4"></TableHead>
                  <TableHead>Requirement</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Target</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requirements.map((req, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {req.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{req.name}</TableCell>
                    <TableCell className={req.completed ? "text-green-600" : "text-muted-foreground"}>
                      {req.current}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{req.required}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Benefits Comparison Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Benefits Upgrade
          </h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benefit</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Next Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits.map((benefit, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{benefit.name}</TableCell>
                    <TableCell>
                      <Badge variant={benefit.unlocked ? "default" : "secondary"}>
                        {benefit.current}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                        {benefit.next}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full" variant="outline">
          <NextIcon className="h-4 w-4 mr-2" />
          View Upgrade Path
        </Button>
      </CardContent>
    </Card>
  );
};

export default MembershipLevel;
