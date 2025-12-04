
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
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case "error":
        return <AlertCircle className="w-16 h-16 text-red-500" />;
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
      <DialogContent className="max-w-md bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl">
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
              type === 'success' ? 'text-green-600 dark:text-green-400' : 
              type === 'error' ? 'text-red-600 dark:text-red-400' : 
              'text-gray-600 dark:text-gray-400'
            }`}>
              {message || getDefaultMessage()}
            </p>
          </div>

          {/* Action Buttons for non-loading states */}
          {type !== 'loading' && onClose && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg font-medium transition-all shadow-lg ${
                  type === 'success' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90'
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
