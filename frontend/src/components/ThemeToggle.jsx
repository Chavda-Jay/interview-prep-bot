import { useState } from "react";
import { useTheme } from "../ThemeContext";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const [hover, setHover] = useState(false);

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light Mode" : "Dark Mode"}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: isDark
          ? "1px solid rgba(255,255,255,0.1)"
          : "1px solid rgba(0,0,0,0.12)",
        background: isDark
          ? "rgba(15,16,28,0.85)"
          : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: hover
          ? isDark
            ? "0 8px 32px rgba(6,182,212,0.2), 0 0 0 3px rgba(6,182,212,0.1)"
            : "0 8px 32px rgba(139,92,246,0.15), 0 0 0 3px rgba(139,92,246,0.08"
          : isDark
            ? "0 4px 20px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.1)",
        transform: hover ? "scale(1.12) rotate(15deg)" : "scale(1) rotate(0deg)",
      }}
    >
      {isDark ? (
        /* Sun icon for switching to light */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "all 0.4s ease",
            filter: hover ? "drop-shadow(0 0 6px rgba(245,158,11,0.5))" : "none",
          }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon icon for switching to dark */
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "all 0.4s ease",
            filter: hover ? "drop-shadow(0 0 6px rgba(139,92,246,0.5))" : "none",
          }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
