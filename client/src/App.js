import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./pages/DashboardLayout";
import HabitsPage from "./pages/HabitsPage";
import FocusPage from "./pages/FocusPage";
import TablePage from "./pages/TablePage";

import Navbar from "./components/Navbar";
import { TimerProvider } from "./context/TimerContext";

function AnimatedRoutes() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsLoggedIn(!!userId);
  }, []);

  const showNavbar = isLoggedIn && location.pathname.startsWith("/dashboard");

  return (
    <>
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<HabitsPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="focus" element={<FocusPage />} />
            <Route path="table" element={<TablePage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <TimerProvider>
      <Router>
        <div style={{ 
          minHeight: '100vh', 
          width: '100%',
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0f2847 100%)',
          margin: 0,
          padding: 0,
        }}>
          <AnimatedRoutes />
        </div>
      </Router>
    </TimerProvider>
  );
}

export default App;
