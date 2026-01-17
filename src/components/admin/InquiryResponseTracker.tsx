import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Bell,
  TrendingUp,
  Users,
  Timer,
  ChevronRight,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Inquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  propertyTitle: string;
  message: string;
  receivedAt: Date;
  respondedAt?: Date;
  status: 'pending' | 'responded' | 'overdue';
}

interface InquiryResponseTrackerProps {
  compact?: boolean;
  className?: string;
}

export const InquiryResponseTracker: React.FC<InquiryResponseTrackerProps> = ({
  compact = false,
  className
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState({
    avgResponseTime: 0,
    respondedWithin2Hours: 0,
    totalPending: 0,
    totalOverdue: 0,
    conversionRate: 0
  });

  // Simulated data - in production this would fetch from Supabase
  useEffect(() => {
    const now = new Date();
    const mockInquiries: Inquiry[] = [
      {
        id: '1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        propertyTitle: 'Luxury Villa in Seminyak',
        message: 'Interested in scheduling a viewing',
        receivedAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 mins ago
        status: 'pending'
      },
      {
        id: '2',
        customerName: 'Sarah Smith',
        customerEmail: 'sarah@example.com',
        propertyTitle: 'Modern Apartment Kuta',
        message: 'What is the monthly rental price?',
        receivedAt: new Date(now.getTime() - 90 * 60 * 1000), // 90 mins ago
        status: 'pending'
      },
      {
        id: '3',
        customerName: 'Mike Johnson',
        customerEmail: 'mike@example.com',
        propertyTitle: 'Beachfront House Canggu',
        message: 'Is this property available next month?',
        receivedAt: new Date(now.getTime() - 150 * 60 * 1000), // 2.5 hours ago - OVERDUE
        status: 'overdue'
      },
      {
        id: '4',
        customerName: 'Emily Brown',
        customerEmail: 'emily@example.com',
        propertyTitle: 'Penthouse Ubud',
        message: 'Can you provide more photos?',
        receivedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
        respondedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // responded 1 hour later
        status: 'responded'
      }
    ];

    setInquiries(mockInquiries);
    
    // Calculate stats
    const pending = mockInquiries.filter(i => i.status === 'pending').length;
    const overdue = mockInquiries.filter(i => i.status === 'overdue').length;
    const responded = mockInquiries.filter(i => i.status === 'responded');
    
    const avgTime = responded.length > 0 
      ? responded.reduce((acc, i) => {
          const diff = (i.respondedAt!.getTime() - i.receivedAt.getTime()) / (1000 * 60);
          return acc + diff;
        }, 0) / responded.length
      : 0;

    const within2Hours = responded.filter(i => {
      const diff = (i.respondedAt!.getTime() - i.receivedAt.getTime()) / (1000 * 60);
      return diff <= 120;
    }).length;

    setStats({
      avgResponseTime: Math.round(avgTime),
      respondedWithin2Hours: responded.length > 0 ? Math.round((within2Hours / responded.length) * 100) : 0,
      totalPending: pending,
      totalOverdue: overdue,
      conversionRate: 68 // Example conversion rate
    });
  }, []);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  };

  const getTimeRemaining = (date: Date) => {
    const now = new Date();
    const deadline = new Date(date.getTime() + 2 * 60 * 60 * 1000); // 2 hours from received
    const diffMs = deadline.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return 'Overdue';
    if (diffMins < 60) return `${diffMins}m left`;
    return `${Math.round(diffMins / 60)}h ${diffMins % 60}m left`;
  };

  const getUrgencyColor = (date: Date, status: string) => {
    if (status === 'responded') return 'text-primary';
    if (status === 'overdue') return 'text-destructive';
    
    const now = new Date();
    const deadline = new Date(date.getTime() + 2 * 60 * 60 * 1000);
    const diffMs = deadline.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60);
    
    if (diffMins <= 30) return 'text-destructive';
    if (diffMins <= 60) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  const getProgressValue = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const maxMs = 2 * 60 * 60 * 1000; // 2 hours
    return Math.min(100, (diffMs / maxMs) * 100);
  };

  const pendingInquiries = inquiries.filter(i => i.status !== 'responded');

  if (compact) {
    return (
      <Card className={cn("border-border/50", className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Response Tracker</span>
            </div>
            {stats.totalOverdue > 0 && (
              <Badge variant="destructive" className="text-[9px]">
                {stats.totalOverdue} Overdue
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-accent/50">
              <p className="text-[10px] text-muted-foreground">Avg Response</p>
              <p className="text-sm font-semibold">{stats.avgResponseTime}m</p>
            </div>
            <div className="p-2 rounded-lg bg-accent/50">
              <p className="text-[10px] text-muted-foreground">Within 2hrs</p>
              <p className="text-sm font-semibold">{stats.respondedWithin2Hours}%</p>
            </div>
          </div>
          
          {pendingInquiries.length > 0 && (
            <div className="mt-2 space-y-1">
              {pendingInquiries.slice(0, 2).map(inquiry => (
                <div key={inquiry.id} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-muted/50">
                  <span className="truncate flex-1">{inquiry.customerName}</span>
                  <span className={cn("font-medium", getUrgencyColor(inquiry.receivedAt, inquiry.status))}>
                    {inquiry.status === 'overdue' ? 'Overdue!' : getTimeRemaining(inquiry.receivedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Timer className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Avg Response</span>
            </div>
            <p className="text-lg font-semibold">{stats.avgResponseTime}m</p>
            <p className="text-[9px] text-muted-foreground">Target: 120m</p>
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Within 2hrs</span>
            </div>
            <p className="text-lg font-semibold">{stats.respondedWithin2Hours}%</p>
            <Progress value={stats.respondedWithin2Hours} className="h-1 mt-1" />
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Pending</span>
            </div>
            <p className="text-lg font-semibold">{stats.totalPending}</p>
            {stats.totalOverdue > 0 && (
              <Badge variant="destructive" className="text-[8px] mt-1">
                {stats.totalOverdue} overdue
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-border/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] text-muted-foreground">Conversion</span>
            </div>
            <p className="text-lg font-semibold">{stats.conversionRate}%</p>
            <p className="text-[9px] text-muted-foreground">from quick replies</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Banner */}
      {stats.totalOverdue > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium">Urgent: {stats.totalOverdue} inquiry overdue!</p>
              <p className="text-[10px] text-muted-foreground">
                Respond now to improve conversion rate. Late responses reduce conversions by up to 40%.
              </p>
            </div>
            <Button size="sm" variant="destructive" className="h-7 text-[10px]">
              <Bell className="h-3 w-3 mr-1" />
              View All
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending Inquiries */}
      <Card className="border-border/50">
        <CardHeader className="p-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-primary" />
            Pending Inquiries
          </CardTitle>
          <CardDescription className="text-[11px]">
            Respond within 2 hours for better conversion rates
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-2">
            {pendingInquiries.map(inquiry => {
              const progressValue = getProgressValue(inquiry.receivedAt);
              const isOverdue = inquiry.status === 'overdue';
              
              return (
                <div 
                  key={inquiry.id} 
                  className={cn(
                    "p-2.5 rounded-lg border transition-colors",
                    isOverdue 
                      ? "border-destructive/30 bg-destructive/5" 
                      : "border-border/50 hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium truncate">{inquiry.customerName}</span>
                        {isOverdue && (
                          <Badge variant="destructive" className="text-[8px]">Overdue</Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        {inquiry.propertyTitle}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn("text-[10px] font-medium", getUrgencyColor(inquiry.receivedAt, inquiry.status))}>
                        {isOverdue ? 'Overdue!' : getTimeRemaining(inquiry.receivedAt)}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {getTimeAgo(inquiry.receivedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground mb-2 line-clamp-1">
                    "{inquiry.message}"
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={progressValue} 
                      className={cn("h-1 flex-1", isOverdue && "[&>div]:bg-destructive")} 
                    />
                    <Button size="sm" variant="outline" className="h-6 text-[9px] gap-1">
                      <Mail className="h-2.5 w-2.5" />
                      Reply
                      <ChevronRight className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {pendingInquiries.length === 0 && (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-xs font-medium">All caught up!</p>
                <p className="text-[10px] text-muted-foreground">No pending inquiries</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-border/50 bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium mb-1">Quick Response Benefits</p>
              <ul className="text-[10px] text-muted-foreground space-y-0.5">
                <li>• Inquiries answered within 2 hours have 68% higher conversion</li>
                <li>• First responder wins 50% of leads in competitive markets</li>
                <li>• Late responses are perceived as unprofessional</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InquiryResponseTracker;
