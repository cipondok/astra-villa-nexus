
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
  const getAlertStyles = (type: AlertMessage["type"]) => {
    switch (type) {
      case "success":
        return {
          container: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800",
          icon: "text-green-500",
          title: "text-green-800 dark:text-green-200",
          message: "text-green-700 dark:text-green-300"
        };
      case "error":
        return {
          container: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-800",
          icon: "text-red-500",
          title: "text-red-800 dark:text-red-200",
          message: "text-red-700 dark:text-red-300"
        };
      case "warning":
        return {
          container: "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-800",
          icon: "text-yellow-500",
          title: "text-yellow-800 dark:text-yellow-200",
          message: "text-yellow-700 dark:text-yellow-300"
        };
      case "info":
        return {
          container: "bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200 dark:from-blue-900/20 dark:to-sky-900/20 dark:border-blue-800",
          icon: "text-blue-500",
          title: "text-blue-800 dark:text-blue-200",
          message: "text-blue-700 dark:text-blue-300"
        };
      default:
        return {
          container: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-800",
          icon: "text-gray-500",
          title: "text-gray-800 dark:text-gray-200",
          message: "text-gray-700 dark:text-gray-300"
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
    <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm w-full">
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
  styles: ReturnType<typeof AlertSystem.prototype.getAlertStyles>;
  icon: React.ReactNode;
  onRemove: () => void;
}

const AlertItem = ({ alert, styles, icon, onRemove }: AlertItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
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

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
        ${styles.container}
        border rounded-lg shadow-lg backdrop-blur-sm
        p-4 relative overflow-hidden
      `}
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-pulse" />
      
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
            flex-shrink-0 ml-4 inline-flex text-gray-400 hover:text-gray-600 
            dark:text-gray-500 dark:hover:text-gray-300
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            rounded-md p-1 transition-colors duration-200
          `}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar for auto-dismiss */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" 
           style={{ 
             width: '100%',
             animation: `shrink ${alert.duration || 5000}ms linear forwards`
           }} />
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default AlertSystem;
