import { useEffect, useRef, useMemo } from "react";
import { useTheme } from "../ThemeContext";

/* ─── Config ─── */
const STAR_COUNT = 120;
const SHOOTING_STAR_INTERVAL = 4000;

/* ─── Generate random stars ─── */
const generateStars = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.2 + 0.5,
    opacity: Math.random() * 0.7 + 0.15,
    twinkleDuration: Math.random() * 4 + 2,
    twinkleDelay: Math.random() * 5,
  }));

/* ─── Neural network node positions ─── */
const NEURAL_NODES = [
  { x: 8, y: 15, r: 3, color: "#06b6d4" },
  { x: 22, y: 35, r: 4, color: "#8b5cf6" },
  { x: 38, y: 12, r: 3.5, color: "#ec4899" },
  { x: 52, y: 42, r: 3, color: "#10b981" },
  { x: 68, y: 18, r: 4, color: "#06b6d4" },
  { x: 82, y: 38, r: 3, color: "#8b5cf6" },
  { x: 92, y: 10, r: 2.5, color: "#f59e0b" },
  { x: 15, y: 65, r: 3, color: "#10b981" },
  { x: 35, y: 72, r: 3.5, color: "#ec4899" },
  { x: 55, y: 58, r: 2.5, color: "#06b6d4" },
  { x: 72, y: 68, r: 3, color: "#8b5cf6" },
  { x: 88, y: 55, r: 4, color: "#f59e0b" },
  { x: 5, y: 85, r: 2, color: "#ec4899" },
  { x: 30, y: 90, r: 3, color: "#06b6d4" },
  { x: 60, y: 82, r: 3.5, color: "#10b981" },
  { x: 78, y: 88, r: 2.5, color: "#8b5cf6" },
  { x: 95, y: 75, r: 3, color: "#06b6d4" },
  { x: 45, y: 28, r: 2, color: "#f59e0b" },
  { x: 75, y: 48, r: 3, color: "#ec4899" },
  { x: 18, y: 50, r: 2.5, color: "#10b981" },
];

/* ─── Neural connections between nodes ─── */
const NEURAL_CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 4], [3, 5],
  [4, 6], [5, 6], [1, 7], [3, 8], [5, 10],
  [7, 8], [8, 9], [9, 10], [10, 11],
  [7, 12], [8, 13], [9, 14], [10, 15], [11, 16],
  [12, 13], [13, 14], [14, 15], [15, 16],
  [2, 17], [4, 18], [1, 19], [17, 3], [18, 5],
  [19, 7], [19, 8], [17, 9], [18, 11],
];

const stars = generateStars(STAR_COUNT);

function CosmicBackground() {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  /* ─── Canvas-based shooting stars ─── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let shootingStars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnShootingStar = () => {
      const startX = Math.random() * canvas.width * 0.8;
      const startY = Math.random() * canvas.height * 0.3;
      shootingStars.push({
        x: startX,
        y: startY,
        len: Math.random() * 80 + 60,
        speed: Math.random() * 6 + 4,
        angle: (Math.random() * 30 + 20) * (Math.PI / 180),
        opacity: 1,
        decay: Math.random() * 0.015 + 0.008,
      });
    };

    const intervalId = setInterval(spawnShootingStar, SHOOTING_STAR_INTERVAL);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      shootingStars = shootingStars.filter((s) => s.opacity > 0.01);

      for (const s of shootingStars) {
        const endX = s.x + Math.cos(s.angle) * s.len;
        const endY = s.y + Math.sin(s.angle) * s.len;

        const gradient = ctx.createLinearGradient(s.x, s.y, endX, endY);
        gradient.addColorStop(0, `rgba(255,255,255,0)`);
        gradient.addColorStop(0.4, `rgba(6,182,212,${s.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(255,255,255,${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow head
        ctx.beginPath();
        ctx.arc(endX, endY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= s.decay;
      }

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(intervalId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={styles.cosmicRoot} aria-hidden="true">
      {/* Deep space gradient base */}
      <div style={styles.spaceGradient} />

      {/* AI-themed background image */}
      <div style={styles.bgImage} />
      <div style={styles.bgImageOverlay} />

      {/* Nebula glows */}
      <div style={styles.nebula1} />
      <div style={styles.nebula2} />
      <div style={styles.nebula3} />
      <div style={styles.nebula4} />

      {/* Twinkling stars (CSS) */}
      {stars.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: "50%",
            background: isDark ? "#fff" : "rgba(6,182,212,0.6)",
            opacity: isDark ? s.opacity : s.opacity * 0.35,
            animation: `cosmicTwinkle ${s.twinkleDuration}s ease-in-out ${s.twinkleDelay}s infinite`,
            boxShadow: isDark
              ? `0 0 ${s.size * 2}px rgba(255,255,255,${s.opacity * 0.5})`
              : `0 0 ${s.size * 2}px rgba(6,182,212,${s.opacity * 0.3})`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Neural network SVG overlay */}
      <svg style={styles.neuralSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Connection lines */}
        {NEURAL_CONNECTIONS.map(([from, to], i) => {
          const a = NEURAL_NODES[from];
          const b = NEURAL_NODES[to];
          return (
            <line
              key={`conn-${i}`}
              x1={a.x} y1={a.y}
              x2={b.x} y2={b.y}
              stroke={isDark ? "rgba(6,182,212,0.07)" : "rgba(6,182,212,0.04)"}
              strokeWidth="0.15"
              style={{
                animation: `cosmicLinePulse ${6 + (i % 5)}s ease-in-out ${(i % 7) * 0.5}s infinite`,
              }}
            />
          );
        })}
        {/* Animated data flow along connections */}
        {NEURAL_CONNECTIONS.filter((_, i) => i % 3 === 0).map(([from, to], i) => {
          const a = NEURAL_NODES[from];
          const b = NEURAL_NODES[to];
          return (
            <circle
              key={`flow-${i}`}
              r="0.3"
              fill={isDark ? "#06b6d4" : "rgba(6,182,212,0.6)"}
              opacity={isDark ? "0.6" : "0.3"}
            >
              <animateMotion
                dur={`${3 + i * 0.7}s`}
                repeatCount="indefinite"
                path={`M${a.x},${a.y} L${b.x},${b.y}`}
              />
            </circle>
          );
        })}
        {/* Nodes */}
        {NEURAL_NODES.map((n, i) => (
          <g key={`node-${i}`}>
            <circle
              cx={n.x} cy={n.y} r={n.r * 0.15}
              fill={n.color}
              opacity={isDark ? 0.5 : 0.25}
              style={{
                animation: `cosmicNodePulse ${4 + (i % 3)}s ease-in-out ${(i % 5) * 0.8}s infinite`,
              }}
            />
            {/* Glow ring */}
            <circle
              cx={n.x} cy={n.y} r={n.r * 0.4}
              fill="none"
              stroke={n.color}
              strokeWidth="0.06"
              opacity={isDark ? 0.15 : 0.08}
              style={{
                animation: `cosmicRingPulse ${5 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* Shooting stars canvas */}
      <canvas ref={canvasRef} style={styles.shootingCanvas} />

      {/* Horizontal scan line */}
      <div style={styles.scanLine} />

      {/* Grid overlay */}
      <div style={styles.gridOverlay} />

      {/* Vignette edges */}
      <div style={styles.vignette} />
    </div>
  );
}

/* ─── Styles ─── */
const getStyles = (isDark) => ({
  cosmicRoot: {
    position: "fixed",
    inset: 0,
    overflow: "hidden",
    pointerEvents: "none",
    zIndex: 0,
  },
  spaceGradient: {
    position: "absolute",
    inset: 0,
    background: isDark
      ? "radial-gradient(ellipse 120% 80% at 50% -20%, #0a1628 0%, #05060b 50%, #020204 100%)"
      : "radial-gradient(ellipse 120% 80% at 50% -20%, #e8f4fd 0%, #f0f2f7 50%, #e5e7eb 100%)",
    transition: "background 0.6s ease",
  },
  bgImage: {
    position: "absolute",
    inset: 0,
    backgroundImage: "url('/ai-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    opacity: isDark ? 0.35 : 0.12,
    mixBlendMode: isDark ? "screen" : "multiply",
    transition: "opacity 0.6s ease",
    zIndex: 0,
  },
  bgImageOverlay: {
    position: "absolute",
    inset: 0,
    background: isDark
      ? "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(5,6,11,0.7) 100%)"
      : "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(245,247,250,0.8) 100%)",
    zIndex: 0,
    transition: "background 0.6s ease",
  },
  nebula1: {
    position: "absolute",
    top: "-15%",
    left: "-10%",
    width: "60%",
    height: "60%",
    borderRadius: "50%",
    background: isDark
      ? "radial-gradient(circle, rgba(6,182,212,0.15) 0%, rgba(6,182,212,0.05) 30%, transparent 70%)"
      : "radial-gradient(circle, rgba(6,182,212,0.08) 0%, rgba(6,182,212,0.03) 30%, transparent 70%)",
    filter: "blur(60px)",
    animation: "cosmicNebulaFloat1 20s ease-in-out infinite",
  },
  nebula2: {
    position: "absolute",
    bottom: "-20%",
    right: "-10%",
    width: "55%",
    height: "55%",
    borderRadius: "50%",
    background: isDark
      ? "radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.04) 30%, transparent 70%)"
      : "radial-gradient(circle, rgba(139,92,246,0.07) 0%, rgba(139,92,246,0.02) 30%, transparent 70%)",
    filter: "blur(70px)",
    animation: "cosmicNebulaFloat2 25s ease-in-out infinite",
  },
  nebula3: {
    position: "absolute",
    top: "40%",
    right: "5%",
    width: "35%",
    height: "35%",
    borderRadius: "50%",
    background: isDark
      ? "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)"
      : "radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)",
    filter: "blur(50px)",
    animation: "cosmicNebulaFloat1 18s ease-in-out infinite reverse",
  },
  nebula4: {
    position: "absolute",
    top: "15%",
    left: "55%",
    width: "40%",
    height: "40%",
    borderRadius: "50%",
    background: isDark
      ? "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)"
      : "radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 65%)",
    filter: "blur(55px)",
    animation: "cosmicNebulaFloat2 22s ease-in-out 3s infinite reverse",
  },
  neuralSvg: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 1,
    opacity: isDark ? 1 : 0.6,
  },
  shootingCanvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 2,
    opacity: isDark ? 1 : 0.3,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    width: "100%",
    height: "1px",
    background: isDark
      ? "linear-gradient(90deg, transparent 5%, rgba(6,182,212,0.12) 30%, rgba(139,92,246,0.08) 70%, transparent 95%)"
      : "linear-gradient(90deg, transparent 5%, rgba(6,182,212,0.06) 30%, rgba(139,92,246,0.04) 70%, transparent 95%)",
    animation: "cosmicScanDown 10s linear infinite",
    zIndex: 3,
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: isDark
      ? "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)," +
        "linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)"
      : "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px)," +
        "linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
    backgroundSize: "60px 60px",
    animation: "cosmicGridFade 12s ease-in-out infinite",
    zIndex: 2,
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background: isDark
      ? "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(2,2,4,0.6) 100%)"
      : "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(224,226,232,0.4) 100%)",
    zIndex: 3,
  },
});

/* ─── Inject CSS Keyframes (once) ─── */
if (typeof document !== "undefined") {
  const id = "cosmic-bg-animations";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes cosmicTwinkle {
        0%, 100% { opacity: 0.15; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.4); }
      }

      @keyframes cosmicNebulaFloat1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(20px, -15px) scale(1.04); }
        66% { transform: translate(-15px, 10px) scale(0.96); }
      }

      @keyframes cosmicNebulaFloat2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        33% { transform: translate(-18px, 12px) scale(0.97); }
        66% { transform: translate(14px, -10px) scale(1.03); }
      }

      @keyframes cosmicLinePulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.8; }
      }

      @keyframes cosmicNodePulse {
        0%, 100% { opacity: 0.3; r: inherit; }
        50% { opacity: 0.8; }
      }

      @keyframes cosmicRingPulse {
        0%, 100% { opacity: 0.1; transform-origin: center; }
        50% { opacity: 0.3; }
      }

      @keyframes cosmicScanDown {
        0% { top: -2%; opacity: 0; }
        5% { opacity: 1; }
        95% { opacity: 1; }
        100% { top: 102%; opacity: 0; }
      }

      @keyframes cosmicGridFade {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }

      /* Mobile performance: reduce star count visually */
      @media (max-width: 640px) {
        .cosmic-star:nth-child(n+60) {
          display: none;
        }
      }
    `;
    document.head.appendChild(s);
  }
}

export default CosmicBackground;
