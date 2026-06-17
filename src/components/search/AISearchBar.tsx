import { useState, KeyboardEvent } from "react";
import { Sparkles, Loader2, X, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNLPSearch, NLPFilters } from "@/hooks/useNLPSearch";
import { cn } from "@/lib/utils";
import { formatCurrencyIDRShort } from "@/lib/indonesianFormat";

interface AISearchBarProps {
  /** Called when AI parses query into structured filters */
  onFiltersExtracted?: (filters: NLPFilters, rawQuery: string) => void;
  source?: string;
  placeholder?: string;
  className?: string;
}

const EXAMPLE_QUERIES = [
  "Villa 3 kamar di Canggu di bawah 5 miliar",
  "Apartemen sewa Jakarta Selatan dengan kolam",
  "Properti investasi yield tinggi di Bali",
];

export default function AISearchBar({
  onFiltersExtracted,
  source = "marketplace",
  placeholder = "Ask AI: e.g. 'Villa 3BR in Canggu under 5B with pool'",
  className,
}: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const { isProcessing, extractedFilters, intentSummary, processNaturalLanguage, clearNLP } =
    useNLPSearch();

  const runQuery = async (text?: string) => {
    const q = (text ?? query).trim();
    if (!q) return;
    if (text) setQuery(text);
    const filters = await processNaturalLanguage(q, source);
    if (filters) onFiltersExtracted?.(filters, q);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runQuery();
    }
  };

  const clear = () => {
    setQuery("");
    clearNLP();
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-gradient-to-br from-background to-muted/30 p-3 sm:p-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className="h-10 pl-10 pr-9 text-sm rounded-xl"
            aria-label="AI smart search"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          onClick={() => runQuery()}
          disabled={isProcessing || !query.trim()}
          className="h-10 px-4 rounded-xl gap-1.5"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          <span className="hidden sm:inline text-sm">AI Search</span>
        </Button>
      </div>

      {!extractedFilters && !isProcessing && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((ex) => (
            <button
              key={ex}
              onClick={() => runQuery(ex)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {extractedFilters && (
        <div className="mt-3 space-y-2">
          {intentSummary && (
            <p className="text-xs text-muted-foreground italic">"{intentSummary}"</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <FilterChip label="Location" value={extractedFilters.city || extractedFilters.state || extractedFilters.location} />
            <FilterChip label="Type" value={extractedFilters.property_type} />
            <FilterChip label="Listing" value={extractedFilters.listing_type} />
            <FilterChip label="Bedrooms" value={extractedFilters.bedrooms ? `${extractedFilters.bedrooms}+` : undefined} />
            <FilterChip label="Bathrooms" value={extractedFilters.bathrooms ? `${extractedFilters.bathrooms}+` : undefined} />
            <FilterChip
              label="Min price"
              value={extractedFilters.min_price ? formatCurrencyIDRShort(extractedFilters.min_price) : undefined}
            />
            <FilterChip
              label="Max price"
              value={extractedFilters.max_price ? formatCurrencyIDRShort(extractedFilters.max_price) : undefined}
            />
            {extractedFilters.amenities?.slice(0, 4).map((a) => (
              <Badge key={a} variant="secondary" className="text-[10px] font-normal">
                {a}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <Badge variant="outline" className="text-[10px] font-normal gap-1 border-primary/40">
      <span className="text-muted-foreground">{label}:</span>
      <span className="text-foreground font-medium">{value}</span>
    </Badge>
  );
}
