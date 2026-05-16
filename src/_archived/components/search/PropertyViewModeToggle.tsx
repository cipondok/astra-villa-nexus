import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Grid3X3, MapPin } from "lucide-react";

type ViewMode = 'list' | 'grid' | 'map';

interface PropertyViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const PropertyViewModeToggle = ({ viewMode, onViewModeChange }: PropertyViewModeToggleProps) => {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
      className="border rounded-lg p-1 bg-background"
    >
      <ToggleGroupItem 
        value="list" 
        aria-label="List view"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <List className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">List</span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="grid" 
        aria-label="Grid view"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Grid</span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="map" 
        aria-label="Map view"
        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">Map</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default PropertyViewModeToggle;