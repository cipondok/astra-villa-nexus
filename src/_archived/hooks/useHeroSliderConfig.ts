import { useMemo } from 'react';
import { useAllSystemSettings, selectSettingByKey } from './useAllSystemSettings';

export interface HeroSliderConfig {
  bannerImages: string[];
  sliderHeight: number;
  sliderMinHeight: number;
  sliderMaxHeight: number;
  autoSlideInterval: number;
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
  bannerImages: [],
  sliderHeight: 550,
  sliderMinHeight: 400,
  sliderMaxHeight: 650,
  autoSlideInterval: 5,
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
  const { data: allSettings, isLoading, error } = useAllSystemSettings();

  const data = useMemo(() => {
    const raw = selectSettingByKey(allSettings, 'hero_slider_config');
    if (raw) {
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return { ...defaultConfig, ...parsed };
      } catch {
        return defaultConfig;
      }
    }
    return defaultConfig;
  }, [allSettings]);

  return { data, isLoading, error };
};
