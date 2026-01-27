import { useState, useEffect } from "react";
import { Eye, MessageSquare, TrendingUp, Users, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SocialProofWidgetProps {
  propertyId: string;
  viewCount?: number;
  inquiryCount?: number;
  recentViews?: number; // Views in last 24h
  className?: string;
  variant?: "compact" | "full";
}

/**
 * Social proof widget that displays property engagement metrics
 * Uses simulated real-time data with random variation for demo purposes
 * In production, this would connect to real analytics
 */
const SocialProofWidget = ({
  propertyId,
  viewCount = 0,
  inquiryCount = 0,
  recentViews = 0,
  className,
  variant = "compact"
}: SocialProofWidgetProps) => {
  // Simulate realistic engagement numbers based on property ID hash
  const [metrics, setMetrics] = useState({
    views: viewCount,
    inquiries: inquiryCount,
    recentViews: recentViews,
    watching: 0
  });

  useEffect(() => {
    // Generate consistent but varied numbers based on property ID
    const hash = propertyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseViews = (hash % 50) + 10; // 10-60 views
    const baseInquiries = Math.floor(baseViews * (0.05 + (hash % 10) / 100)); // 5-15% inquiry rate
    const watching = Math.floor(Math.random() * 5) + 1; // 1-5 people

    setMetrics({
      views: viewCount || baseViews,
      inquiries: inquiryCount || baseInquiries,
      recentViews: recentViews || Math.floor(baseViews * 0.3),
      watching
    });

    // Simulate real-time "watching" updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        watching: Math.max(1, prev.watching + (Math.random() > 0.5 ? 1 : -1))
      }));
    }, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [propertyId, viewCount, inquiryCount, recentViews]);

  const isHot = metrics.recentViews > 15 || metrics.inquiries > 3;

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
        {isHot && (
          <Badge 
            variant="destructive" 
            className="text-[9px] px-1.5 py-0 h-4 bg-gradient-to-r from-orange-500 to-red-500 animate-pulse"
          >
            <Flame className="h-2.5 w-2.5 mr-0.5" />
            Hot
          </Badge>
        )}
        
        <Badge 
          variant="secondary" 
          className="text-[9px] px-1.5 py-0 h-4 bg-muted/60"
        >
          <Eye className="h-2.5 w-2.5 mr-0.5 text-muted-foreground" />
          {metrics.views}
        </Badge>
        
        {metrics.inquiries > 0 && (
          <Badge 
            variant="secondary" 
            className="text-[9px] px-1.5 py-0 h-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
          >
            <MessageSquare className="h-2.5 w-2.5 mr-0.5" />
            {metrics.inquiries}
          </Badge>
        )}

        {metrics.watching > 1 && (
          <Badge 
            variant="secondary" 
            className="text-[9px] px-1.5 py-0 h-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          >
            <Users className="h-2.5 w-2.5 mr-0.5" />
            {metrics.watching} viewing
          </Badge>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn(
      "p-2 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-border/30",
      className
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isHot && (
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-3.5 w-3.5 animate-pulse" />
              <span className="text-[10px] font-semibold">In Demand</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span className="text-[10px]">{metrics.views} views</span>
          </div>
          
          {metrics.recentViews > 0 && (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px]">+{metrics.recentViews} today</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {metrics.inquiries > 0 && (
            <div className="flex items-center gap-1 text-primary">
              <MessageSquare className="h-3 w-3" />
              <span className="text-[10px] font-medium">{metrics.inquiries} inquiries</span>
            </div>
          )}
          
          {metrics.watching > 0 && (
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Users className="h-3 w-3" />
              <span className="text-[10px]">{metrics.watching} viewing now</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialProofWidget;
