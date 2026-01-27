import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  FileText, 
  DollarSign, 
  Camera, 
  Hash, 
  AlertCircle, 
  TrendingUp,
  Loader2,
  Trash2,
  ChevronDown,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import { usePropertyListingAssistant, PropertyContext } from '@/hooks/usePropertyListingAssistant';
import { cn } from '@/lib/utils';

interface PropertyListingAssistantProps {
  initialContext?: PropertyContext;
  onContextUpdate?: (context: PropertyContext) => void;
  variant?: 'embedded' | 'floating' | 'fullscreen';
  className?: string;
}

const QUICK_ACTIONS = [
  { id: 'description', label: 'Description', icon: FileText, color: 'text-blue-500' },
  { id: 'price', label: 'Pricing', icon: DollarSign, color: 'text-green-500' },
  { id: 'photos', label: 'Photos', icon: Camera, color: 'text-purple-500' },
  { id: 'keywords', label: 'Keywords', icon: Hash, color: 'text-orange-500' },
  { id: 'check', label: 'Check', icon: AlertCircle, color: 'text-red-500' },
  { id: 'success', label: 'Success %', icon: TrendingUp, color: 'text-emerald-500' },
];

const SUGGESTED_QUESTIONS = [
  "How can I make my description more compelling?",
  "What makes a listing stand out?",
  "How many photos should I upload?",
  "What's the best time to list a property?",
  "How do I price competitively?",
  "What amenities should I highlight?",
];

const PropertyListingAssistant = ({
  initialContext,
  onContextUpdate,
  variant = 'embedded',
  className
}: PropertyListingAssistantProps) => {
  const {
    messages,
    isLoading,
    propertyContext,
    sendMessage,
    cancelRequest,
    updatePropertyContext,
    clearChat,
    generateDescription,
    suggestPrice,
    getPhotoTips,
    getKeywords,
    checkErrors,
    predictSuccess
  } = usePropertyListingAssistant();

  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize context if provided
  useEffect(() => {
    if (initialContext) {
      updatePropertyContext(initialContext);
    }
  }, [initialContext, updatePropertyContext]);

  // Notify parent of context changes
  useEffect(() => {
    onContextUpdate?.(propertyContext);
  }, [propertyContext, onContextUpdate]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
    setShowSuggestions(false);
  };

  const handleQuickAction = (actionId: string) => {
    setShowSuggestions(false);
    switch (actionId) {
      case 'description': generateDescription(); break;
      case 'price': suggestPrice(); break;
      case 'photos': getPhotoTips(); break;
      case 'keywords': getKeywords(); break;
      case 'check': checkErrors(); break;
      case 'success': predictSuccess(); break;
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question);
    setShowSuggestions(false);
  };

  if (variant === 'floating' && isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
      </motion.button>
    );
  }

  const containerClasses = cn(
    "flex flex-col bg-background border rounded-xl overflow-hidden",
    variant === 'floating' && "fixed bottom-20 right-4 z-50 w-[400px] h-[600px] shadow-2xl",
    variant === 'fullscreen' && "fixed inset-4 z-50 shadow-2xl",
    variant === 'embedded' && "h-[600px]",
    className
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={containerClasses}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold text-sm flex items-center gap-1">
              ASTRA Assistant
              <Sparkles className="h-3 w-3 text-yellow-500" />
            </div>
            <div className="text-[10px] text-muted-foreground">Property Listing Expert</div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear chat</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {variant === 'floating' && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
        {QUICK_ACTIONS.map(action => (
          <TooltipProvider key={action.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuickAction(action.id)}
                  disabled={isLoading}
                  className="h-8 px-2 flex-shrink-0"
                >
                  <action.icon className={cn("h-3.5 w-3.5 mr-1", action.color)} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{action.label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Property Context Bar */}
      {(propertyContext.title || propertyContext.propertyType || propertyContext.location) && (
        <div className="px-3 py-2 bg-muted/30 border-b">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px]">
              {propertyContext.propertyType || 'Property'}
            </Badge>
            {propertyContext.location && (
              <Badge variant="outline" className="text-[10px]">{propertyContext.location}</Badge>
            )}
            {propertyContext.bedrooms && (
              <Badge variant="outline" className="text-[10px]">{propertyContext.bedrooms} BR</Badge>
            )}
            {propertyContext.area && (
              <Badge variant="outline" className="text-[10px]">{propertyContext.area} m²</Badge>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex gap-2",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                )}
                
                <div className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2",
                  message.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                )}>
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown>{message.content || '...'}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">ASTRA is thinking...</span>
              <Button variant="ghost" size="sm" onClick={cancelRequest} className="h-6 text-xs">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Suggestions */}
      {showSuggestions && messages.length <= 2 && (
        <div className="px-3 pb-2">
          <div className="text-[10px] text-muted-foreground mb-1.5">Suggested questions:</div>
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleSuggestedQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your listing..."
            disabled={isLoading}
            className="flex-1 h-10"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="h-10 w-10 p-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="text-[9px] text-muted-foreground text-center mt-1.5">
          Powered by ASTRA AI • Your responses help improve listings
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyListingAssistant;
