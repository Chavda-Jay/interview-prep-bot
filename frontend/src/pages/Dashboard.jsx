import React, { useState, useEffect, useMemo } from "react";
import { getAnalytics } from "../services/api";
import { useTheme } from "../ThemeContext";
import CosmicBackground from "../components/CosmicBackground";

function Dashboard({ user, onBack }) {
    const { isDark } = useTheme();
    const styles = useMemo(() => getStyles(isDark), [isDark]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch analytics by user name (as per our updated logic)
                const res = await getAnalytics(user?.name || "Guest");
                setData(res.data);
            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user]);

    // Helpers
    const getChartPath = (pts, width, height) => {
        if (pts.length === 0) return "";
        if (pts.length === 1) return `M 0,${height - (pts[0] / 100) * height} L ${width},${height - (pts[0] / 100) * height}`;
        
        const dx = width / (pts.length - 1);
        let path = `M 0,${height - (pts[0] / 100) * height}`;
        
        for (let i = 0; i < pts.length - 1; i++) {
            const x0 = i * dx;
            const y0 = height - (pts[i] / 100) * height;
            const x1 = (i + 1) * dx;
            const y1 = height - (pts[i + 1] / 100) * height;
            const cx = (x0 + x1) / 2;
            path += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
        }
        return path;
    };

    if (loading) {
        return (
            <div style={styles.page}>
                <CosmicBackground />
                <div style={styles.container}>
                    <div style={{ color: "#06b6d4", fontSize: "18px", fontFamily: "'Inter', sans-serif" }}>
                        Loading Dashboard...
                    </div>
                </div>
            </div>
        );
    }

    if (!data || data.total_sessions === 0) {
        return (
            <div style={styles.page}>
                <CosmicBackground />
                <div style={styles.container}>
                    <button style={styles.backBtn} onClick={onBack}>← Back to Home</button>
                    <div style={{ ...styles.card, textAlign: "center", padding: "60px 20px" }}>
                        <h2 style={{ color: isDark ? "#f1f5f9" : "#1e293b", fontSize: "24px", marginBottom: "16px" }}>No interviews yet!</h2>
                        <p style={{ color: isDark ? "#94a3b8" : "#64748b", marginBottom: "32px" }}>
                            Start your first interview to see analytics.
                        </p>
                        <button style={styles.startBtn} onClick={onBack}>Start Interview →</button>
                    </div>
                </div>
            </div>
        );
    }

    const {
        total_sessions, best_score, average_score, streak_days,
        skill_performance, category_averages, weak_areas,
        recent_sessions, progress_data, achievements
    } = data;

    const chartWidth = 500;
    const chartHeight = 200;
    const chartPath = getChartPath(progress_data, chartWidth, chartHeight);

    // Badges array for section 6
    const allBadges = [
        { name: "🔥 First Interview", desc: "Completed 1st interview" },
        { name: "⭐ High Scorer", desc: "Scored 90%+ once" },
        { name: "💪 Consistent", desc: "5 interviews completed" },
        { name: "📈 Improver", desc: "Improved score 3 times in a row" },
        { name: "🎯 Skill Master", desc: "80%+ in any skill" }
    ];

    return (
        <div style={styles.page}>
            <CosmicBackground />
            
            <div style={styles.container}>
                <div style={styles.headerRow}>
                    <button style={styles.backBtn} onClick={onBack}>← Back to Home</button>
                    <div style={{ textAlign: "right" }}>
                        <h1 style={styles.pageTitle}>📊 Your Analytics</h1>
                        <p style={styles.pageSub}>Track your interview journey</p>
                    </div>
                </div>

                {/* 1. Stats Cards Row */}
                <div style={styles.statsRow}>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Total Sessions</div>
                        <div style={styles.statValue}>{total_sessions}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Best Score</div>
                        <div style={styles.statValue}>{best_score}%</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Average Score</div>
                        <div style={styles.statValue}>{average_score}%</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statLabel}>Current Streak</div>
                        <div style={styles.statValue}>{streak_days} {streak_days === 1 ? 'day' : 'days'}</div>
                    </div>
                </div>

                <div style={styles.grid}>
                    {/* 2. Progress Chart */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Progress (Last {progress_data.length} sessions)</h3>
                        {progress_data.length < 2 ? (
                            <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? "#94a3b8" : "#64748b", fontSize: "14px" }}>
                                Complete more interviews to see progress chart
                            </div>
                        ) : (
                            <div style={styles.chartContainer}>
                                <svg width="100%" height="100%" viewBox={`0 -20 ${chartWidth} ${chartHeight + 40}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                    {/* Grid Lines */}
                                    <line x1="0" y1="0" x2={chartWidth} y2="0" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                    <line x1="0" y1={chartHeight/2} x2={chartWidth} y2={chartHeight/2} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                    <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                                    
                                    {/* Path Area Gradient */}
                                    <defs>
                                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(6,182,212,0.3)" />
                                            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                                        </linearGradient>
                                    </defs>
                                    <path d={`${chartPath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`} fill="url(#chartGrad)" />
                                    
                                    {/* Line */}
                                    <path d={chartPath} fill="none" stroke="#06b6d4" strokeWidth="3" />
                                    
                                    {/* Points */}
                                    {progress_data.map((pts, i) => {
                                        const cx = i * (chartWidth / (progress_data.length - 1));
                                        const cy = chartHeight - (pts / 100) * chartHeight;
                                        return (
                                            <g key={i}>
                                                <circle cx={cx} cy={cy} r="5" fill="#05060b" stroke="#06b6d4" strokeWidth="2" />
                                                <text x={cx} y={cy - 12} fill={isDark ? "#f1f5f9" : "#1e293b"} fontSize="12" textAnchor="middle" fontWeight="600">{pts}%</text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* 3. Skill Performance */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Skill Performance</h3>
                        <div style={styles.barList}>
                            {Object.entries(skill_performance).length === 0 ? (
                                <p style={styles.emptyText}>No skill data yet.</p>
                            ) : (
                                Object.entries(skill_performance).map(([skill, score], i) => {
                                    let color = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
                                    return (
                                        <div key={skill} style={styles.barRow}>
                                            <div style={styles.barLabel}>{skill}</div>
                                            <div style={styles.barTrack}>
                                                <div style={{...styles.barFill, width: `${score}%`, background: color, animationDelay: `${i * 0.1}s`}}></div>
                                            </div>
                                            <div style={styles.barValue}>{score}%</div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* 4. Category Performance */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Category Analysis</h3>
                        <div style={styles.barList}>
                            {Object.entries(category_averages).length === 0 ? (
                                <p style={styles.emptyText}>No category data yet.</p>
                            ) : (
                                Object.entries(category_averages).map(([cat, score], i) => (
                                    <div key={cat} style={styles.barRow}>
                                        <div style={{...styles.barLabel, textTransform: "capitalize"}}>{cat.replace('_', ' ')}</div>
                                        <div style={styles.barTrack}>
                                            <div style={{...styles.barFill, width: `${score}%`, background: "#8b5cf6", animationDelay: `${i * 0.1}s`}}></div>
                                        </div>
                                        <div style={styles.barValue}>{score}%</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* 5. Top Weak Areas */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Top Areas to Improve</h3>
                        {weak_areas.length === 0 ? (
                            <p style={styles.emptyText}>No weak areas detected yet!</p>
                        ) : (
                            <div style={styles.tagGrid}>
                                {weak_areas.map((w, i) => (
                                    <div key={i} style={styles.weakTag}>
                                        {w.topic} <span style={styles.weakCount}>({w.count}x)</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 6. Achievements */}
                    <div style={{...styles.card, gridColumn: "1 / -1"}}>
                        <h3 style={styles.cardTitle}>Achievements</h3>
                        <div style={styles.badgeGrid}>
                            {allBadges.map((badge, i) => {
                                const earned = achievements.includes(badge.name);
                                return (
                                    <div key={i} style={earned ? styles.badgeEarned : styles.badgeLocked}>
                                        <div style={styles.badgeIcon}>{badge.name.split(' ')[0]}</div>
                                        <div style={styles.badgeInfo}>
                                            <div style={earned ? styles.badgeName : styles.badgeNameLocked}>{badge.name.substring(badge.name.indexOf(' ') + 1)}</div>
                                            <div style={styles.badgeDesc}>{badge.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 7. Recent Sessions */}
                    <div style={{...styles.card, gridColumn: "1 / -1"}}>
                        <h3 style={styles.cardTitle}>Recent Interviews</h3>
                        {recent_sessions.length === 0 ? (
                            <p style={styles.emptyText}>No sessions yet.</p>
                        ) : (
                            <div style={styles.tableWrap}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Date</th>
                                            <th style={styles.th}>Skill</th>
                                            <th style={styles.th}>Level</th>
                                            <th style={styles.th}>Type</th>
                                            <th style={styles.th}>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_sessions.map((s, i) => (
                                            <tr key={i} style={styles.tr}>
                                                <td style={styles.td}>{s.date}</td>
                                                <td style={styles.td}>{s.skill}</td>
                                                <td style={{...styles.td, textTransform: "capitalize"}}>{s.level}</td>
                                                <td style={styles.td}>{s.type}</td>
                                                <td style={{...styles.td, fontWeight: "600", color: s.score >= 70 ? "#10b981" : s.score >= 50 ? "#f59e0b" : "#ef4444"}}>{s.score}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const getStyles = (isDark) => ({
    page: {
        minHeight: "100vh",
        position: "relative",
        background: isDark ? "#05060b" : "#f5f7fa",
        fontFamily: "'Inter', sans-serif",
        paddingBottom: "60px",
    },
    container: {
        position: "relative",
        zIndex: 1,
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px 20px",
    },
    headerRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "32px",
        animation: "fadeInUp 0.5s ease both",
    },
    backBtn: {
        background: "transparent",
        border: "none",
        color: "#06b6d4",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        padding: "8px 0",
        display: "inline-flex",
        alignItems: "center",
        transition: "color 0.2s",
    },
    pageTitle: {
        fontSize: "28px",
        fontWeight: "800",
        color: isDark ? "#f1f5f9" : "#1e293b",
        margin: 0,
    },
    pageSub: {
        fontSize: "14px",
        color: isDark ? "#94a3b8" : "#64748b",
        margin: "4px 0 0 0",
    },
    statsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
        animation: "fadeInUp 0.6s ease 0.1s both",
    },
    statCard: {
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    statLabel: {
        fontSize: "13px",
        fontWeight: "600",
        color: isDark ? "#94a3b8" : "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
    },
    statValue: {
        fontSize: "32px",
        fontWeight: "800",
        background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "24px",
        animation: "fadeInUp 0.7s ease 0.2s both",
    },
    card: {
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)",
        borderRadius: "20px",
        padding: "28px",
    },
    cardTitle: {
        fontSize: "16px",
        fontWeight: "700",
        color: isDark ? "#f1f5f9" : "#1e293b",
        margin: "0 0 20px 0",
    },
    chartContainer: {
        width: "100%",
        height: "200px",
        marginTop: "20px",
    },
    barList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    barRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    barLabel: {
        width: "120px",
        fontSize: "13px",
        fontWeight: "500",
        color: isDark ? "#cbd5e1" : "#475569",
    },
    barTrack: {
        flex: 1,
        height: "8px",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        borderRadius: "4px",
        overflow: "hidden",
    },
    barFill: {
        height: "100%",
        borderRadius: "4px",
        animation: "fillWidth 1s var(--ease-out) both",
    },
    barValue: {
        width: "36px",
        textAlign: "right",
        fontSize: "13px",
        fontWeight: "700",
        color: isDark ? "#f1f5f9" : "#1e293b",
    },
    emptyText: {
        color: isDark ? "#64748b" : "#94a3b8",
        fontSize: "14px",
        fontStyle: "italic",
    },
    tagGrid: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
    },
    weakTag: {
        background: "rgba(239,68,68,0.1)",
        color: "#ef4444",
        border: "1px solid rgba(239,68,68,0.2)",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: "600",
    },
    weakCount: {
        opacity: 0.7,
        fontSize: "11px",
    },
    badgeGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "12px",
    },
    badgeEarned: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "12px",
    },
    badgeLocked: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        background: "transparent",
        border: isDark ? "1px dashed rgba(255,255,255,0.1)" : "1px dashed rgba(0,0,0,0.1)",
        borderRadius: "12px",
        opacity: 0.4,
        filter: "grayscale(100%)",
    },
    badgeIcon: {
        fontSize: "24px",
    },
    badgeInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "2px",
    },
    badgeName: {
        fontSize: "13px",
        fontWeight: "700",
        color: isDark ? "#f1f5f9" : "#1e293b",
    },
    badgeNameLocked: {
        fontSize: "13px",
        fontWeight: "600",
        color: isDark ? "#94a3b8" : "#64748b",
    },
    badgeDesc: {
        fontSize: "11px",
        color: isDark ? "#64748b" : "#94a3b8",
    },
    tableWrap: {
        overflowX: "auto",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left",
    },
    th: {
        padding: "12px",
        fontSize: "12px",
        fontWeight: "600",
        color: isDark ? "#94a3b8" : "#64748b",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
        textTransform: "uppercase",
    },
    td: {
        padding: "12px",
        fontSize: "14px",
        color: isDark ? "#cbd5e1" : "#475569",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
    },
    tr: {
        transition: "background 0.2s",
    },
    startBtn: {
        background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
        color: "white",
        border: "none",
        padding: "12px 24px",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
    }
});

/* Inject keyframes for animations if needed */
if (typeof document !== "undefined") {
  const id = "dashboard-animations-style";
  if (!document.getElementById(id)) {
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `
      @keyframes fillWidth {
          0% { width: 0; }
      }
      @media (max-width: 768px) {
        .responsive-dashboard-grid { grid-template-columns: 1fr !important; }
      }
    `;
    document.head.appendChild(s);
  }
}

export default Dashboard;
