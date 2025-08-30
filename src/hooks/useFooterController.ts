// src/hooks/useFooterController.ts
// 🦶 CONTROLADOR UNIFICADO DEL FOOTER - Mantiene lógica actual intacta

import { useState, useEffect, useRef } from "react";

interface FooterComponentsStatus {
  newsletter: boolean;
  robot3D: boolean;
  aiMatrix: boolean;
  credits: boolean;
  contactInfo: boolean;
}

interface FooterState {
  isActive: boolean;
  isVisible: boolean;
  isHovered: boolean;
  componentsStatus: FooterComponentsStatus;
}

export const useFooterController = () => {
  // 🎯 Estado unificado del footer
  const [footerState, setFooterState] = useState<FooterState>({
    isActive: false,
    isVisible: false,
    isHovered: false,
    componentsStatus: {
      newsletter: false,
      robot3D: false,
      aiMatrix: false,
      credits: false,
      contactInfo: false,
    },
  });

  // Referencias para observar elementos
  const footerRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 🔧 ANTI-FLICKERING: Debouncing y hysteresis
  const debounceTimeoutRef = useRef<number | null>(null);
  const lastStateRef = useRef<boolean>(false);
  const stateChangesRef = useRef<number>(0);

  // 🔍 Detectar visibilidad del footer
  useEffect(() => {
    const initFooterObserver = () => {
      footerRef.current = document.getElementById("footer-reveal");

      if (!footerRef.current) {
        // Footer no está disponible aún, reintentar
        setTimeout(initFooterObserver, 1000);
        return;
      }

      // 🛡️ Función de debouncing para evitar activaciones infinitas
      const debouncedFooterToggle = (isVisible: boolean) => {
        // Limpiar timeout anterior si existe
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Evitar cambios rápidos múltiples (hysteresis)
        if (lastStateRef.current === isVisible) {
          return; // No cambiar si ya está en el mismo estado
        }

        // Contar cambios para detectar flickering
        stateChangesRef.current += 1;

        // Si hay muchos cambios en poco tiempo, usar delay más largo
        const delay = stateChangesRef.current > 3 ? 300 : 150;

        debounceTimeoutRef.current = setTimeout(() => {
          lastStateRef.current = isVisible;
          stateChangesRef.current = 0; // Reset contador

          setFooterState((prev) => ({
            ...prev,
            isVisible,
            isActive: isVisible,
          }));

          // Log unificado
          if (isVisible) {
            console.log("🦶 Footer activado - Componentes operativos");
            activateFooterComponents();
          } else {
            console.log("🦶 Footer desactivado - Componentes en standby");
            deactivateFooterComponents();
          }
        }, delay);
      };

      // Crear observer para detectar cuando el footer entra en viewport
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const footerEntry = entries[0];
          const ratio = footerEntry.intersectionRatio;

          // 🔧 ANTI-LOOP: Prevenir cambios rápidos
          const now = Date.now();
          if (now - (debounceTimeoutRef.current || 0) < 100) {
            console.log(`⏰ Ignorando cambio muy rápido`);
            return;
          }

          console.log(
            `🔍 Footer Observer: ratio=${ratio.toFixed(3)}, lastState=${
              lastStateRef.current
            }`
          );

          // 🔧 LÓGICA ESTRICTA: Evitar loops
          const shouldActivate = ratio >= 0.6; // Más visible
          const shouldDeactivate = ratio <= 0.3; // Menos visible

          if (shouldActivate && !lastStateRef.current) {
            console.log("✅ ACTIVANDO footer (ratio >= 0.6)");
            lastStateRef.current = true;
            debouncedFooterToggle(true);
          } else if (shouldDeactivate && lastStateRef.current) {
            console.log("❌ DESACTIVANDO footer (ratio <= 0.3)");
            lastStateRef.current = false;
            debouncedFooterToggle(false);
          }
        },
        {
          threshold: [0, 0.3, 0.6, 1], // 🔧 UMBRALES ESPECÍFICOS
          rootMargin: "0px",
        }
      );

      observerRef.current.observe(footerRef.current);
    };

    initFooterObserver();

    return () => {
      // Limpiar observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // 🧹 Limpiar timeout pendiente para evitar memory leaks
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // 🔧 Activar componentes del footer
  const activateFooterComponents = () => {
    setFooterState((prev) => ({
      ...prev,
      componentsStatus: {
        newsletter: true,
        robot3D: true,
        aiMatrix: true,
        credits: true,
        contactInfo: true,
      },
    }));
    // ✅ Sin manipulaciones del DOM - Solo estado de React
  };

  // 🔧 Desactivar componentes del footer
  const deactivateFooterComponents = () => {
    setFooterState((prev) => ({
      ...prev,
      componentsStatus: {
        newsletter: false,
        robot3D: false,
        aiMatrix: false,
        credits: false,
        contactInfo: false,
      },
    }));
    // ✅ Sin manipulaciones del DOM - Solo estado de React
  };

  // 🎯 Detectar hover del footer
  const handleFooterHover = (isHovering: boolean) => {
    setFooterState((prev) => ({
      ...prev,
      isHovered: isHovering,
    }));
  };

  // 🎭 Función para actualizar estado de componente específico
  const updateComponentStatus = (
    component: keyof FooterComponentsStatus,
    status: boolean
  ) => {
    setFooterState((prev) => ({
      ...prev,
      componentsStatus: {
        ...prev.componentsStatus,
        [component]: status,
      },
    }));
  };

  return {
    footerState,
    handleFooterHover,
    updateComponentStatus,
    activateFooterComponents,
    deactivateFooterComponents,
  };
};
