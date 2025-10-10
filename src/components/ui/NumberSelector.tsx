import { useState } from "react";
import { Minus, Plus } from "lucide-react";

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
  const maxValue = Math.max(...options);

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

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Plus/Minus Control */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentValue <= minValue}
          className="w-12 h-12 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div 
          onClick={() => setShowPresets(!showPresets)}
          className="flex-1 h-14 rounded-xl bg-background border-2 border-muted flex items-center justify-center cursor-pointer hover:border-primary transition-all"
        >
          <span className="text-3xl font-bold text-foreground">{currentValue}</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentValue >= maxValue}
          className="w-12 h-12 rounded-full bg-muted hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
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
