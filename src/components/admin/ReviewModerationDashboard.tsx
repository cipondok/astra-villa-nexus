import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import {
  Star, CheckCircle2, XCircle, AlertTriangle, Shield,
  MessageSquare, Clock, Eye, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Spam detection keywords
const SPAM_KEYWORDS = ['buy now', 'click here', 'free money', 'guaranteed profit', 'act fast', 'limited offer', 'whatsapp me', 'telegram', 'crypto invest'];

function computeSpamScore(text: string): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 0;

  // Keyword matches
  for (const kw of SPAM_KEYWORDS) {
    if (lower.includes(kw)) score += 20;
  }

  // Excessive caps
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  if (capsRatio > 0.5 && text.length > 20) score += 15;

  // Repeated characters
  if (/(.)\1{4,}/.test(text)) score += 10;

  // URLs
  const urlCount = (text.match(/https?:\/\//gi) || []).length;
  if (urlCount > 2) score += 15;

  // Very short + low rating (likely troll)
  if (text.length < 10) score += 10;

  return Math.min(100, score);
}

interface ReviewItem {
  id: string;
  type: 'property' | 'agent';
  rating: number;
  title: string | null;
  review_text: string | null;
  is_published: boolean;
  admin_approved: boolean;
  spam_score: number | null;
  report_count: number;
  helpful_count: number;
  moderation_notes: string | null;
  created_at: string;
  user_name: string;
  target_name: string;
}

const ReviewModerationDashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('pending');
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  // Fetch property reviews
  const { data: propertyReviews = [], isLoading: prLoading } = useQuery({
    queryKey: ['admin-property-reviews', tab],
    queryFn: async () => {
      let query = supabase
        .from('property_reviews')
        .select('*, profiles:user_id (full_name), properties:property_id (title)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (tab === 'pending') query = query.eq('admin_approved', false).eq('is_published', true);
      else if (tab === 'flagged') query = query.gt('report_count', 0);
      else if (tab === 'approved') query = query.eq('admin_approved', true);

      const { data } = await query;
      return (data || []).map((r: any) => ({
        id: r.id,
        type: 'property' as const,
        rating: r.rating,
        title: r.title,
        review_text: r.review_text,
        is_published: r.is_published,
        admin_approved: r.admin_approved,
        spam_score: r.spam_score ?? computeSpamScore(r.review_text || ''),
        report_count: r.report_count || 0,
        helpful_count: r.helpful_count || 0,
        moderation_notes: r.moderation_notes,
        created_at: r.created_at,
        user_name: r.profiles?.full_name || 'Unknown',
        target_name: r.properties?.title || 'Unknown Property',
      }));
    },
  });

  // Fetch agent reviews
  const { data: agentReviews = [], isLoading: arLoading } = useQuery({
    queryKey: ['admin-agent-reviews', tab],
    queryFn: async () => {
      let query = supabase
        .from('agent_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (tab === 'pending') query = query.eq('admin_approved', false).eq('is_published', true);
      else if (tab === 'flagged') query = query.gt('report_count', 0);
      else if (tab === 'approved') query = query.eq('admin_approved', true);

      const { data } = await query;
      
      // Enrich with profile names
      const reviewerIds = (data || []).map((r: any) => r.reviewer_id);
      const agentIds = (data || []).map((r: any) => r.agent_id);
      const allIds = [...new Set([...reviewerIds, ...agentIds])];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', allIds);
      const pMap = new Map((profiles || []).map(p => [p.id, p.full_name]));

      return (data || []).map((r: any) => ({
        id: r.id,
        type: 'agent' as const,
        rating: r.rating,
        title: r.title,
        review_text: r.review_text,
        is_published: r.is_published,
        admin_approved: r.admin_approved,
        spam_score: r.spam_score ?? computeSpamScore(r.review_text || ''),
        report_count: r.report_count || 0,
        helpful_count: r.helpful_count || 0,
        moderation_notes: r.moderation_notes,
        created_at: r.created_at,
        user_name: pMap.get(r.reviewer_id) || 'Unknown',
        target_name: `Agent: ${pMap.get(r.agent_id) || 'Unknown'}`,
      }));
    },
  });

  const allReviews = [...propertyReviews, ...agentReviews].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Moderate mutation
  const moderate = useMutation({
    mutationFn: async ({ id, type, action }: { id: string; type: 'property' | 'agent'; action: 'approve' | 'reject' | 'flag_spam' }) => {
      const table = type === 'property' ? 'property_reviews' : 'agent_reviews';
      const updates: Record<string, any> = {
        moderation_notes: moderationNote || null,
        moderated_by: user?.id,
        moderated_at: new Date().toISOString(),
      };
      
      if (action === 'approve') {
        updates.admin_approved = true;
        updates.is_published = true;
      } else if (action === 'reject') {
        updates.admin_approved = false;
        updates.is_published = false;
      } else if (action === 'flag_spam') {
        updates.admin_approved = false;
        updates.is_published = false;
        updates.spam_score = 100;
      }

      const { error } = await supabase.from(table).update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(`Review ${vars.action === 'approve' ? 'approved' : vars.action === 'reject' ? 'rejected' : 'flagged as spam'}`);
      setSelectedReview(null);
      setModerationNote('');
      qc.invalidateQueries({ queryKey: ['admin-property-reviews'] });
      qc.invalidateQueries({ queryKey: ['admin-agent-reviews'] });
    },
  });

  const pendingCount = allReviews.filter(r => !r.admin_approved && r.is_published).length;
  const flaggedCount = allReviews.filter(r => r.report_count > 0).length;
  const spamSuspect = allReviews.filter(r => (r.spam_score || 0) >= 40).length;

  const isLoading = prLoading || arLoading;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { icon: Clock, label: 'Pending', value: pendingCount, color: 'text-chart-3' },
          { icon: Flag, label: 'Flagged', value: flaggedCount, color: 'text-destructive' },
          { icon: AlertTriangle, label: 'Spam Suspect', value: spamSuspect, color: 'text-chart-1' },
          { icon: CheckCircle2, label: 'Total Reviews', value: allReviews.length, color: 'text-chart-2' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <s.icon className={cn('h-5 w-5 mx-auto mb-1', s.color)} />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="pending" className="text-xs gap-1">
            <Clock className="h-3 w-3" /> Pending {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
          <TabsTrigger value="flagged" className="text-xs gap-1">
            <Flag className="h-3 w-3" /> Flagged
          </TabsTrigger>
          <TabsTrigger value="approved" className="text-xs gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary" />
            </div>
          ) : allReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No reviews in this category</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {allReviews.map(review => (
                <Card
                  key={`${review.type}-${review.id}`}
                  className={cn(
                    'cursor-pointer hover:border-primary/30 transition-colors',
                    selectedReview?.id === review.id && 'border-primary/50 bg-primary/5',
                    (review.spam_score || 0) >= 60 && 'border-destructive/30 bg-destructive/5'
                  )}
                  onClick={() => {
                    setSelectedReview(review);
                    setModerationNote(review.moderation_notes || '');
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[9px]">{review.type}</Badge>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn('h-3 w-3', i < review.rating ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground/20')} />
                            ))}
                          </div>
                          {(review.spam_score || 0) >= 40 && (
                            <Badge variant="destructive" className="text-[9px]">
                              Spam {review.spam_score}%
                            </Badge>
                          )}
                          {review.report_count > 0 && (
                            <Badge variant="secondary" className="text-[9px] gap-0.5">
                              <Flag className="h-2.5 w-2.5" /> {review.report_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-medium truncate">{review.title || 'No title'}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{review.review_text || 'No text'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted-foreground">by {review.user_name}</span>
                          <span className="text-[10px] text-muted-foreground">on {review.target_name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Moderation Panel */}
      {selectedReview && (
        <Card className="border-primary/30">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" /> Moderate Review
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg text-xs space-y-1">
              <p><strong>Reviewer:</strong> {selectedReview.user_name}</p>
              <p><strong>Target:</strong> {selectedReview.target_name}</p>
              <p><strong>Rating:</strong> {selectedReview.rating}/5</p>
              <p><strong>Spam Score:</strong> {selectedReview.spam_score || 0}%</p>
              <p><strong>Reports:</strong> {selectedReview.report_count}</p>
              {selectedReview.review_text && (
                <p className="mt-2 border-t border-border/30 pt-2">{selectedReview.review_text}</p>
              )}
            </div>

            <Textarea
              value={moderationNote}
              onChange={e => setModerationNote(e.target.value)}
              placeholder="Internal moderation notes..."
              rows={2}
              className="text-xs"
              maxLength={500}
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 gap-1"
                onClick={() => moderate.mutate({ id: selectedReview.id, type: selectedReview.type, action: 'approve' })}
                disabled={moderate.isPending}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 gap-1"
                onClick={() => moderate.mutate({ id: selectedReview.id, type: selectedReview.type, action: 'reject' })}
                disabled={moderate.isPending}
              >
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1"
                onClick={() => moderate.mutate({ id: selectedReview.id, type: selectedReview.type, action: 'flag_spam' })}
                disabled={moderate.isPending}
              >
                <AlertTriangle className="h-3.5 w-3.5" /> Spam
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewModerationDashboard;
