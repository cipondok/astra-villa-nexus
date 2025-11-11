
import React from "react";

interface PillToggleOption {
  value: string;
  label: string;
}

interface PillToggleGroupProps {
  options: PillToggleOption[];
  value: string | string[]; // support both single and multi
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  className?: string;
}

const PillToggleGroup: React.FC<PillToggleGroupProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  className = "",
}) => {
  const handleClick = (val: string) => {
    if (multiple) {
      let newValue: string[];
      if (Array.isArray(value)) {
        if (value.includes(val)) {
          newValue = value.filter(v => v !== val);
        } else {
          newValue = [...value, val];
        }
      } else {
        newValue = [val];
      }
      onChange(newValue);
    } else {
      onChange(val);
    }
  };

  const selectedValues = Array.isArray(value) ? value : [value];

  return (
    <div className={`flex flex-wrap gap-2 sm:gap-2.5 ${className}`}>
      {options.map(opt => (
        <button
          type="button"
          key={opt.value}
          onClick={() => handleClick(opt.value)}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 min-h-[44px] sm:min-h-[40px] rounded-full border-2 font-semibold text-sm sm:text-xs transition-all duration-300 ease-in-out touch-manipulation
            ${selectedValues.includes(opt.value)
              ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-105 sm:scale-110 ring-2 ring-blue-300 animate-in"
              : "bg-background border-border text-foreground hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:scale-105 active:scale-95"}
            `}
          aria-pressed={selectedValues.includes(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default PillToggleGroup;
