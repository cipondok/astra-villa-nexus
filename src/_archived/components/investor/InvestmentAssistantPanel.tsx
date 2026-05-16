import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInvestmentAssistant, AssistantMessage } from '@/hooks/useInvestmentAssistant';
import ReactMarkdown from 'react-markdown';
import {
  Bot, Send, Loader2, Trash2, TrendingUp, Building2,
  MapPin, Lightbulb, DollarSign, BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const QUICK_ACTIONS = [
  { icon: TrendingUp, text: 'Best investment deals in Jakarta', },
  { icon: Building2, text: 'Find villas in Bali under 5B with high ROI', },
  { icon: BarChart3, text: 'Market analysis for Surabaya apartments', },
  { icon: DollarSign, text: 'Compare rental yields across cities', },
];

export default function InvestmentAssistantPanel() {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearChat } = useInvestmentAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bot className="h-5 w-5 text-primary" />
              ASTRA Investment Assistant
            </CardTitle>
            <CardDescription>AI-powered property investment advisor</CardDescription>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 px-4 pb-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-3" ref={scrollRef}>
          <div className="space-y-4 pb-2">
            {messages.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 py-8">
                <div className="text-center space-y-2">
                  <Bot className="h-12 w-12 mx-auto text-primary/40" />
                  <p className="text-sm text-muted-foreground">
                    Tanyakan apa saja tentang investasi properti Indonesia
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((qa, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(qa.text); sendMessage(qa.text); }}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/40 transition-all text-left text-sm"
                    >
                      <qa.icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{qa.text}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center text-sm text-muted-foreground pl-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Analyzing...
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2 pt-3 border-t border-border/50 shrink-0">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about property investments..."
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 bg-muted/40 border-border/50 rounded-xl"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-9 w-9 rounded-xl shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MessageBubble({ message }: { message: AssistantMessage }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
        isUser
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : 'bg-muted/60 text-foreground rounded-bl-md'
      )}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Recommended Properties */}
        {!isUser && message.properties && message.properties.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Recommended Properties
            </p>
            <div className="grid gap-2">
              {message.properties.slice(0, 5).map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50">
                  <div className="w-10 h-10 rounded bg-muted overflow-hidden shrink-0">
                    {p.thumbnail_url ? (
                      <img src={p.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Building2 className="h-4 w-4 text-muted-foreground" /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{p.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{p.city}</span>
                      {p.price && <span>{formatIDR(p.price)}</span>}
                      {p.investment_score && <Badge variant="secondary" className="text-[9px] h-4">{p.investment_score}/100</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {!isUser && message.insights && message.insights.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Lightbulb className="h-3 w-3" /> Key Insights
            </p>
            {message.insights.map((insight: any, i: number) => (
              <div key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>
                <span>{typeof insight === 'string' ? insight : insight.text || insight.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
