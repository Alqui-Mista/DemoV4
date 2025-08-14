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
    scrollingParts = [
      "Sitio en construcción... |",
      "Promocional página DEMO |",
    ],
    separator = "   ",
    visibleWidth = 35,
    updateInterval = 300,
  } = config;

  const titleFramesRef = useRef<string[]>([]);
  const currentFrameIndexRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // Configurar frames de título
    const setupTitleAnimation = () => {
      const scrollContent = scrollingParts.join(separator) + separator;
      titleFramesRef.current = [];
      for (let i = 0; i < scrollContent.length; i++) {
        const rotatedString =
          scrollContent.substring(i) + scrollContent.substring(0, i);
        const frameText = staticPart + rotatedString.substring(0, visibleWidth);
        titleFramesRef.current.push(frameText);
      }
    };

    let lastUpdate = 0;
    const titleAnimationLoop = (timestamp: number) => {
      if (document.hidden) return;
      if (timestamp - lastUpdate > updateInterval) {
        lastUpdate = timestamp;
        const currentFrame =
          titleFramesRef.current[currentFrameIndexRef.current];
        if (currentFrame) {
          document.title = currentFrame;
        }
        currentFrameIndexRef.current =
          (currentFrameIndexRef.current + 1) % titleFramesRef.current.length;
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
    setupTitleAnimation();
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
    currentFrame:
      titleFramesRef.current[currentFrameIndexRef.current] || "InteliMark",
  };
};
