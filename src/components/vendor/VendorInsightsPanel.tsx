
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Target,
  Star,
  Clock,
  Award
} from "lucide-react";

interface InsightData {
  type: "warning" | "success" | "info" | "tip";
  title: string;
  message: string;
  action?: string;
  metric?: string;
  value?: number;
}

interface VendorInsightsPanelProps {
  performanceData: {
    responseTime: number;
    satisfaction: number;
    completionRate: number;
    bookingCount: number;
    performanceScore: number;
  };
  goals: {
    responseTimeTarget: number;
    satisfactionTarget: number;
    completionTarget: number;
  };
}

const VendorInsightsPanel = ({ performanceData, goals }: VendorInsightsPanelProps) => {
  const generateInsights = (): InsightData[] => {
    const insights: InsightData[] = [];

    // Response time insights
    if (performanceData.responseTime > goals.responseTimeTarget) {
      insights.push({
        type: "warning",
        title: "Response Time Needs Improvement",
        message: `Your average response time is ${performanceData.responseTime} minutes, which is above the ${goals.responseTimeTarget}-minute target. Quick responses lead to more bookings.`,
        action: "Set up push notifications",
        metric: "Response Time",
        value: performanceData.responseTime
      });
    } else {
      insights.push({
        type: "success",
        title: "Excellent Response Time",
        message: `Your ${performanceData.responseTime}-minute average response time is excellent and helps you secure more bookings.`,
        metric: "Response Time",
        value: performanceData.responseTime
      });
    }

    // Customer satisfaction insights
    if (performanceData.satisfaction < goals.satisfactionTarget) {
      insights.push({
        type: "warning",
        title: "Customer Satisfaction Below Target",
        message: `Your ${performanceData.satisfaction}/5.0 rating is below the ${goals.satisfactionTarget}/5.0 target. Focus on communication and service quality.`,
        action: "Review customer feedback",
        metric: "Satisfaction",
        value: performanceData.satisfaction
      });
    } else {
      insights.push({
        type: "success",
        title: "High Customer Satisfaction",
        message: `Your ${performanceData.satisfaction}/5.0 rating shows customers love your service quality.`,
        metric: "Satisfaction",
        value: performanceData.satisfaction
      });
    }

    // Completion rate insights
    if (performanceData.completionRate >= goals.completionTarget) {
      insights.push({
        type: "success",
        title: "Outstanding Completion Rate",
        message: `Your ${performanceData.completionRate}% completion rate demonstrates reliability and professionalism.`,
        metric: "Completion Rate",
        value: performanceData.completionRate
      });
    }

    // Performance score insights
    if (performanceData.performanceScore >= 85) {
      insights.push({
        type: "success",
        title: "Top Performer",
        message: "You're in the top tier of vendors! This makes you eligible for premium features and better visibility.",
        action: "Explore premium benefits"
      });
    } else if (performanceData.performanceScore < 60) {
      insights.push({
        type: "warning",
        title: "Performance Improvement Needed",
        message: "Your overall performance score suggests room for improvement across multiple metrics.",
        action: "Review performance guide"
      });
    }

    // Booking volume insights
    if (performanceData.bookingCount > 0) {
      if (performanceData.bookingCount < 5) {
        insights.push({
          type: "tip",
          title: "Boost Your Booking Volume",
          message: `You have ${performanceData.bookingCount} bookings this period. Consider expanding your service offerings or service areas.`,
          action: "Add more services"
        });
      } else {
        insights.push({
          type: "info",
          title: "Healthy Booking Volume",
          message: `You've completed ${performanceData.bookingCount} bookings this period. Great job maintaining steady business!`,
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "tip":
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      default:
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "warning":
        return "border-l-orange-500 bg-orange-50";
      case "success":
        return "border-l-green-500 bg-green-50";
      case "tip":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          AI Performance Insights
        </CardTitle>
        <CardDescription>
          Personalized recommendations based on your performance data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 border-l-4 rounded-lg ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-3">
                    {insight.message}
                  </p>
                  <div className="flex items-center gap-3">
                    {insight.metric && insight.value && (
                      <Badge variant="outline" className="text-xs">
                        {insight.metric}: {insight.value}
                      </Badge>
                    )}
                    {insight.action && (
                      <Button variant="outline" size="sm" className="text-xs">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {insights.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No specific insights available yet.</p>
              <p className="text-sm">Complete more bookings to get personalized recommendations.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorInsightsPanel;
