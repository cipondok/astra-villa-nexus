import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileCheck,
  Shield,
  Play,
  Eye,
  Users,
  Calendar,
  Filter
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAdminVideoVerification, AdminVideoSession } from '@/hooks/useAdminVideoVerification';
import VideoReviewPanel from './VideoReviewPanel';

const VideoVerificationReviewDashboard: React.FC = () => {
  const {
    pendingSessions,
    completedSessions,
    loadingPending,
    loadingCompleted,
  } = useAdminVideoVerification();

  const [selectedSession, setSelectedSession] = useState<AdminVideoSession | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
      scheduled: { variant: 'outline', icon: Calendar },
      in_progress: { variant: 'default', icon: Video },
      pending_review: { variant: 'secondary', icon: Clock },
      completed: { variant: 'default', icon: CheckCircle },
      failed: { variant: 'destructive', icon: XCircle },
      cancelled: { variant: 'outline', icon: XCircle },
    };
    const { variant, icon: Icon } = config[status] || config.scheduled;
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const renderSessionCard = (session: AdminVideoSession) => (
    <Card 
      key={session.id}
      className={cn(
        "cursor-pointer transition-colors hover:border-primary/50",
        selectedSession?.id === session.id && "border-primary"
      )}
      onClick={() => setSelectedSession(session)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={session.user?.avatar_url} />
            <AvatarFallback>
              {session.user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">
                {session.user?.full_name || 'Unknown User'}
              </h4>
              {getStatusBadge(session.status)}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {session.user?.email}
            </p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(session.scheduled_at), 'MMM d, yyyy HH:mm')}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {session.fraud_flags && session.fraud_flags.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {session.fraud_flags.length} Flag{session.fraud_flags.length > 1 ? 's' : ''}
              </Badge>
            )}
            {session.recording_url && (
              <Badge variant="outline" className="gap-1">
                <Play className="h-3 w-3" />
                Recording
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Statistics
  const stats = {
    pending: pendingSessions.filter(s => s.status === 'pending_review').length,
    scheduled: pendingSessions.filter(s => s.status === 'scheduled').length,
    inProgress: pendingSessions.filter(s => s.status === 'in_progress').length,
    completed: completedSessions.filter(s => s.status === 'completed').length,
    flagged: pendingSessions.filter(s => s.fraud_flags && s.fraud_flags.length > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6" />
            Video Verification Review
          </h2>
          <p className="text-muted-foreground">
            Review and approve Level 4 video verification sessions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-chart-3" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-chart-4" />
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-chart-1" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{stats.flagged}</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Session List */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="pending" className="flex-1">
                Pending ({pendingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex-1">
                Completed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {loadingPending ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading sessions...
                    </div>
                  ) : pendingSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending sessions
                    </div>
                  ) : (
                    pendingSessions.map(renderSessionCard)
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {loadingCompleted ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading sessions...
                    </div>
                  ) : completedSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No completed sessions
                    </div>
                  ) : (
                    completedSessions.map(renderSessionCard)
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-3">
          {selectedSession ? (
            <VideoReviewPanel 
              session={selectedSession}
              onClose={() => setSelectedSession(null)}
            />
          ) : (
            <Card className="h-[680px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a session to review</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoVerificationReviewDashboard;
