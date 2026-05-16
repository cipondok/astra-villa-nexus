import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PropertyContext {
  title?: string;
  propertyType?: string;
  location?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  landArea?: number;
  description?: string;
  amenities?: string[];
  images?: number;
  listingType?: 'sale' | 'rent';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
}

type ListingAction = 
  | 'generate_description' 
  | 'suggest_price' 
  | 'analyze_photos' 
  | 'get_keywords' 
  | 'check_errors' 
  | 'predict_success' 
  | 'chat';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/property-listing-assistant`;

export const usePropertyListingAssistant = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [propertyContext, setPropertyContext] = useState<PropertyContext>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // Add initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'initial',
        role: 'assistant',
        content: `👋 Hi! I'm ASTRA, your AI property listing assistant.

I can help you create a compelling listing that attracts buyers. Here's what I can do:

• **Generate Description** - Create engaging property descriptions
• **Suggest Price** - Get optimal pricing based on market data
• **Photo Tips** - Learn which photos will attract more views
• **SEO Keywords** - Optimize for search visibility
• **Check Listing** - Find and fix issues before publishing
• **Predict Success** - See your listing's conversion probability

What would you like to start with?`,
        timestamp: new Date()
      }]);
    }
  }, []);

  const sendMessage = useCallback(async (
    userMessage: string, 
    action: ListingAction = 'chat'
  ) => {
    if (!userMessage.trim() && action === 'chat') return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
      action
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          })),
          propertyContext,
          action
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Please wait a moment before sending another message.",
            variant: "destructive"
          });
          return;
        }
        
        if (response.status === 402) {
          toast({
            title: "Credits Depleted",
            description: "AI credits have been used up. Please contact support.",
            variant: "destructive"
          });
          return;
        }
        
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantMsgId = `assistant-${Date.now()}`;
      let textBuffer = '';

      // Add placeholder assistant message
      setMessages(prev => [...prev, {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            // Incomplete JSON, put back and wait
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Process any remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || !raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => 
                prev.map(m => 
                  m.id === assistantMsgId 
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch { /* ignore */ }
        }
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
        return;
      }
      
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
      
      // Remove the failed assistant message placeholder
      setMessages(prev => prev.filter(m => m.role !== 'assistant' || m.content !== ''));
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, propertyContext, toast]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const updatePropertyContext = useCallback((updates: Partial<PropertyContext>) => {
    setPropertyContext(prev => ({ ...prev, ...updates }));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'initial',
      role: 'assistant',
      content: `👋 Chat cleared! I'm ready to help you create another amazing listing.

What would you like to work on?`,
      timestamp: new Date()
    }]);
  }, []);

  // Quick action helpers
  const generateDescription = useCallback(() => {
    sendMessage('Generate a compelling description for my property', 'generate_description');
  }, [sendMessage]);

  const suggestPrice = useCallback(() => {
    sendMessage('What price should I list my property for?', 'suggest_price');
  }, [sendMessage]);

  const getPhotoTips = useCallback(() => {
    sendMessage('What photos should I take for my listing?', 'analyze_photos');
  }, [sendMessage]);

  const getKeywords = useCallback(() => {
    sendMessage('Suggest SEO keywords for my listing', 'get_keywords');
  }, [sendMessage]);

  const checkErrors = useCallback(() => {
    sendMessage('Check my listing for issues', 'check_errors');
  }, [sendMessage]);

  const predictSuccess = useCallback(() => {
    sendMessage('What is my listing success probability?', 'predict_success');
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    propertyContext,
    sendMessage,
    cancelRequest,
    updatePropertyContext,
    clearChat,
    // Quick actions
    generateDescription,
    suggestPrice,
    getPhotoTips,
    getKeywords,
    checkErrors,
    predictSuccess
  };
};

export default usePropertyListingAssistant;
