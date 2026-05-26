import { useState, type ComponentType, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, Tag, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LuxeSearchBarProps {
  defaultLocation?: string;
  defaultType?: string;
  defaultQuery?: string;
  /** Target route. Defaults to /properties (real DB search) */
  action?: string;
  className?: string;
  compact?: boolean;
}

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all",      label: "All Properties" },
  { value: "villa",    label: "Villa" },
  { value: "house",    label: "House" },
  { value: "apartment",label: "Apartment" },
  { value: "land",     label: "Land" },
  { value: "commercial",label: "Commercial" },
];

/**
 * LuxeSearchBar — cinematic glass-pill hero search.
 * Searches real properties from the database via /properties route.
 * Fields: Location · Type · Keyword.
 */
export function LuxeSearchBar({
  defaultLocation = "",
  defaultType = "all",
  defaultQuery = "",
  action = "/properties",
  className,
  compact = false,
}: LuxeSearchBarProps) {
  const navigate = useNavigate();
  const [where, setWhere] = useState(defaultLocation);
  const [type, setType] = useState(defaultType);
  const [q, setQ] = useState(defaultQuery);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (where.trim()) params.set("location", where.trim());
    if (type && type !== "all") params.set("type", type);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    navigate(qs ? `${action}?${qs}` : action);
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "luxe-glass-card flex flex-col md:flex-row md:items-stretch gap-1 md:gap-0 p-2",
        compact ? "rounded-2xl md:rounded-full" : "rounded-3xl md:rounded-full",
        className
      )}
      aria-label="Search properties"
    >
      <Field icon={MapPin} label="Location" value={where} onChange={setWhere}
        placeholder="Bali, Uluwatu, Ubud…" onSubmit={submit} />
      <Divider />
      <SelectField icon={Home} label="Type" value={type} onChange={setType} options={TYPE_OPTIONS} />
      <Divider />
      <Field icon={Tag} label="Keyword" value={q} onChange={setQ}
        placeholder="Pool, oceanview, modern…" onSubmit={submit} />
      <button
        type="submit"
        aria-label="Search properties"
        className="luxe-gold-btn shrink-0 h-12 md:h-auto px-5 md:px-7 rounded-2xl md:rounded-full text-[13px] font-medium inline-flex items-center justify-center gap-2 mt-1 md:mt-0 md:ml-1"
      >
        <Search className="w-4 h-4" />
        <span className="md:inline">Search Properties</span>
      </button>
    </form>
  );
}

function Divider() {
  return (
    <span
      aria-hidden
      className="hidden md:block w-px self-stretch my-3 bg-gradient-to-b from-transparent via-[color:var(--luxe-gold)]/35 to-transparent"
    />
  );
}

function Field({
  icon: Icon, label, value, onChange, onSubmit, placeholder,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}) {
  return (
    <label
      className={cn(
        "group flex-1 flex items-center gap-3 px-5 py-3 rounded-2xl md:rounded-full",
        "transition-all duration-300 cursor-text",
        "hover:bg-white/[0.04] focus-within:bg-white/[0.06]",
        "focus-within:ring-1 focus-within:ring-[color:var(--luxe-gold)]/40"
      )}
    >
      <span className="grid place-items-center w-8 h-8 rounded-full bg-[color:var(--luxe-gold)]/10 text-luxe-gold shrink-0 group-focus-within:bg-[color:var(--luxe-gold)]/20 transition-colors">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] uppercase tracking-[0.28em] text-luxe-mut/80 font-medium">{label}</div>
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit?.();
            }
          }}
          className="w-full bg-transparent border-0 outline-none text-[14px] text-luxe-fg placeholder:text-luxe-mut/55 p-0 mt-0.5 focus:ring-0"
        />
      </div>
    </label>
  );
}

function SelectField({
  icon: Icon, label, value, onChange, options,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const current = options.find((o) => o.value === value)?.label ?? "";
  return (
    <label
      className={cn(
        "group relative flex-1 flex items-center gap-3 px-5 py-3 rounded-2xl md:rounded-full",
        "transition-all duration-300 cursor-pointer",
        "hover:bg-white/[0.04] focus-within:bg-white/[0.06]",
        "focus-within:ring-1 focus-within:ring-[color:var(--luxe-gold)]/40"
      )}
    >
      <span className="grid place-items-center w-8 h-8 rounded-full bg-[color:var(--luxe-gold)]/10 text-luxe-gold shrink-0 group-focus-within:bg-[color:var(--luxe-gold)]/20 transition-colors">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] uppercase tracking-[0.28em] text-luxe-mut/80 font-medium">{label}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="text-[14px] text-luxe-fg truncate">{current}</span>
          <ChevronDown className="w-3.5 h-3.5 text-luxe-mut group-hover:text-luxe-gold transition-colors shrink-0" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-[#0b0b0d] text-luxe-fg">
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

