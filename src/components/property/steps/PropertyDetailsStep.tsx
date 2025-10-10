import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

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
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button
                key={`bed-${num}`}
                type="button"
                onClick={() => onUpdate('bedrooms', String(num))}
                className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                  formData.bedrooms === String(num)
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'bg-background hover:bg-accent hover:border-primary'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="bathrooms">{t.bathrooms}</Label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[0, 1, 2, 3, 4, 5, 6].map(num => (
              <button
                key={`bath-${num}`}
                type="button"
                onClick={() => onUpdate('bathrooms', String(num))}
                className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                  formData.bathrooms === String(num)
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'bg-background hover:bg-accent hover:border-primary'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="area_sqm">{t.area} *</Label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[50, 100, 150, 200, 300, 500, 1000].map(num => (
              <button
                key={`area-${num}`}
                type="button"
                onClick={() => onUpdate('area_sqm', String(num))}
                className={`px-3 h-10 rounded-lg border text-sm font-medium transition-all ${
                  formData.area_sqm === String(num)
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'bg-background hover:bg-accent hover:border-primary'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <Input
            id="area_sqm"
            type="number"
            min="0"
            value={formData.area_sqm}
            onChange={(e) => onUpdate('area_sqm', e.target.value)}
            placeholder="150"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="floors">{t.floors}</Label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={`floor-${num}`}
                type="button"
                onClick={() => onUpdate('floors', String(num))}
                className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                  formData.floors === String(num)
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'bg-background hover:bg-accent hover:border-primary'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="garages">{t.garages}</Label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[0, 1, 2, 3, 4, 5].map(num => (
              <button
                key={`garage-${num}`}
                type="button"
                onClick={() => onUpdate('garages', String(num))}
                className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all ${
                  formData.garages === String(num)
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'bg-background hover:bg-accent hover:border-primary'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="year_built">{t.yearBuilt}</Label>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2015, 2010, 2000].map(num => (
              <button
                key={`year-${num}`}
                type="button"
                onClick={() => onUpdate('year_built', String(num))}
                className={`px-2 h-10 rounded-lg border text-xs font-medium transition-all ${
                  formData.year_built === String(num)
                    ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                    : 'bg-background hover:bg-accent hover:border-primary'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <Input
            id="year_built"
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.year_built}
            onChange={(e) => onUpdate('year_built', e.target.value)}
            placeholder="2020"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="development_status">{t.developmentStatus}</Label>
          <Select 
            value={formData.development_status} 
            onValueChange={(value) => onUpdate('development_status', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t.selectStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">{t.completed}</SelectItem>
              <SelectItem value="under_construction">{t.underConstruction}</SelectItem>
              <SelectItem value="planned">{t.planned}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="owner_type">{t.ownerType}</Label>
          <Select 
            value={formData.owner_type} 
            onValueChange={(value) => onUpdate('owner_type', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t.selectOwnerType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">{t.individual}</SelectItem>
              <SelectItem value="developer">{t.developer}</SelectItem>
              <SelectItem value="company">{t.company}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="furnished">{t.furnished}</Label>
          <Select 
            value={formData.furnished} 
            onValueChange={(value) => onUpdate('furnished', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t.selectFurnished} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unfurnished">{t.unfurnished}</SelectItem>
              <SelectItem value="semi_furnished">{t.semiFurnished}</SelectItem>
              <SelectItem value="fully_furnished">{t.fullyFurnished}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="condition">{t.condition}</Label>
          <Select 
            value={formData.condition} 
            onValueChange={(value) => onUpdate('condition', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t.selectCondition} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new_construction">{t.newConstruction}</SelectItem>
              <SelectItem value="excellent">{t.excellent}</SelectItem>
              <SelectItem value="good">{t.good}</SelectItem>
              <SelectItem value="fair">{t.fair}</SelectItem>
              <SelectItem value="needs_renovation">{t.needsRenovation}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="certificate_type">{t.certificateType}</Label>
          <Select 
            value={formData.certificate_type} 
            onValueChange={(value) => onUpdate('certificate_type', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t.selectCertificate} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shm">{t.shm}</SelectItem>
              <SelectItem value="hgb">{t.hgb}</SelectItem>
              <SelectItem value="hgu">{t.hgu}</SelectItem>
              <SelectItem value="girik">{t.girik}</SelectItem>
              <SelectItem value="adat">{t.adat}</SelectItem>
              <SelectItem value="other">{t.other}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="building_orientation">{t.buildingOrientation}</Label>
          <Select 
            value={formData.building_orientation} 
            onValueChange={(value) => onUpdate('building_orientation', value)}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={t.buildingOrientation} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north">{t.north}</SelectItem>
              <SelectItem value="south">{t.south}</SelectItem>
              <SelectItem value="east">{t.east}</SelectItem>
              <SelectItem value="west">{t.west}</SelectItem>
            </SelectContent>
          </Select>
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
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[1, 7, 14, 30, 90, 180, 365].map(num => (
                <button
                  key={`rental-${num}`}
                  type="button"
                  onClick={() => onUpdate('minimum_rental_days', String(num))}
                  className={`px-3 h-10 rounded-lg border text-sm font-medium transition-all ${
                    formData.minimum_rental_days === String(num)
                      ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                      : 'bg-background hover:bg-accent hover:border-primary'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <Input
              id="minimum_rental_days"
              type="number"
              min="1"
              value={formData.minimum_rental_days}
              onChange={(e) => onUpdate('minimum_rental_days', e.target.value)}
              placeholder="30"
              className="mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsStep;
