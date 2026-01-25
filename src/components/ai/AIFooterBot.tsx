
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getEdgeFunctionUserMessage } from "@/lib/supabaseFunctionErrors";
import { isAiTemporarilyDisabled, markAiTemporarilyDisabledFromError } from "@/lib/aiAvailability";
import { 
  Bot, 
  Send, 
  X, 
  Sparkles,
  Building2,
  Home,
  Wrench,
  HelpCircle
} from "lucide-react";

const AIFooterBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{id: string, message: string, response: string, timestamp: Date}>>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch chatbot logo from system settings (branding category)
  const { data: chatbotLogoUrl } = useQuery({
    queryKey: ['branding', 'chatbotLogo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('category', 'branding')
        .eq('key', 'chatbotLogo')
        .maybeSingle();
      
      if (error || !data?.value) return null;
      const value = typeof data.value === 'string' ? data.value : null;
      return value && value.trim() !== '' ? value : null;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const aiChatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      if (isAiTemporarilyDisabled()) {
        throw Object.assign(new Error('AI temporarily disabled'), { status: 402 });
      }

      const body: any = {
        message: userMessage,
        conversationId: sessionId
      };
      if (user?.id) body.userId = user.id;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body
      });

      if (error) throw error;
      return data.message;
    },
    onSuccess: (aiResponse) => {
      const newChat = {
        id: Date.now().toString(),
        message,
        response: aiResponse,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, newChat]);
      setMessage("");
    },
    onError: (err) => {
      markAiTemporarilyDisabledFromError(err);
      const msg = getEdgeFunctionUserMessage(err);
      toast({ title: msg.title, description: msg.description, variant: msg.variant });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    aiChatMutation.mutate(message);
  };

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('ai_welcome_shown');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        setIsOpen(true);
        setChatHistory([{
          id: 'welcome',
          message: 'Hi there!',
          response: "👋 Welcome to Astra Villa! I'm your AI assistant powered by advanced AI.\n\nI can help you with:\n🏠 Property recommendations\n🛠️ Vendor services\n🎯 3D property tours\n💡 Real estate advice\n\nHow can I assist you today?",
          timestamp: new Date()
        }]);
        localStorage.setItem('ai_welcome_shown', 'true');
      }, 3000);
    }
  }, []);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] pointer-events-auto">
      {/* AI Bot Trigger Button - Gold & Navy Theme */}
      {!isOpen && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-300 animate-pulse" />
          <Button
            onClick={() => setIsOpen(true)}
            className="relative h-14 w-14 rounded-full bg-gradient-to-br from-primary via-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl transition-all duration-300 hover:scale-110 border border-primary/30"
            size="icon"
            aria-label="Open AI Assistant"
          >
            <Bot className="h-6 w-6 text-primary-foreground" />
          </Button>
          <div className="absolute -top-2 -right-2 pointer-events-none">
            <Badge className="bg-gradient-to-r from-accent to-primary text-primary-foreground shadow-lg border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
        </div>
      )}

      {/* AI Chat Window - Luxury Glass Design */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[400px] z-[9999]">
          <Card className="modal-surface shadow-2xl h-full md:h-auto md:max-h-[85vh] flex flex-col md:rounded-2xl overflow-hidden border-primary/20">
            {/* Professional Header with Logo */}
            <CardHeader className="relative bg-gradient-to-r from-[hsl(220,60%,15%)] via-[hsl(220,55%,18%)] to-[hsl(220,50%,20%)] text-white p-0 sticky top-0 z-10 overflow-hidden">
              {/* Decorative gold accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 left-4 w-20 h-20 rounded-full bg-primary/30 blur-2xl" />
                <div className="absolute bottom-2 right-8 w-16 h-16 rounded-full bg-accent/20 blur-xl" />
              </div>
              
              <div className="relative px-4 py-4">
                <div className="flex items-center justify-between">
                  {/* Logo & Brand */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {chatbotLogoUrl ? (
                        <img 
                          src={chatbotLogoUrl} 
                          alt="Astra Villa" 
                          className="w-10 h-10 rounded-xl object-contain shadow-lg"
                          style={{ background: 'transparent' }}
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-sm opacity-60" />
                          <div className="relative w-10 h-10 bg-gradient-to-br from-primary via-primary to-accent rounded-xl flex items-center justify-center shadow-lg border border-primary/30">
                            <Building2 className="h-5 w-5 text-primary-foreground" />
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-bold tracking-wide bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        ASTRA VILLA
                      </h3>
                      <p className="text-[10px] text-white/70 font-medium tracking-widest uppercase">
                        AI Assistant
                      </p>
                    </div>
                  </div>
                  
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 transition-colors rounded-full h-8 w-8"
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Status indicator */}
                <div className="flex items-center gap-2 mt-3 px-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50" />
                    <span className="text-xs text-white/80">Online</span>
                  </div>
                  <span className="text-white/40">•</span>
                  <span className="text-xs text-white/60">24/7 Support</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 bg-background flex-1 flex flex-col min-h-0">
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-muted/20 to-muted/40">
                {chatHistory.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    <div className="text-center space-y-3">
                      <div className="relative mx-auto w-fit">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-lg" />
                        <div className="relative w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center border border-primary/20">
                          <Bot className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <p className="font-medium">How can I help you today?</p>
                      <p className="text-xs text-muted-foreground">Ask about properties, vendors, or services</p>
                    </div>
                  </div>
                )}
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="space-y-3 animate-fade-in">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-br from-primary to-accent text-primary-foreground p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md">
                        <p className="text-sm">{chat.message}</p>
                      </div>
                    </div>
                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="glass-card p-3 rounded-2xl rounded-tl-sm max-w-[85%] shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-primary to-accent rounded-md flex items-center justify-center">
                            <Bot className="h-3 w-3 text-primary-foreground" />
                          </div>
                          <span className="text-xs font-semibold text-primary">Astra AI</span>
                        </div>
                        <div className="text-sm whitespace-pre-line leading-relaxed text-foreground">{chat.response}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {aiChatMutation.isPending && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="glass-card p-3 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-primary to-accent rounded-md flex items-center justify-center">
                          <Bot className="h-3 w-3 text-primary-foreground animate-pulse" />
                        </div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4 sticky bottom-0">
                <div className="flex gap-2 mb-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyPress={(e) => e.key === 'Enter' && !aiChatMutation.isPending && handleSendMessage()}
                    disabled={aiChatMutation.isPending}
                    className="flex-1 bg-muted/50 border-border/50 focus:border-primary/50 rounded-xl"
                    aria-label="Chat message input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={aiChatMutation.isPending || !message.trim()}
                    size="icon"
                    className="bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all shrink-0 rounded-xl shadow-md"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { icon: Home, text: "Properties" },
                    { icon: Wrench, text: "Vendors" },
                    { icon: HelpCircle, text: "Help" }
                  ].map((suggestion) => (
                    <Button
                      key={suggestion.text}
                      variant="outline"
                      size="sm"
                      className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all rounded-lg gap-1.5"
                      onClick={() => setMessage(suggestion.text === "Properties" ? "Show me properties" : suggestion.text === "Vendors" ? "Find vendors" : "How does this work?")}
                      disabled={aiChatMutation.isPending}
                    >
                      <suggestion.icon className="h-3 w-3" />
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIFooterBot;
