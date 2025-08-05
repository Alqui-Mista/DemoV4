import { useEffect, useRef } from 'react';

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
    colorAnimationDuration = 2500,
    rotationAnimationDuration = 5000,
    orangeColorStart = { r: 218, g: 128, b: 35 },
    orangeColorEnd = { r: 255, g: 201, b: 102 }
  } = config;

  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const isActiveRef = useRef<boolean>(false);

  useEffect(() => {
    // Crear elementos necesarios
    const faviconLinkElement = document.getElementById('favicon') as HTMLLinkElement;
    
    // Si no existe el elemento favicon, crearlo
    if (!faviconLinkElement) {
      const newFaviconLink = document.createElement('link');
      newFaviconLink.id = 'favicon';
      newFaviconLink.rel = 'icon';
      newFaviconLink.href = '';
      document.head.appendChild(newFaviconLink);
    }

    // Crear container SVG oculto
    const svgContainer = document.createElement('div');
    svgContainer.id = 'svg-display-container';
    svgContainer.style.display = 'none';
    
    const svgWrapper = document.createElement('div');
    svgWrapper.id = 'svg-container';
    svgWrapper.style.perspective = '1000px';
    
    // SVG del isotipo
    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.id = 'Isotipo';
    svgElement.setAttribute('viewBox', '0 0 253.39 285.25');
    svgElement.style.transformStyle = 'preserve-3d';
    
    // Crear defs y filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.id = 'glow-filter';
    filter.setAttribute('x', '-50%');
    filter.setAttribute('y', '-50%');
    filter.setAttribute('width', '200%');
    filter.setAttribute('height', '200%');
    
    const dropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
    dropShadow.id = 'glow';
    dropShadow.setAttribute('dx', '0');
    dropShadow.setAttribute('dy', '0');
    dropShadow.setAttribute('stdDeviation', '0');
    dropShadow.setAttribute('flood-color', '#da8023');
    
    filter.appendChild(dropShadow);
    defs.appendChild(filter);
    svgElement.appendChild(defs);
    
    // Crear grupo principal
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.id = 'Trazado';
    group.style.filter = 'url(#glow-filter)';
    
    // Crear path del hexágono
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.id = 'Hexágono';
    path.classList.add('cls-1');
    path.style.fill = '#da8023';
    path.setAttribute('d', 'M253.3,86.6l-.2,114.5c-1,14.8-15.8,21.2-36.8,33.7H193.8a1.64,1.64,0,0,1-.9-3l36.4-22.5c8.5-5.5,7.7-7.6,8.3-12l.2-104.2c-.2-7.5-1.8-13.3-11.2-17.2l-89-55.3c-6.4-4.3-13.6-5-22,0L24.9,76.1c-5.7,3.5-8,4.5-7.8,10.8v108c0,6.7,1.8,10,5.3,11.5L63.9,232l.2.1,51,31.6c8.3,5.7,16.1,6,23.4,1.9a.1.1,0,0,0,.1-.1,21.11,21.11,0,0,0,2.7-1.8l11.8-8,14.5,9.3-29.7,18c-6.8,3-15.5,3-24,0L14.7,221.3S-.1,210.8,0,202.5V82.5S.8,72.2,12,66.3L110.4,6c11.6-8.1,22.7-7.9,33.3,0l92.6,56.8C246.8,69,254.3,76.6,253.3,86.6Z');
    
    group.appendChild(path);
    svgElement.appendChild(group);
    svgWrapper.appendChild(svgElement);
    svgContainer.appendChild(svgWrapper);
    document.body.appendChild(svgContainer);

    // Elementos para canvas
    const faviconCanvas = document.createElement('canvas');
    faviconCanvas.width = faviconSize;
    faviconCanvas.height = faviconSize;
    const faviconCtx = faviconCanvas.getContext('2d');
    const faviconImg = new Image();
    
    // Referencias a elementos
    const orangeElements = svgElement.querySelectorAll('.cls-1');
    const dropShadowFilter = document.getElementById('glow');
    const favicon = document.getElementById('favicon') as HTMLLinkElement;
    
    // Función de animación principal
    const mainLoop = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      
      const elapsedTime = timestamp - startTimeRef.current;
      
      // Animación de color y resplandor
      const colorProgress = (elapsedTime % colorAnimationDuration) / colorAnimationDuration;
      const easeProgress = (Math.sin(colorProgress * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      
      const orangeR = orangeColorStart.r + (orangeColorEnd.r - orangeColorStart.r) * easeProgress;
      const orangeG = orangeColorStart.g + (orangeColorEnd.g - orangeColorStart.g) * easeProgress;
      const orangeB = orangeColorStart.b + (orangeColorEnd.b - orangeColorStart.b) * easeProgress;
      const currentOrangeColor = `rgb(${Math.round(orangeR)}, ${Math.round(orangeG)}, ${Math.round(orangeB)})`;

      const maxGlowSize = 18;
      const currentGlowSize = maxGlowSize * easeProgress;

      orangeElements.forEach(el => (el as SVGElement).style.fill = currentOrangeColor);
      if (dropShadowFilter) {
        dropShadowFilter.setAttribute('stdDeviation', currentGlowSize.toString());
        dropShadowFilter.setAttribute('flood-color', currentOrangeColor);
      }

      // Animación de rotación 3D
      const rotationProgress = (elapsedTime % rotationAnimationDuration) / rotationAnimationDuration;
      const currentAngle = 360 * rotationProgress;
      svgElement.style.transform = `rotateY(${currentAngle}deg)`;
      
      // Generar favicon
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgDataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));

      faviconImg.src = svgDataUrl;
      faviconImg.onload = () => {
        if (faviconCtx) {
          faviconCtx.clearRect(0, 0, faviconSize, faviconSize);
          faviconCtx.drawImage(faviconImg, 0, 0, faviconSize, faviconSize);
          if (favicon) {
            favicon.href = faviconCanvas.toDataURL('image/png');
          }
        }
      };

      if (isActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(mainLoop);
      }
    };

    // Iniciar animación
    isActiveRef.current = true;
    animationFrameRef.current = requestAnimationFrame(mainLoop);

    // Cleanup
    return () => {
      isActiveRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Remover elementos del DOM
      if (svgContainer && svgContainer.parentNode) {
        svgContainer.parentNode.removeChild(svgContainer);
      }
    };
  }, [faviconSize, colorAnimationDuration, rotationAnimationDuration, orangeColorStart, orangeColorEnd]);

  return {
    isActive: isActiveRef.current
  };
};
