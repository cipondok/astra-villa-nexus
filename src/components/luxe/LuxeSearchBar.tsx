import { useState, type ComponentType, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Home, Tag } from "lucide-react";
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
  return <span aria-hidden className="hidden md:block w-px self-stretch my-2 bg-[color:var(--luxe-line)]" />;
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
    <label className="flex-1 flex items-center gap-3 px-5 py-2.5 rounded-xl md:rounded-full hover:bg-white/5 transition-colors text-left cursor-text">
      <Icon className="w-4 h-4 text-luxe-gold shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-luxe-mut">{label}</div>
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
          className="w-full bg-transparent border-0 outline-none text-[13px] text-luxe-fg placeholder:text-luxe-mut/70 p-0 focus:ring-0"
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
  return (
    <label className="flex-1 flex items-center gap-3 px-5 py-2.5 rounded-xl md:rounded-full hover:bg-white/5 transition-colors text-left cursor-pointer">
      <Icon className="w-4 h-4 text-luxe-gold shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-luxe-mut">{label}</div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-0 outline-none text-[13px] text-luxe-fg p-0 focus:ring-0 appearance-none cursor-pointer"
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
