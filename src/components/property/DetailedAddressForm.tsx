
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building, Hash, Layers } from "lucide-react";

interface DetailedAddressFormProps {
  onAddressChange: (addressData: DetailedAddressData) => void;
  initialData?: Partial<DetailedAddressData>;
}

export interface DetailedAddressData {
  streetAddress: string;
  blockNumber: string;
  floorNumber: string;
  unitNumber: string;
  apartmentName: string;
  buildingName: string;
  landmark: string;
  postalCode: string;
  additionalNotes: string;
}

const DetailedAddressForm = ({ onAddressChange, initialData }: DetailedAddressFormProps) => {
  const [addressData, setAddressData] = useState<DetailedAddressData>({
    streetAddress: initialData?.streetAddress || "",
    blockNumber: initialData?.blockNumber || "",
    floorNumber: initialData?.floorNumber || "",
    unitNumber: initialData?.unitNumber || "",
    apartmentName: initialData?.apartmentName || "",
    buildingName: initialData?.buildingName || "",
    landmark: initialData?.landmark || "",
    postalCode: initialData?.postalCode || "",
    additionalNotes: initialData?.additionalNotes || "",
  });

  const handleInputChange = (field: keyof DetailedAddressData, value: string) => {
    const newData = { ...addressData, [field]: value };
    setAddressData(newData);
    onAddressChange(newData);
  };

  return (
    <div className="space-y-6">
      {/* Street Address */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-chart-4" />
            Alamat Lengkap
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="streetAddress" className="text-foreground font-medium">
              Alamat Jalan *
            </Label>
            <Input
              id="streetAddress"
              value={addressData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              placeholder="Contoh: Jl. Sudirman No. 123"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="blockNumber" className="text-foreground font-medium">
                Nomor Blok
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="blockNumber"
                  value={addressData.blockNumber}
                  onChange={(e) => handleInputChange('blockNumber', e.target.value)}
                  placeholder="Contoh: A, B1, C-12"
                  className="bg-background border-border text-foreground pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="postalCode" className="text-foreground font-medium">
                Kode Pos
              </Label>
              <Input
                id="postalCode"
                value={addressData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="Contoh: 12110"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Building Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5 text-chart-1" />
            Detail Bangunan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buildingName" className="text-foreground font-medium">
                Nama Gedung/Kompleks
              </Label>
              <Input
                id="buildingName"
                value={addressData.buildingName}
                onChange={(e) => handleInputChange('buildingName', e.target.value)}
                placeholder="Contoh: Gedung Wisma Central"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="apartmentName" className="text-foreground font-medium">
                Nama Apartemen/Perumahan
              </Label>
              <Input
                id="apartmentName"
                value={addressData.apartmentName}
                onChange={(e) => handleInputChange('apartmentName', e.target.value)}
                placeholder="Contoh: Apartemen Taman Anggrek"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="floorNumber" className="text-foreground font-medium">
                Nomor Lantai
              </Label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="floorNumber"
                  value={addressData.floorNumber}
                  onChange={(e) => handleInputChange('floorNumber', e.target.value)}
                  placeholder="Contoh: 5, LG, Mezzanine"
                  className="bg-background border-border text-foreground pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="unitNumber" className="text-foreground font-medium">
                Nomor Unit/Kamar
              </Label>
              <Input
                id="unitNumber"
                value={addressData.unitNumber}
                onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                placeholder="Contoh: 501, A12, Studio-5"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-chart-5" />
            Informasi Tambahan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="landmark" className="text-gray-700 font-medium">
              Patokan/Landmark Terdekat
            </Label>
            <Input
              id="landmark"
              value={addressData.landmark}
              onChange={(e) => handleInputChange('landmark', e.target.value)}
              placeholder="Contoh: Dekat Mall Grand Indonesia, Samping Bank BCA"
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div>
            <Label htmlFor="additionalNotes" className="text-gray-700 font-medium">
              Catatan Alamat Tambahan
            </Label>
            <Textarea
              id="additionalNotes"
              value={addressData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Informasi tambahan untuk memudahkan pencarian lokasi..."
              rows={3}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedAddressForm;
