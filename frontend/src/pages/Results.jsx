import { getScore, submitAppReview } from "../services/api";
import { useTheme } from "../ThemeContext";
import { useState, useEffect, useMemo } from "react";
import CosmicBackground from "../components/CosmicBackground";


const CircleProgress = ({ percentage, color, size = 180, strokeWidth = 14 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        setTimeout(() => setOffset(circumference - (percentage / 100) * circumference), 300);
    }, [percentage, circumference]);

    return (
        <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* Outer Glow */}
            <div style={{
                position: "absolute", width: "100%", height: "100%", borderRadius: "50%",
                background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
                filter: "blur(20px)", zIndex: 0
            }} />
            
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)", zIndex: 1 }}>
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={`${color}20`} strokeWidth={strokeWidth} fill="none"
                />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={color} strokeWidth={strokeWidth} fill="none"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                />
            </svg>
            <div style={{ position: "absolute", textAlign: "center", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span style={{ fontSize: "48px", fontWeight: "900", color, fontFamily: "'JetBrains Mono', monospace", lineHeight: "1", letterSpacing: "-2px" }}>
                        {percentage}
                    </span>
                    <span style={{ fontSize: "20px", fontWeight: "700", color: `${color}aa`, marginLeft: "2px" }}>%</span>
                </div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", color: `${color}88`, marginTop: "4px" }}>Score</span>
            </div>
        </div>
    );
};

const categoryLabels = {
    technical_knowledge: "Technical",
    concept_understanding: "Concepts",
    problem_solving: "Problem Solving",
    communication: "Communication",
    confidence: "Confidence",
    clarity: "Clarity",
};

function Results({ sessionData, onRestart }) {
    const { isDark } = useTheme();
    const [results, setResults] = useState(null);
    const [expandedQ, setExpandedQ] = useState(null);
    const [btnHover, setBtnHover] = useState(false);
    
    // Feedback State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState("");
    const [feedbackStatus, setFeedbackStatus] = useState("idle"); // idle, submitting, success

    const styles = useMemo(() => getStyles(isDark), [isDark]);

    useEffect(() => {
        getScore(sessionData.session_id).then((res) => setResults(res.data));
    }, [sessionData]);

    const getGrade = (pct) => {
        if (pct >= 90) return { emoji: "🏆", text: "Outstanding!", desc: "You crushed it. Ready for top-tier interviews.", color: "#10b981", bg: "rgba(16,185,129,0.1)" };
        if (pct >= 70) return { emoji: "🎯", text: "Great Job!", desc: "Solid performance. Just a bit more polish needed.", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" };
        if (pct >= 50) return { emoji: "💪", text: "Good Effort!", desc: "You have the basics down, keep practicing.", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" };
        return { emoji: "📚", text: "Keep Learning", desc: "Don't give up! Review the topics and try again.", color: "#ef4444", bg: "rgba(239,68,68,0.1)" };
    };

    if (!results) {
        return (
            <div style={styles.page}>
                <CosmicBackground />
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner} />
                    <p style={styles.loadingText}>Analyzing your interview performance...</p>
                </div>
            </div>
        );
    }

    const grade = getGrade(results.overall_percentage);

    return (
        <div style={styles.page}>
            <CosmicBackground />
            <div style={styles.container} className="results-container">
                
                {/* ── Hero Score Card ── */}
                <div style={styles.heroCard} className="results-hero">
                    <div style={styles.heroLeft} className="results-hero-left">
                        <div style={styles.badgeWrap}>
                            <span style={styles.heroBadge}>{results.skill}</span>
                            <span style={styles.heroBadge}>{results.level}</span>
                        </div>
                        <h1 style={styles.heroTitle} className="results-hero-title">{grade.text}</h1>
                        <p style={styles.heroDesc}>{grade.desc}</p>
                        
                        <div style={styles.statsGrid} className="results-hero-stats">
                            <div style={styles.statBox}>
                                <span style={styles.statNum}>{results.total_score}</span>
                                <span style={styles.statLabel}>Total Points</span>
                            </div>
                            <div style={styles.statBox}>
                                <span style={styles.statNum}>{results.total_questions}</span>
                                <span style={styles.statLabel}>Questions</span>
                            </div>
                        </div>
                    </div>
                    <div style={styles.heroRight}>
                        <CircleProgress percentage={results.overall_percentage} color={grade.color} />
                    </div>
                </div>

                {/* ── Two Column Insights ── */}
                <div style={styles.twoCol}>
                    {/* Strengths */}
                    <div style={{ ...styles.insightCard, borderTop: `3px solid #10b981` }} className="results-insight">
                        <h3 style={styles.insightTitle}>
                            <span style={{ ...styles.insightIcon, background: "rgba(16,185,129,0.15)", color: "#10b981" }}>✓</span>
                            Top Strengths
                        </h3>
                        {results.strengths?.length > 0 ? (
                            <ul style={styles.insightList}>
                                {results.strengths.slice(0, 3).map((s, i) => (
                                    <li key={i} style={styles.insightItem}>{s}</li>
                                ))}
                            </ul>
                        ) : <p style={styles.emptyText}>No major strengths identified yet.</p>}
                    </div>

                    {/* Areas to Improve */}
                    <div style={{ ...styles.insightCard, borderTop: `3px solid #ef4444` }} className="results-insight">
                        <h3 style={styles.insightTitle}>
                            <span style={{ ...styles.insightIcon, background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>↗</span>
                            Focus Areas
                        </h3>
                        {results.areas_to_improve?.length > 0 ? (
                            <ul style={styles.insightList}>
                                {results.areas_to_improve.slice(0, 3).map((a, i) => (
                                    <li key={i} style={styles.insightItem}>{a}</li>
                                ))}
                            </ul>
                        ) : <p style={styles.emptyText}>You did perfectly in all areas!</p>}
                    </div>
                </div>

                {/* ── Category Breakdown (Sleek Horizontal Bars) ── */}
                {results.category_scores && (
                    <div style={styles.cardSection} className="results-card-section">
                        <h3 style={styles.sectionHeading}>Performance by Category</h3>
                        <div style={styles.catGrid}>
                            {Object.entries(results.category_scores).map(([key, val]) => {
                                const c = val >= 70 ? "#10b981" : val >= 50 ? "#f59e0b" : "#ef4444";
                                return (
                                    <div key={key} style={styles.catBox}>
                                        <div style={styles.catHead}>
                                            <span style={styles.catName}>{categoryLabels[key] || key}</span>
                                            <span style={{ ...styles.catVal, color: c }}>{val}%</span>
                                        </div>
                                        <div style={styles.catTrack}>
                                            <div style={{ ...styles.catFill, width: `${val}%`, background: c }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Recommended Topics ── */}
                {results.recommended_topics?.length > 0 && (
                    <div style={styles.cardSection} className="results-card-section">
                        <h3 style={styles.sectionHeading}>Recommended Study Topics</h3>
                        <div style={styles.tagsContainer}>
                            {results.recommended_topics.map((t, i) => (
                                <span key={i} style={styles.topicTag}>{t}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Question Review (Simplified & Clean) ── */}
                <div style={styles.reviewSection}>
                    <h3 style={styles.sectionHeading}>Detailed Review</h3>
                    <div style={styles.qList}>
                        {results.answers?.map((a, i) => {
                            const isExpanded = expandedQ === i;
                            const isCorrect = a.is_correct || a.score >= 7;
                            const qColor = isCorrect ? "#10b981" : (a.score >= 4 ? "#f59e0b" : "#ef4444");
                            
                            return (
                                <div key={i} style={{ ...styles.qCard, ...(isExpanded ? styles.qCardExpanded : {}) }} className="results-q-card" onClick={() => setExpandedQ(isExpanded ? null : i)}>
                                    <div style={styles.qHeader}>
                                        <div style={{ ...styles.qDot, background: qColor }} />
                                        <div style={styles.qHeaderMain}>
                                            <span style={styles.qTitle}>Question {i + 1}</span>
                                            <span style={styles.qPreview}>
                                                {a.question.length > 60 ? a.question.substring(0, 60) + "..." : a.question}
                                            </span>
                                        </div>
                                        <div style={styles.qScoreWrap}>
                                            <span style={{ ...styles.qScoreBadge, color: qColor, background: `${qColor}15` }}>
                                                {a.score}/10
                                            </span>
                                            <svg style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "0.3s", color: isDark ? "#64748b" : "#94a3b8" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div style={styles.qDetails}>
                                            <div style={styles.qDetailRow}>
                                                <div style={styles.qDetailBox}>
                                                    <span style={styles.qLabel}>Your Answer</span>
                                                    <p style={{ ...styles.qText, color: isDark ? "#e2e8f0" : "#1e293b" }}>{a.user_answer || a.selected || "No answer"}</p>
                                                </div>
                                                {a.correct_answer && (
                                                    <div style={styles.qDetailBox}>
                                                        <span style={styles.qLabel}>Ideal Answer</span>
                                                        <p style={{ ...styles.qText, color: "#10b981" }}>{a.correct_answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ ...styles.qDetailBox, marginTop: "12px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", padding: "12px", borderRadius: "8px" }}>
                                                <span style={styles.qLabel}>AI Feedback</span>
                                                <p style={styles.qText}>{a.feedback}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Feedback / Rate Your Experience ── */}
                <div style={styles.feedbackSection} className="results-feedback">
                    {feedbackStatus === "success" ? (
                        <div style={styles.feedbackSuccess}>
                            <div style={styles.successIcon}>❤️</div>
                            <h3>Thank You!</h3>
                            <p>Your feedback helps us make the AI even better.</p>
                        </div>
                    ) : (
                        <>
                            <h3 style={styles.feedbackTitle}>Rate Your Experience</h3>
                            <p style={styles.feedbackDesc}>Did you enjoy this interview? Let us know!</p>
                            
                            <div style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        style={{
                                            ...styles.star,
                                            color: (hoverRating || rating) >= star ? "#f59e0b" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")
                                        }}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            
                            <textarea
                                style={styles.feedbackInput}
                                placeholder="Any suggestions or comments? (Optional)"
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                            />
                            
                            <button
                                style={{
                                    ...styles.submitFeedbackBtn,
                                    opacity: rating === 0 ? 0.5 : 1,
                                    cursor: rating === 0 ? "not-allowed" : "pointer"
                                }}
                                disabled={rating === 0 || feedbackStatus === "submitting"}
                                onClick={async () => {
                                    if (rating > 0) {
                                        setFeedbackStatus("submitting");
                                        try {
                                            await submitAppReview({
                                                session_id: sessionData.session_id,
                                                rating,
                                                comment: feedbackComment
                                            });
                                            setFeedbackStatus("success");
                                        } catch (error) {
                                            console.error("Feedback error", error);
                                            setFeedbackStatus("idle");
                                        }
                                    }
                                }}
                            >
                                {feedbackStatus === "submitting" ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </>
                    )}
                </div>

                {/* ── Action Footer ── */}
                <div style={styles.actionFooter}>
                    <button
                        style={{ ...styles.restartBtn, ...(btnHover ? styles.restartBtnHover : {}) }}
                        className="results-restart-btn"
                        onClick={onRestart}
                        onMouseEnter={() => setBtnHover(true)}
                        onMouseLeave={() => setBtnHover(false)}
                    >
                        Start Another Interview
                    </button>
                </div>

            </div>
        </div>
    );
}

const getStyles = (isDark) => ({
    page: {
        minHeight: "100vh", position: "relative", overflow: "hidden",
        background: isDark ? "#05060b" : "#f5f7fa",
        color: isDark ? "#f1f5f9" : "#1e293b",
        fontFamily: "'Inter', sans-serif",
    },
    loadingContainer: {
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "20px",
        position: "relative", zIndex: 1,
    },
    loadingSpinner: {
        width: "40px", height: "40px",
        border: "3px solid rgba(6,182,212,0.1)",
        borderTopColor: "#06b6d4", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    loadingText: { color: isDark ? "#94a3b8" : "#64748b", fontSize: "15px", fontWeight: "500" },
    
    container: {
        position: "relative", zIndex: 1,
        maxWidth: "800px", margin: "0 auto",
        padding: "40px 20px 80px",
        display: "flex", flexDirection: "column", gap: "24px",
    },

    /* ── Hero Card ── */
    heroCard: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: isDark ? "rgba(12,13,22,0.85)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)",
        borderRadius: "24px", padding: "40px",
        boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.05)",
        gap: "40px", flexWrap: "wrap",
        animation: "fadeInUp 0.6s ease both",
    },
    heroLeft: { flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "16px" },
    badgeWrap: { display: "flex", gap: "10px" },
    heroBadge: {
        padding: "4px 12px", borderRadius: "99px",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        fontSize: "12px", fontWeight: "600", color: isDark ? "#cbd5e1" : "#475569",
        textTransform: "uppercase", letterSpacing: "0.5px",
    },
    heroTitle: { fontSize: "36px", fontWeight: "800", letterSpacing: "-1px", margin: 0, lineHeight: "1.1" },
    heroDesc: { fontSize: "15px", color: isDark ? "#94a3b8" : "#64748b", margin: 0, lineHeight: "1.5" },
    statsGrid: { display: "flex", gap: "24px", marginTop: "10px" },
    statBox: { display: "flex", flexDirection: "column", gap: "4px" },
    statNum: { fontSize: "24px", fontWeight: "800", fontFamily: "'JetBrains Mono', monospace", color: isDark ? "#f1f5f9" : "#1e293b" },
    statLabel: { fontSize: "11px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: isDark ? "#64748b" : "#94a3b8" },
    heroRight: { display: "flex", justifyContent: "center", flex: "1 1 200px" },

    /* ── Two Column Insights ── */
    twoCol: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px",
        animation: "fadeInUp 0.6s ease 0.1s both",
    },
    insightCard: {
        background: isDark ? "rgba(12,13,22,0.7)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        borderRadius: "20px", padding: "24px",
        display: "flex", flexDirection: "column", gap: "16px",
    },
    insightTitle: {
        display: "flex", alignItems: "center", gap: "10px",
        fontSize: "15px", fontWeight: "700", margin: 0,
    },
    insightIcon: {
        width: "28px", height: "28px", borderRadius: "8px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", fontWeight: "900",
    },
    insightList: { margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" },
    insightItem: {
        fontSize: "14px", lineHeight: "1.5", color: isDark ? "#cbd5e1" : "#475569",
        position: "relative", paddingLeft: "16px",
    },
    emptyText: { fontSize: "14px", color: isDark ? "#64748b" : "#94a3b8", fontStyle: "italic", margin: 0 },

    /* ── Generic Card Section ── */
    cardSection: {
        background: isDark ? "rgba(12,13,22,0.7)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        borderRadius: "20px", padding: "28px",
        animation: "fadeInUp 0.6s ease 0.2s both",
    },
    sectionHeading: { fontSize: "18px", fontWeight: "700", marginBottom: "20px", letterSpacing: "-0.5px" },
    
    /* ── Category Breakdown ── */
    catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
    catBox: { display: "flex", flexDirection: "column", gap: "8px" },
    catHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    catName: { fontSize: "13px", fontWeight: "600", color: isDark ? "#cbd5e1" : "#475569" },
    catVal: { fontSize: "13px", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" },
    catTrack: { height: "6px", borderRadius: "3px", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", overflow: "hidden" },
    catFill: { height: "100%", borderRadius: "3px", transition: "width 1s ease" },

    /* ── Recommended Topics ── */
    tagsContainer: { display: "flex", flexWrap: "wrap", gap: "10px" },
    topicTag: {
        padding: "8px 16px", borderRadius: "10px",
        background: isDark ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.08)",
        border: isDark ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(139,92,246,0.15)",
        color: isDark ? "#c4b5fd" : "#7c3aed", fontSize: "13px", fontWeight: "600",
    },

    /* ── Question Review ── */
    reviewSection: {
        animation: "fadeInUp 0.6s ease 0.3s both",
    },
    qList: { display: "flex", flexDirection: "column", gap: "12px" },
    qCard: {
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
        borderRadius: "16px", padding: "16px 20px",
        cursor: "pointer", transition: "all 0.2s ease",
    },
    qCardExpanded: {
        background: isDark ? "rgba(12,13,22,0.9)" : "#ffffff",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 10px 30px rgba(0,0,0,0.05)",
    },
    qHeader: { display: "flex", alignItems: "center", gap: "16px" },
    qDot: { width: "10px", height: "10px", borderRadius: "50%", flexShrink: 0 },
    qHeaderMain: { display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 },
    qTitle: { fontSize: "12px", fontWeight: "700", color: isDark ? "#64748b" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px" },
    qPreview: { fontSize: "14px", fontWeight: "500", color: isDark ? "#cbd5e1" : "#334155", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    qScoreWrap: { display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 },
    qScoreBadge: { padding: "4px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" },
    
    qDetails: {
        marginTop: "16px", paddingTop: "16px",
        borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column", gap: "16px",
    },
    qDetailRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" },
    qDetailBox: { display: "flex", flexDirection: "column", gap: "6px" },
    qLabel: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: isDark ? "#64748b" : "#94a3b8" },
    qText: { fontSize: "14px", lineHeight: "1.6", color: isDark ? "#94a3b8" : "#475569", margin: 0 },

    /* ── Action Footer ── */
    actionFooter: { display: "flex", justifyContent: "center", width: "100%", animation: "fadeInUp 0.6s ease 0.4s both" },
    restartBtn: {
        width: "100%", maxWidth: "400px",
        padding: "16px", borderRadius: "16px", border: "none",
        background: "linear-gradient(135deg, #0ea5e9, #8b5cf6)",
        color: "white", fontSize: "16px", fontWeight: "700",
        cursor: "pointer", transition: "all 0.3s ease",
        boxShadow: "0 10px 25px rgba(14,165,233,0.3)",
    },
    restartBtnHover: {
        transform: "translateY(-3px)",
        boxShadow: "0 15px 35px rgba(14,165,233,0.4)",
    },

    /* ── Feedback Section ── */
    feedbackSection: {
        background: isDark ? "rgba(12,13,22,0.7)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        borderRadius: "20px", padding: "32px",
        display: "flex", flexDirection: "column", alignItems: "center",
        animation: "fadeInUp 0.6s ease 0.5s both",
    },
    feedbackTitle: { fontSize: "20px", fontWeight: "700", margin: "0 0 8px 0" },
    feedbackDesc: { fontSize: "14px", color: isDark ? "#94a3b8" : "#64748b", margin: "0 0 20px 0" },
    starsContainer: { display: "flex", gap: "8px", marginBottom: "20px" },
    star: { fontSize: "40px", cursor: "pointer", transition: "color 0.2s ease" },
    feedbackInput: {
        width: "100%", maxWidth: "400px", minHeight: "80px",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
        borderRadius: "12px", padding: "12px 16px",
        color: isDark ? "#f1f5f9" : "#1e293b", fontSize: "14px",
        outline: "none", resize: "vertical", fontFamily: "inherit",
        marginBottom: "20px"
    },
    submitFeedbackBtn: {
        padding: "12px 24px", borderRadius: "10px", border: "none",
        background: isDark ? "#334155" : "#e2e8f0",
        color: isDark ? "#f8fafc" : "#0f172a",
        fontSize: "14px", fontWeight: "700", transition: "all 0.2s ease",
    },
    feedbackSuccess: { textAlign: "center", padding: "20px 0" },
    successIcon: { fontSize: "48px", marginBottom: "10px", animation: "fadeInUp 0.4s ease" }
});

/* Inject animations */
if (typeof document !== "undefined") {
    const id = "results-anim-style";
    if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = `
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @media (max-width: 600px) {
                .results-container { padding: 16px 12px 60px !important; gap: 16px !important; }
                .results-hero { padding: 24px !important; gap: 20px !important; flex-direction: column-reverse !important; text-align: center !important; }
                .results-hero-left { align-items: center !important; text-align: center !important; }
                .results-hero-title { font-size: 26px !important; }
                .results-hero-stats { justify-content: center !important; width: 100%; gap: 12px !important; }
                .results-q-card { padding: 16px 12px !important; }
                .results-feedback { padding: 20px !important; }
                .results-insight { padding: 16px !important; }
                .results-card-section { padding: 20px !important; }
                .results-restart-btn { width: 100% !important; padding: 16px 20px !important; }
            }
        `;
        document.head.appendChild(s);
    }
}

export default Results;