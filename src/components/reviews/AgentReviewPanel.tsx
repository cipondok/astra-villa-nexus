import React, { useState } from 'react';
import { useAgentReviews } from '@/hooks/useAgentReviews';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MessageSquare, ThumbsUp, Send, Loader2,
  ShieldCheck, Zap, BookOpen, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  agentId: string;
  agentName?: string;
  className?: string;
}

const CRITERIA = [
  { key: 'rating_responsiveness', label: 'Responsiveness', icon: Zap, desc: 'Speed & communication quality' },
  { key: 'rating_knowledge', label: 'Market Knowledge', icon: BookOpen, desc: 'Property & area expertise' },
  { key: 'rating_professionalism', label: 'Professionalism', icon: Briefcase, desc: 'Conduct & reliability' },
] as const;

function StarInput({ value, onChange, size = 'sm' }: { value: number; onChange: (v: number) => void; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5 hover:scale-110 transition-transform">
          <Star className={cn(s, star <= value ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground/30')} />
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={cn(s, i <= Math.round(rating) ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground/30')} />
      ))}
    </div>
  );
}

export default function AgentReviewPanel({ agentId, agentName, className }: Props) {
  const { user } = useAuth();
  const {
    reviews, myReview, isLoading, averageRating, totalReviews,
    avgResponsiveness, avgKnowledge, avgProfessionalism,
    createReview, isSubmitting,
  } = useAgentReviews(agentId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    rating: 0,
    rating_responsiveness: 0,
    rating_knowledge: 0,
    rating_professionalism: 0,
    title: '',
    review_text: '',
  });

  const handleSubmit = () => {
    if (form.rating === 0) return;
    createReview({
      agent_id: agentId,
      rating: form.rating,
      rating_responsiveness: form.rating_responsiveness || undefined,
      rating_knowledge: form.rating_knowledge || undefined,
      rating_professionalism: form.rating_professionalism || undefined,
      title: form.title.trim() || undefined,
      review_text: form.review_text.trim() || undefined,
    });
    setForm({ rating: 0, rating_responsiveness: 0, rating_knowledge: 0, rating_professionalism: 0, title: '', review_text: '' });
    setShowForm(false);
  };

  if (isLoading) {
    return <div className={cn('animate-pulse h-32 bg-muted rounded-xl', className)} />;
  }

  const criteriaAvgs = [
    { label: 'Responsiveness', value: avgResponsiveness, icon: Zap },
    { label: 'Knowledge', value: avgKnowledge, icon: BookOpen },
    { label: 'Professionalism', value: avgProfessionalism, icon: Briefcase },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="text-center">
              <p className="text-3xl font-black text-foreground">{averageRating.toFixed(1)}</p>
              <StarDisplay rating={averageRating} size="md" />
              <p className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {criteriaAvgs.map(c => (
                <div key={c.label} className="flex items-center gap-2">
                  <c.icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground w-24">{c.label}</span>
                  <Progress value={c.value * 20} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium w-6 text-right">{c.value ? c.value.toFixed(1) : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review CTA */}
      {user && !myReview && !showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full gap-2 rounded-xl">
          <MessageSquare className="h-4 w-4" /> Rate {agentName || 'this Agent'}
        </Button>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star className="h-4 w-4 text-chart-3" /> Rate {agentName || 'Agent'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Overall Rating *</label>
                  <StarInput value={form.rating} onChange={v => setForm(p => ({ ...p, rating: v }))} size="md" />
                </div>

                {/* Criteria */}
                <div className="grid gap-3">
                  {CRITERIA.map(c => {
                    const Icon = c.icon;
                    return (
                      <div key={c.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium">{c.label}</p>
                            <p className="text-[10px] text-muted-foreground">{c.desc}</p>
                          </div>
                        </div>
                        <StarInput
                          value={form[c.key]}
                          onChange={v => setForm(p => ({ ...p, [c.key]: v }))}
                        />
                      </div>
                    );
                  })}
                </div>

                <Input
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Summarize your experience"
                  className="h-9 rounded-xl"
                  maxLength={200}
                />
                <Textarea
                  value={form.review_text}
                  onChange={e => setForm(p => ({ ...p, review_text: e.target.value }))}
                  placeholder="Share your experience working with this agent..."
                  rows={3}
                  className="rounded-xl resize-none"
                  maxLength={2000}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                  <Button onClick={handleSubmit} disabled={form.rating === 0 || isSubmitting} className="flex-1 rounded-xl gap-1.5">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card className="border-border/30">
          <CardContent className="py-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">No reviews yet</p>
            <p className="text-xs text-muted-foreground">Be the first to rate this agent</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border/40 rounded-xl p-4 space-y-2 bg-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={review.profiles?.avatar_url} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {(review.profiles?.full_name || 'A').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-semibold">{review.profiles?.full_name || 'Investor'}</span>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={review.rating} />
              </div>
              {review.title && <h4 className="text-sm font-bold">{review.title}</h4>}
              {review.review_text && <p className="text-xs text-muted-foreground leading-relaxed">{review.review_text}</p>}
              
              {/* Sub-ratings */}
              {(review.rating_responsiveness || review.rating_knowledge || review.rating_professionalism) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {review.rating_responsiveness && (
                    <Badge variant="outline" className="text-[9px] gap-0.5">
                      <Zap className="h-2.5 w-2.5" /> {review.rating_responsiveness}/5
                    </Badge>
                  )}
                  {review.rating_knowledge && (
                    <Badge variant="outline" className="text-[9px] gap-0.5">
                      <BookOpen className="h-2.5 w-2.5" /> {review.rating_knowledge}/5
                    </Badge>
                  )}
                  {review.rating_professionalism && (
                    <Badge variant="outline" className="text-[9px] gap-0.5">
                      <Briefcase className="h-2.5 w-2.5" /> {review.rating_professionalism}/5
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <ThumbsUp className="h-3 w-3" /> Helpful ({review.helpful_count || 0})
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
