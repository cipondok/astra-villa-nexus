
import { useState, useCallback } from "react";
import { AlertMessage } from "@/components/AlertSystem";

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const addAlert = useCallback((
    type: AlertMessage["type"],
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newAlert: AlertMessage = {
      id,
      type,
      title,
      message,
      duration: duration || 5000
    };

    setAlerts(prev => [...prev, newAlert]);
    return id;
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message: string, duration?: number) => {
    return addAlert("success", title, message, duration);
  }, [addAlert]);

  const showError = useCallback((title: string, message: string, duration?: number) => {
    return addAlert("error", title, message, duration);
  }, [addAlert]);

  const showWarning = useCallback((title: string, message: string, duration?: number) => {
    return addAlert("warning", title, message, duration);
  }, [addAlert]);

  const showInfo = useCallback((title: string, message: string, duration?: number) => {
    return addAlert("info", title, message, duration);
  }, [addAlert]);

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
