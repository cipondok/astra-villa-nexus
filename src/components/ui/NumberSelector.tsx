import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface NumberSelectorProps {
  options: number[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

const NumberSelector = ({ options, value, onChange, className = "", compact = false }: NumberSelectorProps) => {
  const [showOptions, setShowOptions] = useState(!value);
  const [lastClicked, setLastClicked] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setShowOptions(!value);
  }, [value]);

  const handleNumberClick = (num: number) => {
    clearTimeout(timeoutRef.current);

    if (lastClicked === num) {
      // Multi-click: concatenate digits
      const newValue = (value || '') + String(num);
      onChange(newValue);
    } else {
      // First click: set value
      onChange(String(num));
      setShowOptions(false);
    }

    setLastClicked(num);
    
    // Reset last clicked after 800ms
    timeoutRef.current = setTimeout(() => {
      setLastClicked(null);
    }, 800);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setShowOptions(true);
    setLastClicked(null);
  };

  const handleShowOptions = () => {
    setShowOptions(true);
  };

  if (!showOptions && value) {
    return (
      <div
        onClick={handleShowOptions}
        className={`relative flex items-center justify-center h-12 px-4 rounded-lg border-2 border-primary bg-primary/10 cursor-pointer hover:bg-primary/20 transition-all ${className}`}
      >
        <span className="text-2xl font-bold text-primary">{value}</span>
        <button
          type="button"
          onClick={handleClear}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map(num => (
        <button
          key={`num-${num}`}
          type="button"
          onClick={() => handleNumberClick(num)}
          className={`${compact ? 'w-10 h-10 text-sm' : 'px-3 h-10 text-sm'} rounded-lg border font-medium transition-all ${
            value === String(num)
              ? 'bg-primary text-primary-foreground shadow-sm scale-105'
              : 'bg-background hover:bg-accent hover:border-primary'
          } ${lastClicked === num ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default NumberSelector;
