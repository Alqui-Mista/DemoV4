import { useEffect, useRef } from "react";

interface FaviconAnimationConfig {
  faviconSize?: number;
  rotationAnimationDuration?: number;
}

// 🎯 SINGLETON: Asegurar una sola instancia de animación
let globalAnimationId: number | null = null;
let globalIsActive = false;

export const useFaviconAnimation = (config: FaviconAnimationConfig = {}) => {
  const { faviconSize = 32, rotationAnimationDuration = 3000 } = config;
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // 🎯 PREVENIR MÚLTIPLES INSTANCIAS
    if (globalIsActive) {
      console.log(
        "🎯 Favicon animation ya está activa, omitiendo nueva instancia"
      );
      return;
    }

    globalIsActive = true;
    isActiveRef.current = true;

    // 🎯 CREAR ELEMENTOS CANVAS Y IMAGEN
    const faviconCanvas = document.createElement("canvas");
    faviconCanvas.width = faviconSize;
    faviconCanvas.height = faviconSize;
    const ctx = faviconCanvas.getContext("2d");

    if (!ctx) {
      console.error("🎯 No se pudo crear contexto canvas para favicon");
      globalIsActive = false;
      return;
    }

    const faviconImg = new Image();
    faviconImg.src = "/src/assets/favicon_intelimark.png";

    // 🎯 OBTENER O CREAR FAVICON LINK
    let favicon = document.querySelector(
      "link[rel~='icon']"
    ) as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    // 🎯 VARIABLES DE CONTROL DE RENDIMIENTO
    let lastRenderTime = 0;
    const TARGET_FPS = 15; // 🔧 REDUCIDO: 15fps para mejor performance
    const frameInterval = 1000 / TARGET_FPS; // ~66ms entre frames
    let startTime: number | null = null;
    let isImageLoaded = false;
    let lastDataURL = ""; // 🔧 CACHE: Evitar comparaciones costosas

    // 🎯 FUNCIÓN DE RENDERIZADO OPTIMIZADA
    const renderFavicon = (timestamp: number) => {
      // 🎯 VERIFICAR SI DEBE CONTINUAR
      if (!isActiveRef.current || !globalIsActive || document.hidden) {
        return;
      }

      // 🎯 THROTTLING ESTRICTO: Mayor intervalo entre frames
      if (timestamp - lastRenderTime < frameInterval) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
        return;
      }

      // 🎯 VERIFICAR SI LA IMAGEN ESTÁ CARGADA
      if (!isImageLoaded || !faviconImg.complete) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
        return;
      }

      // 🎯 INICIALIZAR TIEMPO DE INICIO
      if (!startTime) startTime = timestamp;
      lastRenderTime = timestamp;

      // 🎯 CALCULAR PROGRESO DE ANIMACIÓN
      const elapsedTime = timestamp - startTime;
      const rotationProgress =
        (elapsedTime % rotationAnimationDuration) / rotationAnimationDuration;
      const currentAngle = rotationProgress * Math.PI * 2;

      try {
        // 🔧 OPTIMIZACIÓN: Usar requestIdleCallback si está disponible
        const renderOperation = () => {
          // 🎯 RENDERIZAR FAVICON ANIMADO
          ctx.clearRect(0, 0, faviconSize, faviconSize);
          ctx.save();
          ctx.translate(faviconSize / 2, faviconSize / 2);

          // 🎯 GIRO 3D SOBRE EJE Y
          const scaleX = Math.cos(currentAngle);
          ctx.scale(scaleX, 1);

          // 🎯 DIBUJAR IMAGEN
          ctx.drawImage(
            faviconImg,
            -faviconSize / 2,
            -faviconSize / 2,
            faviconSize,
            faviconSize
          );

          ctx.restore();

          // 🔧 OPTIMIZACIÓN: Solo actualizar cada 3 frames para reducir overhead
          if (Math.floor(elapsedTime / frameInterval) % 3 === 0) {
            const newDataURL = faviconCanvas.toDataURL("image/png");
            if (favicon.href !== newDataURL && lastDataURL !== newDataURL) {
              favicon.href = newDataURL;
              lastDataURL = newDataURL;
            }
          }
        };

        // 🔧 USAR requestIdleCallback si está disponible, sino ejecutar inmediatamente
        if ("requestIdleCallback" in window) {
          requestIdleCallback(renderOperation, { timeout: frameInterval });
        } else {
          renderOperation();
        }
      } catch (error) {
        console.error("🎯 Error al renderizar favicon:", error);
      }

      // 🎯 CONTINUAR ANIMACIÓN
      if (isActiveRef.current && globalIsActive) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
      }
    };

    // 🎯 MANEJO DE VISIBILIDAD Y PAUSA DE PÁGINA
    const handleVisibilityChange = () => {
      if (document.hidden && globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;
        console.log("🎯 Favicon animation pausada (pestaña oculta)");
      } else if (!document.hidden && isActiveRef.current && globalIsActive) {
        console.log("🎯 Favicon animation reanudada (pestaña visible)");
        globalAnimationId = requestAnimationFrame(renderFavicon);
      }
    };

    // 🔧 NUEVA: Pausar animación durante interacciones importantes
    const handleUserInteraction = () => {
      if (globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;

        // Reanudar después de un breve delay
        setTimeout(() => {
          if (isActiveRef.current && globalIsActive && !document.hidden) {
            globalAnimationId = requestAnimationFrame(renderFavicon);
          }
        }, 100);
      }
    };

    // 🎯 INICIALIZAR CUANDO LA IMAGEN SE CARGA
    faviconImg.onload = () => {
      isImageLoaded = true;
      console.log("🎯 Favicon image loaded, iniciando animación");

      // 🎯 AGREGAR LISTENERS DE VISIBILIDAD Y INTERACCIÓN
      document.addEventListener("visibilitychange", handleVisibilityChange, {
        passive: true,
      });

      // 🔧 PAUSAR DURANTE CLICKS IMPORTANTES
      document.addEventListener("click", handleUserInteraction, {
        passive: true,
      });

      // 🎯 INICIAR ANIMACIÓN
      if (!globalAnimationId) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
      }
    };

    faviconImg.onerror = () => {
      console.error("🎯 Error al cargar favicon image");
      globalIsActive = false;
      isActiveRef.current = false;
    };

    // 🎯 CLEANUP FUNCTION
    return () => {
      console.log("🎯 Cleanup favicon animation");
      isActiveRef.current = false;
      globalIsActive = false;

      if (globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;
      }

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [faviconSize, rotationAnimationDuration]);

  return {
    isActive: isActiveRef.current,
  };
};
