
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, MapPin, Handshake, Bot, ArrowUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import AIChatTrigger from "./AIChatTrigger";
import AIChatHeader from "./AIChatHeader";
import AIChatMessages from "./AIChatMessages";
import AIChatQuickActions from "./AIChatQuickActions";
import AIChatInput from "./AIChatInput";
import { Message, QuickAction } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveAIChatWidgetProps {
  propertyId?: string;
  onTourControl?: (action: string, target: string) => void;
}

const ResponsiveAIChatWidget = ({ propertyId, onTourControl }: ResponsiveAIChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const { scrollDirection, scrollY, isAtTop } = useScrollDirection();
  const [showWidget, setShowWidget] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll direction for auto-hide/show (10px threshold with 200ms delay for synchronized transitions)
  useEffect(() => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (isOpen) {
      setShowWidget(true); // Always show when chat is open
    } else {
      if (scrollDirection === 'down' && scrollY > 10) {
        // Delay hiding by 200ms to match animation duration
        hideTimeoutRef.current = setTimeout(() => {
          setShowWidget(false);
        }, 200);
      } else if (scrollDirection === 'up' || isAtTop) {
        setShowWidget(true); // Show immediately on scroll up or at top
      }
    }

    // Cleanup timeout on unmount
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [scrollDirection, scrollY, isAtTop, isOpen]);

  useEffect(() => {
    if (messages.length === 0) {
      // Send welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm your AI assistant. I can help you with:

🏠 Property recommendations and details
💰 Rental term negotiations
🏡 Neighborhood questions
🛠️ Vendor service bookings  
🎯 3D property tour guidance
💡 Real estate advice

${propertyId ? "I see you're viewing a property. Feel free to ask me anything about it!" : "How can I assist you today?"}`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [propertyId, messages.length]);

  const { toast } = useToast();

  const handleReaction = async (messageId: string, reaction: 'positive' | 'negative') => {
    // Find the message to get its content
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, reaction } : msg
      )
    );
    
    // Save to database
    try {
      const { error } = await supabase.from('ai_message_reactions').insert({
        message_id: messageId,
        conversation_id: conversationId,
        user_id: user?.id || null,
        message_content: message.content,
        reaction_type: reaction,
        property_id: propertyId || null,
        metadata: {
          timestamp: new Date().toISOString(),
          function_call: message.functionCall?.name || null
        }
      });

      if (error) {
        console.error('Failed to save reaction:', error);
      }
    } catch (error) {
      console.error('Error saving reaction:', error);
    }
    
    toast({
      title: reaction === 'positive' ? "Thanks for your feedback!" : "Thanks for letting us know",
      description: reaction === 'positive' 
        ? "Glad the response was helpful!" 
        : "We'll use this to improve our responses.",
      duration: 2000,
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Expand if minimized
    if (isMinimized) setIsMinimized(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const currentMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      const isNeighborhoodQuery = /neighborhood|area|around|walk to|safe at night|cafes nearby|near a|close to/i.test(currentMessage);
      const isNegotiationQuery = /negotiate|lower the price|deposit|rent|deal|offer|lease/i.test(currentMessage);
      
      let functionName: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: { [key: string]: any } = {
        message: currentMessage,
        conversationId
      };
      if (user?.id) body.userId = user.id;
      if (propertyId) body.propertyId = propertyId;

      if (isNegotiationQuery && propertyId) {
        functionName = 'rental-negotiator';
        body.conversationHistory = currentMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      } else if (isNeighborhoodQuery) {
        functionName = 'neighborhood-simulator';
      } else {
        functionName = 'ai-assistant';
      }

      console.log('Invoking edge function:', functionName, 'with body:', body);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.message) {
        console.error('Invalid response from edge function:', data);
        throw new Error('Invalid response from AI assistant');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        functionCall: data.functionCall
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.functionCall?.name === 'control_3d_tour' && onTourControl) {
        const args = JSON.parse(data.functionCall.arguments);
        onTourControl(args.action, args.target);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Speech recognition error');
    };

    recognition.start();
  };

  const quickActions: QuickAction[] = [
    { icon: Home, text: "Show properties", action: "I'm looking for properties to buy or rent" },
    { icon: Users, text: "Find vendors", action: "I need vendor services for property maintenance" },
    ...(propertyId
      ? [
          { icon: MapPin, text: "Tour property", action: "Give me a guided tour of this property" },
      { icon: Handshake, text: "Negotiate", action: "I'd like to negotiate the rental terms." }
        ]
      : [{ icon: MapPin, text: "Find properties", action: "Show me available properties" }]),
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll to top arrow - appears on scroll */}
      {!isAtTop && !isOpen && showWidget && (
        <div 
          className="fixed z-[10001] transform-gpu animate-fade-in"
          style={{ 
            bottom: 'calc(1rem + env(safe-area-inset-bottom))', 
            left: 'calc(1rem + env(safe-area-inset-left))',
            transition: 'all 200ms cubic-bezier(0.34, 1.8, 0.64, 1)'
          }}
        >
          <Button
            onClick={scrollToTop}
            className="h-14 w-14 md:h-12 md:w-12 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 shadow-xl hover:shadow-gray-500/40 hover:scale-110 border-2 border-white/30"
            style={{ transition: 'all 200ms cubic-bezier(0.34, 1.8, 0.64, 1)' }}
            size="icon"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6 md:h-5 md:w-5 text-white" />
          </Button>
        </div>
      )}

      {/* Chat trigger - Fixed position at bottom right corner with scroll behavior */}
      {!isOpen && (
        <div 
          className={cn(
            "fixed z-[10002] pointer-events-none transform-gpu",
            showWidget ? "translate-y-0 opacity-100 scale-100 rotate-0" : "translate-y-24 opacity-0 scale-90 rotate-[18deg]"
          )}
          style={{ 
            bottom: 'calc(1rem + env(safe-area-inset-bottom))', 
            right: 'calc(1rem + env(safe-area-inset-right))',
            transition: 'all 200ms cubic-bezier(0.34, 1.8, 0.64, 1)'
          }}
        >
          <div className="pointer-events-auto hover:scale-105 transition-transform duration-200">
            <div className={showWidget ? (isMobile ? "animate-subtle-pulse-mobile" : "animate-subtle-pulse") : ""}>
              <AIChatTrigger onOpen={() => { setIsOpen(true); setIsMinimized(false); setShowWidget(true); }} />
            </div>
          </div>
        </div>
      )}

      {/* Chat window - Fixed position at bottom right corner */}
      {isOpen && (
        <div 
          className={cn(
            "fixed z-[10002] transition-all duration-300 ease-in-out pointer-events-none",
            isMinimized ? "w-[280px]" : isMobile ? "w-full" : "w-[420px]",
            isMinimized ? "h-auto" : isMobile ? "h-[95vh]" : "h-[680px] max-h-[calc(100vh-48px)]",
            isMobile ? "left-0 right-0" : ""
          )}
          style={
            isMobile
              ? { bottom: 0 }
              : { bottom: 'calc(1rem + env(safe-area-inset-bottom))', right: 'calc(1rem + env(safe-area-inset-right))' }
          }
        >
          <Card className="pointer-events-auto h-full w-full flex flex-col border-2 border-primary/30 overflow-hidden bg-background/98 backdrop-blur-xl shadow-2xl rounded-2xl">
            {/* Header with Close and Minimize */}
            <div className="flex items-center justify-between p-3 border-b border-primary/20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? '□' : '−'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Chat content - only show when not minimized */}
            {!isMinimized && (
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                  <div className={`${isMobile ? 'p-3' : 'p-4'} space-y-3`}>
                    <AIChatMessages
                      messages={messages}
                      isLoading={isLoading}
                      messagesEndRef={messagesEndRef}
                      onReaction={handleReaction}
                    />
                  </div>
                </ScrollArea>

                {messages.length <= 1 && (
                  <div className={`${isMobile ? 'px-3 pb-2' : 'px-4 pb-2'}`}>
                    <AIChatQuickActions
                      quickActions={quickActions}
                      onActionClick={setMessage}
                    />
                  </div>
                )}

                <div className={cn(
                  "border-t border-primary/10 bg-background/50",
                  isMobile ? 'p-3' : 'p-4'
                )}>
                  <AIChatInput
                    message={message}
                    setMessage={setMessage}
                    onSendMessage={handleSendMessage}
                    onVoiceInput={handleVoiceInput}
                    isLoading={isLoading}
                    isListening={isListening}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default ResponsiveAIChatWidget;
