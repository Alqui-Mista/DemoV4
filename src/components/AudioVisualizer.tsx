// src/components/AudioVisualizer.tsx
import { useState, useEffect, useRef } from "react";
import "./AudioVisualizer.css";

interface AudioVisualizerProps {
  onAudioToggle?: (isActive: boolean) => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ onAudioToggle }) => {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Crear elemento de audio para sonido ambiente
    audioRef.current = new Audio("/ambient_sound_HomePage.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.15;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleToggleAudio = async () => {
    try {
      const newAudioState = !isAudioActive;

      if (newAudioState) {
        if (audioRef.current) {
          await audioRef.current.play();
        }
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }

      setIsAudioActive(newAudioState);

      if (onAudioToggle) {
        onAudioToggle(newAudioState);
      }
    } catch (error) {
      console.warn("Error al reproducir audio:", error);
    }
  };

  return (
    <div className="audio-visualizer-container">
      {!isAudioActive ? (
        // Estado inactivo: Texto elegante
        <button
          className="audio-activate-button"
          onClick={handleToggleAudio}
          aria-label="Activar sonido 3D"
        >
          <span className="audio-text">ACTIVAR SONIDO 3D</span>
          <div className="text-glow"></div>
        </button>
      ) : (
        // Estado activo: Visualizador de audio animado
        <button
          className="audio-visualizer-active"
          onClick={handleToggleAudio}
          aria-label="Desactivar sonido 3D"
        >
          <div className="visualizer-bars">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`bar bar-${index + 1}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              />
            ))}
          </div>
          <div className="visualizer-reflection">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`bar-reflection bar-reflection-${index + 1}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              />
            ))}
          </div>
        </button>
      )}
    </div>
  );
};

export default AudioVisualizer;
