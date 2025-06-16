
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Heart, Leaf, TrendingUp, Volume2, Building2, Home } from "lucide-react";

interface PropertySpecificationsProps {
  propertyFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
}

const PropertySpecifications = ({ propertyFilters, onFilterChange }: PropertySpecificationsProps) => {
  // Fetch active search filters for property specifications
  const { data: searchFilters, isLoading } = useQuery({
    queryKey: ['property-search-filters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_filters')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching search filters:', error);
        throw error;
      }
      return data || [];
    }
  });

  const renderFilterField = (filter: any) => {
    const filterValue = propertyFilters[filter.id] || '';
    
    switch (filter.filter_type) {
      case 'select':
        const options = typeof filter.filter_options === 'string' 
          ? filter.filter_options.split(',').map((opt: string) => opt.trim())
          : Array.isArray(filter.filter_options) 
          ? filter.filter_options 
          : [];

        return (
          <div key={filter.id}>
            <Label htmlFor={filter.id} className="text-gray-700 font-medium">
              {filter.filter_name}
            </Label>
            <Select 
              value={filterValue} 
              onValueChange={(value) => onFilterChange(filter.id, value)}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder={`Pilih ${filter.filter_name}`} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {options.map((option: string, index: number) => (
                  <SelectItem key={index} value={option} className="text-gray-900 hover:bg-blue-50">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        const checkboxOptions = typeof filter.filter_options === 'string' 
          ? filter.filter_options.split(',').map((opt: string) => opt.trim())
          : Array.isArray(filter.filter_options) 
          ? filter.filter_options 
          : [];

        return (
          <div key={filter.id}>
            <Label className="text-gray-700 font-medium mb-2 block">
              {filter.filter_name}
            </Label>
            <div className="space-y-2">
              {checkboxOptions.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.id}-${index}`}
                    checked={(filterValue as string[])?.includes(option) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = (filterValue as string[]) || [];
                      if (checked) {
                        onFilterChange(filter.id, [...currentValues, option]);
                      } else {
                        onFilterChange(filter.id, currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${filter.id}-${index}`} className="text-sm text-gray-900">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'input':
        return (
          <div key={filter.id}>
            <Label htmlFor={filter.id} className="text-gray-700 font-medium">
              {filter.filter_name}
            </Label>
            <Input
              id={filter.id}
              value={filterValue}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              placeholder={`Masukkan ${filter.filter_name}`}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        );

      // Skip range filters for property listing since they're mainly for search
      case 'range':
        return null;

      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lifestyle':
        return <Heart className="h-5 w-5 text-pink-600" />;
      case 'sustainability':
        return <Leaf className="h-5 w-5 text-green-600" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'neighborhood':
        return <Volume2 className="h-5 w-5 text-purple-600" />;
      case 'developer':
        return <Building2 className="h-5 w-5 text-orange-600" />;
      case 'property':
        return <Home className="h-5 w-5 text-gray-600" />;
      default:
        return <Filter className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'lifestyle':
        return 'Gaya Hidup & Kenyamanan';
      case 'sustainability':
        return 'Keberlanjutan & Ramah Lingkungan';
      case 'investment':
        return 'Potensi Investasi';
      case 'neighborhood':
        return 'Lingkungan & Suasana';
      case 'developer':
        return 'Informasi Developer & Proyek';
      case 'property':
        return 'Spesifikasi Properti';
      case 'amenities':
        return 'Fasilitas & Amenities';
      case 'location':
        return 'Fitur Lokasi & Lingkungan';
      default:
        return 'Fitur Properti';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Spesifikasi & Fitur Properti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat spesifikasi...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!searchFilters || searchFilters.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Spesifikasi & Fitur Properti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada spesifikasi properti yang tersedia.</p>
            <p className="text-sm text-gray-400 mt-1">
              Admin dapat menambahkan spesifikasi di panel administrasi.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group filters by category
  const filtersByCategory = searchFilters.reduce((acc: Record<string, any[]>, filter: any) => {
    if (filter.filter_type !== 'range' && 
        !filter.filter_name.toLowerCase().includes('harga') && 
        !filter.filter_name.toLowerCase().includes('price')) {
      const category = filter.category || 'other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(filter);
    }
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          Spesifikasi & Fitur Properti
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Tambahkan spesifikasi dan fitur properti untuk informasi yang lebih detail kepada calon pembeli/penyewa.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.entries(filtersByCategory).map(([category, filters]) => (
            <div key={category}>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                {getCategoryIcon(category)}
                {getCategoryTitle(category)}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filters.map((filter: any) => renderFilterField(filter))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertySpecifications;
