import PropertyImageUpload from "../PropertyImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";

interface ImagesStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const ImagesStep = ({ formData, onUpdate }: ImagesStepProps) => {
  const { language } = useLanguage();

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
    }
  };

  const t = translations[language];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t.title}</h3>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <PropertyImageUpload
        propertyType={formData.property_type}
        onImagesUploaded={(imageUrls) => onUpdate('images', imageUrls)}
        maxImages={10}
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
