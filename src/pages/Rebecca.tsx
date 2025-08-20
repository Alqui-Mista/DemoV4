// src/pages/Rebecca.tsx (Versión Optimizada para Performance)

import { useEffect, useRef, useState, memo } from "react";
import { VapiChatButton } from "../components/VapiChatButton";
import { vapiConfig } from "../config/vapi.config";
import HomePage from "./HomePage";
import Robot3D from "../components/Robot3D";
import FuenteCero from "../components/FuenteCero";
import { useTitleAnimation } from "../hooks/useTitleAnimation";
import { useFaviconAnimation } from "../hooks/useFaviconAnimation";
import CTAButtonImage from "../assets/CTAButtom.png"; // Importar imagen del botón CTA
import "./Rebecca.css";

const Rebecca = memo(() => {
  useFaviconAnimation();
  useTitleAnimation();

  // Estados para la sección CTA
  const [ctaScrollPercent, setCtaScrollPercent] = useState(0); // 0 a 1

  // Observer para detectar el porcentaje de visibilidad de la sección CTA
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setCtaScrollPercent(entry.intersectionRatio);
          // Activar/desactivar lluvia de códigos según visibilidad
          if (entry.intersectionRatio >= 0.3) {
            setIsEffectActive(true);
          } else {
            setIsEffectActive(false);
          }
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
  // Ref para reflejar el estado actual de showHomePage dentro del efecto
  const showHomePageRef = useRef(false);
  useEffect(() => {
    showHomePageRef.current = showHomePage;
  }, [showHomePage]);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const home3dAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isEffectActive, setIsEffectActive] = useState(false);
  const ctaSectionRef = useRef<HTMLElement>(null);

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
        case "cta":
          container.classList.remove("custom-cursor");
          cursorCross.classList.remove("visible");
          cursorCross.style.display = "none";
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
      if (currentZone === "default" || currentZone === "footer") {
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
              <div className="homepage-embedded">
                <HomePage
                  scrollContainer="homepage-scroll-container"
                  isEmbedded={true}
                  maxScrollPercentage={60}
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
              alignItems: "flex-end", // alineación derecha
              justifyContent: "center", // centrado vertical
              gap: "clamp(8px, 2vw, 12px)",
              width: "100%",
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
                fontSize: "clamp(3rem, 8vw, 5.5rem)" /* Responsive font-size */,
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
                fontSize: "clamp(3rem, 8vw, 5.5rem)" /* Responsive font-size */,
                color: "#ffffff",
                textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)",
              }}
            >
              JUNTOS
            </span>
          </h2>

          {/* Espacio reservado para el subtítulo que se agregará después */}
          <div className="cta-subtitle-space">
            {/* Aquí irá el subtítulo */}
          </div>

          {/* Botón CTA */}
          <div className="cta-button-container">
            <img
              src={CTAButtonImage}
              alt="CTA Button"
              className="cta-button-image"
              style={{
                maxWidth: "clamp(200px, 25vw, 300px)",
                height: "auto",
                cursor: "pointer",
                opacity: "0.5" /* Más transparente en estado inactivo */,
                transform: "scale(0.85)" /* Más pequeño en estado inactivo */,
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  "scale(1.15)"; /* Agrandamiento significativo */
                e.currentTarget.style.opacity =
                  "1"; /* Opacidad 100% en hover */
                e.currentTarget.style.filter =
                  "drop-shadow(0 12px 24px rgba(0, 0, 0, 0.5))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform =
                  "scale(0.85)"; /* Volver a estado pequeño */
                e.currentTarget.style.opacity =
                  "0.5"; /* Volver a opacidad reducida */
                e.currentTarget.style.filter =
                  "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))";
              }}
            />
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
                  <div className="arrow-container">
                    <svg className="arrow-icon" viewBox="0 0 42 30" fill="none">
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
                            stopColor="#ff2800"
                            stopOpacity="1"
                          />
                          <stop
                            offset="15%"
                            stopColor="#ff3300"
                            stopOpacity="1"
                          />
                          <stop
                            offset="35%"
                            stopColor="#ff4500"
                            stopOpacity="1"
                          />
                          <stop
                            offset="55%"
                            stopColor="#ff6b35"
                            stopOpacity="0.95"
                          />
                          <stop
                            offset="75%"
                            stopColor="#ff8c45"
                            stopOpacity="0.9"
                          />
                          <stop
                            offset="90%"
                            stopColor="#ffab69"
                            stopOpacity="0.85"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ffd700"
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
                            stopColor="#ff6b35"
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="50%"
                            stopColor="#ff8c45"
                            stopOpacity="0.25"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ffab69"
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
                            stopColor="#ffd700"
                            stopOpacity="0.4"
                          />
                          <stop
                            offset="40%"
                            stopColor="#ff8c45"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="60%"
                            stopColor="#ff4500"
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="80%"
                            stopColor="#ff3300"
                            stopOpacity="0.1"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ff2800"
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
                            stopColor="#ff8c45"
                            stopOpacity="0.1"
                          />
                          <stop
                            offset="70%"
                            stopColor="#ff6b35"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ff4500"
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
                  <div className="neon-glow"></div>
                </button>
              </form>
              <p id="boletinMensaje"></p>
            </div>

            <div className="navigation-section">
              <button
                className="homepage-access-button ai-matrix-button debug-button-position"
                style={{
                  marginLeft: "5px", // 🎯 MOVIDO 5px HACIA LA IZQUIERDA (10px - 5px = 5px)
                  transform: "translateY(-65px)",
                  position: "relative",
                  zIndex: 999,
                }}
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

        {/* 🎯 SECCIÓN DE CRÉDITOS */}
        <div className="footer-credits">
          <p>© 2025 InteliMark - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
});

Rebecca.displayName = "Rebecca";

export default Rebecca;
