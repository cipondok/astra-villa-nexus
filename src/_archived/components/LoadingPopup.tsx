import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoaderCircle, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface LoadingPopupProps {
  isOpen: boolean;
  message?: string;
  type?: "loading" | "success" | "error";
  onClose?: () => void;
}

const LoadingPopup = ({ 
  isOpen, 
  message, 
  type = "loading",
  onClose 
}: LoadingPopupProps) => {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-chart-1" />;
      case "error":
        return <AlertCircle className="w-16 h-16 text-destructive" />;
      default:
        return <LoaderCircle className="w-16 h-16 text-primary animate-spin" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "success":
        return t('loadingPopup.success');
      case "error":
        return t('loadingPopup.error');
      default:
        return t('loadingPopup.processing');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background/95 dark:bg-card/95 backdrop-blur-xl border-border/20 dark:border-border/10 shadow-2xl">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">
              <span className="inline-block animate-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:300%_300%]">
                ASTRA Villa
              </span>
            </h1>
          </div>

          <div className="flex flex-col items-center space-y-4 text-center">
            {getIcon()}
            <p className={`text-lg ${type === 'loading' ? 'animate-pulse' : ''} ${
              type === 'success' ? 'text-chart-1' : 
              type === 'error' ? 'text-destructive' : 
              'text-muted-foreground'
            }`}>
              {message || getDefaultMessage()}
            </p>
          </div>

          {type !== 'loading' && onClose && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg font-medium transition-all shadow-lg ${
                  type === 'success' 
                    ? 'bg-chart-1 text-primary-foreground hover:opacity-90'
                    : 'bg-destructive text-destructive-foreground hover:opacity-90'
                }`}
              >
                {t('loadingPopup.close')}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingPopup;
