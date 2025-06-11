
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Crown, 
  Star, 
  TrendingUp, 
  Gift,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const MembershipLevel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="w-full">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${currentLevel.color} flex items-center justify-center`}>
                  <CurrentIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Level {currentLevel.level}: {currentLevel.name}
                  </CardTitle>
                  {!isExpanded && (
                    <CardDescription className="text-sm">
                      Progress to {nextLevel.name}: {progress.current}/{progress.required}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={currentLevel.color} variant="secondary">
                  {currentLevel.name}
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Current Level Status - Compact */}
            <div className="text-center space-y-1">
              <div className={`w-12 h-12 mx-auto rounded-full ${currentLevel.color} flex items-center justify-center`}>
                <CurrentIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-base font-semibold">Level {currentLevel.level}: {currentLevel.name}</h3>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </div>

            {/* Progress to Next Level - Compact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progress to {nextLevel.name}</span>
                <span className="text-muted-foreground">{progress.current}/{progress.required}</span>
              </div>
              <Progress value={progress.percentage} className="h-1.5" />
            </div>

            {/* Requirements Table - Compact */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Requirements
              </h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="h-8">
                      <TableHead className="w-6 p-2"></TableHead>
                      <TableHead className="p-2 text-xs">Requirement</TableHead>
                      <TableHead className="p-2 text-xs">Current</TableHead>
                      <TableHead className="p-2 text-xs">Target</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requirements.map((req, index) => (
                      <TableRow key={index} className="h-8">
                        <TableCell className="p-2">
                          {req.completed ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Clock className="h-3 w-3 text-orange-500" />
                          )}
                        </TableCell>
                        <TableCell className="p-2 text-xs font-medium">{req.name}</TableCell>
                        <TableCell className={`p-2 text-xs ${req.completed ? "text-green-600" : "text-muted-foreground"}`}>
                          {req.current}
                        </TableCell>
                        <TableCell className="p-2 text-xs text-muted-foreground">{req.required}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Benefits Comparison Table - Compact */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Gift className="h-3 w-3" />
                Benefits
              </h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="h-8">
                      <TableHead className="p-2 text-xs">Benefit</TableHead>
                      <TableHead className="p-2 text-xs">Current</TableHead>
                      <TableHead className="p-2 text-xs">Next Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benefits.map((benefit, index) => (
                      <TableRow key={index} className="h-8">
                        <TableCell className="p-2 text-xs font-medium">{benefit.name}</TableCell>
                        <TableCell className="p-2">
                          <Badge variant={benefit.unlocked ? "default" : "secondary"} className="text-xs px-1 py-0">
                            {benefit.current}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-2">
                          <Badge variant="outline" className="border-yellow-500 text-yellow-700 text-xs px-1 py-0">
                            {benefit.next}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Action Button - Compact */}
            <Button className="w-full h-8 text-xs" variant="outline">
              <NextIcon className="h-3 w-3 mr-1" />
              View Upgrade Path
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default MembershipLevel;
