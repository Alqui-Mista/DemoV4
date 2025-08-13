// src/components/QuantumGlitchText.tsx
import React, { useRef, useEffect, useState } from 'react';

// Paleta InteliMark
// Eliminamos naranjos para el texto principal y partículas
const grays = [
  '#232323', '#181818', '#444', '#888', '#BDBDBD', '#E0E0E0', '#757575', '#212121', '#616161', '#F5F5F5'
];
const whites = ['#fff', '#F5F5F5', '#FAFAFA', '#ECECEC'];
const blacks = ['#000', '#181818', '#232323'];

function randomFrom(arr: string[]) {
  if (arr.length === 0) return '#fff';
  return arr[Math.floor(Math.random() * arr.length)];
}

interface QuantumGlitchTextProps {
  text: string;
  fontSize?: number;
  style?: React.CSSProperties;
  inactive?: boolean;
}

const QuantumGlitchText: React.FC<QuantumGlitchTextProps> = ({ text, fontSize = 54, style, inactive = false }) => {
  // El Parallax solo se activa si !inactive
  const [glitch, setGlitch] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [glitchLayers, setGlitchLayers] = useState([
    { dx: 0, dy: 0, opacity: 1, color: whites[0] },
    { dx: 0, dy: 0, opacity: 1, color: grays[0] },
    { dx: 0, dy: 0, opacity: 1, color: blacks[0] }
  ]);
  const [particles, setParticles] = useState<any[]>([]);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  // Glitch loop - SOLO SI NO ESTÁ INACTIVE
  useEffect(() => {
    if (inactive) return; // 🎯 ARREGLO: No animar si está inactive
    
    let running = true;
    function animate() {
      if (!running || inactive) return; // 🎯 ARREGLO: Verificar inactive también aquí
      if (glitch || dragging) {
        setGlitchLayers([
          {
            dx: Math.random() * 12 - 6 + offset.x,
            dy: Math.random() * 8 - 4 + offset.y,
            opacity: 0.7 + Math.random() * 0.3,
          color: whites[0]
          },
          {
            dx: Math.random() * 18 - 9 + offset.x,
            dy: Math.random() * 12 - 6 + offset.y,
            opacity: 0.5 + Math.random() * 0.5,
          color: grays[Math.floor(Math.random() * grays.length)]
          },
          {
            dx: Math.random() * 24 - 12 + offset.x,
            dy: Math.random() * 16 - 8 + offset.y,
            opacity: 0.4 + Math.random() * 0.6,
          color: whites[Math.floor(Math.random() * whites.length)]
          }
        ]);
      } else {
        setGlitchLayers([
          { dx: 0, dy: 0, opacity: 1, color: whites[0] },
          { dx: 0, dy: 0, opacity: 1, color: grays[0] },
          { dx: 0, dy: 0, opacity: 1, color: blacks[0] }
        ]);
      }
      requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, [glitch, dragging, offset, inactive]); // 🎯 ARREGLO: Agregar inactive como dependencia

  // Partículas al soltar el drag - SOLO SI NO ESTÁ INACTIVE
  useEffect(() => {
    if (inactive) return; // 🎯 ARREGLO: No crear partículas si está inactive
    
    if (!dragging && offset.x !== 0 && offset.y !== 0) {
      // Lanzar partículas
      const newParticles = Array.from({ length: 18 }, () => ({
        x: 0,
        y: 0,
        dx: Math.random() * 18 - 9,
        dy: Math.random() * 18 - 9,
        color: randomFrom([...grays, ...whites, ...blacks]),
        life: 1.6 + Math.random() * 0.8,
        blur: 2 + Math.random() * 6,
        opacity: 0.18 + Math.random() * 0.22
      }));
      setParticles(newParticles);
      setOffset({ x: 0, y: 0 });
    }
  }, [dragging, inactive]); // 🎯 ARREGLO: Agregar inactive como dependencia

  // Animar partículas
  useEffect(() => {
    if (particles.length === 0) return;
    let running = true;
    function animateParticles() {
      if (!running) return;
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.dx * 0.18,
        y: p.y + p.dy * 0.18,
        life: p.life - 0.04
      })).filter(p => p.life > 0));
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
    return () => { running = false; };
  }, [particles.length]);

  // Mouse events + Parallax
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let draggingLocal = false;
    let startX = 0, startY = 0;
    function onMouseOver() { if (!inactive) setGlitch(true); }
    function onMouseOut() { setGlitch(false); setDragging(false); setOffset({ x: 0, y: 0 }); setParallax({ x: 0, y: 0 }); }
    function onMouseDown(e: MouseEvent) {
      if (!inactive) {
        draggingLocal = true;
        setDragging(true);
        startX = e.clientX;
        startY = e.clientY;
      }
    }
    function onMouseUp() { draggingLocal = false; setDragging(false); }
    function onMouseMove(e: MouseEvent) {
      if (draggingLocal) {
        setOffset({ x: e.clientX - startX, y: e.clientY - startY });
      }
      // Parallax 3D solo si !inactive
      if (el && !inactive) {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 a 1
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setParallax({ x, y });
      } else {
        setParallax({ x: 0, y: 0 });
      }
    }
    el.addEventListener('mouseover', onMouseOver);
    el.addEventListener('mouseout', onMouseOut);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      el.removeEventListener('mouseover', onMouseOver);
      el.removeEventListener('mouseout', onMouseOut);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [inactive]);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
        fontWeight: 900,
        fontSize,
        letterSpacing: '0.04em',
        filter: glitch ? 'brightness(1.12) contrast(1.18) blur(0.5px)' : 'none',
        perspective: '900px',
        ...style
      }}
    >
      {/* Capas RGB y duplicaciones con Parallax 3D */}
      {glitchLayers.map((layer, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: layer.dx,
            top: layer.dy,
            color: layer.color,
            opacity: layer.opacity,
            textShadow: (!inactive ? 'none' : '0 0 2px #000, 0 0 4px #000'), // Resplandor negro, proyección corta
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            userSelect: 'none',
            fontFamily: 'inherit',
            transition: 'all 0.08s cubic-bezier(.7,.2,.2,1)',
            transform: (!inactive ? `translate3d(0,0,0) rotateY(0deg) rotateX(0deg)` : `translate3d(0,0,0) rotateY(${parallax.x * (18 + i * 12)}deg) rotateX(${-parallax.y * (14 + i * 8)}deg)`),
            willChange: 'transform',
          }}
        >{text}</span>
      ))}
      {/* Capa principal con Parallax */}
      <span
        style={{
          position: 'relative',
          color: whites[0],
          textShadow: (!inactive ? 'none' : '0 0 2px #000, 0 0 4px #000'), // Resplandor negro, proyección corta
          fontFamily: 'inherit',
          zIndex: 2,
          pointerEvents: 'none',
          userSelect: 'none',
          transform: (!inactive ? `translate3d(0,0,0) rotateY(0deg) rotateX(0deg)` : `translate3d(0,0,0) rotateY(${parallax.x * 28}deg) rotateX(${-parallax.y * 18}deg)`),
          willChange: 'transform',
        }}
      >{text}</span>
      {/* Fallos digitales: duplicaciones y saltos */}
      {glitch && Array.from({ length: 2 }, (_, i) => (
        <span
          key={'dup-' + i}
          style={{
            position: 'absolute',
            left: Math.random() * 32 - 16,
            top: Math.random() * 18 - 9,
            color: randomFrom([...grays, ...whites, ...blacks]),
            opacity: 0.18 + Math.random() * 0.22,
            textShadow: `0 0 24px ${randomFrom(grays)}, 0 0 32px ${randomFrom(whites)}`,
            fontFamily: 'inherit',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1,
            fontWeight: 900,
            fontSize,
            transition: 'all 0.08s cubic-bezier(.7,.2,.2,1)',
            transform: `translate3d(0,0,0) rotateY(${parallax.x * 16}deg) rotateX(${-parallax.y * 12}deg)`,
            willChange: 'transform',
          }}
        >{text}</span>
      ))}
      {/* Partículas y destellos al soltar */}
      <svg
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
      >
        {particles.map((p, i) => (
          <ellipse
            key={i}
            cx={fontSize / 2 + p.x}
            cy={fontSize / 2 + p.y}
            rx={8 * p.life}
            ry={3 * p.life}
            fill={p.color}
            opacity={p.opacity * p.life}
            style={{ filter: `blur(${p.blur}px)` }}
          />
        ))}
      </svg>
    </div>
  );
};

export default QuantumGlitchText;
