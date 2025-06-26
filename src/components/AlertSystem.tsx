
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

export interface AlertMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

interface AlertSystemProps {
  alerts: AlertMessage[];
  onRemoveAlert: (id: string) => void;
}

const AlertSystem = ({ alerts, onRemoveAlert }: AlertSystemProps) => {
  console.log('AlertSystem rendering with alerts:', alerts); // Debug log

  const getAlertStyles = (type: AlertMessage["type"]) => {
    switch (type) {
      case "success":
        return {
          container: "bg-gradient-to-r from-green-900/90 to-emerald-900/90 border-green-500/50 backdrop-blur-sm",
          icon: "text-green-400",
          title: "text-green-200",
          message: "text-green-300"
        };
      case "error":
        return {
          container: "bg-gradient-to-r from-red-900/90 to-rose-900/90 border-red-500/50 backdrop-blur-sm",
          icon: "text-red-400",
          title: "text-red-200",
          message: "text-red-300"
        };
      case "warning":
        return {
          container: "bg-gradient-to-r from-yellow-900/90 to-amber-900/90 border-yellow-500/50 backdrop-blur-sm",
          icon: "text-yellow-400",
          title: "text-yellow-200",
          message: "text-yellow-300"
        };
      case "info":
        return {
          container: "bg-gradient-to-r from-blue-900/90 to-sky-900/90 border-blue-500/50 backdrop-blur-sm",
          icon: "text-blue-400",
          title: "text-blue-200",
          message: "text-blue-300"
        };
      default:
        return {
          container: "bg-gradient-to-r from-slate-900/90 to-gray-900/90 border-slate-500/50 backdrop-blur-sm",
          icon: "text-gray-400",
          title: "text-gray-200",
          message: "text-gray-300"
        };
    }
  };

  const getIcon = (type: AlertMessage["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "error":
        return <XCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-3 max-w-sm w-full">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);
        return (
          <AlertItem
            key={alert.id}
            alert={alert}
            styles={styles}
            icon={getIcon(alert.type)}
            onRemove={() => onRemoveAlert(alert.id)}
          />
        );
      })}
    </div>
  );
};

interface AlertItemProps {
  alert: AlertMessage;
  styles: {
    container: string;
    icon: string;
    title: string;
    message: string;
  };
  icon: React.ReactNode;
  onRemove: () => void;
}

const AlertItem = ({ alert, styles, icon, onRemove }: AlertItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    console.log('AlertItem mounted:', alert); // Debug log
    
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto remove after duration
    const duration = alert.duration || 5000;
    const autoRemoveTimer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(autoRemoveTimer);
    };
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove();
    }, 300);
  };

  const progressBarStyle = {
    animationDuration: `${alert.duration || 5000}ms`,
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards' as const,
    animationName: 'shrink'
  };

  return (
    <>
      <style>
        {`
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
      <div
        className={`
          transform transition-all duration-300 ease-out
          ${isVisible && !isLeaving 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
          }
          ${styles.container}
          border rounded-xl shadow-2xl
          p-4 relative overflow-hidden
        `}
      >
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent animate-pulse" />
        
        <div className="relative flex items-start space-x-3">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold ${styles.title} mb-1`}>
              {alert.title}
            </h4>
            <p className={`text-sm ${styles.message} leading-relaxed`}>
              {alert.message}
            </p>
          </div>
          
          <button
            onClick={handleRemove}
            className={`
              flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-white
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
              rounded-md p-1 transition-colors duration-200
            `}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar for auto-dismiss */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
          style={progressBarStyle}
        />
      </div>
    </>
  );
};

export default AlertSystem;
