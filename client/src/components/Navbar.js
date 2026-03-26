import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTimer } from "../context/TimerContext";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const dropdownRef = useRef(null);
  const { isRunning, isPaused, seconds, selectedHabit, pauseTimer, resumeTimer, stopTimer } = useTimer();

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const userGender = localStorage.getItem("userGender");
  
  const getAvatarUrl = () => {
    const seed = userId || 'default';
    const bg = '0a1628';
    if (userGender === 'female') {
      return `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=${bg}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bg}`;
  };
  
  const avatarUrl = getAvatarUrl();

  useEffect(() => {
    const loggedIn = !!userId;
    setIsLoggedIn(loggedIn);
    setMounted(true);

    const handleStorageChange = () => {
      const newUserId = localStorage.getItem("userId");
      setIsLoggedIn(!!newUserId);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setShowDropdown(false);
    navigate("/");
  };

  const submitQuery = async () => {
    if (!query.trim()) return;
    setSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/contact/submit", {
        name: userName || "Anonymous",
        email: "jitendranishad347@gmail.com",
        query: query
      });
      setSubmitSuccess(true);
      setQuery("");
      setTimeout(() => {
        setShowContactModal(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting query:", error);
      alert("Failed to submit query. Please try again.");
    }
    setSubmitting(false);
  };

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showTimer = (isRunning || isPaused) && seconds > 0;
  const isFocusPage = location.pathname.includes('/dashboard/focus');

  if (!mounted || !isLoggedIn) return null;

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/focus')) return 'focus';
    if (path.includes('/dashboard/table')) return 'table';
    return 'habits';
  };

  const activeTab = getActiveTab();

  const tabs = [
    { id: 'habits', label: 'Habits', icon: '📝', path: '/dashboard/habits' },
    { id: 'focus', label: 'Focus Time', icon: '⏱️', path: '/dashboard/focus' },
    { id: 'table', label: 'Table', icon: '📅', path: '/dashboard/table' }
  ];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%, rgba(34, 197, 94, 0.1) 100%)',
            pointerEvents: 'none'
        }}
      />
      <div style={{
        padding: "16px 20px",
        background: "rgba(10, 22, 40, 0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
        position: 'relative',
        zIndex: 1,
        width: '100%',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <motion.img 
              src="/logo.svg" 
              alt="Logo" 
              animate={{ rotate: [0, -3, 3, -3, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              style={{
                width: '36px',
                height: '36px',
                objectFit: 'contain'
              }}
            />
            <span style={{
              color: "#fff", 
              fontWeight: '800', 
              fontSize: '18px',
              background: 'linear-gradient(135deg, #fff 0%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Smart Habit Tracker
            </span>
          </Link>
        </div>

        {showTimer && !isFocusPage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            background: isRunning ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            borderRadius: '10px',
            border: isRunning ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(245, 158, 11, 0.5)'
          }}>
            <span style={{
              fontSize: '20px',
              fontWeight: '800',
              fontFamily: 'monospace',
              color: isRunning ? '#22c55e' : '#f59e0b',
              textShadow: isRunning ? '0 0 10px rgba(34, 197, 94, 0.5)' : '0 0 10px rgba(245, 158, 11, 0.5)'
            }}>
              {formatTime(seconds)}
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedHabit?.title}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {isRunning ? (
                <button
                  onClick={pauseTimer}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    background: 'rgba(245, 158, 11, 0.3)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  ⏸
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    background: 'rgba(34, 197, 94, 0.3)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  ▶
                </button>
              )}
              <button
                onClick={stopTimer}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  background: 'rgba(239, 68, 68, 0.3)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                ⏹
              </button>
            </div>
          </div>
        )}

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <motion.button 
            onClick={() => setShowDropdown(!showDropdown)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '4px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(34, 197, 94, 0.3) 100%)',
              border: '2px solid rgba(59, 130, 246, 0.5)',
              borderRadius: '50%',
              cursor: 'pointer',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
            }}
          >
            <img 
              src={avatarUrl} 
              alt="Profile" 
              style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)'
              }} 
            />
          </motion.button>
          
          {showDropdown && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '10px',
                background: 'linear-gradient(135deg, rgba(15, 40, 71, 0.98) 0%, rgba(10, 22, 40, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '16px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
                padding: '8px',
                minWidth: '200px',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
                marginBottom: '8px'
              }}>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>
                  {userName || 'User'}
                </div>
                <div style={{ color: 'rgba(96, 165, 250, 0.7)', fontSize: '12px' }}>
                  {userId ? `ID: ${userId.slice(-6)}` : 'Guest'}
                </div>
              </div>
              
              <button 
                onClick={() => setShowDropdown(false)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                👤 My Profile
              </button>
              
              <button 
                onClick={() => setShowDropdown(false)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                ⚙️ Settings
              </button>
              
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  setShowContactModal(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#a78bfa',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  marginBottom: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                }}
              >
                📧 Contact
              </button>
              
              <button 
                onClick={logout}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fca5a5',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                🚪 Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
      
      <div style={{
        padding: '10px 16px',
        background: "rgba(10, 22, 40, 0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        position: 'relative',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {tabs.map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            style={{ textDecoration: 'none' }}
          >
            <motion.div
              animate={{
                backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 0.1)',
                scale: activeTab === tab.id ? 1.02 : 1,
                y: activeTab === tab.id ? -2 : 0
              }}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '700',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : 'rgba(59, 130, 246, 0.1)',
                color: activeTab === tab.id ? '#fff' : 'rgba(96, 165, 250, 0.7)',
                border: activeTab === tab.id 
                  ? 'none'
                  : '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: activeTab === tab.id 
                  ? '0 4px 15px rgba(59, 130, 246, 0.4)'
                  : 'none',
                position: 'relative',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <span style={{ marginRight: '6px' }}>{tab.icon}</span>
              {tab.label}
            </motion.div>
          </Link>
        ))}
      </div>
      
      {showContactModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(15, 40, 71, 0.98) 0%, rgba(10, 22, 40, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              padding: '24px',
              width: '90%',
              maxWidth: '400px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0 }}>📧 Contact Us</h3>
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>
            
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
                <p style={{ color: '#22c55e', fontSize: '16px', fontWeight: '700' }}>Query Submitted!</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>We'll get back to you soon.</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'rgba(167, 139, 250, 0.8)', fontSize: '13px', marginBottom: '16px' }}>
                  Have a query? Write it below and we'll get back to you.
                </p>
                
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Write your query here..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '2px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'none',
                    outline: 'none',
                    marginBottom: '16px',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.6)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  }}
                />
                
                <p style={{ color: 'rgba(96, 165, 250, 0.6)', fontSize: '11px', marginBottom: '12px' }}>
                  📩 Contact: jitendranishad347@gmail.com
                </p>
                
                <button
                  onClick={submitQuery}
                  disabled={!query.trim() || submitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: query.trim() && !submitting ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 'rgba(107, 114, 128, 0.5)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: query.trim() && !submitting ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {submitting ? "Sending..." : "Send Query ✈️"}
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Navbar;
