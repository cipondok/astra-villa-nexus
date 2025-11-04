
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
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map(opt => (
        <button
          type="button"
          key={opt.value}
          onClick={() => handleClick(opt.value)}
          className={`px-4 py-1.5 rounded-full border-2 font-semibold text-xs transition-all duration-200
            ${selectedValues.includes(opt.value)
              ? "bg-blue-600 border-blue-600 text-white shadow-lg scale-110 ring-2 ring-blue-300"
              : "bg-background border-border text-foreground hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"}
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
