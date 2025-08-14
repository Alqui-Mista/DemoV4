import { useEffect, useRef } from "react";

interface FaviconAnimationConfig {
  faviconSize?: number;
  colorAnimationDuration?: number;
  rotationAnimationDuration?: number;
  orangeColorStart?: { r: number; g: number; b: number };
  orangeColorEnd?: { r: number; g: number; b: number };
}

export const useFaviconAnimation = (config: FaviconAnimationConfig = {}) => {
  const {
    faviconSize = 32,
    colorAnimationDuration = 2000,
    rotationAnimationDuration = 3000,
    orangeColorStart = { r: 255, g: 140, b: 0 },
    orangeColorEnd = { r: 255, g: 200, b: 0 },
  } = config;
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // Crear SVG dinámicamente

    // Cargar el SVG original del isotipo y animar favicon
    fetch("/src/assets/favicon_intelimark.svg")
      .then((response) => response.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.documentElement;
        svgElement.setAttribute("width", faviconSize.toString());
        svgElement.setAttribute("height", faviconSize.toString());
        svgElement.setAttribute("viewBox", `0 0 203.39 235.25`);

        const faviconCanvas = document.createElement("canvas");
        faviconCanvas.width = faviconSize;
        faviconCanvas.height = faviconSize;
        const faviconCtx = faviconCanvas.getContext("2d");
        const faviconImg = new window.Image();

        let favicon = document.querySelector(
          "link[rel~='icon']"
        ) as HTMLLinkElement;
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          document.head.appendChild(favicon);
        }

        const orangeElements = svgElement.querySelectorAll(".cls-2");

        let lastUpdate = 0;
        const updateInterval = 200; // ms

        const mainLoop = (timestamp: number) => {
          if (document.hidden) return;
          if (!startTimeRef.current) startTimeRef.current = timestamp;
          if (timestamp - lastUpdate > updateInterval) {
            lastUpdate = timestamp;
            const elapsedTime = timestamp - startTimeRef.current;
            const colorProgress =
              (elapsedTime % colorAnimationDuration) / colorAnimationDuration;
            const easeProgress =
              (Math.sin(colorProgress * Math.PI * 2 - Math.PI / 2) + 1) / 2;
            const orangeR =
              orangeColorStart.r +
              (orangeColorEnd.r - orangeColorStart.r) * easeProgress;
            const orangeG =
              orangeColorStart.g +
              (orangeColorEnd.g - orangeColorStart.g) * easeProgress;
            const orangeB =
              orangeColorStart.b +
              (orangeColorEnd.b - orangeColorStart.b) * easeProgress;
            const currentOrangeColor = `rgb(${Math.round(
              orangeR
            )}, ${Math.round(orangeG)}, ${Math.round(orangeB)})`;
            orangeElements.forEach((el) => {
              (el as SVGElement).setAttribute("fill", currentOrangeColor);
            });
            const svgString = new XMLSerializer().serializeToString(svgElement);
            const svgDataUrl =
              "data:image/svg+xml;base64," +
              btoa(unescape(encodeURIComponent(svgString)));
            faviconImg.src = svgDataUrl;
            faviconImg.onload = () => {
              if (faviconCtx) {
                faviconCtx.clearRect(0, 0, faviconSize, faviconSize);
                faviconCtx.drawImage(
                  faviconImg,
                  0,
                  0,
                  faviconSize,
                  faviconSize
                );
                if (favicon) {
                  favicon.href = faviconCanvas.toDataURL("image/png");
                }
              }
            };
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

        document.addEventListener("visibilitychange", handleVisibilityChange);
        isActiveRef.current = true;
        animationFrameRef.current = requestAnimationFrame(mainLoop);

        // Cleanup
        return () => {
          isActiveRef.current = false;
          if (animationFrameRef.current)
            cancelAnimationFrame(animationFrameRef.current);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
          );
        };
      });

    // Cleanup for the effect
    return () => {
      isActiveRef.current = false;
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      // Remove visibilitychange event listener if needed (handled in fetch then block)
    };
  }, [
    faviconSize,
    colorAnimationDuration,
    rotationAnimationDuration,
    orangeColorStart,
    orangeColorEnd,
  ]);

  // Only return the hook state from the hook, not inside useEffect
  return {
    isActive: isActiveRef.current,
  };
};
