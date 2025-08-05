// utils/responsive.ts
// 🎯 SISTEMA RESPONSIVE AVANZADO - CONFIGURACIÓN CENTRALIZADA

/**
 * 📐 BREAKPOINTS ESTÁNDAR OPTIMIZADOS
 * Basados en estadísticas de dispositivos reales y mejores prácticas de UX
 */
export const BREAKPOINTS = {
  // 📱 Móviles (hasta 480px)
  mobile: {
    max: 480,
    min: 320,
    name: 'mobile',
    description: 'Smartphones en orientación vertical'
  },
  
  // 📱 Móviles grandes (481px - 768px)
  mobileLarge: {
    max: 768,
    min: 481,
    name: 'mobile-large',
    description: 'Smartphones grandes, phablets'
  },
  
  // 📟 Tablets (769px - 1024px)
  tablet: {
    max: 1024,
    min: 769,
    name: 'tablet',
    description: 'Tablets, iPad'
  },
  
  // 💻 Desktop pequeño (1025px - 1440px)
  desktop: {
    max: 1440,
    min: 1025,
    name: 'desktop',
    description: 'Laptops, monitores estándar'
  },
  
  // 🖥️ Desktop grande (1441px - 1920px)
  desktopLarge: {
    max: 1920,
    min: 1441,
    name: 'desktop-large',
    description: 'Monitores Full HD'
  },
  
  // 🚀 Ultra Wide (más de 1920px)
  ultraWide: {
    max: Infinity,
    min: 1921,
    name: 'ultra-wide',
    description: 'Monitores 4K, ultra wide'
  }
} as const;

/**
 * 📏 MEDIA QUERIES HELPERS
 * Funciones para generar media queries de forma consistente
 */
export const mediaQueries = {
  // Móvil únicamente
  mobile: `@media (max-width: ${BREAKPOINTS.mobile.max}px)`,
  
  // Móvil grande únicamente
  mobileLarge: `@media (min-width: ${BREAKPOINTS.mobileLarge.min}px) and (max-width: ${BREAKPOINTS.mobileLarge.max}px)`,
  
  // Cualquier móvil (mobile + mobile-large)
  mobileAll: `@media (max-width: ${BREAKPOINTS.mobileLarge.max}px)`,
  
  // Tablet únicamente
  tablet: `@media (min-width: ${BREAKPOINTS.tablet.min}px) and (max-width: ${BREAKPOINTS.tablet.max}px)`,
  
  // Desktop pequeño únicamente
  desktop: `@media (min-width: ${BREAKPOINTS.desktop.min}px) and (max-width: ${BREAKPOINTS.desktop.max}px)`,
  
  // Desktop grande únicamente
  desktopLarge: `@media (min-width: ${BREAKPOINTS.desktopLarge.min}px) and (max-width: ${BREAKPOINTS.desktopLarge.max}px)`,
  
  // Ultra wide únicamente
  ultraWide: `@media (min-width: ${BREAKPOINTS.ultraWide.min}px)`,
  
  // Desde tablet hacia arriba
  tabletUp: `@media (min-width: ${BREAKPOINTS.tablet.min}px)`,
  
  // Desde desktop hacia arriba
  desktopUp: `@media (min-width: ${BREAKPOINTS.desktop.min}px)`,
  
  // Orientación específica
  landscape: '@media (orientation: landscape)',
  portrait: '@media (orientation: portrait)',
  
  // Touch devices
  touch: '@media (hover: none) and (pointer: coarse)',
  
  // Mouse/trackpad devices
  hover: '@media (hover: hover) and (pointer: fine)',
  
  // Preferencia de animaciones reducidas
  reduceMotion: '@media (prefers-reduced-motion: reduce)',
  
  // Alto contraste
  highContrast: '@media (prefers-contrast: high)',
  
  // Modo oscuro preferido
  darkMode: '@media (prefers-color-scheme: dark)',
  
  // Modo claro preferido
  lightMode: '@media (prefers-color-scheme: light)'
} as const;

/**
 * 🎯 RESPONSIVE TYPOGRAPHY SCALE
 * Escalas de tipografía responsiva optimizadas
 */
export const responsiveTypography = {
  // 📱 MOBILE
  mobile: {
    h1: {
      fontSize: '2rem',
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '1.5rem',
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.25rem',
      lineHeight: '1.4',
      fontWeight: '600'
    },
    body: {
      fontSize: '0.9rem',
      lineHeight: '1.6'
    },
    small: {
      fontSize: '0.8rem',
      lineHeight: '1.5'
    }
  },
  
  // 📟 TABLET
  tablet: {
    h1: {
      fontSize: '2.5rem',
      lineHeight: '1.2',
      fontWeight: '700',
      letterSpacing: '-0.02em'
    },
    h2: {
      fontSize: '2rem',
      lineHeight: '1.3',
      fontWeight: '600',
      letterSpacing: '-0.01em'
    },
    h3: {
      fontSize: '1.5rem',
      lineHeight: '1.4',
      fontWeight: '600'
    },
    body: {
      fontSize: '1rem',
      lineHeight: '1.6'
    },
    small: {
      fontSize: '0.875rem',
      lineHeight: '1.5'
    }
  },
  
  // 💻 DESKTOP
  desktop: {
    h1: {
      fontSize: '3rem',
      lineHeight: '1.1',
      fontWeight: '700',
      letterSpacing: '-0.03em'
    },
    h2: {
      fontSize: '2.25rem',
      lineHeight: '1.2',
      fontWeight: '600',
      letterSpacing: '-0.02em'
    },
    h3: {
      fontSize: '1.75rem',
      lineHeight: '1.3',
      fontWeight: '600'
    },
    body: {
      fontSize: '1.125rem',
      lineHeight: '1.7'
    },
    small: {
      fontSize: '1rem',
      lineHeight: '1.6'
    }
  },
  
  // 🖥️ DESKTOP LARGE
  desktopLarge: {
    h1: {
      fontSize: '3.5rem',
      lineHeight: '1.1',
      fontWeight: '700',
      letterSpacing: '-0.03em'
    },
    h2: {
      fontSize: '2.75rem',
      lineHeight: '1.2',
      fontWeight: '600',
      letterSpacing: '-0.02em'
    },
    h3: {
      fontSize: '2rem',
      lineHeight: '1.3',
      fontWeight: '600'
    },
    body: {
      fontSize: '1.25rem',
      lineHeight: '1.7'
    },
    small: {
      fontSize: '1.125rem',
      lineHeight: '1.6'
    }
  }
} as const;

/**
 * 📐 SPACING SCALE RESPONSIVO
 * Sistema de espaciado que se adapta al dispositivo
 */
export const responsiveSpacing = {
  mobile: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    xxl: '3rem'     // 48px
  },
  tablet: {
    xs: '0.375rem', // 6px
    sm: '0.75rem',  // 12px
    md: '1.25rem',  // 20px
    lg: '2rem',     // 32px
    xl: '2.75rem',  // 44px
    xxl: '4rem'     // 64px
  },
  desktop: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2.5rem',   // 40px
    xl: '3.5rem',   // 56px
    xxl: '5rem'     // 80px
  }
} as const;

/**
 * 🎨 RESPONSIVE LAYOUT UTILITIES
 * Utilidades para layouts responsivos
 */
export const responsiveLayout = {
  // Contenedores con max-width responsivo
  container: {
    mobile: '100%',
    tablet: '90%',
    desktop: '1200px',
    desktopLarge: '1400px',
    ultraWide: '1600px'
  },
  
  // Grid columns responsivas
  gridColumns: {
    mobile: 1,
    mobileLarge: 2,
    tablet: 3,
    desktop: 4,
    desktopLarge: 5,
    ultraWide: 6
  },
  
  // Padding lateral responsivo
  paddingX: {
    mobile: '1rem',
    tablet: '2rem',
    desktop: '3rem',
    desktopLarge: '4rem'
  }
} as const;

/**
 * 🔧 UTILITY FUNCTIONS
 * Funciones helper para trabajar con responsive
 */
export const responsiveUtils = {
  /**
   * Detecta el breakpoint actual basado en window.innerWidth
   */
  getCurrentBreakpoint: (): keyof typeof BREAKPOINTS => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    
    if (width <= BREAKPOINTS.mobile.max) return 'mobile';
    if (width <= BREAKPOINTS.mobileLarge.max) return 'mobileLarge';
    if (width <= BREAKPOINTS.tablet.max) return 'tablet';
    if (width <= BREAKPOINTS.desktop.max) return 'desktop';
    if (width <= BREAKPOINTS.desktopLarge.max) return 'desktopLarge';
    return 'ultraWide';
  },
  
  /**
   * Verifica si estamos en un dispositivo móvil
   */
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= BREAKPOINTS.mobileLarge.max;
  },
  
  /**
   * Verifica si estamos en un dispositivo touch
   */
  isTouch: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  /**
   * Verifica si el usuario prefiere animaciones reducidas
   */
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  /**
   * Genera media query para un breakpoint específico
   */
  generateMediaQuery: (breakpoint: keyof typeof BREAKPOINTS, type: 'min' | 'max' = 'max'): string => {
    const bp = BREAKPOINTS[breakpoint];
    return `@media (${type}-width: ${type === 'max' ? bp.max : bp.min}px)`;
  }
} as const;

/**
 * 🎯 PERFORMANCE CONFIGURATIONS POR DEVICE
 * Configuraciones de rendimiento adaptadas a cada tipo de dispositivo
 */
export const devicePerformanceConfig = {
  mobile: {
    webgl: {
      antialias: false,
      precision: 'lowp',
      powerPreference: 'low-power',
      pixelRatio: Math.min(1.5, window.devicePixelRatio || 1)
    },
    animations: {
      duration: 0.3,
      easing: 'ease-out',
      fps: 30
    },
    quality: 'low'
  },
  
  tablet: {
    webgl: {
      antialias: false,
      precision: 'mediump',
      powerPreference: 'default',
      pixelRatio: Math.min(2, window.devicePixelRatio || 1)
    },
    animations: {
      duration: 0.4,
      easing: 'ease-out',
      fps: 45
    },
    quality: 'medium'
  },
  
  desktop: {
    webgl: {
      antialias: true,
      precision: 'mediump',
      powerPreference: 'high-performance',
      pixelRatio: Math.min(2, window.devicePixelRatio || 1)
    },
    animations: {
      duration: 0.5,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fps: 60
    },
    quality: 'high'
  }
} as const;

export default {
  BREAKPOINTS,
  mediaQueries,
  responsiveTypography,
  responsiveSpacing,
  responsiveLayout,
  responsiveUtils,
  devicePerformanceConfig
};
