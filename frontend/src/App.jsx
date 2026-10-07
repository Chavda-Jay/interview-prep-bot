import { useState, useEffect } from "react";
import { ThemeProvider } from "./ThemeContext";
import { AuthProvider, useAuth } from "./AuthContext";
import ThemeToggle from "./components/ThemeToggle";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Interview from "./pages/Interview";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [page, setPageState] = useState(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get("page") || "home";
  });
  const [sessionData, setSessionData] = useState(null);
  const [loginKey, setLoginKey] = useState(0);

  const setPage = (newPage) => {
      window.history.pushState({ page: newPage }, "", `?page=${newPage}`);
      setPageState(newPage);
  };

  useEffect(() => {
      const handlePopState = (e) => {
          if (e.state && e.state.page) {
              setPageState(e.state.page);
          } else {
              const params = new URLSearchParams(window.location.search);
              setPageState(params.get("page") || "home");
          }
      };
      
      window.addEventListener("popstate", handlePopState);
      
      if (!window.history.state) {
          window.history.replaceState({ page }, "", `?page=${page}`);
      }
      
      return () => window.removeEventListener("popstate", handlePopState);
  }, [page]);

  const handleLogout = () => {
    logout();
    setLoginKey(k => k + 1); // Force Login to remount with clean state
  };

  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "#05060b", color: "#06b6d4",
      fontSize: "18px", fontFamily: "'Inter', sans-serif",
    }}>
      Loading...
    </div>
  );

  if (!user) return (
    <>
      <ThemeToggle />
      <Login key={loginKey} onSuccess={() => setPage("home")} />
    </>
  );

  return (
    <div>
      <ThemeToggle />
      {page === "home" && (
        <Home
          user={user}
          onLogout={handleLogout}
          onStart={(data) => {
            setSessionData(data);
            setPage("interview");
          }}
          onGoDashboard={() => setPage("dashboard")}
        />
      )}
      {page === "interview" && (
        <Interview
          sessionData={sessionData}
          onFinish={(data) => {
            setSessionData(data);
            setPage("results");
          }}
        />
      )}
      {page === "results" && (
        <Results
          sessionData={sessionData}
          onRestart={() => setPage("home")}
        />
      )}
      {page === "dashboard" && (
        <Dashboard
          user={user}
          onBack={() => setPage("home")}
        />
      )}
    </div>
  );
}

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              fontFamily: "'Inter', sans-serif",
              borderRadius: '10px',
            }
          }}
        />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;