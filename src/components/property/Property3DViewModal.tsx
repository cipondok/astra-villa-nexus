
import { Button } from "@/components/ui/button";
import { X, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseProperty } from "@/types/property";

interface Property3DViewModalProps {
  property: BaseProperty;
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
}

const Property3DViewModal = ({ 
  property, 
  isOpen, 
  onClose, 
  language 
}: Property3DViewModalProps) => {
  const navigate = useNavigate();

  const text = {
    en: {
      backToHome: "Back to Home",
      view3D: "3D Property View",
      noView: "3D view not available for this property"
    },
    id: {
      backToHome: "Kembali ke Beranda",
      view3D: "Tampilan 3D Properti",
      noView: "Tampilan 3D tidak tersedia untuk properti ini"
    }
  };

  const currentText = text[language];

  if (!isOpen) return null;

  const handleBackToHome = () => {
    onClose();
    navigate('/');
  };

  const get3DUrl = () => {
    return property.three_d_model_url || property.virtual_tour_url;
  };

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-6xl h-[85vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 scale-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50">
          <Button
            onClick={handleBackToHome}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            {currentText.backToHome}
          </Button>
          
          <h2 className="font-semibold text-lg">{currentText.view3D}</h2>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 3D Viewer Content */}
        <div className="flex-1 h-[calc(85vh-80px)]">
          {get3DUrl() ? (
            <iframe
              src={get3DUrl()}
              className="w-full h-full border-0"
              title={`3D view of ${property.title}`}
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-lg">{currentText.noView}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Property3DViewModal;
