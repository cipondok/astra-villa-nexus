import React, { useState, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useOptimizedPropertySearch } from '@/hooks/useOptimizedPropertySearch';
import { Search, Filter, ChevronLeft, ChevronRight, Clock, Database, Zap, Save, BookmarkCheck, Trash2, Download, FileText, FileSpreadsheet, X, Mic, MicOff, History, HelpCircle, Lightbulb, FileCode, Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

interface OptimizedPropertySearchProps {
  onResultSelect?: (propertyId: string) => void;
  showAnalytics?: boolean;
}

const OptimizedPropertySearch = ({ onResultSelect, showAnalytics = false }: OptimizedPropertySearchProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; filters: any }>>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [recognitionConfidence, setRecognitionConfidence] = useState<number | null>(null);
  const [showRetryOption, setShowRetryOption] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [voiceCommandHistory, setVoiceCommandHistory] = useState<Array<{ command: string; timestamp: Date; filters: any }>>([]);
  const [showVoiceHistory, setShowVoiceHistory] = useState(false);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageSearching, setImageSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'image' | 'combined'>('text');
  const [dragActive, setDragActive] = useState(false);
  const [similarityScores, setSimilarityScores] = useState<Record<string, number>>({});
  const [imageFeatures, setImageFeatures] = useState<any>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const [similarityWeights, setSimilarityWeights] = useState({
    propertyType: 30,
    style: 20,
    architecture: 15,
    bedrooms: 10,
    amenities: 25
  });
  const [startSound] = useState(() => new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSp+zPDTgjUHHGS56+eVSg0PVqzn77BdGQc+ltryxXMoBSuAzvLaizsIHGa86+eXTBELUKbi8LJjHAU7kdj0ynYpBSp+zO/Uf0AKGGKz7OedUg8KRp3h8bl0IAcwh8z0z3osBS2DyvDajjwJHmW66+WZTgwPVKvm8axXFAo6ktXy0nwqBCh7ze7Tgz0LF162+dujUg8IRZve8rlzIwUtgM/z24k5CBtmuuvlnU0PDVSr5O+uWhcHMozQ89F7KwUog8ru1YU/ChZbsezooVcSCkSZ3fG9djAFKn7M8dmPPQkZZbrq5p5NEw5Tp+TwrV0VCTSLzvDTgTwHGmO28uSaTBIOTqXi8K9hGQc4j9DyzHQqByl7zuHVgjwKF2C07eWeSBEJQ5vd8rpzIAcqf8/z14k6CBhjtOvlnk8NDFKp4+2sWhkHNIvN8NF/OwgYYbXs5Z5PCw1Qp+Lwq14WBzWKze/ShTwHGGGz7OSdTBINTaPh76xeGAc2ic7w0YE8BxlhsvHkn04SDk6k4O6pWxYHNYfO79GBOwgZYbPs5Z5PCw5QpuLvrmAXBzaKzvDSgjsIGWGy7OWeTQ0NUKfh8K1eFgo3ic/v0oM7CBpgsfDknk4MDE6l4e6tWxcHNojO8dKBPAgaYLLv5J5OCwxOpOHurVsWBzaJzvHSgTwIGWCx8eSeTgwMTqTh76tcFwY2iM7x0YI7CBtfsO/lnU4NDk2j4e+sWhgHN4fO8NKBOwgaX7Hw5J1ODAxOpOHurlwWBzaIzvDTgTsJGl+x8OSfTgwMTqTh7q5cFgc2iM7v04E8CBpfsO/kn04MDk2k4e6uXBYHNonO8NOCOwgaXrHv5J5ODg1NoOHvq1sXBzaIzu/TgDwIGl6x7+SeTg0NTaHh7qxcFgc3h87w0oE7CBpesO/kn04MDU2k4e6uXBYGNonO79OCOwgZX7Dv5J9ODQxOpOHurlwWBjaIzu/UgDsJGV+w7+SfTg0MTqPh7q5bFgc2iM7v1IA7CBpfsO7kn04ODE6j4e6uWxYGNonO8NOBOwgZX7Dv5J9ODAxOo+HurlsWBzaIzu/TgTsIGV+w7+SfTg0MTqPh7q5bFgc2iM7v04E7CBlfsO/kn04NDE2k4e6uWxYGNojO79OBOwgaXrDv5J9ODQ1No+HurlsWBjaJzu/TgDsJGl+w7+SfTgwOTaLh7q5bFgY2ic7v04A8CBpesO/kn04NDk2h4O6uWhcGN4fO79OAOwgbX7Dv5J5ODg5MouDurlsVBjaJzvDTgDsJGl+w7+SeTg0OTaLg7q1cFQY3iM7v04A7CBtfsO/knk4NDk2h4e6uWxYGN4fO79OAOwgbX7Dv5J5ODg5MoeHurVsVBjaJzvDTgDsJGl+w7+SeTg0OTaLg7q1cFQY3iM7v04A7CBtfsO/kn04NDk2h4e6uWxYGN4fO79OAOwgbX7Dv5J5ODg5MoeHurlsVBjaJzvDTgDsJGl+w7+SeTg0OTaLg7q1cFQY3iM7v04A7CBtfsO/kn04NDk2h4e6uWxYGN4fO79OAOwgbX7Dv5J5ODg5MoeHurlsVBjaJzvDTgDsJGl+w7+SeTg0OTaLg7q1cFQY3iM7v04A7CBtfsO/kn04NDk2h4e6uWxYGN4fO79OAOwgbX7Dv5J5ODg5MoeHurlsVBjaJzvDTgDsJGl+w7+SeTg0OTaLg7q1cFQY3iM7v04A7CBtfsO/kn04NDk2h4e6uWxYGN4fO79OAOwgbX7Dv5J5ODg5MoeHurlsVBjaJzvDTgDsJGl+w7+SeTg0OTaLg7q1cFQY3iM7v04A7CA=='));
  const [stopSound] = useState(() => new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm1dIBAAAAAABABEQB8AAEAfAAABAAgAZGF0YQoGAACAgoSBfn18fXx9fH19fXx+fX1+fn5+f39+f39/f39/gICAgICAgH+AgH+Af4B/gH+Af39/f39+fn5+fn19fX19fXx9fH1+fX5+f35+f39/f4B/gIB/gICAgICAgICAf4B/gH+Af39+fn5+fn59fX19fX19fH59fn9+f39/f39/gH+AgICAgICAfwB+f39+f35+fn59fX19fXx9fX1+fX5+f39/f3+Af4CAgICAgICAgH+Af39/f35+fn5+fX19fX18fX19fn5+f35/f39/gH+AgH+AgICAgIB/f39/f35+fn5+fn18fX19fX5+fn5/fn9/f39/gH+AgIB/gICAf4B/f39+fn5+fn19fX19fX19fn5+f39/f39/gH+AgICAgICAf4B/f39/fn5+fn59fX19fX19fX5+f35/f39/f4CAgICAgICAgH+Af35+fn5+fn19fX19fX5+fn5/f39/f3+AgICAgICAgIB/f39/fn5+fn59fX19fX19fn5+f39/f39/gICAgICAgICAgH+Af35+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgICAgH9/f39+fn5+fn19fX19fX5+fn9/f39/f4CAgICAgA=='));
  const { toast } = useToast();
  
  React.useEffect(() => {
    startSound.volume = 0.5;
    stopSound.volume = 0.5;
  }, [startSound, stopSound]);
  
  const {
    searchResponse,
    filters,
    suggestions,
    updateFilters,
    fetchSuggestions,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    clearCache
  } = useOptimizedPropertySearch();

  // Load saved searches from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
    
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
    
    const savedLanguage = localStorage.getItem('voiceSearchLanguage');
    if (savedLanguage) {
      setVoiceLanguage(savedLanguage);
    }

    const voiceHistory = localStorage.getItem('voiceCommandHistory');
    if (voiceHistory) {
      const parsed = JSON.parse(voiceHistory);
      // Convert timestamp strings back to Date objects
      const historyWithDates = parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      setVoiceCommandHistory(historyWithDates);
    }
  }, []);

  // Language options for voice search
  const voiceLanguages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  ];

  // Initialize Web Speech API
  React.useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = voiceLanguage;

      recognitionInstance.onresult = (event: any) => {
        let interim = '';
        let final = '';
        let confidence = 0;
        
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const resultConfidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            final += transcript;
            confidence = resultConfidence;
          } else {
            interim += transcript;
          }
        }
        
        if (interim) {
          setInterimTranscript(interim);
        }
        
        if (final) {
          setRecognitionConfidence(confidence);
          setLastTranscript(final);
          
          // Low confidence threshold (below 70%)
          if (confidence < 0.7) {
            setShowRetryOption(true);
            setIsListening(false);
            setInterimTranscript('');
            
            toast({
              title: "Low Confidence",
              description: `Understood: "${final}" (${Math.round(confidence * 100)}% confident). Would you like to retry?`,
              variant: "destructive"
            });
            return;
          }
          
          // Parse voice command for filters
          const parsedFilters = parseVoiceCommand(final);
          
          if (Object.keys(parsedFilters).length > 0) {
            // Voice command contains filters
            updateFilters(parsedFilters);
            setSearchInput('');
            setIsListening(false);
            setInterimTranscript('');
            setShowRetryOption(false);
            setRecognitionConfidence(null);

            // Add to voice command history
            addToVoiceHistory(final, parsedFilters);
            
            const filterDescriptions = [];
            if (parsedFilters.propertyType) filterDescriptions.push(`Type: ${parsedFilters.propertyType}`);
            if (parsedFilters.minBedrooms) filterDescriptions.push(`${parsedFilters.minBedrooms}+ bedrooms`);
            if (parsedFilters.minBathrooms) filterDescriptions.push(`${parsedFilters.minBathrooms}+ bathrooms`);
            if (parsedFilters.maxPrice) filterDescriptions.push(`Under $${parsedFilters.maxPrice.toLocaleString()}`);
            if (parsedFilters.minPrice) filterDescriptions.push(`Over $${parsedFilters.minPrice.toLocaleString()}`);
            if (parsedFilters.amenities) filterDescriptions.push(`Amenities: ${parsedFilters.amenities.join(', ')}`);
            
            toast({
              title: "Filters Applied",
              description: `${filterDescriptions.join(' • ')} (${Math.round(confidence * 100)}% confidence)`
            });
          } else {
            // Regular search text
            setSearchInput(final);
            updateFilters({ searchText: final });
            addToRecentSearches(final);
            setIsListening(false);
            setInterimTranscript('');
            setShowRetryOption(false);
            setRecognitionConfidence(null);
            
            toast({
              title: "Voice Search",
              description: `Searching for: "${final}" (${Math.round(confidence * 100)}% confidence)`
            });
          }
        }
      };

      recognitionInstance.onerror = (event: any) => {
        setIsListening(false);
        setInterimTranscript('');
        toast({
          title: "Voice Search Error",
          description: event.error === 'no-speech' ? 'No speech detected' : 'Please try again',
          variant: "destructive"
        });
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        if (!showRetryOption) {
          setInterimTranscript('');
          setRecognitionConfidence(null);
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [updateFilters, toast, voiceLanguage]);

  const { results, totalCount, page, totalPages, isLoading, error, responseTime, cacheHit } = searchResponse;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateFilters({ searchText: value });
    fetchSuggestions(value);
    setShowRecentSearches(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    updateFilters({ searchText: suggestion });
    setShowRecentSearches(false);
    addToRecentSearches(suggestion);
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchInput(query);
    updateFilters({ searchText: query });
    setShowRecentSearches(false);
  };

  const addToRecentSearches = (query: string) => {
    if (!query.trim() || query.length < 2) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setShowRecentSearches(false);
    toast({
      title: "Recent Searches Cleared",
      description: "Your search history has been removed"
    });
  };

  const handleSearchFocus = () => {
    if (!searchInput && recentSearches.length > 0) {
      setShowRecentSearches(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay to allow click on recent search items
    setTimeout(() => setShowRecentSearches(false), 200);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ searchText: undefined });
    setShowRecentSearches(false);
  };

  const handleVoiceSearch = useCallback(() => {
    if (!recognition) {
      toast({
        title: "Voice Search Unavailable",
        description: "Your browser doesn't support voice input",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setInterimTranscript('');
      setShowRetryOption(false);
      setRecognitionConfidence(null);
      stopSound.play().catch(err => console.error('Error playing stop sound:', err));
    } else {
      setIsListening(true);
      setInterimTranscript('');
      setShowRetryOption(false);
      setRecognitionConfidence(null);
      recognition.start();
      startSound.play().catch(err => console.error('Error playing start sound:', err));
    }
  }, [recognition, isListening, toast, startSound, stopSound]);

  const handleRetry = () => {
    setShowRetryOption(false);
    setRecognitionConfidence(null);
    setLastTranscript('');
    handleVoiceSearch();
  };

  const addToVoiceHistory = (command: string, filters: any) => {
    const newEntry = {
      command,
      timestamp: new Date(),
      filters
    };

    const updated = [newEntry, ...voiceCommandHistory].slice(0, 10); // Keep last 10 commands
    setVoiceCommandHistory(updated);
    localStorage.setItem('voiceCommandHistory', JSON.stringify(updated));
  };

  // Voice command templates
  const voiceTemplates = [
    {
      name: 'Affordable Apartments',
      command: 'Apartments under 500k',
      filters: { propertyType: 'apartment', maxPrice: 500000 }
    },
    {
      name: 'Family Houses',
      command: '3 bedrooms house for sale',
      filters: { propertyType: 'house', minBedrooms: 3, listingType: 'sale' }
    },
    {
      name: 'Luxury Rentals',
      command: 'Apartments for rent over 1 million with pool',
      filters: { propertyType: 'apartment', listingType: 'rent', minPrice: 1000000, amenities: ['Pool'] }
    },
    {
      name: 'Budget Rentals',
      command: 'Apartments for rent under 5 million',
      filters: { propertyType: 'apartment', listingType: 'rent', maxPrice: 5000000 }
    },
    {
      name: 'Modern Condos',
      command: 'Apartments with gym and parking',
      filters: { propertyType: 'apartment', amenities: ['Gym', 'Parking'] }
    },
    {
      name: 'Spacious Homes',
      command: '4 bedroom 3 bathroom house',
      filters: { propertyType: 'house', minBedrooms: 4, minBathrooms: 3 }
    },
    {
      name: 'Secure Living',
      command: 'Properties with security and parking',
      filters: { amenities: ['Security', 'Parking'] }
    },
    {
      name: 'Premium Villas',
      command: 'Villas over 2 million with pool and garden',
      filters: { propertyType: 'villa', minPrice: 2000000, amenities: ['Pool', 'Garden'] }
    },
    {
      name: 'Student Housing',
      command: 'Apartments for rent under 3 million',
      filters: { propertyType: 'apartment', listingType: 'rent', maxPrice: 3000000 }
    },
    {
      name: 'Office Spaces',
      command: 'Commercial properties with parking',
      filters: { propertyType: 'commercial', amenities: ['Parking'] }
    }
  ];

  const applyTemplate = (template: typeof voiceTemplates[0]) => {
    updateFilters(template.filters);
    setShowTemplates(false);
    
    toast({
      title: "Template Applied",
      description: `"${template.name}" - ${template.command}`
    });
  };

  // Image upload handlers
  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPG, PNG, WebP)",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedImage(base64);
      setShowImageUpload(false);
      performImageSearch(base64);
    };
    reader.readAsDataURL(file);
  };

  const performImageSearch = async (imageBase64: string) => {
    setImageSearching(true);
    setSearchMode('image');

    try {
      // Get current search results to analyze their images
      const propertiesToAnalyze = results.map(result => ({
        id: result.id,
        imageUrl: result.thumbnail_url || (result.images && result.images[0]) || null
      })).filter(p => p.imageUrl);

      // Call edge function to analyze the uploaded image and compare with properties
            const { data, error } = await supabase.functions.invoke('analyze-property-image', {
              body: {
                imageUrl: imageBase64,
                propertyImages: propertiesToAnalyze,
                weights: similarityWeights
              }
            });

      if (error) {
        throw error;
      }

      const { uploadedFeatures, similarities } = data;
      setImageFeatures(uploadedFeatures);

      // Create similarity score map
      const scoresMap: Record<string, number> = {};
      similarities.forEach((s: any) => {
        scoresMap[s.propertyId] = s.similarity;
      });
      setSimilarityScores(scoresMap);

      // Apply filters based on image analysis
      const imageFilters: any = {};

      if (uploadedFeatures.propertyType) {
        imageFilters.propertyType = uploadedFeatures.propertyType;
      }

      if (uploadedFeatures.bedrooms && uploadedFeatures.bedrooms > 0) {
        imageFilters.minBedrooms = uploadedFeatures.bedrooms;
      }

      const amenities = [];
      if (uploadedFeatures.hasPool) amenities.push('Pool');
      if (uploadedFeatures.hasGarden) amenities.push('Garden');
      if (uploadedFeatures.hasBalcony) amenities.push('Balcony');
      if (amenities.length > 0) {
        imageFilters.amenities = amenities;
      }

      updateFilters(imageFilters);

      const description = [];
      if (uploadedFeatures.propertyType) description.push(uploadedFeatures.propertyType);
      if (uploadedFeatures.style) description.push(uploadedFeatures.style);
      if (uploadedFeatures.bedrooms > 0) description.push(`${uploadedFeatures.bedrooms} bedrooms`);
      if (amenities.length > 0) description.push(amenities.join(', '));

      toast({
        title: "Image Analysis Complete",
        description: `Detected: ${description.join(' • ')}`
      });

    } catch (error: any) {
      console.error('Image search error:', error);
      
      let errorMessage = "Please try again or use text search";
      if (error.message?.includes('Rate limit')) {
        errorMessage = "Rate limit exceeded. Please try again in a moment.";
      } else if (error.message?.includes('Payment required')) {
        errorMessage = "AI credits needed. Please add credits to continue.";
      }
      
      toast({
        title: "Image Search Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setImageSearching(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const clearImageSearch = () => {
    setUploadedImage(null);
    setSearchMode('text');
    setSimilarityScores({});
    setImageFeatures(null);
    handleResetFilters();
  };

  // Sort results by similarity score when in image search mode
  const sortedResults = useMemo(() => {
    if (searchMode !== 'image' || Object.keys(similarityScores).length === 0) {
      return results;
    }

    return [...results].sort((a, b) => {
      const scoreA = similarityScores[a.id] || 0;
      const scoreB = similarityScores[b.id] || 0;
      return scoreB - scoreA;
    });
  }, [results, similarityScores, searchMode]);

  const replayVoiceCommand = (historyItem: { command: string; filters: any }) => {
    updateFilters(historyItem.filters);
    setShowVoiceHistory(false);
    
    const filterDescriptions = [];
    if (historyItem.filters.propertyType) filterDescriptions.push(`Type: ${historyItem.filters.propertyType}`);
    if (historyItem.filters.minBedrooms) filterDescriptions.push(`${historyItem.filters.minBedrooms}+ bedrooms`);
    if (historyItem.filters.minBathrooms) filterDescriptions.push(`${historyItem.filters.minBathrooms}+ bathrooms`);
    if (historyItem.filters.maxPrice) filterDescriptions.push(`Under $${historyItem.filters.maxPrice.toLocaleString()}`);
    if (historyItem.filters.minPrice) filterDescriptions.push(`Over $${historyItem.filters.minPrice.toLocaleString()}`);
    if (historyItem.filters.amenities) filterDescriptions.push(`Amenities: ${historyItem.filters.amenities.join(', ')}`);
    
    toast({
      title: "Voice Command Replayed",
      description: filterDescriptions.join(' • ')
    });
  };

  const clearVoiceHistory = () => {
    setVoiceCommandHistory([]);
    localStorage.removeItem('voiceCommandHistory');
    setShowVoiceHistory(false);
    toast({
      title: "Voice History Cleared",
      description: "All voice command history has been removed"
    });
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleAcceptLowConfidence = () => {
    if (lastTranscript) {
      const parsedFilters = parseVoiceCommand(lastTranscript);
      
      if (Object.keys(parsedFilters).length > 0) {
        updateFilters(parsedFilters);
        setSearchInput('');
        
        const filterDescriptions = [];
        if (parsedFilters.propertyType) filterDescriptions.push(`Type: ${parsedFilters.propertyType}`);
        if (parsedFilters.minBedrooms) filterDescriptions.push(`${parsedFilters.minBedrooms}+ bedrooms`);
        if (parsedFilters.minBathrooms) filterDescriptions.push(`${parsedFilters.minBathrooms}+ bathrooms`);
        if (parsedFilters.maxPrice) filterDescriptions.push(`Under $${parsedFilters.maxPrice.toLocaleString()}`);
        if (parsedFilters.minPrice) filterDescriptions.push(`Over $${parsedFilters.minPrice.toLocaleString()}`);
        if (parsedFilters.amenities) filterDescriptions.push(`Amenities: ${parsedFilters.amenities.join(', ')}`);
        
        toast({
          title: "Filters Applied",
          description: filterDescriptions.join(' • ')
        });
      } else {
        setSearchInput(lastTranscript);
        updateFilters({ searchText: lastTranscript });
        addToRecentSearches(lastTranscript);
        
        toast({
          title: "Voice Search",
          description: `Searching for: "${lastTranscript}"`
        });
      }
    }
    
    setShowRetryOption(false);
    setRecognitionConfidence(null);
    setLastTranscript('');
  };

  const handleLanguageChange = (newLanguage: string) => {
    setVoiceLanguage(newLanguage);
    localStorage.setItem('voiceSearchLanguage', newLanguage);
    
    // If currently listening, restart with new language
    if (isListening && recognition) {
      recognition.stop();
      setTimeout(() => {
        recognition.lang = newLanguage;
        recognition.start();
      }, 100);
    }
    
    const langName = voiceLanguages.find(l => l.code === newLanguage)?.name || newLanguage;
    toast({
      title: "Language Changed",
      description: `Voice search now set to ${langName}`
    });
  };

  // Parse voice commands to extract filter parameters
  const parseVoiceCommand = (text: string): any => {
    const lowerText = text.toLowerCase();
    const filters: any = {};
    
    // Property type detection
    if (lowerText.includes('apartment') || lowerText.includes('condo')) {
      filters.propertyType = 'apartment';
    } else if (lowerText.includes('house') || lowerText.includes('home')) {
      filters.propertyType = 'house';
    } else if (lowerText.includes('villa')) {
      filters.propertyType = 'villa';
    } else if (lowerText.includes('commercial') || lowerText.includes('office')) {
      filters.propertyType = 'commercial';
    } else if (lowerText.includes('land')) {
      filters.propertyType = 'land';
    }
    
    // Listing type detection
    if (lowerText.includes('for rent') || lowerText.includes('rental') || lowerText.includes('to rent')) {
      filters.listingType = 'rent';
    } else if (lowerText.includes('for sale') || lowerText.includes('buy') || lowerText.includes('purchase')) {
      filters.listingType = 'sale';
    }
    
    // Bedroom detection (e.g., "3 bedrooms", "3 bedroom", "three bedroom")
    const bedroomMatch = lowerText.match(/(\d+|one|two|three|four|five|six)\s*(bed|bedroom)/i);
    if (bedroomMatch) {
      const bedroomMap: any = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
      filters.minBedrooms = bedroomMap[bedroomMatch[1]] || parseInt(bedroomMatch[1]);
    }
    
    // Bathroom detection
    const bathroomMatch = lowerText.match(/(\d+|one|two|three|four)\s*(bath|bathroom)/i);
    if (bathroomMatch) {
      const bathroomMap: any = { one: 1, two: 2, three: 3, four: 4 };
      filters.minBathrooms = bathroomMap[bathroomMatch[1]] || parseInt(bathroomMatch[1]);
    }
    
    // Price detection (e.g., "under 500k", "below 1 million", "under 500000")
    const priceUnderMatch = lowerText.match(/(?:under|below|less than|max)\s*(?:\$|rp)?[\s]*([\d,]+)\s*([km]|million|thousand)?/i);
    if (priceUnderMatch) {
      let price = parseInt(priceUnderMatch[1].replace(/,/g, ''));
      const unit = priceUnderMatch[2]?.toLowerCase();
      
      if (unit === 'k' || unit === 'thousand') {
        price *= 1000;
      } else if (unit === 'm' || unit === 'million') {
        price *= 1000000;
      }
      
      filters.maxPrice = price;
    }
    
    // Price minimum (e.g., "over 1 million", "above 500k")
    const priceOverMatch = lowerText.match(/(?:over|above|more than|min)\s*(?:\$|rp)?[\s]*([\d,]+)\s*([km]|million|thousand)?/i);
    if (priceOverMatch) {
      let price = parseInt(priceOverMatch[1].replace(/,/g, ''));
      const unit = priceOverMatch[2]?.toLowerCase();
      
      if (unit === 'k' || unit === 'thousand') {
        price *= 1000;
      } else if (unit === 'm' || unit === 'million') {
        price *= 1000000;
      }
      
      filters.minPrice = price;
    }
    
    // Amenities detection
    const detectedAmenities: string[] = [];
    if (lowerText.includes('pool') || lowerText.includes('swimming')) {
      detectedAmenities.push('Pool');
    }
    if (lowerText.includes('gym') || lowerText.includes('fitness')) {
      detectedAmenities.push('Gym');
    }
    if (lowerText.includes('parking') || lowerText.includes('garage')) {
      detectedAmenities.push('Parking');
    }
    if (lowerText.includes('security') || lowerText.includes('guard')) {
      detectedAmenities.push('Security');
    }
    if (lowerText.includes('garden') || lowerText.includes('yard')) {
      detectedAmenities.push('Garden');
    }
    if (lowerText.includes('balcony') || lowerText.includes('terrace')) {
      detectedAmenities.push('Balcony');
    }
    if (lowerText.includes('air conditioning') || lowerText.includes('ac') || lowerText.includes('aircon')) {
      detectedAmenities.push('Air Conditioning');
    }
    if (lowerText.includes('elevator') || lowerText.includes('lift')) {
      detectedAmenities.push('Elevator');
    }
    
    if (detectedAmenities.length > 0) {
      filters.amenities = detectedAmenities;
    }
    
    return filters;
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="font-bold text-primary">{part}</span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    updateFilters({ amenities: newAmenities.length > 0 ? newAmenities : undefined });
  };

  const amenitiesList = [
    'Pool',
    'Gym',
    'Parking',
    'Security',
    'Garden',
    'Balcony',
    'Air Conditioning',
    'Elevator'
  ];

  // Count active filters (excluding searchText and sortBy)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.listingType) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minBedrooms) count++;
    if (filters.minBathrooms) count++;
    if (filters.minArea || filters.maxArea) count++;
    if (filters.amenities && filters.amenities.length > 0) count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    updateFilters({
      propertyType: undefined,
      listingType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minBedrooms: undefined,
      minBathrooms: undefined,
      minArea: undefined,
      maxArea: undefined,
      amenities: undefined,
      sortBy: undefined
    });
    setSearchInput('');
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this search",
        variant: "destructive"
      });
      return;
    }

    const newSearch = {
      name: searchName.trim(),
      filters: { ...filters, searchText: searchInput }
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    
    toast({
      title: "Search Saved",
      description: `"${searchName}" has been saved successfully`
    });

    setSearchName('');
    setSaveDialogOpen(false);
  };

  const handleApplySavedSearch = (search: { name: string; filters: any }) => {
    const { searchText, ...restFilters } = search.filters;
    setSearchInput(searchText || '');
    updateFilters(restFilters);
    setSavedSearchesOpen(false);
    
    toast({
      title: "Search Applied",
      description: `Applied "${search.name}" filters`
    });
  };

  const handleDeleteSavedSearch = (index: number) => {
    const updated = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    
    toast({
      title: "Search Deleted",
      description: "Saved search has been removed"
    });
  };

  const handleExportCSV = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Title', 'Type', 'Listing', 'Price', 'Bedrooms', 'Bathrooms', 'Area (sqm)', 'Location', 'City'];
    const csvContent = [
      headers.join(','),
      ...results.map(property => [
        `"${property.title.replace(/"/g, '""')}"`,
        property.property_type,
        property.listing_type,
        property.price,
        property.bedrooms,
        property.bathrooms,
        property.area_sqm || 0,
        `"${property.area.replace(/"/g, '""')}"`,
        property.city
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `property-search-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setExportMenuOpen(false);
    toast({
      title: "Export Successful",
      description: "CSV file has been downloaded"
    });
  };

  const handleExportPDF = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #0066cc; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:hover { background-color: #f5f5f5; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Property Search Results</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Total Results: ${totalCount}</p>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Price</th>
                <th>Beds</th>
                <th>Baths</th>
                <th>Area (sqm)</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(property => `
                <tr>
                  <td>${property.title}</td>
                  <td>${property.property_type}</td>
                  <td>$${property.price.toLocaleString()}</td>
                  <td>${property.bedrooms}</td>
                  <td>${property.bathrooms}</td>
                  <td>${property.area_sqm || 'N/A'}</td>
                  <td>${property.city}, ${property.area}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>This document contains ${results.length} properties from the search results.</p>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `property-search-results-${new Date().toISOString().split('T')[0]}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      })
      .save()
      .then(() => {
        setExportMenuOpen(false);
        toast({
          title: "Export Successful",
          description: "PDF file has been downloaded"
        });
      });
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F key - Toggle filters
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if not typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowFilters(prev => !prev);
        }
      }
      
      // Ctrl+S or Cmd+S - Save search
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (activeFilterCount > 0 || searchInput) {
          e.preventDefault();
          setSaveDialogOpen(true);
        }
      }
      
      // Ctrl+X or Cmd+X - Clear all filters
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        if (activeFilterCount > 0 || searchInput || filters.sortBy) {
          e.preventDefault();
          handleResetFilters();
        }
      }
      
      // Ctrl+M or Cmd+M - Toggle voice search
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        handleVoiceSearch();
      }
      
      // Escape - Close dialogs/popovers
      if (e.key === 'Escape') {
        setSaveDialogOpen(false);
        setSavedSearchesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFilterCount, searchInput, filters.sortBy, handleVoiceSearch]);

  const SkeletonCard = () => (
    <Card className="h-48">
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-20 w-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Live Transcription Banner */}
      {isListening && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  {/* Animated Waveform */}
                  <div className="flex items-center gap-0.5 h-6">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white rounded-full"
                        style={{
                          animation: `waveform 1s ease-in-out infinite`,
                          animationDelay: `${i * 0.1}s`,
                          height: '100%'
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">Listening...</span>
                </div>
                <div className="flex-1 text-base font-medium">
                  {interimTranscript || "Start speaking..."}
                </div>
                <Select value={voiceLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[160px] bg-white/20 hover:bg-white/30 text-white border-white/30 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-[60]">
                    {voiceLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleVoiceSearch}
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Stop (Ctrl+M)
                </Button>
              </div>
            </div>
          </div>
          <style>{`
            @keyframes waveform {
              0%, 100% {
                transform: scaleY(0.3);
              }
              50% {
                transform: scaleY(1);
              }
            }
          `}</style>
        </div>
      )}

      {/* Low Confidence Retry Banner */}
      {showRetryOption && recognitionConfidence !== null && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold">Low Confidence Detected</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {Math.round(recognitionConfidence * 100)}% confident
                    </Badge>
                  </div>
                  <p className="text-sm">
                    Understood: "{lastTranscript}"
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRetry}
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Retry
                  </Button>
                  <Button
                    onClick={handleAcceptLowConfidence}
                    size="sm"
                    variant="secondary"
                    className="bg-white text-orange-600 hover:bg-white/90"
                  >
                    Accept Anyway
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRetryOption(false);
                      setRecognitionConfidence(null);
                      setLastTranscript('');
                    }}
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Optimized Property Search
              <Badge variant="secondary" className="text-xs font-normal">
                Shortcuts: F (filters) • Ctrl+S (save) • Ctrl+M (voice) • Ctrl+X (clear)
              </Badge>
            </div>
            {showAnalytics && (
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={cacheHit ? "secondary" : "outline"} className="gap-1">
                  {cacheHit ? <Zap className="h-3 w-3" /> : <Database className="h-3 w-3" />}
                  {cacheHit ? 'Cached' : 'Fresh'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {responseTime}ms
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Input
              placeholder="Search properties by location, title, or description..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className={searchInput ? "pr-28" : "pr-20"}
            />
            <TooltipProvider>
              <Tooltip open={isListening ? true : undefined}>
                <TooltipTrigger asChild>
                  <div className="absolute right-11 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <Button
                      onClick={handleVoiceSearch}
                      size="icon"
                      variant="ghost"
                      className={`h-7 w-7 transition-all ${
                        isListening 
                          ? "text-red-500 hover:text-red-600 animate-pulse ring-2 ring-red-400 ring-offset-2" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-label={isListening ? "Stop recording" : "Start voice search"}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    {!isListening && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-xs hover:bg-muted p-0"
                            aria-label="Select language"
                          >
                            {voiceLanguages.find(l => l.code === voiceLanguage)?.flag || '🌐'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2 bg-popover z-50" align="end">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Voice Search Language</p>
                            {voiceLanguages.map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent transition-colors flex items-center gap-2 ${
                                  voiceLanguage === lang.code ? 'bg-accent font-medium' : ''
                                }`}
                              >
                                <span className="text-base">{lang.flag}</span>
                                <span>{lang.name}</span>
                                {voiceLanguage === lang.code && (
                                  <span className="ml-auto text-primary">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className={isListening ? "bg-red-500 text-white" : ""}>
                  {isListening 
                    ? `🎤 Listening in ${voiceLanguages.find(l => l.code === voiceLanguage)?.name}... (Ctrl+M to stop)` 
                    : `Voice search (Ctrl+M) - ${voiceLanguages.find(l => l.code === voiceLanguage)?.name}`
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Voice Command History Button */}
            {voiceCommandHistory.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowVoiceHistory(true)}
                      className="absolute right-16 top-1/2 transform -translate-y-1/2"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Voice command history ({voiceCommandHistory.length})</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Voice Help Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowVoiceHelp(true)}
                    className={`absolute ${voiceCommandHistory.length > 0 ? 'right-28' : 'right-16'} top-1/2 transform -translate-y-1/2`}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Voice command help & examples</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Templates Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowTemplates(true)}
                    className={`absolute ${voiceCommandHistory.length > 0 ? 'right-40' : 'right-28'} top-1/2 transform -translate-y-1/2`}
                  >
                    <FileCode className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Quick search templates</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}

            {/* Image Search Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant={uploadedImage ? "default" : "ghost"}
                    onClick={() => setShowImageUpload(true)}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2`}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{uploadedImage ? 'Searching by image - Click to change' : 'Picture search - Upload image to find similar properties'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && !showRecentSearches && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors border-b last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {highlightMatch(suggestion, searchInput)}
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-lg">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-6 text-xs hover:text-destructive"
                  >
                    Clear
                  </Button>
                </div>
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors border-b last:border-b-0 flex items-center gap-2"
                    onClick={() => handleRecentSearchClick(query)}
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Image Search Indicator */}
          {uploadedImage && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded border bg-muted overflow-hidden flex-shrink-0">
                    <img 
                      src={uploadedImage} 
                      alt="Search reference" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <p className="font-medium text-sm">Picture Search Active</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Showing properties similar to your uploaded image
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {imageSearching && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearImageSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </div>

              {(activeFilterCount > 0 || searchInput || filters.sortBy) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  Reset All
                </Button>
              )}

              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={!activeFilterCount && !searchInput}
                  >
                    <Save className="h-4 w-4" />
                    Save Search
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Search</DialogTitle>
                    <DialogDescription>
                      Give this search combination a name to quickly access it later.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="e.g., Beach Villas Under 1M"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSearch}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {savedSearches.length > 0 && (
                <Popover open={savedSearchesOpen} onOpenChange={setSavedSearchesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <BookmarkCheck className="h-4 w-4" />
                      Saved ({savedSearches.length})
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold text-sm">Saved Searches</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to apply a saved search
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {savedSearches.map((search, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b last:border-0"
                        >
                          <button
                            onClick={() => handleApplySavedSearch(search)}
                            className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
                          >
                            {search.name}
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSavedSearch(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Popover open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={results.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={handleExportCSV}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={handleExportPDF}
                    >
                      <FileText className="h-4 w-4" />
                      Export as PDF
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Select value={filters.sortBy || ''} onValueChange={(value) => updateFilters({ sortBy: value || undefined })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="area_asc">Area: Small to Large</SelectItem>
                  <SelectItem value="area_desc">Area: Large to Small</SelectItem>
                </SelectContent>
              </Select>
              
              {totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Found {totalCount.toLocaleString()} properties
                </p>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={filters.propertyType || ''} onValueChange={(value) => updateFilters({ propertyType: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.listingType || ''} onValueChange={(value) => updateFilters({ listingType: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Listing Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Listings</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-2 md:col-span-4 space-y-3 p-4 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Price Range</label>
                  <span className="text-sm text-muted-foreground">
                    ${(filters.minPrice || 0).toLocaleString()} - ${(filters.maxPrice || 10000000).toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={10000000}
                  step={50000}
                  value={[filters.minPrice || 0, filters.maxPrice || 10000000]}
                  onValueChange={(value) => updateFilters({ 
                    minPrice: value[0] === 0 ? undefined : value[0],
                    maxPrice: value[1] === 10000000 ? undefined : value[1]
                  })}
                  className="w-full"
                />
              </div>

              <Select value={filters.minBedrooms?.toString() || ''} onValueChange={(value) => updateFilters({ minBedrooms: value ? Number(value) : undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.minBathrooms?.toString() || ''} onValueChange={(value) => updateFilters({ minBathrooms: value ? Number(value) : undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-2 md:col-span-4 space-y-3 p-4 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Area Range (sqm)</label>
                  <span className="text-sm text-muted-foreground">
                    {filters.minArea || 0} - {filters.maxArea || 1000} sqm
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={[filters.minArea || 0, filters.maxArea || 1000]}
                  onValueChange={(value) => updateFilters({ 
                    minArea: value[0] === 0 ? undefined : value[0],
                    maxArea: value[1] === 1000 ? undefined : value[1]
                  })}
                  className="w-full"
                />
              </div>

              <div className="col-span-2 md:col-span-4 space-y-3 p-4 bg-background rounded-md border">
                <label className="text-sm font-medium">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={filters.amenities?.includes(amenity) || false}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label
                        htmlFor={amenity}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={clearCache} size="sm">
                Clear Cache
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Search failed: {error}. Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : sortedResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedResults.map((property) => {
                const similarity = similarityScores[property.id];
                const hasSimilarityScore = searchMode === 'image' && similarity !== undefined;
                
                return (
                  <Card 
                    key={property.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                    onClick={() => onResultSelect?.(property.id)}
                  >
                    {(property.thumbnail_url || (property.images && property.images[0])) && (
                      <div className="relative">
                        <img 
                          src={property.thumbnail_url || property.images[0]}
                          alt={property.title}
                          className="w-full h-48 object-cover"
                        />
                        {hasSimilarityScore && (
                          <div className="absolute top-2 right-2">
                            <Badge 
                              variant={similarity >= 70 ? "default" : similarity >= 50 ? "secondary" : "outline"}
                              className="text-xs font-bold backdrop-blur-sm bg-background/90"
                            >
                              {similarity}% Match
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {property.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-primary">
                            ${property.price?.toLocaleString()}
                          </div>
                          <Badge variant="outline">
                            {property.property_type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{property.city}, {property.area}</span>
                          <span>{property.bedrooms}BR / {property.bathrooms}BA</span>
                        </div>
                        {property.area_sqm && (
                          <div className="text-xs text-muted-foreground">
                            {property.area_sqm} sqm
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or clearing some filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Voice Command History Dialog */}
      <Dialog open={showVoiceHistory} onOpenChange={setShowVoiceHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Voice Command History
            </DialogTitle>
            <DialogDescription>
              Replay previous voice commands to quickly reuse successful searches.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {voiceCommandHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mic className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No voice commands yet</p>
                <p className="text-sm">Use voice search to start building your history</p>
              </div>
            ) : (
              voiceCommandHistory.map((item, index) => {
                const filterDescriptions = [];
                if (item.filters.propertyType) filterDescriptions.push(`${item.filters.propertyType}`);
                if (item.filters.listingType) filterDescriptions.push(item.filters.listingType);
                if (item.filters.minBedrooms) filterDescriptions.push(`${item.filters.minBedrooms}+ beds`);
                if (item.filters.minBathrooms) filterDescriptions.push(`${item.filters.minBathrooms}+ baths`);
                if (item.filters.maxPrice) filterDescriptions.push(`<$${(item.filters.maxPrice / 1000).toFixed(0)}k`);
                if (item.filters.minPrice) filterDescriptions.push(`>$${(item.filters.minPrice / 1000).toFixed(0)}k`);
                if (item.filters.amenities?.length) filterDescriptions.push(`${item.filters.amenities.length} amenities`);

                return (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mic className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <p className="font-medium text-sm truncate">{item.command}</p>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-1">
                          {filterDescriptions.map((desc, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {desc}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(item.timestamp)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => replayVoiceCommand(item)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Replay
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="destructive"
              size="sm"
              onClick={clearVoiceHistory}
              disabled={voiceCommandHistory.length === 0}
              className="mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
            <Button variant="outline" onClick={() => setShowVoiceHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voice Command Help Dialog */}
      <Dialog open={showVoiceHelp} onOpenChange={setShowVoiceHelp}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Voice Command Guide
            </DialogTitle>
            <DialogDescription>
              Learn how to use voice search with natural language commands
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">Quick Tips</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Speak naturally - the system understands conversational language</li>
                    <li>• Combine multiple criteria in one command</li>
                    <li>• Use numbers or words for quantities (e.g., "3" or "three")</li>
                    <li>• Speak clearly and at a normal pace for best results</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Example Commands by Category */}
            <div className="space-y-4">
              <h3 className="font-semibold">Example Commands</h3>

              {/* Property Type */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary">Property Type</h4>
                <div className="grid gap-2">
                  {[
                    'Show me apartments',
                    'Find houses for sale',
                    'Look for villas',
                    'Commercial properties'
                  ].map((cmd, i) => (
                    <div key={i} className="bg-muted/50 rounded px-3 py-2 text-sm font-mono">
                      "{cmd}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary">Price Filters</h4>
                <div className="grid gap-2">
                  {[
                    'Apartments under 500k',
                    'Houses under 1 million',
                    'Properties below 750 thousand',
                    'Villas over 2 million'
                  ].map((cmd, i) => (
                    <div key={i} className="bg-muted/50 rounded px-3 py-2 text-sm font-mono">
                      "{cmd}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary">Bedrooms & Bathrooms</h4>
                <div className="grid gap-2">
                  {[
                    '3 bedroom apartments',
                    'Four bedroom house',
                    'Two bathroom villa',
                    '3 bed 2 bath property'
                  ].map((cmd, i) => (
                    <div key={i} className="bg-muted/50 rounded px-3 py-2 text-sm font-mono">
                      "{cmd}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary">Amenities</h4>
                <div className="grid gap-2">
                  {[
                    'Apartments with pool',
                    'Houses with gym and parking',
                    'Properties with security and garden',
                    'Villa with balcony and air conditioning'
                  ].map((cmd, i) => (
                    <div key={i} className="bg-muted/50 rounded px-3 py-2 text-sm font-mono">
                      "{cmd}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Combined Commands */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary">Combined Commands (Recommended)</h4>
                <div className="grid gap-2">
                  {[
                    '3 bedroom apartments under 500k with pool',
                    'Four bedroom house for rent with parking',
                    'Villas under 2 million with gym and garden',
                    'Two bathroom apartments for sale with security',
                    'Commercial properties over 1 million with elevator'
                  ].map((cmd, i) => (
                    <div key={i} className="bg-muted/50 rounded px-3 py-2 text-sm font-mono">
                      "{cmd}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Listing Type */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary">Listing Type</h4>
                <div className="grid gap-2">
                  {[
                    'Apartments for rent',
                    'Houses for sale',
                    'Properties to rent',
                    'Villas to buy'
                  ].map((cmd, i) => (
                    <div key={i} className="bg-muted/50 rounded px-3 py-2 text-sm font-mono">
                      "{cmd}"
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Supported Keywords */}
            <div className="border rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-sm">Supported Keywords</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">Property Types:</p>
                  <p className="text-muted-foreground">apartment, house, villa, commercial, land</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Listing Types:</p>
                  <p className="text-muted-foreground">rent, sale, buy, purchase, rental</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Price Keywords:</p>
                  <p className="text-muted-foreground">under, below, over, above, less than, more than</p>
                </div>
                <div>
                  <p className="font-medium mb-1">Amenities:</p>
                  <p className="text-muted-foreground">pool, gym, parking, security, garden, balcony, AC, elevator</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowVoiceHelp(false)}>
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voice Command Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Quick Search Templates
            </DialogTitle>
            <DialogDescription>
              Click on any template to instantly apply pre-configured search filters
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {voiceTemplates.map((template, index) => {
              const filterTags = [];
              if (template.filters.propertyType) filterTags.push(template.filters.propertyType);
              if (template.filters.listingType) filterTags.push(template.filters.listingType);
              if (template.filters.minBedrooms) filterTags.push(`${template.filters.minBedrooms}+ beds`);
              if (template.filters.minBathrooms) filterTags.push(`${template.filters.minBathrooms}+ baths`);
              if (template.filters.maxPrice) {
                const price = template.filters.maxPrice;
                if (price >= 1000000) {
                  filterTags.push(`<${price / 1000000}M`);
                } else if (price >= 1000) {
                  filterTags.push(`<${price / 1000}k`);
                }
              }
              if (template.filters.minPrice) {
                const price = template.filters.minPrice;
                if (price >= 1000000) {
                  filterTags.push(`>${price / 1000000}M`);
                } else if (price >= 1000) {
                  filterTags.push(`>${price / 1000}k`);
                }
              }
              if (template.filters.amenities?.length) {
                filterTags.push(...template.filters.amenities);
              }

              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer bg-card"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          "{template.command}"
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          applyTemplate(template);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        Use
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {filterTags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Quick Tip</h3>
                <p className="text-sm text-muted-foreground">
                  After applying a template, you can further customize your search using the filters panel or by speaking additional voice commands.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplates(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Picture Search
            </DialogTitle>
            <DialogDescription>
              Upload a photo of a property to find similar listings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Active Image Search Display */}
            {uploadedImage && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded search"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-1">Active Image Search</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Showing properties similar to your uploaded image
                    </p>
                    {imageFeatures && (
                      <div className="flex flex-wrap gap-1">
                        {imageFeatures.propertyType && (
                          <Badge variant="secondary" className="text-xs">
                            {imageFeatures.propertyType}
                          </Badge>
                        )}
                        {imageFeatures.style && (
                          <Badge variant="secondary" className="text-xs">
                            {imageFeatures.style}
                          </Badge>
                        )}
                        {imageFeatures.bedrooms > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {imageFeatures.bedrooms} beds
                          </Badge>
                        )}
                        {imageFeatures.hasPool && (
                          <Badge variant="secondary" className="text-xs">
                            Pool
                          </Badge>
                        )}
                        {imageFeatures.hasGarden && (
                          <Badge variant="secondary" className="text-xs">
                            Garden
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearImageSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Similarity Weights Configuration */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Similarity Matching Weights</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSimilarityWeights({
                    propertyType: 30,
                    style: 20,
                    architecture: 15,
                    bedrooms: 10,
                    amenities: 25
                  })}
                  className="text-xs"
                >
                  Reset to Default
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Adjust how much each feature influences similarity matching (total should equal 100%)
              </p>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Property Type</Label>
                    <span className="text-sm font-medium">{similarityWeights.propertyType}%</span>
                  </div>
                  <Slider
                    value={[similarityWeights.propertyType]}
                    onValueChange={(value) => setSimilarityWeights(prev => ({ ...prev, propertyType: value[0] }))}
                    min={0}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Style & Design</Label>
                    <span className="text-sm font-medium">{similarityWeights.style}%</span>
                  </div>
                  <Slider
                    value={[similarityWeights.style]}
                    onValueChange={(value) => setSimilarityWeights(prev => ({ ...prev, style: value[0] }))}
                    min={0}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Architecture</Label>
                    <span className="text-sm font-medium">{similarityWeights.architecture}%</span>
                  </div>
                  <Slider
                    value={[similarityWeights.architecture]}
                    onValueChange={(value) => setSimilarityWeights(prev => ({ ...prev, architecture: value[0] }))}
                    min={0}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Bedroom Count</Label>
                    <span className="text-sm font-medium">{similarityWeights.bedrooms}%</span>
                  </div>
                  <Slider
                    value={[similarityWeights.bedrooms]}
                    onValueChange={(value) => setSimilarityWeights(prev => ({ ...prev, bedrooms: value[0] }))}
                    min={0}
                    max={30}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Amenities (Pool, Garden, etc.)</Label>
                    <span className="text-sm font-medium">{similarityWeights.amenities}%</span>
                  </div>
                  <Slider
                    value={[similarityWeights.amenities]}
                    onValueChange={(value) => setSimilarityWeights(prev => ({ ...prev, amenities: value[0] }))}
                    min={0}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="bg-muted/50 rounded p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Weight:</span>
                    <span className={`font-medium ${
                      Object.values(similarityWeights).reduce((a, b) => a + b, 0) === 100 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {Object.values(similarityWeights).reduce((a, b) => a + b, 0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">
                    Drag & drop your image here
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse (JPG, PNG, WebP • Max 5MB)
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload(file);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>

                  {/* Mobile Camera Access */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.capture = 'environment';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload(file);
                      };
                      input.click();
                    }}
                    className="md:hidden"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">How it works:</p>
                  <ul className="space-y-1">
                    <li>• Upload an image of a property you like</li>
                    <li>• Our AI analyzes the image to identify property features</li>
                    <li>• Adjust weights to prioritize what matters most to you</li>
                    <li>• We match those features to similar properties in our database</li>
                    <li>• Results show properties ranked by similarity score</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageUpload(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OptimizedPropertySearch;