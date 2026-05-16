import React, { useState } from 'react';
import { useMarketIntelligenceFeed, useToggleSaveArticle, useGenerateIntelligenceArticles, useArticleDetail, type FeedArticle, type RelatedProperty } from '@/hooks/useMarketIntelligenceFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Newspaper, TrendingUp, Bookmark, BookmarkCheck, Eye, Clock,
  Sparkles, Flame, ChevronRight, Loader2, MapPin, BarChart3,
  Zap, Scale, Building2, Home, ArrowLeft, Star,
} from 'lucide-react';

const CATEGORIES = ['All', 'Investment', 'Market Trends', 'Legal Tips', 'Developer News', 'Rental Insights'];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Investment: <TrendingUp className="h-3.5 w-3.5" />,
  'Market Trends': <BarChart3 className="h-3.5 w-3.5" />,
  'Legal Tips': <Scale className="h-3.5 w-3.5" />,
  'Developer News': <Building2 className="h-3.5 w-3.5" />,
  'Rental Insights': <Home className="h-3.5 w-3.5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  Investment: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  'Market Trends': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  'Legal Tips': 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  'Developer News': 'bg-purple-500/15 text-purple-600 border-purple-500/30',
  'Rental Insights': 'bg-primary/15 text-primary border-primary/30',
};

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Featured Hero Card ──
function FeaturedHero({ article, onRead, onSave }: { article: FeedArticle; onRead: () => void; onSave: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden cursor-pointer group" onClick={onRead}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {article.image_url ? (
              <div className="md:w-2/5 h-48 md:h-auto">
                <img src={article.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="md:w-2/5 h-48 md:h-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Newspaper className="h-16 w-16 text-primary/30" />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]"><Star className="h-3 w-3 mr-1" /> Featured</Badge>
                  <Badge className={`text-[10px] border ${CATEGORY_COLORS[article.category] || ''}`}>
                    {CATEGORY_ICONS[article.category]} {article.category}
                  </Badge>
                  {article.is_trending && <Badge className="bg-red-500/15 text-red-500 border-red-500/30 text-[10px]"><Flame className="h-3 w-3 mr-1" /> Trending</Badge>}
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.reading_time_min} min</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views_count.toLocaleString()}</span>
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); onSave(); }}>
                  {article.is_saved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              </div>
              {article.market_heat_ref?.market_heat_score && (
                <div className="mt-3 flex items-center gap-2 rounded-md bg-accent/30 px-3 py-1.5">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Market Heat: <strong className="text-foreground">{article.market_heat_ref.market_heat_score}/100</strong></span>
                  <Badge variant="outline" className="text-[9px]">{article.market_heat_ref.heat_level}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Article Card ──
function ArticleCard({ article, index, onRead, onSave }: { article: FeedArticle; index: number; onRead: () => void; onSave: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Card className="border-border/50 bg-card/80 overflow-hidden cursor-pointer group hover:shadow-md transition-all" onClick={onRead}>
        <CardContent className="p-0">
          <div className="flex">
            {article.image_url ? (
              <div className="w-28 sm:w-36 flex-shrink-0">
                <img src={article.image_url} alt="" className="w-full h-full object-cover min-h-[120px]" />
              </div>
            ) : (
              <div className="w-28 sm:w-36 flex-shrink-0 bg-gradient-to-br from-accent to-accent/30 flex items-center justify-center min-h-[120px]">
                <Newspaper className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                  <Badge className={`text-[9px] border px-1.5 py-0 ${CATEGORY_COLORS[article.category] || ''}`}>
                    {article.category}
                  </Badge>
                  {article.is_trending && <Badge className="bg-red-500/15 text-red-500 border-red-500/30 text-[9px] px-1.5 py-0"><Flame className="h-2.5 w-2.5 mr-0.5" /> Trending</Badge>}
                  {article.ai_generated && <Badge variant="outline" className="text-[9px] px-1.5 py-0"><Sparkles className="h-2.5 w-2.5 mr-0.5" /> AI</Badge>}
                </div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                {article.excerpt && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{article.excerpt}</p>}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {article.reading_time_min}m</span>
                  <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {article.views_count > 1000 ? `${(article.views_count / 1000).toFixed(1)}K` : article.views_count}</span>
                  <span>{formatDate(article.created_at)}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onSave(); }}>
                  {article.is_saved ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Related Property Card ──
function RelatedPropertyCard({ prop }: { prop: RelatedProperty }) {
  return (
    <Card className="border-border/50 bg-card/80 overflow-hidden">
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {prop.thumbnail_url ? (
            <img src={prop.thumbnail_url} alt="" className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0"><Home className="h-5 w-5 text-primary" /></div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground truncate">{prop.title}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {prop.city} • {prop.property_type}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-foreground">{formatIDR(prop.price)}</span>
              {prop.investment_score > 0 && <Badge variant="outline" className="text-[8px] px-1 py-0">Score {prop.investment_score}</Badge>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Article Detail Dialog ──
function ArticleDetailDialog({ articleId, open, onClose }: { articleId: string | null; open: boolean; onClose: () => void }) {
  const { data, isLoading } = useArticleDetail(articleId);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        {isLoading ? (
          <div className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : data?.article ? (
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6 space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-[10px] border ${CATEGORY_COLORS[data.article.category] || ''}`}>{data.article.category}</Badge>
                  {data.article.ai_generated && <Badge variant="outline" className="text-[10px]"><Sparkles className="h-3 w-3 mr-1" /> AI Generated</Badge>}
                </div>
                <DialogTitle className="text-xl leading-tight">{data.article.title}</DialogTitle>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {data.article.reading_time_min} min read</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {data.article.views_count.toLocaleString()} views</span>
                  <span>{formatDate(data.article.created_at)}</span>
                </div>
              </DialogHeader>

              {data.article.market_heat_ref?.market_heat_score && (
                <div className="flex items-center gap-2 rounded-lg bg-accent/30 px-4 py-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Market Heat Score:</span>
                  <span className="text-sm font-bold text-foreground">{data.article.market_heat_ref.market_heat_score}/100</span>
                  <Badge variant="outline" className="text-[10px]">{data.article.market_heat_ref.heat_level}</Badge>
                </div>
              )}

              <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
                {data.article.content?.split('\n').map((line: string, i: number) => {
                  if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
                  if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold mt-3 mb-1.5">{line.slice(3)}</h2>;
                  if (line.startsWith('**')) return <p key={i} className="font-medium text-sm">{line.replace(/\*\*/g, '')}</p>;
                  if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-sm ml-4">{line.slice(2)}</li>;
                  if (line.match(/^\d+\./)) return <li key={i} className="text-sm ml-4">{line}</li>;
                  if (line.startsWith('---')) return <hr key={i} className="my-4 border-border/50" />;
                  if (line.startsWith('*') && line.endsWith('*')) return <p key={i} className="text-xs italic text-muted-foreground">{line.replace(/\*/g, '')}</p>;
                  if (line.trim()) return <p key={i} className="text-sm leading-relaxed">{line}</p>;
                  return <br key={i} />;
                })}
              </div>

              {data.article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {data.article.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">#{tag}</Badge>
                  ))}
                </div>
              )}

              {data.related_properties?.length > 0 && (
                <div className="pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" /> Related Properties
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.related_properties.map((p: RelatedProperty) => <RelatedPropertyCard key={p.id} prop={p} />)}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm">Article not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──
export default function MarketIntelligenceFeedPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const { data, isLoading } = useMarketIntelligenceFeed(activeCategory);
  const toggleSave = useToggleSaveArticle();
  const generate = useGenerateIntelligenceArticles();

  const articles = data?.articles || [];
  const featured = articles.find((a) => a.is_featured);
  const regular = articles.filter((a) => a !== featured);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" /> Market Intelligence
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Property insights, trends & investment intelligence</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => generate.mutate()} disabled={generate.isPending}>
          {generate.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Generate AI Insights
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="text-xs px-3 py-1.5 rounded-full border border-border/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
            >
              {CATEGORY_ICONS[cat] && <span className="mr-1">{CATEGORY_ICONS[cat]}</span>}
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-52" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && articles.length === 0 && (
        <Card className="border-border/50 bg-card/80">
          <CardContent className="p-12 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Intelligence Reports Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate AI-powered market intelligence articles to populate the feed.</p>
            <Button onClick={() => generate.mutate()} disabled={generate.isPending} className="gap-2">
              {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Intelligence Articles
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Featured Article */}
      {!isLoading && featured && (
        <FeaturedHero
          article={featured}
          onRead={() => setSelectedArticleId(featured.id)}
          onSave={() => toggleSave.mutate(featured.id)}
        />
      )}

      {/* Article Grid */}
      {!isLoading && regular.length > 0 && (
        <div className="space-y-3">
          {regular.map((article, i) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={i}
              onRead={() => setSelectedArticleId(article.id)}
              onSave={() => toggleSave.mutate(article.id)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {data?.has_more && (
        <div className="text-center pt-2">
          <Button variant="outline" size="sm" className="text-xs">Load More Articles</Button>
        </div>
      )}

      {/* Stats Bar */}
      {!isLoading && articles.length > 0 && (
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border/30">
          <span>{data?.total || 0} total articles</span>
          <span>{articles.filter((a) => a.is_trending).length} trending</span>
          <span>{articles.filter((a) => a.ai_generated).length} AI-generated</span>
        </div>
      )}

      {/* Article Detail Dialog */}
      <ArticleDetailDialog
        articleId={selectedArticleId}
        open={!!selectedArticleId}
        onClose={() => setSelectedArticleId(null)}
      />
    </div>
  );
}
