import { useDataSaver } from '@/contexts/DataSaverContext';
import { Switch } from '@/components/ui/switch';
import { Zap } from 'lucide-react';

interface DataSaverToggleProps {
  compact?: boolean;
}

export const DataSaverToggle = ({ compact = false }: DataSaverToggleProps) => {
  const { isDataSaver, manualOverride, toggleDataSaver, connectionSpeed } = useDataSaver();

  const label = manualOverride === null
    ? `Data Saver (auto${connectionSpeed === 'slow' ? ' · on' : ''})`
    : isDataSaver ? 'Data Saver on' : 'Data Saver off';

  if (compact) {
    return (
      <button
        onClick={toggleDataSaver}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs hover:bg-muted transition-colors"
        title={label}
      >
        <Zap className={`h-3 w-3 ${isDataSaver ? 'text-chart-3' : 'text-muted-foreground'}`} />
        {isDataSaver && <span className="text-chart-3 font-medium">Saver</span>}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Zap className={`h-4 w-4 ${isDataSaver ? 'text-chart-3' : 'text-muted-foreground'}`} />
        <span className="text-sm">{label}</span>
      </div>
      <Switch
        checked={isDataSaver}
        onCheckedChange={toggleDataSaver}
        aria-label="Toggle data saver mode"
      />
    </div>
  );
};
