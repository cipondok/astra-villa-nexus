import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  MessageSquare, Send, DollarSign, TrendingUp, Clock, CheckCheck,
  Paperclip, Zap, AlertTriangle, ArrowUp, ArrowDown, User, Shield
} from "lucide-react";

const messages = [
  { id: 1, sender: "buyer", name: "Ahmad R.", text: "I'm very interested in this villa. Would you consider Rp 4.0B?", time: "10:24 AM", read: true },
  { id: 2, sender: "seller", name: "Ibu Sari", text: "Thank you for your interest. Our asking price is Rp 4.2B which reflects recent renovations.", time: "10:31 AM", read: true },
  { id: 3, sender: "agent", name: "Agent Lisa", text: "I can confirm the renovation added significant value. Perhaps we can find middle ground?", time: "10:35 AM", read: true },
  { id: 4, sender: "buyer", name: "Ahmad R.", text: "I understand. How about Rp 4.1B with a 30-day closing timeline?", time: "10:42 AM", read: false },
];

const templates = [
  "I'd like to make a revised offer of...",
  "Can we schedule a second viewing to discuss?",
  "I'm ready to proceed at the agreed price.",
  "Could you provide the latest property documentation?",
];

const senderColor = (s: string) =>
  s === "buyer" ? "bg-primary/10 border-primary/20" :
  s === "seller" ? "bg-chart-1/10 border-chart-1/20" :
  "bg-chart-2/10 border-chart-2/20";

const senderTag = (s: string) =>
  s === "buyer" ? "bg-primary/15 text-primary" :
  s === "seller" ? "bg-chart-1/15 text-chart-1" :
  "bg-chart-2/15 text-chart-2";

const NegotiationChatInterface: React.FC = () => {
  const [msg, setMsg] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Negotiation Chat
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Deal-specific communication hub</p>
        </div>
        <Badge className="bg-chart-3/15 text-chart-3 border-chart-3/30 text-xs animate-pulse">
          <Zap className="h-3 w-3 mr-1" /> Active Negotiation
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Active Chats", value: "18" },
          { label: "Avg Response", value: "12m" },
          { label: "Resolution Rate", value: "72%" },
          { label: "Price Gap", value: "4.8%" },
          { label: "Rounds Avg", value: "2.4" },
          { label: "Close Prob.", value: "78%" },
        ].map(m => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-2 text-center">
              <div className="text-sm font-bold text-foreground">{m.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chat Area */}
        <div className="md:col-span-2 space-y-3">
          {/* Urgency Banner */}
          <Card className="border-chart-3/30 bg-chart-3/5">
            <CardContent className="p-2.5 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-chart-3 flex-shrink-0" />
              <span className="text-[10px] text-foreground font-medium">High closing probability window — buyer shows strong intent signals</span>
              <Badge className="bg-chart-1/15 text-chart-1 text-[8px] ml-auto">78% Close</Badge>
            </CardContent>
          </Card>

          {/* Price Gap Mini Chart */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">Price Gap Visualization</span>
                <Badge variant="secondary" className="text-[9px]">Gap: 2.4%</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-center flex-1">
                  <div className="text-[9px] text-muted-foreground">Buyer Offer</div>
                  <div className="text-sm font-bold text-primary">Rp 4.1B</div>
                </div>
                <div className="flex-1">
                  <Progress value={97.6} className="h-2" />
                  <div className="text-center text-[8px] text-chart-1 mt-0.5">97.6% of asking</div>
                </div>
                <div className="text-center flex-1">
                  <div className="text-[9px] text-muted-foreground">Asking Price</div>
                  <div className="text-sm font-bold text-chart-1">Rp 4.2B</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Modern Villa Seminyak — Deal #D-447</CardTitle>
                <Badge className="bg-chart-3/15 text-chart-3 text-[8px]">Negotiation</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[320px] overflow-y-auto">
              {messages.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`p-2.5 rounded-lg border ${senderColor(m.sender)} ${m.sender === "buyer" ? "ml-0 mr-8" : "ml-8 mr-0"}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-foreground">{m.name}</span>
                    <Badge className={`${senderTag(m.sender)} text-[7px]`}>{m.sender}</Badge>
                    <span className="text-[8px] text-muted-foreground ml-auto flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />{m.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground">{m.text}</p>
                  {m.read && <CheckCheck className="h-3 w-3 text-primary ml-auto mt-1" />}
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Input */}
          <Card className="border-border/50">
            <CardContent className="p-2.5">
              <div className="flex items-center gap-2 mb-2">
                <Button size="sm" variant="outline" className="h-7 text-[9px] gap-1">
                  <ArrowUp className="h-3 w-3 text-chart-1" /> +Rp 50M
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[9px] gap-1">
                  <ArrowDown className="h-3 w-3 text-destructive" /> -Rp 50M
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-[9px] gap-1">
                  <Paperclip className="h-3 w-3" /> Attach
                </Button>
              </div>
              <div className="flex gap-2">
                <Input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type your message..." className="text-sm" />
                <Button size="sm" className="h-9"><Send className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" /> Quick Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {templates.map((t, i) => (
                <Button key={i} variant="outline" size="sm" className="w-full justify-start h-auto py-1.5 text-[10px] text-left"
                  onClick={() => setMsg(t)}>{t}</Button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <Shield className="h-4 w-4 text-primary mb-1" />
              <div className="text-xs font-bold text-foreground">Negotiation Status</div>
              <div className="space-y-1.5 mt-2">
                {["Initial Offer", "Counter Offer", "Revised Offer", "Final Agreement"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border-2 ${i <= 2 ? "border-chart-1 bg-chart-1" : "border-border"}`} />
                    <span className={`text-[10px] ${i <= 2 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3">
              <TrendingUp className="h-4 w-4 text-chart-1 mb-1" />
              <div className="text-xs font-bold text-foreground">AI Insights</div>
              <div className="space-y-1 mt-2 text-[9px] text-muted-foreground">
                <p>• Buyer response time is decreasing — strong intent</p>
                <p>• Price gap narrowed 60% in 2 rounds</p>
                <p>• Similar deals closed at Rp 4.08–4.12B range</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NegotiationChatInterface;
