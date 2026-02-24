
import { Button } from "@/components/ui/button";
import { X, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BaseProperty } from "@/types/property";
import { useTranslation } from "@/i18n/useTranslation";

interface Property3DViewModalProps {
  property: BaseProperty;
  isOpen: boolean;
  onClose: () => void;
  language?: "en" | "id" | "zh" | "ja" | "ko";
}

const Property3DViewModal = ({ 
  property, 
  isOpen, 
  onClose, 
}: Property3DViewModalProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-6xl h-[85vh] bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 scale-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
          <Button onClick={handleBackToHome} variant="outline" size="sm" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            {t('propertyDetail.backToHome')}
          </Button>
          
          <h2 className="font-semibold text-lg">{t('propertyDetail.view3DTitle')}</h2>
          
          <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

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
                <p className="text-lg">{t('propertyDetail.noView')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Property3DViewModal;
