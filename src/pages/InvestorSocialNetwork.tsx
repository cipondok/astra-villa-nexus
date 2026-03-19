import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, Award, MessageCircle, Heart, Bookmark, Share2,
  MapPin, Shield, Crown, Star, Search, Send, Eye, Flame,
  ArrowUpRight, BadgeCheck, Sparkles, Globe, Target, UserPlus, UserCheck, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  useSocialFeed, useCreatePost, useToggleLike, useToggleSave,
  useToggleFollow, usePostComments, useAddComment, useInvestorLeaderboard,
  type SocialPost, type InvestorProfile,
} from '@/hooks/useInvestorSocial';

const formatShort = (v: number) =>
  v >= 1e12 ? `${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`;

// ─── Tier Badge ──────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: string }) {
  const cfg = {
    elite: { label: 'Elite', icon: Crown, className: 'bg-chart-3/10 text-chart-3 border-chart-3/30' },
    pro: { label: 'Pro', icon: Star, className: 'bg-primary/10 text-primary border-primary/30' },
    member: { label: 'Member', icon: Users, className: 'bg-muted text-muted-foreground border-border/30' },
  }[tier] || { label: 'Member', icon: Users, className: 'bg-muted text-muted-foreground border-border/30' };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn('text-[9px] h-5 gap-0.5', cfg.className)}>
      <Icon className="h-2.5 w-2.5" /> {cfg.label}
    </Badge>
  );
}

// ─── Post Type Badge ─────────────────────────────────────────────────
function PostTypeBadge({ type }: { type: string }) {
  const cfg = {
    opportunity: { label: 'Opportunity', className: 'bg-chart-2/10 text-chart-2 border-chart-2/30', icon: Target },
    insight: { label: 'Insight', className: 'bg-chart-4/10 text-chart-4 border-chart-4/30', icon: TrendingUp },
    discussion: { label: 'Discussion', className: 'bg-primary/10 text-primary border-primary/30', icon: MessageCircle },
    watchlist: { label: 'Watchlist', className: 'bg-chart-3/10 text-chart-3 border-chart-3/30', icon: Eye },
  }[type] || { label: type, className: 'bg-muted text-muted-foreground', icon: MessageCircle };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn('text-[9px] h-5 gap-0.5', cfg.className)}>
      <Icon className="h-2.5 w-2.5" /> {cfg.label}
    </Badge>
  );
}

// ─── Comment Dialog ──────────────────────────────────────────────────
function CommentSection({ postId, onClose }: { postId: string; onClose: () => void }) {
  const { data: comments, isLoading } = usePostComments(postId);
  const addComment = useAddComment();
  const [text, setText] = useState('');

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm">Comments</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {isLoading && <div className="text-xs text-muted-foreground text-center py-8">Loading...</div>}
          {!isLoading && (!comments || comments.length === 0) && (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">No comments yet — start the conversation</p>
            </div>
          )}
          {(comments || []).map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar className="h-7 w-7 border border-border/20">
                <AvatarImage src={c.author?.avatar_url || undefined} />
                <AvatarFallback className="text-[9px] bg-muted">{(c.author?.full_name || 'U')[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">{c.author?.full_name || 'Investor'}</span>
                  <span className="text-[9px] text-muted-foreground">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2 border-t border-border/30">
          <Input
            placeholder="Share your thoughts..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-xs h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) {
                addComment.mutate({ postId, content: text.trim() });
                setText('');
              }
            }}
          />
          <Button
            size="sm"
            disabled={!text.trim() || addComment.isPending}
            onClick={() => { addComment.mutate({ postId, content: text.trim() }); setText(''); }}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Deal Post Card ──────────────────────────────────────────────────
function DealPostCard({ post }: { post: SocialPost }) {
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.user_liked || false);
  const [saved, setSaved] = useState(post.user_saved || false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
    toggleLike.mutate({ postId: post.id, isLiked: liked });
  };

  const handleSave = () => {
    setSaved(!saved);
    toggleSave.mutate({ postId: post.id, isSaved: saved });
  };

  const authorName = post.author?.full_name || 'Investor';
  const initials = authorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={cn('bg-card/50 border-border/30', post.is_elite && 'ring-1 ring-chart-3/20')}>
        {post.is_elite && (
          <div className="px-4 py-1.5 bg-gradient-to-r from-chart-3/5 to-transparent border-b border-chart-3/10 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-chart-3" />
            <span className="text-[10px] font-medium text-chart-3">Elite Opportunity</span>
          </div>
        )}
        <CardContent className="p-4">
          {/* Author */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-9 w-9 border border-border/30">
              <AvatarImage src={post.author?.avatar_url || undefined} />
              <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground">{authorName}</span>
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {post.views_count}</span>
              </div>
            </div>
            <PostTypeBadge type={post.post_type} />
          </div>

          <h3 className="text-sm font-bold text-foreground mb-2">{post.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{post.content}</p>

          {/* Property Card */}
          {post.property && (
            <div className="rounded-lg border border-border/20 bg-muted/5 p-3 mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{post.property.title}</span>
                <Badge variant="outline" className="text-[9px] h-4">{post.property.property_type}</Badge>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                <MapPin className="h-2.5 w-2.5" /> {post.property.city}
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase">Price</span>
                  <p className="text-xs font-bold text-foreground">Rp {formatShort(post.property.price)}</p>
                </div>
                {post.property.investment_score > 0 && (
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase">Score</span>
                    <p className="text-xs font-bold text-chart-2">{post.property.investment_score}/100</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[9px] h-5 bg-muted/30">{t}</Badge>
              ))}
            </div>
          )}

          <Separator className="opacity-20 mb-3" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost" size="sm"
              className={cn('h-8 text-xs gap-1.5', liked ? 'text-destructive' : 'text-muted-foreground')}
              onClick={handleLike}
            >
              <Heart className={cn('h-3.5 w-3.5', liked && 'fill-destructive')} /> {likeCount}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground" onClick={() => setShowComments(true)}>
              <MessageCircle className="h-3.5 w-3.5" /> {post.comments_count}
            </Button>
            <Button
              variant="ghost" size="sm"
              className={cn('h-8 text-xs gap-1.5', saved ? 'text-primary' : 'text-muted-foreground')}
              onClick={handleSave}
            >
              <Bookmark className={cn('h-3.5 w-3.5', saved && 'fill-primary')} /> {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground ml-auto">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {showComments && <CommentSection postId={post.id} onClose={() => setShowComments(false)} />}
    </motion.div>
  );
}

// ─── Leaderboard Row ─────────────────────────────────────────────────
function LeaderboardRow({ inv, rank }: { inv: InvestorProfile; rank: number }) {
  const { user } = useAuth();
  const toggleFollow = useToggleFollow();
  const isOwnProfile = user?.id === inv.user_id;

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/10 last:border-0">
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
        rank <= 3 ? 'bg-chart-3/10 text-chart-3' : 'bg-muted text-muted-foreground'
      )}>
        {rank}
      </div>
      <Avatar className="h-8 w-8 border border-border/20">
        <AvatarImage src={inv.avatar_url || undefined} />
        <AvatarFallback className="text-[10px] bg-muted">{(inv.full_name || 'U')[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground truncate">{inv.full_name}</span>
          <TierBadge tier={inv.tier} />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{inv.deals_shared} deals</span>
          <span>·</span>
          <span>{inv.follower_count} followers</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-xs font-bold text-foreground">{inv.reputation_score}</div>
          <div className="text-[9px] text-muted-foreground">score</div>
        </div>
        {!isOwnProfile && user && (
          <Button
            variant={inv.is_following ? 'secondary' : 'outline'}
            size="sm"
            className="h-7 text-[10px] gap-1"
            onClick={() => toggleFollow.mutate({ targetId: inv.user_id, isFollowing: !!inv.is_following })}
          >
            {inv.is_following ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
            {inv.is_following ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Compose Panel ───────────────────────────────────────────────────
function ComposePanel({ onClose }: { onClose: () => void }) {
  const createPost = useCreatePost();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'opportunity' | 'insight' | 'discussion' | 'watchlist'>('discussion');
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    createPost.mutate({
      title: title.trim(),
      content: content.trim(),
      post_type: postType,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }, {
      onSuccess: () => { onClose(); },
    });
  };

  return (
    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
      <Card className="bg-card/50 border-border/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Deal title — what did you find?"
              className="text-sm bg-muted/10 border-border/20 flex-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Select value={postType} onValueChange={(v) => setPostType(v as any)}>
              <SelectTrigger className="w-36 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="insight">Insight</SelectItem>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="watchlist">Watchlist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Share your investment insight, opportunity, or discussion topic..."
            className="text-xs bg-muted/10 border-border/20 min-h-[80px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Input
            placeholder="Tags (comma separated): e.g. Bali, Villa, High Yield"
            className="text-xs bg-muted/10 border-border/20"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              <Shield className="h-3 w-3 inline mr-1" />
              Posts are reviewed for quality. Credibility affects visibility.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button size="sm" disabled={!title.trim() || !content.trim() || createPost.isPending} onClick={handleSubmit}>
                {createPost.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Credibility Explainer ───────────────────────────────────────────
function CredibilityExplainer() {
  const criteria = [
    { label: 'Verified Transactions', weight: '30%', icon: Shield },
    { label: 'Community Engagement', weight: '25%', icon: Heart },
    { label: 'Deal Quality (likes/saves)', weight: '20%', icon: Sparkles },
    { label: 'Referral Success', weight: '15%', icon: Users },
    { label: 'Account Age', weight: '10%', icon: Star },
  ];

  return (
    <Card className="bg-card/40 border-border/30">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-xs font-medium flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" /> Credibility Score
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        <p className="text-[10px] text-muted-foreground mb-2">
          Your reputation is earned through verified activity and community trust.
        </p>
        {criteria.map((c) => (
          <div key={c.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <c.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-foreground">{c.label}</span>
            </div>
            <Badge variant="outline" className="text-[9px] h-4">{c.weight}</Badge>
          </div>
        ))}
        <Separator className="opacity-20 my-2" />
        <div className="flex items-center gap-2 text-[10px]">
          <TierBadge tier="member" /> <span className="text-muted-foreground">0-50</span>
          <TierBadge tier="pro" /> <span className="text-muted-foreground">51-80</span>
          <TierBadge tier="elite" /> <span className="text-muted-foreground">81+</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function InvestorSocialNetwork() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);

  const { data: posts, isLoading: postsLoading } = useSocialFeed(filter, searchQuery);
  const { data: leaderboard, isLoading: leaderboardLoading } = useInvestorLeaderboard();

  const feedPosts = posts || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Investor Network</h1>
                <p className="text-xs text-muted-foreground">Share insights · Discover deals · Build your reputation</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {leaderboard && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" /> {leaderboard.length} investors
                </Badge>
              )}
              {user ? (
                <Button size="sm" onClick={() => setComposeOpen(!composeOpen)}>
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Share Deal
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/?auth=true'}>
                  Sign in to participate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Main Feed (8 cols) ── */}
          <div className="lg:col-span-8 space-y-4">

            {/* Compose */}
            <AnimatePresence>
              {composeOpen && <ComposePanel onClose={() => setComposeOpen(false)} />}
            </AnimatePresence>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search deals, investors, zones..." className="pl-8 h-9 text-xs bg-card/40 border-border/20" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex gap-1">
                {([['all', 'All'], ['opportunity', 'Opportunities'], ['insight', 'Insights'], ['discussion', 'Discussions'], ['watchlist', 'Watchlists']] as const).map(([val, label]) => (
                  <Button key={val} variant={filter === val ? 'secondary' : 'ghost'} size="sm" className="h-8 text-[10px]" onClick={() => setFilter(val)}>
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {postsLoading && [...Array(3)].map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-muted/20 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))}

              {!postsLoading && feedPosts.length === 0 && (
                <Card className="bg-card/50 border-border/30">
                  <CardContent className="p-12 text-center">
                    <Globe className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                    <h3 className="text-base font-semibold text-foreground mb-1">No Posts Yet</h3>
                    <p className="text-xs text-muted-foreground mb-4">Be the first to share an investment opportunity with the community.</p>
                    {user && (
                      <Button size="sm" onClick={() => setComposeOpen(true)}>
                        <Send className="h-3.5 w-3.5 mr-1.5" /> Share a Deal
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {feedPosts.map((post) => <DealPostCard key={post.id} post={post} />)}
            </div>
          </div>

          {/* ── Right Sidebar (4 cols) ── */}
          <div className="lg:col-span-4 space-y-4">

            {/* Credibility Explainer */}
            <CredibilityExplainer />

            {/* Leaderboard */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-chart-3" /> Investor Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                {leaderboardLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted/20 animate-pulse" />)}
                  </div>
                ) : (leaderboard || []).length === 0 ? (
                  <div className="text-center py-6">
                    <Award className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                    <p className="text-[10px] text-muted-foreground">Leaderboard builds as investors participate</p>
                  </div>
                ) : (
                  (leaderboard || []).map((inv, i) => <LeaderboardRow key={inv.user_id} inv={inv} rank={i + 1} />)
                )}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="bg-card/40 border-border/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-chart-2" /> Community Health
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {[
                  { label: 'Content Quality', value: 87, detail: 'Moderation pass rate' },
                  { label: 'Engagement Rate', value: 34, detail: 'Avg interactions/post' },
                  { label: 'Trust Index', value: 92, detail: 'Verified transaction ratio' },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-foreground">{m.label}</span>
                      <span className="text-[9px] text-muted-foreground">{m.detail}</span>
                    </div>
                    <Progress value={m.value} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
