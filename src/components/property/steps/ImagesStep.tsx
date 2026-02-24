import PropertyImageUpload from "../PropertyImageUpload";
import { useTranslation } from "@/i18n/useTranslation";
import { usePropertyFormTiers } from "@/hooks/usePropertyFormTiers";
import { Badge } from "@/components/ui/badge";
import { Crown, Image as ImageIcon } from "lucide-react";
import { MEMBERSHIP_LEVELS } from "@/types/membership";

interface ImagesStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const ImagesStep = ({ formData, onUpdate }: ImagesStepProps) => {
  const { language } = useTranslation();
  const { maxImages, membershipLevel, canAccessFeature } = usePropertyFormTiers();

  const levelConfig = MEMBERSHIP_LEVELS[membershipLevel];

  const translations = {
    en: {
      title: "Property Images",
      subtitle: "Upload high-quality images of your property. The first image will be used as the main thumbnail.",
      tipsTitle: "Image Tips",
      tip1: "Use natural lighting for best results",
      tip2: "Include photos of all rooms and exterior",
      tip3: "Highlight unique features",
      tip4: "Ensure images are clear and high resolution",
      tip5: "Upload at least 5 images for better visibility",
      tip6: "Images will be automatically optimized to WebP format",
      maxAllowed: `Maximum ${maxImages} images allowed`,
      upgradeFor: "Upgrade for more images",
      yourTier: "Your tier",
    },
    id: {
      title: "Foto Properti",
      subtitle: "Unggah foto berkualitas tinggi dari properti Anda. Foto pertama akan digunakan sebagai thumbnail utama.",
      tipsTitle: "Tips Foto",
      tip1: "Gunakan pencahayaan alami untuk hasil terbaik",
      tip2: "Sertakan foto semua ruangan dan eksterior",
      tip3: "Tonjolkan fitur unik",
      tip4: "Pastikan gambar jernih dan resolusi tinggi",
      tip5: "Unggah minimal 5 foto untuk visibilitas lebih baik",
      tip6: "Gambar akan dioptimalkan otomatis ke format WebP",
      maxAllowed: `Maksimal ${maxImages} gambar diizinkan`,
      upgradeFor: "Upgrade untuk lebih banyak gambar",
      yourTier: "Level Anda",
    }
  };

  const t = translations[language];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            {t.title}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`text-xs ${levelConfig.color} ${levelConfig.bgColor}`}>
              <Crown className="h-3 w-3 mr-1" />
              {t.yourTier}: {levelConfig.shortLabel}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {t.maxAllowed}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <PropertyImageUpload
        propertyType={formData.property_type}
        onImagesUploaded={(imageUrls) => onUpdate('images', imageUrls)}
        maxImages={maxImages}
      />

      <div className="p-4 border rounded-lg bg-muted/50">
        <h4 className="font-semibold mb-2">{t.tipsTitle}</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• {t.tip1}</li>
          <li>• {t.tip2}</li>
          <li>• {t.tip3}</li>
          <li>• {t.tip4}</li>
          <li>• {t.tip5}</li>
          <li>• {t.tip6}</li>
        </ul>
      </div>
    </div>
  );
};

export default ImagesStep;
