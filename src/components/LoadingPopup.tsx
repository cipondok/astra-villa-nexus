
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoaderCircle } from "lucide-react";

interface LoadingPopupProps {
  isOpen: boolean;
  message?: string;
  language?: "en" | "id";
}

const LoadingPopup = ({ isOpen, message, language = "en" }: LoadingPopupProps) => {
  const text = {
    en: {
      loading: "Loading...",
      processing: "Processing your request..."
    },
    id: {
      loading: "Memuat...",
      processing: "Memproses permintaan Anda..."
    }
  };

  const currentText = text[language];

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md bg-transparent border-none shadow-none">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Animated ASTRA Villa Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">
              <span className="inline-block animate-gradient bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 bg-clip-text text-transparent bg-[length:300%_300%]">
                ASTRA Villa
              </span>
            </h1>
          </div>

          {/* Loading Spinner */}
          <div className="flex flex-col items-center space-y-4 text-center">
            <LoaderCircle className="w-16 h-16 text-blue-500 animate-spin" />
            <p className="text-lg text-muted-foreground animate-pulse">
              {message || currentText.processing}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingPopup;
