import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Error Boundary para el Canvas 3D
class Robot3DErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("🤖 Robot3D Error:", error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🤖 Robot3D Error Details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#da8023",
            fontSize: "16px",
            fontWeight: "bold",
            textAlign: "center",
            background: "rgba(26, 26, 26, 0.8)",
            borderRadius: "10px",
            padding: "20px",
            height: "100%",
          }}
        >
          🤖 Robot no disponible
        </div>
      );
    }

    return this.props.children;
  }
}

interface RobotModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scrollRotation?: number;
}

function RobotModel({
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scrollRotation = 0,
}: RobotModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const rayTarget1 = useRef<THREE.Object3D>(new THREE.Object3D());
  const rayTarget2 = useRef<THREE.Object3D>(new THREE.Object3D());
  const rayTarget3 = useRef<THREE.Object3D>(new THREE.Object3D());
  const rayTarget4 = useRef<THREE.Object3D>(new THREE.Object3D());
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isMouseInside, setIsMouseInside] = React.useState(false);
  const [pulsateIntensity, setPulsateIntensity] = React.useState(1);
  const [thinkingPattern, setThinkingPattern] = React.useState(0);
  const [eyeGlowIntensity, setEyeGlowIntensity] = React.useState(1);
  const [isFooterVisible, setIsFooterVisible] = React.useState(false);

  // Cargar modelo correctamente usando useGLTF hook
  const { scene } = useGLTF("/cabeza_robot.glb");

  // Configurar posiciones de los targets para los rayos
  React.useEffect(() => {
    rayTarget1.current.position.set(0.2, 0.1, 4); // Centro hacia adelante
    rayTarget2.current.position.set(2, -1.5, 3); // Abajo derecha
    rayTarget3.current.position.set(-1.8, -1.5, 3); // Abajo izquierda
    rayTarget4.current.position.set(0.2, -2, 4); // Abajo centro
  }, []);

  // Detectar cuándo el footer es visible usando Intersection Observer
  React.useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        setIsFooterVisible(entry.isIntersecting);
        console.log("🦶 Footer visible:", entry.isIntersecting); // Debug
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: "50px", // Empezar a cargar 50px antes de que sea visible
      threshold: 0.1, // Activar cuando el 10% del footer sea visible
    });

    // Buscar el footer
    const footerElement =
      document.querySelector(".footer-reveal") ||
      document.querySelector("#footer-reveal") ||
      document.querySelector("footer") ||
      document.querySelector(".footer-content");

    if (footerElement) {
      observer.observe(footerElement);
    }

    return () => {
      if (footerElement) {
        observer.unobserve(footerElement);
      }
      observer.disconnect();
    };
  }, []);

  // Crear efecto de pulsación para elementos naranjas - SOLO SI EL FOOTER ES VISIBLE
  // Crear efecto de pulsación para elementos naranjas - SOLO SI EL FOOTER ES VISIBLE
  React.useEffect(() => {
    if (!isFooterVisible) {
      // Si el footer no es visible, resetear valores a estado básico
      setPulsateIntensity(0.1);
      setThinkingPattern(0);
      setEyeGlowIntensity(0.1);
      return;
    }

    const animatePulsation = () => {
      const time = Date.now() * 0.004;

      // Pulsación base para elementos generales
      const basePulse = Math.sin(time) * 0.5 + 0.5;
      const sharpPulse = Math.pow(basePulse, 3);
      const electricNoise = Math.random() * 0.2;
      const intensity = 0.1 + (sharpPulse + electricNoise) * 2.4;
      setPulsateIntensity(Math.min(intensity, 2.5));

      // Efecto de "pensando" para circuitos del cerebro - ondas secuenciales
      const thinkingTime = time * 0.7; // Más lento para efecto cerebral
      const wave1 = Math.sin(thinkingTime) * 0.5 + 0.5;
      const wave2 = Math.sin(thinkingTime + Math.PI * 0.5) * 0.5 + 0.5;
      const wave3 = Math.sin(thinkingTime + Math.PI) * 0.5 + 0.5;
      const thinking = (wave1 + wave2 * 0.7 + wave3 * 0.4) / 2.1;
      setThinkingPattern(thinking);

      // Intensidad especial para el ojo con variaciones más dramáticas
      const eyeTime = time * 1.2;
      const eyePulse = Math.sin(eyeTime) * 0.5 + 0.5;
      const eyeFlicker = Math.sin(eyeTime * 3) * 0.2 + 0.8; // Parpadeo rápido
      setEyeGlowIntensity(eyePulse * eyeFlicker + Math.random() * 0.3);
    };

    const intervalId = setInterval(animatePulsation, 30);
    return () => clearInterval(intervalId);
  }, [isFooterVisible]); // Dependencia del footer visible

  // Aplicar efectos a los materiales naranjas del modelo
  React.useEffect(() => {
    if (scene) {
      scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh && child.material) {
          const material = child.material;

          // Buscar materiales con colores naranjas/rojizos
          if (material.color) {
            const color = material.color;
            const hsl = { h: 0, s: 0, l: 0 };
            color.getHSL(hsl);

            if (hsl.h >= 0 && hsl.h <= 0.15 && hsl.s > 0.5) {
              if (!material.emissive) material.emissive = new THREE.Color();

              // Detectar si es parte del cerebro/circuitos (parte superior) o ojo
              const isEyeArea = child.position.y < 0; // Área del ojo (parte inferior)
              const isBrainArea = child.position.y > 0.2; // Área del cerebro (parte superior)

              let finalIntensity = pulsateIntensity;

              if (isEyeArea) {
                // Efecto especial para el ojo
                finalIntensity = eyeGlowIntensity * 2;
              } else if (isBrainArea) {
                // Efecto de "pensando" para circuitos del cerebro
                finalIntensity = thinkingPattern * 1.8 + 0.3;
              }

              const emissionIntensity = finalIntensity * 1.5;

              material.emissive.setRGB(
                color.r * emissionIntensity * 0.9,
                color.g * emissionIntensity * 0.5,
                color.b * emissionIntensity * 0.1
              );

              material.emissiveIntensity = finalIntensity * 5; // Aún más intenso
              material.roughness = Math.max(0.1, 1 - finalIntensity * 0.6);
              material.metalness = Math.min(1, 0.2 + finalIntensity * 0.5);

              material.needsUpdate = true;
            }
          }
        }
      });
    }
  }, [scene, pulsateIntensity, thinkingPattern, eyeGlowIntensity]);

  // Manejar movimiento del mouse
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Buscar el footer completo usando los selectores correctos
      const footerContainer =
        document.querySelector(".footer-reveal") ||
        document.querySelector("#footer-reveal") ||
        document.querySelector("footer") ||
        document.querySelector(".footer-content");

      if (footerContainer) {
        const rect = footerContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Verificar si el mouse está dentro de todo el footer
        const isInside =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

        setIsMouseInside(isInside);

        if (isInside) {
          // Calcular posición relativa del mouse basada en todo el footer (-1 a 1)
          const x = (event.clientX - centerX) / (rect.width / 2);
          const y = (event.clientY - centerY) / (rect.height / 2);

          // Limitar el rango de movimiento
          const clampedX = Math.max(-1, Math.min(1, x));
          const clampedY = Math.max(-1, Math.min(1, y));

          setMousePosition({ x: clampedX, y: clampedY });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Aplicar rotación basada en scroll y mouse
  useFrame(() => {
    if (meshRef.current) {
      // Rotación Y base por scroll
      let baseRotationY = rotation[1] + scrollRotation;

      // Si el mouse está dentro del contenedor, agregar seguimiento
      if (isMouseInside) {
        // Rotación horizontal basada en posición X del mouse (máximo ±30 grados)
        const mouseRotationY = mousePosition.x * 0.5; // 0.5 radianes ≈ 30 grados
        baseRotationY += mouseRotationY;

        // Rotación vertical basada en posición Y del mouse (máximo ±20 grados)
        const mouseRotationX = mousePosition.y * 0.35;
        meshRef.current.rotation.x = rotation[0] + mouseRotationX;
      } else {
        // Volver a la posición neutral cuando el mouse sale
        meshRef.current.rotation.x = rotation[0];
      }

      meshRef.current.rotation.y = baseRotationY;
    }
  });

  // Si no hay escena, no renderizar nada
  if (!scene) {
    return null;
  }

  return (
    <group>
      {/* Targets invisibles para los rayos */}
      <primitive ref={rayTarget1} object={rayTarget1.current} />
      <primitive ref={rayTarget2} object={rayTarget2.current} />
      <primitive ref={rayTarget3} object={rayTarget3.current} />
      <primitive ref={rayTarget4} object={rayTarget4.current} />

      <primitive
        ref={meshRef}
        object={scene.clone()}
        scale={scale}
        position={position}
        rotation={rotation}
      />

      {/* SISTEMA DE LUCES - SOLO ACTIVO SI EL FOOTER ES VISIBLE */}
      {isFooterVisible && (
        <>
          {/* SISTEMA DE LUCES PARA EL OJO - RAYOS DE LUZ */}
          {/* Luz principal del ojo más intensa */}
          <pointLight
            position={[0.2, 0.1, 0.5]}
            color="#ff3300"
            intensity={eyeGlowIntensity * 15} // Incrementado para mayor visibilidad
            distance={10} // Mayor alcance
            decay={0.3} // Decay muy bajo para rayos largos
          />

          {/* RAYOS DE LUZ DEL OJO - SISTEMA CORREGIDO CON TARGETS */}
          {/* Rayo central hacia adelante */}
          <spotLight
            position={[0.2, 0.1, 0.5]}
            target={rayTarget1.current}
            color="#ff4400"
            intensity={eyeGlowIntensity * 12}
            distance={15}
            angle={Math.PI * 0.15} // Cono cerrado para rayos concentrados
            penumbra={0.2} // Bordes definidos
            decay={0.3}
          />

          {/* Rayo hacia abajo derecha */}
          <spotLight
            position={[0.2, 0.1, 0.5]}
            target={rayTarget2.current}
            color="#ff5500"
            intensity={eyeGlowIntensity * 10}
            distance={12}
            angle={Math.PI * 0.12}
            penumbra={0.3}
            decay={0.4}
          />

          {/* Rayo hacia abajo izquierda */}
          <spotLight
            position={[0.2, 0.1, 0.5]}
            target={rayTarget3.current}
            color="#ff5500"
            intensity={eyeGlowIntensity * 10}
            distance={12}
            angle={Math.PI * 0.12}
            penumbra={0.3}
            decay={0.4}
          />

          {/* Rayo hacia abajo centro */}
          <spotLight
            position={[0.2, 0.1, 0.5]}
            target={rayTarget4.current}
            color="#ff6600"
            intensity={eyeGlowIntensity * 14}
            distance={16}
            angle={Math.PI * 0.1}
            penumbra={0.1}
            decay={0.2}
          />

          {/* LUCES PARA CIRCUITOS DEL CEREBRO - EFECTOS DE PENSAMIENTO */}
          {/* Luces secuenciales para simular actividad cerebral */}
          <pointLight
            position={[-0.3, 0.4, 0.3]} // Lado izquierdo del cerebro
            color="#ff6600"
            intensity={thinkingPattern * 6 + 1}
            distance={2}
            decay={2}
          />

          <pointLight
            position={[0, 0.5, 0.2]} // Centro del cerebro
            color="#ff5500"
            intensity={
              Math.sin(thinkingPattern * Math.PI * 2 + Math.PI / 3) * 3 + 4
            }
            distance={2.5}
            decay={1.8}
          />

          <pointLight
            position={[0.3, 0.4, 0.3]} // Lado derecho del cerebro
            color="#ff4400"
            intensity={
              Math.sin(thinkingPattern * Math.PI * 2 + (Math.PI * 2) / 3) * 4 +
              3
            }
            distance={2}
            decay={2}
          />

          {/* LUCES ADICIONALES PARA CREAR AMBIENTE DE "PENSAMIENTO" */}
          <pointLight
            position={[-0.15, 0.3, 0.4]}
            color="#ff7700"
            intensity={Math.sin(thinkingPattern * Math.PI * 4) * 2 + 2}
            distance={1.5}
            decay={2.5}
          />

          <pointLight
            position={[0.15, 0.3, 0.4]}
            color="#ff6600"
            intensity={Math.cos(thinkingPattern * Math.PI * 3) * 2.5 + 2.5}
            distance={1.5}
            decay={2.5}
          />
        </>
      )}
    </group>
  );
}

// Componente de loading usando Html de drei para renderizar dentro del Canvas
function LoadingSpinner() {
  return (
    <Html center>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#da8023",
          fontSize: "18px",
          fontWeight: "bold",
          textAlign: "center",
          padding: "20px",
        }}
      >
        🤖 Cargando robot...
      </div>
    </Html>
  );
}

interface Robot3DProps {
  width?: string;
  height?: string;
  scale?: number;
  enableScrollRotation?: boolean;
}

const Robot3D: React.FC<Robot3DProps> = ({
  width = "300px",
  height = "300px",
  scale = 15,
  enableScrollRotation = false,
}) => {
  const [scrollRotation, setScrollRotation] = React.useState(0);

  useEffect(() => {
    if (!enableScrollRotation) return;

    const handleScroll = () => {
      // Obtener la posición del scroll
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      // Normalizar el scroll entre -1 y 1
      const normalizedScroll = (scrollY / Math.max(maxScroll, 1)) * 2 - 1;

      // Convertir a rotación (90 grados = ~1.57 radianes)
      const rotationAngle = normalizedScroll * 1.57;

      setScrollRotation(rotationAngle);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enableScrollRotation]);
  return (
    <Robot3DErrorBoundary>
      <div style={{ width, height, pointerEvents: "auto" }}>
        <Canvas
          camera={{
            position: [0, 0, 3.2],
            fov: 50,
            near: 0.1,
            far: 1000,
          }}
          style={{
            background: "transparent",
            borderRadius: "10px",
          }}
          shadows // Activa sombras
          gl={{
            antialias: true, // 🎯 RESTAURADO: Antialiasing para mejor calidad visual
            alpha: true,
            powerPreference: "high-performance", // 🎯 RESTAURADO: GPU dedicada para mejor rendimiento
          }}
          onError={(error: unknown) => {
            console.error("🤖 Canvas Error:", error);
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {/* Iluminación básica simplificada */}
            <ambientLight intensity={0.3} color="#ffffff" />
            <directionalLight
              position={[5, 5, 5]}
              intensity={0.8}
              color="#ffffff"
              castShadow // Activa sombras en la luz
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <directionalLight
              position={[-3, -3, 3]}
              intensity={0.5}
              color="#da8023"
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            {/* Modelo del robot con sombras activas */}
            <RobotModel
              scale={scale}
              position={[0, -1.05, 0]}
              rotation={[0, 0, 0]}
              scrollRotation={scrollRotation}
            />
            {/* Controles de órbita - SIN ZOOM */}
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={true}
              autoRotate={false}
              dampingFactor={0.1} // 🎯 RESTAURADO: Valor original para mejor respuesta
              enableDamping={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI}
            />
            {/* Ambiente local sin HDR externo */}
            <mesh visible={false}>
              <sphereGeometry args={[100, 64, 64]} />
              <meshBasicMaterial color="#1a1a1a" side={THREE.BackSide} />
            </mesh>
          </Suspense>
        </Canvas>
      </div>
    </Robot3DErrorBoundary>
  );
};

// Precargar el modelo
useGLTF.preload("/cabeza_robot.glb");

export default Robot3D;
