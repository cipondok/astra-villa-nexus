
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Sun, Moon } from "lucide-react";

interface LightingPanelProps {
  timeOfDay: number;
  onTimeChange: (time: number) => void;
}

const LightingPanel = ({ timeOfDay, onTimeChange }: LightingPanelProps) => {
  const formattedTime = `${Math.floor(timeOfDay)
    .toString()
    .padStart(2, "0")}:${Math.round((timeOfDay % 1) * 60)
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4 w-64 space-y-4 animate-slide-in-right">
      <h3 className="text-white font-semibold">Lighting Control</h3>
      <div>
        <Label
          htmlFor="time-slider"
          className="text-white flex justify-between items-center"
        >
          <span>Time of Day</span>
          <span className="font-bold">{formattedTime}</span>
        </Label>
        <div className="flex items-center gap-2 mt-2">
          <Moon className="text-white" />
          <Slider
            id="time-slider"
            min={0}
            max={24}
            step={0.25}
            value={[timeOfDay]}
            onValueChange={(value) => onTimeChange(value[0])}
          />
          <Sun className="text-white" />
        </div>
        <div className="flex justify-between text-xs text-gray-300 mt-1">
          <span>Midnight</span>
          <span>Noon</span>
          <span>Midnight</span>
        </div>
      </div>
    </div>
  );
};

export default LightingPanel;
