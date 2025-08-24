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
    const TARGET_FPS = 30; // 🎯 LIMITADO: 30fps en lugar de 60fps para mejor performance
    const frameInterval = 1000 / TARGET_FPS; // ~33ms entre frames
    let startTime: number | null = null;
    let isImageLoaded = false;

    // 🎯 FUNCIÓN DE RENDERIZADO OPTIMIZADA
    const renderFavicon = (timestamp: number) => {
      // 🎯 VERIFICAR SI DEBE CONTINUAR
      if (!isActiveRef.current || !globalIsActive || document.hidden) {
        return;
      }

      // 🎯 THROTTLING: Solo renderizar cada frameInterval
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

        // 🎯 ACTUALIZAR FAVICON (solo si cambió)
        const newDataURL = faviconCanvas.toDataURL("image/png");
        if (favicon.href !== newDataURL) {
          favicon.href = newDataURL;
        }
      } catch (error) {
        console.error("🎯 Error al renderizar favicon:", error);
      }

      // 🎯 CONTINUAR ANIMACIÓN
      if (isActiveRef.current && globalIsActive) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
      }
    };

    // 🎯 MANEJO DE VISIBILIDAD DE PÁGINA
    const handleVisibilityChange = () => {
      if (document.hidden && globalAnimationId) {
        cancelAnimationFrame(globalAnimationId);
        globalAnimationId = null;
      } else if (!document.hidden && isActiveRef.current && globalIsActive) {
        globalAnimationId = requestAnimationFrame(renderFavicon);
      }
    };

    // 🎯 INICIALIZAR CUANDO LA IMAGEN SE CARGA
    faviconImg.onload = () => {
      isImageLoaded = true;
      console.log("🎯 Favicon image loaded, iniciando animación");

      // 🎯 AGREGAR LISTENER DE VISIBILIDAD
      document.addEventListener("visibilitychange", handleVisibilityChange, {
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
    };
  }, [faviconSize, rotationAnimationDuration]);

  return {
    isActive: isActiveRef.current,
  };
};
