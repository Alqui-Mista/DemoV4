// src/pages/Rebecca.tsx (Versión Optimizada para Performance)

import { useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";
import { VapiChatButton } from "../components/VapiChatButton";
import { vapiConfig } from "../config/vapi.config";
import HomePage from "./HomePage";
import Robot3D from "../components/Robot3D";
import FuenteCero from "../components/FuenteCero";

// 🔧 VARIABLES GLOBALES para prevenir double mounting en Strict Mode
let isRebeccaMounted = false;
let isHome3dAudioInitialized = false;
let globalHome3dAudio: HTMLAudioElement | null = null;
// 🔧 TEMPORAL: Import comentado para testing
// import { useTitleAnimation } from "../hooks/useTitleAnimation";
// 🔧 TEMPORAL: Import comentado para testing
// import { useFaviconAnimation } from "../hooks/useFaviconAnimation";
import CTAButtonImage from "../assets/CTAButtom.png"; // Importar imagen del botón CTA
import ContenedorCreditos from "../assets/contenedor_creditos.png"; // Importar imagen del contenedor tecnológico
import "./Rebecca.css";

const Rebecca = memo(() => {
  // 🔧 TEMPORAL: Favicon desactivado para testing
  // useFaviconAnimation();
  // 🔧 TEMPORAL: Título animado desactivado para testing
  // useTitleAnimation();

  // 🎯 ESTADOS CONSOLIDADOS PARA LA SECCIÓN CTA
  const [ctaScrollPercent, setCtaScrollPercent] = useState(0); // 0 a 1
  const [isCtaButtonVisible, setIsCtaButtonVisible] = useState(false); // Control de fade-in tecnológico
  const [isCtaTextVisible, setIsCtaTextVisible] = useState(false); // Control de texto
  const [isClickProcessing, setIsClickProcessing] = useState(false); // Control click CTA

  // 🔧 NUEVA: Banderas para prevenir múltiples activaciones
  const [typewriterTriggered, setTypewriterTriggered] = useState(false);
  const [buttonTriggered, setButtonTriggered] = useState(false);
  const [resetTriggered, setResetTriggered] = useState(false);
  const [isTypewriterActive, setIsTypewriterActive] = useState(false); // Control del typewriter
  const [isEffectActive, setIsEffectActive] = useState(false); // Control FuenteCero/Matrix Rain

  // 🎯 ESTADOS CONSOLIDADOS PARA EFECTOS DE HOVER/MOUSE
  const [isHoveringButton, setIsHoveringButton] = useState(false); // Hover del botón WhatsApp
  const [isHovering, setIsHovering] = useState(false); // Hover general del visualizador

  // � REFERENCIAS CONSOLIDADAS PARA EL CTA
  const magneticRefs = useRef<(HTMLSpanElement | null)[]>([]); // Referencias magnéticas del subtítulo
  const titleMagneticRefs = useRef<(HTMLSpanElement | null)[]>([]); // Referencias magnéticas del título
  const ctaSectionRef = useRef<HTMLElement>(null); // Referencia principal de la sección CTA

  // 🎯 Efecto magnético para textos del CTA (título y subtítulo)
  useEffect(() => {
    let rafId: number | null = null;
    let isProcessing = false;

    const handleMouseMove = (e: MouseEvent) => {
      // 🚀 OPTIMIZACIÓN: Throttling con requestAnimationFrame mejorado
      if (isProcessing) return;

      isProcessing = true;
      rafId = requestAnimationFrame(() => {
        try {
          // 🎯 Procesar elementos del subtítulo
          magneticRefs.current.forEach((textElement) => {
            if (
              !textElement ||
              !textElement.classList.contains("typewriter-complete")
            )
              return;

            applyMagneticEffect(e, textElement);
          });

          // 🎯 Procesar elementos del título
          titleMagneticRefs.current.forEach((titleElement) => {
            if (!titleElement) return;

            applyMagneticEffect(e, titleElement, true); // true indica que es título
          });
        } catch (error) {
          console.warn("Error en efectos magnéticos:", error);
        } finally {
          isProcessing = false;
        }
      });
    };

    // 🌟 Función para aplicar el efecto magnético
    const applyMagneticEffect = (
      e: MouseEvent,
      element: HTMLSpanElement,
      isTitle = false
    ) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calcular distancia del mouse al centro del texto
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );

      // Zona de influencia más grande para el título
      const maxDistance = isTitle ? 400 : 300;
      const normalizedDistance = Math.max(
        0,
        Math.min(1, distance / maxDistance)
      );
      const intensity = 1 - normalizedDistance;

      // Posición relativa del mouse dentro del elemento
      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

      // Aplicar variables CSS para el efecto
      element.style.setProperty(
        "--mouse-x",
        `${Math.max(0, Math.min(100, relativeX))}%`
      );
      element.style.setProperty(
        "--mouse-y",
        `${Math.max(0, Math.min(100, relativeY))}%`
      );
      element.style.setProperty("--distance", normalizedDistance.toString());
      element.style.setProperty("--intensity", intensity.toString());

      // Activar clase magnética si está muy cerca
      const threshold = isTitle ? 0.6 : 0.7; // Umbral más bajo para el título
      if (intensity > threshold) {
        element.classList.add("magnetic-active");
      } else {
        element.classList.remove("magnetic-active");
      }
    };

    // Detectar cuando las animaciones typewriter terminan
    const checkTypewriterComplete = () => {
      magneticRefs.current.forEach((textElement, index) => {
        if (!textElement) return;

        // Tiempo estimado cuando cada línea termina
        const completionTimes = [6500, 11000]; // 3s delay + 3.5s typing, 7s delay + 4s typing
        const lineIndex = index;

        setTimeout(() => {
          textElement.classList.add("typewriter-complete");
        }, completionTimes[lineIndex]);
      });
    };

    // Agregar listener al documento y ejecutar detección
    document.addEventListener("mousemove", handleMouseMove);
    checkTypewriterComplete();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // 🎯 CONTROLADOR UNIFICADO DE SCROLL CTA - REORGANIZADO
  useEffect(() => {
    /* 
    ╔══════════════════════════════════════════════════════════════════════════════╗
    ║                      📊 UMBRALES DE ACTIVACIÓN CTA                          ║
    ╠══════════════════════════════════════════════════════════════════════════════╣
    ║ 🎭 FuenteCero/Matrix Rain:    30% visible → Activa lluvia de códigos       ║
    ║ 🎯 Typewriter Effect:         90% visible → Inicia animación de escritura   ║
    ║ 📱 Botón WhatsApp:           95% visible → Aparece botón + texto           ║
    ║ 🔄 Reset Completo:           10% visible → Resetea todos los efectos       ║
    ║ 📉 Desvanecimiento:          30% visible → Oculta botón (salida suave)     ║
    ╚══════════════════════════════════════════════════════════════════════════════╝
    */

    // 🎯 Función helper para control de typewriter (CON GUARD)
    const handleTypewriterControl = (ratio: number, isActive: boolean) => {
      if (ratio >= 0.9 && !isActive && !typewriterTriggered) {
        console.log("🎯 Activando typewriter - CTA 90% visible", ratio);
        setIsTypewriterActive(true);
        setTypewriterTriggered(true); // 🔧 Prevenir múltiples activaciones

        const line1 = document.querySelector(
          ".subtitle-line-1.typewriter-line"
        );
        const line2 = document.querySelector(
          ".subtitle-line-2.typewriter-line"
        );

        if (line1) {
          line1.classList.add("typewriter-active");
          console.log("✅ Typewriter línea 1 activada");
        }
        if (line2) {
          line2.classList.add("typewriter-active");
          console.log("✅ Typewriter línea 2 activada");
        }
      }
    };

    // 🎯 Función helper para control del botón WhatsApp (CON GUARD)
    const handleButtonControl = (ratio: number) => {
      if (ratio >= 0.95 && !buttonTriggered) {
        setIsCtaButtonVisible(true);
        setButtonTriggered(true); // 🔧 Prevenir múltiples activaciones
        setTimeout(() => setIsCtaTextVisible(true), 600);
        console.log("✅ Botón WhatsApp activado al 95%");
      } else if (ratio < 0.3 && buttonTriggered) {
        setIsCtaButtonVisible(false);
        setIsCtaTextVisible(false);
        setButtonTriggered(false); // 🔧 Reset para permitir reactivación
      }
    };

    // 🎯 Función helper para reset completo (CON GUARD)
    const handleResetEffects = (ratio: number, isActive: boolean) => {
      if (ratio < 0.1 && isActive && !resetTriggered) {
        console.log("🔄 Reset completo de efectos CTA");
        setIsTypewriterActive(false);
        setTypewriterTriggered(false); // 🔧 Reset banderas
        setResetTriggered(true); // 🔧 Prevenir múltiples resets

        const line1 = document.querySelector(
          ".subtitle-line-1.typewriter-line"
        );
        const line2 = document.querySelector(
          ".subtitle-line-2.typewriter-line"
        );

        if (line1) line1.classList.remove("typewriter-active");
        if (line2) line2.classList.remove("typewriter-active");
      } else if (ratio > 0.2) {
        setResetTriggered(false); // 🔧 Permitir nuevo reset cuando scroll sube
      }
    };

    // 🎯 Función helper para FuenteCero/Matrix Rain
    const handleMatrixRainControl = (ratio: number) => {
      if (ratio >= 0.3) {
        setIsEffectActive(true);
      } else {
        setIsEffectActive(false);
      }
    };

    // 🎯 Observer principal reorganizado
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          setCtaScrollPercent(ratio);

          // 🎯 Ejecutar controles en orden lógico
          handleTypewriterControl(ratio, isTypewriterActive);
          handleButtonControl(ratio);
          handleResetEffects(ratio, isTypewriterActive);
          handleMatrixRainControl(ratio);
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // Precisión 0.01
      }
    );

    if (ctaSectionRef.current) {
      observer.observe(ctaSectionRef.current);
    }

    return () => {
      if (ctaSectionRef.current) {
        observer.unobserve(ctaSectionRef.current);
      }
    };
  }, [
    isTypewriterActive,
    typewriterTriggered,
    buttonTriggered,
    resetTriggered,
  ]); // 🔧 Dependencias actualizadas

  // 🎯 NUEVO: Listener para redimensionamiento de ventana para mejorar responsividad
  useEffect(() => {
    const handleResize = () => {
      // Forzar recálculo de estilos del subtítulo para mejor adaptabilidad
      const lines = document.querySelectorAll(
        ".subtitle-line-1, .subtitle-line-2"
      );
      lines.forEach((line) => {
        const element = line as HTMLElement;
        // Forzar reflow para recalcular dimensiones responsive
        element.style.display = "none";
        element.offsetHeight; // Trigger reflow
        element.style.display = "block";
      });
    };

    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 250); // Debounce para performance
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
  const containerRef = useRef<HTMLDivElement>(null!);
  const tooltipRef = useRef<HTMLDivElement>(null!);
  const buttonTooltipRef = useRef<HTMLDivElement>(null!);

  const [isActive, setIsActive] = useState(false);
  const [showHomePage, setShowHomePage] = useState(false);
  // Ref para reflejar el estado actual de showHomePage dentro del efecto
  const showHomePageRef = useRef(false);
  useEffect(() => {
    showHomePageRef.current = showHomePage;
  }, [showHomePage]);

  // 🎯 ESTADOS PARA INSTRUCCIÓN "CLIC PARA CERRAR"
  const [showCloseInstruction, setShowCloseInstruction] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const home3dAudioRef = useRef<HTMLAudioElement | null>(null);

  // 🎯 ESTADO PARA MODAL DE CRÉDITOS
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // useEffect para controlar la visibilidad del cursor CAD completo
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Solo agregar la cruz si no existe
    let cursorCross = container.querySelector(
      ".cursor-cross"
    ) as HTMLDivElement | null;
    if (!cursorCross) {
      cursorCross = document.createElement("div");
      cursorCross.className = "cursor-cross";
      container.appendChild(cursorCross);
    }

    // Elementos de zona
    let zoneElements: {
      footer?: HTMLElement;
      cta?: HTMLElement;
      home3d?: HTMLElement;
    } = {};
    const cacheZoneElements = () => {
      zoneElements = {
        footer: document.getElementById("footer-reveal") as HTMLElement,
        cta: document.getElementById("cta-section") as HTMLElement,
        home3d: document.getElementById(
          "homepage-scroll-container"
        ) as HTMLElement,
      };
    };

    // Detectar zona del mouse
    let currentZone: string = "default";
    const detectZone = (e: MouseEvent): string => {
      cacheZoneElements();
      // Prioridad 1: HOME 3D
      if (zoneElements.home3d) {
        const rect = zoneElements.home3d.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          return "home3d";
        }
      }
      // Prioridad 2: Footer
      if (zoneElements.footer) {
        const rect = zoneElements.footer.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          return "footer";
        }
      }
      // Prioridad 3: CTA
      if (zoneElements.cta) {
        const rect = zoneElements.cta.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          return "cta";
        }
      }
      return "default";
    };

    const applyCursorForZone = (zone: string) => {
      if (showHomePage) {
        container.classList.remove("custom-cursor");
        cursorCross.classList.remove("visible");
        cursorCross.style.display = "none";
        return;
      }
      switch (zone) {
        case "home3d":
          // 🎯 MANTENER CURSOR PERSONALIZADO EN HOME 3D PARA CALIBRACIÓN CORRECTA
          container.classList.add("custom-cursor");
          cursorCross.classList.add("visible");
          cursorCross.style.display = "block";
          break;
        case "cta":
          container.classList.remove("custom-cursor");
          cursorCross.classList.remove("visible");
          cursorCross.style.display = "none";
          // 🔧 ASEGURAR QUE EL CUADRADO TAMBIÉN SE OCULTE
          container.style.setProperty("--cursor-x", "-100px");
          container.style.setProperty("--cursor-y", "-100px");
          break;
        case "footer":
        case "default":
          container.classList.add("custom-cursor");
          cursorCross.classList.add("visible");
          cursorCross.style.display = "block";
          break;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (showHomePage) {
        container.classList.remove("custom-cursor");
        cursorCross.classList.remove("visible");
        cursorCross.style.display = "none";
        return;
      }
      const newZone = detectZone(e);
      if (newZone !== currentZone) {
        currentZone = newZone;
        applyCursorForZone(newZone);
      }
      if (
        currentZone === "default" ||
        currentZone === "footer" ||
        currentZone === "home3d"
      ) {
        // 🔧 OPTIMIZACIÓN: RAF throttling mejorado para cursor
        requestAnimationFrame(() => {
          container.style.setProperty("--cursor-x", `${e.clientX}px`);
          container.style.setProperty("--cursor-y", `${e.clientY}px`);
          cursorCross.style.left = `${e.clientX}px`;
          cursorCross.style.top = `${e.clientY}px`;
        });
      }
    };

    const handleMouseLeave = () => {
      container.classList.remove("custom-cursor");
      cursorCross.classList.remove("visible");
      cursorCross.style.display = "none";
      currentZone = "default";
    };

    const handleMouseEnter = () => {
      cacheZoneElements();
      currentZone = "default";
      applyCursorForZone("default");
    };

    document.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);

    currentZone = "default";
    applyCursorForZone("default");

    const timer = setTimeout(() => {
      document.querySelectorAll(".fade-in-delayed").forEach((el) => {
        el.classList.add("fade-in-active");
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);
      if (cursorCross && container.contains(cursorCross)) {
        container.removeChild(cursorCross);
      }
    };
  }, [showHomePage]);

  // Eliminado observer antiguo para animaciones de textos en CTA

  useEffect(() => {
    // 🔧 PREVENCIÓN COMPLETA: No ejecutar si ya está montado
    if (isRebeccaMounted) {
      return;
    }

    console.log("🎯 Rebecca montada - restaurando posición al inicio...");
    isRebeccaMounted = true;

    const isInitialMount = window.scrollY === 0;
    if (isInitialMount) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      console.log("✅ Posición de scroll restaurada:", window.scrollY);
    } else {
      console.log("📍 Manteniendo posición actual de scroll:", window.scrollY);
    }

    return () => {
      // Solo resetear en unmount verdadero
      isRebeccaMounted = false;
    };
  }, []);

  // Estados para la sección CTA

  useEffect(() => {
    // 🔧 PREVENCIÓN COMPLETA: No ejecutar si ya está inicializado
    if (isHome3dAudioInitialized) {
      return;
    }

    console.log("🎵 Inicializando sonido HOME 3D...");
    isHome3dAudioInitialized = true;

    const audio = new Audio("/home3d_bottom.mp3");
    audio.volume = 0.5;
    audio.preload = "auto";
    globalHome3dAudio = audio;
    home3dAudioRef.current = audio;

    return () => {
      if (globalHome3dAudio) {
        globalHome3dAudio.pause();
        globalHome3dAudio = null;
      }
      if (home3dAudioRef.current) {
        home3dAudioRef.current = null;
      }
      isHome3dAudioInitialized = false;
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (tooltipRef.current && isHovering && !isHoveringButton) {
        tooltipRef.current.style.left = e.clientX + "px";
        tooltipRef.current.style.top = e.clientY + "px";
      }
    };

    // El efecto del mouse solo depende de isHovering y isHoveringButton
    if (isHovering && !isHoveringButton) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isHovering, isHoveringButton]);

  // 🎯 CONTROL UNIFICADO DE SCROLL EN VISUALIZADOR HOME 3D
  useEffect(() => {
    if (showHomePage && isActive) {
      const scrollContainer = document.getElementById(
        "homepage-scroll-container"
      );

      if (scrollContainer) {
        // 🎯 RESETEAR POSICIÓN DE SCROLL AL ABRIR
        scrollContainer.scrollTop = 0;
        scrollContainer.scrollLeft = 0;

        let ticking = false; // 🎯 THROTTLING: Prevenir múltiples llamadas por frame

        // 🎯 HANDLER UNIFICADO: Optimizado para mejor performance
        const handleUnifiedScroll = (e: Event) => {
          if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
              try {
                const container = e.target as HTMLElement;

                // 🎯 PARTE 1: LIMITADOR DE SCROLL (55% del contenido total)
                const maxScroll = container.scrollHeight * 0.55;
                if (container.scrollTop > maxScroll) {
                  container.scrollTop = maxScroll;
                }

                // 🎯 PARTE 2: CONTROL DE INSTRUCCIONES "CLIC PARA CERRAR"
                const scrollTop = container.scrollTop;
                const scrollHeight =
                  container.scrollHeight - container.clientHeight;
                const scrollPercent = (scrollTop / scrollHeight) * 100;

                // Mostrar instrucción al 20% del scroll
                const shouldShow = scrollPercent >= 20;
                if (shouldShow !== showCloseInstruction) {
                  setShowCloseInstruction(shouldShow);
                }
              } catch (error) {
                console.warn("Error en scroll handler:", error);
              } finally {
                ticking = false; // 🎯 RESET: Permitir próxima actualización
              }
            });
          }
        };

        // 🎯 UN SOLO EVENT LISTENER con passive: false para poder modificar scrollTop
        scrollContainer.addEventListener("scroll", handleUnifiedScroll, {
          passive: false,
        });

        // 🎯 VERIFICAR ESTADO INICIAL
        const initialEvent = new Event("scroll");
        Object.defineProperty(initialEvent, "target", {
          value: scrollContainer,
          enumerable: true,
        });
        handleUnifiedScroll(initialEvent);

        // 🎯 FORZAR RECÁLCULO DESPUÉS DEL MONTAJE
        const timeoutId = setTimeout(() => {
          scrollContainer.style.height = "99.99%";
          requestAnimationFrame(() => {
            scrollContainer.style.height = "100%";
          });
        }, 100);

        return () => {
          clearTimeout(timeoutId);
          scrollContainer.removeEventListener("scroll", handleUnifiedScroll);
        };
      }
    } else {
      // Resetear estados cuando se cierra el visualizador
      setShowCloseInstruction(false);
    }
  }, [showHomePage, isActive, showCloseInstruction]);

  // 🎯 REF PARA EL ESTADO ACTUAL DE showCloseInstruction (para mousemove)
  const showCloseInstructionRef = useRef(showCloseInstruction);
  useEffect(() => {
    showCloseInstructionRef.current = showCloseInstruction;
  }, [showCloseInstruction]);

  // 🎯 SEPARACIÓN DEL CONTROL DE MOUSEMOVE PARA OPTIMIZACIÓN
  useEffect(() => {
    if (showHomePage && isActive) {
      const scrollContainer = document.getElementById(
        "homepage-scroll-container"
      );

      if (scrollContainer) {
        let lastUpdateTime = 0;
        const throttleDelay = 16; // 🎯 THROTTLING: Máximo 60fps

        const handleMouseMove = (e: MouseEvent) => {
          const now = Date.now();
          if (
            now - lastUpdateTime >= throttleDelay &&
            showCloseInstructionRef.current
          ) {
            setMousePosition({
              x: e.clientX,
              y: e.clientY,
            });
            lastUpdateTime = now;
          }
        };

        scrollContainer.addEventListener("mousemove", handleMouseMove, {
          passive: true,
        });

        return () => {
          scrollContainer.removeEventListener("mousemove", handleMouseMove);
        };
      }
    }
  }, [showHomePage, isActive]);

  const handleInteractiveClick = () => {
    if (!isActive) {
      if (home3dAudioRef.current) {
        console.log("🎵 Reproduciendo sonido HOME 3D...");
        home3dAudioRef.current.currentTime = 0;
        home3dAudioRef.current.play().catch((error) => {
          console.log("⚠️ No se pudo reproducir el sonido HOME 3D:", error);
        });
      }
      setIsActive(true);
      setShowHomePage(true);
    }
  };

  return (
    <>
      <div ref={containerRef} className="rebecca-container">
        <div className="main-content-wrapper">
          <div
            id="interactive-container"
            className={`flex-center ${isActive ? "active" : ""}`}
            onClick={handleInteractiveClick}
            onMouseEnter={(e) => {
              setIsHoveringButton(true);
              if (buttonTooltipRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = rect.right + 15;
                const y = rect.top + rect.height / 2 - 15;
                buttonTooltipRef.current.style.left = x + "px";
                buttonTooltipRef.current.style.top = y + "px";
              }
            }}
            onMouseLeave={() => {
              setIsHoveringButton(false);
            }}
            onMouseMove={(e) => {
              if (!isActive && isHoveringButton && buttonTooltipRef.current) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = rect.right + 15;
                const y = rect.top + rect.height / 2 - 15;
                buttonTooltipRef.current.style.left = x + "px";
                buttonTooltipRef.current.style.top = y + "px";
              }
            }}
          >
            {showHomePage && (
              <div
                className="homepage-wrapper"
                id="homepage-scroll-container"
                style={{
                  // 🎯 VISUALIZADOR LIMITADO: Solo mostrar escena inicial
                  overflow: "auto",
                  overflowX: "hidden",
                  height: "100%",
                  width: "100%",
                  WebkitOverflowScrolling: "touch",
                  scrollBehavior: "smooth",
                }}
                onClick={(e) => {
                  e.stopPropagation();

                  // 🎯 NO CERRAR SI EL CLIC VIENE DEL AUDIO VISUALIZER
                  const target = e.target as HTMLElement;
                  const isAudioVisualizerClick =
                    target.closest(".audio-visualizer-container") ||
                    target.closest(".audio-activate-button") ||
                    target.closest(".audio-visualizer-active") ||
                    target.classList.contains("audio-text") ||
                    target.classList.contains("bar") ||
                    target.classList.contains("bar-reflection");

                  if (isAudioVisualizerClick) {
                    console.log(
                      "🎵 Clic en AudioVisualizer detectado - No cerrar modal"
                    );
                    return; // No cerrar el modal
                  }

                  console.log("🔒 Cerrando visualizador HOME 3D");
                  if (home3dAudioRef.current) {
                    home3dAudioRef.current.currentTime = 0;
                    home3dAudioRef.current.play().catch((error) => {
                      console.log(
                        "⚠️ No se pudo reproducir el sonido HOME 3D (cerrar):",
                        error
                      );
                    });
                  }
                  setIsActive(false);
                  setShowHomePage(false);
                  setIsHoveringButton(false);
                }}
              >
                <div
                  className="homepage-embedded"
                  style={{
                    // 🎯 ALTURA AJUSTADA: Para llegar hasta la frase específica
                    minHeight: "250vh", // Aumentado para alcanzar más contenido
                    height: "250vh", // Altura suficiente para la frase objetivo
                    width: "100%",
                    position: "relative",
                    isolation: "isolate",
                    overflow: "hidden", // Cortar contenido que exceda
                  }}
                >
                  <HomePage
                    scrollContainer="homepage-scroll-container"
                    isEmbedded={true}
                    maxScrollPercentage={55} // 🎯 ALINEADO: Coincide con el límite de scroll del contenedor (55%)
                  />
                </div>

                {/* 🎯 INSTRUCCIÓN "CLIC PARA CERRAR" - Aparece al 20% del scroll */}
                {showCloseInstruction && (
                  <div
                    style={{
                      position: "fixed",
                      left: mousePosition.x + 25, // 🎯 AUMENTADO: de +8 a +25 (más alejado del cursor)
                      top: mousePosition.y - 20, // 🎯 AUMENTADO: de -5 a -20 (más alejado del cursor)
                      color: "rgba(255, 255, 255, 0.7)",
                      fontSize: "0.55rem",
                      fontWeight: "300",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                      pointerEvents: "none",
                      zIndex: 10000,
                      textShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
                      fontFamily: '"Orbitron", "Oxanium", sans-serif',
                      transition:
                        "left 0.4s ease-in-out, top 0.4s ease-in-out, opacity 0.3s ease", // 🎯 MEJORADO: 0.15s → 0.4s (más lento), ease-out → ease-in-out (más elegante)
                      userSelect: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Clic para cerrar
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            ref={buttonTooltipRef}
            className="button-tooltip button-tooltip-3d"
            style={{
              opacity: isHoveringButton && !isActive ? 1 : 0,
              left: "-300px",
              top: "-200px",
            }}
          >
            <div className="ai-minimal-container">
              <div className="ai-holo-text" data-text="HOME 3D">
                HOME 3D
              </div>
            </div>
          </div>
          <h1 className="portal-title">¡Bienvenido al futuro!</h1>
          <div className="vapi-content center-absolute">
            <VapiChatButton config={vapiConfig} variant="center" size="large" />
          </div>
          <div
            className="portal-effects center-absolute"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="glow-ring"></div>
            <div className="pulse-ring"></div>
            <div className="rotating-ring-outer"></div>
            <div className="rotating-ring-inner"></div>
            <div className="particle-ring"></div>
            <div className="energy-pulse"></div>
            <div className="wave-effect"></div>
          </div>
          <div
            ref={tooltipRef}
            className="cursor-tooltip"
            style={{ opacity: isHovering && !isHoveringButton ? 1 : 0 }}
          >
            HABLA CON NUESTRA IA
          </div>
        </div>

        <section
          ref={ctaSectionRef}
          className={`call-to-action-section ${
            isEffectActive ? "active-effect" : ""
          }`}
          id="cta-section"
        >
          {isEffectActive && <FuenteCero parentRef={ctaSectionRef} />}

          <div className="cta-content">
            <h2
              className="cta-title"
              style={{
                textAlign: "center",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(8px, 2vw, 12px)",
                width: "100%",
                maxWidth: "none", // 🎯 REMOVIDO: límite de ancho para permitir animación completa
                margin: "0 auto",
                overflow: "visible", // 🎯 CAMBIADO: de hidden a visible para permitir animación desde bordes
                minHeight: "clamp(120px, 15vh, 180px)", // 🎯 AGREGADO: altura mínima para evitar corte
                paddingTop: "clamp(10px, 2vh, 20px)", // 🎯 AGREGADO: padding superior
                paddingBottom: "clamp(10px, 2vh, 20px)", // 🎯 AGREGADO: padding inferior
              }}
            >
              <span
                ref={(el) => (titleMagneticRefs.current[0] = el)}
                className="magnetic-text"
                style={{
                  display: "inline-block",
                  transform: `translateX(${
                    -window.innerWidth * 0.7 +
                    (Math.min(ctaScrollPercent, 0.9) / 0.9) *
                      window.innerWidth *
                      0.7
                  }px)`, // 🎯 RESTAURADO: Animación original desde bordes completos
                  opacity: ctaScrollPercent >= 0.3 ? 1 : 0,
                  transition: "transform 0.1s linear, opacity 0.2s",
                  fontFamily: "SohoPro, Montserrat, Arial, sans-serif",
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontVariationSettings: '"wght" 900',
                  letterSpacing: "clamp(0.02em, 0.5vw, 0.04em)",
                  zIndex: 10,
                  lineHeight: 1.1, // 🎯 AUMENTADO: de 0.95 a 1.1 para evitar corte
                  fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                  color: "#ffffff",
                  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
                  textAlign: "center",
                  width: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                TRABAJEMOS
              </span>
              <span
                ref={(el) => (titleMagneticRefs.current[1] = el)}
                className="magnetic-text"
                style={{
                  display: "inline-block",
                  transform: `translateX(${
                    window.innerWidth * 0.7 -
                    (Math.min(ctaScrollPercent, 0.9) / 0.9) *
                      window.innerWidth *
                      0.7
                  }px)`, // 🎯 RESTAURADO: Animación original desde bordes completos
                  opacity: ctaScrollPercent >= 0.3 ? 1 : 0,
                  transition: "transform 0.1s linear, opacity 0.2s",
                  fontFamily: "SohoPro, Montserrat, Arial, sans-serif",
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontVariationSettings: '"wght" 900',
                  letterSpacing: "clamp(0.02em, 0.5vw, 0.04em)",
                  zIndex: 10,
                  lineHeight: 1.1, // 🎯 AUMENTADO: de 0.95 a 1.1 para evitar corte
                  textTransform: "uppercase",
                  fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
                  color: "#ffffff",
                  textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
                  textAlign: "center",
                  width: "auto",
                  whiteSpace: "nowrap",
                }}
              >
                JUNTOS
              </span>
            </h2>

            {/* Subtítulo CTA */}
            <div className="cta-subtitle-space">
              <p className="cta-subtitle">
                <span
                  ref={(el) => (magneticRefs.current[0] = el)}
                  className="subtitle-line-1 typewriter-line"
                  data-text="COMENZÓ UN NUEVO CAMBIO MUNDIAL, LA ERA TECNOLÓGICA."
                >
                  COMENZÓ UN NUEVO CAMBIO MUNDIAL, LA ERA TECNOLÓGICA.
                </span>
                <span
                  ref={(el) => (magneticRefs.current[1] = el)}
                  className="subtitle-line-2 typewriter-line"
                  data-text="AVANZA MUY RÁPIDO Y NO ESPERARÁ A NADIE. NO TE QUEDES ATRÁS."
                >
                  AVANZA MUY RÁPIDO Y NO ESPERARÁ A NADIE. NO TE QUEDES ATRÁS.
                </span>
              </p>
            </div>

            {/* Botón CTA */}
            <div
              className={`cta-button-container ${
                isCtaButtonVisible ? "visible" : "hidden"
              }`}
            >
              <div
                className="cta-button-wrapper"
                onClick={() => {
                  // 🔧 OPTIMIZACIÓN: Prevenir clicks múltiples rápidos
                  if (isClickProcessing) return;

                  setIsClickProcessing(true);
                  window.open("https://wa.me/56949459379", "_blank");

                  // Reset después de un breve delay
                  setTimeout(() => setIsClickProcessing(false), 300);
                }}
                onMouseEnter={(e) => {
                  const wrapper = e.currentTarget;
                  wrapper.classList.add("hover-active");
                }}
                onMouseLeave={(e) => {
                  const wrapper = e.currentTarget;
                  wrapper.classList.remove("hover-active");
                }}
              >
                {/* Imagen del botón */}
                <img
                  src={CTAButtonImage}
                  alt="WhatsApp Button"
                  className="cta-button-image"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                  }}
                />

                {/* Texto del botón adaptado a la pantalla rectangular existente */}
                <div
                  className={`cta-button-text-overlay center-absolute flex-center ${
                    isCtaTextVisible ? "text-visible" : "text-hidden"
                  }`}
                >
                  <span className="cta-button-text-display">WHATSAPP</span>
                  <div className="digital-glitch-overlay"></div>
                  <div className="electrical-interference"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer-reveal" id="footer-reveal">
          <div className="footer-content">
            <div className="footer-info">
              <div className="newsletter-section">
                <h4>MANTENTE ACTUALIZADO</h4>
                <h3>
                  suscríbete a<br />
                  nuestro boletín
                </h3>
                <p>
                  Recibe las últimas novedades de nuestra fecha de lanzamiento y
                  los increíbles descuentos y regalos que tenemos para ti.
                </p>
                <form
                  className="newsletter-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <input
                    type="email"
                    id="boletinEmailInput"
                    name="newsletter-email"
                    className="newsletter-input"
                    placeholder="Tu correo electrónico"
                  />
                  <button
                    type="submit"
                    id="boletinSubmitButton"
                    className="newsletter-button modern-arrow-button"
                  >
                    <div className="button-background">
                      <div className="metallic-surface"></div>
                    </div>
                    <div className="arrow-container center-absolute">
                      <svg
                        className="arrow-icon"
                        viewBox="0 0 42 30"
                        fill="none"
                      >
                        <defs>
                          {/* Gradientes premium para renderizado de alta calidad */}
                          <linearGradient
                            id="arrowPrimaryGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="50%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#da8023"
                              stopOpacity="1"
                            />
                            <stop
                              offset="15%"
                              stopColor="#da8023"
                              stopOpacity="1"
                            />
                            <stop
                              offset="35%"
                              stopColor="#da8023"
                              stopOpacity="1"
                            />
                            <stop
                              offset="55%"
                              stopColor="#ffffff"
                              stopOpacity="0.95"
                            />
                            <stop
                              offset="75%"
                              stopColor="#da8023"
                              stopOpacity="0.9"
                            />
                            <stop
                              offset="90%"
                              stopColor="#ffffff"
                              stopOpacity="0.85"
                            />
                            <stop
                              offset="100%"
                              stopColor="#da8023"
                              stopOpacity="0.8"
                            />
                          </linearGradient>

                          <linearGradient
                            id="arrowSecondaryGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="50%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#da8023"
                              stopOpacity="0.4"
                            />
                            <stop
                              offset="50%"
                              stopColor="#ffffff"
                              stopOpacity="0.25"
                            />
                            <stop
                              offset="100%"
                              stopColor="#da8023"
                              stopOpacity="0.1"
                            />
                          </linearGradient>

                          <radialGradient
                            id="glowRadialGradient"
                            cx="70%"
                            cy="50%"
                            r="60%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#ffffff"
                              stopOpacity="0.6"
                            />
                            <stop
                              offset="20%"
                              stopColor="#da8023"
                              stopOpacity="0.4"
                            />
                            <stop
                              offset="40%"
                              stopColor="#ffffff"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="60%"
                              stopColor="#da8023"
                              stopOpacity="0.2"
                            />
                            <stop
                              offset="80%"
                              stopColor="#b3b4b0"
                              stopOpacity="0.1"
                            />
                            <stop
                              offset="100%"
                              stopColor="#da8023"
                              stopOpacity="0"
                            />
                          </radialGradient>

                          <linearGradient
                            id="speedLineGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#da8023"
                              stopOpacity="0.1"
                            />
                            <stop
                              offset="70%"
                              stopColor="#ffffff"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="#da8023"
                              stopOpacity="0.5"
                            />
                          </linearGradient>
                        </defs>

                        {/* Líneas de velocidad ultra delgadas */}
                        <g className="speed-lines-group">
                          <path
                            d="M1 8 L13 8"
                            stroke="url(#speedLineGradient)"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            className="speed-line speed-line-1"
                          />
                          <path
                            d="M3 11 L15 11"
                            stroke="url(#speedLineGradient)"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            className="speed-line speed-line-2"
                          />
                          <path
                            d="M2 14 L14 14"
                            stroke="url(#speedLineGradient)"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            className="speed-line speed-line-3"
                          />
                          <path
                            d="M1 17 L13 17"
                            stroke="url(#speedLineGradient)"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            className="speed-line speed-line-4"
                          />
                          <path
                            d="M3 20 L15 20"
                            stroke="url(#speedLineGradient)"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                            className="speed-line speed-line-5"
                          />
                        </g>

                        {/* Flecha secundaria - outline sutil */}
                        <g className="secondary-arrow-group">
                          <path
                            d="M16 6 L30 15 L16 24 M22 15 L30 15"
                            stroke="url(#arrowSecondaryGradient)"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="secondary-arrow-outline"
                            fill="none"
                          />
                        </g>

                        {/* Resplandor de fondo principal */}
                        <g className="main-glow-group">
                          <ellipse
                            cx="30"
                            cy="15"
                            rx="14"
                            ry="10"
                            fill="url(#glowRadialGradient)"
                            className="main-arrow-glow"
                            opacity="0"
                          />
                        </g>

                        {/* Flecha principal con detalles premium */}
                        <g className="primary-arrow-group">
                          {/* Base de la flecha con grosor mínimo */}
                          <path
                            d="M18 7 L32 15 L18 23 M25 15 L32 15"
                            stroke="url(#arrowPrimaryGradient)"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="primary-arrow-base"
                            fill="none"
                          />

                          {/* Highlights internos ultra finos */}
                          <path
                            d="M20 9 L29 15 L20 21"
                            stroke="#ffffff"
                            strokeWidth="0.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="inner-highlight-1"
                            opacity="0"
                          />

                          <path
                            d="M22 11 L27 15 L22 19"
                            stroke="#ffd700"
                            strokeWidth="0.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="inner-highlight-2"
                            opacity="0"
                          />

                          <path
                            d="M24 13 L26 15 L24 17"
                            stroke="#ffffff"
                            strokeWidth="0.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="inner-highlight-3"
                            opacity="0"
                          />

                          {/* Puntos de luz micro */}
                          <circle
                            cx="25"
                            cy="13"
                            r="0.4"
                            fill="#ffffff"
                            className="micro-light-1"
                            opacity="0"
                          />
                          <circle
                            cx="27"
                            cy="15"
                            r="0.5"
                            fill="#ffd700"
                            className="micro-light-2"
                            opacity="0"
                          />
                          <circle
                            cx="25"
                            cy="17"
                            r="0.3"
                            fill="#ffab69"
                            className="micro-light-3"
                            opacity="0"
                          />

                          {/* Línea de energía central */}
                          <path
                            d="M26 15 L31 15"
                            stroke="#ffffff"
                            strokeWidth="0.2"
                            strokeLinecap="round"
                            className="energy-line"
                            opacity="0"
                          />
                        </g>
                      </svg>
                    </div>
                    <div className="neon-glow center-absolute"></div>
                  </button>
                </form>
                <p id="boletinMensaje"></p>
              </div>

              <div className="navigation-section">
                <button
                  className="homepage-access-button ai-matrix-button debug-button-position"
                  style={{
                    marginLeft: "5px", // 🎯 MOVIDO 5px HACIA LA IZQUIERDA (10px - 5px = 5px)
                    transform: "translateY(35px)", // 🎯 MOVER 35px HACIA ABAJO (15px + 20px adicionales)
                    position: "relative",
                    zIndex: 2000000, // 🎯 Z-INDEX MÁS ALTO QUE CURSORES Y CUALQUIER ELEMENTO
                  }}
                  onClick={() => {
                    window.location.href = "/";
                  }}
                >
                  <div className="ai-matrix-container">
                    {/* 🏹 TRIÁNGULO GEOMÉTRICO SIMPLE APUNTANDO A LA IZQUIERDA */}
                    <div className="data-matrix arrow-shape">
                      {/* Contenedor principal del triángulo */}
                      <div className="data-stream ds1 triangle-container"></div>
                    </div>

                    <div className="hologram-layers">
                      <div className="holo-layer layer1"></div>
                      <div className="holo-layer layer2"></div>
                      <div className="holo-layer layer3"></div>
                    </div>

                    <div className="holo-text">
                      <span
                        className="text-glitch"
                        data-text="VOLVER AL INICIO"
                      >
                        VOLVER AL INICIO
                      </span>
                    </div>

                    <div className="depth-scanner"></div>
                  </div>
                </button>
              </div>
            </div>

            <div className="footer-robot">
              <div className="robot-3d-container">
                <Robot3D
                  width="380px"
                  height="480px"
                  scale={1.2}
                  enableScrollRotation={true}
                />
              </div>
            </div>

            <div className="contact-info">
              <h4>PONTE EN CONTACTO</h4>

              <div className="contact-item general">
                <div className="contact-icon">
                  <div className="icon-general">📧</div>
                </div>
                <p>info@intelimark.cl</p>
                <span className="contact-label">Información General</span>
              </div>

              <div className="contact-item commercial">
                <div className="contact-icon">
                  <div className="icon-commercial">💼</div>
                </div>
                <p>pcarrasco@intelimark.cl</p>
                <span className="contact-label">Departamento Comercial</span>
              </div>

              <div className="contact-item phone">
                <div className="contact-icon">
                  <div className="icon-phone">📱</div>
                </div>
                <p>+56 9 4945 9379</p>
                <span className="contact-label">WhatsApp / Llamadas</span>
              </div>

              <div className="contact-item address">
                <div className="contact-icon">
                  <div className="icon-location">📍</div>
                </div>
                <p>
                  Alcázar 356, oficina 603
                  <br />
                  Rancagua Centro, Chile
                </p>
                <span className="contact-label">Oficina Principal</span>
              </div>
            </div>

            {/* 🎯 SECCIÓN DE CRÉDITOS DENTRO DEL GRID */}
            <div className="footer-credits">
              <button
                className="credits-link"
                onClick={() => setShowCreditsModal(true)}
              >
                VER TODOS LOS CREDITOS
              </button>
              <p>© 2025 InteliMark - Todos los derechos reservados</p>
            </div>
          </div>

          {/* Sección de créditos removida de aquí y movida arriba */}
        </footer>
      </div>

      {/* � MODAL OFICIAL DE CRÉDITOS - CONTENEDOR TECNOLÓGICO */}
      {showCreditsModal &&
        createPortal(
          <div
            className="credits-modal-overlay"
            onClick={() => setShowCreditsModal(false)}
          >
            <div className="credits-modal-container">
              <button
                className="credits-close-button"
                onClick={() => setShowCreditsModal(false)}
              >
                ✕
              </button>
              <div
                className="credits-tech-frame"
                style={{ backgroundImage: `url(${ContenedorCreditos})` }}
              >
                <div className="credits-screen-content">
                  <div className="credits-title">
                    <h2>CRÉDITOS DEL PROYECTO</h2>
                  </div>
                  <div className="credits-scroll-container">
                    <div className="credits-scroll">
                      <div className="credit-section">
                        <div className="credit-item">
                          <h3>DIRECTOR CREATIVO</h3>
                          <p>Pablo Carrasco · Sandra Gangas</p>
                        </div>
                        <div className="credit-item">
                          <h3>DISEÑADOR UX/UI</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DESARROLLADOR FRONTEND</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DESARROLLADOR BACKEND</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>ARTISTA 3D</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DISEÑADOR DE SONIDO</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DIRECTOR DE ARTE</h3>
                          <p>Pablo Carrasco · Sandra Gangas</p>
                        </div>
                        <div className="credit-item">
                          <h3>ESPECIALISTA SEO</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>ESTRATEGA DE IA</h3>
                          <p>Pablo Carrasco</p>
                        </div>
                        <div className="credit-item">
                          <h3>DISEÑADOR GRÁFICO</h3>
                          <p>Sandra Gangas</p>
                        </div>
                        <div className="credit-item final-credit">
                          <h3>INTELIMARK STUDIOS</h3>
                          <p>© 2025 - Todos los derechos reservados</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
});

Rebecca.displayName = "Rebecca";

export default Rebecca;
