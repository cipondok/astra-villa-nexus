import { useState } from "react";
import { Minus, Plus, X } from "lucide-react";

interface NumberSelectorProps {
  options: number[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

const NumberSelector = ({ options, value, onChange, className = "", compact = false }: NumberSelectorProps) => {
  const [showPresets, setShowPresets] = useState(false);
  
  const currentValue = parseInt(value) || 0;
  const minValue = Math.min(...options, 0);
  const maxValue = 25; // Allow up to 25
  const hasValue = value && value !== '0';

  const handleIncrement = () => {
    onChange(String(currentValue + 1));
  };

  const handleDecrement = () => {
    if (currentValue > minValue) {
      onChange(String(currentValue - 1));
    }
  };

  const handlePresetClick = (num: number) => {
    onChange(String(num));
    setShowPresets(false);
  };

  const handleClear = () => {
    onChange('');
    setShowPresets(false);
  };

  // Show compact version when value is selected
  if (hasValue && !showPresets) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentValue <= minValue}
          className="w-9 h-9 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div 
          onClick={() => setShowPresets(true)}
          className="relative flex items-center justify-center h-10 px-4 rounded-lg bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-all"
        >
          <span className="text-xl font-bold text-primary">{currentValue}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-2 w-5 h-5 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive flex items-center justify-center transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentValue >= maxValue}
          className="w-9 h-9 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Plus/Minus Control */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentValue <= minValue}
          className="w-10 h-10 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div 
          onClick={() => setShowPresets(!showPresets)}
          className="flex-1 h-11 rounded-lg bg-background border-2 border-muted flex items-center justify-center cursor-pointer hover:border-primary transition-all"
        >
          <span className="text-2xl font-bold text-foreground">{currentValue}</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentValue >= maxValue}
          className="w-10 h-10 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick preset options */}
      {showPresets && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-muted/30 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map(num => (
            <button
              key={`preset-${num}`}
              type="button"
              onClick={() => handlePresetClick(num)}
              className={`${compact ? 'px-2 h-9 text-xs' : 'px-3 h-10 text-sm'} rounded-lg border font-medium transition-all ${
                value === String(num)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background hover:bg-accent hover:border-primary'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NumberSelector;
