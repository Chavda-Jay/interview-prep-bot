import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "./services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("interview_token");
        if (token) {
            getMe(token)
                .then(res => {
                    if (res.data.success) {
                        setUser({
                            ...res.data.data,
                            token
                        });
                    } else {
                        localStorage.removeItem("interview_token");
                    }
                })
                .catch(() => localStorage.removeItem("interview_token"))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem("interview_token", userData.token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("interview_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}