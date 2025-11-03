import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { useScrollLock } from "@/hooks/useScrollLock";
import AIChatHeader from "./AIChatHeader";
import AIChatMessages from "./AIChatMessages";
import AIChatInput from "./AIChatInput";
import AIChatQuickActions from "./AIChatQuickActions";
import { Message, QuickAction } from "./types";
import { Building2, MapPin, DollarSign, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FloatingChatWidgetProps {
  propertyId?: string;
  onTourControl?: (action: string, target: string) => void;
}

const FloatingChatWidget = ({ propertyId, onTourControl }: FloatingChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { scrollDirection, isScrolled } = useScrollDirection();
  const { toast } = useToast();
  
  useScrollLock(isOpen);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const quickActions: QuickAction[] = [
    { icon: Building2, text: "Property details", action: "Tell me about this property" },
    { icon: MapPin, text: "Neighborhood info", action: "What's the neighborhood like?" },
    { icon: DollarSign, text: "Negotiate price", action: "I'd like to discuss the price" },
    { icon: Calendar, text: "Schedule tour", action: "Schedule a property tour" },
  ];

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    // Create placeholder assistant message
    const assistantId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const CHAT_URL = `https://zymrajuuyyfkzdmptebl.supabase.co/functions/v1/ai-assistant`;
      
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          message: messageText,
          conversationId,
          propertyId 
        }),
      });

      if (resp.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (resp.status === 402) {
        throw new Error('Payment required. Please add credits.');
      }

      if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;
      let assistantContent = '';

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch { /* ignore */ }
        }
      }

    } catch (error) {
      console.error('AI Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      // Remove the empty assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsLoading(false);
    }
  };

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
    
    // Show feedback toast
    toast({
      title: reaction === 'positive' ? "Thanks for your feedback!" : "Thanks for letting us know",
      description: reaction === 'positive' 
        ? "Glad the response was helpful!" 
        : "We'll use this to improve our responses.",
      duration: 2000,
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shouldShowWidget = scrollDirection !== 'down' || isOpen;

  return (
    <>
      {/* Floating Chat Widget */}
      <AnimatePresence mode="wait">
        {shouldShowWidget && (
          <motion.div
            key="chat-widget"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ 
              duration: scrollDirection === 'down' ? 0.2 : 0.3,
              ease: "easeOut"
            }}
            className="fixed bottom-6 right-6 z-[9999] pointer-events-auto"
          >
            {!isOpen ? (
              // Collapsed State - Floating Button
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <Button
                  onClick={() => setIsOpen(true)}
                  className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-800 hover:from-blue-600 hover:via-purple-700 hover:to-blue-900 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 border-2 border-white/30 backdrop-blur-sm"
                  size="icon"
                  aria-label="Open AI Assistant"
                >
                  <Bot className="h-7 w-7 text-white drop-shadow-lg" />
                </Button>
                
                {/* AI Badge */}
                <div className="absolute -top-1 -right-1 z-10">
                  <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg border border-white/40 text-[10px] px-1.5 py-0.5">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                    AI
                  </Badge>
                </div>
                
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping"></div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl scale-150 animate-pulse"></div>
              </motion.div>
            ) : (
              // Expanded State - Chat Window
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
                style={{ maxWidth: 'calc(100vw - 3rem)' }}
              >
                {/* Header */}
                <AIChatHeader onClose={() => setIsOpen(false)} />

                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                  <AIChatMessages 
                    messages={messages} 
                    isLoading={isLoading} 
                    messagesEndRef={messagesEndRef}
                    onReaction={handleReaction}
                  />
                </div>

                {/* Quick Actions */}
                {messages.length === 0 && (
                  <AIChatQuickActions
                    quickActions={quickActions}
                    onActionClick={handleSendMessage}
                  />
                )}

                {/* Input */}
                <AIChatInput
                  message={message}
                  setMessage={setMessage}
                  isLoading={isLoading}
                  isListening={isListening}
                  onSendMessage={() => handleSendMessage(message)}
                  onVoiceInput={() => setIsListening(!isListening)}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {isScrolled && !isOpen && shouldShowWidget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-[9998] pointer-events-auto"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={scrollToTop}
                className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm"
                size="icon"
                aria-label="Scroll to top"
              >
                <ArrowUp className="h-6 w-6 text-white drop-shadow-lg" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatWidget;
