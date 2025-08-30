import { useEffect, useRef } from "react";

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
    scrollingParts = ["Sitio en construcción... |", "Vuelve pronto. |"],
    separator = "   ",
    visibleWidth = 35,
    updateInterval = 300,
  } = config;

  const animationFrameRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // Generar frames de animación (inline simplificado)
    const scrollContent = scrollingParts.join(separator) + separator;
    const titleFrames: string[] = [];

    // Algoritmo simplificado de rotación
    for (let i = 0; i < scrollContent.length; i++) {
      const rotated = scrollContent.slice(i) + scrollContent.slice(0, i);
      titleFrames.push(staticPart + rotated.substring(0, visibleWidth));
    }

    let lastUpdate = 0;
    let currentIndex = 0;

    const titleAnimationLoop = (timestamp: number) => {
      if (timestamp - lastUpdate > updateInterval) {
        lastUpdate = timestamp;
        const currentFrame = titleFrames[currentIndex];
        if (currentFrame) {
          document.title = currentFrame;
        }
        currentIndex = (currentIndex + 1) % titleFrames.length;
      }

      if (isActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
        if (animationFrameRef.current)
          cancelAnimationFrame(animationFrameRef.current);
      } else {
        isActiveRef.current = true;
        animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    isActiveRef.current = true;
    animationFrameRef.current = requestAnimationFrame(titleAnimationLoop);

    // Cleanup
    return () => {
      isActiveRef.current = false;
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.title = "InteliMark";
    };
  }, [staticPart, scrollingParts, separator, visibleWidth, updateInterval]);

  return {
    isActive: isActiveRef.current,
  };
};
