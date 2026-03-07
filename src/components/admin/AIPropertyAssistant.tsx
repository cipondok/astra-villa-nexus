import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Bot, User, Send, Loader2, Home, MapPin, Bed, Bath, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  properties?: Property[];
  totalFound?: number;
}

interface Property {
  id: string;
  title: string;
  price: number;
  property_type: string;
  listing_type: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  cover_image?: string;
  investment_score?: number;
}

const AIPropertyAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: `👋 Hi! I'm **AstraBot**, your AI property assistant.\n\nI can help you:\n- 🔍 **Find properties** — *"Show me villas in Bali under 5B IDR"*\n- 📊 **Analyze investments** — *"Is this property a good investment?"*\n- 🏙️ **Market insights** — *"How's the Jakarta market?"*\n- ⚖️ **Compare options** — *"Compare Ubud vs Seminyak villas"*\n\nWhat are you looking for?`,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          mode: 'property_assistant',
          payload: {
            message: inputMessage,
            conversation_history: messages.slice(-10).map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content,
            })),
          },
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: 'AI Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.reply || "I couldn't process that. Could you rephrase?",
        timestamp: new Date(),
        properties: data.properties,
        totalFound: data.totalFound,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="mb-2 border-border/60 hover:border-primary/30 transition-colors">
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-sm leading-tight line-clamp-1">{property.title}</h4>
          <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
            {property.listing_type}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 font-medium text-foreground">
            {formatCurrency(property.price)}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.city}
          </div>
          <div className="flex items-center gap-1">
            <Bed className="h-3 w-3" />
            {property.bedrooms || '-'} bed
            <Bath className="h-3 w-3 ml-1" />
            {property.bathrooms || '-'} bath
          </div>
          {property.investment_score != null && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Score: {property.investment_score}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Property Assistant</h2>
        <p className="text-muted-foreground">
          Chat with AstraBot to find, analyze, and compare properties
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" />
            AstraBot
            <Badge variant="secondary" className="text-[10px]">AI</Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-2">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2.5 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {message.type === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className={`rounded-xl px-3.5 py-2.5 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  {message.properties && message.properties.length > 0 && (
                    <div className="ml-10 space-y-1.5">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5" />
                        {message.totalFound} found · showing top {message.properties.length}
                      </p>
                      {message.properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          <form onSubmit={handleSendMessage} className="p-3">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about properties, investments, or markets..."
                disabled={isLoading}
                className="flex-1 h-9 text-sm"
              />
              <Button type="submit" size="sm" disabled={isLoading || !inputMessage.trim()} className="h-9 px-3">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIPropertyAssistant;
