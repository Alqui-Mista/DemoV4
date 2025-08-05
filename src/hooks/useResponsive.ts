// hooks/useResponsive.ts
// 🎯 HOOK RESPONSIVE AVANZADO - DETECCIÓN DINÁMICA DE BREAKPOINTS

import { useState, useEffect } from 'react';
import { responsiveUtils, BREAKPOINTS, devicePerformanceConfig } from '../utils/responsive';

export type BreakpointKey = keyof typeof BREAKPOINTS;
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  // 📏 Información del breakpoint actual
  currentBreakpoint: BreakpointKey;
  deviceType: DeviceType;
  
  // 📐 Dimensiones de la ventana
  windowWidth: number;
  windowHeight: number;
  
  // 🎯 Flags de dispositivo
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouch: boolean;
  
  // 🎨 Configuraciones de rendimiento
  performanceConfig: typeof devicePerformanceConfig[DeviceType];
  
  // 📱 Orientación
  isLandscape: boolean;
  isPortrait: boolean;
  
  // ⚡ Preferencias del usuario
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  prefersDarkMode: boolean;
}

/**
 * 🎯 Hook para manejo responsive completo
 * Proporciona información detallada del dispositivo y breakpoints
 */
export const useResponsive = (): ResponsiveState => {
  const [responsiveState, setResponsiveState] = useState<ResponsiveState>(() => {
    // Estado inicial (SSR safe)
    const initialBreakpoint: BreakpointKey = 'desktop';
    const initialDeviceType: DeviceType = 'desktop';
    
    return {
      currentBreakpoint: initialBreakpoint,
      deviceType: initialDeviceType,
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
      windowHeight: typeof window !== 'undefined' ? window.innerHeight : 800,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isTouch: false,
      performanceConfig: devicePerformanceConfig.desktop,
      isLandscape: false,
      isPortrait: true,
      prefersReducedMotion: false,
      prefersHighContrast: false,
      prefersDarkMode: false,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /**
     * 🔄 Actualizar estado responsive
     */
    const updateResponsiveState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const currentBreakpoint = responsiveUtils.getCurrentBreakpoint();
      
      // 📱 Determinar tipo de dispositivo
      let deviceType: DeviceType;
      if (width <= BREAKPOINTS.mobileLarge.max) {
        deviceType = 'mobile';
      } else if (width <= BREAKPOINTS.tablet.max) {
        deviceType = 'tablet';
      } else {
        deviceType = 'desktop';
      }
      
      // 🎯 Flags de dispositivo
      const isMobile = deviceType === 'mobile';
      const isTablet = deviceType === 'tablet';
      const isDesktop = deviceType === 'desktop';
      const isTouch = responsiveUtils.isTouch();
      
      // 📱 Orientación
      const isLandscape = width > height;
      const isPortrait = height >= width;
      
      // ⚡ Preferencias del usuario
      const prefersReducedMotion = responsiveUtils.prefersReducedMotion();
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // 🎨 Configuración de rendimiento
      const performanceConfig = devicePerformanceConfig[deviceType];
      
      setResponsiveState({
        currentBreakpoint,
        deviceType,
        windowWidth: width,
        windowHeight: height,
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        performanceConfig,
        isLandscape,
        isPortrait,
        prefersReducedMotion,
        prefersHighContrast,
        prefersDarkMode,
      });
    };

    // 🔄 Configurar listeners
    const handleResize = () => {
      updateResponsiveState();
    };

    const handleOrientationChange = () => {
      // Delay para permitir que la orientación se complete
      setTimeout(updateResponsiveState, 100);
    };

    // 📱 Listener para cambios de media queries
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMediaQueryChange = () => {
      updateResponsiveState();
    };

    // 📊 Estado inicial
    updateResponsiveState();

    // 🎧 Agregar listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    motionMediaQuery.addEventListener('change', handleMediaQueryChange);
    contrastMediaQuery.addEventListener('change', handleMediaQueryChange);
    colorSchemeMediaQuery.addEventListener('change', handleMediaQueryChange);

    // 🧹 Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      motionMediaQuery.removeEventListener('change', handleMediaQueryChange);
      contrastMediaQuery.removeEventListener('change', handleMediaQueryChange);
      colorSchemeMediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  return responsiveState;
};

/**
 * 🎯 Hook simplificado para detección de móvil
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

/**
 * 🎯 Hook para breakpoint específico
 */
export const useBreakpoint = (breakpoint: BreakpointKey): boolean => {
  const { currentBreakpoint } = useResponsive();
  return currentBreakpoint === breakpoint;
};

/**
 * 🎯 Hook para múltiples breakpoints
 */
export const useBreakpoints = (breakpoints: BreakpointKey[]): boolean => {
  const { currentBreakpoint } = useResponsive();
  return breakpoints.includes(currentBreakpoint);
};

/**
 * 🎯 Hook para detección de orientación
 */
export const useOrientation = (): { isLandscape: boolean; isPortrait: boolean } => {
  const { isLandscape, isPortrait } = useResponsive();
  return { isLandscape, isPortrait };
};

/**
 * 🎯 Hook para configuración de rendimiento adaptiva
 */
export const usePerformanceConfig = () => {
  const { performanceConfig, deviceType } = useResponsive();
  return { performanceConfig, deviceType };
};

/**
 * 🎯 Hook para preferencias de accesibilidad
 */
export const useAccessibilityPreferences = () => {
  const { prefersReducedMotion, prefersHighContrast, prefersDarkMode } = useResponsive();
  return { prefersReducedMotion, prefersHighContrast, prefersDarkMode };
};

export default useResponsive;
