
import React from "react";

interface IPhoneToggleOption {
  value: string;
  label: string;
  colorClass?: string;
}

interface IPhoneToggleGroupProps {
  options: IPhoneToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const IPhoneToggleGroup: React.FC<IPhoneToggleGroupProps> = ({
  options,
  value,
  onChange,
  className = ""
}) => (
  <div className={`flex items-center justify-center gap-2 my-1 ${className}`}>
    {options.map(opt => (
      <button
        key={opt.value}
        className={`
          px-4 py-2 rounded-full font-semibold text-sm transition-all
          ${opt.value === value
            ? `${opt.colorClass ?? "bg-primary text-primary-foreground"} scale-105 shadow-lg`
            : "bg-muted text-muted-foreground hover:bg-muted/80"}
          outline-none focus:ring-2 focus:ring-primary`
        }
        style={{ minWidth: 76 }}
        onClick={() => onChange(opt.value)}
        type="button"
        aria-pressed={opt.value === value}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export default IPhoneToggleGroup;
