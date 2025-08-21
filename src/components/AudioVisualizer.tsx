// src/components/AudioVisualizer.tsx
import { useState } from "react";
import "./AudioVisualizer.css";

interface AudioVisualizerProps {
  onAudioToggle?: (isActive: boolean) => void;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ onAudioToggle }) => {
  const [isAudioActive, setIsAudioActive] = useState(false);

  const handleToggleAudio = (e?: React.MouseEvent) => {
    // Prevenir propagación para evitar cerrar modales padre
    if (e) {
      e.stopPropagation();
    }

    const newAudioState = !isAudioActive;
    console.log(
      "AudioVisualizer Toggle - Estado actual:",
      isAudioActive,
      "→ Nuevo estado:",
      newAudioState
    );

    setIsAudioActive(newAudioState);

    // Comunicar el cambio al HomePage para que maneje su propio audio
    if (onAudioToggle) {
      onAudioToggle(newAudioState);
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
