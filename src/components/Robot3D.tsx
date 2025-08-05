import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

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
    console.error('🤖 Robot3D Error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🤖 Robot3D Error Details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#da8023',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          background: 'rgba(26, 26, 26, 0.8)',
          borderRadius: '10px',
          padding: '20px',
          height: '100%'
        }}>
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

function RobotModel({ scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], scrollRotation = 0 }: RobotModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Cargar modelo correctamente usando useGLTF hook
  const { scene } = useGLTF('/robot_seee/scene.gltf');
  
  // Aplicar rotación basada en scroll
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation[1] + scrollRotation;
    }
  });
  
  // Si no hay escena, no renderizar nada
  if (!scene) {
    return null;
  }
  
  return (
    <primitive 
      ref={meshRef}
      object={scene.clone()} 
      scale={scale} 
      position={position}
      rotation={rotation}
    />
  );
}

// Componente de loading usando Html de drei para renderizar dentro del Canvas
function LoadingSpinner() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#da8023',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '20px'
      }}>
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
  width = '300px', 
  height = '300px', 
  scale = 15,
  enableScrollRotation = false 
}) => {
  const [scrollRotation, setScrollRotation] = React.useState(0);

  useEffect(() => {
    if (!enableScrollRotation) return;

    const handleScroll = () => {
      // Obtener la posición del scroll
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Normalizar el scroll entre -1 y 1
      const normalizedScroll = (scrollY / Math.max(maxScroll, 1)) * 2 - 1;
      
      // Convertir a rotación (90 grados = ~1.57 radianes) - MUCHO MÁS VISIBLE
      const rotationAngle = normalizedScroll * 1.57;
      
      console.log('Scroll Y:', scrollY, 'Normalized:', normalizedScroll, 'Rotation:', rotationAngle);
      
      setScrollRotation(rotationAngle);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollRotation]);
  return (
    <Robot3DErrorBoundary>
      <div style={{ width, height, pointerEvents: 'auto' }}>
        <Canvas
          camera={{ 
            position: [0, 0, 0.90], 
            fov: 90,
            near: 0.1,
            far: 1000 
          }}
          style={{ 
            background: 'transparent',
            borderRadius: '10px'
          }}
          onError={(error) => {
            console.error('🤖 Canvas Error:', error);
          }}
        >
        <Suspense fallback={<LoadingSpinner />}>
          {/* Iluminación mejorada */}
          <ambientLight intensity={0.8} color="#ffffff" />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.5} 
            color="#ffffff"
            castShadow
          />
          <directionalLight 
            position={[-5, -5, 5]} 
            intensity={0.8} 
            color="#da8023"
          />
          <pointLight 
            position={[-5, 0, 5]} 
            intensity={1.0} 
            color="#da8023"
          />
          <pointLight 
            position={[5, 0, -5]} 
            intensity={0.6} 
            color="#ffffff"
          />
          
          {/* Modelo del robot */}
          <RobotModel 
            scale={scale}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scrollRotation={scrollRotation}
          />
          
          {/* Controles de órbita para interacción con mouse */}
          <OrbitControls 
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            autoRotate={false}
            dampingFactor={0.1}
            enableDamping={true}
            minDistance={0.90}
            maxDistance={1.2}
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
useGLTF.preload('/robot_seee/scene.gltf');

export default Robot3D;
