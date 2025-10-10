import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

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
  
  const selectedOption = options.find(opt => opt.value === value);
  const hasValue = !!value;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setShowOptions(false);
  };

  // Show compact selected state
  if (hasValue && !showOptions) {
    return (
      <div
        onClick={() => setShowOptions(true)}
        className={`flex items-center justify-between h-8 px-3 rounded-md bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-all ${className}`}
      >
        <span className="text-xs font-medium text-primary">{selectedOption?.label}</span>
        <ChevronDown className="w-3 h-3 text-primary" />
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Selected value or placeholder */}
      <div
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center justify-between h-8 px-3 rounded-md bg-background border border-muted cursor-pointer hover:border-primary transition-all"
      >
        <span className={`text-xs ${hasValue ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
      </div>

      {/* Options list */}
      {showOptions && (
        <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-md animate-in fade-in slide-in-from-top-2 duration-200 relative z-10">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
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
      )}
    </div>
  );
};

export default PillSelector;
