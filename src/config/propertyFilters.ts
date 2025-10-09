// Central Property Filter Configuration System
// Different features and filters for rent vs sale properties

export interface PropertyFeature {
  key: string;
  labelEn: string;
  labelId: string;
  icon: string;
  applicableFor: ('sale' | 'rent' | 'lease')[];
  category: 'basic' | 'amenity' | 'security' | 'environment' | 'accessibility';
}

export interface FilterOption {
  value: string;
  labelEn: string;
  labelId: string;
}

export interface PropertyFilterConfig {
  key: string;
  labelEn: string;
  labelId: string;
  type: 'select' | 'multiselect' | 'range' | 'boolean';
  options?: FilterOption[];
  applicableFor: ('sale' | 'rent' | 'lease')[];
  category: 'property' | 'location' | 'price' | 'features' | 'specifications';
}

// Property Features - Different for Rent and Sale
export const PROPERTY_FEATURES: PropertyFeature[] = [
  // Common features for both
  {
    key: 'airconditioner',
    labelEn: 'Air Conditioner',
    labelId: 'AC',
    icon: '❄️',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'wifi',
    labelEn: 'WiFi',
    labelId: 'WiFi',
    icon: '📶',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'parking',
    labelEn: 'Parking Space',
    labelId: 'Tempat Parkir',
    icon: '🚗',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'swimmingpool',
    labelEn: 'Swimming Pool',
    labelId: 'Kolam Renang',
    icon: '🏊',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'amenity'
  },
  {
    key: 'gym',
    labelEn: 'Gym/Fitness Center',
    labelId: 'Gym/Pusat Kebugaran',
    icon: '💪',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'amenity'
  },
  {
    key: 'garden',
    labelEn: 'Garden',
    labelId: 'Taman',
    icon: '🌳',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'environment'
  },
  {
    key: 'balcony',
    labelEn: 'Balcony',
    labelId: 'Balkon',
    icon: '🏠',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'security',
    labelEn: '24/7 Security',
    labelId: 'Keamanan 24/7',
    icon: '🛡️',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'security'
  },
  {
    key: 'cctv',
    labelEn: 'CCTV',
    labelId: 'CCTV',
    icon: '📹',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'security'
  },
  {
    key: 'elevator',
    labelEn: 'Elevator',
    labelId: 'Lift',
    icon: '🛗',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'accessibility'
  },
  {
    key: 'petfriendly',
    labelEn: 'Pet Friendly',
    labelId: 'Ramah Hewan',
    icon: '🐕',
    applicableFor: ['rent', 'lease'],
    category: 'basic'
  },
  // Rental-specific features
  {
    key: 'furnished',
    labelEn: 'Fully Furnished',
    labelId: 'Lengkap Perabotan',
    icon: '🛋️',
    applicableFor: ['rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'semifurnished',
    labelEn: 'Semi Furnished',
    labelId: 'Semi Perabotan',
    icon: '🪑',
    applicableFor: ['rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'utilitiesincluded',
    labelEn: 'Utilities Included',
    labelId: 'Utilitas Termasuk',
    icon: '💡',
    applicableFor: ['rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'internetincluded',
    labelEn: 'Internet Included',
    labelId: 'Internet Termasuk',
    icon: '🌐',
    applicableFor: ['rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'maidservice',
    labelEn: 'Maid Service',
    labelId: 'Layanan Pembantu',
    icon: '🧹',
    applicableFor: ['rent', 'lease'],
    category: 'amenity'
  },
  // Sale-specific features
  {
    key: 'newconstruction',
    labelEn: 'New Construction',
    labelId: 'Bangunan Baru',
    icon: '🏗️',
    applicableFor: ['sale'],
    category: 'basic'
  },
  {
    key: 'renovated',
    labelEn: 'Recently Renovated',
    labelId: 'Baru Direnovasi',
    icon: '🔨',
    applicableFor: ['sale'],
    category: 'basic'
  },
  {
    key: 'smartHome',
    labelEn: 'Smart Home System',
    labelId: 'Sistem Rumah Pintar',
    icon: '🏠',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'basic'
  },
  {
    key: 'solarPanel',
    labelEn: 'Solar Panels',
    labelId: 'Panel Surya',
    icon: '☀️',
    applicableFor: ['sale'],
    category: 'environment'
  },
  // Location-based features
  {
    key: 'nearschool',
    labelEn: 'Near School',
    labelId: 'Dekat Sekolah',
    icon: '🏫',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'environment'
  },
  {
    key: 'nearhospital',
    labelEn: 'Near Hospital',
    labelId: 'Dekat Rumah Sakit',
    icon: '🏥',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'environment'
  },
  {
    key: 'nearmall',
    labelEn: 'Near Shopping Mall',
    labelId: 'Dekat Mall',
    icon: '🛍️',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'environment'
  },
  {
    key: 'nearpublictransport',
    labelEn: 'Near Public Transport',
    labelId: 'Dekat Transportasi Umum',
    icon: '🚇',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'accessibility'
  },
  {
    key: 'nearairport',
    labelEn: 'Near Airport',
    labelId: 'Dekat Bandara',
    icon: '✈️',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'accessibility'
  },
  {
    key: 'beachaccess',
    labelEn: 'Beach Access',
    labelId: 'Akses Pantai',
    icon: '🏖️',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'environment'
  },
  {
    key: 'citycenter',
    labelEn: 'City Center',
    labelId: 'Pusat Kota',
    icon: '🏙️',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'environment'
  }
];

// Filter configurations for search
export const PROPERTY_FILTERS: PropertyFilterConfig[] = [
  // Property Type
  {
    key: 'property_type',
    labelEn: 'Property Type',
    labelId: 'Tipe Properti',
    type: 'select',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'property',
    options: [
      { value: 'all', labelEn: 'All Types', labelId: 'Semua Tipe' },
      { value: 'house', labelEn: 'House', labelId: 'Rumah' },
      { value: 'apartment', labelEn: 'Apartment', labelId: 'Apartemen' },
      { value: 'villa', labelEn: 'Villa', labelId: 'Villa' },
      { value: 'townhouse', labelEn: 'Townhouse', labelId: 'Rumah Teres' },
      { value: 'condo', labelEn: 'Condo', labelId: 'Kondominium' },
      { value: 'land', labelEn: 'Land', labelId: 'Tanah' },
      { value: 'commercial', labelEn: 'Commercial', labelId: 'Komersial' },
      { value: 'office', labelEn: 'Office', labelId: 'Kantor' },
      { value: 'warehouse', labelEn: 'Warehouse', labelId: 'Gudang' },
      { value: 'retail', labelEn: 'Retail', labelId: 'Ritel' },
      { value: 'hotel', labelEn: 'Hotel', labelId: 'Hotel' },
      { value: 'studio', labelEn: 'Studio', labelId: 'Studio' },
      { value: 'penthouse', labelEn: 'Penthouse', labelId: 'Penthouse' },
      { value: 'duplex', labelEn: 'Duplex', labelId: 'Duplex' },
      { value: 'shophouse', labelEn: 'Shophouse', labelId: 'Ruko' }
    ]
  },
  // Development Status
  {
    key: 'development_status',
    labelEn: 'Development Status',
    labelId: 'Status Pengembangan',
    type: 'select',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'property',
    options: [
      { value: 'all', labelEn: 'All Status', labelId: 'Semua Status' },
      { value: 'ready', labelEn: 'Ready to Move', labelId: 'Siap Huni' },
      { value: 'under_construction', labelEn: 'Under Construction', labelId: 'Dalam Pembangunan' },
      { value: 'completed', labelEn: 'Completed', labelId: 'Selesai' },
      { value: 'new_project', labelEn: 'New Project', labelId: 'Proyek Baru' },
      { value: 'pre_launching', labelEn: 'Pre-Launching', labelId: 'Pra-Peluncuran' }
    ]
  },
  // Furnishing (Rent only)
  {
    key: 'furnishing',
    labelEn: 'Furnishing',
    labelId: 'Perabotan',
    type: 'select',
    applicableFor: ['rent', 'lease'],
    category: 'property',
    options: [
      { value: 'all', labelEn: 'All', labelId: 'Semua' },
      { value: 'unfurnished', labelEn: 'Unfurnished', labelId: 'Tanpa Perabotan' },
      { value: 'semi_furnished', labelEn: 'Semi Furnished', labelId: 'Semi Perabotan' },
      { value: 'fully_furnished', labelEn: 'Fully Furnished', labelId: 'Lengkap Perabotan' }
    ]
  },
  // Certificate Type (Sale only)
  {
    key: 'certificate_type',
    labelEn: 'Certificate Type',
    labelId: 'Tipe Sertifikat',
    type: 'select',
    applicableFor: ['sale'],
    category: 'property',
    options: [
      { value: 'all', labelEn: 'All', labelId: 'Semua' },
      { value: 'shm', labelEn: 'SHM (Hak Milik)', labelId: 'SHM (Hak Milik)' },
      { value: 'hgb', labelEn: 'HGB (Hak Guna Bangunan)', labelId: 'HGB (Hak Guna Bangunan)' },
      { value: 'hp', labelEn: 'HP (Hak Pakai)', labelId: 'HP (Hak Pakai)' },
      { value: 'strata', labelEn: 'Strata Title', labelId: 'Strata Title' },
      { value: 'ppjb', labelEn: 'PPJB', labelId: 'PPJB' }
    ]
  },
  // Building Age (Sale only)
  {
    key: 'building_age',
    labelEn: 'Building Age',
    labelId: 'Usia Bangunan',
    type: 'select',
    applicableFor: ['sale'],
    category: 'property',
    options: [
      { value: 'all', labelEn: 'All', labelId: 'Semua' },
      { value: 'new', labelEn: 'New (0-1 years)', labelId: 'Baru (0-1 tahun)' },
      { value: 'recent', labelEn: 'Recent (1-5 years)', labelId: 'Baru-baru ini (1-5 tahun)' },
      { value: 'moderate', labelEn: 'Moderate (5-10 years)', labelId: 'Sedang (5-10 tahun)' },
      { value: 'older', labelEn: 'Older (10+ years)', labelId: 'Lama (10+ tahun)' }
    ]
  },
  // Rental Period (Rent only)
  {
    key: 'rental_period',
    labelEn: 'Rental Period',
    labelId: 'Periode Sewa',
    type: 'select',
    applicableFor: ['rent'],
    category: 'property',
    options: [
      { value: 'all', labelEn: 'All', labelId: 'Semua' },
      { value: 'daily', labelEn: 'Daily', labelId: 'Harian' },
      { value: 'weekly', labelEn: 'Weekly', labelId: 'Mingguan' },
      { value: 'monthly', labelEn: 'Monthly', labelId: 'Bulanan' },
      { value: 'yearly', labelEn: 'Yearly', labelId: 'Tahunan' }
    ]
  },
  // Bedrooms
  {
    key: 'bedrooms',
    labelEn: 'Bedrooms',
    labelId: 'Kamar Tidur',
    type: 'select',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'specifications',
    options: [
      { value: 'all', labelEn: 'Any', labelId: 'Semua' },
      { value: '1', labelEn: '1+', labelId: '1+' },
      { value: '2', labelEn: '2+', labelId: '2+' },
      { value: '3', labelEn: '3+', labelId: '3+' },
      { value: '4', labelEn: '4+', labelId: '4+' },
      { value: '5', labelEn: '5+', labelId: '5+' }
    ]
  },
  // Bathrooms
  {
    key: 'bathrooms',
    labelEn: 'Bathrooms',
    labelId: 'Kamar Mandi',
    type: 'select',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'specifications',
    options: [
      { value: 'all', labelEn: 'Any', labelId: 'Semua' },
      { value: '1', labelEn: '1+', labelId: '1+' },
      { value: '2', labelEn: '2+', labelId: '2+' },
      { value: '3', labelEn: '3+', labelId: '3+' },
      { value: '4', labelEn: '4+', labelId: '4+' }
    ]
  },
  // Parking
  {
    key: 'parking',
    labelEn: 'Parking Spaces',
    labelId: 'Tempat Parkir',
    type: 'select',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'specifications',
    options: [
      { value: 'all', labelEn: 'Any', labelId: 'Semua' },
      { value: 'none', labelEn: 'No Parking', labelId: 'Tanpa Parkir' },
      { value: '1', labelEn: '1+', labelId: '1+' },
      { value: '2', labelEn: '2+', labelId: '2+' },
      { value: '3', labelEn: '3+', labelId: '3+' }
    ]
  },
  // Floor Level
  {
    key: 'floor_level',
    labelEn: 'Floor Level',
    labelId: 'Tingkat Lantai',
    type: 'select',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'specifications',
    options: [
      { value: 'all', labelEn: 'All Floors', labelId: 'Semua Lantai' },
      { value: 'ground', labelEn: 'Ground Floor', labelId: 'Lantai Dasar' },
      { value: 'low', labelEn: 'Low Floor (1-5)', labelId: 'Lantai Rendah (1-5)' },
      { value: 'mid', labelEn: 'Mid Floor (6-15)', labelId: 'Lantai Tengah (6-15)' },
      { value: 'high', labelEn: 'High Floor (16+)', labelId: 'Lantai Tinggi (16+)' }
    ]
  },
  // Building Orientation
  {
    key: 'building_orientation',
    labelEn: 'Building Orientation',
    labelId: 'Orientasi Bangunan',
    type: 'select',
    applicableFor: ['sale', 'rent', 'lease'],
    category: 'property',
    options: [
      { value: 'all', labelEn: 'All', labelId: 'Semua' },
      { value: 'north', labelEn: 'North', labelId: 'Utara' },
      { value: 'south', labelEn: 'South', labelId: 'Selatan' },
      { value: 'east', labelEn: 'East', labelId: 'Timur' },
      { value: 'west', labelEn: 'West', labelId: 'Barat' },
      { value: 'northeast', labelEn: 'Northeast', labelId: 'Timur Laut' },
      { value: 'northwest', labelEn: 'Northwest', labelId: 'Barat Laut' },
      { value: 'southeast', labelEn: 'Southeast', labelId: 'Tenggara' },
      { value: 'southwest', labelEn: 'Southwest', labelId: 'Barat Daya' }
    ]
  }
];

// Helper function to get features by listing type
export const getFeaturesByListingType = (listingType: 'sale' | 'rent' | 'lease'): PropertyFeature[] => {
  return PROPERTY_FEATURES.filter(feature => 
    feature.applicableFor.includes(listingType)
  );
};

// Helper function to get filters by listing type
export const getFiltersByListingType = (listingType: 'sale' | 'rent' | 'lease'): PropertyFilterConfig[] => {
  return PROPERTY_FILTERS.filter(filter => 
    filter.applicableFor.includes(listingType)
  );
};

// Helper function to get features by category
export const getFeaturesByCategory = (
  listingType: 'sale' | 'rent' | 'lease',
  category: PropertyFeature['category']
): PropertyFeature[] => {
  return getFeaturesByListingType(listingType).filter(
    feature => feature.category === category
  );
};
