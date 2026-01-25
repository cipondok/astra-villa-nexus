import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getEdgeFunctionUserMessage } from "@/lib/supabaseFunctionErrors";
import { isAiTemporarilyDisabled, markAiTemporarilyDisabledFromError } from "@/lib/aiAvailability";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ForeignInvestmentChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hello! I'm your Foreign Investment Assistant for Indonesian property.

I can help you with:
📋 Investment eligibility questions
🏠 Property ownership types (Hak Pakai, SHMRS, PT PMA)
📄 Required documentation
💰 Financial requirements and costs
🌍 Country eligibility status
⚖️ Legal regulations and restrictions
📊 Step-by-step process guidance

Ask me anything about foreign property investment in Indonesia!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const quickQuestions = [
    "Can I buy property as a foreigner?",
    "What is the minimum investment?",
    "Do I need a residence permit?",
    "What's the difference between Hak Pakai and Hak Milik?",
    "Can I get a mortgage as a foreigner?",
    "Which documents do I need?"
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (isAiTemporarilyDisabled()) {
        throw Object.assign(new Error('AI temporarily disabled'), { status: 402 });
      }

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: `Context: User is asking about foreign property investment in Indonesia. 
          
Question: ${input}

Please provide detailed, accurate information about Indonesian property investment regulations, requirements, and processes for foreign investors. Include relevant laws, requirements, and practical advice.`,
          conversationContext: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      markAiTemporarilyDisabledFromError(error);
      const msg = getEdgeFunctionUserMessage(error);
      toast({ title: msg.title, description: msg.description, variant: msg.variant });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="border-border/50 shadow-xl bg-gradient-to-br from-card to-accent/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl -z-10" />
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Bot className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                💬 AI Investment Assistant
                <Badge className="gap-1 bg-gradient-to-r from-accent to-primary text-primary-foreground border-0">
                  <Sparkles className="h-3 w-3" />
                  AI Powered
                </Badge>
              </CardTitle>
              <CardDescription className="text-base">I'm here to help with your investment questions 24/7! 🌟</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="h-6 w-6 text-accent" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                        : 'bg-card border border-border/50'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="h-6 w-6 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start animate-fade-in">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center shadow-sm">
                    <Bot className="h-6 w-6 text-accent" />
                  </div>
                  <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Thinking... 🤔</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {messages.length <= 1 && (
            <div className="p-4 border-t bg-gradient-to-br from-muted/50 to-transparent">
              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                💡 Quick Questions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left justify-start h-auto py-3 px-4 text-xs hover:bg-primary/5 hover:border-primary/30 transition-all"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type your question here... ✨"
                disabled={isLoading}
                className="flex-1 h-12 border-primary/20 focus:border-primary/50"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="shrink-0 h-12 w-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              💡 AI responses are for informational purposes. Consult with our legal professionals for specific advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
