import { useMemo } from 'react';
import { useUserMembership } from '@/hooks/useUserMembership';
import { useUserRoles, UserRole } from '@/hooks/useUserRoles';
import { hasMinimumLevel } from '@/hooks/useVIPFeatureGate';
import { MembershipLevel } from '@/types/membership';

export interface PropertyFormFeature {
  id: string;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  requiredLevel: MembershipLevel;
  requiredRoles?: UserRole[];
  icon: string;
}

// Define all property form features with their tier requirements
export const PROPERTY_FORM_FEATURES: PropertyFormFeature[] = [
  {
    id: 'basic_info',
    name: 'Basic Property Info',
    nameId: 'Info Properti Dasar',
    description: 'Title, description, price, and basic details',
    descriptionId: 'Judul, deskripsi, harga, dan detail dasar',
    requiredLevel: 'basic',
    icon: '📝'
  },
  {
    id: 'location',
    name: 'Location Selection',
    nameId: 'Pilih Lokasi',
    description: 'Province, city, district, and address',
    descriptionId: 'Provinsi, kota, kecamatan, dan alamat',
    requiredLevel: 'basic',
    icon: '📍'
  },
  {
    id: 'images_basic',
    name: 'Basic Images (up to 5)',
    nameId: 'Gambar Dasar (maks 5)',
    description: 'Upload up to 5 property images',
    descriptionId: 'Unggah hingga 5 gambar properti',
    requiredLevel: 'basic',
    icon: '📷'
  },
  {
    id: 'features',
    name: 'Property Features',
    nameId: 'Fitur Properti',
    description: 'Parking, pool, garden, and amenities',
    descriptionId: 'Parkir, kolam, taman, dan fasilitas',
    requiredLevel: 'basic',
    icon: '✨'
  },
  {
    id: 'images_extended',
    name: 'Extended Images (up to 10)',
    nameId: 'Gambar Extended (maks 10)',
    description: 'Upload up to 10 high-quality images',
    descriptionId: 'Unggah hingga 10 gambar berkualitas tinggi',
    requiredLevel: 'verified',
    icon: '🖼️'
  },
  {
    id: 'seo_optimization',
    name: 'SEO Optimization',
    nameId: 'Optimisasi SEO',
    description: 'Custom SEO title and meta description',
    descriptionId: 'Judul SEO dan deskripsi meta kustom',
    requiredLevel: 'verified',
    icon: '🔍'
  },
  {
    id: 'priority_listing',
    name: 'Priority Listing',
    nameId: 'Listing Prioritas',
    description: 'Your listing appears higher in search',
    descriptionId: 'Listing Anda tampil lebih tinggi di pencarian',
    requiredLevel: 'vip',
    icon: '⭐'
  },
  {
    id: 'virtual_tour',
    name: 'Virtual Tour (360°)',
    nameId: 'Virtual Tour (360°)',
    description: 'Add Matterport or Kuula virtual tours',
    descriptionId: 'Tambahkan virtual tour Matterport atau Kuula',
    requiredLevel: 'gold',
    icon: '🎥'
  },
  {
    id: '3d_model',
    name: '3D Model Integration',
    nameId: 'Integrasi Model 3D',
    description: 'Add Sketchfab 3D models',
    descriptionId: 'Tambahkan model 3D Sketchfab',
    requiredLevel: 'gold',
    icon: '🏠'
  },
  {
    id: 'featured_badge',
    name: 'Featured Badge',
    nameId: 'Badge Featured',
    description: 'Show "Featured" badge on your listing',
    descriptionId: 'Tampilkan badge "Featured" di listing',
    requiredLevel: 'platinum',
    icon: '🏆'
  },
  {
    id: 'ai_description',
    name: 'AI-Generated Description',
    nameId: 'Deskripsi AI',
    description: 'Generate professional description with AI',
    descriptionId: 'Buat deskripsi profesional dengan AI',
    requiredLevel: 'platinum',
    icon: '🤖'
  },
  {
    id: 'unlimited_images',
    name: 'Unlimited Images',
    nameId: 'Gambar Unlimited',
    description: 'Upload unlimited property images',
    descriptionId: 'Unggah gambar properti tanpa batas',
    requiredLevel: 'diamond',
    icon: '📸'
  },
  {
    id: 'concierge_review',
    name: 'Concierge Review',
    nameId: 'Review Concierge',
    description: 'Personal concierge reviews your listing',
    descriptionId: 'Concierge pribadi mereview listing Anda',
    requiredLevel: 'diamond',
    icon: '👔'
  }
];

export interface PropertyFormTierResult {
  // User's current level
  membershipLevel: MembershipLevel;
  userRoles: UserRole[];
  isLoading: boolean;
  
  // Feature access checks
  canAccessFeature: (featureId: string) => boolean;
  getFeatureStatus: (featureId: string) => {
    accessible: boolean;
    requiredLevel: MembershipLevel;
    feature: PropertyFormFeature | undefined;
  };
  
  // Aggregated access
  accessibleFeatures: PropertyFormFeature[];
  lockedFeatures: PropertyFormFeature[];
  
  // Specific feature flags for form
  maxImages: number;
  canUseVirtualTour: boolean;
  canUse3DModel: boolean;
  canUseSEO: boolean;
  canUseAIDescription: boolean;
  canBeFeatured: boolean;
  hasPriorityListing: boolean;
  hasConciergeReview: boolean;
  
  // Form step access
  availableSteps: string[];
  isStepLocked: (stepId: string) => boolean;
}

export function usePropertyFormTiers(): PropertyFormTierResult {
  const { membershipLevel, isLoading: membershipLoading } = useUserMembership();
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles();
  
  const isLoading = membershipLoading || rolesLoading;
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  
  const canAccessFeature = useMemo(() => (featureId: string): boolean => {
    // Admins can access everything
    if (isAdmin) return true;
    
    const feature = PROPERTY_FORM_FEATURES.find(f => f.id === featureId);
    if (!feature) return false;
    
    // Check role requirements
    if (feature.requiredRoles && feature.requiredRoles.length > 0) {
      const hasRequiredRole = feature.requiredRoles.some(r => roles.includes(r));
      if (!hasRequiredRole) return false;
    }
    
    // Check membership level
    return hasMinimumLevel(membershipLevel, feature.requiredLevel);
  }, [membershipLevel, roles, isAdmin]);
  
  const getFeatureStatus = useMemo(() => (featureId: string) => {
    const feature = PROPERTY_FORM_FEATURES.find(f => f.id === featureId);
    return {
      accessible: canAccessFeature(featureId),
      requiredLevel: feature?.requiredLevel || 'basic',
      feature
    };
  }, [canAccessFeature]);
  
  const { accessibleFeatures, lockedFeatures } = useMemo(() => {
    const accessible: PropertyFormFeature[] = [];
    const locked: PropertyFormFeature[] = [];
    
    PROPERTY_FORM_FEATURES.forEach(feature => {
      if (canAccessFeature(feature.id)) {
        accessible.push(feature);
      } else {
        locked.push(feature);
      }
    });
    
    return { accessibleFeatures: accessible, lockedFeatures: locked };
  }, [canAccessFeature]);
  
  // Calculate max images based on tier
  const maxImages = useMemo(() => {
    if (isAdmin) return 50;
    if (canAccessFeature('unlimited_images')) return 50;
    if (canAccessFeature('images_extended')) return 10;
    return 5;
  }, [isAdmin, canAccessFeature]);
  
  // Specific feature flags
  const canUseVirtualTour = canAccessFeature('virtual_tour');
  const canUse3DModel = canAccessFeature('3d_model');
  const canUseSEO = canAccessFeature('seo_optimization');
  const canUseAIDescription = canAccessFeature('ai_description');
  const canBeFeatured = canAccessFeature('featured_badge');
  const hasPriorityListing = canAccessFeature('priority_listing');
  const hasConciergeReview = canAccessFeature('concierge_review');
  
  // Define which form steps are available based on tier
  const availableSteps = useMemo(() => {
    const steps = ['basic', 'details', 'location', 'features', 'images', 'review'];
    
    // 3D Tour step is only for Gold+ or admins
    if (canUseVirtualTour || canUse3DModel) {
      steps.splice(5, 0, '3d-tour'); // Insert before review
    }
    
    return steps;
  }, [canUseVirtualTour, canUse3DModel]);
  
  const isStepLocked = useMemo(() => (stepId: string): boolean => {
    if (isAdmin) return false;
    
    if (stepId === '3d-tour') {
      return !canUseVirtualTour && !canUse3DModel;
    }
    
    return false;
  }, [isAdmin, canUseVirtualTour, canUse3DModel]);
  
  return {
    membershipLevel,
    userRoles: roles,
    isLoading,
    canAccessFeature,
    getFeatureStatus,
    accessibleFeatures,
    lockedFeatures,
    maxImages,
    canUseVirtualTour,
    canUse3DModel,
    canUseSEO,
    canUseAIDescription,
    canBeFeatured,
    hasPriorityListing,
    hasConciergeReview,
    availableSteps,
    isStepLocked
  };
}

export default usePropertyFormTiers;
