
import { createContext, useContext, ReactNode } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import AlertSystem from "@/components/AlertSystem";

interface AlertContextType {
  showSuccess: (title: string, message: string, duration?: number) => string;
  showError: (title: string, message: string, duration?: number) => string;
  showWarning: (title: string, message: string, duration?: number) => string;
  showInfo: (title: string, message: string, duration?: number) => string;
  clearAllAlerts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  console.log('AlertProvider initialized'); // Debug log
  
  const {
    alerts,
    removeAlert,
    clearAllAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  } = useAlerts();

  console.log('Current alerts:', alerts); // Debug log

  return (
    <AlertContext.Provider value={{
      showSuccess,
      showError,
      showWarning,
      showInfo,
      clearAllAlerts
    }}>
      {children}
      <AlertSystem alerts={alerts} onRemoveAlert={removeAlert} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
