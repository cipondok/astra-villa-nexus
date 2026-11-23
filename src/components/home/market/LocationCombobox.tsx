import { useId, useMemo, useRef, useState } from "react";
import { MapPin, X } from "lucide-react";
import { matchLocations } from "@/data/locationSuggestions";

interface Props {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
  suggestionsLabel: string;
  clearLabel: string;
}

/** Accessible location autocomplete (ARIA 1.2 combobox with a listbox popup). */
export function LocationCombobox({ value, onChange, label, placeholder, suggestionsLabel, clearLabel }: Props) {
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const options = useMemo(() => matchLocations(value), [value]);
  const expanded = open && options.length > 0;

  const choose = (name: string) => {
    onChange(name);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (options.length ? (i + 1) % options.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (options.length ? (i - 1 + options.length) % options.length : -1));
    } else if (e.key === "Enter" && expanded && active >= 0) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      if (expanded) { e.preventDefault(); setOpen(false); setActive(-1); }
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className="relative min-w-0">
      <label htmlFor={inputId} className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-2)] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 reos-gold" aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          value={value}
          placeholder={placeholder}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="mk-field mk-has-icon"
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); inputRef.current?.focus(); }}
            aria-label={clearLabel}
            className="mk-focus absolute right-1 top-1/2 -translate-y-1/2 h-11 w-11 inline-flex items-center justify-center rounded-lg text-[var(--text-3)] hover:text-[var(--text)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label={suggestionsLabel}
        hidden={!expanded}
        className="absolute left-0 right-0 top-full mt-1.5 z-30 max-h-72 overflow-y-auto reos-scrollbar rounded-xl border border-[var(--line-gold)] bg-[var(--surface-2)] p-1 shadow-[var(--shadow-popover)]"
      >
        {options.map((name, i) => (
          <li
            key={name}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(name)}
            onMouseEnter={() => setActive(i)}
            className={`flex items-center gap-2 min-h-11 px-3 rounded-lg text-[14px] cursor-pointer ${i === active ? "bg-[var(--gold-soft)] text-[var(--text)]" : "text-[var(--text-2)]"}`}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--text-3)]" aria-hidden="true" /> {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
