import { useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import { AuthProvider, useAuth } from "./AuthContext";
import ThemeToggle from "./components/ThemeToggle";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Interview from "./pages/Interview";
import Results from "./pages/Results";

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [page, setPage] = useState("home");
  const [sessionData, setSessionData] = useState(null);

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
      <Login onSuccess={() => setPage("home")} />
    </>
  );

  return (
    <div>
      <ThemeToggle />
      {page === "home" && (
        <Home
          user={user}
          onLogout={logout}
          onStart={(data) => {
            setSessionData(data);
            setPage("interview");
          }}
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