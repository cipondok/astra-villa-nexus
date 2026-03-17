import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  MessageSquare, Copy, Clock, Users, Target, Zap,
  Eye, Star, Handshake, TrendingUp, Calendar, Shield,
  CheckCircle2, AlertTriangle, Heart, Building2, DollarSign,
  ArrowRight, Sparkles, Send, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  category: string;
  trigger: string;
  timing: string;
  subject?: string;
  message: string;
  tone: string;
  icon: typeof MessageSquare;
  color: string;
  bgColor: string;
  tips: string[];
  doNot: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'first-inquiry',
    category: 'After First Inquiry',
    trigger: 'Investor submits inquiry on a listing',
    timing: 'Within 2 hours of inquiry',
    subject: 'Your inquiry on [Property Name]',
    message: `Hi [Name],

Thank you for your interest in [Property Name] in [Location].

I pulled some additional data that might help your evaluation:

• Our AI scores this property at [Score]/100 for investment potential
• Current estimated fair market value: [FMV] — the listing is [X]% [below/above] market
• Area rental yield average: [Yield]% gross annually

If you'd like, I can prepare a detailed investment analysis or arrange a viewing at your convenience.

What would be most helpful for you right now?

Best regards,
[Your Name]
ASTRA Villa`,
    tone: 'Helpful, data-forward, no pressure',
    icon: MessageSquare,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    tips: [
      'Send within 2 hours — response speed is your strongest trust signal',
      'Include one specific data point they couldn\'t find elsewhere — it proves platform value',
      'End with an open question, not a push — let them choose the next step',
      'Personalize the property reference — never send a generic template unchanged',
    ],
    doNot: 'Don\'t say "act fast" or "limited time" on first contact — it feels manipulative before trust is established',
  },
  {
    id: 'watchlist-activity',
    category: 'After Watchlist Activity',
    trigger: 'Investor saves 3+ properties to watchlist',
    timing: '24 hours after 3rd save',
    subject: 'Properties you\'re watching — quick insights',
    message: `Hi [Name],

I noticed you've been exploring some interesting properties on ASTRA Villa. Great eye — a couple of those are in high-demand zones right now.

I thought these might be useful:

• [Property A] vs [Property B]: yield comparison shows [A] outperforms by [X]% annually
• [Property C] is in an area where prices grew [X]% last quarter — emerging growth signal

Would it help if I put together a side-by-side comparison with ROI projections? It takes about 30 seconds on our platform, and I can walk you through what the numbers mean.

No pressure at all — just want to make sure you have the full picture.

[Your Name]`,
    tone: 'Observant, value-adding, casual',
    icon: Star,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    tips: [
      'Reference specific properties they saved — shows you\'re paying attention, not mass-messaging',
      'Offer a concrete deliverable (comparison report) rather than a vague "let\'s chat"',
      '"No pressure" works because you\'ve already provided value in the message itself',
      'If they don\'t respond, wait 5 days before any follow-up',
    ],
    doNot: 'Don\'t list every property they saved — pick 2-3 and add insight. Data dump ≠ value',
  },
  {
    id: 'post-viewing',
    category: 'After Property Viewing',
    trigger: 'Investor completes a property viewing',
    timing: 'Same day, within 4 hours of viewing',
    message: `Hi [Name],

Great meeting you at [Property Name] today. Thanks for taking the time.

A few things I wanted to follow up on:

• The question you asked about [specific topic] — I checked, and [answer with data]
• Comparable recent transactions in the area: [Comp 1] sold at [Price], [Comp 2] at [Price]
• Based on current market conditions, I'd estimate a competitive offer range of [Range]

What are your initial thoughts? If you're interested in exploring an offer, I can help structure something that positions you well with the seller.

Happy to discuss whenever works for you.

[Your Name]`,
    tone: 'Professional, responsive, helpful',
    icon: Eye,
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
    tips: [
      'Reference something specific from the viewing conversation — proves you listened',
      'Answer any question they asked during viewing — this builds "reliable" perception',
      'Include comparable data — moves them from emotional ("I liked it") to rational ("it makes sense")',
      'Suggest an offer range but don\'t push — let them initiate the next step',
    ],
    doNot: 'Don\'t ask "so are you ready to make an offer?" — it\'s premature and pressuring',
  },
  {
    id: 'negotiation-nudge',
    category: 'Negotiation Reminder',
    trigger: 'Active negotiation with no movement for 3+ days',
    timing: '72 hours after last communication',
    message: `Hi [Name],

Just a quick update on [Property Name] —

The seller is reviewing current offers this week. I wanted to check in and see if you had any questions about the terms we discussed, or if there's anything I can clarify about the pricing analysis.

For reference:
• Your proposed offer: [Amount]
• AI-estimated fair value: [FMV]
• Current market activity in [Area]: [X] inquiries this month

If you'd like to adjust your position or discuss strategy, I'm available today. If you need more time, that's completely fine too — I just want to make sure you have the information you need.

[Your Name]`,
    tone: 'Informative urgency, not pressure',
    icon: Handshake,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    tips: [
      'Create informed urgency with facts ("seller reviewing this week") not artificial scarcity',
      'Restate their offer alongside market data — reminds them their position is reasonable',
      '"If you need more time" gives them an exit — paradoxically, this makes them more likely to act',
      'Offer to discuss "strategy" not "closing" — frames you as advisor, not salesperson',
    ],
    doNot: 'Never say "another buyer is interested" unless it\'s verified and you can back it up',
  },
  {
    id: 'gone-quiet',
    category: 'Re-Engagement (Gone Quiet)',
    trigger: 'No response for 7+ days after active conversation',
    timing: '7 days after last message',
    message: `Hi [Name],

I hope you're doing well. I wanted to share something that might be relevant to your search —

We just published a market analysis on [Area/City] showing [key insight: e.g., "rental yields in Canggu increased 12% this quarter"]. Given the properties you were exploring, I thought you'd find it interesting.

Here's the link: [Market Intelligence Link]

No rush on any decisions — the best investments are made with clarity, not urgency. I'm here whenever you're ready to continue the conversation.

[Your Name]`,
    tone: 'Value-first re-engagement, zero pressure',
    icon: RefreshCw,
    color: 'text-chart-5',
    bgColor: 'bg-chart-5/10',
    tips: [
      'Lead with value (market insight), not a "just checking in" — that\'s lazy and forgettable',
      'Link to actual content on the platform — drives them back without asking directly',
      '"Clarity, not urgency" is a trust-building phrase — it signals you\'re on their side',
      'If still no response after this, wait 30 days. Some investors have long decision cycles.',
    ],
    doNot: 'Don\'t send "Hi, just following up!" with no value — it signals desperation and wastes their time',
  },
  {
    id: 'post-close',
    category: 'After Deal Completion',
    trigger: 'Transaction successfully closed',
    timing: 'Within 24 hours of closing',
    message: `Hi [Name],

Congratulations on your acquisition of [Property Name]! It's been a pleasure working with you through this process.

A few things for your next steps:
• Your property investment report is available here: [Link]
• Our legal services partner can assist with [SHM/AJB processing] if needed
• I've added the property to your ASTRA Villa portfolio for ongoing value tracking

One request — would you be open to sharing a brief testimonial about your experience? A sentence or two would help other investors feel confident using the platform. Completely optional, of course.

Welcome to the ASTRA Villa investor community. I'll keep you posted on future opportunities that match your profile.

[Your Name]`,
    tone: 'Celebratory, service-oriented, referral-seeking',
    icon: CheckCircle2,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    tips: [
      'Celebrate their decision — buying property is emotional even for seasoned investors',
      'Provide immediate next-step value (legal, portfolio tracking) — don\'t disappear after commission',
      'Ask for testimonial while satisfaction is highest — timing is everything',
      'Mention "future opportunities" to plant the seed for repeat transactions',
    ],
    doNot: 'Don\'t make the testimonial ask feel transactional — frame it as helping other investors',
  },
];

const SEQUENCE_FLOW = [
  { stage: 'Inquiry', template: 'first-inquiry', timing: '< 2 hours' },
  { stage: 'Watchlist', template: 'watchlist-activity', timing: '24 hours' },
  { stage: 'Viewing', template: 'post-viewing', timing: '< 4 hours' },
  { stage: 'Negotiation', template: 'negotiation-nudge', timing: '72 hours' },
  { stage: 'Quiet', template: 'gone-quiet', timing: '7 days' },
  { stage: 'Closed', template: 'post-close', timing: '< 24 hours' },
];

export default function FollowUpTemplatesPage() {
  const [activeTab, setActiveTab] = useState('templates');
  const [expandedTemplate, setExpandedTemplate] = useState('first-inquiry');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Template copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-chart-4" />
                </div>
                Follow-Up Templates
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Investor communication templates for every pipeline stage</p>
            </div>
            <Badge variant="outline" className="text-xs px-3 py-1.5 border-chart-4/20 text-chart-4">
              <MessageSquare className="h-3 w-3 mr-1.5" />
              {TEMPLATES.length} templates
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-muted/30 border border-border">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="sequence">Communication Flow</TabsTrigger>
          </TabsList>

          {/* ═══ TEMPLATES ═══ */}
          <TabsContent value="templates" className="space-y-3">
            {TEMPLATES.map((t) => {
              const TIcon = t.icon;
              const isExpanded = expandedTemplate === t.id;
              return (
                <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Card
                    className={cn('border bg-card transition-all cursor-pointer', isExpanded ? 'border-border shadow-sm' : 'border-border/60 hover:border-border')}
                    onClick={() => setExpandedTemplate(isExpanded ? '' : t.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', t.bgColor)}>
                          <TIcon className={cn('h-5 w-5', t.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{t.category}</CardTitle>
                            <Badge variant="outline" className="text-[7px]">
                              <Clock className="h-2 w-2 mr-0.5" />{t.timing}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{t.trigger}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-[7px] flex-shrink-0', t.color)}>{t.tone}</Badge>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                        {/* Message */}
                        <div className="mt-2 mb-3 relative">
                          {t.subject && (
                            <div className="px-4 py-2 rounded-t-lg bg-muted/20 border border-border/30 border-b-0">
                              <p className="text-[9px] text-muted-foreground"><span className="font-bold">Subject:</span> {t.subject}</p>
                            </div>
                          )}
                          <div className={cn('p-4 border border-border/30 bg-muted/5', t.subject ? 'rounded-b-lg' : 'rounded-lg')}>
                            <pre className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap font-sans">{t.message}</pre>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 h-7 text-[9px] gap-1"
                            onClick={() => copyToClipboard(t.message)}
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </Button>
                        </div>

                        {/* Tips */}
                        <div className="mb-3">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Delivery Tips</p>
                          <div className="space-y-1">
                            {t.tips.map((tip, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-chart-2/5 border border-chart-2/10">
                                <CheckCircle2 className="h-3 w-3 text-chart-2 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-foreground">{tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Don't */}
                        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                          <AlertTriangle className="h-3 w-3 text-destructive flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[8px] font-bold text-destructive uppercase">Don't</p>
                            <p className="text-[10px] text-foreground">{t.doNot}</p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ═══ SEQUENCE ═══ */}
          <TabsContent value="sequence" className="space-y-4">
            <Card className="border border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  Communication Sequence
                </CardTitle>
                <p className="text-[10px] text-muted-foreground">Each template maps to a pipeline stage — send the right message at the right moment</p>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {SEQUENCE_FLOW.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[8px] w-20 justify-center flex-shrink-0">{s.stage}</Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground/30 flex-shrink-0" />
                      <button
                        className="flex-1 p-2.5 rounded-lg bg-muted/10 border border-border/20 text-left hover:bg-muted/20 transition-colors"
                        onClick={() => { setExpandedTemplate(s.template); setActiveTab('templates'); }}
                      >
                        <p className="text-[10px] font-bold text-foreground">{TEMPLATES.find(t => t.id === s.template)?.category}</p>
                      </button>
                      <Badge variant="outline" className="text-[7px] flex-shrink-0">
                        <Clock className="h-2 w-2 mr-0.5" />{s.timing}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/15 bg-primary/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Communication Philosophy</p>
                    <p className="text-[11px] text-muted-foreground">
                      Every message must pass the "would I appreciate receiving this?" test. If it adds value — data, insight, or a clear next step — send it. If it's just "checking in" with nothing to offer, wait until you have something worth saying. Respect earns trust. Trust earns deals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-chart-2/15 bg-chart-2/3">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-chart-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Personalization Rule</p>
                    <p className="text-[11px] text-muted-foreground">
                      Never send a template unchanged. Replace every [bracket] with real data. Add one sentence that proves you know this investor's specific situation. The template is a starting structure — the personalization is what makes it convert.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
