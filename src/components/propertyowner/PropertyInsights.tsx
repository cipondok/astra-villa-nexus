
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye,
  MessageSquare,
  Star
} from "lucide-react";

const PropertyInsights = () => {
  const insights = [
    {
      property: "Luxury Beachfront Villa",
      metrics: {
        views: { value: 234, change: 12, trend: "up" },
        inquiries: { value: 23, change: 8, trend: "up" },
        rating: { value: 4.8, reviews: 15 },
        responseRate: 85
      }
    },
    {
      property: "Modern Penthouse SCBD",
      metrics: {
        views: { value: 189, change: -5, trend: "down" },
        inquiries: { value: 18, change: 3, trend: "up" },
        rating: { value: 4.6, reviews: 12 },
        responseRate: 92
      }
    },
    {
      property: "Traditional Javanese House",
      metrics: {
        views: { value: 156, change: 15, trend: "up" },
        inquiries: { value: 14, change: 6, trend: "up" },
        rating: { value: 4.9, reviews: 8 },
        responseRate: 78
      }
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Performance</CardTitle>
        <CardDescription>Insights for your top properties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium">{insight.property}</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{insight.metrics.views.value}</span>
                    <Badge variant={insight.metrics.views.trend === "up" ? "default" : "secondary"} className="text-xs">
                      {insight.metrics.views.trend === "up" ? (
                        <TrendingUp className="h-2 w-2 mr-1" />
                      ) : (
                        <TrendingDown className="h-2 w-2 mr-1" />
                      )}
                      {Math.abs(insight.metrics.views.change)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{insight.metrics.inquiries.value}</span>
                    <Badge variant={insight.metrics.inquiries.trend === "up" ? "default" : "secondary"} className="text-xs">
                      {insight.metrics.inquiries.trend === "up" ? (
                        <TrendingUp className="h-2 w-2 mr-1" />
                      ) : (
                        <TrendingDown className="h-2 w-2 mr-1" />
                      )}
                      {Math.abs(insight.metrics.inquiries.change)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Inquiries</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-sm font-medium">{insight.metrics.rating.value}</span>
                    <span className="text-xs text-muted-foreground">({insight.metrics.rating.reviews})</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{insight.metrics.responseRate}%</span>
                  </div>
                  <Progress value={insight.metrics.responseRate} className="h-1" />
                  <p className="text-xs text-muted-foreground">Response Rate</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyInsights;
