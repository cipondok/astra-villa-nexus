import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import { useNegotiationAgent, DealContext } from "@/hooks/useNegotiationAgent";
import {
  MessageSquare, Send, Trash2, Target, TrendingUp,
  AlertTriangle, Scale, Zap, Bot, User, Handshake
} from "lucide-react";

const QUICK_PROMPTS = [
  { label: "Offer Range", icon: Target, prompt: "Berikan recommended offer range untuk properti ini berdasarkan data pasar." },
  { label: "Counter Strategy", icon: Scale, prompt: "Suggest counter-offer strategy jika seller menolak offer pertama." },
  { label: "Close Probability", icon: TrendingUp, prompt: "Berapa deal closure probability saat ini? Apa yang bisa meningkatkannya?" },
  { label: "Risk Alert", icon: AlertTriangle, prompt: "Identifikasi negotiation risks dan red flags untuk deal ini." },
  { label: "Urgency Script", icon: Zap, prompt: "Draft urgency messaging script untuk mendorong buyer decision." },
];

const SAMPLE_CONTEXT: DealContext = {
  property_title: "Villa Sunset Seminyak",
  listing_price: 8_500_000_000,
  estimated_fmv: 7_800_000_000,
  days_on_market: 45,
  demand_score: 72,
  liquidity_score: 65,
  deal_stage: "negotiation",
  buyer_urgency: "moderate",
  seller_flexibility: "moderate",
};

export default function NegotiationAgentPanel() {
  const { messages, isStreaming, sendMessage, clearChat } = useNegotiationAgent();
  const [input, setInput] = useState("");
  const [dealContext, setDealContext] = useState<DealContext>(SAMPLE_CONTEXT);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim(), dealContext);
    setInput("");
  };

  const fmtIDR = (n?: number) =>
    n ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n) : "-";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Handshake className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI Negotiation Agent</h2>
            <p className="text-sm text-muted-foreground">Autonomous deal negotiation assistant with real-time market intelligence</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Deal Context Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" /> Deal Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Property</span>
              <p className="font-medium">{dealContext.property_title || "-"}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground text-xs">Listing Price</span>
                <p className="font-semibold text-sm">{fmtIDR(dealContext.listing_price)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Est. FMV</span>
                <p className="font-semibold text-sm">{fmtIDR(dealContext.estimated_fmv)}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground text-xs">Days on Market</span>
                <p className="font-semibold">{dealContext.days_on_market ?? "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Deal Stage</span>
                <Badge variant="secondary" className="text-xs mt-0.5">{dealContext.deal_stage}</Badge>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground text-xs">Demand Score</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${dealContext.demand_score ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-medium">{dealContext.demand_score}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Liquidity</span>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${dealContext.liquidity_score ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-medium">{dealContext.liquidity_score}</span>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground text-xs">Buyer Urgency</span>
                <Badge variant="outline" className="text-xs capitalize mt-0.5">{dealContext.buyer_urgency}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Seller Flex</span>
                <Badge variant="outline" className="text-xs capitalize mt-0.5">{dealContext.seller_flexibility}</Badge>
              </div>
            </div>

            {/* Price Gap Indicator */}
            {dealContext.listing_price && dealContext.estimated_fmv && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground text-xs">Price vs FMV Gap</span>
                  {(() => {
                    const gap = ((dealContext.listing_price - dealContext.estimated_fmv) / dealContext.estimated_fmv) * 100;
                    const isOverpriced = gap > 0;
                    return (
                      <p className={`font-bold text-sm ${isOverpriced ? "text-amber-600" : "text-emerald-600"}`}>
                        {isOverpriced ? "+" : ""}{gap.toFixed(1)}% {isOverpriced ? "above" : "below"} FMV
                      </p>
                    );
                  })()}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Chat Panel */}
        <Card className="lg:col-span-2 flex flex-col" style={{ height: "600px" }}>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Negotiation Chat
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearChat} className="h-7 px-2 text-xs">
              <Trash2 className="h-3 w-3 mr-1" /> Clear
            </Button>
          </CardHeader>

          {/* Quick Prompts */}
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp) => (
              <Button
                key={qp.label}
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                disabled={isStreaming}
                onClick={() => sendMessage(qp.prompt, dealContext)}
              >
                <qp.icon className="h-3 w-3" />
                {qp.label}
              </Button>
            ))}
          </div>

          <Separator />

          {/* Messages */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="space-y-4 py-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Bot className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">AI Negotiation Agent Ready</p>
                  <p className="text-xs mt-1">Ask for offer strategies, counter-offer tactics, or risk analysis</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-xl px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Input */}
          <div className="p-3 flex gap-2">
            <Input
              placeholder="Ask negotiation strategy, offer range, risk analysis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isStreaming}
              className="text-sm"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isStreaming} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Need Handshake import
import { Handshake } from "lucide-react";
