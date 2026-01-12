import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

interface PillOption {
  value: string;
  label: string;
}

interface PillSelectorProps {
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const PillSelector = ({ options, value, onChange, placeholder, className = "" }: PillSelectorProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const selectedOption = options.find(opt => opt.value === value);
  const hasValue = !!value;

  const handleSelect = (optionValue: string) => {
    const currentScroll = window.scrollY;
    onChange(optionValue);
    setShowOptions(false);
    requestAnimationFrame(() => window.scrollTo(0, currentScroll));
  };

  // Calculate dropdown position when it opens (viewport-relative for fixed positioning)
  useEffect(() => {
    if (showOptions && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [showOptions]);

  // Close on outside click
  useEffect(() => {
    if (!showOptions) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const currentScroll = window.scrollY;
        setShowOptions(false);
        requestAnimationFrame(() => window.scrollTo(0, currentScroll));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  // Show compact selected state
  if (hasValue && !showOptions) {
    return (
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentScroll = window.scrollY;
          setShowOptions(true);
          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
        }}
        onTouchStart={(e) => e.stopPropagation()}
        className={`flex items-center justify-between h-8 px-3 rounded-md bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-all ${className}`}
      >
        <span className="text-xs font-medium text-primary">{selectedOption?.label}</span>
        <ChevronDown className="w-3 h-3 text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {/* Selected value or placeholder */}
        <div
          ref={triggerRef}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const currentScroll = window.scrollY;
            setShowOptions(!showOptions);
            requestAnimationFrame(() => window.scrollTo(0, currentScroll));
          }}
          onTouchStart={(e) => e.stopPropagation()}
          className="flex items-center justify-between h-8 px-3 rounded-md bg-background border border-muted cursor-pointer hover:border-primary transition-all"
        >
          <span className={`text-xs ${hasValue ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Options list - rendered in portal to prevent layout shift */}
      {showOptions && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[1px]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const currentScroll = window.scrollY;
              setShowOptions(false);
              requestAnimationFrame(() => window.scrollTo(0, currentScroll));
            }}
            onTouchStart={(e) => e.stopPropagation()}
          />
          {/* Dropdown */}
          <div 
            className="fixed z-[9999] flex flex-wrap gap-1 p-2 bg-background/95 backdrop-blur-sm rounded-md shadow-lg border border-border animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto overscroll-contain"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              minWidth: `${dropdownPosition.width}px`,
              maxWidth: '90vw'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(opt.value);
                }}
                onTouchStart={(e) => e.stopPropagation()}
                className={`px-2.5 h-7 rounded-md border text-xs font-medium transition-all flex items-center gap-1 active:scale-95 ${
                  value === opt.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-background hover:bg-accent hover:border-primary'
                }`}
              >
                {value === opt.value && <Check className="w-3 h-3" />}
                {opt.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default PillSelector;
