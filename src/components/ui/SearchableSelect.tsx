import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  disabled?: boolean;
  className?: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  searchPlaceholder = "Cari...",
  noResultsText = "Tidak ditemukan",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const searchLower = search.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(searchLower)
    );
  }, [options, search]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback((optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[highlightedIndex].value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
  }, [isOpen, highlightedIndex, filteredOptions, handleSelect]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full h-9 px-3 rounded-lg border bg-background text-sm transition-all duration-150",
          disabled
            ? "opacity-50 cursor-not-allowed border-muted bg-muted/30"
            : "border-input hover:border-primary/50 cursor-pointer active:scale-[0.98]",
          isOpen && "border-primary ring-2 ring-primary/20"
        )}
      >
        <span className={cn(
          "truncate text-left",
          selectedOption ? "text-foreground" : "text-muted-foreground"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-2",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
          onKeyDown={handleKeyDown}
        >
          <div className="p-1.5 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0);
                }}
                placeholder={searchPlaceholder}
                className="w-full h-7 pl-7 pr-7 text-xs bg-muted/40 border-0 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
                onKeyDown={handleKeyDown}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div ref={listRef} className="max-h-44 overflow-y-auto overscroll-contain py-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                {noResultsText}
              </div>
            ) : (
              filteredOptions.map((opt, idx) => (
                <button
                  key={opt.value}
                  type="button"
                  data-option
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-left transition-colors rounded-sm mx-0.5",
                    "first:mt-0.5 last:mb-0.5",
                    value === opt.value
                      ? "bg-primary/10 text-primary font-medium"
                      : highlightedIndex === idx
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                  )}
                  style={{ width: 'calc(100% - 4px)' }}
                >
                  <span className="truncate">{opt.label}</span>
                  {value === opt.value && <Check className="w-3.5 h-3.5 shrink-0 ml-2 text-primary" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
