import { useState, useEffect } from 'react';
import { usePendingApplications, ApplicationStatus } from '@/hooks/usePendingApplications';
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
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const ApplicationStatusBar = () => {
  const { data, isLoading } = usePendingApplications();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const applications = data?.applications || [];

  // Check if all approved applications are older than 24 hours
  const shouldAutoHide = applications.length > 0 && applications.every(app => {
    if (app.status !== 'approved') return false;
    // Use reviewed_at if available, otherwise fall back to created_at
    const approvalTime = app.reviewed_at ? new Date(app.reviewed_at) : new Date(app.created_at);
    return differenceInHours(new Date(), approvalTime) > 24;
  });

  // Auto-collapse for approved > 24h
  useEffect(() => {
    if (shouldAutoHide && applications.length > 0 && applications.every(app => app.status === 'approved')) {
      setIsExpanded(false);
    }
  }, [shouldAutoHide, applications]);

  if (isLoading) {
    return (
      <div className="animate-pulse h-8 bg-muted/50 rounded-lg"></div>
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
          color: 'text-chart-3',
          bgColor: 'bg-chart-3/10',
          label: 'Pending'
        };
      case 'under_review':
        return {
          icon: AlertCircle,
          color: 'text-chart-4',
          bgColor: 'bg-chart-4/10',
          label: 'Reviewing'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-chart-1',
          bgColor: 'bg-chart-1/10',
          label: 'Approved'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          label: 'Rejected'
        };
      default:
        return {
          icon: Clock,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/50',
          label: status
        };
    }
  };

  const getTypeConfig = (type: ApplicationStatus['type'], status: ApplicationStatus['status']) => {
    const isApproved = status === 'approved';
    
    switch (type) {
      case 'property_owner':
        return {
          icon: Home,
          label: 'Property Owner',
          route: isApproved ? '/dashboard/property-owner' : '/vendor-registration',
        };
      case 'vendor':
        return {
          icon: Building2,
          label: 'Vendor',
          route: isApproved ? '/dashboard/vendor' : '/vendor-registration',
        };
      case 'agent':
        return {
          icon: Users,
          label: 'Agent',
          route: isApproved ? '/dashboard/agent' : '/vendor-registration',
        };
    }
  };

  // Show collapsed header for approved > 24h
  const allApproved = applications.every(app => app.status === 'approved');
  
  if (shouldAutoHide && allApproved && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-chart-1/10 border border-chart-1/20 text-[10px] hover:bg-chart-1/15 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3 text-chart-1" />
          <span className="text-chart-1 font-medium">
            {applications.length} Application{applications.length > 1 ? 's' : ''} Approved
          </span>
        </div>
        <ChevronDown className="h-3 w-3 text-chart-1" />
      </button>
    );
  }

  return (
    <div className={cn(
      "rounded-lg border overflow-hidden",
      allApproved ? "border-chart-1/20" : "border-primary/20"
    )}>
      {/* Compact Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-2 text-[10px]",
          allApproved 
            ? "bg-chart-1/10" 
            : "bg-gradient-to-r from-primary/5 to-accent/5"
        )}
      >
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-primary" />
          <span className="font-medium">Application Status</span>
          <Badge variant="secondary" className="text-[8px] h-4 px-1">
            {applications.length}
          </Badge>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-2 space-y-1.5 bg-background">
          {applications.map((app) => {
            const statusConfig = getStatusConfig(app.status);
            const typeConfig = getTypeConfig(app.type, app.status);
            const StatusIcon = statusConfig.icon;
            const TypeIcon = typeConfig.icon;
            const isApproved = app.status === 'approved';

            return (
              <div 
                key={app.id}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md",
                  statusConfig.bgColor
                )}
              >
                <div className="h-6 w-6 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                  <TypeIcon className={cn("h-3 w-3", statusConfig.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium truncate">{typeConfig.label}</span>
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "text-[8px] h-3.5 px-1",
                        isApproved && "bg-chart-1 text-primary-foreground"
                      )}
                    >
                      <StatusIcon className="h-2 w-2 mr-0.5" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  {isApproved ? (
                    <p className="text-[9px] text-chart-1 truncate">
                      ✓ Access granted
                    </p>
                  ) : (
                    <p className="text-[9px] text-muted-foreground truncate">
                      {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                    </p>
                  )}
                </div>

                {isApproved ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-6 px-2 text-[9px] bg-chart-1 hover:bg-chart-1/90"
                    onClick={async () => {
                      await queryClient.invalidateQueries({ queryKey: ['user-roles', user?.id] });
                      navigate(typeConfig.route);
                    }}
                  >
                    Open
                    <ChevronRight className="h-2.5 w-2.5 ml-0.5" />
                  </Button>
                ) : (
                  <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusBar;