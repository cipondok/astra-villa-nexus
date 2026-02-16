import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSliderConfig {
  backgroundImage: string;
  imageBrightness: number;
  imageSaturation: number;
  imageBlur: number;
  enableEntryAnimation: boolean;
  entryAnimationType: 'fade' | 'slide-up' | 'zoom' | 'parallax';
  entryAnimationDuration: number;
  enableParallax: boolean;
  parallaxIntensity: number;
  enable3DEffect: boolean;
  enable3DTilt: boolean;
  tiltIntensity: number;
  enableDepthLayers: boolean;
  depthLayerCount: number;
  enableParticles: boolean;
  particleCount: number;
  particleColor: string;
  enableGradientOverlay: boolean;
  gradientOpacity: number;
  enablePrimaryTint: boolean;
  primaryTintOpacity: number;
  enableFloatingElements: boolean;
  floatingElementSpeed: number;
  enableGlowEffect: boolean;
  glowIntensity: number;
}

const defaultConfig: HeroSliderConfig = {
  backgroundImage: '',
  imageBrightness: 110,
  imageSaturation: 110,
  imageBlur: 0,
  enableEntryAnimation: true,
  entryAnimationType: 'fade',
  entryAnimationDuration: 800,
  enableParallax: false,
  parallaxIntensity: 30,
  enable3DEffect: false,
  enable3DTilt: false,
  tiltIntensity: 15,
  enableDepthLayers: false,
  depthLayerCount: 3,
  enableParticles: false,
  particleCount: 30,
  particleColor: 'primary',
  enableGradientOverlay: true,
  gradientOpacity: 40,
  enablePrimaryTint: true,
  primaryTintOpacity: 5,
  enableFloatingElements: false,
  floatingElementSpeed: 3,
  enableGlowEffect: false,
  glowIntensity: 20,
};

export const useHeroSliderConfig = () => {
  return useQuery({
    queryKey: ['hero-slider-config'],
    queryFn: async (): Promise<HeroSliderConfig> => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'hero_slider_config')
        .maybeSingle();

      if (error) throw error;
      if (data?.value) {
        return { ...defaultConfig, ...JSON.parse(String(data.value)) };
      }
      return defaultConfig;
    },
    staleTime: 30_000, // refresh every 30s
  });
};
