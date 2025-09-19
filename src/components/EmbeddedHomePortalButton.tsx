import React, {
  lazy,
  Suspense,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import "./EmbeddedHomePortalButton.css";

const LazyHomePage = lazy(() => import("../pages/HomePage"));

export const EmbeddedHomePortalButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Bloquear scroll fondo cuando open fullscreen
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const toggle = useCallback(() => {
    if (!open) {
      setMounted(true); // montar antes de animar
      requestAnimationFrame(() => {
        // Resetear scroll del contenedor embebido antes de abrir
        if (scrollerRef.current) scrollerRef.current.scrollTop = 0;
        setOpen(true);
      });
    } else {
      setOpen(false);
      // esperar animación antes de desmontar para liberar recursos
      setTimeout(() => setMounted(false), 600);
    }
  }, [open]);

  return (
    <div className={`embedded-home-portal-wrapper ${open ? "active" : ""}`}>
      {!open && (
        <button
          aria-label={open ? "Cerrar portal HomePage" : "Abrir portal HomePage"}
          aria-expanded={open}
          className={`embedded-home-portal-button ${open ? "active" : ""}`}
          onClick={toggle}
        >
          {!open && <span className="portal-dot" />}
          <span className="portal-label">HOME</span>
        </button>
      )}
      {mounted && (
        <div className={`embedded-home-overlay ${open ? "open" : "closing"}`}>
          <div className="embedded-home-overlay-content">
            <div className="embedded-home-scroll-wrapper" ref={scrollerRef}>
              <Suspense
                fallback={<div className="embedded-loading">Cargando...</div>}
              >
                <LazyHomePage
                  mode="embedded"
                  /* Paridad completa con HomePage */
                  disableAudio={false}
                  disablePortalTransition={false}
                  maxScrollPercentage={100}
                  compact={false}
                />
              </Suspense>
            </div>
            <button
              className="close-portal-btn"
              onClick={toggle}
              aria-label="Cerrar portal"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbeddedHomePortalButton;
