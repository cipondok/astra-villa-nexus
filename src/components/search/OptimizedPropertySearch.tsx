import React, { useState, useMemo, useCallback } from 'react';
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
import { Search, Filter, ChevronLeft, ChevronRight, Clock, Database, Zap, Save, BookmarkCheck, Trash2, Download, FileText, FileSpreadsheet, X, Mic, MicOff } from 'lucide-react';
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
  const [recognition, setRecognition] = useState<any>(null);
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
        
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        
        if (interim) {
          setInterimTranscript(interim);
        }
        
        if (final) {
          setSearchInput(final);
          updateFilters({ searchText: final });
          addToRecentSearches(final);
          setIsListening(false);
          setInterimTranscript('');
          
          toast({
            title: "Voice Search",
            description: `Searching for: "${final}"`
          });
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
        setInterimTranscript('');
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
      stopSound.play().catch(err => console.error('Error playing stop sound:', err));
    } else {
      setIsListening(true);
      setInterimTranscript('');
      recognition.start();
      startSound.play().catch(err => console.error('Error playing start sound:', err));
    }
  }, [recognition, isListening, toast, startSound, stopSound]);

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
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-white rounded-full animate-pulse" />
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
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            
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
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((property) => (
                <Card 
                  key={property.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onResultSelect?.(property.id)}
                >
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
              ))}
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
    </div>
  );
};

export default OptimizedPropertySearch;