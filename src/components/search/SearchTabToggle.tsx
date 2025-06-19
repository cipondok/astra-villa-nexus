
import { Button } from "@/components/ui/button";
import { Home, Key } from "lucide-react";

interface SearchTabToggleProps {
  activeTab: "buy" | "rent";
  onTabChange: (tab: "buy" | "rent") => void;
  language: "en" | "id";
}

const SearchTabToggle = ({ activeTab, onTabChange, language }: SearchTabToggleProps) => {
  const text = {
    en: { buy: "Buy", rent: "Rent" },
    id: { buy: "Beli", rent: "Sewa" }
  };

  const currentText = text[language];

  return (
    <div className="flex items-center bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-1.5 shadow-sm">
      <Button
        variant={activeTab === "buy" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("buy")}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${activeTab === "buy" 
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
          }
        `}
      >
        <Home className="h-4 w-4" />
        {currentText.buy}
      </Button>
      
      <Button
        variant={activeTab === "rent" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTabChange("rent")}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${activeTab === "rent" 
            ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90" 
            : "text-foreground hover:bg-accent hover:text-accent-foreground"
          }
        `}
      >
        <Key className="h-4 w-4" />
        {currentText.rent}
      </Button>
    </div>
  );
};

export default SearchTabToggle;
