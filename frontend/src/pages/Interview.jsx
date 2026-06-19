import { useState, useMemo } from "react";
import { submitAnswer, getNextQuestion, endInterview } from "../services/api";
import { useTheme } from "../ThemeContext";
// import CosmicBackground from "../components/CosmicBackground";

function Interview({ sessionData, onFinish }) {
    const { isDark } = useTheme();
    const styles = useMemo(() => getStyles(isDark), [isDark]);

    const TOTAL_QUESTIONS = sessionData?.total_questions || 10;
    const [question, setQuestion] = useState(sessionData?.question || "");
    const [questionType, setQuestionType] = useState(sessionData?.question_type || "descriptive");
    const [options, setOptions] = useState(sessionData?.options || []);
    const [correctAnswer, setCorrectAnswer] = useState(sessionData?.correct_answer || "");
    const [answer, setAnswer] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(false);
    const [questionCount, setQuestionCount] = useState(1);
    const [submitHover, setSubmitHover] = useState(false);

    const progress = Math.round((questionCount / TOTAL_QUESTIONS) * 100);

    const handleSubmit = async () => {
        if (questionType === "mcq" && !selectedOption) return alert("Please select an option!");
        if (questionType === "descriptive" && !answer.trim()) return alert("Please write an answer!");

        setLoading(true);
        try {
            // Submit the answer
            const payload = {
                session_id: sessionData.session_id,
                question: question,
                user_answer: questionType === "mcq" ? selectedOption : answer,
                skill: sessionData.skill,
                question_type: questionType,
            };

            if (questionType === "mcq") {
                payload.options = options;
                payload.correct_answer = correctAnswer;
            }

            await submitAnswer(payload);

            // Directly move to next question or finish
            if (questionCount < TOTAL_QUESTIONS) {
                const nextRes = await getNextQuestion(sessionData.session_id);
                setQuestion(nextRes.data.question);
                setQuestionType(nextRes.data.question_type);
                setOptions(nextRes.data.options || []);
                setCorrectAnswer(nextRes.data.correct_answer || "");
                setAnswer("");
                setSelectedOption(null);
                setQuestionCount((prev) => prev + 1);
            } else {
                await endInterview(sessionData.session_id);
                onFinish({
                    session_id: sessionData.session_id,
                    skill: sessionData.skill,
                });
            }
        } catch (err) {
            alert("Error submitting answer!");
        }
        setLoading(false);
    };

    const handleFinish = async () => {
        await endInterview(sessionData.session_id);
        onFinish({ session_id: sessionData.session_id, skill: sessionData.skill });
    };

    const getOptionStyle = (opt) => {
        const letter = opt.charAt(0);
        const isSelected = selectedOption === letter;
        if (isSelected) return { ...styles.option, ...styles.optionSelected };
        return styles.option;
    };

    return (
        <div style={styles.page}>
            <div style={styles.meshBg} />
            <div style={styles.bgImage} />
            <div style={styles.bgImageOverlay} />
            <div style={styles.orb1} />
            <div style={styles.orb2} />
            <div style={styles.gridPattern} />

            <div style={styles.container}>
                {/* Top Bar */}
                <div style={styles.topBar}>
                    <div style={styles.badges}>
                        <span style={styles.badge}>{sessionData?.skill}</span>
                        <span style={styles.badge}>{sessionData?.level}</span>
                        <span style={{
                            ...styles.badge,
                            ...(questionType === "mcq" ? styles.badgeMcq : styles.badgeDesc),
                        }}>
                            {questionType === "mcq" ? "MCQ" : "Descriptive"}
                        </span>
                    </div>
                    <span style={styles.qCounter}>
                        Q{questionCount}<span style={styles.qTotal}>/{TOTAL_QUESTIONS}</span>
                    </span>
                </div>

                {/* Progress Bar */}
                <div style={styles.progressWrap}>
                    <div style={styles.progressTrack}>
                        <div style={{
                            ...styles.progressFill,
                            width: `${progress}%`,
                        }} />
                    </div>
                    <span style={styles.progressPct}>{progress}%</span>
                </div>

                {/* Question Card */}
                <div style={styles.questionCard}>
                    <div style={styles.questionHeader}>
                        <span style={styles.questionLabel}>
                            Question {questionCount}
                            <span style={styles.questionTypeLabel}>
                                {questionType === "mcq" ? " — Multiple Choice" : " — Descriptive"}
                            </span>
                        </span>
                    </div>
                    <p style={styles.questionText}>{question}</p>
                </div>

                {/* MCQ Options */}
                {questionType === "mcq" && (
                    <div style={styles.optionsGrid}>
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                style={getOptionStyle(opt)}
                                onClick={() => setSelectedOption(opt.charAt(0))}
                            >
                                <span style={styles.optionLetter}>{opt.charAt(0)}</span>
                                <span style={styles.optionText}>{opt.substring(3)}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Descriptive Textarea */}
                {questionType === "descriptive" && (
                    <textarea
                        style={styles.textarea}
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows={6}
                    />
                )}

                {/* Submit Button */}
                <button
                    style={{
                        ...styles.submitBtn,
                        ...(loading ? styles.submitBtnDisabled : {}),
                        ...(submitHover && !loading ? styles.submitBtnHover : {}),
                    }}
                    onClick={handleSubmit}
                    disabled={loading}
                    onMouseEnter={() => setSubmitHover(true)}
                    onMouseLeave={() => setSubmitHover(false)}
                >
                    {loading ? (
                        <span style={styles.btnContent}>
                            <span style={styles.spinner} />
                            {questionCount < TOTAL_QUESTIONS ? "Submitting & Loading Next..." : "Submitting & Finishing..."}
                        </span>
                    ) : (
                        <span style={styles.btnContent}>
                            {questionCount < TOTAL_QUESTIONS ? "Submit & Next →" : "Submit & See Results 🏆"}
                        </span>
                    )}
                </button>

                {/* Finish Early */}
                {questionCount < TOTAL_QUESTIONS && (
                    <button style={styles.finishEarlyBtn} onClick={handleFinish}>
                        Finish Early 🏁
                    </button>
                )}
            </div>
        </div>
    );
}

const getStyles = (isDark) => ({
    meshBg: {
        position: "fixed", inset: 0,
        background: isDark
            ? "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(6,182,212,0.1), transparent)"
            : "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(6,182,212,0.07), transparent)",
        pointerEvents: "none",
    },
    bgImage: {
        position: "fixed", inset: 0,
        backgroundImage: "url('/ai-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity: isDark ? 0.3 : 0.1,
        mixBlendMode: isDark ? "screen" : "multiply",
        transition: "opacity 0.6s ease",
        pointerEvents: "none",
    },
    bgImageOverlay: {
        position: "fixed", inset: 0,
        background: isDark
            ? "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(5,6,11,0.7) 100%)"
            : "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(245,247,250,0.85) 100%)",
        pointerEvents: "none",
        transition: "background 0.6s ease",
    },
    orb1: {
        position: "fixed", top: "5%", left: "-5%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: isDark
            ? "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
        filter: "blur(80px)", animation: "orbFloat1 14s ease-in-out infinite",
        pointerEvents: "none",
    },
    orb2: {
        position: "fixed", bottom: "0", right: "-10%",
        width: "500px", height: "500px", borderRadius: "50%",
        background: isDark
            ? "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
        filter: "blur(80px)", animation: "orbFloat2 17s ease-in-out infinite",
        pointerEvents: "none",
    },
    gridPattern: {
        position: "fixed", inset: 0,
        backgroundImage: isDark
            ? "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)"
            : "linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none",
    },
    page: {
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: isDark ? "#05060b" : "#f5f7fa",
        transition: "background 0.4s ease",
    },
    container: {
        position: "relative", zIndex: 1,
        maxWidth: "680px", margin: "0 auto",
        padding: "40px 20px 60px",
    },
    topBar: {
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
        animation: "fadeInUp 0.5s var(--ease-out) both",
    },
    badges: { display: "flex", gap: "8px", flexWrap: "wrap" },
    badge: {
        padding: "5px 14px", borderRadius: "9999px",
        background: isDark ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.1)",
        border: isDark ? "1px solid rgba(6,182,212,0.15)" : "1px solid rgba(6,182,212,0.2)",
        color: "#06b6d4", fontSize: "12px", fontWeight: "600",
    },
    badgeMcq: {
        background: isDark ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.12)",
        border: isDark ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(139,92,246,0.25)",
        color: "#8b5cf6",
    },
    badgeDesc: {
        background: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.1)",
        border: isDark ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(16,185,129,0.2)",
        color: "#10b981",
    },
    qCounter: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "16px", fontWeight: "700",
        color: isDark ? "#f1f5f9" : "#1e293b",
    },
    qTotal: { color: isDark ? "#4b5563" : "#94a3b8" },
    progressWrap: {
        display: "flex", alignItems: "center", gap: "12px",
        marginBottom: "24px",
        animation: "fadeInUp 0.55s var(--ease-out) 0.05s both",
    },
    progressTrack: {
        flex: 1, height: "4px", borderRadius: "2px",
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%", borderRadius: "2px",
        background: "linear-gradient(90deg, #06b6d4, #8b5cf6)",
        transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    progressPct: {
        fontSize: "12px", fontWeight: "700",
        color: isDark ? "#4b5563" : "#94a3b8",
        fontFamily: "'JetBrains Mono', monospace",
        minWidth: "36px", textAlign: "right",
    },

    /* Question Card */
    questionCard: {
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "18px", padding: "28px",
        marginBottom: "16px",
        boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "0 20px 60px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
        animation: "fadeInUp 0.6s var(--ease-out) 0.1s both",
    },
    questionHeader: { marginBottom: "14px" },
    questionLabel: {
        fontSize: "11px", fontWeight: "700",
        color: "#06b6d4", textTransform: "uppercase",
        letterSpacing: "0.8px",
    },
    questionTypeLabel: {
        color: isDark ? "#4b5563" : "#94a3b8",
        textTransform: "none",
        fontWeight: "500",
    },
    questionText: {
        fontSize: "17px", fontWeight: "500",
        color: isDark ? "#e2e8f0" : "#1e293b",
        lineHeight: "1.7", margin: 0,
    },

    /* MCQ Options */
    optionsGrid: {
        display: "flex", flexDirection: "column", gap: "10px",
        marginBottom: "16px",
        animation: "fadeInUp 0.65s var(--ease-out) 0.12s both",
    },
    option: {
        display: "flex", alignItems: "center", gap: "14px",
        padding: "16px 20px", borderRadius: "14px",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        background: isDark ? "rgba(12,13,22,0.8)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        color: isDark ? "#e2e8f0" : "#1e293b",
        fontSize: "14px", fontFamily: "'Inter', sans-serif",
        cursor: "pointer", textAlign: "left",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    },
    optionSelected: {
        borderColor: "#06b6d4",
        background: isDark ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.06)",
        boxShadow: "0 0 0 1px rgba(6,182,212,0.3)",
    },
    optionCorrect: {
        borderColor: "#10b981",
        background: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)",
        boxShadow: "0 0 0 1px rgba(16,185,129,0.3)",
    },
    optionWrong: {
        borderColor: "#ef4444",
        background: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.08)",
        boxShadow: "0 0 0 1px rgba(239,68,68,0.3)",
    },
    optionDisabled: {
        opacity: 0.5,
        cursor: "default",
    },
    optionLetter: {
        width: "32px", height: "32px",
        borderRadius: "10px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: "700", fontSize: "13px",
        fontFamily: "'JetBrains Mono', monospace",
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        color: "#06b6d4",
        flexShrink: 0,
    },
    optionText: {
        flex: 1,
        fontWeight: "500",
    },
    checkMark: {
        color: "#10b981", fontSize: "18px", fontWeight: "700",
        marginLeft: "auto",
    },
    crossMark: {
        color: "#ef4444", fontSize: "18px", fontWeight: "700",
        marginLeft: "auto",
    },

    /* Textarea */
    textarea: {
        width: "100%", padding: "16px 18px",
        borderRadius: "14px",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.1)",
        background: isDark ? "rgba(12,13,22,0.8)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        color: isDark ? "#f1f5f9" : "#1e293b",
        fontSize: "14px", fontFamily: "'Inter', sans-serif",
        resize: "vertical", outline: "none",
        boxSizing: "border-box", marginBottom: "12px",
        lineHeight: "1.6",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        animation: "fadeInUp 0.65s var(--ease-out) 0.15s both",
    },

    /* Feedback Card */
    feedbackCard: {
        background: isDark ? "rgba(12,13,22,0.95)" : "rgba(255,255,255,0.9)",
        backdropFilter: "blur(24px)",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "18px", padding: "24px",
        marginBottom: "16px",
        boxShadow: isDark
            ? "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)"
            : "0 20px 60px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)",
        animation: "fadeInUp 0.4s var(--ease-out) both",
    },
    feedbackHeader: {
        display: "flex", alignItems: "center", gap: "12px",
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)",
    },
    feedbackScore: {
        fontSize: "22px", fontWeight: "800",
        fontFamily: "'JetBrains Mono', monospace",
        padding: "6px 16px",
        borderRadius: "12px",
        border: "1px solid",
    },
    feedbackBadge: {
        fontSize: "13px", fontWeight: "700",
        padding: "5px 14px", borderRadius: "9999px",
    },
    feedbackBody: {
        display: "flex", flexDirection: "column", gap: "14px",
    },
    feedbackSection: {
        display: "flex", flexDirection: "column", gap: "5px",
    },
    feedbackLabel: {
        fontSize: "10px", fontWeight: "700",
        color: "#4b5563", textTransform: "uppercase",
        letterSpacing: "0.6px",
    },
    feedbackText: {
        fontSize: "14px", lineHeight: "1.7",
        color: isDark ? "#94a3b8" : "#475569",
        margin: 0,
    },

    /* Buttons */
    submitBtn: {
        width: "100%", padding: "15px 24px",
        borderRadius: "14px", border: "none",
        background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
        color: "white", fontSize: "15px", fontWeight: "700",
        fontFamily: "'Inter', sans-serif", cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        animation: "fadeInUp 0.7s var(--ease-out) 0.2s both",
    },
    submitBtnHover: {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 32px rgba(6,182,212,0.3), 0 0 60px rgba(139,92,246,0.1)",
    },
    submitBtnDisabled: {
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        color: isDark ? "#4b5563" : "#94a3b8", cursor: "not-allowed",
    },
    btnContent: {
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: "8px",
    },
    spinner: {
        display: "inline-block", width: "16px", height: "16px",
        border: isDark ? "2px solid rgba(255,255,255,0.25)" : "2px solid rgba(6,182,212,0.25)",
        borderTopColor: isDark ? "white" : "#06b6d4", borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
    },
    finishEarlyBtn: {
        width: "100%", padding: "12px 24px",
        borderRadius: "14px", marginTop: "10px",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.08)",
        background: "transparent",
        color: isDark ? "#4b5563" : "#94a3b8",
        fontSize: "14px", fontWeight: "600",
        fontFamily: "'Inter', sans-serif", cursor: "pointer",
        transition: "all 0.25s ease",
    },
});

export default Interview;