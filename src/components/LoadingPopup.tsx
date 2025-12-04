
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoaderCircle, CheckCircle, AlertCircle } from "lucide-react";

interface LoadingPopupProps {
  isOpen: boolean;
  message?: string;
  language?: "en" | "id";
  type?: "loading" | "success" | "error";
  onClose?: () => void;
}

const LoadingPopup = ({ 
  isOpen, 
  message, 
  language = "en", 
  type = "loading",
  onClose 
}: LoadingPopupProps) => {
  const text = {
    en: {
      loading: "Loading...",
      processing: "Processing your request...",
      success: "Success!",
      error: "Something went wrong",
      tryAgain: "Try Again",
      close: "Close"
    },
    id: {
      loading: "Memuat...",
      processing: "Memproses permintaan Anda...",
      success: "Berhasil!",
      error: "Terjadi kesalahan",
      tryAgain: "Coba Lagi",
      close: "Tutup"
    }
  };

  const currentText = text[language];

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-accent" />;
      case "error":
        return <AlertCircle className="w-16 h-16 text-destructive" />;
      default:
        return <LoaderCircle className="w-16 h-16 text-primary animate-spin" />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case "success":
        return currentText.success;
      case "error":
        return currentText.error;
      default:
        return currentText.processing;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-popup border-primary/20 shadow-2xl shadow-primary/20">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Animated ASTRA Villa Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">
              <span className="inline-block animate-gradient bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:300%_300%]">
                ASTRA Villa
              </span>
            </h1>
          </div>

          {/* Status Icon */}
          <div className="flex flex-col items-center space-y-4 text-center">
            {getIcon()}
            <p className={`text-lg ${type === 'loading' ? 'animate-pulse' : ''} ${
              type === 'success' ? 'text-accent' : 
              type === 'error' ? 'text-destructive' : 
              'text-muted-foreground'
            }`}>
              {message || getDefaultMessage()}
            </p>
          </div>

          {/* Action Buttons for non-loading states */}
          {type !== 'loading' && onClose && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-md font-medium transition-all shadow-lg ${
                  type === 'success' 
                    ? 'bg-gradient-to-r from-accent to-primary text-primary-foreground hover:opacity-90 shadow-accent/30'
                    : 'bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:opacity-90 shadow-destructive/30'
                }`}
              >
                {currentText.close}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingPopup;
