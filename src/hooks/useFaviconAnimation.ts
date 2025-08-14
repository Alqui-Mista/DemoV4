interface FaviconAnimationConfig {
  faviconSize?: number;
  colorAnimationDuration?: number;
  rotationAnimationDuration?: number;
  orangeColorStart?: { r: number; g: number; b: number };
  orangeColorEnd?: { r: number; g: number; b: number };
}

import { useEffect, useRef } from "react";

interface FaviconAnimationConfig {
  faviconSize?: number;
  rotationAnimationDuration?: number;
}

export const useFaviconAnimation = (config: FaviconAnimationConfig = {}) => {
  const { faviconSize = 32, rotationAnimationDuration = 3000 } = config;
  const animationFrameRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    const faviconCanvas = document.createElement("canvas");
    faviconCanvas.width = faviconSize;
    faviconCanvas.height = faviconSize;
    const ctx = faviconCanvas.getContext("2d");
    const faviconImg = new window.Image();
    faviconImg.src = "/src/assets/favicon_intelimark.png";

    let favicon = document.querySelector(
      "link[rel~='icon']"
    ) as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    let lastUpdate = 0;
    const updateInterval = 300; // ms
    let startTime: number | null = null;

    const mainLoop = (timestamp: number) => {
      if (document.hidden) return;
      if (!startTime) startTime = timestamp;
      if (timestamp - lastUpdate > updateInterval) {
        lastUpdate = timestamp;
        const elapsedTime = timestamp - startTime;
        const rotationProgress =
          (elapsedTime % rotationAnimationDuration) / rotationAnimationDuration;
        const currentAngle = rotationProgress * Math.PI * 2;
        if (ctx) {
          ctx.clearRect(0, 0, faviconSize, faviconSize);
          ctx.save();
          ctx.translate(faviconSize / 2, faviconSize / 2);
          // Giro 3D sobre eje Y, manteniendo la cabeza arriba
          const scaleX = Math.cos(currentAngle);
          ctx.scale(scaleX, 1);
          ctx.drawImage(
            faviconImg,
            -faviconSize / 2,
            -faviconSize / 2,
            faviconSize,
            faviconSize
          );
          ctx.restore();
          favicon.href = faviconCanvas.toDataURL("image/png");
        }
      }
      if (isActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(mainLoop);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
        if (animationFrameRef.current)
          cancelAnimationFrame(animationFrameRef.current);
      } else {
        isActiveRef.current = true;
        animationFrameRef.current = requestAnimationFrame(mainLoop);
      }
    };

    faviconImg.onload = () => {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      isActiveRef.current = true;
      animationFrameRef.current = requestAnimationFrame(mainLoop);
    };

    return () => {
      isActiveRef.current = false;
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [faviconSize, rotationAnimationDuration]);

  return {
    isActive: isActiveRef.current,
  };
};
