import { useState, useRef, useEffect } from "react";
import { X, Delete } from "lucide-react";

interface NumberSelectorProps {
  options: number[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  compact?: boolean;
}

const NumberSelector = ({ options, value, onChange, className = "", compact = false }: NumberSelectorProps) => {
  const [editMode, setEditMode] = useState(!value);
  const [lastClicked, setLastClicked] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setEditMode(!value);
  }, [value]);

  const handleNumberClick = (num: number) => {
    clearTimeout(timeoutRef.current);

    if (editMode) {
      // In edit mode: append digit
      const newValue = (value || '') + String(num);
      onChange(newValue);
    } else {
      // First click after preset: set value directly
      onChange(String(num));
      setEditMode(true);
    }

    setLastClicked(num);
    
    // Reset last clicked after 500ms
    timeoutRef.current = setTimeout(() => {
      setLastClicked(null);
    }, 500);
  };

  const handleBackspace = () => {
    if (value && value.length > 0) {
      const newValue = value.slice(0, -1);
      onChange(newValue);
      if (newValue === '') {
        setEditMode(true);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setEditMode(true);
    setLastClicked(null);
  };

  const handleShowEdit = () => {
    setEditMode(true);
  };

  // Extract unique digits from options for the numpad
  const digits = Array.from(new Set(
    options.flatMap(opt => String(opt).split('').map(Number))
  )).sort((a, b) => a - b);

  if (!editMode && value) {
    return (
      <div
        onClick={handleShowEdit}
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
    <div className={`space-y-2 ${className}`}>
      {/* Current value display with edit controls */}
      {value && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-12 px-4 rounded-lg border-2 border-primary bg-primary/5 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{value}</span>
          </div>
          <button
            type="button"
            onClick={handleBackspace}
            className="w-12 h-12 rounded-lg border-2 border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Quick preset options */}
      <div className="flex flex-wrap gap-1.5">
        {options.map(num => (
          <button
            key={`preset-${num}`}
            type="button"
            onClick={() => {
              onChange(String(num));
              setEditMode(false);
            }}
            className={`${compact ? 'px-2 h-9 text-xs' : 'px-3 h-10 text-sm'} rounded-lg border font-medium transition-all ${
              value === String(num)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/50 hover:bg-accent hover:border-primary'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Custom number pad for digit entry */}
      <div className="pt-2 border-t">
        <div className="flex flex-wrap gap-1.5">
          {digits.map(digit => (
            <button
              key={`digit-${digit}`}
              type="button"
              onClick={() => handleNumberClick(digit)}
              className={`w-10 h-10 rounded-lg border-2 font-bold transition-all ${
                lastClicked === digit
                  ? 'bg-primary text-primary-foreground scale-95 border-primary'
                  : 'bg-background hover:bg-accent hover:border-primary'
              }`}
            >
              {digit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberSelector;
