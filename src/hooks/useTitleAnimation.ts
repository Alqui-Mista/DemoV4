import { useEffect, useRef } from 'react';

interface TitleAnimationConfig {
  staticPart?: string;
  scrollingParts?: string[];
  separator?: string;
  visibleWidth?: number;
  updateInterval?: number;
}

export const useTitleAnimation = (config: TitleAnimationConfig = {}) => {
  const {
    staticPart = "InteliMark || ",
    scrollingParts = ["Sitio en construcción... |", "Promocional página DEMO |"],
    separator = "   ",
    visibleWidth = 35,
    updateInterval = 300
  } = config;

  const titleFramesRef = useRef<string[]>([]);
  const currentFrameIndexRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // Configurar frames de título
    const setupTitleAnimation = () => {
      // 1. Construir la cadena de scroll completa
      const scrollContent = scrollingParts.join(separator) + separator;
      
      // 2. Generar cada frame de la animación
      titleFramesRef.current = [];
      for (let i = 0; i < scrollContent.length; i++) {
        // Tomamos una "ventana" de la cadena de scroll, rotándola
        const rotatedString = scrollContent.substring(i) + scrollContent.substring(0, i);
        const frameText = staticPart + rotatedString.substring(0, visibleWidth);
        titleFramesRef.current.push(frameText);
      }
    };

    // Función de animación del título
    const titleAnimationLoop = (timestamp: number) => {
      if (timestamp - lastUpdateTimeRef.current > updateInterval) {
        lastUpdateTimeRef.current = timestamp;
        
        // Actualizar título con el frame actual
        const currentFrame = titleFramesRef.current[currentFrameIndexRef.current];
        if (currentFrame) {
          document.title = currentFrame;
        }
        
        // Avanzar al siguiente frame
        currentFrameIndexRef.current = (currentFrameIndexRef.current + 1) % titleFramesRef.current.length;
      }

      if (isActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);
      }
    };

    // Inicializar y comenzar animación
    setupTitleAnimation();
    isActiveRef.current = true;
    animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);

    // Cleanup
    return () => {
      isActiveRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Restaurar título original al desmontar
      document.title = "InteliMark";
    };
  }, [staticPart, scrollingParts, separator, visibleWidth, updateInterval]);

  return {
    isActive: isActiveRef.current,
    currentFrame: titleFramesRef.current[currentFrameIndexRef.current] || "InteliMark"
  };
};
