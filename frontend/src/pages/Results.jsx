import { getScore, submitAppReview, getDownloadReportUrl } from "../services/api";
import { useTheme } from "../ThemeContext";
import { useState, useEffect, useMemo } from "react";
import CosmicBackground from "../components/CosmicBackground";

// Basic Canvas Confetti Implementation without external libraries
const triggerConfetti = () => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const colors = ["#06b6d4", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b"];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: width / 2,
            y: height / 2 + 100,
            r: Math.random() * 6 + 2,
            dx: Math.random() * 10 - 5,
            dy: Math.random() * -10 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 10,
            tiltAngle: 0,
            tiltAngleInc: (Math.random() * 0.07) + 0.05
        });
    }

    let animationFrame;
    const render = () => {
        ctx.clearRect(0, 0, width, height);
        let active = false;
        particles.forEach(p => {
            p.tiltAngle += p.tiltAngleInc;
            p.y += (Math.cos(p.tiltAngle) + 1 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle) * 2;
            p.dy += 0.05; // gravity
            p.x += p.dx;
            p.y += p.dy;

            if (p.y <= height) active = true;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        });

        if (active) {
            animationFrame = requestAnimationFrame(render);
        } else {
            document.body.removeChild(canvas);
        }
    };
    render();
    
    // Cleanup after 5s just in case
    setTimeout(() => {
        cancelAnimationFrame(animationFrame);
        if (document.body.contains(canvas)) document.body.removeChild(canvas);
    }, 5000);
};

const CircleProgress = ({ percentage, color, size = 160, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const [offset, setOffset] = useState(circumference);

    useEffect(() => {
        setTimeout(() => setOffset(circumference - (percentage / 100) * circumference), 300);
    }, [percentage, circumference]);

    return (
        <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
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
                    <span style={{ fontSize: "36px", fontWeight: "900", color, fontFamily: "'JetBrains Mono', monospace", lineHeight: "1", letterSpacing: "-1px" }}>
                        {percentage}
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: `${color}aa`, marginLeft: "2px" }}>%</span>
                </div>
                <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", color: `${color}88`, marginTop: "4px" }}>Score</span>
            </div>
        </div>
    );
};

const categoryLabels = {
    technical_knowledge: "Technical Knowledge",
    concept_understanding: "Concept Understanding",
    problem_solving: "Problem Solving",
    communication: "Communication",
    confidence: "Confidence",
    clarity: "Clarity",
    situation: "Situation (S)",
    task: "Task (T)",
    action: "Action (A)",
    result: "Result (R)"
};

function Results({ sessionData, onRestart }) {
    const { isDark } = useTheme();
    const [results, setResults] = useState(null);
    const [expandedQ, setExpandedQ] = useState(null);
    const [btnHover, setBtnHover] = useState(false);
    const [dlHover, setDlHover] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [animatedScores, setAnimatedScores] = useState(false);
    
    // Feedback State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState("");
    const [feedbackStatus, setFeedbackStatus] = useState("idle");

    const styles = useMemo(() => getStyles(isDark), [isDark]);

    useEffect(() => {
        getScore(sessionData.session_id).then((res) => {
            setResults(res.data);
            if (res.data.overall_percentage > 80) {
                setTimeout(triggerConfetti, 500);
            }
            setTimeout(() => setAnimatedScores(true), 300);
        });
    }, [sessionData]);

    const handleDownload = () => {
        setIsDownloading(true);
        // We use an anchor tag to trigger the browser download directly
        const a = document.createElement('a');
        a.href = getDownloadReportUrl(sessionData.session_id);
        a.download = "Report.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => setIsDownloading(false), 1500);
    };

    const handleFeedbackSubmit = async () => {
        if (rating === 0) return alert("Please select a rating!");
        setFeedbackStatus("submitting");
        try {
            await submitAppReview({
                session_id: sessionData.session_id,
                rating,
                comment: feedbackComment
            });
            setFeedbackStatus("success");
        } catch (err) {
            alert("Failed to submit feedback.");
            setFeedbackStatus("idle");
        }
    };

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
                        <div style={styles.badgeWrap} className="results-badge-wrap">
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

                {/* Download Button */}
                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', width: '100%' }}>
                    <button
                        style={{
                            ...styles.downloadBtn,
                            ...(dlHover ? styles.downloadBtnHover : {})
                        }}
                        onClick={handleDownload}
                        onMouseEnter={() => setDlHover(true)}
                        onMouseLeave={() => setDlHover(false)}
                        disabled={isDownloading}
                        className="mobile-full-width"
                    >
                        {isDownloading ? (
                            <>
                                <span style={styles.smallSpinner} /> Generating PDF...
                            </>
                        ) : (
                            <>Download Report 📥</>
                        )}
                    </button>
                </div>

                {/* ── Two Column Insights ── */}
                <div style={styles.twoCol} className="results-two-col">
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

                {/* ── Category Breakdown (Animated) ── */}
                {(results.category_scores || results.hr_scores) && (
                    <div style={styles.cardSection} className="results-card-section">
                        {results.has_tech && results.category_scores && (
                            <>
                                <h3 style={styles.sectionHeading}>Technical Analytics</h3>
                                <div style={styles.catGrid} className="results-cat-grid">
                                    {Object.entries(results.category_scores).map(([key, val]) => {
                                        const c = val >= 70 ? "#10b981" : val >= 50 ? "#f59e0b" : "#ef4444";
                                        return (
                                            <div key={key} style={styles.catBox}>
                                                <div style={styles.catHead}>
                                                    <span style={styles.catName}>{categoryLabels[key] || key}</span>
                                                    <span style={{ ...styles.catVal, color: c }}>{val}%</span>
                                                </div>
                                                <div style={styles.catTrack}>
                                                    <div style={{ ...styles.catFill, width: animatedScores ? `${val}%` : '0%', background: c }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        
                        {results.has_hr && results.hr_scores && (
                            <>
                                <h3 style={{ ...styles.sectionHeading, marginTop: results.has_tech ? "32px" : "0" }}>HR / Behavioral Analytics (STAR Method)</h3>
                                <div style={styles.catGrid} className="results-cat-grid">
                                    {Object.entries(results.hr_scores).map(([key, val]) => {
                                        const c = val >= 70 ? "#8b5cf6" : val >= 50 ? "#f59e0b" : "#ef4444";
                                        return (
                                            <div key={key} style={styles.catBox}>
                                                <div style={styles.catHead}>
                                                    <span style={styles.catName}>{categoryLabels[key] || key}</span>
                                                    <span style={{ ...styles.catVal, color: c }}>{val}%</span>
                                                </div>
                                                <div style={styles.catTrack}>
                                                    <div style={{ ...styles.catFill, width: animatedScores ? `${val}%` : '0%', background: c }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── Question Review (Collapsible) ── */}
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
                                                {a.question}
                                            </span>
                                        </div>
                                        <div style={styles.qScoreWrap}>
                                            <span style={{ ...styles.qScoreBadge, color: qColor, background: `${qColor}15` }}>
                                                {a.score}/10
                                            </span>
                                            <svg style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "0.3s", color: isDark ? "#64748b" : "#94a3b8", flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                                        </div>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div style={styles.qDetails}>
                                            <div style={styles.qDetailRow} className="results-q-details-row">
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

                                            {results.skill === "HR" && (
                                                <div style={{ ...styles.qDetailBox, marginTop: "12px", background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", padding: "12px", borderRadius: "8px" }}>
                                                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                        <span style={styles.qLabel}>STAR Evaluation</span>
                                                        <p style={styles.qText}><strong>S:</strong> {a.situation}/10 | <strong>T:</strong> {a.task}/10 | <strong>A:</strong> {a.action}/10 | <strong>R:</strong> {a.result}/10</p>
                                                        <p style={styles.qText}><strong>Missing:</strong> {a.missing}</p>
                                                        <p style={styles.qText}><strong>Tip:</strong> {a.tip}</p>
                                                    </div>
                                                </div>
                                            )}

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

                {/* ── Feedback Section ── */}
                <div style={styles.feedbackSection}>
                    <h3 style={styles.sectionHeading}>Rate Your Experience</h3>
                    {feedbackStatus === "success" ? (
                        <div style={styles.feedbackSuccess}>
                            <span style={{ fontSize: "24px" }}>🎉</span>
                            <p style={{ margin: 0, fontWeight: "600" }}>Thanks for your feedback!</p>
                        </div>
                    ) : (
                        <div style={styles.feedbackForm}>
                            <div style={styles.starContainer}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span
                                        key={star}
                                        style={{ ...styles.star, color: (hoverRating || rating) >= star ? "#f59e0b" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") }}
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
                                placeholder="How can we improve?"
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                            />
                            <button
                                style={{
                                    ...styles.feedbackSubmit,
                                    opacity: feedbackStatus === "submitting" ? 0.7 : 1,
                                    cursor: feedbackStatus === "submitting" ? "not-allowed" : "pointer"
                                }}
                                onClick={handleFeedbackSubmit}
                                disabled={feedbackStatus === "submitting"}
                            >
                                {feedbackStatus === "submitting" ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Action Footer ── */}
                <div style={styles.actionFooter}>
                    <button
                        style={{ ...styles.restartBtn, ...(btnHover ? styles.restartBtnHover : {}) }}
                        className="mobile-full-width"
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
        background: isDark ? "#05060b" : "#f0f2f7",
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
    smallSpinner: {
        display: "inline-block", width: "16px", height: "16px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "white", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    
    container: {
        position: "relative", zIndex: 1,
        maxWidth: "800px", margin: "0 auto",
        padding: "40px 20px 80px",
        display: "flex", flexDirection: "column", gap: "24px",
    },

    /* ── Hero Card ── */
    heroCard: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)",
        borderRadius: "24px", padding: "40px",
        boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.05)",
        gap: "40px", flexWrap: "wrap",
        animation: "fadeInUp 0.6s ease both",
    },
    heroLeft: { flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "16px" },
    badgeWrap: { display: "flex", gap: "10px", flexWrap: "wrap" },
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

    /* Download button */
    downloadBtn: {
        padding: "16px 32px", borderRadius: "16px", border: "none",
        background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
        color: "white", fontSize: "15px", fontWeight: "700",
        cursor: "pointer", transition: "all 0.3s ease",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
        boxShadow: "0 10px 25px rgba(6,182,212,0.3)",
        animation: "fadeInUp 0.6s ease 0.1s both",
    },
    downloadBtnHover: {
        transform: "translateY(-3px)",
        boxShadow: "0 15px 35px rgba(6,182,212,0.4)",
    },

    /* ── Two Col Insights ── */
    twoCol: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px",
        animation: "fadeInUp 0.6s ease 0.2s both",
    },
    insightCard: {
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
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
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        borderRadius: "20px", padding: "28px",
        animation: "fadeInUp 0.6s ease 0.3s both",
    },
    sectionHeading: { fontSize: "18px", fontWeight: "700", marginBottom: "20px", letterSpacing: "-0.5px" },
    
    /* ── Category Breakdown ── */
    catGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" },
    catBox: { display: "flex", flexDirection: "column", gap: "8px" },
    catHead: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    catName: { fontSize: "13px", fontWeight: "600", color: isDark ? "#cbd5e1" : "#475569" },
    catVal: { fontSize: "13px", fontWeight: "700", fontFamily: "'JetBrains Mono', monospace" },
    catTrack: { height: "6px", borderRadius: "3px", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", overflow: "hidden" },
    catFill: { height: "100%", borderRadius: "3px", transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)" },

    /* ── Question Review ── */
    reviewSection: {
        animation: "fadeInUp 0.6s ease 0.4s both",
    },
    qList: { display: "flex", flexDirection: "column", gap: "12px" },
    qCard: {
        background: isDark ? "rgba(12,13,22,0.6)" : "rgba(255,255,255,0.6)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
        borderRadius: "16px", padding: "16px 20px",
        cursor: "pointer", transition: "all 0.2s ease",
    },
    qCardExpanded: {
        background: isDark ? "rgba(12,13,22,0.95)" : "#ffffff",
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
    qDetailRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" },
    qDetailBox: { display: "flex", flexDirection: "column", gap: "6px" },
    qLabel: { fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", color: isDark ? "#64748b" : "#94a3b8" },
    qText: { fontSize: "14px", lineHeight: "1.6", color: isDark ? "#94a3b8" : "#475569", margin: 0 },

    /* ── Feedback Section ── */
    feedbackSection: {
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        borderRadius: "20px", padding: "28px",
        animation: "fadeInUp 0.6s ease 0.45s both",
        marginTop: "10px",
    },
    feedbackForm: { display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" },
    starContainer: { display: "flex", gap: "8px" },
    star: { fontSize: "36px", cursor: "pointer", transition: "color 0.2s" },
    feedbackInput: {
        width: "100%", maxWidth: "500px", minHeight: "80px",
        padding: "16px", borderRadius: "12px", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
        background: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)",
        color: isDark ? "#f1f5f9" : "#1e293b", fontSize: "14px",
        fontFamily: "'Inter', sans-serif", outline: "none", resize: "vertical"
    },
    feedbackSubmit: {
        padding: "12px 24px", borderRadius: "12px", border: "none",
        background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
        color: isDark ? "#f1f5f9" : "#1e293b", fontSize: "14px", fontWeight: "600",
        transition: "all 0.2s",
    },
    feedbackSuccess: {
        display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
        padding: "20px", background: "rgba(16,185,129,0.1)", color: "#10b981",
        borderRadius: "12px"
    },

    /* ── Action Footer ── */
    actionFooter: { display: "flex", justifyContent: "center", width: "100%", animation: "fadeInUp 0.6s ease 0.5s both", marginTop: "20px" },
    restartBtn: {
        width: "100%", maxWidth: "400px",
        padding: "16px", borderRadius: "16px", border: "none",
        background: "linear-gradient(135deg, #10b981, #0ea5e9)",
        color: "white", fontSize: "16px", fontWeight: "700",
        cursor: "pointer", transition: "all 0.3s ease",
        boxShadow: "0 10px 25px rgba(16,185,129,0.3)",
    },
    restartBtnHover: {
        transform: "translateY(-3px)",
        boxShadow: "0 15px 35px rgba(16,185,129,0.4)",
    },
});

/* Inject animations and mobile responsive styles */
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
            @media (max-width: 768px) {
                .results-container { padding: 16px 12px 60px !important; gap: 16px !important; }
                .results-hero { padding: 24px !important; gap: 24px !important; flex-direction: column-reverse !important; text-align: center !important; }
                .results-hero-left { align-items: center !important; text-align: center !important; width: 100% !important; }
                .results-hero-title { font-size: 28px !important; }
                .results-hero-stats { justify-content: center !important; width: 100%; gap: 16px !important; }
                .results-q-card { padding: 14px 12px !important; }
                .results-insight { padding: 16px !important; }
                .results-card-section { padding: 16px !important; }
                .mobile-full-width { width: 100% !important; max-width: 100% !important; }
                .results-badge-wrap { justify-content: center !important; }
                .results-q-details-row { grid-template-columns: 1fr !important; }
            }
            @media (max-width: 500px) {
                .results-two-col { grid-template-columns: 1fr !important; }
                .results-cat-grid { grid-template-columns: 1fr !important; }
                .results-hero-stats { flex-direction: column !important; gap: 12px !important; }
            }
        `;
        document.head.appendChild(s);
    }
}

export default Results;