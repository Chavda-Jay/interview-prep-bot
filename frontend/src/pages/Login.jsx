import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../ThemeContext";
import { useAuth } from "../AuthContext";
import { loginUser, registerUser, resetPassword } from "../services/api";

function Login({ onSuccess }) {
    const { isDark } = useTheme();
    const { login } = useAuth();
    const styles = useMemo(() => getStyles(isDark), [isDark]);

    const [isRegister, setIsRegister] = useState(false);
    const [isForgot, setIsForgot] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            return toast.error("Please fill all fields!");
        }
        if (!isForgot && isRegister && !name.trim()) {
            return toast.error("Please enter your name!");
        }

        if (!isForgot && isRegister) {
            if (!/^[A-Z]/.test(name.trim())) {
                return toast.error("Name must start with a capital letter!");
            }
            if (/\d/.test(name.trim())) {
                return toast.error("Name cannot contain numbers!");
            }
            if (name.trim().length < 2) {
                return toast.error("Name must be at least 2 characters!");
            }
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return toast.error("Please enter a valid email address!");
        }
        if (/[A-Z]/.test(email)) {
            return toast.error("Email address must contain only lowercase letters!");
        }

        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters!");
        }
        if (isForgot || isRegister) {
            if (!/[A-Z]/.test(password)) {
                return toast.error("Password must contain at least one uppercase letter!");
            }
            if (!/[0-9]/.test(password)) {
                return toast.error("Password must contain at least one number!");
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                return toast.error("Password must contain at least one special character!");
            }
        }

        setLoading(true);

        try {
            if (isForgot) {
                const res = await resetPassword({ email, new_password: password });
                if (res.data.success) {
                    toast.success("Password reset successful! Please sign in.");
                    setIsForgot(false);
                    setPassword("");
                } else {
                    toast.error(res.data.message || "Failed to reset password.");
                }
            } else {
                let res;
                if (isRegister) {
                    res = await registerUser({ name, email, password });
                } else {
                    res = await loginUser({ email, password });
                }

                if (res.data.success) {
                    if (isRegister) {
                        setIsRegister(false);
                        toast.success("Account created successfully! Please sign in.");
                        setPassword(""); // Clear password for security
                    } else {
                        toast.success("Signed in successfully!");
                        login(res.data.data);
                        onSuccess();
                    }
                } else {
                    toast.error(res.data.message || "Something went wrong!");
                }
            }
        } catch (err) {
            toast.error("Server error! Please try again.");
        }
        setLoading(false);
    };

    return (
        <div style={styles.page}>
            <style>
                {`
                    input[type="password"]::-ms-reveal,
                    input[type="password"]::-ms-clear {
                        display: none;
                    }
                `}
            </style>
            <div style={styles.meshBg} />
            <div style={styles.orb1} />
            <div style={styles.orb2} />
            <div style={styles.gridPattern} />

            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        Interview<span style={styles.titleAccent}>AI</span>
                    </h1>
                    <p style={styles.subtitle}>
                        {isForgot ? "Reset your password" : isRegister ? "Create your account" : "Welcome back!"}
                    </p>
                </div>

                <div style={styles.card}>
                    {!isForgot && (
                        <div style={styles.tabs}>
                            <button
                                style={{
                                    ...styles.tab,
                                    ...(isRegister ? {} : styles.tabActive),
                                }}
                                onClick={() => setIsRegister(false)}
                            >
                                Sign In
                            </button>
                            <button
                                style={{
                                    ...styles.tab,
                                    ...(isRegister ? styles.tabActive : {}),
                                }}
                                onClick={() => setIsRegister(true)}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}

                    {!isForgot && isRegister && (
                        <div style={styles.field}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                style={styles.input}
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div style={styles.field}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>{isForgot ? "New Password" : "Password"}</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <input
                                style={{ ...styles.input, paddingRight: "40px" }}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                            />
                            <div
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: isDark ? "#94a3b8" : "#64748b",
                                    transition: "color 0.2s"
                                }}
                                onClick={() => setShowPassword(!showPassword)}
                                onMouseEnter={(e) => e.currentTarget.style.color = "#06b6d4"}
                                onMouseLeave={(e) => e.currentTarget.style.color = isDark ? "#94a3b8" : "#64748b"}
                            >
                                {showPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isForgot && !isRegister && (
                        <div style={{ textAlign: "center", marginBottom: "16px" }}>
                            <span
                                style={{
                                    fontSize: "13px",
                                    color: "#06b6d4",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontFamily: "'Inter', sans-serif"
                                }}
                                onClick={() => {
                                    setIsForgot(true);
                                    setPassword("");
                                }}
                            >
                                Forgot Password?
                            </span>
                        </div>
                    )}

                    <button
                        style={{
                            ...styles.btn,
                            ...(loading ? styles.btnDisabled : {}),
                        }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <span style={styles.btnContent}>
                                <span style={styles.spinner} />
                                {isForgot ? "Resetting..." : isRegister ? "Creating Account..." : "Signing in..."}
                            </span>
                        ) : (
                            <span style={styles.btnContent}>
                                {isForgot ? "Reset Password" : isRegister ? "Sign Up" : "Sign In"}
                            </span>
                        )}
                    </button>

                    {isForgot && (
                        <div style={{ textAlign: "center", marginTop: "24px" }}>
                            <span
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "14px",
                                    color: isDark ? "#94a3b8" : "#64748b",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontFamily: "'Inter', sans-serif",
                                    transition: "all 0.2s ease"
                                }}
                                onClick={() => {
                                    setIsForgot(false);
                                    setPassword("");
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#06b6d4";
                                    e.currentTarget.style.transform = "translateX(-4px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = isDark ? "#94a3b8" : "#64748b";
                                    e.currentTarget.style.transform = "translateX(0)";
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19l-7-7 7-7" />
                                </svg>
                                Back to Sign In
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const getStyles = (isDark) => ({
    page: {
        minHeight: "100vh",
        background: isDark ? "#05060b" : "#f0f2f7",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    meshBg: {
        position: "fixed", inset: 0,
        background: isDark
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.12), transparent)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.08), transparent)",
        pointerEvents: "none",
    },
    orb1: {
        position: "fixed", top: "-18%", left: "-8%",
        width: "550px", height: "550px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
    },
    orb2: {
        position: "fixed", bottom: "-12%", right: "-8%",
        width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
    },
    gridPattern: {
        position: "fixed", inset: 0,
        backgroundImage: isDark
            ? "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)"
            : "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none",
    },
    container: {
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: "420px",
        padding: "20px",
        boxSizing: "border-box",
    },
    header: { textAlign: "center", marginBottom: "28px" },
    title: {
        fontSize: "clamp(28px, 8vw, 36px)", fontWeight: "900",
        color: isDark ? "#f1f5f9" : "#1e293b",
        letterSpacing: "-1.5px", marginBottom: "8px",
        fontFamily: "'Inter', sans-serif",
    },
    titleAccent: {
        background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    subtitle: {
        color: isDark ? "#94a3b8" : "#64748b",
        fontSize: "15px",
    },
    card: {
        background: isDark ? "rgba(12,13,22,0.9)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(24px)",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
        borderRadius: "20px", padding: "clamp(24px, 6vw, 32px)",
        boxShadow: isDark
            ? "0 20px 80px rgba(0,0,0,0.5)"
            : "0 20px 80px rgba(0,0,0,0.08)",
        boxSizing: "border-box",
    },
    tabs: {
        display: "flex", gap: "4px",
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        borderRadius: "12px", padding: "4px",
        marginBottom: "24px",
    },
    tab: {
        flex: 1, padding: "10px",
        borderRadius: "9px", border: "none",
        background: "transparent",
        color: isDark ? "#64748b" : "#94a3b8",
        fontSize: "14px", fontWeight: "600",
        cursor: "pointer", transition: "all 0.2s ease",
        fontFamily: "'Inter', sans-serif",
    },
    tabActive: {
        background: isDark ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.1)",
        color: "#06b6d4",
        boxShadow: "0 2px 8px rgba(6,182,212,0.15)",
    },
    field: { marginBottom: "16px" },
    label: {
        display: "block", marginBottom: "6px",
        fontSize: "13px", fontWeight: "600",
        color: isDark ? "#94a3b8" : "#475569",
    },
    input: {
        width: "100%", padding: "12px 16px",
        borderRadius: "12px",
        border: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.1)",
        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
        color: isDark ? "#f1f5f9" : "#1e293b",
        fontSize: "15px", fontFamily: "'Inter', sans-serif",
        outline: "none", boxSizing: "border-box",
        transition: "all 0.25s ease",
    },
    errorBox: {
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "10px", padding: "10px 14px",
        color: "#ef4444", fontSize: "13px",
        marginBottom: "16px",
    },
    successBox: {
        background: "rgba(16,185,129,0.08)",
        border: "1px solid rgba(16,185,129,0.2)",
        borderRadius: "10px", padding: "10px 14px",
        color: "#10b981", fontSize: "13px",
        marginBottom: "16px",
    },
    btn: {
        width: "100%", padding: "14px",
        borderRadius: "12px", border: "none",
        background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
        color: "white", fontSize: "15px", fontWeight: "700",
        fontFamily: "'Inter', sans-serif", cursor: "pointer",
        transition: "all 0.3s ease",
    },
    btnDisabled: {
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        color: isDark ? "#4b5563" : "#94a3b8", cursor: "not-allowed",
    },
    btnContent: {
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: "8px",
    },
    spinner: {
        display: "inline-block", width: "16px", height: "16px",
        border: "2px solid rgba(255,255,255,0.25)",
        borderTopColor: "white", borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
    },
});

export default Login;