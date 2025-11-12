
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, MapPin, Handshake, Bot, Volume2, VolumeX, Settings, ArrowUp, Camera, Menu, X, Pin, PinOff, Maximize2, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AIChatMessages from "./AIChatMessages";
import AIChatQuickActions from "./AIChatQuickActions";
import AIChatInput from "./AIChatInput";
import TypingIndicator from "./TypingIndicator";
import ChatButton, { ChatButtonVariant } from "./ChatButton";
import { Message, QuickAction } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatKeyboardShortcuts } from "@/hooks/useChatKeyboardShortcuts";
import { useSoundNotification } from "@/hooks/useSoundNotification";
import { useChatPersistence } from "@/hooks/useChatPersistence";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResponsiveAIChatWidgetProps {
  propertyId?: string;
  onTourControl?: (action: string, target: string) => void;
  buttonVariant?: ChatButtonVariant;
  onScrollToTop?: () => void;
  onImageSearch?: () => void;
  showScrollButton?: boolean;
}

const ResponsiveAIChatWidget = ({ 
  propertyId, 
  onTourControl,
  buttonVariant = "pulse",
  onScrollToTop,
  onImageSearch,
  showScrollButton = false
}: ResponsiveAIChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [viewMode, setViewMode] = useState<'mini' | 'full'>(() => {
    const saved = localStorage.getItem('chatbot-view-mode');
    return (saved as 'mini' | 'full') || 'full';
  });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Position and size state with defaults
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 420, height: 680 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [snapIndicator, setSnapIndicator] = useState<'left' | 'right' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);
  const [snapSensitivity, setSnapSensitivity] = useState<'tight' | 'normal' | 'loose'>('normal');
  const [showSettings, setShowSettings] = useState(false);
  const [hasSeenQuickActions, setHasSeenQuickActions] = useState(false);
  const [showQuickActionsHint, setShowQuickActionsHint] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [pinnedActions, setPinnedActions] = useState<Set<string>>(new Set());
  const [autoCollapseEnabled, setAutoCollapseEnabled] = useState(() => {
    const saved = localStorage.getItem('chatbot-auto-collapse');
    return saved === null ? true : saved === 'true';
  });
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [lastTapTime, setLastTapTime] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  
  // Sound notifications
  const { playNotification, isMuted, toggleMute } = useSoundNotification();
  
  // Chat persistence
  const { persistedMessages, persistedConversationId, saveChat, clearChat } = useChatPersistence(user?.id);

  // Load saved position, size, snap sensitivity, pinned actions, and check if user has seen quick actions
  useEffect(() => {
    if (!isMobile) {
      const savedPosition = localStorage.getItem('chatbot-position');
      const savedSize = localStorage.getItem('chatbot-size');
      const savedSensitivity = localStorage.getItem('chatbot-snap-sensitivity') as 'tight' | 'normal' | 'loose' | null;
      const savedPinnedActions = localStorage.getItem('chatbot-pinned-actions');
      
      if (savedPosition) {
        const pos = JSON.parse(savedPosition);
        // Validate position is within viewport
        const maxX = window.innerWidth - 320; // min width
        const maxY = window.innerHeight - 200; // min visible height
        setPosition({
          x: Math.max(0, Math.min(pos.x, maxX)),
          y: Math.max(0, Math.min(pos.y, maxY))
        });
      } else {
        // Default position: bottom-right with margins
        setPosition({
          x: window.innerWidth - 420 - 24,
          y: window.innerHeight - 680 - 24
        });
      }
      
      if (savedSize) {
        const s = JSON.parse(savedSize);
        setSize({
          width: Math.max(320, Math.min(s.width, 600)),
          height: Math.max(400, Math.min(s.height, window.innerHeight - 48))
        });
      }
      
      if (savedSensitivity) {
        setSnapSensitivity(savedSensitivity);
      }

      if (savedPinnedActions) {
        setPinnedActions(new Set(JSON.parse(savedPinnedActions)));
      }
    }

    // Check if user has seen quick actions hint
    const seenQuickActions = localStorage.getItem('chatbot-seen-quick-actions');
    const seenTooltip = localStorage.getItem('chatbot-seen-tooltip');
    
    if (!seenQuickActions) {
      // Show quick actions after 3 seconds for first-time users
      const timer = setTimeout(() => {
        setShowQuickActionsHint(true);
        // Hide after 4 seconds
        setTimeout(() => {
          setShowQuickActionsHint(false);
          localStorage.setItem('chatbot-seen-quick-actions', 'true');
          setHasSeenQuickActions(true);
        }, 4000);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenQuickActions(true);
    }

    if (!seenTooltip) {
      setShowTooltip(true);
    }
  }, [isMobile]);

  // Handle tooltip on first hover
  const handleFirstHover = () => {
    if (showTooltip) {
      setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem('chatbot-seen-tooltip', 'true');
      }, 3000);
    }
  };

  // Toggle pin action
  const togglePinAction = (actionId: string) => {
    const newPinned = new Set(pinnedActions);
    if (newPinned.has(actionId)) {
      newPinned.delete(actionId);
    } else {
      newPinned.add(actionId);
    }
    setPinnedActions(newPinned);
    localStorage.setItem('chatbot-pinned-actions', JSON.stringify(Array.from(newPinned)));
  };

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => {
      const newValue = prev === 'mini' ? 'full' : 'mini';
      localStorage.setItem('chatbot-view-mode', newValue);
      
      // Haptic feedback on mobile
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50); // Short vibration (50ms)
      }
      
      // Reset activity timer when manually toggling
      setLastActivityTime(Date.now());
      
      return newValue;
    });
  };

  // Toggle auto-collapse setting
  const toggleAutoCollapse = () => {
    setAutoCollapseEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('chatbot-auto-collapse', String(newValue));
      // Reset activity timer when toggling setting
      setLastActivityTime(Date.now());
      return newValue;
    });
  };

  // Handle double-tap on mobile
  const handleHeaderTap = () => {
    if (!isMobile) return;
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTapTime;
    
    // Detect double-tap (within 300ms)
    if (timeDiff < 300) {
      toggleViewMode();
      setLastTapTime(0); // Reset to prevent triple-tap
    } else {
      setLastTapTime(currentTime);
    }
  };

  // Auto-collapse timer
  useEffect(() => {
    if (!autoCollapseEnabled || !isOpen || viewMode === 'mini' || isMinimized) {
      return;
    }

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivityTime;
      
      // Auto-collapse after 30 seconds (30000ms) of inactivity
      if (inactiveTime >= 30000) {
        setViewMode('mini');
        localStorage.setItem('chatbot-view-mode', 'mini');
        
        // Show toast notification
        toast({
          title: "Chat minimized",
          description: "Chat auto-collapsed due to inactivity",
          duration: 2000,
        });
      }
    };

    // Check every 5 seconds
    const intervalId = setInterval(checkInactivity, 5000);
    
    return () => clearInterval(intervalId);
  }, [autoCollapseEnabled, isOpen, viewMode, isMinimized, lastActivityTime, toast]);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load persisted chat history on mount
  useEffect(() => {
    if (persistedMessages.length > 0) {
      setMessages(persistedMessages);
      setConversationId(persistedConversationId);
    } else if (messages.length === 0) {
      // Send welcome message only if no persisted history
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
  }, [persistedMessages, persistedConversationId, propertyId]);

  // Save chat to localStorage whenever messages or conversationId changes
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      saveChat(messages, conversationId);
    }
  }, [messages, conversationId, saveChat]);

  // Track unread messages and play sound notification
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.id !== 'welcome') {
        setUnreadCount(prev => prev + 1);
        // Play sound notification when AI responds while chat is closed
        playNotification();
      }
    }
  }, [messages, isOpen, playNotification]);

  // Clear unread count when chat opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Handle open
  const handleOpen = () => {
    setIsClosing(false);
    setIsOpen(true);
    setIsMinimized(false);
  };

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setIsMinimized(false);
    }, 300);
  };

  // Keyboard shortcuts: Ctrl+K to open, Esc to close
  useChatKeyboardShortcuts({
    isOpen,
    onOpen: handleOpen,
    onClose: handleClose,
  });

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

    // Reset activity timer on message send
    setLastActivityTime(Date.now());

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

  // Get snap thresholds based on sensitivity
  const getSnapThresholds = () => {
    switch (snapSensitivity) {
      case 'tight':
        return { edge: 30, corner: 50 };
      case 'normal':
        return { edge: 50, corner: 80 };
      case 'loose':
        return { edge: 80, corner: 120 };
      default:
        return { edge: 50, corner: 80 };
    }
  };

  // Reset to default position (bottom-right)
  const resetToDefaultPosition = () => {
    const defaultPosition = {
      x: window.innerWidth - size.width - 24,
      y: window.innerHeight - size.height - 24
    };
    setPosition(defaultPosition);
    localStorage.setItem('chatbot-position', JSON.stringify(defaultPosition));
  };

  // Double-click handler for header
  const handleHeaderDoubleClick = () => {
    if (!isMobile && !isMinimized) {
      resetToDefaultPosition();
    }
  };

  // Drag handlers with snap-to-edge and corner functionality
  const handleDragStart = (e: React.MouseEvent) => {
    if (isMobile || isMinimized) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Constrain to viewport
    const maxX = window.innerWidth - size.width;
    const maxY = window.innerHeight - size.height;
    
    const constrainedPosition = {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    };
    
    setPosition(constrainedPosition);
    
    // Detect snap zones and show indicators
    const { edge: snapThreshold, corner: cornerThreshold } = getSnapThresholds();
    
    let indicator: typeof snapIndicator = null;
    
    // Check for corner snapping first (higher priority)
    if (constrainedPosition.x < cornerThreshold && constrainedPosition.y < cornerThreshold) {
      indicator = 'top-left';
    } else if (constrainedPosition.x > window.innerWidth - size.width - cornerThreshold && constrainedPosition.y < cornerThreshold) {
      indicator = 'top-right';
    } else if (constrainedPosition.x < cornerThreshold && constrainedPosition.y > window.innerHeight - size.height - cornerThreshold) {
      indicator = 'bottom-left';
    } else if (constrainedPosition.x > window.innerWidth - size.width - cornerThreshold && constrainedPosition.y > window.innerHeight - size.height - cornerThreshold) {
      indicator = 'bottom-right';
    }
    // Then check for edge snapping
    else if (constrainedPosition.x < snapThreshold) {
      indicator = 'left';
    } else if (constrainedPosition.x > window.innerWidth - size.width - snapThreshold) {
      indicator = 'right';
    } else if (constrainedPosition.y < snapThreshold) {
      indicator = 'top';
    } else if (constrainedPosition.y > window.innerHeight - size.height - snapThreshold) {
      indicator = 'bottom';
    }
    
    setSnapIndicator(indicator);
  };

  const handleDragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      setSnapIndicator(null);
      
      // Snap-to-edge and corner functionality
      const { edge: snapThreshold, corner: cornerThreshold } = getSnapThresholds();
      const edgeMargin = 24; // margin from edge when snapped
      
      let snappedPosition = { ...position };
      
      // Check for corner snapping first (higher priority)
      if (position.x < cornerThreshold && position.y < cornerThreshold) {
        // Snap to top-left corner
        snappedPosition = { x: edgeMargin, y: edgeMargin };
      } else if (position.x > window.innerWidth - size.width - cornerThreshold && position.y < cornerThreshold) {
        // Snap to top-right corner
        snappedPosition = { x: window.innerWidth - size.width - edgeMargin, y: edgeMargin };
      } else if (position.x < cornerThreshold && position.y > window.innerHeight - size.height - cornerThreshold) {
        // Snap to bottom-left corner
        snappedPosition = { x: edgeMargin, y: window.innerHeight - size.height - edgeMargin };
      } else if (position.x > window.innerWidth - size.width - cornerThreshold && position.y > window.innerHeight - size.height - cornerThreshold) {
        // Snap to bottom-right corner
        snappedPosition = { x: window.innerWidth - size.width - edgeMargin, y: window.innerHeight - size.height - edgeMargin };
      }
      // Then check for edge snapping
      else {
        if (position.x < snapThreshold) {
          snappedPosition.x = edgeMargin;
        } else if (position.x > window.innerWidth - size.width - snapThreshold) {
          snappedPosition.x = window.innerWidth - size.width - edgeMargin;
        }
        
        if (position.y < snapThreshold) {
          snappedPosition.y = edgeMargin;
        } else if (position.y > window.innerHeight - size.height - snapThreshold) {
          snappedPosition.y = window.innerHeight - size.height - edgeMargin;
        }
      }
      
      // Apply snapped position with animation
      setPosition(snappedPosition);
      
      // Save position to localStorage
      localStorage.setItem('chatbot-position', JSON.stringify(snappedPosition));
    }
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMobile || isMinimized) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(320, Math.min(600, resizeStart.width + deltaX));
    const newHeight = Math.max(400, Math.min(window.innerHeight - 48, resizeStart.height + deltaY));
    
    setSize({ width: newWidth, height: newHeight });
  };

  const handleResizeEnd = () => {
    if (isResizing) {
      setIsResizing(false);
      // Save size to localStorage
      localStorage.setItem('chatbot-size', JSON.stringify(size));
    }
  };

  // Add global mouse event listeners for drag and resize
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, dragStart, position, size]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStart]);

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

  // Calculate chat window position and size
  const getChatWindowStyle = () => {
    if (isMobile) {
      return { 
        bottom: '0', 
        left: '0', 
        right: '0',
        top: 'auto',
        height: '90vh',
        width: '100%'
      };
    }
    
    // Desktop: use saved position and size, with mini mode adjustments
    const miniModeWidth = 380;
    const miniModeHeight = 450;
    
    return { 
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: viewMode === 'mini' ? `${miniModeWidth}px` : `${size.width}px`,
      height: isMinimized ? 'auto' : viewMode === 'mini' ? `${miniModeHeight}px` : `${size.height}px`
    };
  };

  return (
    <>
      {/* Floating chat button with quick actions on hover - draggable and always visible */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] group" onMouseEnter={handleFirstHover}>
          {/* Pulsing glow hint animation for first-time users */}
          {!hasSeenQuickActions && !showQuickActionsHint && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-pulse blur-xl" />
          )}
          
          {/* First-time tooltip */}
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-16 right-0 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap"
            >
              Hover for quick actions
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-primary" />
            </motion.div>
          )}
          
          {/* Quick Action Items - Show on hover, hint, or if pinned */}
          <div className={cn(
            "absolute bottom-20 right-0 transition-all duration-300 flex flex-col gap-3",
            showQuickActionsHint || pinnedActions.size > 0
              ? "opacity-100 pointer-events-auto" 
              : "opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
          )}>
            {/* Scroll to Top */}
            {showScrollButton && onScrollToTop && (pinnedActions.has('scroll-top') || showQuickActionsHint || !hasSeenQuickActions) && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-300 group/action">
                <span className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border text-xs font-medium opacity-0 group-hover/action:opacity-100 group-hover:opacity-100 transition-opacity">
                  Scroll to Top
                </span>
                <div className="relative">
                  <Button
                    onClick={onScrollToTop}
                    className="h-12 w-12 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-2xl border-2 border-white/20"
                    size="icon"
                  >
                    <ArrowUp className="h-5 w-5 text-white" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinAction('scroll-top');
                    }}
                    className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-background border shadow-sm opacity-0 group-hover/action:opacity-100 transition-opacity"
                    size="icon"
                    variant="ghost"
                  >
                    {pinnedActions.has('scroll-top') ? (
                      <PinOff className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Image Search */}
            {onImageSearch && (pinnedActions.has('image-search') || showQuickActionsHint || !hasSeenQuickActions) && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-300 delay-75 group/action">
                <span className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border text-xs font-medium opacity-0 group-hover/action:opacity-100 group-hover:opacity-100 transition-opacity">
                  Image Search
                </span>
                <div className="relative">
                  <Button
                    onClick={onImageSearch}
                    className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-2xl border-2 border-white/20"
                    size="icon"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinAction('image-search');
                    }}
                    className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-background border shadow-sm opacity-0 group-hover/action:opacity-100 transition-opacity"
                    size="icon"
                    variant="ghost"
                  >
                    {pinnedActions.has('image-search') ? (
                      <PinOff className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Main Chat Button */}
          <ChatButton 
            onClick={handleOpen}
            unreadCount={unreadCount}
            variant={buttonVariant}
            onPositionReset={resetToDefaultPosition}
            onOpenSettings={() => setShowSettings(true)}
            pinnedActions={pinnedActions}
            onTogglePin={togglePinAction}
          />
        </div>
      )}

      {/* Chat window - positioned fixed with backdrop */}
      {isOpen && (
        <>
          {/* Snap indicators */}
          {!isMobile && snapIndicator && (
            <>
              {/* Edge indicators */}
              {snapIndicator === 'left' && (
                <div className="fixed left-0 top-0 bottom-0 w-1 bg-blue-500/60 shadow-lg shadow-blue-500/50 z-[9997] animate-pulse" />
              )}
              {snapIndicator === 'right' && (
                <div className="fixed right-0 top-0 bottom-0 w-1 bg-blue-500/60 shadow-lg shadow-blue-500/50 z-[9997] animate-pulse" />
              )}
              {snapIndicator === 'top' && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-blue-500/60 shadow-lg shadow-blue-500/50 z-[9997] animate-pulse" />
              )}
              {snapIndicator === 'bottom' && (
                <div className="fixed bottom-0 left-0 right-0 h-1 bg-blue-500/60 shadow-lg shadow-blue-500/50 z-[9997] animate-pulse" />
              )}
              
              {/* Corner indicators */}
              {snapIndicator === 'top-left' && (
                <div className="fixed top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50 z-[9997] animate-pulse rounded-br-lg" />
              )}
              {snapIndicator === 'top-right' && (
                <div className="fixed top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50 z-[9997] animate-pulse rounded-bl-lg" />
              )}
              {snapIndicator === 'bottom-left' && (
                <div className="fixed bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50 z-[9997] animate-pulse rounded-tr-lg" />
              )}
              {snapIndicator === 'bottom-right' && (
                <div className="fixed bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50 z-[9997] animate-pulse rounded-tl-lg" />
              )}
            </>
          )}
          
          {/* Backdrop overlay for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
              onClick={handleClose}
            />
          )}
          
          <motion.div 
            ref={chatWindowRef}
            className={cn(
              "fixed z-[9999]",
              // Animations for open/close only
              isMobile 
                ? isClosing 
                  ? "animate-slide-out-bottom" 
                  : "animate-slide-in-bottom"
                : isClosing 
                  ? "animate-fade-out animate-scale-out" 
                  : "animate-fade-in animate-scale-in",
              // Shadow and overflow
              "shadow-2xl",
              "overflow-visible",
              isDragging && "cursor-move",
              isResizing && "cursor-nwse-resize"
            )}
            style={getChatWindowStyle()}
            animate={{
              width: isMobile ? '100%' : viewMode === 'mini' ? 380 : size.width,
              height: isMobile ? '90vh' : isMinimized ? 'auto' : viewMode === 'mini' ? 450 : size.height
            }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1] // cubic-bezier for smooth transition
            }}
            role="dialog"
            aria-label="AI Chat Assistant"
            aria-modal="true"
          >
          <Card className="h-full w-full flex flex-col border-2 border-primary/30 overflow-hidden bg-background/98 backdrop-blur-xl shadow-2xl rounded-2xl md:rounded-2xl max-h-full relative">
            {/* Header with Close, Minimize, and Sound Toggle - Draggable */}
            <div 
              className={cn(
                "flex items-center justify-between p-3 border-b border-primary/20 bg-gradient-to-r from-blue-600 to-purple-600 text-white",
                !isMobile && !isMinimized && "cursor-move select-none"
              )}
              onMouseDown={handleDragStart}
              onDoubleClick={handleHeaderDoubleClick}
              onClick={isMobile ? handleHeaderTap : undefined}
              title={isMobile ? "Double-tap to toggle view mode" : !isMobile ? "Double-click to reset position" : undefined}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold text-sm">AI Assistant</span>
                {viewMode === 'mini' && (
                  <span className="text-xs opacity-80 font-normal">
                    (Mini {messages.length > 3 ? `· 3 of ${messages.length}` : ''})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                {!isMobile && !isMinimized && (
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="relative"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleViewMode();
                      }}
                      aria-label={viewMode === 'mini' ? 'Expand to full view' : 'Switch to mini mode'}
                      title={viewMode === 'mini' ? 'Expand to full view' : 'Switch to mini mode'}
                    >
                      <motion.div
                        key={viewMode}
                        initial={{ rotate: 0, scale: 0.8 }}
                        animate={{ rotate: 360, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      >
                        {viewMode === 'mini' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                      </motion.div>
                    </Button>
                    {/* Hidden message count badge */}
                    {viewMode === 'mini' && messages.length > 3 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg"
                      >
                        {messages.length - 3}
                      </motion.span>
                    )}
                  </motion.div>
                )}
                {/* Settings */}
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettings(!showSettings);
                    }}
                    aria-label="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
                {/* Sound toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  aria-label={isMuted ? "Unmute notifications" : "Mute notifications"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                >
                  {isMinimized ? '□' : '−'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Settings panel - only show when settings is open */}
            {showSettings && !isMinimized && (
              <div className="p-4 border-b border-primary/10 bg-muted/50">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Snap Sensitivity</label>
                    <div className="flex gap-2">
                      <Button
                        variant={snapSensitivity === 'tight' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSnapSensitivity('tight');
                          localStorage.setItem('chatbot-snap-sensitivity', 'tight');
                        }}
                      >
                        Tight
                      </Button>
                      <Button
                        variant={snapSensitivity === 'normal' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSnapSensitivity('normal');
                          localStorage.setItem('chatbot-snap-sensitivity', 'normal');
                        }}
                      >
                        Normal
                      </Button>
                      <Button
                        variant={snapSensitivity === 'loose' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSnapSensitivity('loose');
                          localStorage.setItem('chatbot-snap-sensitivity', 'loose');
                        }}
                      >
                        Loose
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {snapSensitivity === 'tight' && 'Snap only when very close to edges (30px)'}
                      {snapSensitivity === 'normal' && 'Balanced snap distance (50px)'}
                      {snapSensitivity === 'loose' && 'Snap from further away (80px)'}
                    </p>
                  </div>
                  
                  {/* Auto-collapse setting */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Auto-Collapse</label>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {autoCollapseEnabled 
                          ? 'Chat minimizes after 30s of inactivity' 
                          : 'Manual control only'}
                      </span>
                      <Button
                        variant={autoCollapseEnabled ? 'default' : 'outline'}
                        size="sm"
                        onClick={toggleAutoCollapse}
                      >
                        {autoCollapseEnabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={resetToDefaultPosition}
                  >
                    Reset to Default Position
                  </Button>
                </div>
              </div>
            )}

            {/* Chat content - only show when not minimized */}
            {!isMinimized && (
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                  <motion.div 
                    className={`${isMobile ? 'p-3' : 'p-4'} space-y-3`}
                    key={viewMode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AIChatMessages
                      messages={viewMode === 'mini' ? messages.slice(-3) : messages}
                      isLoading={false}
                      messagesEndRef={messagesEndRef}
                      onReaction={handleReaction}
                    />
                    {/* Typing indicator with animation */}
                    <AnimatePresence>
                      {isLoading && <TypingIndicator />}
                    </AnimatePresence>
                  </motion.div>
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
            
            {/* Resize handle - bottom-right corner */}
            {!isMobile && !isMinimized && (
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-10 group"
                onMouseDown={handleResizeStart}
              >
                <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-primary/40 group-hover:border-primary transition-colors" />
              </div>
            )}
          </Card>
        </motion.div>
        </>
      )}
    </>
  );
};

export default ResponsiveAIChatWidget;
