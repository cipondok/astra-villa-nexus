import { useState, type ComponentType, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LuxeSearchBarProps {
  defaultLocation?: string;
  defaultWhen?: string;
  defaultGuests?: number;
  /** Target route. Defaults to /search */
  action?: string;
  className?: string;
  compact?: boolean;
}

/**
 * LuxeSearchBar — cinematic glass-pill hero search.
 * Composes 3 inputs (where / when / guests) + a gold Search button.
 * Validates guests & date before navigating.
 */
export function LuxeSearchBar({
  defaultLocation = "Bali, Indonesia",
  defaultWhen = "",
  defaultGuests = 2,
  action = "/search",
  className,
  compact = false,
}: LuxeSearchBarProps) {
  const navigate = useNavigate();
  const [where, setWhere] = useState(defaultLocation);
  const [when, setWhen] = useState(defaultWhen);
  const [guests, setGuests] = useState<number | string>(defaultGuests);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();

    const guestsNum = Number(guests);
    if (!Number.isFinite(guestsNum) || guestsNum < 1) {
      toast.error("Please enter at least 1 guest");
      return;
    }

    if (when) {
      const d = new Date(when);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (Number.isNaN(d.getTime()) || d < today) {
        toast.error("Please choose a valid future date");
        return;
      }
    }

    const params = new URLSearchParams();
    if (where) params.set("location", where);
    if (when)  params.set("when", when);
    params.set("guests", String(guestsNum));
    navigate(`${action}?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "luxe-glass-card flex flex-col md:flex-row md:items-stretch gap-1 md:gap-0 p-2",
        compact ? "rounded-2xl md:rounded-full" : "rounded-3xl md:rounded-full",
        className
      )}
      aria-label="Search villas"
    >
      <Field icon={MapPin} label="Where" value={where} onChange={setWhere}
        placeholder="Bali, Uluwatu, Ubud…" onSubmit={submit} />
      <Divider />
      <Field icon={Calendar} label="When" value={when} onChange={setWhen}
        type="date" onSubmit={submit} />
      <Divider />
      <Field icon={Users} label="Guests" value={String(guests)} onChange={(v) => setGuests(v)}
        type="number" min={1} onSubmit={submit} />
      <button
        type="submit"
        aria-label="Search villas"
        className="luxe-gold-btn shrink-0 h-12 md:h-auto px-5 md:px-7 rounded-2xl md:rounded-full text-[13px] font-medium inline-flex items-center justify-center gap-2 mt-1 md:mt-0 md:ml-1"
      >
        <Search className="w-4 h-4" />
        <span className="md:inline">Search Villas</span>
      </button>
    </form>
  );
}

function Divider() {
  return <span aria-hidden className="hidden md:block w-px self-stretch my-2 bg-[color:var(--luxe-line)]" />;
}

function Field({
  icon: Icon, label, value, onChange, onSubmit, placeholder, type = "text", min,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  type?: "text" | "date" | "number";
  min?: number;
}) {
  return (
    <label className="flex-1 flex items-center gap-3 px-5 py-2.5 rounded-xl md:rounded-full hover:bg-white/5 transition-colors text-left cursor-text">
      <Icon className="w-4 h-4 text-luxe-gold shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-luxe-mut">{label}</div>
        <input
          type={type}
          value={value}
          min={min}
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
