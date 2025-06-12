
import { useState, useEffect } from "react";
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

// Complete Indonesian provinces data
const indonesianProvinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", 
  "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung",
  "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara",
  "Maluku", "Maluku Utara", "Papua Barat", "Papua", "Papua Tengah", "Papua Pegunungan", "Papua Selatan", "Papua Barat Daya"
];

// Comprehensive cities data for all major provinces
const citiesData: Record<string, string[]> = {
  "DKI Jakarta": ["Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", "Jakarta Timur", "Kepulauan Seribu"],
  "Jawa Barat": ["Bandung", "Bekasi", "Bogor", "Depok", "Cirebon", "Sukabumi", "Tasikmalaya", "Karawang", "Purwakarta", "Subang", "Indramayu", "Kuningan", "Majalengka", "Sumedang", "Garut", "Cianjur", "Bandung Barat"],
  "Jawa Tengah": ["Semarang", "Solo", "Magelang", "Salatiga", "Pekalongan", "Tegal", "Surakarta", "Yogyakarta", "Klaten", "Boyolali", "Wonogiri", "Karanganyar", "Sragen", "Grobogan", "Blora", "Rembang", "Pati", "Kudus", "Jepara", "Demak", "Temanggung", "Wonosobo", "Purworejo", "Kebumen", "Banjarnegara", "Cilacap", "Banyumas", "Purbalingga"],
  "Jawa Timur": ["Surabaya", "Malang", "Kediri", "Blitar", "Madiun", "Mojokerto", "Pasuruan", "Probolinggo", "Jember", "Banyuwangi", "Bondowoso", "Situbondo", "Lumajang", "Tulungagung", "Trenggalek", "Ponorogo", "Pacitan", "Magetan", "Ngawi", "Bojonegoro", "Tuban", "Lamongan", "Gresik", "Bangkalan", "Sampang", "Pamekasan", "Sumenep"],
  "Banten": ["Tangerang", "Tangerang Selatan", "Serang", "Cilegon", "Lebak", "Pandeglang"],
  "Bali": ["Denpasar", "Badung", "Gianyar", "Tabanan", "Klungkung", "Bangli", "Karangasem", "Buleleng", "Jembrana"],
  "Sumatera Utara": ["Medan", "Binjai", "Tebing Tinggi", "Pematangsiantar", "Tanjung Balai", "Sibolga", "Padang Sidempuan", "Gunungsitoli"],
  "Sumatera Barat": ["Padang", "Bukittinggi", "Padang Panjang", "Payakumbuh", "Sawahlunto", "Solok", "Pariaman"],
  "Riau": ["Pekanbaru", "Dumai"],
  "Kepulauan Riau": ["Batam", "Tanjung Pinang"],
  "Jambi": ["Jambi", "Sungai Penuh"],
  "Sumatera Selatan": ["Palembang", "Prabumulih", "Pagar Alam", "Lubuk Linggau"],
  "Bengkulu": ["Bengkulu"],
  "Lampung": ["Bandar Lampung", "Metro"],
  "Kalimantan Barat": ["Pontianak", "Singkawang"],
  "Kalimantan Tengah": ["Palangka Raya"],
  "Kalimantan Selatan": ["Banjarmasin", "Banjarbaru"],
  "Kalimantan Timur": ["Samarinda", "Balikpapan", "Bontang"],
  "Kalimantan Utara": ["Tarakan"],
  "Sulawesi Utara": ["Manado", "Bitung", "Tomohon", "Kotamobagu"],
  "Sulawesi Tengah": ["Palu"],
  "Sulawesi Selatan": ["Makassar", "Pare-Pare", "Palopo"],
  "Sulawesi Tenggara": ["Kendari", "Bau-Bau"],
  "Gorontalo": ["Gorontalo"],
  "Maluku": ["Ambon", "Tual"],
  "Maluku Utara": ["Ternate", "Tidore Kepulauan"],
  "Papua": ["Jayapura"],
  "Papua Barat": ["Manokwari", "Sorong"]
};

// Comprehensive areas data for major cities
const areasData: Record<string, string[]> = {
  "Jakarta Pusat": ["Menteng", "Gambir", "Tanah Abang", "Senen", "Cempaka Putih", "Johar Baru", "Kemayoran", "Sawah Besar"],
  "Jakarta Selatan": ["Kebayoran Baru", "Kebayoran Lama", "Pesanggrahan", "Cilandak", "Pasar Minggu", "Jagakarsa", "Mampang Prapatan", "Pancoran", "Tebet", "Setiabudi"],
  "Jakarta Barat": ["Kebon Jeruk", "Palmerah", "Grogol Petamburan", "Tambora", "Taman Sari", "Cengkareng", "Kali Deres", "Kembangan"],
  "Jakarta Utara": ["Penjaringan", "Pademangan", "Tanjung Priok", "Koja", "Kelapa Gading", "Cilincing"],
  "Jakarta Timur": ["Matraman", "Pulogadung", "Jatinegara", "Cakung", "Duren Sawit", "Kramat Jati", "Makasar", "Pasar Rebo", "Ciracas", "Cipayung"],
  "Bandung": ["Coblong", "Bandung Wetan", "Sumur Bandung", "Andir", "Cicendo", "Cidadap", "Sukajadi", "Sukasari", "Dago", "Lembang", "Cimahi", "Padalarang", "Cileunyi"],
  "Surabaya": ["Wonokromo", "Gubeng", "Tegalsari", "Genteng", "Bubutan", "Simokerto", "Pabean Cantian", "Semampir", "Krembangan", "Bulak", "Kenjeran", "Rungkut", "Tenggilis Mejoyo", "Gunung Anyar", "Sukolilo", "Mulyorejo"],
  "Bekasi": ["Bekasi Timur", "Bekasi Barat", "Bekasi Utara", "Bekasi Selatan", "Medan Satria", "Bantargebang", "Pondok Gede", "Jati Asih", "Jati Sampurna", "Mustika Jaya"],
  "Tangerang": ["Tangerang Kota", "Karawaci", "Lippo Village", "Gading Serpong", "BSD City", "Alam Sutera", "Bintaro", "Serpong", "Pamulang", "Ciputat"],
  "Medan": ["Medan Kota", "Medan Barat", "Medan Timur", "Medan Utara", "Medan Selatan", "Medan Area", "Medan Johor", "Medan Amplas", "Medan Denai", "Medan Labuhan"],
  "Semarang": ["Semarang Tengah", "Semarang Utara", "Semarang Barat", "Semarang Timur", "Semarang Selatan", "Candisari", "Gajahmungkur", "Gayamsari", "Genuk", "Gunungpati"],
  "Makassar": ["Makassar Kota", "Biringkanaya", "Bontoala", "Ujung Pandang", "Wajo", "Ujung Tanah", "Tallo", "Panakkukang", "Manggala", "Rappocini"],
  "Palembang": ["Ilir Barat I", "Ilir Barat II", "Ilir Timur I", "Ilir Timur II", "Kalidoni", "Bukit Kecil", "Gandus", "Kemuning", "Kertapati", "Plaju"],
  "Denpasar": ["Denpasar Selatan", "Denpasar Timur", "Denpasar Barat", "Denpasar Utara"],
  "Padang": ["Padang Barat", "Padang Timur", "Padang Utara", "Padang Selatan", "Bungus Teluk Kabung", "Lubuk Kilangan", "Lubuk Begalung", "Pauh", "Koto Tangah", "Nanggalo", "Kuranji"],
  "Pekanbaru": ["Sukajadi", "Pekanbaru Kota", "Sail", "Lima Puluh", "Senapelan", "Rumbai", "Rumbai Pesisir", "Bukit Raya", "Marpoyan Damai", "Tenayan Raya"],
  "Banjarmasin": ["Banjarmasin Selatan", "Banjarmasin Tengah", "Banjarmasin Utara", "Banjarmasin Barat", "Banjarmasin Timur"],
  "Pontianak": ["Pontianak Kota", "Pontianak Selatan", "Pontianak Timur", "Pontianak Utara", "Pontianak Barat", "Pontianak Tenggara"],
  "Samarinda": ["Samarinda Kota", "Samarinda Seberang", "Samarinda Ulu", "Samarinda Ilir", "Sungai Kunjang", "Sambutan", "Loa Janan Ilir", "Sungai Pinang", "Samarinda Utara", "Palaran"],
  "Manado": ["Malalayang", "Sario", "Wanea", "Wenang", "Tikala", "Mapanget", "Singkil", "Tuminting", "Bunaken"],
  "Palu": ["Palu Barat", "Palu Timur", "Palu Selatan", "Palu Utara"],
  "Ambon": ["Nusaniwe", "Sirimau", "Teluk Ambon", "Baguala", "Teluk Ambon Baguala"],
  "Jayapura": ["Jayapura Selatan", "Jayapura Utara", "Abepura", "Muara Tami", "Heram"]
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
        <MapPin className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium text-gray-900">Pilih Lokasi</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Province Selection */}
        <div>
          <Label htmlFor="state" className="text-gray-700 font-medium">Provinsi *</Label>
          <Select value={selectedState} onValueChange={onStateChange}>
            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Pilih provinsi" />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg z-50">
              {indonesianProvinces.map((province) => (
                <SelectItem 
                  key={province} 
                  value={province}
                  className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100"
                >
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selection */}
        <div>
          <Label htmlFor="city" className="text-gray-700 font-medium">Kota/Kabupaten *</Label>
          <Select 
            value={selectedCity} 
            onValueChange={onCityChange}
            disabled={!selectedState}
          >
            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Pilih kota" />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg z-50">
              {availableCities.map((city) => (
                <SelectItem 
                  key={city} 
                  value={city}
                  className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100"
                >
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Area Selection */}
        <div>
          <Label htmlFor="area" className="text-gray-700 font-medium">Kecamatan/Area *</Label>
          <Select 
            value={selectedArea} 
            onValueChange={onAreaChange}
            disabled={!selectedCity}
          >
            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900">
              <SelectValue placeholder="Pilih area" />
            </SelectTrigger>
            <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg z-50">
              {availableAreas.map((area) => (
                <SelectItem 
                  key={area} 
                  value={area}
                  className="text-gray-900 hover:bg-blue-50 focus:bg-blue-100"
                >
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedState && selectedCity && selectedArea && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Lokasi terpilih:</span> {selectedArea}, {selectedCity}, {selectedState}
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
