import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import LandingPage from "./components/LandingPage";
import NameSelection from "./components/NameSelection";
import KeySetup from "./components/KeySetup";
import UpdateKey from "./components/UpdateKey";
import Login from "./components/Login";
import WaitingPage from "./components/WaitingPage";
import Dashboard from "./components/Dashboard";
import { verifyToken } from "./utils/api";

// Protected Route component for Dashboard
function ProtectedDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      verifyToken()
        .then((data) => {
          setUser(JSON.parse(savedUser));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🎁
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return <Dashboard user={user} onLogout={handleLogout} />;
}

// Protected Route component for Waiting Page
function ProtectedWaiting() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      verifyToken()
        .then(() => {
          // Token is valid
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      window.location.href = "/";
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-green-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🎁
        </motion.div>
      </div>
    );
  }

  return <WaitingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/name" element={<NameSelection />} />
        <Route path="/key" element={<KeySetup />} />
        <Route path="/key/update" element={<UpdateKey />} />
        <Route path="/login" element={<Login />} />
        <Route path="/waiting" element={<ProtectedWaiting />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
