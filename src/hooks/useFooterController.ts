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

  // 🔍 Detectar visibilidad del footer
  useEffect(() => {
    const initFooterObserver = () => {
      footerRef.current = document.getElementById("footer-reveal");

      if (!footerRef.current) {
        // Footer no está disponible aún, reintentar
        setTimeout(initFooterObserver, 1000);
        return;
      }

      // Crear observer para detectar cuando el footer entra en viewport
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const footerEntry = entries[0];
          const isVisible = footerEntry.isIntersecting;

          setFooterState((prev) => ({
            ...prev,
            isVisible,
            isActive: isVisible,
          }));

          // 🎯 LOG UNIFICADO - Solo uno para todo el footer
          if (isVisible) {
            console.log(
              "🦶 Footer activado - Todos los componentes operativos"
            );
            // Activar componentes individuales
            activateFooterComponents();
          } else {
            console.log(
              "🦶 Footer desactivado - Todos los componentes en standby"
            );
            // Desactivar componentes individuales
            deactivateFooterComponents();
          }
        },
        {
          threshold: 0.1, // Footer debe ser al menos 10% visible
          rootMargin: "50px", // Margen adicional para activación temprana
        }
      );

      observerRef.current.observe(footerRef.current);
    };

    initFooterObserver();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 🔧 Activar componentes del footer (coordinación con lógica existente)
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

    // 🎯 Coordinación con sistemas existentes sin modificarlos
    coordinateWithExistingSystems("activate");
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

    coordinateWithExistingSystems("deactivate");
  };

  // 🤝 Coordinación con sistemas existentes (sin modificar su código)
  const coordinateWithExistingSystems = (action: "activate" | "deactivate") => {
    // Coordinación con el newsletter (JavaScript existente en index.html)
    const newsletterInput = document.getElementById("boletinEmailInput");
    const newsletterButton = document.getElementById("boletinSubmitButton");

    if (newsletterInput && newsletterButton) {
      if (action === "activate") {
        // Elementos ya gestionados por su script, solo marcamos como coordinados
        newsletterInput.setAttribute("data-footer-coordinated", "true");
        newsletterButton.setAttribute("data-footer-coordinated", "true");
      } else {
        // En desactivación, simplemente removemos marca de coordinación
        newsletterInput.removeAttribute("data-footer-coordinated");
        newsletterButton.removeAttribute("data-footer-coordinated");
      }
    }

    // Coordinación con el botón AI Matrix (mantener lógica existente)
    const aiMatrixButton = document.querySelector(".ai-matrix-button");
    if (aiMatrixButton) {
      if (action === "activate") {
        aiMatrixButton.setAttribute("data-footer-coordinated", "true");
      } else {
        aiMatrixButton.removeAttribute("data-footer-coordinated");
      }
    }

    // Coordinación con Robot3D (mantener componente React existente)
    const robotContainer = document.querySelector(".robot-3d-container");
    if (robotContainer) {
      if (action === "activate") {
        robotContainer.setAttribute("data-footer-coordinated", "true");
      } else {
        robotContainer.removeAttribute("data-footer-coordinated");
      }
    }
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
