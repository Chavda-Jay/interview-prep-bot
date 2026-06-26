import { useState, useMemo, useEffect } from "react";
import { startInterview } from "../services/api";
import { useTheme } from "../ThemeContext";
import CosmicBackground from "../components/CosmicBackground";
import { getUserMemory } from "../services/api";

/* ─── Real SVG Technology Logos ─── */
const PythonLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pyA" x1="12.96%" x2="79.64%" y1="12.04%" y2="93.06%">
        <stop offset="0%" stopColor="#387EB8" />
        <stop offset="100%" stopColor="#366994" />
      </linearGradient>
      <linearGradient id="pyB" x1="19.13%" x2="90.43%" y1="20.58%" y2="88.72%">
        <stop offset="0%" stopColor="#FFC836" />
        <stop offset="100%" stopColor="#FFD43B" />
      </linearGradient>
    </defs>
    <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z" fill="url(#pyA)" />
    <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="url(#pyB)" />
  </svg>
);

const ReactLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="-11.5 -10.23174 23 20.46348" xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
    <g stroke="#61DAFB" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

const JavaScriptLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="256" rx="20" fill="#F7DF1E" />
    <path d="M67.312 213.932l19.59-11.856c3.78 6.701 7.218 12.371 15.465 12.371 7.905 0 12.89-3.092 12.89-15.12v-81.798h24.057v82.138c0 24.917-14.606 36.259-35.916 36.259-19.245 0-30.416-9.967-36.087-21.996M152.381 211.354l19.588-11.341c5.157 8.421 11.859 14.607 23.715 14.607 9.969 0 16.325-4.984 16.325-11.858 0-8.248-6.53-11.17-17.528-15.98l-6.013-2.58c-17.357-7.387-28.87-16.667-28.87-36.257 0-18.044 13.747-31.792 35.228-31.792 15.294 0 26.292 5.328 34.196 19.247L210.29 147.43c-4.125-7.389-8.591-10.31-15.465-10.31-7.046 0-11.514 4.468-11.514 10.31 0 7.217 4.468 10.14 14.778 14.608l6.014 2.577c20.45 8.765 31.963 17.7 31.963 37.804 0 21.654-17.012 33.51-39.867 33.51-22.339 0-36.774-10.654-43.819-24.574" fill="#000" />
  </svg>
);

const JavaLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 256 346" xmlns="http://www.w3.org/2000/svg">
    <path d="M82.554 267.473s-13.198 7.675 9.393 10.272c27.369 3.122 41.356 2.675 71.517-3.034 0 0 7.93 4.972 19.003 9.279-67.611 28.977-153.019-1.679-99.913-16.517M74.292 229.659s-14.803 10.958 7.805 13.296c29.236 3.016 52.324 3.263 92.276-4.43 0 0 5.526 5.602 14.215 8.666-81.747 23.904-172.842 1.885-114.296-17.532" fill="#5382A1" />
    <path d="M143.942 165.515c16.66 19.18-4.377 36.44-4.377 36.44s42.301-21.837 22.874-49.183c-18.144-25.5-32.059-38.172 43.268-81.858 0 0-118.238 29.53-61.765 94.6" fill="#E76F00" />
    <path d="M233.364 295.442s9.767 8.047-10.757 14.273c-39.026 11.823-162.432 15.393-196.714.471-12.323-5.36 10.787-12.8 18.056-14.362 7.581-1.644 11.914-1.337 11.914-1.337-13.705-9.655-88.583 18.957-38.034 27.15 137.853 22.356 251.292-10.066 215.535-26.195M88.9 190.48s-62.771 14.91-22.228 20.323c17.118 2.292 51.243 1.774 83.03-.89 25.978-2.19 52.063-6.85 52.063-6.85s-9.16 3.923-15.787 8.448c-63.744 16.765-186.886 8.966-151.435-8.183 29.981-14.492 54.358-12.848 54.358-12.848M201.506 253.422c64.8-33.672 34.839-66.03 13.927-61.67-5.126 1.066-7.411 1.99-7.411 1.99s1.903-2.98 5.537-4.27c41.37-14.545 73.187 42.897-13.355 65.647 0 0 1.003-.895 1.302-1.697" fill="#5382A1" />
    <path d="M162.439.371s35.888 35.9-34.037 91.101c-56.071 44.282-12.786 69.53-.02 98.377-32.73-29.53-56.75-55.526-40.635-79.72C111.395 74.612 176.918 57.393 162.439.37" fill="#E76F00" />
    <path d="M95.268 344.665c62.199 3.982 157.712-2.209 159.974-31.64 0 0-4.348 11.158-51.404 20.018-53.088 9.99-118.564 8.824-157.399 2.421 0 0 7.95 6.58 48.83 9.201" fill="#5382A1" />
  </svg>
);

const NodeLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 256 289" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ng1" x1="68%" x2="27.8%" y1="17.5%" y2="89.8%">
        <stop offset="0%" stopColor="#41873F" />
        <stop offset="100%" stopColor="#3FAE2A" />
      </linearGradient>
      <linearGradient id="ng2" x1="43.2%" x2="55.3%" y1="55.2%" y2="52.4%">
        <stop offset="0%" stopColor="#41873F" />
        <stop offset="100%" stopColor="#3FAE2A" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="ng3" x1="57.6%" x2="27%" y1="18.2%" y2="68.4%">
        <stop offset="0%" stopColor="#3FAE2A" stopOpacity="0" />
        <stop offset="100%" stopColor="#3FAE2A" />
      </linearGradient>
    </defs>
    <path fill="url(#ng1)" d="M128 0 L256 74v148L128 296 0 222V74z" />
    <path fill="url(#ng2)" d="M128 0 L256 74v148L128 296 0 222V74z" opacity="0.3" />
    <text x="128" y="175" textAnchor="middle" fill="white"
      fontSize="100" fontWeight="800" fontFamily="Inter,sans-serif">N</text>
  </svg>
);


const SQLLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="32" cy="14" rx="26" ry="10" fill="none" stroke="#00BCF2" strokeWidth="2.5" />
    <path d="M6 14v36c0 5.523 11.64 10 26 10s26-4.477 26-10V14" fill="none" stroke="#00BCF2" strokeWidth="2.5" />
    <path d="M6 27c0 5.523 11.64 10 26 10s26-4.477 26-10" fill="none" stroke="#00BCF2" strokeWidth="2.5" opacity="0.5" />
    <path d="M6 40c0 5.523 11.64 10 26 10s26-4.477 26-10" fill="none" stroke="#00BCF2" strokeWidth="2.5" opacity="0.35" />
    <text x="32" y="36" textAnchor="middle" fill="#00BCF2" fontSize="11" fontWeight="700" fontFamily="Inter,sans-serif">SQL</text>
  </svg>
);

/* ─── Skill & Level Config ─── */
const skills = [
  { name: "Python", Logo: PythonLogo, color: "#3776AB", glow: "rgba(55,118,171,0.25)" },
  { name: "React", Logo: ReactLogo, color: "#61DAFB", glow: "rgba(97,218,251,0.25)" },
  { name: "JavaScript", Logo: JavaScriptLogo, color: "#F7DF1E", glow: "rgba(247,223,30,0.2)" },
  { name: "Java", Logo: JavaLogo, color: "#E76F00", glow: "rgba(231,111,0,0.25)" },
  { name: "Node.js", Logo: NodeLogo, color: "#3FAE2A", glow: "rgba(63,174,42,0.25)" },
  { name: "SQL", Logo: SQLLogo, color: "#00BCF2", glow: "rgba(0,188,242,0.25)" },
];

const levels = [
  { name: "beginner", label: "Beginner", desc: "Just getting started", gradient: "linear-gradient(135deg, #10b981, #06b6d4)" },
  { name: "intermediate", label: "Intermediate", desc: "Know the basics well", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  { name: "advanced", label: "Advanced", desc: "Deep expertise", gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
];

function Home({ onStart, user, onLogout }) {
  const { isDark } = useTheme();
  const styles = useMemo(() => getStyles(isDark), [isDark]);
  const [skill, setSkill] = useState("Python");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [hoveredLevel, setHoveredLevel] = useState(null);
  const [btnHover, setBtnHover] = useState(false);
  const [userMemory, setUserMemory] = useState(null);
  const [memoryLoading, setMemoryLoading] = useState(false);

  useEffect(() => {
    const fetchMemory = async () => {
      if (!user?.name) return;
      setMemoryLoading(true);
      try {
        const res = await getUserMemory(user.name);
        if (res.data.exists) {
          setUserMemory(res.data);
        } else {
          setUserMemory(null);
        }
      } catch (err) {
        setUserMemory(null);
      }
      setMemoryLoading(false);
    };
    fetchMemory();
  }, [user?.name]);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await startInterview({ user_name: user?.name || "Guest", skill, level });
      onStart({ ...res.data, totalQuestions: 10 });
    } catch (err) {
      alert("Error starting interview!");
    }
    setLoading(false);
  };

  const currentSkill = skills.find((s) => s.name === skill);

  return (
    <div style={styles.page}>
      {/* Cosmic starry background */}
      <CosmicBackground />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.pillBadge}>
            <span style={styles.pillDot} />
            AI-Powered Interview Practice
          </div>
          <h1 style={styles.title}>
            Interview<span style={styles.titleAccent}>AI</span>
          </h1>
          <p style={styles.tagline}>
            Sharpen your skills with real-time AI feedback. Pick a technology, set your level, and ace your next interview.
          </p>
        </div>

        {/* User Info Bar */}
        <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "28px",
            padding: "16px 24px", borderRadius: "16px",
            background: isDark ? "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))" : "linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))",
            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
            width: "100%", maxWidth: "540px", boxSizing: "border-box",
            boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.2)" : "0 8px 32px rgba(0,0,0,0.05)",
            backdropFilter: "blur(10px)",
            animation: "fadeInUp 0.6s var(--ease-out) both",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                    width: "44px", height: "44px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: "18px", fontWeight: "bold",
                    boxShadow: "0 4px 14px rgba(139,92,246,0.35)",
                    border: "2px solid rgba(255,255,255,0.2)"
                }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                    <div style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "13px", fontWeight: "500", marginBottom: "2px" }}>
                        Welcome back,
                    </div>
                    <div style={{ color: isDark ? "#f1f5f9" : "#1e293b", fontSize: "18px", fontWeight: "700", letterSpacing: "-0.3px" }}>
                        {user?.name || "Guest"}
                    </div>
                </div>
            </div>
            <button
                onClick={onLogout}
                style={{
                    padding: "8px 18px", borderRadius: "10px",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)",
                    color: isDark ? "#cbd5e1" : "#475569", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer",
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                    e.currentTarget.style.color = "#ef4444";
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.6)";
                    e.currentTarget.style.color = isDark ? "#cbd5e1" : "#475569";
                    e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
                }}
            >
                Sign Out
            </button>
        </div>

        {/* Card */}
        <div style={styles.card}>
          {/* Welcome Back Card */}
          {userMemory && (
            <div style={styles.memoryCard}>
              <div style={styles.memoryHeader}>
                <span style={styles.memoryEmoji}>👋</span>
                <div>
                  <p style={styles.memoryTitle}>Welcome back, {user?.name || "Guest"}!</p>
                  <p style={styles.memorySubtitle}>
                    {userMemory.total_sessions} sessions completed
                  </p>
                </div>
                <span style={{
                  ...styles.trendBadge,
                  color: userMemory.trend === "improving" ? "#10b981" :
                    userMemory.trend === "declining" ? "#ef4444" : "#f59e0b",
                  background: userMemory.trend === "improving" ? "rgba(16,185,129,0.1)" :
                    userMemory.trend === "declining" ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
                }}>
                  {userMemory.trend === "improving" ? "📈 Improving" :
                    userMemory.trend === "declining" ? "📉 Needs Work" : "➡️ Stable"}
                </span>
              </div>

              <div style={styles.memoryStats}>
                <div style={styles.memoryStat}>
                  <span style={styles.memoryStatNum}>{userMemory.last_percentage}%</span>
                  <span style={styles.memoryStatLabel}>Last Score</span>
                </div>
                <div style={styles.memoryStat}>
                  <span style={styles.memoryStatNum}>{userMemory.best_score}%</span>
                  <span style={styles.memoryStatLabel}>Best Score</span>
                </div>
                <div style={styles.memoryStat}>
                  <span style={styles.memoryStatNum}>{userMemory.last_skill}</span>
                  <span style={styles.memoryStatLabel}>Last Skill</span>
                </div>
              </div>

              {userMemory.weak_areas?.length > 0 && (
                <div style={styles.memoryWeak}>
                  <span style={styles.memoryWeakLabel}>⚠️ Focus Areas:</span>
                  <div style={styles.memoryWeakTags}>
                    {userMemory.weak_areas.slice(0, 3).map((w, i) => (
                      <span key={i} style={styles.memoryWeakTag}>{w}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Skill Selection ── */}
          <div style={styles.section}>
            <label style={styles.label}>Technology Stack</label>
            <div style={styles.skillGrid}>
              {skills.map((s, i) => {
                const isActive = skill === s.name;
                const isHovered = hoveredSkill === s.name;
                const LogoComponent = s.Logo;
                return (
                  <button
                    id={`skill-${s.name.toLowerCase().replace('.', '')}`}
                    key={s.name}
                    style={{
                      ...styles.skillCard,
                      ...(isActive
                        ? {
                          ...styles.skillCardActive,
                          borderColor: `${s.color}55`,
                          boxShadow: `0 0 28px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
                        }
                        : {}),
                      ...(isHovered && !isActive
                        ? {
                          ...styles.skillCardHover,
                          borderColor: `${s.color}30`,
                          boxShadow: `0 0 20px ${s.glow}, 0 8px 25px rgba(0,0,0,0.3)`,
                        }
                        : {}),
                      animationDelay: `${i * 70}ms`,
                    }}
                    onClick={() => setSkill(s.name)}
                    onMouseEnter={() => setHoveredSkill(s.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                  >
                    <div style={{
                      ...styles.skillLogoWrap,
                      ...(isActive ? { background: `${s.color}18`, transform: "scale(1.08)" } : {}),
                      ...(isHovered && !isActive ? { background: `${s.color}10`, transform: "scale(1.05)" } : {}),
                    }}>
                      <LogoComponent size={24} />
                    </div>
                    <span style={{
                      ...styles.skillName,
                      ...(isActive ? { color: s.color } : {}),
                      ...(isHovered && !isActive ? { color: `${s.color}cc` } : {}),
                    }}>
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Level Selection ── */}
          <div style={styles.section}>
            <label style={styles.label}>Difficulty</label>
            <div style={styles.levelGrid}>
              {levels.map((l, i) => {
                const isActive = level === l.name;
                const isHovered = hoveredLevel === l.name;
                return (
                  <button
                    id={`level-${l.name}`}
                    key={l.name}
                    style={{
                      ...styles.levelCard,
                      ...(isActive ? styles.levelCardActive : {}),
                      ...(isHovered && !isActive ? styles.levelCardHover : {}),
                      animationDelay: `${i * 80}ms`,
                    }}
                    onClick={() => setLevel(l.name)}
                    onMouseEnter={() => setHoveredLevel(l.name)}
                    onMouseLeave={() => setHoveredLevel(null)}
                  >
                    {/* Active / Hover indicator bar */}
                    <div style={{
                      ...styles.levelBar,
                      background: isActive
                        ? l.gradient
                        : isHovered
                          ? l.gradient
                          : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)",
                      width: isActive ? "32px" : isHovered ? "24px" : "28px",
                      opacity: isActive ? 1 : isHovered ? 0.6 : 1,
                    }} />
                    <span style={{
                      ...styles.levelLabel,
                      ...(isActive ? { color: isDark ? "#f1f5f9" : "#1e293b" } : {}),
                      ...(isHovered && !isActive ? { color: isDark ? "#cbd5e1" : "#334155" } : {}),
                    }}>
                      {l.label}
                    </span>
                    <span style={{
                      ...styles.levelDesc,
                      ...(isHovered && !isActive ? { color: isDark ? "#64748b" : "#475569" } : {}),
                    }}>
                      {l.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Divider ── */}
          <div style={styles.divider} />

          {/* ── Start Button ── */}
          <button
            id="start-interview-btn"
            style={{
              ...styles.startBtn,
              ...(loading ? styles.startBtnDisabled : {}),
              ...(btnHover && !loading ? styles.startBtnHover : {}),
            }}
            onClick={handleStart}
            disabled={loading}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
          >
            {loading ? (
              <span style={styles.btnContent}>
                <span style={styles.spinner} />
                Preparing your session...
              </span>
            ) : (
              <span style={styles.btnContent}>
                Launch Interview
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </button>

          {/* ── Footer features ── */}
          <div style={styles.features}>
            <div style={styles.feature}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a3 3 0 0 0 0-6h-1" />
                <path d="M6 10H5a3 3 0 0 0 0 6h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H5" />
                <path d="M12 16v2a4 4 0 0 1-4 4" />
                <path d="M12 16v2a4 4 0 0 0 4 4" />
              </svg>
              My AI Interview Coach
            </div>
            <div style={styles.featureSep}>·</div>
            <div style={styles.feature}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Practice. Improve. Succeed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  STYLES                                     */
/* ─────────────────────────────────────────── */

const getStyles = (isDark) => ({
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background: isDark ? "#05060b" : "#f5f7fa",
    transition: "background 0.4s ease",
  },
  container: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  /* ── Header ── */
  header: {
    textAlign: "center",
    marginBottom: "36px",
    animation: "fadeInUp 0.7s var(--ease-out) both",
  },
  pillBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    borderRadius: "var(--radius-full)",
    background: isDark ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.1)",
    border: isDark ? "1px solid rgba(6,182,212,0.15)" : "1px solid rgba(6,182,212,0.2)",
    color: "#06b6d4",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.4px",
    marginBottom: "20px",
  },
  pillDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#06b6d4",
    animation: "pulse 2s ease-in-out infinite",
  },
  title: {
    fontSize: "clamp(32px, 8vw, 44px)",
    fontWeight: "900",
    color: isDark ? "#f1f5f9" : "#1e293b",
    letterSpacing: "-1.5px",
    lineHeight: "1.1",
    marginBottom: "14px",
    fontFamily: "'Inter', sans-serif",
    transition: "color 0.4s ease",
  },
  titleAccent: {
    background: "linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundSize: "200% 200%",
    animation: "gradientRotate 4s ease infinite",
  },
  tagline: {
    color: isDark ? "#94a3b8" : "#64748b",
    fontSize: "15px",
    fontWeight: "400",
    maxWidth: "420px",
    lineHeight: "1.65",
    margin: "0 auto",
    transition: "color 0.4s ease",
  },
  memoryCard: {
    background: isDark ? "rgba(6,182,212,0.05)" : "rgba(6,182,212,0.06)",
    border: isDark ? "1px solid rgba(6,182,212,0.15)" : "1px solid rgba(6,182,212,0.2)",
    borderRadius: "14px", padding: "16px",
    marginBottom: "20px",
    animation: "fadeInUp 0.4s ease both",
  },
  memoryHeader: {
    display: "flex", alignItems: "center", gap: "12px",
    marginBottom: "12px",
  },
  memoryEmoji: { fontSize: "24px" },
  memoryTitle: {
    fontSize: "14px", fontWeight: "700",
    color: isDark ? "#f1f5f9" : "#1e293b",
    margin: 0,
  },
  memorySubtitle: {
    fontSize: "12px", color: "#06b6d4",
    margin: 0, marginTop: "2px",
  },
  trendBadge: {
    marginLeft: "auto", padding: "4px 10px",
    borderRadius: "9999px", fontSize: "11px",
    fontWeight: "700",
  },
  memoryStats: {
    display: "flex", gap: "16px",
    marginBottom: "12px",
    padding: "12px",
    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    borderRadius: "10px",
  },
  memoryStat: {
    display: "flex", flexDirection: "column",
    alignItems: "center", flex: 1,
  },
  memoryStatNum: {
    fontSize: "18px", fontWeight: "800",
    color: "#06b6d4",
    fontFamily: "'JetBrains Mono', monospace",
  },
  memoryStatLabel: {
    fontSize: "10px", color: isDark ? "#4b5563" : "#94a3b8",
    fontWeight: "600", marginTop: "2px",
    textTransform: "uppercase", letterSpacing: "0.4px",
  },
  memoryWeak: {
    display: "flex", alignItems: "center", gap: "8px",
    flexWrap: "wrap",
  },
  memoryWeakLabel: {
    fontSize: "11px", fontWeight: "700",
    color: "#f59e0b",
  },
  memoryWeakTags: { display: "flex", gap: "6px", flexWrap: "wrap" },
  memoryWeakTag: {
    padding: "3px 8px", borderRadius: "9999px",
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.15)",
    color: "#f59e0b", fontSize: "11px", fontWeight: "600",
  },

  /* ── Card ── */
  card: {
    background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
    borderRadius: "20px",
    padding: "clamp(24px, 6vw, 36px)",
    width: "100%",
    maxWidth: "540px",
    boxSizing: "border-box",
    boxShadow: isDark
      ? "0 20px 80px rgba(0,0,0,0.5), 0 0 60px rgba(6,182,212,0.06), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 20px 80px rgba(0,0,0,0.08), 0 0 60px rgba(6,182,212,0.03), inset 0 1px 0 rgba(255,255,255,0.6)",
    animation: "fadeInUp 0.8s var(--ease-out) 0.15s both",
    transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
  },

  /* ── Sections ── */
  section: {
    marginBottom: "26px",
  },
  label: {
    display: "block",
    marginBottom: "10px",
    fontSize: "13px",
    fontWeight: "600",
    color: isDark ? "#94a3b8" : "#475569",
    letterSpacing: "0.3px",
    transition: "color 0.4s ease",
  },

  /* ── Skills ── */
  skillGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: "10px",
  },
  skillCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px 8px 14px",
    borderRadius: "14px",
    border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
    cursor: "pointer",
    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
    fontFamily: "'Inter', sans-serif",
    animation: "fadeInUp 0.5s var(--ease-out) both",
  },
  skillCardHover: {
    borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    transform: "translateY(-4px) scale(1.03)",
  },
  skillCardActive: {
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(6,182,212,0.06)",
    transform: "translateY(-2px) scale(1.02)",
  },
  skillLogoWrap: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  skillName: {
    fontSize: "12px",
    fontWeight: "600",
    color: isDark ? "#94a3b8" : "#475569",
    letterSpacing: "0.2px",
    transition: "color 0.35s ease",
  },

  /* ── Levels ── */
  levelGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: "10px",
  },
  levelCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "18px 10px 14px",
    borderRadius: "14px",
    border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
    background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    fontFamily: "'Inter', sans-serif",
    animation: "fadeInUp 0.55s var(--ease-out) both",
    position: "relative",
    overflow: "hidden",
  },
  levelCardHover: {
    borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    transform: "translateY(-3px) scale(1.02)",
    boxShadow: isDark
      ? "0 8px 28px rgba(0,0,0,0.3), 0 0 20px rgba(139,92,246,0.06)"
      : "0 8px 28px rgba(0,0,0,0.08), 0 0 20px rgba(139,92,246,0.04)",
  },
  levelCardActive: {
    borderColor: "rgba(139,92,246,0.3)",
    background: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.08)",
    boxShadow: isDark ? "0 0 30px rgba(139,92,246,0.08)" : "0 0 30px rgba(139,92,246,0.06)",
    transform: "translateY(-2px) scale(1.01)",
  },
  levelBar: {
    width: "28px",
    height: "3px",
    borderRadius: "2px",
    marginBottom: "6px",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  },
  levelLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: isDark ? "#cbd5e1" : "#1e293b",
    transition: "color 0.3s ease",
  },
  levelDesc: {
    fontSize: "11px",
    color: isDark ? "#4b5563" : "#64748b",
    fontWeight: "500",
    lineHeight: "1.3",
    transition: "color 0.3s ease",
  },

  /* ── Divider ── */
  divider: {
    height: "1px",
    background: isDark
      ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)"
      : "linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)",
    marginBottom: "24px",
  },

  /* ── Start Button ── */
  startBtn: {
    width: "100%",
    padding: "16px 24px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "'Inter', sans-serif",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
    position: "relative",
    overflow: "hidden",
    animation: "fadeInUp 0.9s var(--ease-out) 0.35s both",
    letterSpacing: "0.3px",
  },
  startBtnHover: {
    transform: "translateY(-2px)",
    boxShadow:
      "0 8px 32px rgba(6,182,212,0.3)," +
      "0 0 80px rgba(139,92,246,0.12)," +
      "inset 0 1px 0 rgba(255,255,255,0.15)",
  },
  startBtnDisabled: {
    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    color: isDark ? "#4b5563" : "#94a3b8",
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
  btnContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.25)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  /* ── Features ── */
  features: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginTop: "22px",
    animation: "fadeIn 1s ease 0.6s both",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: isDark ? "#64748b" : "#475569",
    fontWeight: "500",
  },
  featureDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#06b6d4",
  },
  featureSep: {
    color: isDark ? "#334155" : "#cbd5e1",
    fontSize: "14px",
  },
});

/* Inject keyframes for Home page specific animations */
if (typeof document !== "undefined") {
  const id = "home-animations-style";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(s);
  }
}

export default Home;