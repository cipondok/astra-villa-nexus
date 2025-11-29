import { usePendingApplications, ApplicationStatus } from '@/hooks/usePendingApplications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Building2,
  Users,
  Home,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ApplicationStatusBar = () => {
  const { data, isLoading } = usePendingApplications();
  const navigate = useNavigate();
  
  const applications = data?.applications || [];

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-16 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return null;
  }

  const getStatusConfig = (status: ApplicationStatus['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          badgeVariant: 'warning' as const,
          label: 'Pending Review'
        };
      case 'under_review':
        return {
          icon: AlertCircle,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          badgeVariant: 'default' as const,
          label: 'Under Review'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          badgeVariant: 'default' as const,
          label: 'Approved'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          badgeVariant: 'destructive' as const,
          label: 'Rejected'
        };
      default:
        return {
          icon: Clock,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          badgeVariant: 'secondary' as const,
          label: status
        };
    }
  };

  const getTypeConfig = (type: ApplicationStatus['type']) => {
    switch (type) {
      case 'property_owner':
        return {
          icon: Home,
          label: 'Property Owner',
          route: '/vendor-registration'
        };
      case 'vendor':
        return {
          icon: Building2,
          label: 'Vendor',
          route: '/vendor-registration'
        };
      case 'agent':
        return {
          icon: Users,
          label: 'Agent',
          route: '/vendor-registration'
        };
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <CardHeader className="p-3 sm:p-4 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Application Status
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
        {applications.map((app) => {
          const statusConfig = getStatusConfig(app.status);
          const typeConfig = getTypeConfig(app.type);
          const StatusIcon = statusConfig.icon;
          const TypeIcon = typeConfig.icon;

          return (
            <div 
              key={app.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${statusConfig.bgColor}`}
            >
              <div className={`h-10 w-10 rounded-full bg-background flex items-center justify-center flex-shrink-0`}>
                <TypeIcon className={`h-5 w-5 ${statusConfig.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{typeConfig.label} Application</span>
                  <Badge 
                    variant={statusConfig.badgeVariant === 'warning' ? 'secondary' : statusConfig.badgeVariant}
                    className={`text-[10px] ${statusConfig.badgeVariant === 'warning' ? 'bg-yellow-500 text-white' : ''}`}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submitted {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                </p>
                {app.review_notes && app.status === 'rejected' && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Note: {app.review_notes}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => navigate(typeConfig.route)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ApplicationStatusBar;
