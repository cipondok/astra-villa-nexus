
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

interface LocationSelectorProps {
  selectedState: string;
  selectedCity: string;
  selectedArea: string;
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
  onLocationChange?: (location: string) => void;
}

// Indonesian provinces data
const indonesianProvinces = [
  "DKI Jakarta", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Banten",
  "Yogyakarta", "Sumatera Utara", "Sumatera Barat", "Sumatera Selatan", 
  "Riau", "Kepulauan Riau", "Jambi", "Bengkulu", "Lampung", "Bangka Belitung",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Maluku", "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan"
];

// Sample cities data for major provinces
const citiesData: Record<string, string[]> = {
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"],
  "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Depok", "Cirebon", "Sukabumi", "Tasikmalaya", "Karawang", "Purwakarta", "Subang"],
  "Jawa Tengah": ["Semarang", "Solo", "Yogyakarta", "Magelang", "Salatiga", "Pekalongan", "Tegal", "Surakarta"],
  "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Blitar", "Madiun", "Mojokerto", "Pasuruan", "Probolinggo", "Jember", "Banyuwangi"],
  "Banten": ["Tangerang", "Tangerang Selatan", "Serang", "Cilegon", "Lebak", "Pandeglang"],
  "Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Klungkung", "Bangli", "Karangasem", "Buleleng", "Jembrana"],
  "Sumatera Utara": ["Medan", "Binjai", "Tebing Tinggi", "Pematangsiantar", "Tanjung Balai", "Sibolga", "Padang Sidempuan"],
  "Sumatera Barat": ["Padang", "Bukittinggi", "Padang Panjang", "Payakumbuh", "Sawahlunto", "Solok", "Pariaman"]
};

// Sample areas data for major cities
const areasData: Record<string, string[]> = {
  "Jakarta Pusat": ["Menteng", "Gambir", "Tanah Abang", "Senen", "Cempaka Putih", "Johar Baru", "Kemayoran", "Sawah Besar"],
  "Jakarta Selatan": ["Kebayoran Baru", "Kebayoran Lama", "Pesanggrahan", "Cilandak", "Pasar Minggu", "Jagakarsa", "Mampang Prapatan", "Pancoran", "Tebet", "Setiabudi"],
  "Jakarta Barat": ["Kebon Jeruk", "Palmerah", "Grogol Petamburan", "Tambora", "Taman Sari", "Cengkareng", "Kali Deres", "Kembangan"],
  "Jakarta Utara": ["Penjaringan", "Pademangan", "Tanjung Priok", "Koja", "Kelapa Gading", "Cilincing"],
  "Jakarta Timur": ["Matraman", "Pulogadung", "Jatinegara", "Cakung", "Duren Sawit", "Kramat Jati", "Makasar", "Pasar Rebo", "Ciracas", "Cipayung"],
  "Bandung": ["Coblong", "Bandung Wetan", "Sumur Bandung", "Andir", "Cicendo", "Cidadap", "Sukajadi", "Sukasari", "Dago", "Lembang"],
  "Surabaya": ["Wonokromo", "Gubeng", "Tegalsari", "Genteng", "Bubutan", "Simokerto", "Pabean Cantian", "Semampir", "Krembangan", "Bulak"],
  "Bekasi": ["Bekasi Timur", "Bekasi Barat", "Bekasi Utara", "Bekasi Selatan", "Medan Satria", "Bantargebang", "Pondok Gede", "Jati Asih"],
  "Tangerang": ["Tangerang Kota", "Karawaci", "Lippo Village", "Gading Serpong", "BSD City", "Alam Sutera", "Bintaro", "Serpong"]
};

const LocationSelector = ({
  selectedState,
  selectedCity,
  selectedArea,
  onStateChange,
  onCityChange,
  onAreaChange,
  onLocationChange
}: LocationSelectorProps) => {
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      const cities = citiesData[selectedState] || [];
      setAvailableCities(cities);
      
      // Reset city and area if current selections are not available
      if (!cities.includes(selectedCity)) {
        onCityChange("");
        onAreaChange("");
      }
    } else {
      setAvailableCities([]);
      onCityChange("");
      onAreaChange("");
    }
  }, [selectedState]);

  // Update areas when city changes
  useEffect(() => {
    if (selectedCity) {
      const areas = areasData[selectedCity] || [];
      setAvailableAreas(areas);
      
      // Reset area if current selection is not available
      if (!areas.includes(selectedArea)) {
        onAreaChange("");
      }
    } else {
      setAvailableAreas([]);
      onAreaChange("");
    }
  }, [selectedCity]);

  // Update location string when selections change
  useEffect(() => {
    if (selectedArea && selectedCity && selectedState && onLocationChange) {
      onLocationChange(`${selectedArea}, ${selectedCity}, ${selectedState}`);
    }
  }, [selectedState, selectedCity, selectedArea, onLocationChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-gray-500" />
        <h3 className="font-medium">Pilih Lokasi</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province Selection */}
        <div>
          <Label htmlFor="state">Provinsi *</Label>
          <Select value={selectedState} onValueChange={onStateChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih provinsi" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {indonesianProvinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selection */}
        <div>
          <Label htmlFor="city">Kota/Kabupaten *</Label>
          <Select 
            value={selectedCity} 
            onValueChange={onCityChange}
            disabled={!selectedState}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kota" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Selection */}
        <div>
          <Label htmlFor="area">Kecamatan/Area *</Label>
          <Select 
            value={selectedArea} 
            onValueChange={onAreaChange}
            disabled={!selectedCity}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih area" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {availableAreas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedState && selectedCity && selectedArea && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Lokasi terpilih:</span> {selectedArea}, {selectedCity}, {selectedState}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
