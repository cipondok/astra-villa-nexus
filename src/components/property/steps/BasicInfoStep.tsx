import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { ContentCensor } from "@/utils/contentCensor";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface BasicInfoStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const BasicInfoStep = ({ formData, onUpdate }: BasicInfoStepProps) => {
  const { language } = useLanguage();
  const [showCensorWarning, setShowCensorWarning] = useState<boolean>(false);

  const t = {
    en: {
      title: "Property Title",
      titlePlaceholder: "e.g., Modern 3BR Villa in Seminyak",
      propertyType: "Property Type",
      selectPropertyType: "Select property type",
      listingType: "Listing Type",
      selectListingType: "Select listing type",
      price: "Price (IDR)",
      pricePlaceholder: "e.g., 5000000000",
      monthlyRental: "Monthly rental price",
      salePrice: "Sale price",
      description: "Description",
      descriptionPlaceholder: "Describe your property in detail...",
      descriptionHint: "Include key features, nearby amenities, and what makes this property special",
      descriptionGuide: "Important: Do NOT include phone numbers, email addresses, websites, or WhatsApp links. Contact information will be shown from your profile.",
      censorWarning: "Contact information was automatically censored. Your contact details will be shown from your profile.",
      // Property types
      house: "House",
      apartment: "Apartment",
      villa: "Villa",
      townhouse: "Townhouse",
      condo: "Condo",
      land: "Land",
      commercial: "Commercial",
      office: "Office Space",
      virtualOffice: "Virtual Office",
      warehouse: "Warehouse",
      retail: "Retail Space",
      hotel: "Hotel",
      resort: "Resort",
      studio: "Studio",
      penthouse: "Penthouse",
      duplex: "Duplex",
      shophouse: "Shophouse",
      // Listing types
      forSale: "For Sale",
      forRent: "For Rent",
      forLease: "For Lease",
    },
    id: {
      title: "Judul Properti",
      titlePlaceholder: "mis., Villa Modern 3KT di Seminyak",
      propertyType: "Tipe Properti",
      selectPropertyType: "Pilih tipe properti",
      listingType: "Tipe Listing",
      selectListingType: "Pilih tipe listing",
      price: "Harga (IDR)",
      pricePlaceholder: "mis., 5000000000",
      monthlyRental: "Harga sewa bulanan",
      salePrice: "Harga jual",
      description: "Deskripsi",
      descriptionPlaceholder: "Deskripsikan properti Anda secara detail...",
      descriptionHint: "Sertakan fitur utama, fasilitas terdekat, dan apa yang membuat properti ini istimewa",
      descriptionGuide: "Penting: JANGAN sertakan nomor telepon, alamat email, website, atau link WhatsApp. Informasi kontak akan ditampilkan dari profil Anda.",
      censorWarning: "Informasi kontak telah disensor secara otomatis. Detail kontak Anda akan ditampilkan dari profil Anda.",
      // Property types
      house: "Rumah",
      apartment: "Apartemen",
      villa: "Villa",
      townhouse: "Rumah Teres",
      condo: "Kondominium",
      land: "Tanah",
      commercial: "Komersial",
      office: "Ruang Kantor",
      virtualOffice: "Kantor Virtual",
      warehouse: "Gudang",
      retail: "Ruang Ritel",
      hotel: "Hotel",
      resort: "Resor",
      studio: "Studio",
      penthouse: "Penthouse",
      duplex: "Duplex",
      shophouse: "Ruko",
      // Listing types
      forSale: "Dijual",
      forRent: "Disewakan",
      forLease: "Disewa Jangka Panjang",
    }
  }[language];

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">{t.title} *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder={t.titlePlaceholder}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="property_type">{t.propertyType} *</Label>
          <Select 
            value={formData.property_type} 
            onValueChange={(value) => onUpdate('property_type', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t.selectPropertyType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="house">{t.house}</SelectItem>
              <SelectItem value="apartment">{t.apartment}</SelectItem>
              <SelectItem value="villa">{t.villa}</SelectItem>
              <SelectItem value="townhouse">{t.townhouse}</SelectItem>
              <SelectItem value="condo">{t.condo}</SelectItem>
              <SelectItem value="land">{t.land}</SelectItem>
              <SelectItem value="commercial">{t.commercial}</SelectItem>
              <SelectItem value="office">{t.office}</SelectItem>
              <SelectItem value="virtual_office">{t.virtualOffice}</SelectItem>
              <SelectItem value="warehouse">{t.warehouse}</SelectItem>
              <SelectItem value="retail">{t.retail}</SelectItem>
              <SelectItem value="hotel">{t.hotel}</SelectItem>
              <SelectItem value="resort">{t.resort}</SelectItem>
              <SelectItem value="studio">{t.studio}</SelectItem>
              <SelectItem value="penthouse">{t.penthouse}</SelectItem>
              <SelectItem value="duplex">{t.duplex}</SelectItem>
              <SelectItem value="shophouse">{t.shophouse}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="listing_type">{t.listingType} *</Label>
          <Select 
            value={formData.listing_type} 
            onValueChange={(value) => onUpdate('listing_type', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t.selectListingType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">{t.forSale}</SelectItem>
              <SelectItem value="rent">{t.forRent}</SelectItem>
              <SelectItem value="lease">{t.forLease}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="price">{t.price} *</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => onUpdate('price', e.target.value)}
          placeholder={t.pricePlaceholder}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          {formData.listing_type === 'rent' ? t.monthlyRental : t.salePrice}
        </p>
      </div>

      <div>
        <Label htmlFor="description">{t.description} *</Label>
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
            {t.descriptionGuide}
          </p>
        </div>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            const value = e.target.value;
            
            // Check if content contains prohibited information
            const hasProhibited = ContentCensor.containsProhibitedContent(value);
            
            if (hasProhibited) {
              // Censor the content
              const censoredValue = ContentCensor.censorContent(value);
              onUpdate('description', censoredValue);
              setShowCensorWarning(true);
              
              // Hide warning after 3 seconds
              setTimeout(() => setShowCensorWarning(false), 3000);
            } else {
              onUpdate('description', value);
            }
          }}
          placeholder={t.descriptionPlaceholder}
          rows={6}
          className="mt-2"
        />
        {showCensorWarning && (
          <div className="flex items-start gap-2 mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-900 dark:text-amber-100">{t.censorWarning}</p>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {t.descriptionHint}
        </p>
      </div>
    </div>
  );
};

export default BasicInfoStep;
