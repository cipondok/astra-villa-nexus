import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import NumberSelector from "@/components/ui/NumberSelector";
import PillSelector from "@/components/ui/PillSelector";

interface PropertyDetailsStepProps {
  formData: any;
  onUpdate: (field: string, value: any) => void;
}

const PropertyDetailsStep = ({ formData, onUpdate }: PropertyDetailsStepProps) => {
  const { language } = useLanguage();

  const t = {
    en: {
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area (m²)",
      floors: "Number of Floors",
      garages: "Garages",
      yearBuilt: "Year Built",
      developmentStatus: "Development Status",
      selectStatus: "Select status",
      completed: "Completed",
      underConstruction: "Under Construction",
      planned: "Planned",
      ownerType: "Owner Type",
      selectOwnerType: "Select owner type",
      individual: "Individual",
      developer: "Developer",
      company: "Company",
      furnished: "Furnished Status",
      selectFurnished: "Select furnished status",
      unfurnished: "Unfurnished",
      semiFurnished: "Semi Furnished",
      fullyFurnished: "Fully Furnished",
      condition: "Property Condition",
      selectCondition: "Select condition",
      newConstruction: "New Construction",
      excellent: "Excellent",
      good: "Good",
      fair: "Fair",
      needsRenovation: "Needs Renovation",
      rentalInfo: "Rental Information",
      rentalPeriods: "Rental Periods Available",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
      minimumRentalDays: "Minimum Rental Days",
      certificateType: "Certificate Type",
      selectCertificate: "Select certificate type",
      shm: "SHM (Hak Milik)",
      hgb: "HGB (Hak Guna Bangunan)",
      hgu: "HGU (Hak Guna Usaha)",
      girik: "Girik / Petok D",
      adat: "Sertifikat Adat",
      other: "Other",
      buildingOrientation: "Building Orientation",
      north: "North",
      south: "South",
      east: "East",
      west: "West",
    },
    id: {
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      area: "Luas (m²)",
      floors: "Jumlah Lantai",
      garages: "Garasi",
      yearBuilt: "Tahun Dibangun",
      developmentStatus: "Status Pembangunan",
      selectStatus: "Pilih status",
      completed: "Selesai",
      underConstruction: "Sedang Dibangun",
      planned: "Direncanakan",
      ownerType: "Tipe Pemilik",
      selectOwnerType: "Pilih tipe pemilik",
      individual: "Individu",
      developer: "Developer",
      company: "Perusahaan",
      furnished: "Status Perabotan",
      selectFurnished: "Pilih status perabotan",
      unfurnished: "Tidak Berperabotan",
      semiFurnished: "Semi Furnished",
      fullyFurnished: "Fully Furnished",
      condition: "Kondisi Properti",
      selectCondition: "Pilih kondisi",
      newConstruction: "Bangunan Baru",
      excellent: "Sangat Baik",
      good: "Baik",
      fair: "Cukup",
      needsRenovation: "Perlu Renovasi",
      rentalInfo: "Informasi Sewa",
      rentalPeriods: "Periode Sewa Tersedia",
      daily: "Harian",
      weekly: "Mingguan",
      monthly: "Bulanan",
      yearly: "Tahunan",
      minimumRentalDays: "Minimal Hari Sewa",
      certificateType: "Tipe Sertifikat",
      selectCertificate: "Pilih tipe sertifikat",
      shm: "SHM (Hak Milik)",
      hgb: "HGB (Hak Guna Bangunan)",
      hgu: "HGU (Hak Guna Usaha)",
      girik: "Girik / Petok D",
      adat: "Sertifikat Adat",
      other: "Lainnya",
      buildingOrientation: "Orientasi Bangunan",
      north: "Utara",
      south: "Selatan",
      east: "Timur",
      west: "Barat",
    }
  }[language];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="bedrooms">{t.bedrooms}</Label>
          <NumberSelector
            options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            value={formData.bedrooms}
            onChange={(val) => onUpdate('bedrooms', val)}
            className="mt-2"
            compact
          />
        </div>

        <div>
          <Label htmlFor="bathrooms">{t.bathrooms}</Label>
          <NumberSelector
            options={[0, 1, 2, 3, 4, 5, 6]}
            value={formData.bathrooms}
            onChange={(val) => onUpdate('bathrooms', val)}
            className="mt-2"
            compact
          />
        </div>

        <div>
          <Label htmlFor="area_sqm">{t.area} *</Label>
          <NumberSelector
            options={[50, 100, 150, 200, 300, 500, 1000]}
            value={formData.area_sqm}
            onChange={(val) => onUpdate('area_sqm', val)}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="floors">{t.floors}</Label>
          <NumberSelector
            options={[1, 2, 3, 4, 5]}
            value={formData.floors}
            onChange={(val) => onUpdate('floors', val)}
            className="mt-2"
            compact
          />
        </div>

        <div>
          <Label htmlFor="garages">{t.garages}</Label>
          <NumberSelector
            options={[0, 1, 2, 3, 4, 5]}
            value={formData.garages}
            onChange={(val) => onUpdate('garages', val)}
            className="mt-2"
            compact
          />
        </div>

        <div>
          <Label htmlFor="year_built">{t.yearBuilt}</Label>
          <NumberSelector
            options={[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2015, 2010, 2000]}
            value={formData.year_built}
            onChange={(val) => onUpdate('year_built', val)}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="development_status">{t.developmentStatus}</Label>
          <PillSelector
            options={[
              { value: 'completed', label: t.completed },
              { value: 'under_construction', label: t.underConstruction },
              { value: 'planned', label: t.planned }
            ]}
            value={formData.development_status}
            onChange={(value) => onUpdate('development_status', value)}
            placeholder={t.selectStatus}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="owner_type">{t.ownerType}</Label>
          <PillSelector
            options={[
              { value: 'individual', label: t.individual },
              { value: 'developer', label: t.developer },
              { value: 'company', label: t.company }
            ]}
            value={formData.owner_type}
            onChange={(value) => onUpdate('owner_type', value)}
            placeholder={t.selectOwnerType}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="furnished">{t.furnished}</Label>
          <PillSelector
            options={[
              { value: 'unfurnished', label: t.unfurnished },
              { value: 'semi_furnished', label: t.semiFurnished },
              { value: 'fully_furnished', label: t.fullyFurnished }
            ]}
            value={formData.furnished}
            onChange={(value) => onUpdate('furnished', value)}
            placeholder={t.selectFurnished}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="condition">{t.condition}</Label>
          <PillSelector
            options={[
              { value: 'new_construction', label: t.newConstruction },
              { value: 'excellent', label: t.excellent },
              { value: 'good', label: t.good },
              { value: 'fair', label: t.fair },
              { value: 'needs_renovation', label: t.needsRenovation }
            ]}
            value={formData.condition}
            onChange={(value) => onUpdate('condition', value)}
            placeholder={t.selectCondition}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="certificate_type">{t.certificateType}</Label>
          <PillSelector
            options={[
              { value: 'shm', label: t.shm },
              { value: 'hgb', label: t.hgb },
              { value: 'hgu', label: t.hgu },
              { value: 'girik', label: t.girik },
              { value: 'adat', label: t.adat },
              { value: 'other', label: t.other }
            ]}
            value={formData.certificate_type}
            onChange={(value) => onUpdate('certificate_type', value)}
            placeholder={t.selectCertificate}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="building_orientation">{t.buildingOrientation}</Label>
          <PillSelector
            options={[
              { value: 'north', label: t.north },
              { value: 'south', label: t.south },
              { value: 'east', label: t.east },
              { value: 'west', label: t.west }
            ]}
            value={formData.building_orientation}
            onChange={(value) => onUpdate('building_orientation', value)}
            placeholder={t.buildingOrientation}
            className="mt-2"
          />
        </div>
      </div>

      {formData.listing_type === 'rent' && (
        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
          <h4 className="font-semibold">{t.rentalInfo}</h4>
          
          <div>
            <Label>{t.rentalPeriods}</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {[
                { value: 'daily', label: t.daily },
                { value: 'weekly', label: t.weekly },
                { value: 'monthly', label: t.monthly },
                { value: 'yearly', label: t.yearly }
              ].map((period) => (
                <div key={period.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={period.value}
                    checked={formData.rental_periods?.includes(period.value)}
                    onChange={(e) => {
                      const current = formData.rental_periods || [];
                      const updated = e.target.checked
                        ? [...current, period.value]
                        : current.filter((p: string) => p !== period.value);
                      onUpdate('rental_periods', updated);
                    }}
                    className="rounded border-input"
                  />
                  <Label htmlFor={period.value} className="text-sm font-normal cursor-pointer">
                    {period.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="minimum_rental_days">{t.minimumRentalDays}</Label>
            <NumberSelector
              options={[1, 7, 14, 30, 90, 180, 365]}
              value={formData.minimum_rental_days}
              onChange={(val) => onUpdate('minimum_rental_days', val)}
              className="mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsStep;
