import React from 'react';
import { Construction, Clock, Mail } from 'lucide-react';

interface MaintenancePageProps {
  message?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ message }) => {
  const displayMessage = message || 'Kami sedang melakukan pemeliharaan sistem. Mohon kembali beberapa saat lagi.';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-chart-3/10 border-2 border-chart-3/30 flex items-center justify-center">
              <Construction className="w-12 h-12 text-chart-3" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-chart-3 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-chart-3-foreground" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Dalam Pemeliharaan
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {displayMessage}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">maintenance mode</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Contact hint */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Mail className="w-3.5 h-3.5" />
          <span>Hubungi admin jika ada pertanyaan mendesak</span>
        </div>

        {/* Animated bar */}
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-chart-3/60 rounded-full animate-[shimmer_2s_ease-in-out_infinite] w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
