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
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentValue <= minValue}
          className="w-8 h-8 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div 
          onClick={() => setShowPresets(true)}
          className="relative flex items-center justify-center h-9 px-3 rounded-lg bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-all min-w-[60px]"
        >
          <span className="text-lg font-bold text-primary">{currentValue}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground hover:scale-110 flex items-center justify-center transition-all shadow-sm"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentValue >= maxValue}
          className="w-8 h-8 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Plus/Minus Control */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentValue <= minValue}
          className="w-8 h-8 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div 
          onClick={() => setShowPresets(!showPresets)}
          className="flex-1 h-9 rounded-lg bg-background border-2 border-muted flex items-center justify-center cursor-pointer hover:border-primary transition-all min-w-[60px]"
        >
          <span className="text-lg font-bold text-foreground">{currentValue}</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentValue >= maxValue}
          className="w-8 h-8 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="w-6 h-6 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive flex items-center justify-center transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        )}
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
