import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTranslation } from "@/i18n/useTranslation";
import { ContentCensor } from "@/utils/contentCensor";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface BasicInfoStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const BasicInfoStep = ({ formData, onUpdate }: BasicInfoStepProps) => {
  const { language } = useTranslation();
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
      descriptionGuide: "Do NOT include phone numbers, email, websites, or WhatsApp links.",
      censorWarning: "Contact information was automatically censored.",
      house: "House", apartment: "Apartment", villa: "Villa", townhouse: "Townhouse",
      condo: "Condo", land: "Land", commercial: "Commercial", office: "Office Space",
      virtualOffice: "Virtual Office", warehouse: "Warehouse", retail: "Retail Space",
      hotel: "Hotel", resort: "Resort", studio: "Studio", penthouse: "Penthouse",
      duplex: "Duplex", shophouse: "Shophouse",
      forSale: "For Sale", forRent: "For Rent", forLease: "For Lease",
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
      descriptionGuide: "JANGAN sertakan nomor telepon, email, website, atau link WhatsApp.",
      censorWarning: "Informasi kontak telah disensor otomatis.",
      house: "Rumah", apartment: "Apartemen", villa: "Villa", townhouse: "Rumah Teres",
      condo: "Kondominium", land: "Tanah", commercial: "Komersial", office: "Ruang Kantor",
      virtualOffice: "Kantor Virtual", warehouse: "Gudang", retail: "Ruang Ritel",
      hotel: "Hotel", resort: "Resor", studio: "Studio", penthouse: "Penthouse",
      duplex: "Duplex", shophouse: "Ruko",
      forSale: "Dijual", forRent: "Disewakan", forLease: "Disewa Jangka Panjang",
    }
  }[language];

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-xs font-medium">{t.title} *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder={t.titlePlaceholder}
          className="mt-1 h-9 text-sm"
        />
      </div>

      {/* Property Type + Listing Type side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs font-medium">{t.propertyType} *</Label>
          <div className="mt-1">
            <SearchableSelect
              value={formData.property_type}
              onValueChange={(value) => onUpdate('property_type', value)}
              placeholder={t.selectPropertyType}
              searchPlaceholder={language === 'id' ? 'Cari tipe...' : 'Search type...'}
              emptyText={language === 'id' ? 'Tidak ditemukan.' : 'No results.'}
              options={[
                { value: 'house', label: t.house },
                { value: 'apartment', label: t.apartment },
                { value: 'villa', label: t.villa },
                { value: 'townhouse', label: t.townhouse },
                { value: 'condo', label: t.condo },
                { value: 'land', label: t.land },
                { value: 'commercial', label: t.commercial },
                { value: 'office', label: t.office },
                { value: 'virtual_office', label: t.virtualOffice },
                { value: 'warehouse', label: t.warehouse },
                { value: 'retail', label: t.retail },
                { value: 'hotel', label: t.hotel },
                { value: 'resort', label: t.resort },
                { value: 'studio', label: t.studio },
                { value: 'penthouse', label: t.penthouse },
                { value: 'duplex', label: t.duplex },
                { value: 'shophouse', label: t.shophouse },
              ]}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium">{t.listingType} *</Label>
          <div className="mt-1">
            <SearchableSelect
              value={formData.listing_type}
              onValueChange={(value) => onUpdate('listing_type', value)}
              placeholder={t.selectListingType}
              searchPlaceholder={language === 'id' ? 'Cari...' : 'Search...'}
              emptyText={language === 'id' ? 'Tidak ditemukan.' : 'No results.'}
              options={[
                { value: 'sale', label: t.forSale },
                { value: 'rent', label: t.forRent },
                { value: 'lease', label: t.forLease },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Price */}
      <div>
        <Label htmlFor="price" className="text-xs font-medium">{t.price} *</Label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">Rp</span>
          <Input
            id="price"
            type="text"
            value={formData.price ? new Intl.NumberFormat('id-ID').format(Number(formData.price)) : ''}
            onChange={(e) => {
              const value = e.target.value.replace(/\./g, '');
              if (value === '' || /^\d+$/.test(value)) {
                onUpdate('price', value);
              }
            }}
            placeholder="0"
            className="pl-9 text-right font-medium h-9 text-sm"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formData.listing_type === 'rent' ? t.monthlyRental : t.salePrice}
        </p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-xs font-medium">{t.description} *</Label>
        <div className="mt-1 px-2.5 py-1.5 bg-chart-4/5 border border-chart-4/20 rounded-md">
          <p className="text-[10px] text-chart-4 font-medium leading-tight">{t.descriptionGuide}</p>
        </div>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            const value = e.target.value;
            const hasProhibited = ContentCensor.containsProhibitedContent(value);
            if (hasProhibited) {
              const censoredValue = ContentCensor.censorContent(value);
              onUpdate('description', censoredValue);
              setShowCensorWarning(true);
              setTimeout(() => setShowCensorWarning(false), 3000);
            } else {
              onUpdate('description', value);
            }
          }}
          placeholder={t.descriptionPlaceholder}
          rows={4}
          className="mt-1 text-sm"
        />
        {showCensorWarning && (
          <div className="flex items-center gap-1.5 mt-1 px-2 py-1 bg-chart-3/5 border border-chart-3/20 rounded-md">
            <AlertCircle className="h-3 w-3 flex-shrink-0 text-chart-3" />
            <p className="text-[10px] text-chart-3">{t.censorWarning}</p>
          </div>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5">{t.descriptionHint}</p>
      </div>
    </div>
  );
};

export default BasicInfoStep;
