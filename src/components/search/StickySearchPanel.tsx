import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, Save, Clock, X, Mic, Download, BarChart3, FileText, FileJson, FileSpreadsheet, Sparkles, GitCompare, Loader2, Share2, Bell, Link, QrCode as QrCodeIcon, History, TrendingUp, Users, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PropertyAdvancedFilters from './PropertyAdvancedFilters';
import { QRCodeSVG } from 'qrcode.react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

// Schema for saved search name validation
const savedSearchSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Search name cannot be empty" })
    .max(50, { message: "Search name must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9\s\-_]+$/, { message: "Only letters, numbers, spaces, hyphens and underscores allowed" })
});

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  timestamp: number;
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

interface StickySearchPanelProps {
  language: "en" | "id";
  onFiltersChange: (filters: any) => void;
  onSearch: (searchData: any) => void;
  initialFilters?: any;
}

const StickySearchPanel = ({
  language,
  onFiltersChange,
  onSearch,
  initialFilters = {}
}: StickySearchPanelProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [compareSearches, setCompareSearches] = useState<[SavedSearch | null, SavedSearch | null]>([null, null]);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState<Record<string, boolean>>({});
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifHistory, setShowNotifHistory] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'price_drop' | 'new_match'>('all');
  const [showShareAnalytics, setShowShareAnalytics] = useState<string | null>(null);
  const [shareStats, setShareStats] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<{ id: string; name: string; avatar?: string }[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [intelligentSuggestions, setIntelligentSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const lastScrollY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (initialFilters.propertyType && initialFilters.propertyType !== 'all') count++;
    if (initialFilters.listingType && initialFilters.listingType !== 'all') count++;
    if (initialFilters.priceRange && (initialFilters.priceRange[0] > 0 || initialFilters.priceRange[1] < 20000000000)) count++;
    if (initialFilters.bedrooms && initialFilters.bedrooms !== 'all') count++;
    if (initialFilters.bathrooms && initialFilters.bathrooms !== 'all') count++;
    if (initialFilters.location) count++;
    if (initialFilters.features && initialFilters.features.length > 0) count++;
    if (initialFilters.amenities && initialFilters.amenities.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Load saved searches from Supabase with real-time sync
  useEffect(() => {
    if (!user?.id) {
      // Load from localStorage if not authenticated
      try {
        const saved = localStorage.getItem('savedSearches');
        const recent = localStorage.getItem('recentSearches');
        
        if (saved) {
          setSavedSearches(JSON.parse(saved));
        }
        if (recent) {
          setRecentSearches(JSON.parse(recent));
        }
      } catch (error) {
        console.error('Failed to load searches:', error);
      }
      return;
    }

    // Fetch saved searches from Supabase
    const fetchSavedSearches = async () => {
      try {
        const { data, error } = await supabase
          .from('user_searches')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        if (data) {
          const searches: SavedSearch[] = data.map(item => ({
            id: item.id,
            name: item.name,
            query: item.query || '',
            filters: item.filters || {},
            timestamp: item.timestamp
          }));
          setSavedSearches(searches);
        }
      } catch (error) {
        console.error('Failed to fetch saved searches:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('savedSearches');
        if (saved) {
          setSavedSearches(JSON.parse(saved));
        }
      }
    };

    fetchSavedSearches();

    // Set up real-time subscription
    const channel = supabase
      .channel('user_searches_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_searches',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newSearch: SavedSearch = {
              id: payload.new.id,
              name: payload.new.name,
              query: payload.new.query || '',
              filters: payload.new.filters || {},
              timestamp: payload.new.timestamp
            };
            setSavedSearches(prev => [newSearch, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setSavedSearches(prev => prev.map(s => 
              s.id === payload.new.id ? {
                id: payload.new.id,
                name: payload.new.name,
                query: payload.new.query || '',
                filters: payload.new.filters || {},
                timestamp: payload.new.timestamp
              } : s
            ));
          } else if (payload.eventType === 'DELETE') {
            setSavedSearches(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Load recent searches from localStorage
    try {
      const recent = localStorage.getItem('recentSearches');
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Load notification preferences and listen to notifications
  useEffect(() => {
    if (!user?.id) return;

    // Load notification preferences from localStorage
    try {
      const prefs = localStorage.getItem(`notifs_${user.id}`);
      if (prefs) {
        setNotificationsEnabled(JSON.parse(prefs));
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Fetch unread notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('search_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data);
        setUnreadNotifications(data.length);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for notifications
    const notifChannel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'search_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification:', payload);
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadNotifications(prev => prev + 1);
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/icon-192x192.png'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
    };
  }, [user?.id]);

  // Cleanup suggestions timeout
  useEffect(() => {
    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  // Voice Recognition Setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'id' ? 'id-ID' : 'en-US';

      let silenceTimer: NodeJS.Timeout;
      recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setSearchQuery(transcript);
        
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (transcript.trim()) {
            handleQuickSearch();
            recognition.stop();
          }
        }, 1500);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Error",
          description: "Voice recognition failed. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search + Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowAutocomplete(true);
        fetchIntelligentSuggestions(searchQuery);
      }
      
      // ESC to close autocomplete and reset selection
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        setShowExportMenu(false);
        setSelectedSuggestionIndex(-1);
      }

      // Arrow key navigation in autocomplete
      if (showAutocomplete && intelligentSuggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < intelligentSuggestions.length - 1 ? prev + 1 : 0
          );
        }
        
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev > 0 ? prev - 1 : intelligentSuggestions.length - 1
          );
        }

        // Enter to apply selected suggestion
        if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
          e.preventDefault();
          applySuggestion(intelligentSuggestions[selectedSuggestionIndex]);
        }
      }

      // Tab navigation (let default behavior handle it, but track for accessibility)
      if (e.key === 'Tab' && !e.shiftKey) {
        // Browser handles tab naturally, we just ensure proper tab order in JSX
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAutocomplete, selectedSuggestionIndex, intelligentSuggestions, searchQuery]);

  // Handle scroll behavior - auto-minimize on scroll
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      
      if (current > 120 && lastScrollY.current <= 120) {
        setIsMinimized(true);
        setIsFiltersExpanded(false);
      } else if (current < 80 && lastScrollY.current >= 80) {
        setIsMinimized(false);
      }
      
      lastScrollY.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to collapse filters and autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFiltersExpanded &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsFiltersExpanded(false);
      }

      // Close autocomplete when clicking outside
      if (
        showAutocomplete &&
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }

      // Close export menu when clicking outside
      if (
        showExportMenu &&
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFiltersExpanded, showAutocomplete, showExportMenu]);

  const handleQuickSearch = () => {
    // Add to recent searches
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery.trim());
    }

    onSearch({
      query: searchQuery,
      ...initialFilters
    });

    setShowAutocomplete(false);
  };

  const addToRecentSearches = (query: string) => {
    try {
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query,
        timestamp: Date.now()
      };

      const updated = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  // Fetch intelligent suggestions (AI + recent + saved)
  const fetchIntelligentSuggestions = async (query: string) => {
    // Clear previous timeout
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    // Debounce suggestions fetching
    suggestionsTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      
      try {
        // Combine recent and saved searches as fallback
        const fallbackSuggestions = [
          ...recentSearches.slice(0, 3).map(s => s.query),
          ...savedSearches.slice(0, 2).map(s => s.name)
        ].filter((v, i, a) => a.indexOf(v) === i);

        if (!query.trim()) {
          setIntelligentSuggestions(fallbackSuggestions);
          setIsLoadingSuggestions(false);
          return;
        }

        // Fetch AI suggestions
        const { data, error } = await supabase.functions.invoke('ai-search-suggestions', {
          body: { 
            query, 
            recentSearches: recentSearches.slice(0, 5),
            savedSearches: savedSearches.slice(0, 5),
            filters: initialFilters 
          }
        });

        if (error) {
          console.error('AI suggestions error:', error);
          // Use fallback
          const filtered = fallbackSuggestions.filter(s => 
            s.toLowerCase().includes(query.toLowerCase())
          );
          setIntelligentSuggestions(filtered.slice(0, 5));
        } else {
          const aiSuggestions = data?.suggestions || [];
          // Combine AI suggestions with relevant recent/saved
          const combined = [
            ...aiSuggestions,
            ...fallbackSuggestions.filter(s => 
              s.toLowerCase().includes(query.toLowerCase())
            )
          ]
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 5);
          
          setIntelligentSuggestions(combined);
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        // Use fallback
        const fallback = [
          ...recentSearches.map(s => s.query),
          ...savedSearches.map(s => s.name)
        ]
          .filter(s => s.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);
        setIntelligentSuggestions(fallback);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300); // 300ms debounce
  };

  // Apply suggestion from dropdown
  const applySuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowAutocomplete(false);
    setSelectedSuggestionIndex(-1);
    addToRecentSearches(suggestion);
    
    onSearch({
      query: suggestion,
      ...initialFilters
    });

    toast({
      title: "Applied Suggestion",
      description: `Searching for: ${suggestion}`
    });
  };

  // Mobile gesture handlers
  const handlePanelTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setIsDraggingPanel(true);
  };

  const handlePanelTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingPanel) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;

    // Swipe down to minimize (when not minimized)
    if (diff > 80 && !isMinimized) {
      setIsMinimized(true);
      setIsDraggingPanel(false);
      setIsFiltersExpanded(false);
    } 
    // Swipe up to expand (when minimized)
    else if (diff < -50 && isMinimized) {
      setIsMinimized(false);
      setIsDraggingPanel(false);
    }
  };

  const handlePanelTouchEnd = () => {
    setIsDraggingPanel(false);
  };

  // Long press for voice (mobile)
  const handleLongPressStart = useRef<NodeJS.Timeout | null>(null);
  
  const handleInputTouchStart = (e: React.TouchEvent) => {
    handleLongPressStart.current = setTimeout(() => {
      if (recognitionRef.current && !isListening) {
        toggleVoice();
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }, 500); // 500ms long press
  };

  const handleInputTouchEnd = () => {
    if (handleLongPressStart.current) {
      clearTimeout(handleLongPressStart.current);
    }
  };

  const handleSaveSearch = async () => {
    try {
      const validation = savedSearchSchema.safeParse({ name: saveName });
      
      if (!validation.success) {
        toast({
          title: "Invalid Name",
          description: validation.error.errors[0].message,
          variant: "destructive"
        });
        return;
      }

      const timestamp = Date.now();
      const newSavedSearch: SavedSearch = {
        id: crypto.randomUUID(),
        name: saveName.trim(),
        query: searchQuery,
        filters: initialFilters,
        timestamp
      };

      if (user?.id) {
        // Save to Supabase
        const { error } = await supabase
          .from('user_searches')
          .insert({
            id: newSavedSearch.id,
            user_id: user.id,
            name: newSavedSearch.name,
            query: newSavedSearch.query,
            filters: newSavedSearch.filters,
            timestamp: newSavedSearch.timestamp
          });

        if (error) throw error;

        toast({
          title: "Search Saved",
          description: `"${saveName}" has been saved and synced across devices`
        });
      } else {
        // Save to localStorage
        const updated = [...savedSearches, newSavedSearch];
        setSavedSearches(updated);
        localStorage.setItem('savedSearches', JSON.stringify(updated));

        toast({
          title: "Search Saved",
          description: `"${saveName}" has been saved locally. Sign in to sync across devices.`
        });
      }

      setShowSaveDialog(false);
      setSaveName('');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save search. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadSavedSearch = (saved: SavedSearch) => {
    setSearchQuery(saved.query);
    onFiltersChange(saved.filters);
    onSearch({
      query: saved.query,
      ...saved.filters
    });
    setShowAutocomplete(false);

    toast({
      title: "Search Loaded",
      description: `Loaded "${saved.name}"`
    });
  };

  const deleteSavedSearch = async (id: string) => {
    try {
      if (user?.id) {
        // Delete from Supabase
        const { error } = await supabase
          .from('user_searches')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Search Deleted",
          description: "Saved search has been removed from all devices"
        });
      } else {
        // Delete from localStorage
        const updated = savedSearches.filter(s => s.id !== id);
        setSavedSearches(updated);
        localStorage.setItem('savedSearches', JSON.stringify(updated));

        toast({
          title: "Search Deleted",
          description: "Saved search has been removed"
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete search",
        variant: "destructive"
      });
    }
  };

  const selectRecentSearch = (query: string) => {
    setSearchQuery(query);
    setShowAutocomplete(false);
    handleQuickSearch();
  };

  // Voice Search Toggle
  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice search is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak your search query"
        });
      } catch (error) {
        toast({
          title: "Voice Error",
          description: "Could not start voice recognition",
          variant: "destructive"
        });
      }
    }
  };

  // Export Functions
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Query', 'Filters', 'Date'];
    const rows = savedSearches.map(s => [
      s.name,
      s.query,
      JSON.stringify(s.filters),
      new Date(s.timestamp).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `saved-searches-${date}.csv`, 'text/csv');
    
    toast({
      title: "Exported",
      description: "Saved searches exported as CSV"
    });
    setShowExportMenu(false);
  };

  const exportJSON = () => {
    const data = JSON.stringify(savedSearches, null, 2);
    downloadFile(data, 'saved-searches.json', 'application/json');
    
    toast({
      title: "Exported",
      description: "Saved searches exported as JSON"
    });
    setShowExportMenu(false);
  };

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Saved Property Searches', 14, 15);
      
      (doc as any).autoTable({
        startY: 25,
        head: [['Name', 'Query', 'Date']],
        body: savedSearches.map(s => [
          s.name, 
          s.query, 
          new Date(s.timestamp).toLocaleDateString()
        ]),
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      doc.save('saved-searches.pdf');
      
      toast({
        title: "Exported",
        description: "Saved searches exported as PDF"
      });
      setShowExportMenu(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export PDF",
        variant: "destructive"
      });
    }
  };

  // Analytics Calculations
  const getAnalytics = () => {
    const totalSearches = recentSearches.length + savedSearches.length;
    
    // Top locations from queries
    const locationCounts: Record<string, number> = {};
    [...recentSearches, ...savedSearches].forEach(s => {
      const query = 'query' in s ? s.query : '';
      const words = query.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3) {
          locationCounts[word] = (locationCounts[word] || 0) + 1;
        }
      });
    });
    
    const topLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Filter usage
    const filterCounts: Record<string, number> = {};
    savedSearches.forEach(s => {
      Object.keys(s.filters || {}).forEach(key => {
        if (s.filters[key] && s.filters[key] !== 'all') {
          filterCounts[key] = (filterCounts[key] || 0) + 1;
        }
      });
    });

    const topFilters = Object.entries(filterCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([filter, count]) => ({ filter, count }));

    // Time trend (last 7 days)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const timeTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * dayMs);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = [...recentSearches, ...savedSearches].filter(s => {
        const searchDate = new Date(s.timestamp);
        return searchDate.toDateString() === date.toDateString();
      }).length;
      return { date: dateStr, searches: count };
    });

    return {
      totalSearches,
      topLocations,
      topFilters,
      timeTrend,
      savedCount: savedSearches.length,
      recentCount: recentSearches.length
    };
  };

  // AI Recommendations
  const fetchAIRecommendations = async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-search-recommendations', {
        body: {
          recentSearches,
          savedSearches,
          filters: initialFilters
        }
      });

      if (error) throw error;

      if (data?.suggestions) {
        setAiSuggestions(data.suggestions);
        setShowAISuggestions(true);
        toast({
          title: "AI Suggestions Ready",
          description: `Generated ${data.suggestions.length} personalized recommendations`
        });
      }
    } catch (error: any) {
      console.error('AI recommendations error:', error);
      
      if (error.message?.includes('429')) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many requests. Please try again later.",
          variant: "destructive"
        });
      } else if (error.message?.includes('402')) {
        toast({
          title: "Payment Required",
          description: "Please add credits to your workspace.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "AI Error",
          description: "Failed to generate recommendations",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  const applyAISuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowAISuggestions(false);
    addToRecentSearches(suggestion);
    onSearch({
      query: suggestion,
      ...initialFilters
    });
  };

  // Search Comparison
  const startComparison = () => {
    if (savedSearches.length < 2) {
      toast({
        title: "Not Enough Searches",
        description: "You need at least 2 saved searches to compare",
        variant: "destructive"
      });
      return;
    }
    setCompareSearches([null, null]);
    setShowComparison(true);
  };

  const selectCompareSearch = (index: 0 | 1, search: SavedSearch) => {
    const newCompareSearches: [SavedSearch | null, SavedSearch | null] = [...compareSearches];
    newCompareSearches[index] = search;
    setCompareSearches(newCompareSearches);
  };

  const getFilterDifferences = () => {
    if (!compareSearches[0] || !compareSearches[1]) return [];
    
    const search1 = compareSearches[0];
    const search2 = compareSearches[1];
    const differences: Array<{ key: string; value1: any; value2: any }> = [];

    const allKeys = new Set([
      ...Object.keys(search1.filters || {}),
      ...Object.keys(search2.filters || {})
    ]);

    allKeys.forEach(key => {
      const val1 = search1.filters?.[key];
      const val2 = search2.filters?.[key];
      
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences.push({
          key,
          value1: val1,
          value2: val2
        });
      }
    });

    return differences;
  };

  // Share search functionality
  const shareSearch = async (search: SavedSearch) => {
    try {
      if (!user?.id) {
        toast({
          title: "Sign In Required",
          description: "Please sign in to share searches",
          variant: "destructive"
        });
        return;
      }

      const shareId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const { error } = await supabase
        .from('shared_searches')
        .insert({
          id: shareId,
          search_id: search.id,
          owner_id: user.id,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      const url = `${window.location.origin}/shared-search/${shareId}`;
      setShareUrl(url);
      setShowShareModal(shareId);
      
      await navigator.clipboard.writeText(url);
      
      toast({
        title: "Link Copied!",
        description: "Share this link with anyone. Expires in 30 days."
      });
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Could not create shareable link",
        variant: "destructive"
      });
    }
  };

  // Toggle notifications for a search
  const toggleNotifications = async (searchId: string) => {
    if (!user?.id) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to enable notifications",
        variant: "destructive"
      });
      return;
    }

    const enabled = !notificationsEnabled[searchId];
    const newPrefs = { ...notificationsEnabled, [searchId]: enabled };
    setNotificationsEnabled(newPrefs);
    localStorage.setItem(`notifs_${user.id}`, JSON.stringify(newPrefs));

    if (enabled) {
      // Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await subscribeToPush(searchId);
          toast({
            title: "Notifications Enabled",
            description: "You'll be notified of new matches and price drops"
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings",
            variant: "destructive"
          });
        }
      }
    } else {
      // Unsubscribe
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('search_id', searchId);
      
      toast({
        title: "Notifications Disabled",
        description: "You won't receive alerts for this search"
      });
    }
  };

  // Subscribe to push notifications
  const subscribeToPush = async (searchId: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.error('Push notifications not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update();

      // In production, use actual VAPID key
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8Tqx9c5zVK5Y4UgP5MQ7Z3J_YRv2X1k8TqY9c5zVK5Y4UgP5MQ7Z3J';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Save subscription to database
      await supabase
        .from('push_subscriptions')
        .upsert([{
          user_id: user?.id,
          search_id: searchId,
          subscription: subscription.toJSON() as any
        }]);

    } catch (error) {
      console.error('Push subscription error:', error);
    }
  };

  // Convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Mark notifications as read
  const markNotificationsRead = async () => {
    if (!user?.id) return;

    await supabase
      .from('search_notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setUnreadNotifications(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // Mark individual notification as read
  const markNotificationRead = async (notifId: string) => {
    if (!user?.id) return;

    await supabase
      .from('search_notifications')
      .update({ is_read: true })
      .eq('id', notifId);

    setNotifications(prev => prev.map(n => 
      n.id === notifId ? { ...n, is_read: true } : n
    ));
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!user?.id) return;

    await supabase
      .from('search_notifications')
      .delete()
      .eq('user_id', user.id);

    setNotifications([]);
    setUnreadNotifications(0);
    
    toast({
      title: "Cleared",
      description: "All notifications have been removed"
    });
  };

  // Get filtered notifications
  const getFilteredNotifications = () => {
    if (notifFilter === 'all') return notifications;
    return notifications.filter(n => n.notification_type === notifFilter);
  };

  // Load share analytics
  const loadShareAnalytics = async (shareId: string) => {
    try {
      const { data, error } = await supabase
        .from('share_analytics')
        .select('*')
        .eq('share_id', shareId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Process analytics data
      const viewCount = data?.filter(d => d.event_type === 'view').length || 0;
      const clickCount = data?.filter(d => d.event_type === 'click').length || 0;
      const referrers = data
        ?.filter(d => d.event_type === 'view' && d.referrer)
        .reduce((acc, d) => {
          const ref = new URL(d.referrer || window.location.origin).hostname;
          acc[ref] = (acc[ref] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      // Time series data (last 7 days)
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const timeSeries = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now - (6 - i) * dayMs);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const views = data?.filter(d => {
          const eventDate = new Date(d.timestamp);
          return d.event_type === 'view' && eventDate.toDateString() === date.toDateString();
        }).length || 0;
        return { date: dateStr, views };
      });

      const topReferrers = Object.entries(referrers || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([domain, count]) => ({ domain, count }));

      setShareStats({
        viewCount,
        clickCount,
        clickRate: viewCount > 0 ? ((clickCount / viewCount) * 100).toFixed(1) : '0',
        timeSeries,
        topReferrers
      });
      setShowShareAnalytics(shareId);
      
      toast({
        title: "Analytics Loaded",
        description: `${viewCount} views, ${clickCount} clicks`
      });
    } catch (error) {
      console.error('Analytics error:', error);
      toast({
        title: "Analytics Error",
        description: "Could not load share analytics",
        variant: "destructive"
      });
    }
  };

  const text = {
    en: {
      search: "Search properties, location, or developer...",
      filters: "Filters",
      searchBtn: "Search",
      saveSearch: "Save Search",
      savedSearches: "Saved Searches",
      recentSearches: "Recent Searches",
      noRecent: "No recent searches",
      noSaved: "No saved searches yet",
      searchName: "Search Name",
      save: "Save",
      cancel: "Cancel",
      keyboardHint: "⌘K or Ctrl+K to search • ↑↓ Navigate • Enter Apply",
      analytics: "Analytics",
      export: "Export",
      voiceSearch: "Voice Search",
      listening: "Listening...",
      aiSuggest: "AI Suggest",
      compare: "Compare",
      aiSuggestions: "AI Recommendations",
      compareSearches: "Compare Searches",
      selectFirst: "Select first search",
      selectSecond: "Select second search",
      differences: "Differences",
      similarities: "Similarities",
      share: "Share",
      notifications: "Notifications",
      notifyMe: "Notify Me",
      shareLink: "Share Link",
      copyLink: "Copy Link",
      qrCode: "QR Code",
      expiresIn: "Expires in 30 days",
      notificationsOff: "Notifications Off",
      notificationsOn: "Notifications On",
      newMatches: "New Matches",
      priceDrops: "Price Drops",
      markAllRead: "Mark All Read",
      clearAll: "Clear All",
      filterAll: "All",
      filterPriceDrops: "Price Drops",
      filterNewMatches: "New Matches",
      notificationHistory: "Notification History",
      shareAnalytics: "Share Analytics",
      views: "Views",
      clicks: "Clicks",
      clickRate: "Click Rate",
      topReferrers: "Top Referrers",
      viewsOverTime: "Views Over Time",
      collaborators: "Collaborators",
      liveEditing: "Live Editing"
    },
    id: {
      search: "Cari properti, lokasi, atau pengembang...",
      filters: "Filter",
      searchBtn: "Cari",
      saveSearch: "Simpan Pencarian",
      savedSearches: "Pencarian Tersimpan",
      recentSearches: "Pencarian Terbaru",
      noRecent: "Tidak ada pencarian terbaru",
      noSaved: "Belum ada pencarian tersimpan",
      searchName: "Nama Pencarian",
      save: "Simpan",
      cancel: "Batal",
      keyboardHint: "⌘K atau Ctrl+K untuk mencari • ↑↓ Navigasi • Enter Terapkan",
      analytics: "Analitik",
      export: "Ekspor",
      voiceSearch: "Pencarian Suara",
      listening: "Mendengarkan...",
      aiSuggest: "Saran AI",
      compare: "Bandingkan",
      aiSuggestions: "Rekomendasi AI",
      compareSearches: "Bandingkan Pencarian",
      selectFirst: "Pilih pencarian pertama",
      selectSecond: "Pilih pencarian kedua",
      differences: "Perbedaan",
      similarities: "Kesamaan",
      share: "Bagikan",
      notifications: "Notifikasi",
      notifyMe: "Beritahu Saya",
      shareLink: "Bagikan Tautan",
      copyLink: "Salin Tautan",
      qrCode: "Kode QR",
      expiresIn: "Kadaluarsa dalam 30 hari",
      notificationsOff: "Notifikasi Mati",
      notificationsOn: "Notifikasi Aktif",
      newMatches: "Hasil Baru",
      priceDrops: "Penurunan Harga",
      markAllRead: "Tandai Semua Dibaca",
      clearAll: "Hapus Semua",
      filterAll: "Semua",
      filterPriceDrops: "Penurunan Harga",
      filterNewMatches: "Hasil Baru",
      notificationHistory: "Riwayat Notifikasi",
      shareAnalytics: "Analitik Berbagi",
      views: "Tampilan",
      clicks: "Klik",
      clickRate: "Tingkat Klik",
      topReferrers: "Rujukan Teratas",
      viewsOverTime: "Tampilan Seiring Waktu",
      collaborators: "Kolaborator",
      liveEditing: "Pengeditan Langsung"
    }
  };

  const currentText = text[language];

  return (
    <>
      {/* Sticky Panel with proper positioning and mobile gestures */}
      <div
        ref={panelRef}
        className="sticky top-0 z-40 bg-background shadow-sm"
        onTouchStart={handlePanelTouchStart}
        onTouchMove={handlePanelTouchMove}
        onTouchEnd={handlePanelTouchEnd}
      >
        {/* Mobile gesture indicator - visible only on mobile */}
        <div className="md:hidden flex justify-center py-1 bg-muted/30">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>
        
        <motion.div
          initial={false}
          animate={{
            height: isMinimized ? 64 : 'auto'
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isMinimized ? (
              // Minimized View
              <div className="py-3">
              <div className="flex items-center gap-2 sm:gap-3">
                 {/* Search Input with Autocomplete and Voice */}
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                    <Input
                      ref={searchInputRef}
                      id="search-input"
                      placeholder={currentText.search}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        fetchIntelligentSuggestions(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && selectedSuggestionIndex === -1) {
                          handleQuickSearch();
                        }
                      }}
                      onFocus={() => {
                        setShowAutocomplete(true);
                        fetchIntelligentSuggestions(searchQuery);
                      }}
                      onTouchStart={handleInputTouchStart}
                      onTouchEnd={handleInputTouchEnd}
                      className="pl-10 pr-10 h-10 bg-background"
                    />
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={toggleVoice}
                     className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 z-10 ${isListening ? 'text-destructive animate-pulse' : ''}`}
                     title={currentText.voiceSearch}
                   >
                     <Mic className="h-4 w-4" />
                   </Button>

                   {/* Intelligent Suggestions Dropdown with Keyboard Navigation */}
                   <AnimatePresence>
                     {showAutocomplete && (intelligentSuggestions.length > 0 || isLoadingSuggestions) && (
                       <motion.div
                         ref={autocompleteRef}
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         transition={{ duration: 0.2 }}
                         className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                       >
                         {isLoadingSuggestions ? (
                           <div className="p-4 text-center text-sm text-muted-foreground">
                             <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                             Loading suggestions...
                           </div>
                         ) : (
                           <>
                             {/* Header */}
                             <div className="p-2 border-b border-border">
                               <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                                 <Sparkles className="h-3 w-3" />
                                 Intelligent Suggestions
                                 <span className="text-xs text-muted-foreground ml-auto">
                                   ↑↓ Navigate • Enter Apply • Esc Close
                                 </span>
                               </div>
                             </div>

                             {/* Suggestions List */}
                             <div className="p-2">
                               {intelligentSuggestions.map((suggestion, idx) => (
                                 <button
                                   key={idx}
                                   onClick={() => applySuggestion(suggestion)}
                                   onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                                   className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                                     selectedSuggestionIndex === idx 
                                       ? 'bg-primary text-primary-foreground' 
                                       : 'hover:bg-accent'
                                   }`}
                                 >
                                   <div className="flex items-center gap-2">
                                     {idx === 0 && <Sparkles className="h-3 w-3 text-primary" />}
                                     <span>{suggestion}</span>
                                   </div>
                                 </button>
                               ))}
                             </div>

                             {/* Footer with recent/saved fallback */}
                             {(recentSearches.length > 0 || savedSearches.length > 0) && (
                               <div className="p-2 border-t border-border">
                                 <div className="text-xs text-muted-foreground px-2 py-1">
                                   Quick access
                                 </div>
                                 <div className="flex flex-wrap gap-1">
                                   {recentSearches.slice(0, 3).map((recent) => (
                                     <button
                                       key={recent.id}
                                       onClick={() => applySuggestion(recent.query)}
                                       className="px-2 py-1 text-xs bg-muted hover:bg-accent rounded-md transition-colors"
                                     >
                                       {recent.query}
                                     </button>
                                   ))}
                                 </div>
                               </div>
                             )}
                           </>
                         )}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

                 {/* AI Suggest Button */}
                 <Button
                   variant="outline"
                   size="default"
                   onClick={fetchAIRecommendations}
                   disabled={isLoadingAI}
                   className="h-10 px-3 sm:px-4 whitespace-nowrap"
                   title={currentText.aiSuggest}
                 >
                   {isLoadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                 </Button>

                 {/* Notifications Button */}
                 <div className="relative">
                   <Button
                     variant="outline"
                     size="default"
                     onClick={() => {
                       setShowNotifications(true);
                       markNotificationsRead();
                     }}
                     className="h-10 px-3 sm:px-4 whitespace-nowrap"
                     title={currentText.notifications}
                   >
                     <Bell className="h-4 w-4" />
                     {unreadNotifications > 0 && (
                       <Badge
                         variant="destructive"
                         className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                       >
                         {unreadNotifications}
                       </Badge>
                     )}
                   </Button>
                 </div>

                 {/* Compare Button */}
                 <Button
                   variant="outline"
                   size="default"
                   onClick={startComparison}
                   className="h-10 px-3 sm:px-4 whitespace-nowrap"
                   title={currentText.compare}
                 >
                   <GitCompare className="h-4 w-4" />
                 </Button>

                 {/* Analytics Button */}
                 <Button
                   variant="outline"
                   size="default"
                   onClick={() => setShowAnalytics(true)}
                   className="h-10 px-3 sm:px-4 whitespace-nowrap"
                   title={currentText.analytics}
                 >
                   <BarChart3 className="h-4 w-4" />
                 </Button>

                 {/* Export Menu */}
                 <div className="relative" ref={exportMenuRef}>
                   <Button
                     variant="outline"
                     size="default"
                     onClick={() => setShowExportMenu(!showExportMenu)}
                     className="h-10 px-3 sm:px-4 whitespace-nowrap"
                     title={currentText.export}
                   >
                     <Download className="h-4 w-4" />
                   </Button>
                   
                   <AnimatePresence>
                     {showExportMenu && (
                       <motion.div
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         transition={{ duration: 0.2 }}
                         className="absolute top-full right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 w-40"
                       >
                         <button
                           onClick={exportCSV}
                           className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent transition-colors text-sm"
                         >
                           <FileSpreadsheet className="h-4 w-4" />
                           Export CSV
                         </button>
                         <button
                           onClick={exportJSON}
                           className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent transition-colors text-sm"
                         >
                           <FileJson className="h-4 w-4" />
                           Export JSON
                         </button>
                         <button
                           onClick={exportPDF}
                           className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent transition-colors text-sm rounded-b-lg"
                         >
                           <FileText className="h-4 w-4" />
                           Export PDF
                         </button>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>

                 {/* Save Search Button */}
                 <Button
                   variant="outline"
                   size="default"
                   onClick={() => setShowSaveDialog(true)}
                   className="h-10 px-3 sm:px-4 whitespace-nowrap"
                   title={currentText.saveSearch}
                 >
                   <Save className="h-4 w-4" />
                 </Button>

                {/* Search Button */}
                <Button
                  onClick={handleQuickSearch}
                  size="default"
                  className="h-10 px-4 sm:px-6 whitespace-nowrap"
                >
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{currentText.searchBtn}</span>
                </Button>

                {/* Filters Toggle Button */}
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className="h-10 px-4 sm:px-6 relative whitespace-nowrap"
                >
                  <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{currentText.filters}</span>
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Expanded Filters in Minimized State */}
              <AnimatePresence>
                {isFiltersExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pb-2">
                      <PropertyAdvancedFilters
                        language={language}
                        onFiltersChange={onFiltersChange}
                        onSearch={(data) => {
                          onSearch(data);
                          setIsFiltersExpanded(false);
                        }}
                        initialFilters={initialFilters}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            ) : (
              // Full View
              <div className="py-4">
                <PropertyAdvancedFilters
                  language={language}
                  onFiltersChange={onFiltersChange}
                  onSearch={onSearch}
                  initialFilters={initialFilters}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Spacer to prevent layout shift */}
      <div className={isMinimized ? "h-16" : "h-0"} />

      {/* Keyboard Navigation Hint Banner - Desktop only */}
      {!isMinimized && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block bg-muted/50 border-b border-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background border border-border rounded text-xs">⌘K</kbd>
                <span>Focus search</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background border border-border rounded text-xs">↑</kbd>
                <kbd className="px-2 py-1 bg-background border border-border rounded text-xs">↓</kbd>
                <span>Navigate suggestions</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background border border-border rounded text-xs">Enter</kbd>
                <span>Apply</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-background border border-border rounded text-xs">Esc</kbd>
                <span>Close</span>
              </div>
              <div className="flex items-center gap-1 md:hidden">
                <span>Long press for voice • Swipe down to minimize</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              {currentText.saveSearch}
            </DialogTitle>
            <DialogDescription>
              Save your current search with filters for quick access later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">{currentText.searchName}</Label>
              <Input
                id="search-name"
                placeholder="e.g., Affordable houses in Jakarta"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                maxLength={50}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
              />
              <p className="text-xs text-muted-foreground">
                {saveName.length}/50 characters
              </p>
            </div>

            {searchQuery && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Current Search:</p>
                <p className="text-muted-foreground">{searchQuery}</p>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {activeFiltersCount} filters active
                  </Badge>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveName('');
              }}
            >
              {currentText.cancel}
            </Button>
            <Button onClick={handleSaveSearch} disabled={!saveName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {currentText.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dashboard Modal */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {currentText.analytics}
            </DialogTitle>
            <DialogDescription>
              Your search activity and insights
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const analytics = getAnalytics();
            const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } = require('recharts');
            const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

            return (
              <div className="space-y-6 py-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Searches</p>
                    <p className="text-2xl font-bold">{analytics.totalSearches}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Saved</p>
                    <p className="text-2xl font-bold">{analytics.savedCount}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Recent</p>
                    <p className="text-2xl font-bold">{analytics.recentCount}</p>
                  </div>
                </div>

                {/* Time Trend Chart */}
                {analytics.timeTrend.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Search Activity (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.timeTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="searches" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Top Locations */}
                {analytics.topLocations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Most Searched Terms</h3>
                    <div className="space-y-2">
                      {analytics.topLocations.map((loc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm capitalize">{loc.location}</span>
                          <Badge variant="secondary">{loc.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Filters */}
                {analytics.topFilters.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Most Used Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {analytics.topFilters.map((filter, idx) => (
                        <Badge key={idx} variant="outline" className="capitalize">
                          {filter.filter}: {filter.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* AI Suggestions Dialog */}
      <Dialog open={showAISuggestions} onOpenChange={setShowAISuggestions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {currentText.aiSuggestions}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {aiSuggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => applyAISuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              {currentText.compareSearches}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {[0, 1].map((idx) => (
              <div key={idx} className="space-y-2">
                <Label>{idx === 0 ? currentText.selectFirst : currentText.selectSecond}</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background"
                  value={compareSearches[idx]?.id || ''}
                  onChange={(e) => {
                    const search = savedSearches.find(s => s.id === e.target.value);
                    if (search) selectCompareSearch(idx as 0 | 1, search);
                  }}
                >
                  <option value="">Select...</option>
                  {savedSearches.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {compareSearches[idx] && (
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium">{compareSearches[idx]!.query}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {compareSearches[0] && compareSearches[1] && (
            <div className="space-y-3">
              <h3 className="font-medium">{currentText.differences}</h3>
              {getFilterDifferences().map((diff, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 text-sm p-2 bg-muted rounded">
                  <div className="font-medium capitalize">{diff.key}</div>
                  <div>{JSON.stringify(diff.value1)}</div>
                  <div>{JSON.stringify(diff.value2)}</div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={!!showShareModal} onOpenChange={() => setShowShareModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              {currentText.shareLink}
            </DialogTitle>
            <DialogDescription>
              {currentText.expiresIn}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast({ title: "Copied!", description: "Link copied to clipboard" });
                }}
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-3 p-4 border rounded-lg bg-muted">
              <QRCodeSVG 
                value={shareUrl} 
                size={200}
                level="H"
                includeMargin={true}
              />
              <p className="text-sm text-muted-foreground">Scan to visit shared search</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Analytics Modal */}
      <Dialog open={!!showShareAnalytics} onOpenChange={() => setShowShareAnalytics(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {currentText.shareAnalytics}
            </DialogTitle>
            <DialogDescription>
              Track performance of your shared search link
            </DialogDescription>
          </DialogHeader>
          
          {shareStats && (
            <div className="space-y-6 py-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">{currentText.views}</p>
                  <p className="text-3xl font-bold">{shareStats.viewCount}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">{currentText.clicks}</p>
                  <p className="text-3xl font-bold">{shareStats.clickCount}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">{currentText.clickRate}</p>
                  <p className="text-3xl font-bold">{shareStats.clickRate}%</p>
                </div>
              </div>

              {/* Views Over Time Chart */}
              {shareStats.timeSeries && shareStats.timeSeries.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">{currentText.viewsOverTime}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={shareStats.timeSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="views" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Referrers */}
              {shareStats.topReferrers && shareStats.topReferrers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">{currentText.topReferrers}</h3>
                  <div className="space-y-2">
                    {shareStats.topReferrers.map((ref: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm truncate flex-1">{ref.domain}</span>
                        <Badge variant="secondary">{ref.count} views</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {currentText.notificationHistory}
              </span>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotifications}
                    >
                      {currentText.clearAll}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markNotificationsRead}
                    >
                      {currentText.markAllRead}
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 border-b pb-2">
            <Button
              variant={notifFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setNotifFilter('all')}
            >
              {currentText.filterAll}
            </Button>
            <Button
              variant={notifFilter === 'new_match' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setNotifFilter('new_match')}
            >
              {currentText.filterNewMatches}
            </Button>
            <Button
              variant={notifFilter === 'price_drop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setNotifFilter('price_drop')}
            >
              {currentText.filterPriceDrops}
            </Button>
          </div>

          <div className="space-y-2 py-4">
            {getFilteredNotifications().length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              getFilteredNotifications().map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg border ${notif.is_read ? 'bg-background' : 'bg-accent'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notif.title}</p>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notif.created_at).toLocaleDateString()} at{' '}
                        {new Date(notif.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {notif.notification_type === 'price_drop' && (
                        <Badge variant="destructive" className="text-xs">
                          {currentText.priceDrops}
                        </Badge>
                      )}
                      {notif.notification_type === 'new_match' && (
                        <Badge variant="default" className="text-xs">
                          {currentText.newMatches}
                        </Badge>
                      )}
                      {!notif.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markNotificationRead(notif.id)}
                          className="text-xs"
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcut Hint */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
          className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-2"
        >
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+K</kbd>
          <span>{currentText.keyboardHint}</span>
        </motion.div>
      </div>

      {/* Voice Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Mic className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">{currentText.listening}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StickySearchPanel;
