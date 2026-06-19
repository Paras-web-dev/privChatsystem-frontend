import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";
import LoadingScreen from "./context/components/LoadingScreen";

const getAuthPath = () => (window.location.pathname === "/register" ? "/register" : "/login");

const AppContent = () => {
  const { user, loading } = useAuth();
  const [authPath, setAuthPath] = useState(getAuthPath);

  useEffect(() => {
    const handlePopState = () => setAuthPath(getAuthPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateAuth = (path) => (event) => {
    event?.preventDefault();
    window.history.pushState({}, "", path);
    setAuthPath(getAuthPath());
  };

  if (loading) return <LoadingScreen />;
  if (!user && authPath === "/register") {
    return <RegisterPage onNavigateLogin={navigateAuth("/login")} />;
  }
  if (!user) {
    return <LoginPage onNavigateRegister={navigateAuth("/register")} />;
  }

  return (
    <SocketProvider>
      <ChatPage />
    </SocketProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
