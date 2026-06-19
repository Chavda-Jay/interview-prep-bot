import { getScore } from "../services/api";
import { useTheme } from "../ThemeContext";
import { useState, useEffect, useMemo } from "react";
import CosmicBackground from "../components/CosmicBackground";

function Results({ sessionData, onRestart }) {
    const { isDark } = useTheme();
    const [results, setResults] = useState(null);
    const [restartHover, setRestartHover] = useState(false);
    const [expandedQ, setExpandedQ] = useState(null);
    const styles = useMemo(() => getStyles(isDark), [isDark]);

    useEffect(() => {
        getScore(sessionData.session_id).then((res) => setResults(res.data));
    }, []);

    const getGrade = (pct) => {
        if (pct >= 90) return { emoji: "🏆", text: "Outstanding!", color: "#10b981" };
        if (pct >= 70) return { emoji: "🎯", text: "Great Job!", color: "#06b6d4" };
        if (pct >= 50) return { emoji: "💪", text: "Good Effort!", color: "#f59e0b" };
        return { emoji: "📚", text: "Keep Learning!", color: "#ef4444" };
    };

    const getScoreColor = (score) => {
        if (score >= 8) return "#10b981";
        if (score >= 5) return "#f59e0b";
        return "#ef4444";
    };

    const getBarColor = (pct) => {
        if (pct >= 70) return "#10b981";
        if (pct >= 50) return "#f59e0b";
        return "#ef4444";
    };

    const categoryLabels = {
        technical_knowledge: "Technical Knowledge",
        concept_understanding: "Concept Understanding",
        problem_solving: "Problem Solving",
        communication: "Communication",
        confidence: "Confidence",
        clarity: "Clarity",
    };

    if (!results) {
        return (
            <div style={styles.page}>
                <CosmicBackground />
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner} />
                    <p style={styles.loadingText}>Generating your AI Assessment Report...</p>
                </div>
            </div>
        );
    }

    const grade = getGrade(results.overall_percentage);

    return (
        <div style={styles.page}>
            <CosmicBackground />

            <div style={styles.container}>
                {/* ── Header ── */}
                <div style={styles.header}>
                    <span style={styles.headerEmoji}>{grade.emoji}</span>
                    <h1 style={styles.title}>AI Assessment Report</h1>
                    <p style={styles.subtitle}>
                        {results.user_name} • {results.skill} • {results.level}
                    </p>
                    <p style={{ ...styles.gradeText, color: grade.color }}>{grade.text}</p>
                </div>

                {/* ── Overall Score Ring ── */}
                <div style={styles.scoreCard}>
                    <div style={styles.scoreMain}>
                        <div style={{
                            ...styles.scoreRing,
                            borderColor: grade.color,
                            boxShadow: `0 0 50px ${grade.color}22`,
                        }}>
                            <span style={{ ...styles.percentValue, color: grade.color }}>
                                {results.overall_percentage}
                            </span>
                            <span style={styles.percentLabel}>/ 100</span>
                        </div>
                    </div>

                    <div style={styles.statsRow}>
                        <div style={styles.statItem}>
                            <span style={styles.statValue}>{results.total_score}</span>
                            <span style={styles.statLabel}>Points Earned</span>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.statItem}>
                            <span style={styles.statValue}>{results.total_questions}</span>
                            <span style={styles.statLabel}>Questions</span>
                        </div>
                        <div style={styles.statDivider} />
                        <div style={styles.statItem}>
                            <span style={{ ...styles.statValue, color: "#06b6d4", fontSize: "15px" }}>
                                {results.skill}
                            </span>
                            <span style={styles.statLabel}>Technology</span>
                        </div>
                    </div>
                </div>

                {/* ── Category Scores ── */}
                {results.category_scores && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                            Category Scores
                        </h2>
                        <div style={styles.categoryGrid}>
                            {Object.entries(results.category_scores).map(([key, value]) => {
                                const barColor = getBarColor(value);
                                return (
                                    <div key={key} style={styles.categoryItem}>
                                        <div style={styles.categoryHeader}>
                                            <span style={styles.categoryName}>{categoryLabels[key] || key}</span>
                                            <span style={{ ...styles.categoryValue, color: barColor }}>{value}/100</span>
                                        </div>
                                        <div style={styles.barTrack}>
                                            <div style={{
                                                ...styles.barFill,
                                                width: `${value}%`,
                                                background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Strengths ── */}
                {results.strengths && results.strengths.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                            Strengths
                        </h2>
                        <div style={styles.listCard}>
                            {results.strengths.map((s, i) => (
                                <div key={i} style={styles.listItem}>
                                    <span style={styles.strengthIcon}>✓</span>
                                    <span style={styles.listText}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Areas to Improve ── */}
                {results.areas_to_improve && results.areas_to_improve.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            Areas to Improve
                        </h2>
                        <div style={styles.listCard}>
                            {results.areas_to_improve.map((a, i) => (
                                <div key={i} style={styles.listItem}>
                                    <span style={styles.weakIcon}>✗</span>
                                    <span style={styles.listText}>{a}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Recommended Topics ── */}
                {results.recommended_topics && results.recommended_topics.length > 0 && (
                    <div style={styles.section}>
                        <h2 style={styles.sectionTitle}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                            Recommended Topics to Study
                        </h2>
                        <div style={styles.tagsWrap}>
                            {results.recommended_topics.map((t, i) => (
                                <span key={i} style={styles.recTag}>{t}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Question Breakdown ── */}
                <div style={styles.section}>
                    <h2 style={styles.sectionTitle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                        Question Breakdown
                    </h2>

                    {results.answers?.map((a, i) => {
                        const isExpanded = expandedQ === i;
                        const scoreColor = getScoreColor(a.score);
                        const isMcq = a.question_type === "mcq";
                        return (
                            <div
                                key={i}
                                style={{
                                    ...styles.answerCard,
                                    ...(isExpanded ? styles.answerCardExpanded : {}),
                                }}
                                onClick={() => setExpandedQ(isExpanded ? null : i)}
                            >
                                <div style={styles.answerHeader}>
                                    <div style={styles.answerLeft}>
                                        <span style={styles.qNumber}>Q{i + 1}</span>
                                        <span style={{
                                            ...styles.typeBadge,
                                            color: isMcq ? "#8b5cf6" : "#10b981",
                                            background: isMcq ? "rgba(139,92,246,0.08)" : "rgba(16,185,129,0.08)",
                                        }}>
                                            {isMcq ? "MCQ" : "DESC"}
                                        </span>
                                        <span style={styles.qTextPreview}>
                                            {a.question && a.question.length > 55
                                                ? a.question.substring(0, 55) + "..."
                                                : a.question}
                                        </span>
                                    </div>
                                    <div style={styles.answerRight}>
                                        {isMcq && (
                                            <span style={{
                                                ...styles.mcqResult,
                                                color: a.is_correct ? "#10b981" : "#ef4444",
                                            }}>
                                                {a.is_correct ? "✓" : "✗"}
                                            </span>
                                        )}
                                        <span style={{
                                            ...styles.answerScore,
                                            color: scoreColor,
                                            background: `${scoreColor}10`,
                                            borderColor: `${scoreColor}22`,
                                        }}>
                                            {a.score}/10
                                        </span>
                                        <span style={{
                                            ...styles.expandIcon,
                                            transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                                        }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                                        </span>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={styles.answerExpanded}>
                                        <div style={styles.expandedBlock}>
                                            <span style={styles.expandedLabel}>Question</span>
                                            <p style={styles.expandedText}>{a.question}</p>
                                        </div>
                                        <div style={styles.expandedBlock}>
                                            <span style={styles.expandedLabel}>Your Answer</span>
                                            <p style={styles.expandedText}>
                                                {isMcq ? `Selected: ${a.selected || a.user_answer}` : (a.user_answer || "No answer provided")}
                                            </p>
                                        </div>
                                        <div style={styles.expandedBlock}>
                                            <span style={styles.expandedLabel}>Feedback</span>
                                            <p style={styles.expandedText}>{a.feedback}</p>
                                        </div>
                                        {a.correct_answer && (
                                            <div style={styles.expandedBlock}>
                                                <span style={styles.expandedLabel}>Correct Answer</span>
                                                <p style={styles.expandedText}>{a.correct_answer}</p>
                                            </div>
                                        )}
                                        {a.weak_areas?.length > 0 && (
                                            <div style={styles.expandedWeakRow}>
                                                {a.weak_areas.map((w, j) => (
                                                    <span key={j} style={styles.weakTag}>{w}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* ── Restart Button ── */}
                <button
                    id="restart-interview-btn"
                    style={{
                        ...styles.restartBtn,
                        ...(restartHover ? styles.restartBtnHover : {}),
                    }}
                    onClick={onRestart}
                    onMouseEnter={() => setRestartHover(true)}
                    onMouseLeave={() => setRestartHover(false)}
                >
                    <span style={styles.btnContent}>
                        Start New Interview
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    );
}

const getStyles = (isDark) => ({
    page: {
        minHeight: "100vh", position: "relative", overflow: "hidden",
        background: isDark ? "#05060b" : "#f5f7fa",
        transition: "background 0.4s ease",
    },

    /* ── Loading ── */
    loadingContainer: {
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "18px",
        position: "relative", zIndex: 1,
    },
    loadingSpinner: {
        width: "36px", height: "36px",
        border: "3px solid rgba(6,182,212,0.1)",
        borderTopColor: "#06b6d4", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    loadingText: { color: isDark ? "#64748b" : "#475569", fontSize: "14px", fontWeight: "500" },

    /* ── Container ── */
    container: {
        position: "relative", zIndex: 1,
        maxWidth: "720px", margin: "0 auto",
        padding: "40px 20px 60px",
    },

    /* ── Header ── */
    header: {
        textAlign: "center", marginBottom: "28px",
        animation: "fadeInUp 0.5s var(--ease-out) both",
    },
    headerEmoji: {
        fontSize: "44px", display: "block", marginBottom: "14px",
        animation: "bounceIn 0.8s var(--ease-spring) both",
    },
    title: {
        fontSize: "28px", fontWeight: "900",
        color: isDark ? "#f1f5f9" : "#1e293b",
        marginBottom: "6px", letterSpacing: "-0.8px",
        fontFamily: "'Inter', sans-serif",
    },
    subtitle: {
        fontSize: "13px", color: isDark ? "#64748b" : "#475569", fontWeight: "500",
        marginBottom: "4px", margin: "4px 0",
    },
    gradeText: { fontSize: "15px", fontWeight: "700", letterSpacing: "0.2px", margin: "4px 0" },

    /* ── Score Card ── */
    scoreCard: {
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "20px", padding: "32px", marginBottom: "24px",
        boxShadow: isDark
            ? "0 20px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "0 20px 80px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        animation: "fadeInUp 0.6s var(--ease-out) 0.1s both",
    },
    scoreMain: { display: "flex", justifyContent: "center", marginBottom: "28px" },
    scoreRing: {
        width: "110px", height: "110px", borderRadius: "50%",
        border: "3px solid", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "2px",
        animation: "bounceIn 0.7s var(--ease-spring) 0.3s both",
    },
    percentValue: {
        fontSize: "38px", fontWeight: "900",
        fontFamily: "'JetBrains Mono', monospace", lineHeight: "1",
    },
    percentLabel: {
        fontSize: "12px", fontWeight: "600", color: isDark ? "#4b5563" : "#94a3b8",
    },
    statsRow: {
        display: "flex", alignItems: "center", justifyContent: "center", gap: "28px",
    },
    statItem: {
        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
    },
    statValue: {
        fontSize: "17px", fontWeight: "700",
        color: isDark ? "#e2e8f0" : "#1e293b",
        fontFamily: "'JetBrains Mono', monospace",
    },
    statLabel: {
        fontSize: "10px", fontWeight: "600", color: isDark ? "#4b5563" : "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.6px",
    },
    statDivider: {
        width: "1px", height: "30px",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    },

    /* ── Sections ── */
    section: {
        marginBottom: "24px",
        animation: "fadeInUp 0.7s var(--ease-out) 0.2s both",
    },
    sectionTitle: {
        display: "flex", alignItems: "center", gap: "8px",
        fontSize: "14px", fontWeight: "700",
        color: isDark ? "#94a3b8" : "#64748b",
        marginBottom: "14px", letterSpacing: "-0.2px",
    },

    /* ── Category Scores ── */
    categoryGrid: {
        display: "flex", flexDirection: "column", gap: "14px",
        background: isDark ? "rgba(12,13,22,0.8)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
        borderRadius: "16px", padding: "22px",
    },
    categoryItem: { display: "flex", flexDirection: "column", gap: "6px" },
    categoryHeader: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
    },
    categoryName: {
        fontSize: "13px", fontWeight: "600",
        color: isDark ? "#cbd5e1" : "#475569",
    },
    categoryValue: {
        fontSize: "12px", fontWeight: "700",
        fontFamily: "'JetBrains Mono', monospace",
    },
    barTrack: {
        height: "6px", borderRadius: "3px",
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        overflow: "hidden",
    },
    barFill: {
        height: "100%", borderRadius: "3px",
        transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
    },

    /* ── Strengths / Weaknesses Lists ── */
    listCard: {
        background: isDark ? "rgba(12,13,22,0.8)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
        borderRadius: "16px", padding: "18px",
        display: "flex", flexDirection: "column", gap: "10px",
    },
    listItem: {
        display: "flex", alignItems: "flex-start", gap: "10px",
    },
    strengthIcon: {
        color: "#10b981", fontWeight: "800", fontSize: "14px",
        flexShrink: 0, marginTop: "1px",
    },
    weakIcon: {
        color: "#ef4444", fontWeight: "800", fontSize: "14px",
        flexShrink: 0, marginTop: "1px",
    },
    listText: {
        fontSize: "13px", fontWeight: "500", lineHeight: "1.5",
        color: isDark ? "#94a3b8" : "#475569",
    },

    /* ── Recommended Topics ── */
    tagsWrap: {
        display: "flex", flexWrap: "wrap", gap: "8px",
    },
    recTag: {
        padding: "7px 16px", borderRadius: "9999px",
        background: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.08)",
        border: isDark ? "1px solid rgba(139,92,246,0.15)" : "1px solid rgba(139,92,246,0.2)",
        color: isDark ? "#a78bfa" : "#7c3aed", fontSize: "12px", fontWeight: "600",
    },

    /* ── Answer Cards (Question Breakdown) ── */
    answerCard: {
        background: isDark ? "rgba(12,13,22,0.8)" : "rgba(255,255,255,0.9)",
        border: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "14px", padding: "14px 16px",
        marginBottom: "8px", cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    answerCardExpanded: {
        borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.12)",
        background: isDark ? "rgba(12,13,22,0.95)" : "rgba(255,255,255,0.95)",
    },
    answerHeader: {
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px",
    },
    answerLeft: {
        display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0,
    },
    qNumber: {
        fontSize: "11px", fontWeight: "700", color: "#06b6d4",
        fontFamily: "'JetBrains Mono', monospace",
        padding: "3px 7px", borderRadius: "6px",
        background: "rgba(6,182,212,0.06)", flexShrink: 0,
    },
    typeBadge: {
        fontSize: "9px", fontWeight: "700",
        padding: "2px 7px", borderRadius: "4px",
        textTransform: "uppercase", letterSpacing: "0.5px",
        flexShrink: 0,
    },
    qTextPreview: {
        fontSize: "13px", color: isDark ? "#94a3b8" : "#475569",
        overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap", fontWeight: "500",
    },
    answerRight: {
        display: "flex", alignItems: "center", gap: "8px", flexShrink: 0,
    },
    mcqResult: {
        fontSize: "14px", fontWeight: "800",
    },
    answerScore: {
        fontSize: "12px", fontWeight: "700",
        fontFamily: "'JetBrains Mono', monospace",
        padding: "3px 9px", borderRadius: "9999px",
        border: "1px solid",
    },
    expandIcon: {
        color: isDark ? "#475569" : "#94a3b8",
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
    },
    answerExpanded: {
        marginTop: "14px", paddingTop: "14px",
        borderTop: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.06)",
        display: "flex", flexDirection: "column", gap: "12px",
    },
    expandedBlock: { display: "flex", flexDirection: "column", gap: "5px" },
    expandedLabel: {
        fontSize: "10px", fontWeight: "700", color: isDark ? "#4b5563" : "#94a3b8",
        textTransform: "uppercase", letterSpacing: "0.6px",
    },
    expandedText: {
        fontSize: "13px", lineHeight: "1.7",
        color: isDark ? "#94a3b8" : "#475569", margin: 0,
    },
    expandedWeakRow: { display: "flex", flexWrap: "wrap", gap: "6px" },
    weakTag: {
        padding: "3px 10px", borderRadius: "9999px",
        background: isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.1)",
        border: isDark ? "1px solid rgba(245,158,11,0.12)" : "1px solid rgba(245,158,11,0.2)",
        color: isDark ? "#fbbf24" : "#d97706", fontSize: "11px", fontWeight: "600",
    },

    /* ── Restart Button ── */
    restartBtn: {
        width: "100%", padding: "15px 24px", borderRadius: "14px",
        border: "none",
        background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
        color: "white", fontSize: "15px", fontWeight: "700",
        fontFamily: "'Inter', sans-serif", cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        animation: "fadeInUp 0.8s var(--ease-out) 0.3s both",
        letterSpacing: "0.3px",
    },
    restartBtnHover: {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 32px rgba(6,182,212,0.25), 0 0 60px rgba(139,92,246,0.1)",
    },
    btnContent: {
        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
    },
});

/* Inject spinner */
if (typeof document !== "undefined") {
    const id = "results-spin-style";
    if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(s);
    }
}

export default Results;