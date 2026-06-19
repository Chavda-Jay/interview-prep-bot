import { useState } from "react";
import { ThemeProvider } from "./ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import Home from "./pages/Home";
import Interview from "./pages/Interview";
import Results from "./pages/Results";

function App() {
  const [page, setPage] = useState("home");
  const [sessionData, setSessionData] = useState(null);

  return (
    <ThemeProvider>
      <ThemeToggle />
      <div>
        {page === "home" && (
          <Home
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
    </ThemeProvider>
  );
}

export default App;