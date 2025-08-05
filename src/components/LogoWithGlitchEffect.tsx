import { useRef, useMemo, memo } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface LogoWithGlitchEffectProps {
  scrollPercentage: number;
  position?: [number, number, number];
}

const LogoWithGlitchEffect: FC<LogoWithGlitchEffectProps> = memo(({
  scrollPercentage,
  position = [0, 9, 15]
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const texture = useTexture('/src/assets/logo_InteliMark.png');

  // Configurar la textura para CALIDAD PREMIUM
  useMemo(() => {
    if (texture) {
      // Filtros de alta calidad con mipmaps
      texture.minFilter = THREE.LinearMipmapLinearFilter; // Calidad premium con mipmaps
      texture.magFilter = THREE.LinearFilter; // Mantener para ampliación
      texture.generateMipmaps = true; // CRÍTICO: Habilitar mipmaps para anti-aliasing
      
      // Filtrado anisótropo para máxima nitidez en ángulos
      texture.anisotropy = 16; // Máximo valor común para calidad premium
      
      // Configuración adicional para calidad premium
      texture.format = THREE.RGBAFormat;
      texture.type = THREE.UnsignedByteType;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
    }
  }, [texture]);

  // Vertex Shader simplificado
  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  // Fragment Shader SIMPLIFICADO - SOLO PIXELACIÓN
  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uPixelationAmount;
    uniform float uTime;
    
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // EFECTO DE PIXELACIÓN CON ESPACIOS VACÍOS - INTENSIDAD AUMENTADA 20%
      if(uPixelationAmount > 0.0) {
        float pixelSize = 1.0 + uPixelationAmount * 93.6; // Aumentado de 78.0 a 93.6 (+20%)
        vec2 pixelCoord = floor(uv * pixelSize) / pixelSize;
        uv = mix(uv, pixelCoord, uPixelationAmount);
        
        // Crear patrón de píxeles faltantes (30% de píxeles vacíos/negros - aumentado a 30%)
        vec2 pixelPos = floor(uv * pixelSize);
        float pixelHash = fract(sin(dot(pixelPos, vec2(12.9898, 78.233))) * 43758.5453);
        
        // 30% de píxeles se vuelven negros/transparentes (aumentado de 24% a 30%)
        if(pixelHash < 0.30 && uPixelationAmount > 0.3) {
          uv = vec2(-1.0); // Coordenada inválida para obtener negro/transparente
        }
      }
      
      // Sample final de la textura con manejo de píxeles vacíos
      vec4 texColor;
      if(uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
        // Píxeles vacíos se vuelven negros/transparentes
        texColor = vec4(0.0, 0.0, 0.0, 0.0);
      } else {
        texColor = texture2D(uTexture, uv);
      }
      gl_FragColor = texColor;
    }
  `;

  // Uniforms para pixelación únicamente
  const uniforms = useMemo(() => {
    return {
      uTexture: { value: texture },
      uPixelationAmount: { value: 0 },
      uTime: { value: 0 }
    };
  }, [texture]);

  // Actualizar uniforms basado en el scroll - SOLO PIXELACIÓN
  useMemo(() => {
    if (!materialRef.current) return;

    // OPTIMIZACIÓN: Después del 15% apagar TODO para liberar recursos (logo ya no visible)
    if (scrollPercentage > 15) {
      materialRef.current.uniforms.uPixelationAmount.value = 0;
      return;
    }

    // EFECTO DE PIXELACIÓN: 10%-12% de scroll (efecto intenso y rápido)
    let pixelationProgress = 0;
    if (scrollPercentage >= 10 && scrollPercentage <= 12) {
      pixelationProgress = (scrollPercentage - 10) / 2; // 2% de rango para efecto muy rápido e intenso
    }
    
    // Actualizar uniform
    materialRef.current.uniforms.uPixelationAmount.value = pixelationProgress;
    
  }, [scrollPercentage]);

  // Animación en tiempo real simplificada
  useFrame((_, delta) => {
    // OPTIMIZACIÓN: Solo actualizar si hay efectos activos (antes del 15%)
    if (materialRef.current && scrollPercentage <= 15) {
      materialRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh ref={meshRef} position={position as [number, number, number]}>
      <planeGeometry args={[8, 4]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
        depthWrite={false}
      />
    </mesh>
  );
});

LogoWithGlitchEffect.displayName = 'LogoWithGlitchEffect';

export default LogoWithGlitchEffect;
