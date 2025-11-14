
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, MapPin, Handshake, Bot, Volume2, VolumeX, Settings, ArrowUp, Camera, Menu, X as XIcon, Pin, PinOff, Maximize2, Minimize2, Minus, Square, Clock, Download, Upload, Music, Trash2, RotateCcw, Cloud, CheckCircle2, XCircle, Loader2, Search, Phone, Calendar, MessageSquare, HelpCircle, Star } from "lucide-react";
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
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { useCustomSounds, SoundEvent } from "@/hooks/useCustomSounds";
import { useChatbotPreferencesSync } from "@/hooks/useChatbotPreferencesSync";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { ChatbotConflictDialog } from "./ChatbotConflictDialog";
import { ChatbotWelcomeDialog } from "./ChatbotWelcomeDialog";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
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
  const [autoCollapseDuration, setAutoCollapseDuration] = useState<number>(() => {
    const saved = localStorage.getItem('chatbot-auto-collapse-duration');
    return saved ? parseInt(saved) : 30000; // Default 30 seconds in milliseconds
  });
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showCollapseWarning, setShowCollapseWarning] = useState(false);
  const [collapseCountdown, setCollapseCountdown] = useState(0);
  const [isAutoCollapsePaused, setIsAutoCollapsePaused] = useState(false);
  const [collapseProgress, setCollapseProgress] = useState(100);
  const [unreadCountWhileMinimized, setUnreadCountWhileMinimized] = useState(0);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [typingStatus, setTypingStatus] = useState("AI is thinking");
  const [showStarredMessages, setShowStarredMessages] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

  const quickActions: QuickAction[] = [
    { icon: Search, text: "Search properties", action: "I want to search for properties" },
    { icon: Phone, text: "Contact agent", action: "I need to contact an agent" },
    { icon: Calendar, text: "Schedule viewing", action: "I want to schedule a property viewing" },
    { icon: Home, text: "Property details", action: "Tell me about property features" },
    { icon: MessageSquare, text: "Ask question", action: "I have a question about..." },
    { icon: HelpCircle, text: "Get help", action: "How can you help me?" },
  ];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  const { toast } = useToast();
  
  // Sound notifications
  const { playNotification, isMuted, toggleMute } = useSoundNotification();
  
  // Custom sounds
  const { uploadSound, removeSound, playCustomSound, hasCustomSound, getCustomSound, resetAllSounds, customSounds } = useCustomSounds();
  
  // Haptic feedback
  const haptic = useHapticFeedback();
  
  // Voice recording
  const { isRecording, recordingDuration, startRecording, stopRecording, cancelRecording } = useVoiceRecorder();
  
  // Chat persistence
  const { persistedMessages, persistedConversationId, saveChat, clearChat } = useChatPersistence(user?.id);
  
  // Cloud sync for preferences
  const { isAuthenticated, isLoading: isSyncLoading, syncStatus, lastSyncTime, loadFromCloud, saveToCloud, deleteFromCloud } = useChatbotPreferencesSync();

  // Load preferences from cloud on auth (prioritize cloud over local)
  useEffect(() => {
    if (isSyncLoading) return;
    
    const loadPreferences = async () => {
      // Check if user has seen welcome dialog
      const hasSeenWelcome = localStorage.getItem('chatbot-seen-welcome');
      if (!hasSeenWelcome && !isMobile) {
        setShowWelcomeDialog(true);
        localStorage.setItem('chatbot-seen-welcome', 'true');
      }

      if (isAuthenticated) {
        // User is logged in - try to load from cloud first
        const cloudPrefs = await loadFromCloud();
        
        if (cloudPrefs) {
          // Check for conflicts with local storage
          const localPosition = localStorage.getItem('chatbot-position');
          const localSize = localStorage.getItem('chatbot-size');
          const localViewMode = localStorage.getItem('chatbot-view-mode');
          
          if (localPosition || localSize || localViewMode) {
            // Local preferences exist - check for conflicts
            const localPos = localPosition ? JSON.parse(localPosition) : null;
            const localSz = localSize ? JSON.parse(localSize) : null;
            const localVM = localViewMode || null;
            
            const hasConflict = 
              (localPos && (Math.abs(localPos.x - cloudPrefs.position.x) > 10 || Math.abs(localPos.y - cloudPrefs.position.y) > 10)) ||
              (localSz && (Math.abs(localSz.width - cloudPrefs.size.width) > 10 || Math.abs(localSz.height - cloudPrefs.size.height) > 10)) ||
              (localVM && localVM !== cloudPrefs.viewMode);
            
            if (hasConflict) {
              // Show conflict resolution dialog
              setConflictData({
                local: {
                  position: localPos || position,
                  size: localSz || size,
                  viewMode: localVM || viewMode,
                  lastModified: new Date(localStorage.getItem('chatbot-last-modified') || Date.now())
                },
                cloud: {
                  position: cloudPrefs.position,
                  size: cloudPrefs.size,
                  viewMode: cloudPrefs.viewMode,
                  lastModified: new Date()
                }
              });
              setShowConflictDialog(true);
              return; // Wait for user to resolve conflict
            }
          }
          
          // No conflict - apply cloud preferences
          if (!isMobile) {
            const maxX = window.innerWidth - 320;
            const maxY = window.innerHeight - 200;
            setPosition({
              x: Math.max(0, Math.min(cloudPrefs.position.x, maxX)),
              y: Math.max(0, Math.min(cloudPrefs.position.y, maxY))
            });
            setSize({
              width: Math.max(320, Math.min(cloudPrefs.size.width, 600)),
              height: Math.max(400, Math.min(cloudPrefs.size.height, window.innerHeight - 48))
            });
            setSnapSensitivity(cloudPrefs.snapSensitivity === 50 ? 'normal' : cloudPrefs.snapSensitivity === 30 ? 'tight' : 'loose');
            setPinnedActions(new Set(cloudPrefs.pinnedActions));
          }
          
          setViewMode(cloudPrefs.viewMode);
          setAutoCollapseEnabled(cloudPrefs.autoCollapseEnabled);
          setAutoCollapseDuration(cloudPrefs.autoCollapseDuration);
          if (cloudPrefs.soundMute !== isMuted) {
            toggleMute();
          }
          
          return; // Don't load from localStorage if cloud sync succeeded
        }
      }
      
      // Fall back to localStorage if not authenticated or no cloud data
      if (!isMobile) {
        const savedPosition = localStorage.getItem('chatbot-position');
        const savedSize = localStorage.getItem('chatbot-size');
        const savedSensitivity = localStorage.getItem('chatbot-snap-sensitivity') as 'tight' | 'normal' | 'loose' | null;
        const savedPinnedActions = localStorage.getItem('chatbot-pinned-actions');
        
        if (savedPosition) {
          const pos = JSON.parse(savedPosition);
          const maxX = window.innerWidth - 320;
          const maxY = window.innerHeight - 200;
          setPosition({
            x: Math.max(0, Math.min(pos.x, maxX)),
            y: Math.max(0, Math.min(pos.y, maxY))
          });
        } else {
          setPosition({
            x: window.innerWidth - 420 - 12,
            y: window.innerHeight - 680 - 12
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
    };

    loadPreferences();

    // Check if user has seen quick actions hint
    const seenQuickActions = localStorage.getItem('chatbot-seen-quick-actions');
    const seenTooltip = localStorage.getItem('chatbot-seen-tooltip');
    
    if (!seenQuickActions) {
      const timer = setTimeout(() => {
        setShowQuickActionsHint(true);
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
  }, [isMobile, isAuthenticated, isSyncLoading]);

  // Sync preferences to cloud when they change
  useEffect(() => {
    if (!isAuthenticated || isSyncLoading) return;
    
    const syncPreferences = async () => {
      const snapSensitivityValue = snapSensitivity === 'tight' ? 30 : snapSensitivity === 'loose' ? 70 : 50;
      
      await saveToCloud({
        position,
        size,
        snapSensitivity: snapSensitivityValue,
        pinnedActions: Array.from(pinnedActions),
        viewMode,
        autoCollapseEnabled,
        autoCollapseDuration,
        soundMute: isMuted,
        customSounds: customSounds || [],
      });
    };
    
    // Debounce sync to avoid excessive updates
    const timeoutId = setTimeout(syncPreferences, 1000);
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, position, size, snapSensitivity, pinnedActions, viewMode, autoCollapseEnabled, autoCollapseDuration, isMuted, customSounds, isSyncLoading, saveToCloud]);

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
      
      // Reset activity timer and progress when manually toggling
      setLastActivityTime(Date.now());
      setCollapseProgress(100);
      
      return newValue;
    });
  };

  // Toggle auto-collapse setting
  const toggleAutoCollapse = () => {
    setAutoCollapseEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('chatbot-auto-collapse', String(newValue));
      // Reset activity timer and progress when toggling setting
      setLastActivityTime(Date.now());
      setCollapseProgress(100);
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

  // Auto-collapse timer with countdown warning
  useEffect(() => {
    if (!autoCollapseEnabled || !isOpen || viewMode === 'mini' || isMinimized || autoCollapseDuration === 0 || isAutoCollapsePaused) {
      setShowCollapseWarning(false);
      setCollapseCountdown(0);
      return;
    }

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivityTime;
      const remainingTime = autoCollapseDuration - inactiveTime;
      
      // Calculate progress percentage (100% = full time, 0% = time's up)
      const progressPercentage = Math.max(0, Math.min(100, (remainingTime / autoCollapseDuration) * 100));
      setCollapseProgress(progressPercentage);
      
      // Show warning in the last 5 seconds
      const shouldShowWarning = remainingTime <= 5000 && remainingTime > 0;
      
      // Play sound notification and haptic when warning first appears
      if (shouldShowWarning && !showCollapseWarning) {
        // Play custom sound or default notification
        if (hasCustomSound('countdownWarning')) {
          playCustomSound('countdownWarning');
        } else {
          playNotification();
        }
        
        // Trigger haptic feedback
        haptic.onCountdownWarning();
      }
      
      if (shouldShowWarning) {
        setShowCollapseWarning(true);
        setCollapseCountdown(Math.ceil(remainingTime / 1000));
      } else {
        setShowCollapseWarning(false);
        setCollapseCountdown(0);
      }
      
      // Auto-collapse when time is up
      if (inactiveTime >= autoCollapseDuration) {
        setViewMode('mini');
        localStorage.setItem('chatbot-view-mode', 'mini');
        setShowCollapseWarning(false);
        setCollapseCountdown(0);
        setCollapseProgress(100);
        
        // Haptic feedback on collapse
        haptic.onCollapse();
        
        // Play custom sound if available
        if (hasCustomSound('collapse')) {
          playCustomSound('collapse');
        }
        
        // Show toast notification
        toast({
          title: "Chat minimized",
          description: "Chat auto-collapsed due to inactivity",
          duration: 2000,
        });
      }
    };

    // Check more frequently (every 500ms) for accurate countdown
    const intervalId = setInterval(checkInactivity, 500);
    
    return () => clearInterval(intervalId);
  }, [autoCollapseEnabled, autoCollapseDuration, isOpen, viewMode, isMinimized, lastActivityTime, isAutoCollapsePaused, toast, showCollapseWarning, playNotification, haptic, hasCustomSound, playCustomSound]);

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
        content: `✨ Welcome to Astra Villa!

I'm your personal property concierge, here to make your real estate journey effortless and enjoyable.

**I can help you with:**
🏠 Find your dream property with smart recommendations
💰 Negotiate the best rental terms for you
🏡 Discover neighborhoods and local insights
🛠️ Book trusted vendor services instantly
🎯 Experience properties through immersive 3D tours
💡 Get expert real estate advice

${propertyId ? "🌟 I see you're viewing a property! Ask me anything about it - pricing, features, neighborhood, or anything else!" : "What would you like to explore today? ✨"}`,
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

  // Track unread messages when minimized
  useEffect(() => {
    if (isMinimized && messages.length > 0) {
      // Increment unread count when new messages arrive while minimized
      setUnreadCountWhileMinimized(prev => prev + 1);
    } else if (!isMinimized) {
      // Reset unread count when expanded
      setUnreadCountWhileMinimized(0);
    }
  }, [messages.length, isMinimized]);

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

  // Scroll detection for scroll-to-top functionality
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = (scrollTop / docHeight) * 100;
          
          setScrollProgress(Math.min(progress, 100));
          setShowScrollToTop(scrollTop > 300);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle open
  const handleOpen = () => {
    setIsClosing(false);
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    
    // Reset activity timer on open
    setLastActivityTime(Date.now());
    setCollapseProgress(100);
    
    // Haptic feedback
    haptic.onOpen();
    
    // Play custom sound if available
    if (hasCustomSound('open')) {
      playCustomSound('open');
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    
    // Haptic feedback
    haptic.onClose();
    
    // Play custom sound if available
    if (hasCustomSound('close')) {
      playCustomSound('close');
    }
    
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

  // Keyboard shortcut for view mode toggle: Ctrl+M or Cmd+M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+M or Cmd+M to toggle view mode (only when chat is open)
      if ((e.ctrlKey || e.metaKey) && e.key === 'm' && isOpen && !isMinimized) {
        e.preventDefault();
        toggleViewMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized]);

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

  // Toggle star on message
  const toggleStarMessage = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
      )
    );
    
    const message = messages.find(m => m.id === messageId);
    const isStarred = !message?.starred;
    
    toast({
      title: isStarred ? "Message starred" : "Star removed",
      description: isStarred ? "Added to your starred messages" : "Removed from starred messages",
      duration: 2000,
    });
  };

  // Get starred messages
  const starredMessages = messages.filter(msg => msg.starred);

  // Get dynamic typing status based on message content
  const getTypingStatus = (messageContent: string) => {
    const lowerMessage = messageContent.toLowerCase();
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('looking for')) {
      return "Searching properties...";
    } else if (lowerMessage.includes('schedule') || lowerMessage.includes('viewing') || lowerMessage.includes('appointment')) {
      return "Checking availability...";
    } else if (lowerMessage.includes('negotiate') || lowerMessage.includes('price') || lowerMessage.includes('offer')) {
      return "Analyzing options...";
    } else if (lowerMessage.includes('neighborhood') || lowerMessage.includes('area') || lowerMessage.includes('location')) {
      return "Gathering location data...";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('agent')) {
      return "Finding agent info...";
    } else if (lowerMessage.includes('property') || lowerMessage.includes('details') || lowerMessage.includes('features')) {
      return "Loading property details...";
    } else {
      return "AI is thinking...";
    }
  };

  // Generate contextual smart replies based on AI message content
  const generateSmartReplies = (aiMessage: string): string[] => {
    const lowerMessage = aiMessage.toLowerCase();
    const replies: string[] = [];

    if (lowerMessage.includes('propert') || lowerMessage.includes('home') || lowerMessage.includes('house')) {
      replies.push("Show me properties", "More details", "Filter results");
    }
    
    if (lowerMessage.includes('view') || lowerMessage.includes('tour') || lowerMessage.includes('visit')) {
      replies.push("Schedule viewing", "Check availability");
    }
    
    if (lowerMessage.includes('agent') || lowerMessage.includes('contact')) {
      replies.push("Contact agent", "Get phone number");
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('budget')) {
      replies.push("Show price range", "Compare prices");
    }
    
    if (lowerMessage.includes('location') || lowerMessage.includes('area') || lowerMessage.includes('neighborhood')) {
      replies.push("See on map", "Nearby amenities");
    }

    // Default replies if no specific context matched
    if (replies.length === 0) {
      replies.push("Tell me more", "Show options", "I have a question");
    }

    // Limit to 4 suggestions max
    return replies.slice(0, 4);
  };

  const handleSendMessage = async (quickMessage?: string) => {
    const messageToSend = quickMessage || message;
    if (!messageToSend.trim() || isLoading) return;

    // Expand if minimized
    if (isMinimized) setIsMinimized(false);

    // Reset activity timer and progress on message send
    setLastActivityTime(Date.now());
    setCollapseProgress(100);
    
    // Hide quick actions after first message
    setShowQuickActions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const currentMessage = messageToSend;
    setMessage("");
    setIsLoading(true);
    
    // Set dynamic typing status
    setTypingStatus(getTypingStatus(currentMessage));

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
      
      // Generate smart replies based on AI response
      setSmartReplies(generateSmartReplies(data.message));
      
      // Haptic feedback for new AI message
      haptic.onNewMessage();
      
      // Play custom sound if available
      if (hasCustomSound('newMessage')) {
        playCustomSound('newMessage');
      }
      
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

  // Handle voice recording (record audio and transcribe)
  const handleStartVoiceRecording = async () => {
    try {
      await startRecording();
      toast({
        title: "Recording started",
        description: "Speak your message...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopVoiceRecording = async () => {
    try {
      setIsProcessingVoice(true);
      const audioBlob = await stopRecording();
      
      if (!audioBlob) {
        toast({
          title: "Recording Error",
          description: "Failed to capture audio",
          variant: "destructive",
        });
        setIsProcessingVoice(false);
        return;
      }

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) {
          toast({
            title: "Processing Error",
            description: "Failed to process audio",
            variant: "destructive",
          });
          setIsProcessingVoice(false);
          return;
        }

        try {
          // Send to transcription edge function
          const { data, error } = await supabase.functions.invoke('transcribe-audio', {
            body: { audio: base64Audio }
          });

          if (error) throw error;

          if (data?.text) {
            // Set the transcribed text as message and send it
            setMessage(data.text);
            
            // Automatically send the message
            setTimeout(() => {
              handleSendMessage(data.text);
            }, 100);

            toast({
              title: "Voice message received",
              description: "Message transcribed successfully",
            });
          } else {
            throw new Error('No transcription received');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Transcription Error",
            description: "Failed to transcribe audio. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessingVoice(false);
        }
      };
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsProcessingVoice(false);
    }
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
      x: window.innerWidth - size.width - 12,
      y: window.innerHeight - size.height - 12
    };
    setPosition(defaultPosition);
    localStorage.setItem('chatbot-position', JSON.stringify(defaultPosition));
    localStorage.setItem('chatbot-last-modified', new Date().toISOString());
  };

  // Reset all chatbot preferences to defaults
  const resetAllPreferences = async () => {
    // Clear all chatbot-related localStorage items
    localStorage.removeItem('chatbot-position');
    localStorage.removeItem('chatbot-size');
    localStorage.removeItem('chatbot-snap-sensitivity');
    localStorage.removeItem('chatbot-pinned-actions');
    localStorage.removeItem('chatbot-view-mode');
    localStorage.removeItem('chatbot-auto-collapse');
    localStorage.removeItem('chatbot-auto-collapse-duration');
    localStorage.removeItem('chatbot-seen-quick-actions');
    localStorage.removeItem('chatbot-seen-tooltip');
    
    // Reset custom sounds
    resetAllSounds();
    
    // Delete from cloud if authenticated
    if (isAuthenticated) {
      await deleteFromCloud();
    }
    
    // Reset state to defaults
    const defaultSize = { width: 420, height: 680 };
    const defaultPosition = {
      x: window.innerWidth - defaultSize.width - 12,
      y: window.innerHeight - defaultSize.height - 12
    };
    
    setPosition(defaultPosition);
    setSize(defaultSize);
    setSnapSensitivity('normal');
    setPinnedActions(new Set());
    setViewMode('full');
    setAutoCollapseEnabled(true);
    setAutoCollapseDuration(30000);
    setIsAutoCollapsePaused(false);
    setShowSettings(false);
    setHasSeenQuickActions(false);
    setShowTooltip(false);
    setLastActivityTime(Date.now());
    setCollapseProgress(100);
    
    toast({
      title: "Preferences reset",
      description: isAuthenticated 
        ? "All chatbot settings restored to defaults and cleared from cloud"
        : "All chatbot settings restored to defaults",
      duration: 3000,
    });
  };

  // Export preferences to JSON file
  const exportPreferences = () => {
    const preferences = {
      position,
      size,
      snapSensitivity,
      pinnedActions: Array.from(pinnedActions),
      viewMode,
      autoCollapseEnabled,
      autoCollapseDuration,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(preferences, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatbot-preferences-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Preferences exported",
      description: "Settings saved to file successfully",
      duration: 3000,
    });
  };

  // Import preferences from JSON file
  const importPreferences = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          
          // Validate imported data
          if (!imported.version) {
            throw new Error('Invalid preferences file');
          }

          // Apply imported preferences
          if (imported.position) {
            setPosition(imported.position);
            localStorage.setItem('chatbot-position', JSON.stringify(imported.position));
          }
          
          if (imported.size) {
            setSize(imported.size);
            localStorage.setItem('chatbot-size', JSON.stringify(imported.size));
          }
          
          if (imported.snapSensitivity) {
            setSnapSensitivity(imported.snapSensitivity);
            localStorage.setItem('chatbot-snap-sensitivity', imported.snapSensitivity);
          }
          
          if (imported.pinnedActions && Array.isArray(imported.pinnedActions)) {
            const newPinned = new Set<string>(imported.pinnedActions);
            setPinnedActions(newPinned);
            localStorage.setItem('chatbot-pinned-actions', JSON.stringify(Array.from(newPinned)));
          }
          
          if (imported.viewMode) {
            setViewMode(imported.viewMode);
            localStorage.setItem('chatbot-view-mode', imported.viewMode);
          }
          
          if (typeof imported.autoCollapseEnabled === 'boolean') {
            setAutoCollapseEnabled(imported.autoCollapseEnabled);
            localStorage.setItem('chatbot-auto-collapse', String(imported.autoCollapseEnabled));
          }
          
          if (imported.autoCollapseDuration) {
            setAutoCollapseDuration(imported.autoCollapseDuration);
            localStorage.setItem('chatbot-auto-collapse-duration', String(imported.autoCollapseDuration));
          }
          
          // Reset activity timer
          setLastActivityTime(Date.now());
          setCollapseProgress(100);
          setIsAutoCollapsePaused(false);
          
          // Update last modified timestamp
          localStorage.setItem('chatbot-last-modified', new Date().toISOString());

          toast({
            title: "Preferences imported",
            description: "Settings restored successfully",
            duration: 3000,
          });
        } catch (error) {
          console.error('Import error:', error);
          toast({
            title: "Import failed",
            description: "Invalid or corrupted preferences file",
            variant: "destructive",
            duration: 3000,
          });
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
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
      const edgeMargin = 12; // margin from edge when snapped
      
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
      
      // Save position to localStorage with timestamp
      localStorage.setItem('chatbot-position', JSON.stringify(snappedPosition));
      localStorage.setItem('chatbot-last-modified', new Date().toISOString());
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
      // Save size to localStorage with timestamp
      localStorage.setItem('chatbot-size', JSON.stringify(size));
      localStorage.setItem('chatbot-last-modified', new Date().toISOString());
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

  // Handle conflict resolution
  const handleConflictResolve = async (choice: 'local' | 'cloud') => {
    if (!conflictData) return;

    if (choice === 'local') {
      // Use local preferences - update cloud
      const localData = conflictData.local;
      if (!isMobile) {
        setPosition(localData.position);
        setSize(localData.size);
      }
      setViewMode(localData.viewMode);
      
      // Save to cloud
      const snapSensitivityValue = snapSensitivity === 'tight' ? 30 : snapSensitivity === 'loose' ? 70 : 50;
      await saveToCloud({
        position: localData.position,
        size: localData.size,
        snapSensitivity: snapSensitivityValue,
        pinnedActions: Array.from(pinnedActions),
        viewMode: localData.viewMode,
        autoCollapseEnabled,
        autoCollapseDuration,
        soundMute: isMuted,
        customSounds: customSounds || [],
      });

      toast({
        title: "Preferences Updated",
        description: "Local preferences saved to cloud",
        duration: 2000,
      });
    } else {
      // Use cloud preferences - update local
      const cloudData = conflictData.cloud;
      if (!isMobile) {
        const maxX = window.innerWidth - 320;
        const maxY = window.innerHeight - 200;
        setPosition({
          x: Math.max(0, Math.min(cloudData.position.x, maxX)),
          y: Math.max(0, Math.min(cloudData.position.y, maxY))
        });
        setSize({
          width: Math.max(320, Math.min(cloudData.size.width, 600)),
          height: Math.max(400, Math.min(cloudData.size.height, window.innerHeight - 48))
        });
        localStorage.setItem('chatbot-position', JSON.stringify(cloudData.position));
        localStorage.setItem('chatbot-size', JSON.stringify(cloudData.size));
      }
      setViewMode(cloudData.viewMode);
      localStorage.setItem('chatbot-view-mode', cloudData.viewMode);
      localStorage.setItem('chatbot-last-modified', new Date().toISOString());

      toast({
        title: "Preferences Updated",
        description: "Cloud preferences applied to this device",
        duration: 2000,
      });
    }

    setShowConflictDialog(false);
    setConflictData(null);
  };

  return (
    <>
      {/* Floating chat button with quick actions on hover - draggable and always visible */}
      {!isOpen && (
        <div className="fixed bottom-3 right-3 z-[99999] group" onMouseEnter={handleFirstHover}>
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
          <div className="relative">
            <ChatButton 
              onClick={handleOpen}
              unreadCount={unreadCount}
              variant={buttonVariant}
              onPositionReset={resetToDefaultPosition}
              onOpenSettings={() => setShowSettings(true)}
              pinnedActions={pinnedActions}
              onTogglePin={togglePinAction}
            />
            {/* Pause indicator badge */}
            {isAutoCollapsePaused && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  boxShadow: [
                    "0 0 0 0 rgba(59, 130, 246, 0.7)",
                    "0 0 0 10px rgba(59, 130, 246, 0)",
                    "0 0 0 0 rgba(59, 130, 246, 0)"
                  ]
                }}
                exit={{ scale: 0 }}
                transition={{ 
                  scale: { type: "spring", stiffness: 500, damping: 25 },
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeOut" }
                }}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg border-2 border-white"
                title="Auto-collapse paused"
              >
                <span className="text-xs">⏸️</span>
              </motion.div>
            )}
            
            {/* Scroll to top button overlay */}
            <AnimatePresence>
              {showScrollToTop && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute -top-3 -left-3"
                >
                  <div className="relative">
                    {/* Progress ring */}
                    <svg
                      className="absolute inset-0 w-10 h-10 -rotate-90 pointer-events-none"
                      viewBox="0 0 40 40"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        fill="none"
                        stroke="hsl(var(--primary-foreground))"
                        strokeWidth="2.5"
                        opacity="0.2"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="18"
                        fill="none"
                        stroke="hsl(var(--accent))"
                        strokeWidth="2.5"
                        strokeDasharray={2 * Math.PI * 18}
                        strokeDashoffset={2 * Math.PI * 18 - (scrollProgress / 100) * (2 * Math.PI * 18)}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>
                    
                    <Button
                      onClick={scrollToTop}
                      className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-xl hover:shadow-primary/25 hover:scale-110 transition-all duration-300 border-2 border-background"
                      size="icon"
                      aria-label="Scroll to top"
                      title={`${Math.round(scrollProgress)}% scrolled`}
                    >
                      <ArrowUp className="h-4 w-4 text-primary-foreground" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                <div className="fixed left-0 top-0 bottom-0 w-1 bg-blue-500/60 shadow-lg shadow-blue-500/50 z-[99997] animate-pulse" />
              )}
              {snapIndicator === 'right' && (
                <div className="fixed right-0 top-0 bottom-0 w-1 bg-blue-500/60 shadow-lg shadow-blue-500/50 z-[99997] animate-pulse" />
              )}
              {snapIndicator === 'top' && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-blue-500/60 shadow-lg shadow-blue-500/50 z-[99997] animate-pulse" />
              )}
              {snapIndicator === 'bottom' && (
                <div className="fixed bottom-0 left-0 right-0 h-1 bg-blue-500/60 shadow-lg shadow-blue-500/50 z-[99997] animate-pulse" />
              )}
              
              {/* Corner indicators */}
              {snapIndicator === 'top-left' && (
                <div className="fixed top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50 z-[99997] animate-pulse rounded-br-lg" />
              )}
              {snapIndicator === 'top-right' && (
                <div className="fixed top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50 z-[99997] animate-pulse rounded-bl-lg" />
              )}
              {snapIndicator === 'bottom-left' && (
                <div className="fixed bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50 z-[99997] animate-pulse rounded-tr-lg" />
              )}
              {snapIndicator === 'bottom-right' && (
                <div className="fixed bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/50 z-[99997] animate-pulse rounded-tl-lg" />
              )}
            </>
          )}
          
          {/* Backdrop overlay for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
              onClick={handleClose}
            />
          )}
          
          <motion.div 
            ref={chatWindowRef}
            className={cn(
              "fixed z-[99999]",
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
                    className="relative group/progress"
                  >
                    {/* Circular progress ring */}
                    {autoCollapseEnabled && !isAutoCollapsePaused && viewMode === 'full' && collapseProgress < 100 && (
                      <>
                        <svg
                          className="absolute inset-0 w-full h-full -rotate-90"
                          viewBox="0 0 36 36"
                        >
                          {/* Background circle */}
                          <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="2"
                          />
                          {/* Progress circle */}
                          <motion.circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="none"
                            stroke={collapseProgress < 20 ? "rgb(239, 68, 68)" : "rgb(255, 255, 255)"}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: "100 100", strokeDashoffset: 0 }}
                            animate={{ 
                              strokeDasharray: "100 100",
                              strokeDashoffset: 100 - collapseProgress
                            }}
                            transition={{ duration: 0.3, ease: "linear" }}
                            style={{
                              filter: collapseProgress < 20 ? "drop-shadow(0 0 4px rgb(239, 68, 68))" : "none"
                            }}
                          />
                        </svg>
                        {/* Hover tooltip showing exact time */}
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/progress:opacity-100 transition-opacity z-50"
                        >
                          {Math.ceil((collapseProgress / 100) * (autoCollapseDuration / 1000))}s remaining
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border" />
                        </motion.div>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white hover:bg-white/20 rounded-full relative z-10"
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
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg z-20"
                      >
                        {messages.length - 3}
                      </motion.span>
                    )}
                  </motion.div>
                )}
                {/* Quick Auto-Collapse Settings */}
                {!isMobile && autoCollapseEnabled && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Auto-collapse duration"
                        title="Quick auto-collapse settings"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-48"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        Auto-Collapse Duration
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={cn(
                          "cursor-pointer",
                          autoCollapseDuration === 15000 && "bg-primary/10 text-primary font-medium"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAutoCollapseDuration(15000);
                          localStorage.setItem('chatbot-auto-collapse-duration', '15000');
                          setLastActivityTime(Date.now());
                          setCollapseProgress(100);
                          toast({
                            title: "Duration updated",
                            description: "Auto-collapse set to 15 seconds",
                            duration: 2000,
                          });
                        }}
                      >
                        15 seconds
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "cursor-pointer",
                          autoCollapseDuration === 30000 && "bg-primary/10 text-primary font-medium"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAutoCollapseDuration(30000);
                          localStorage.setItem('chatbot-auto-collapse-duration', '30000');
                          setLastActivityTime(Date.now());
                          setCollapseProgress(100);
                          toast({
                            title: "Duration updated",
                            description: "Auto-collapse set to 30 seconds",
                            duration: 2000,
                          });
                        }}
                      >
                        30 seconds
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={cn(
                          "cursor-pointer",
                          autoCollapseDuration === 60000 && "bg-primary/10 text-primary font-medium"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAutoCollapseDuration(60000);
                          localStorage.setItem('chatbot-auto-collapse-duration', '60000');
                          setLastActivityTime(Date.now());
                          setCollapseProgress(100);
                          toast({
                            title: "Duration updated",
                            description: "Auto-collapse set to 60 seconds",
                            duration: 2000,
                          });
                        }}
                      >
                        60 seconds
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-muted-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAutoCollapse();
                          toast({
                            title: autoCollapseEnabled ? "Auto-collapse disabled" : "Auto-collapse enabled",
                            description: autoCollapseEnabled ? "Chat will stay open until manually closed" : "Chat will auto-collapse after inactivity",
                            duration: 2000,
                          });
                        }}
                      >
                        Disable auto-collapse
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                  className="h-7 w-7 text-white hover:bg-white/20 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                    toast({
                      title: isMinimized ? "Chat expanded" : "Chat minimized",
                      description: isMinimized ? "Chat window restored" : "Click the button to restore",
                      duration: 2000,
                    });
                  }}
                  aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                  title={isMinimized ? "Expand chat" : "Minimize chat"}
                >
                  {isMinimized ? <Square className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
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

            {/* Minimized Message Preview */}
            {isMinimized && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "px-4 py-3 bg-muted/50 border-b border-border cursor-pointer hover:bg-muted/70 transition-colors relative",
                  unreadCountWhileMinimized > 0 && "animate-pulse"
                )}
                onClick={() => setIsMinimized(false)}
              >
                {/* Unread badge */}
                {unreadCountWhileMinimized > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center z-10 animate-pulse"
                    style={{
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    {unreadCountWhileMinimized > 9 ? '9+' : unreadCountWhileMinimized}
                  </motion.div>
                )}
                
                {isLoading ? (
                  // Show typing indicator when AI is responding
                  <div className="flex items-center gap-3">
                    <Bot className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">AI Assistant</span>
                        <span className="text-xs text-muted-foreground">· Typing...</span>
                      </div>
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                ) : messages.length > 0 ? (
                  // Show last message preview
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {messages[messages.length - 1].role === 'assistant' ? (
                        <Bot className="h-4 w-4 text-primary" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs text-primary font-medium">
                            {messages[messages.length - 1].role === 'user' ? 'U' : 'A'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">
                          {messages[messages.length - 1].role === 'assistant' ? 'AI Assistant' : 'You'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · Click to expand
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {messages[messages.length - 1].content}
                      </p>
                    </div>
                  </div>
                ) : (
                  // No messages yet
                  <div className="flex items-center gap-3">
                    <Bot className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-xs font-medium text-foreground">No messages yet</span>
                      <p className="text-xs text-muted-foreground">Click to start chatting</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Auto-collapse warning indicator */}
            <AnimatePresence>
              {showCollapseWarning && !isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-2 bg-orange-500/90 text-white border-b border-orange-600">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          ⚠️
                        </motion.div>
                        <span className="font-medium">
                          Auto-collapsing in {collapseCountdown}s due to inactivity
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-white hover:bg-white/20"
                          onClick={() => {
                            setIsAutoCollapsePaused(true);
                            setShowCollapseWarning(false);
                            setCollapseProgress(100);
                            toast({
                              title: "Auto-collapse paused",
                              description: "Auto-collapse is disabled for this session",
                              duration: 2000,
                            });
                          }}
                        >
                          Pause
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-white hover:bg-white/20"
                          onClick={() => {
                            setLastActivityTime(Date.now());
                            setShowCollapseWarning(false);
                            setCollapseProgress(100);
                          }}
                        >
                          Stay Open
                        </Button>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <motion.div
                      className="h-1 bg-orange-700 mt-1.5 rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-white"
                        initial={{ width: '100%' }}
                        animate={{ width: '0%' }}
                        transition={{ 
                          duration: 5, 
                          ease: 'linear',
                          repeatType: 'loop'
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              )}
              {/* Paused indicator */}
              {isAutoCollapsePaused && !isMinimized && autoCollapseEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-2 bg-blue-500/90 text-white border-b border-blue-600">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⏸️</span>
                        <span className="font-medium">
                          Auto-collapse paused for this session
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-white hover:bg-white/20"
                        onClick={() => {
                          setIsAutoCollapsePaused(false);
                          setLastActivityTime(Date.now());
                          setCollapseProgress(100);
                          toast({
                            title: "Auto-collapse resumed",
                            description: "Auto-collapse is now active",
                            duration: 2000,
                          });
                        }}
                      >
                        Resume
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Settings panel - only show when settings is open */}
            {showSettings && !isMinimized && (
              <div className="p-4 border-b border-primary/10 bg-muted/50">
                <div className="space-y-3">
                  {/* Cloud Sync Status */}
                  {isAuthenticated && (
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Cloud Sync</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {syncStatus === 'syncing' && (
                            <>
                              <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                              <span className="text-xs text-blue-500 font-medium">Syncing</span>
                            </>
                          )}
                          {syncStatus === 'synced' && (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-xs text-green-500 font-medium">Synced</span>
                            </>
                          )}
                          {syncStatus === 'error' && (
                            <>
                              <XCircle className="h-3.5 w-3.5 text-red-500" />
                              <span className="text-xs text-red-500 font-medium">Error</span>
                            </>
                          )}
                          {syncStatus === 'idle' && lastSyncTime && (
                            <span className="text-xs text-muted-foreground">
                              {new Date().getTime() - lastSyncTime.getTime() < 60000 
                                ? 'Just now' 
                                : lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Your preferences sync automatically across all devices
                      </p>
                    </div>
                  )}
                  
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
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {autoCollapseEnabled 
                          ? `Chat minimizes after ${autoCollapseDuration / 1000}s of inactivity` 
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
                    
                    {/* Duration selector */}
                    {autoCollapseEnabled && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={autoCollapseDuration === 15000 ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setAutoCollapseDuration(15000);
                            localStorage.setItem('chatbot-auto-collapse-duration', '15000');
                            setLastActivityTime(Date.now());
                          }}
                        >
                          15s
                        </Button>
                        <Button
                          variant={autoCollapseDuration === 30000 ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setAutoCollapseDuration(30000);
                            localStorage.setItem('chatbot-auto-collapse-duration', '30000');
                            setLastActivityTime(Date.now());
                          }}
                        >
                          30s
                        </Button>
                        <Button
                          variant={autoCollapseDuration === 60000 ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setAutoCollapseDuration(60000);
                            localStorage.setItem('chatbot-auto-collapse-duration', '60000');
                            setLastActivityTime(Date.now());
                          }}
                        >
                          60s
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Welcome Tips */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Welcome Tips</label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setShowWelcomeDialog(true);
                        setShowSettings(false);
                      }}
                    >
                      Show Welcome Tips Again
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      View chatbot features and tips anytime
                    </p>
                  </div>
                  
                  {/* Starred Messages */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Starred Messages</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStarredMessages(!showStarredMessages)}
                      >
                        {starredMessages.length} starred
                      </Button>
                    </div>
                    
                    {showStarredMessages && starredMessages.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto p-3 rounded-lg bg-background/50 border border-border/50">
                        {starredMessages.map(msg => (
                          <div 
                            key={msg.id} 
                            className="p-2 rounded-md bg-muted/50 border border-border/30 text-xs group relative"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="font-medium text-primary mb-1">
                                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                                </div>
                                <div className="text-muted-foreground line-clamp-3">
                                  {msg.content}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => toggleStarMessage(msg.id)}
                              >
                                <XIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showStarredMessages && starredMessages.length === 0 && (
                      <p className="text-xs text-muted-foreground p-3 text-center bg-muted/30 rounded-lg">
                        No starred messages yet. Hover over messages and click the star icon to save them.
                      </p>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Star important messages for quick access
                    </p>
                  </div>
                  
                  {/* Custom Sounds Settings */}
                  <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Custom Notification Sounds
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Upload custom audio files for different chat events (Max 1MB per file)
                    </p>
                    
                    <div className="space-y-2">
                      {(['newMessage', 'countdownWarning', 'collapse', 'open', 'close'] as SoundEvent[]).map(event => {
                        const soundInfo = getCustomSound(event);
                        const eventLabels = {
                          newMessage: 'New Message',
                          countdownWarning: 'Countdown Warning',
                          collapse: 'Auto-Collapse',
                          open: 'Chat Open',
                          close: 'Chat Close'
                        };
                        
                        return (
                          <div key={event} className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50">
                            <div className="flex-1">
                              <p className="text-xs font-medium">{eventLabels[event]}</p>
                              {soundInfo && (
                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                  {soundInfo.fileName}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {soundInfo ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    removeSound(event);
                                    toast({
                                      title: "Sound removed",
                                      description: `Custom sound for ${eventLabels[event]} removed`,
                                      duration: 2000,
                                    });
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7 px-2"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'audio/*';
                                    input.onchange = async (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) {
                                        try {
                                          await uploadSound(event, file);
                                          toast({
                                            title: "Sound uploaded",
                                            description: `Custom sound for ${eventLabels[event]} set successfully`,
                                            duration: 2000,
                                          });
                                        } catch (error) {
                                          toast({
                                            title: "Upload failed",
                                            description: error instanceof Error ? error.message : 'Failed to upload audio file',
                                            variant: "destructive",
                                            duration: 3000,
                                          });
                                        }
                                      }
                                    };
                                    input.click();
                                  }}
                                >
                                  Upload
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={exportPreferences}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={importPreferences}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Import
                    </Button>
                  </div>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      resetAllPreferences();
                      toast({
                        title: "All preferences reset",
                        description: "All chatbot settings have been restored to defaults",
                        duration: 2000,
                      });
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset All Preferences
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
                  onToggleStar={toggleStarMessage}
                  typingStatus={typingStatus}
                  smartReplies={smartReplies}
                  onSmartReplyClick={(reply) => {
                    setSmartReplies([]);
                    handleSendMessage(reply);
                  }}
                />
                    {/* Typing indicator with animation */}
                    <AnimatePresence>
                      {isLoading && <TypingIndicator status={typingStatus} />}
                    </AnimatePresence>
                  </motion.div>
                </ScrollArea>

                {showQuickActions && messages.length <= 1 && (
                  <div className={`${isMobile ? 'px-3 pb-2' : 'px-4 pb-2'}`}>
                    <AIChatQuickActions
                      quickActions={quickActions}
                      onActionClick={(action) => handleSendMessage(action)}
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
                    isRecording={isRecording}
                    isProcessingVoice={isProcessingVoice}
                    recordingDuration={recordingDuration}
                    onStartRecording={handleStartVoiceRecording}
                    onStopRecording={handleStopVoiceRecording}
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

      {/* Conflict Resolution Dialog */}
      <ChatbotConflictDialog
        open={showConflictDialog}
        conflictData={conflictData}
        onResolve={handleConflictResolve}
        onCancel={() => {
          setShowConflictDialog(false);
          setConflictData(null);
        }}
      />

      {/* Welcome Dialog for New Users */}
      <ChatbotWelcomeDialog
        open={showWelcomeDialog}
        onClose={() => setShowWelcomeDialog(false)}
      />
    </>
  );
};

export default ResponsiveAIChatWidget;
