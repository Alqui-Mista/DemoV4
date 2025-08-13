// src/pages/Rebecca.tsx (Versión Final con Efectos de Texto)

import { useEffect, useRef, useState, memo } from "react";
import { VapiChatButton } from "../components/VapiChatButton";
import { vapiConfig } from "../config/vapi.config";
import HomePage from "./HomePage";
import Robot3D from "../components/Robot3D";
import { useFaviconAnimation } from "../hooks/useFaviconAnimation";
import { useTitleAnimation } from "../hooks/useTitleAnimation";
import FuenteCero from "../components/FuenteCero";
import "./Rebecca.css";

const Rebecca = memo(() => {
  // Estados para la sección CTA
  const [ctaScrollPercent, setCtaScrollPercent] = useState(0); // 0 a 1
  // Observer para detectar el porcentaje de visibilidad de la sección CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setCtaScrollPercent(entry.intersectionRatio);
        });
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // 0.00 a 1.00
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
  }, []);
  const containerRef = useRef<HTMLDivElement>(null!);
  const tooltipRef = useRef<HTMLDivElement>(null!);
  const buttonTooltipRef = useRef<HTMLDivElement>(null!);
  const [isHovering, setIsHovering] = useState(false);

  const [isActive, setIsActive] = useState(false);
  const [showHomePage, setShowHomePage] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const home3dAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isEffectActive, setIsEffectActive] = useState(false);
  const ctaSectionRef = useRef<HTMLElement>(null);

  useFaviconAnimation();
  useTitleAnimation();

  // useEffect para controlar la visibilidad del cursor CAD completo
  useEffect(() => {
    const cursorCrossElement = document.querySelector(".cursor-cross");
    const mainContainer = containerRef.current;

    if (isEffectActive) {
      cursorCrossElement?.classList.add("hidden-by-effect");
      mainContainer?.classList.add("fuente-cero-active");
    } else {
      cursorCrossElement?.classList.remove("hidden-by-effect");
      mainContainer?.classList.remove("fuente-cero-active");
    }
  }, [isEffectActive]);

  // Eliminado observer antiguo para animaciones de textos en CTA

  useEffect(() => {
    console.log("🎯 Rebecca montada - restaurando posición al inicio...");
    const isInitialMount = window.scrollY === 0;
    if (isInitialMount) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      console.log("✅ Posición de scroll restaurada:", window.scrollY);
    } else {
      console.log("📍 Manteniendo posición actual de scroll:", window.scrollY);
    }
  }, []);

  // Estados para la sección CTA
  // Estados para la sección CTA (ya definidos y usados en el render)

  useEffect(() => {
    console.log("🎵 Inicializando sonido HOME 3D...");
    const audio = new Audio("/home3d_bottom.mp3");
    audio.volume = 0.5;
    audio.preload = "auto";
    home3dAudioRef.current = audio;
    return () => {
      if (home3dAudioRef.current) {
        home3dAudioRef.current.pause();
        home3dAudioRef.current = null;
      }
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let hasMovedOnce = false;

    const cursorCross = document.createElement("div");
    cursorCross.className = "cursor-cross";

    // ✅ FIX: Agregar al container específico en lugar de body
    container.appendChild(cursorCross);

    // 🎯 NUEVO SISTEMA: Definir zonas de cursor de forma eficiente
    let currentZone = "default"; // default, cta, footer, home3d
    let zoneElements = {
      cta: null as Element | null,
      footer: null as Element | null,
      home3d: null as Element | null,
    };
    let lastZoneCheck = 0;
    const ZONE_CHECK_THROTTLE = 16; // 60fps máximo para detectar zonas

    // Cachear elementos para evitar querySelector repetitivos
    const cacheZoneElements = () => {
      zoneElements.cta = document.querySelector(".call-to-action-section");
      zoneElements.footer = document.querySelector(
        ".footer-reveal, #footer-reveal, footer, .footer-content"
      );
      zoneElements.home3d = document.querySelector(
        "#interactive-container.active"
      );
    };

    const detectZone = (e: MouseEvent): string => {
      // Throttling para detectar zona (optimización de rendimiento)
      const now = performance.now();
      if (now - lastZoneCheck < ZONE_CHECK_THROTTLE) {
        return currentZone; // Devolver zona actual si es muy pronto para verificar
      }
      lastZoneCheck = now;

      // Prioridad 1: HOME 3D (más alta)
      if (isActive) return "home3d";

      // Cachear elementos si no existen o si han pasado 1000ms
      if (
        !zoneElements.cta ||
        !zoneElements.footer ||
        now % 1000 < ZONE_CHECK_THROTTLE
      ) {
        cacheZoneElements();
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
      switch (zone) {
        case "home3d":
          // Cursor normal del sistema en HOME 3D
          container.classList.remove("custom-cursor");
          cursorCross.classList.remove("visible");
          break;
        case "cta":
          // Sin cursor CAD en CTA (tiene su propio cursor de punto de luz)
          container.classList.remove("custom-cursor");
          cursorCross.classList.remove("visible");
          break;
        case "footer":
          // Cursor CAD activo en footer
          container.classList.add("custom-cursor");
          cursorCross.classList.add("visible");
          break;
        case "default":
          // Cursor CAD activo en sección principal
          container.classList.add("custom-cursor");
          cursorCross.classList.add("visible");
          break;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const newZone = detectZone(e);

      // Solo aplicar cambios si la zona cambió (optimización)
      if (newZone !== currentZone) {
        currentZone = newZone;
        applyCursorForZone(newZone);
      }

      // Actualizar posición solo si el cursor CAD debe estar visible
      if (currentZone === "default" || currentZone === "footer") {
        // Usar requestAnimationFrame para optimizar las actualizaciones de CSS
        requestAnimationFrame(() => {
          container.style.setProperty("--cursor-x", `${e.clientX}px`);
          container.style.setProperty("--cursor-y", `${e.clientY}px`);

          cursorCross.style.setProperty("--cursor-x", `${e.clientX}px`);
          cursorCross.style.setProperty("--cursor-y", `${e.clientY}px`);
        });

        if (
          !hasMovedOnce &&
          (currentZone === "default" || currentZone === "footer")
        ) {
          hasMovedOnce = true;
        }
      }
    };

    const handleMouseLeave = () => {
      container.classList.remove("custom-cursor");
      cursorCross.classList.remove("visible");
      currentZone = "default";
    };

    const handleMouseEnter = () => {
      // Re-cachear elementos al entrar (por si la página cambió)
      cacheZoneElements();

      // Forzar cursor visible para inicialización rápida
      currentZone = "default";
      applyCursorForZone("default");
    };

    // Event listeners
    document.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);

    // ✅ FIX: Inicializar cursor inmediatamente
    currentZone = "default";
    applyCursorForZone("default");

    // ✅ FIX: Simular movimiento inicial para mostrar cursor
    setTimeout(() => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      requestAnimationFrame(() => {
        container.style.setProperty("--cursor-x", `${centerX}px`);
        container.style.setProperty("--cursor-y", `${centerY}px`);
        cursorCross.style.setProperty("--cursor-x", `${centerX}px`);
        cursorCross.style.setProperty("--cursor-y", `${centerY}px`);
      });
    }, 100);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);

      // ✅ FIX: Limpiar cursor de manera más robusta
      if (cursorCross && cursorCross.parentNode) {
        cursorCross.parentNode.removeChild(cursorCross);
      }

      // ✅ FIX: Limpiar clases del container
      container.classList.remove("custom-cursor");

      // ✅ FIX: Resetear cursor global
      document.body.style.cursor = "";
    };
  }, [isActive]); // 🎯 ARREGLO: Agregar isActive como dependencia

  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll(".fade-in-delayed").forEach((el) => {
        el.classList.add("fade-in-active");
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
    <div ref={containerRef} className="rebecca-container">
      <div id="message-box"></div>

      <div className="main-content-wrapper">
        <div
          id="interactive-container"
          className={isActive ? "active" : ""}
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
              onClick={(e) => {
                e.stopPropagation();
                // Reproducir sonido al cerrar
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
                setIsHoveringButton(false); // 🎯 ARREGLO: Resetear estado del tooltip
              }}
            >
              <div className="homepage-embedded">
                <HomePage
                  scrollContainer="homepage-scroll-container"
                  isEmbedded={true}
                  maxScrollPercentage={65}
                />
              </div>
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

        <div className="vapi-content">
          <VapiChatButton config={vapiConfig} variant="center" size="large" />
        </div>

        <div
          className="portal-effects"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="glow-ring"></div>
          <div className="pulse-ring"></div>
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
        onMouseEnter={() => setIsEffectActive(true)}
        onMouseLeave={() => setIsEffectActive(false)}
      >
        {isEffectActive && <FuenteCero parentRef={ctaSectionRef} />}

        <div className="cta-content">
          <h2
            className="cta-title"
            style={{
              textAlign: "center",
              position: "relative",
              minHeight: "120px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end", // alineación derecha
              justifyContent: "flex-start", // arriba
              gap: "12px", // menos separación
              paddingTop: "18px", // desplazamiento hacia arriba
            }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateX(${
                  -window.innerWidth * 0.7 +
                  (Math.min(ctaScrollPercent, 0.9) / 0.9) *
                    window.innerWidth *
                    0.7
                }px)`,
                opacity: ctaScrollPercent >= 0.3 ? 1 : 0,
                transition: "transform 0.1s linear, opacity 0.2s",
                fontFamily: "SohoPro, Montserrat, Arial, sans-serif",
                fontWeight: 900,
                fontStyle: "italic",
                fontVariationSettings: '"wght" 900',
                letterSpacing: "0.04em",
                zIndex: 10,
                lineHeight: 0.95,
                fontSize: "80.6px",
                color: "#ffffff",
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
              }}
            >
              TRABAJEMOS
            </span>
            <span
              style={{
                display: "inline-block",
                transform: `translateX(${
                  window.innerWidth * 0.7 -
                  (Math.min(ctaScrollPercent, 0.9) / 0.9) *
                    window.innerWidth *
                    0.7
                }px)`,
                opacity: ctaScrollPercent >= 0.3 ? 1 : 0,
                transition: "transform 0.1s linear, opacity 0.2s",
                fontFamily: "SohoPro, Montserrat, Arial, sans-serif",
                fontWeight: 900,
                fontStyle: "italic",
                fontVariationSettings: '"wght" 900',
                letterSpacing: "0.04em",
                zIndex: 10,
                lineHeight: 0.95,
                textTransform: "uppercase",
                fontSize: "80.6px",
                color: "#ffffff",
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
              }}
            >
              JUNTOS
            </span>
          </h2>
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
                  className="newsletter-button"
                >
                  →
                </button>
              </form>
              <p id="boletinMensaje"></p>
            </div>

            <div className="navigation-section">
              <button
                className="homepage-access-button ai-matrix-button"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                <div className="ai-matrix-container">
                  <div className="ai-core">
                    <div className="ai-brain-icon">
                      <div className="neural-network">
                        <div className="neuron n1"></div>
                        <div className="neuron n2"></div>
                        <div className="neuron n3"></div>
                        <div className="neuron n4"></div>
                        <div className="neural-connection c1"></div>
                        <div className="neural-connection c2"></div>
                        <div className="neural-connection c3"></div>
                      </div>
                    </div>
                  </div>

                  <div className="data-matrix">
                    <div className="data-stream ds1">01010101</div>
                    <div className="data-stream ds2">11001100</div>
                    <div className="data-stream ds3">10110110</div>
                  </div>

                  <div className="hologram-layers">
                    <div className="holo-layer layer1"></div>
                    <div className="holo-layer layer2"></div>
                    <div className="holo-layer layer3"></div>
                  </div>

                  <div className="energy-field">
                    <div className="energy-particle p1"></div>
                    <div className="energy-particle p2"></div>
                    <div className="energy-particle p3"></div>
                    <div className="energy-particle p4"></div>
                  </div>

                  <div className="holo-text">
                    <span className="text-glitch" data-text="VOLVER AL INICIO">
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
        </div>
      </footer>
    </div>
  );
});

Rebecca.displayName = "Rebecca";

export default Rebecca;
