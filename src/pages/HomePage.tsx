// Archivo: src/pages/HomePage.tsx (Versión Final y Definitiva)

import {
  Suspense,
  useRef,
  useLayoutEffect,
  useState,
  useCallback,
  useEffect,
  useMemo,
  memo,
} from "react";
import type { FC } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, PerspectiveCamera, Text } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import LogoWithGlitchEffect from "../components/LogoWithGlitchEffect";
import AnimatedTextPhrase1 from "../components/AnimatedTextPhrase1";
import { useFaviconAnimation } from "../hooks/useFaviconAnimation";
import { useTitleAnimation } from "../hooks/useTitleAnimation";
import { useResponsive } from "../hooks/useResponsive";
import "./HomePage.css";

// ✅ Registro explícito de ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// --- Componente del Paisaje 3D Optimizado ---
const LandscapeScene: FC = memo(() => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const texture = useTexture("https://i.imgur.com/kv7xqKt.png");

  // Optimizar textura una sola vez
  useMemo(() => {
    if (texture) {
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [texture]);

  useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-5}>
      {/* Reduced segments for better performance (30,30 instead of 50,50) */}
      <planeGeometry args={[100, 100, 30, 30]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={{
          uTime: { value: 0 },
          uTexture: { value: texture },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform sampler2D uTexture;
          varying vec2 vUv;

          void main() {
            gl_FragColor = texture2D(uTexture, vUv);
          }
        `}
      />
    </mesh>
  );
});

LandscapeScene.displayName = "LandscapeScene";

// --- Componentes de Texto ---
// Componente original - comentado temporalmente mientras usamos AnimatedTextPhrase1
/* 
const TextPhrase1: FC = () => {
  return (
    <group>
      <Text
        position={[0, 7, -46]}
        fontSize={1.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        material-transparent={true}
      >
        Estamos construyendo la pieza inteligente perfecta para la ingeniería.
      </Text>
      <Text
        position={[0, 5, -47]}
        fontSize={1.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        material-transparent={true}
      >
        El lanzamiento está cerca.
      </Text>
      <Text
        position={[0, 2, -48]}
        fontSize={1.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        material-transparent={true}
      >
        ¡Prepárate para una nueva era!
      </Text>
    </group>
  );
};
*/

const TextPhrase2: FC<{ scrollPercentage: number }> = memo(
  ({ scrollPercentage }) => {
    // Función para calcular opacidad basada en rango de scroll
    const calculateOpacity = useCallback(
      (start: number, end: number): number => {
        if (scrollPercentage < start) return 0;
        if (scrollPercentage > end) return 1;
        return (scrollPercentage - start) / (end - start);
      },
      [scrollPercentage]
    );

    // OPTIMIZACIÓN: Memoizar cálculos de opacidad
    const opacidades = useMemo(() => {
      // OPTIMIZACIÓN: Después del 70% mantener visible pero sin cálculos complejos
      const line1Opacity = scrollPercentage > 70 ? 1 : calculateOpacity(45, 55); // Línea 1: 45%-55%
      const line2Opacity = scrollPercentage > 70 ? 1 : calculateOpacity(55, 60); // Línea 2: 55%-60%

      return { line1Opacity, line2Opacity };
    }, [scrollPercentage, calculateOpacity]);

    return (
      <group>
        {/* Línea 1 - Fade-in del 45% al 55% - MOVIDA 1 UNIDAD HACIA ARRIBA */}
        <Text
          position={[0, 5, -140]}
          fontSize={1.728}
          color="white"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={opacidades.line1Opacity}
        >
          NO ES UNA IA GENÉRICA
        </Text>
        {/* Línea 2 - Fade-in del 55% al 60% */}
        <Text
          position={[0, 0, -143]}
          fontSize={1.728}
          color="white"
          anchorX="center"
          anchorY="middle"
          material-transparent={true}
          material-opacity={opacidades.line2Opacity}
        >
          ES UNA IA ENTRENADA PARA LA PRESICIÓN
        </Text>
      </group>
    );
  }
);

TextPhrase2.displayName = "TextPhrase2";

// --- Tipos para props ---
interface HomePageProps {
  scrollContainer?: string; // ID del contenedor de scroll personalizado
  isEmbedded?: boolean; // Indica si está embebido en otro componente
  maxScrollPercentage?: number; // Máximo porcentaje de scroll permitido (para evitar transición)
}

// --- Componente Principal de la Página ---
const HomePage: FC<HomePageProps> = ({
  scrollContainer,
  isEmbedded = false,
  maxScrollPercentage = 100,
}) => {
  // 🎯 RESPONSIVE HOOKS
  const { isMobile, isTablet, performanceConfig, prefersReducedMotion } =
    useResponsive();

  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const sceneRef = useRef<THREE.Group>(null!);
  const mainRef = useRef<HTMLDivElement>(null!);
  const scrollRef = useRef<HTMLDivElement>(null!);
  const canvasRef = useRef<HTMLDivElement>(null!);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDigitalGlitch, setIsDigitalGlitch] = useState(false);
  const portalTriggeredRef = useRef(false); // Evitar múltiples triggers
  const glitchTriggeredRef = useRef(false); // Evitar múltiples triggers del glitch

  // 🎵 SONIDO AMBIENTE
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const [hasStartedAmbientSound, setHasStartedAmbientSound] = useState(false);

  // 🎵 SONIDO DE TRANSICIÓN
  const transitionAudioRef = useRef<HTMLAudioElement | null>(null);

  const navigate = useNavigate();

  // 🎯 CONFIGURACIÓN RESPONSIVE DINÁMICA
  const responsiveConfig = useMemo(() => {
    return {
      // WebGL settings adaptivos
      webgl: {
        antialias: performanceConfig.webgl.antialias,
        precision: performanceConfig.webgl.precision,
        powerPreference: performanceConfig.webgl.powerPreference,
        pixelRatio: performanceConfig.webgl.pixelRatio,
      },
      // Configuración de animaciones
      animations: {
        duration: prefersReducedMotion
          ? 0.01
          : performanceConfig.animations.duration,
        fps: performanceConfig.animations.fps,
        scrollThrottleInterval: isMobile ? 3 : isTablet ? 2 : 1, // Más throttling en móvil
      },
      // Configuración del mouse trail
      mouseTrail: {
        maxPoints: isMobile ? 15 : isTablet ? 25 : 35,
        updateInterval: isMobile ? 32 : isTablet ? 24 : 16, // 30fps, 45fps, 60fps
        particleSize: isMobile ? 8 : isTablet ? 10 : 12,
      },
    };
  }, [isMobile, isTablet, performanceConfig, prefersReducedMotion]);

  // 🎨 ANIMACIONES DE FAVICON Y TÍTULO
  useFaviconAnimation({
    faviconSize: 32,
    colorAnimationDuration: 2500,
    rotationAnimationDuration: 5000,
    orangeColorStart: { r: 218, g: 128, b: 35 },
    orangeColorEnd: { r: 255, g: 201, b: 102 },
  });

  useTitleAnimation({
    staticPart: "InteliMark || ",
    scrollingParts: ["Sitio en construcción... |", "Promocional página DEMO |"],
    separator: "   ",
    visibleWidth: 35,
    updateInterval: 300,
  });

  // 🧹 LIMPIEZA DE WEBGL OPTIMIZADA Y FIX DE CURSOR
  useEffect(() => {
    // ✅ DEBUG: Verificar inicialización en la primera carga
    console.log("🏁 HomePage montado, verificando condiciones iniciales...");
    console.log("📱 isMobile:", isMobile, "isTablet:", isTablet);
    console.log("🎮 prefersReducedMotion:", prefersReducedMotion);
    console.log("📊 performanceConfig:", performanceConfig);

    return () => {
      // Limpiar cache de Three.js y geometrías al desmontar el componente
      try {
        // Limpiar cache de Three.js
        if (THREE.Cache) {
          THREE.Cache.clear();
        }

        // Limpiar cualquier geometría o material en memoria de forma más eficiente
        if (sceneRef.current) {
          sceneRef.current.traverse((child: THREE.Object3D) => {
            if (child instanceof THREE.Mesh) {
              if (child.geometry) child.geometry.dispose();
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((material) => material.dispose());
                } else {
                  child.material.dispose();
                }
              }
            }
          });
        }

        // Forzar garbage collection si está disponible
        if ((window as any).gc) {
          (window as any).gc();
        }
      } catch (error) {
        // Ignorar errores de limpieza
        console.debug("Cleanup WebGL context:", error);
      }
    };
  }, []);

  // ✅ NUEVA VERIFICACIÓN: Detectar problemas de scroll en tiempo real
  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectScrollIssues = () => {
      const scrollElement = scrollRef.current;
      if (scrollElement) {
        const hasHeight = scrollElement.offsetHeight > 0;
        const hasScrollableHeight =
          scrollElement.scrollHeight > scrollElement.clientHeight;

        console.log("📏 Diagnóstico de scroll:", {
          hasHeight,
          hasScrollableHeight,
          offsetHeight: scrollElement.offsetHeight,
          scrollHeight: scrollElement.scrollHeight,
          clientHeight: scrollElement.clientHeight,
        });

        if (!hasHeight || !hasScrollableHeight) {
          console.warn(
            "⚠️ PROBLEMA DETECTADO: Elemento de scroll sin dimensiones adecuadas"
          );
        }
      }
    };

    // Verificar múltiples veces durante la inicialización
    const timeouts = [100, 300, 500, 1000].map((delay) =>
      setTimeout(detectScrollIssues, delay)
    );

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  // � INICIALIZACIÓN DEL SONIDO AMBIENTE
  useEffect(() => {
    console.log("🎵 Inicializando sonido ambiente...");

    // Crear elemento de audio
    const audio = new Audio("/ambient_sound_HomePage.mp3");
    audio.loop = true; // Con loop - reproducir en bucle continuo
    audio.volume = 0.15; // Volumen reducido para ambiente más sutil
    audio.preload = "auto";

    ambientAudioRef.current = audio;

    // NO reproducir automáticamente al cargar - solo con scroll
    console.log(
      "🎵 Audio ambiente configurado, esperando scroll para iniciar..."
    );

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current = null;
      }
    };
  }, []);

  // 🎵 INICIALIZACIÓN DEL SONIDO DE TRANSICIÓN
  useEffect(() => {
    console.log("🎵 Inicializando sonido de transición...");

    // Crear elemento de audio para transición
    const transitionAudio = new Audio("/transition.mp3");
    transitionAudio.volume = 0.4; // Volumen moderado para transición
    transitionAudio.preload = "auto";

    transitionAudioRef.current = transitionAudio;

    return () => {
      if (transitionAudioRef.current) {
        // NO pausar el audio de transición al cambiar de página
        // Permitir que continúe reproduciéndose durante la transición
        console.log(
          "🎵 Manteniendo audio de transición activo durante cambio de página"
        );
        // Solo limpiar la referencia, pero no pausar el audio
        transitionAudioRef.current = null;
      }
    };
  }, []);

  // 🎵 ACTIVAR SONIDO AMBIENTE CON PRIMER SCROLL (ScrollTrigger)
  useEffect(() => {
    if (hasStartedAmbientSound || !ambientAudioRef.current) return;

    // Activar audio cuando scrollPercentage cambie por primera vez (indicando que hay scroll)
    if (scrollPercentage > 0) {
      const startAmbientSound = async () => {
        try {
          await ambientAudioRef.current?.play();
          setHasStartedAmbientSound(true);
          console.log(
            "✅ Sonido ambiente iniciado con scroll (ScrollTrigger detectado)"
          );
        } catch (error) {
          console.log("⚠️ No se pudo iniciar el sonido ambiente:", error);
        }
      };

      startAmbientSound();
    }
  }, [scrollPercentage, hasStartedAmbientSound]);

  // 🎵 PAUSAR AUDIO AL CAMBIAR DE PÁGINA
  useEffect(() => {
    return () => {
      // Pausar audio ambiente al desmontar el componente (cambio de página)
      if (ambientAudioRef.current && hasStartedAmbientSound) {
        ambientAudioRef.current.pause();
        console.log("🎵 Audio ambiente pausado al cambiar de página");
      }
    };
  }, [hasStartedAmbientSound]);

  // �🌟 Estados y referencias para la estela del cursor ULTRA OPTIMIZADA
  const trailPointsRef = useRef<{ x: number; y: number; opacity: number }[]>(
    []
  );
  const trailCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(0);
  const isMouseActiveRef = useRef<boolean>(false);
  const mouseStoppedTimeoutRef = useRef<number | null>(null);

  // 🌀 FUNCIÓN DE TRANSICIÓN PORTAL - Efecto túnel centrado y visible
  const triggerPortalTransition = useCallback(() => {
    const canvas = canvasRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (!canvas || !scene || !camera) return;

    // 🎵 REPRODUCIR SONIDO DE TRANSICIÓN
    if (transitionAudioRef.current) {
      console.log("🎵 Reproduciendo sonido de transición...");
      transitionAudioRef.current.currentTime = 0; // Reiniciar desde el principio

      // Intentar reproducir y configurar auto-stop extendido
      const playTransitionSound = async () => {
        try {
          await transitionAudioRef.current?.play();
          console.log("✅ Sonido de transición iniciado correctamente");

          // Auto-stop del audio después de su duración completa (mantener 3.5s para continuidad)
          setTimeout(() => {
            if (transitionAudioRef.current) {
              transitionAudioRef.current.pause();
              console.log("🎵 Sonido de transición finalizado automáticamente");
            }
          }, 3500); // 3.5 segundos - duración completa del audio (no se corta)
        } catch (error) {
          console.log(
            "⚠️ No se pudo reproducir el sonido de transición (posible política de autoplay):",
            error
          );
          // No intentar fallbacks aquí ya que es un momento específico de transición
        }
      };

      playTransitionSound();
    }

    // Asegurar que la escena esté centrada antes de la animación
    scene.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);

    // Crear timeline específico para el efecto portal
    const portalTimeline = gsap.timeline({
      ease: "power3.out",
      onComplete: () => {
        console.log(
          "🎯 Portal transition complete - Timeline terminado correctamente"
        );
      },
    });

    // ⚡ NAVEGACIÓN OPTIMIZADA: Activar Rebecca después del efecto completo de 2 segundos
    setTimeout(() => {
      navigate("/rebecca");
    }, 2000); // ⚡ Navegación exactamente a los 2s

    // 🎯 ANIMACIÓN DE ESCENA 3D - Efecto "túnel" comprimido a 2 segundos
    portalTimeline
      // 1. Primer impulso: zoom in rápido para iniciar el efecto
      .to(
        camera.position,
        {
          z: -80,
          duration: 0.3, // Comprimido de 0.6 a 0.3
          ease: "power2.in",
        },
        0
      )

      // 2. Escalar gradualmente manteniendo visibilidad en el centro
      .to(
        scene.scale,
        {
          x: 0.1,
          y: 0.1,
          z: 0.1,
          duration: 0.6, // Comprimido de 1.0 a 0.6
          ease: "power2.in",
        },
        0.2
      ) // Ajustado timing

      // 3. Acelerar cámara hacia el "túnel" de forma controlada
      .to(
        camera.position,
        {
          z: -300,
          duration: 0.7, // Comprimido de 1.2 a 0.7
          ease: "power3.in",
        },
        0.4
      ) // Ajustado timing

      // 4. Rotación de vórtex intensa y rápida
      .to(
        scene.rotation,
        {
          z: Math.PI * 2,
          x: Math.PI * 0.3,
          duration: 1.4, // Comprimido de 2.5 a 1.4 pero manteniendo giro visible
          ease: "power2.in",
        },
        0.1
      ) // Inicio más temprano

      // 5. Efecto de "zoom hacia el infinito" para simular túnel
      .to(
        scene.scale,
        {
          x: 0.02,
          y: 0.02,
          z: 0.02,
          duration: 0.5, // Comprimido de 0.8 a 0.5
          ease: "power4.in",
        },
        0.8
      ) // Ajustado timing

      // 6. Flash blanco intenso para transición
      .to(
        canvas,
        {
          filter: "brightness(400%) contrast(300%) blur(2px)",
          duration: 0.3, // Comprimido para sincronizar
          ease: "power2.in",
        },
        1.5
      ) // Sincronizado para terminar en 2s

      // 7. Fade out rápido pero elegante
      .to(
        canvas,
        {
          opacity: 0,
          duration: 0.3, // Comprimido para completar en 2s
          ease: "power3.out",
        },
        1.7
      ); // Timing final ajustado a 2s
  }, [navigate]);

  // 🌟 EFECTO DE ESTELA DEL CURSOR CORREGIDO
  const renderTrail = useCallback(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Limpiar canvas con fade-out suave en lugar de clearRect completo
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Fade-out más gradual
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Dibujar estela si hay puntos suficientes
    if (trailPointsRef.current.length > 1) {
      ctx.globalCompositeOperation = "lighter"; // Modo aditivo para brillo
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Usar todos los puntos disponibles (máximo 8)
      const activePoints = trailPointsRef.current;

      if (activePoints.length > 1) {
        // Crear gradiente para toda la línea
        const firstPoint = activePoints[0];
        const lastPoint = activePoints[activePoints.length - 1];

        const gradient = ctx.createLinearGradient(
          firstPoint.x,
          firstPoint.y,
          lastPoint.x,
          lastPoint.y
        );

        gradient.addColorStop(0, "rgba(218, 128, 35, 0.1)"); // Inicio muy transparente
        gradient.addColorStop(0.5, "rgba(218, 128, 35, 0.4)"); // Medio visible
        gradient.addColorStop(1, "rgba(218, 128, 35, 0.8)"); // Final más opaco

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;

        // Dibujar línea continua
        ctx.beginPath();
        ctx.moveTo(activePoints[0].x, activePoints[0].y);

        for (let i = 1; i < activePoints.length; i++) {
          ctx.lineTo(activePoints[i].x, activePoints[i].y);
        }

        ctx.stroke();

        // Efecto de brillo
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(218, 128, 35, 0.6)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // 3. Reducir opacidad de puntos existentes de forma más conservadora
    trailPointsRef.current = trailPointsRef.current
      .map((point) => ({
        ...point,
        opacity: point.opacity * 0.85, // Reducción más gradual
      }))
      .filter((point) => point.opacity > 0.05); // Umbral más alto

    // 4. Continuar animación si hay puntos o mouse activo
    if (trailPointsRef.current.length > 0 || isMouseActiveRef.current) {
      animationFrameRef.current = requestAnimationFrame(renderTrail);
    } else {
      animationFrameRef.current = 0;
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const currentTime = performance.now();

      // 🎯 THROTTLING RESPONSIVO: Intervalos adaptativos según dispositivo
      const updateInterval = responsiveConfig.mouseTrail.updateInterval;
      if (currentTime - lastUpdateTimeRef.current < updateInterval) return;
      lastUpdateTimeRef.current = currentTime;

      isMouseActiveRef.current = true;

      // Limpiar timeout anterior si el mouse se mueve
      if (mouseStoppedTimeoutRef.current) {
        clearTimeout(mouseStoppedTimeoutRef.current);
      }

      // Debug temporal - verificar que se capturan eventos
      // console.log('Mouse move:', e.clientX, e.clientY, 'Points:', trailPointsRef.current.length);

      // Agregar nuevo punto con opacidad completa
      trailPointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        opacity: 1,
      });

      // 🎯 RESPONSIVE: Limitar puntos según configuración del dispositivo
      const maxPoints = responsiveConfig.mouseTrail.maxPoints;
      if (trailPointsRef.current.length > maxPoints) {
        trailPointsRef.current.shift();
      }

      // Iniciar rendering si no está activo
      if (animationFrameRef.current === 0) {
        animationFrameRef.current = requestAnimationFrame(renderTrail);
      }

      // Configurar timeout para cuando el mouse se detiene
      mouseStoppedTimeoutRef.current = setTimeout(() => {
        isMouseActiveRef.current = false;
      }, 300); // Mouse considerado "detenido" después de 300ms sin movimiento
    },
    [
      renderTrail,
      responsiveConfig.mouseTrail.updateInterval,
      responsiveConfig.mouseTrail.maxPoints,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    isMouseActiveRef.current = false;

    // Limpiar timeout si existe
    if (mouseStoppedTimeoutRef.current) {
      clearTimeout(mouseStoppedTimeoutRef.current);
      mouseStoppedTimeoutRef.current = null;
    }

    // Limpiar trail INMEDIATAMENTE
    trailPointsRef.current = [];

    // Forzar un frame de limpieza total del canvas
    const canvas = trailCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Cancelar cualquier animación pendiente
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
  }, []);

  // 🎯 NUEVO: Hook para coordinar inicialización de Canvas con ScrollTrigger
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const setupScrollTriggerRef = useRef<(() => void) | null>(null);

  // ...existing code...

  // ✅ COORDINACIÓN MEJORADA: Sincronizar Canvas ready con ScrollTrigger setup
  useEffect(() => {
    if (isCanvasReady && setupScrollTriggerRef.current) {
      console.log("🎯 Canvas listo, ejecutando setup de ScrollTrigger...");
      setupScrollTriggerRef.current();
    }
  }, [isCanvasReady]);

  // Configurar canvas y eventos del mouse
  useLayoutEffect(() => {
    const canvas = trailCanvasRef.current;
    const container = mainRef.current;

    if (!canvas || !container) return;

    // Configurar canvas
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    // Eventos del mouse
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);

      // Limpiar timeout si existe
      if (mouseStoppedTimeoutRef.current) {
        clearTimeout(mouseStoppedTimeoutRef.current);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = 0;
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  useLayoutEffect(() => {
    const checkReferences = () => {
      // ✅ VERIFICACIÓN ROBUSTA: Verificar que todos los componentes estén completamente montados
      const hasScene = !!(
        sceneRef.current && sceneRef.current.children.length >= 4
      );
      const hasCamera = !!(cameraRef.current && cameraRef.current.position);
      const hasScrollDiv = !!(
        scrollRef.current && scrollRef.current.offsetHeight > 0
      );

      // ✅ VERIFICACIÓN ADICIONAL: Verificar que los componentes Three.js estén inicializados
      const hasValidChildren =
        hasScene &&
        sceneRef.current.children.every(
          (child) =>
            child &&
            (child.type === "Mesh" || child.type === "Group") &&
            child.position
        );

      return hasScene && hasCamera && hasScrollDiv && hasValidChildren;
    };

    const setupScrollTrigger = (attempt = 1) => {
      // ✅ LÍMITE AUMENTADO: Dar más tiempo para la inicialización completa
      if (!checkReferences()) {
        if (attempt < 10) {
          // Aumentado de 5 a 10 intentos
          setTimeout(() => setupScrollTrigger(attempt + 1), 300); // Aumentado de 200ms a 300ms
        } else {
          console.warn("⚠️ ScrollTrigger setup failed after 10 attempts");
        }
        return;
      }

      console.log("✅ Referencias verificadas, configurando ScrollTrigger...");

      const logoMesh = sceneRef.current.children[1] as THREE.Mesh;
      const textPhrase1 = sceneRef.current.children[2] as THREE.Group;
      const textPhrase2 = sceneRef.current.children[3] as THREE.Group;

      // ✅ LIMPIEZA SEGURA: Eliminar triggers existentes antes de crear nuevos
      ScrollTrigger.killAll();

      const scrollElement = scrollRef.current;

      // 🎯 TIMELINE PRINCIPAL - Solo maneja scroll hasta 70% (o máximo permitido en embebido)
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scrollElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          refreshPriority: -1,
          scroller: scrollContainer ? `#${scrollContainer}` : window,
          onUpdate: (self) => {
            const progress = Math.round(self.progress * 100);

            // 🎯 LIMITAR PROGRESS EN VERSIÓN EMBEBIDA
            const effectiveProgress = isEmbedded
              ? Math.min(progress, maxScrollPercentage)
              : progress;

            // 🚀 THROTTLING RESPONSIVO: Intervalos adaptativos según dispositivo
            const throttleInterval =
              responsiveConfig.animations.scrollThrottleInterval;
            if (
              Math.abs(effectiveProgress - scrollPercentage) >= throttleInterval
            ) {
              setScrollPercentage(effectiveProgress);
            }
          },
        },
      });

      // 🌀 SCROLL TRIGGER SEPARADO PARA PORTAL - Solo activo en 70%+ Y NO EMBEBIDO
      if (!isEmbedded) {
        ScrollTrigger.create({
          trigger: scrollElement,
          start: "top top",
          end: "bottom bottom",
          scroller: scrollContainer ? `#${scrollContainer}` : window,
          onUpdate: (self) => {
            const progress = self.progress * 100;

            // 🔥 Activar efecto de falla digital al 68%
            if (
              progress >= 68 &&
              progress < 70 &&
              !glitchTriggeredRef.current
            ) {
              glitchTriggeredRef.current = true;
              setIsDigitalGlitch(true);

              // Desactivar el efecto después de 600ms (duración de la animación)
              setTimeout(() => {
                setIsDigitalGlitch(false);
              }, 600);
            }

            // Activar portal exactamente al 70% del scroll progress
            if (
              progress >= 70 &&
              !portalTriggeredRef.current &&
              !isTransitioning
            ) {
              portalTriggeredRef.current = true;
              setIsTransitioning(true);
              triggerPortalTransition();
            }
          },
        });
      } else {
        // 🎯 SCROLL TRIGGER PARA VERSIÓN EMBEBIDA - Sin transición de portal
        ScrollTrigger.create({
          trigger: scrollElement,
          start: "top top",
          end: "bottom bottom",
          scroller: scrollContainer ? `#${scrollContainer}` : window,
          onUpdate: (self) => {
            const progress = self.progress * 100;

            // 🎯 LIMITAR SCROLL AL MÁXIMO PERMITIDO (por defecto 65% para evitar portal)
            const clampedProgress = Math.min(progress, maxScrollPercentage);

            // 🔥 Activar efecto de falla digital solo si está dentro del rango permitido
            if (
              clampedProgress >= 60 &&
              clampedProgress < 65 &&
              !glitchTriggeredRef.current &&
              maxScrollPercentage > 65
            ) {
              glitchTriggeredRef.current = true;
              setIsDigitalGlitch(true);

              // Desactivar el efecto después de 600ms
              setTimeout(() => {
                setIsDigitalGlitch(false);
              }, 600);
            }

            // 🚫 NO ACTIVAR PORTAL EN VERSIÓN EMBEBIDA
          },
        });
      }

      // MANTENER todas las animaciones exactamente iguales
      timeline.to(
        cameraRef.current.position,
        {
          y: 2,
          z: -50,
          ease: "none",
        },
        0
      );

      if (logoMesh) {
        timeline.to(
          logoMesh.position,
          {
            z: 50,
            ease: "none",
          },
          0
        );
      }

      if (textPhrase1) {
        const line1 = textPhrase1.children[0];
        const line2 = textPhrase1.children[1];
        const line3 = textPhrase1.children[2];

        if (line1?.position) {
          timeline.to(
            line1.position,
            {
              z: 50,
              ease: "none",
            },
            0
          );
        }

        if (line2?.position) {
          timeline.to(
            line2.position,
            {
              z: 40,
              ease: "none",
            },
            0
          );
        }

        if (line3?.position) {
          timeline.to(
            line3.position,
            {
              z: 35,
              ease: "none",
            },
            0
          );
        }
      }

      if (textPhrase2) {
        const line1 = textPhrase2.children[0];
        const line2 = textPhrase2.children[1];

        if (line1?.position) {
          timeline.to(
            line1.position,
            {
              z: 20,
              ease: "none",
            },
            0
          );
        }

        if (line2?.position) {
          timeline.to(
            line2.position,
            {
              z: 15,
              ease: "none",
            },
            0
          );
        }
      }

      ScrollTrigger.refresh();

      // ✅ VALIDACIÓN FINAL: Verificar que ScrollTrigger se configuró correctamente
      const activeScrollTriggers = ScrollTrigger.getAll();
      console.log(
        `✅ ScrollTrigger configurado exitosamente. Triggers activos: ${activeScrollTriggers.length}`
      );
    };

    // ✅ INICIALIZACIÓN MEJORADA: Usar requestAnimationFrame para mejor sincronización
    const initializeScrollTrigger = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setupScrollTrigger();
        });
      });
    };

    // ✅ INICIALIZACIÓN MEJORADA: Guardar la función para coordinarla con Canvas
    setupScrollTriggerRef.current = initializeScrollTrigger;

    // ✅ DELAY AUMENTADO: Dar más tiempo para que Three.js se inicialice completamente
    const timeoutId = setTimeout(() => {
      // Solo ejecutar si el Canvas no está listo aún (fallback)
      if (!isCanvasReady) {
        console.log(
          "🕒 Timeout fallback: ejecutando setup sin esperar Canvas ready"
        );
        initializeScrollTrigger();
      }
    }, 500); // Aumentado para dar más tiempo

    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.killAll();
      // Reset portal trigger state
      portalTriggeredRef.current = false;
      // Reset glitch trigger state
      glitchTriggeredRef.current = false;
    };
  }, [
    triggerPortalTransition,
    responsiveConfig.animations.scrollThrottleInterval,
    scrollContainer,
    isEmbedded,
    maxScrollPercentage,
  ]); // 🎯 Dependencias corregidas

  return (
    <div ref={mainRef} className="homepage-container">
      {/* Canvas optimizado para la estela del cursor */}
      <canvas ref={trailCanvasRef} className="cursor-trail-canvas" />

      <div
        ref={canvasRef}
        className={`canvas-container ${
          isTransitioning ? "transitioning" : ""
        } ${isDigitalGlitch ? "digital-glitch" : ""}`}
      >
        <Canvas
          gl={{
            preserveDrawingBuffer: false, // Optimización: reducir uso de memoria
            powerPreference: responsiveConfig.webgl.powerPreference, // 🎯 RESPONSIVE: Configuración adaptiva
            antialias: responsiveConfig.webgl.antialias, // 🎯 RESPONSIVE: Antialias adaptivo
            alpha: true,
            stencil: false, // Optimización: desactivar stencil buffer
            depth: true,
            precision: responsiveConfig.webgl.precision, // 🎯 RESPONSIVE: Precisión adaptiva
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            // 🎯 RESPONSIVE: Optimizaciones adicionales del renderer
            gl.setPixelRatio(responsiveConfig.webgl.pixelRatio); // Pixel ratio adaptivo
            gl.outputColorSpace = THREE.SRGBColorSpace;

            // ✅ NUEVA COORDINACIÓN: Señalar que el Canvas está listo
            console.log("🎨 Canvas inicializado correctamente");
            setIsCanvasReady(true);
          }}
        >
          <Suspense fallback={null}>
            <PerspectiveCamera
              ref={cameraRef}
              makeDefault
              position={[0, 10, 30]}
              fov={75}
            />
            <group ref={sceneRef}>
              <LandscapeScene />
              <LogoWithGlitchEffect
                scrollPercentage={scrollPercentage}
                position={[0, 9, 15]}
              />
              <AnimatedTextPhrase1 scrollPercentage={scrollPercentage} />
              <TextPhrase2 scrollPercentage={scrollPercentage} />
            </group>
          </Suspense>
        </Canvas>
      </div>

      {/* Div que genera la barra de scroll */}
      <div className="scroll-content" ref={scrollRef}>
        {/* Contenido de la página - aquí puedes agregar tus elementos */}
      </div>
    </div>
  );
};

export default HomePage;
