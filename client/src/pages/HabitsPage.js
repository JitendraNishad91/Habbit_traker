import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useTimer } from "../context/TimerContext";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const checkButtonVariants = {
  unchecked: { scale: 1, backgroundColor: "rgba(255, 255, 255, 0.1)" },
  checked: { 
    scale: 1, 
    backgroundColor: "#4CAF50",
    transition: { type: "spring", stiffness: 500, damping: 30 }
  },
  hover: { scale: 1.1 },
  tap: { scale: 0.9 }
};

function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const { loadHabits, focusLogs } = useTimer();

  const today = new Date().toISOString().split('T')[0];
  const userId = localStorage.getItem("userId");

  const fetchHabits = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/habits/all/" + userId);
      setHabits(res.data);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchHabits();
    }
  }, [userId, fetchHabits]);

  useEffect(() => {
    if (focusLogs.length > 0) {
      fetchHabits();
    }
  }, [focusLogs, fetchHabits]);

  const createHabit = async () => {
    if (!title) return;
    await axios.post("http://localhost:5000/api/habits/create", { title, description: category, userId });
    setTitle("");
    setCategory("");
    fetchHabits();
    loadHabits();
  };

  const toggleHabit = async (habitId) => {
    await axios.post(`http://localhost:5000/api/habits/toggle/${habitId}`, { date: today });
    fetchHabits();
    loadHabits();
  };

  const deleteHabit = async (habitId) => {
    await axios.delete(`http://localhost:5000/api/habits/${habitId}`);
    fetchHabits();
    loadHabits();
  };

  const isCompletedToday = (habit) => {
    if (!habit.completed_dates) return false;
    return habit.completed_dates.some(d => {
      const compDate = new Date(d);
      const localDateStr = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
      return localDateStr === today;
    });
  };

  const getPercentage = (habit) => {
    if (!habit.completed_dates || habit.completed_dates.length === 0) return 0;
    const created = new Date(habit.created_at);
    const now = new Date();
    const days = Math.max(1, Math.ceil((now - created) / (1000 * 60 * 60 * 24)) + 1);
    const percent = Math.round((habit.completed_dates.length / days) * 100);
    return Math.min(100, percent);
  };

  return (
    <div style={{ padding: '20px', width: '100%', margin: 0, animation: 'fadeIn 0.6s ease-out' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ color: '#fff', fontSize: '48px', fontWeight: '800', marginBottom: '12px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #667eea 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My Smart Habits ✨
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: '400' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </motion.p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '32px', maxWidth: '900px', margin: '0 auto 32px auto', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 40, 71, 0.8) 100%)', backdropFilter: 'blur(20px)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.25)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)' }}>
        <input placeholder="🎯 Habit Name" value={title} onChange={(e) => setTitle(e.target.value)} style={{ flex: '1 1 200px', minWidth: '0', padding: '14px 16px', fontSize: '16px', borderRadius: '12px', border: '2px solid rgba(59, 130, 246, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: '#fff', outline: 'none' }} />
        <input placeholder="📂 Description" value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: '1 1 150px', minWidth: '0', padding: '14px 16px', fontSize: '16px', borderRadius: '12px', border: '2px solid rgba(59, 130, 246, 0.3)', background: 'rgba(0, 0, 0, 0.2)', color: '#fff', outline: 'none' }} />
        <motion.button onClick={createHabit} whileHover={{ scale: 1.02, y: -3 }} whileTap={{ scale: 0.98 }}
          style={{ flex: '0 0 auto', padding: '14px 24px', fontSize: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', minWidth: '120px' }}>
          + Add Habit
        </motion.button>
      </motion.div>

      {habits.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '60px 40px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: '80px', marginBottom: '20px' }}>📝</motion.div>
          <h3 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>No habits yet!</h3>
          <p style={{ color: 'rgba(96, 165, 250, 0.7)', fontSize: '16px' }}>Start adding habits to track your progress</p>
        </motion.div>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 40, 71, 0.8) 100%)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px 20px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <motion.div variants={staggerContainer} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {habits.map((habit, index) => {
              const completed = isCompletedToday(habit);
              const percentage = getPercentage(habit);
              return (
                <motion.div key={habit.id} variants={staggerItem} whileHover={{ y: -8, scale: 1.02 }}
                  style={{ padding: '28px', background: completed ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.15) 100%)' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 95, 0.3) 100%)', backdropFilter: 'blur(15px)', borderRadius: '20px', border: completed ? '2px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '10px' }}>{habit.title}</h3>
                      <span style={{ display: 'inline-block', padding: '6px 14px', background: completed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)', borderRadius: '20px', color: completed ? '#4ade80' : '#60a5fa', fontSize: '13px', fontWeight: '600' }}>{habit.description}</span>
                    </div>
                    <motion.button onClick={() => deleteHabit(habit.id)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', cursor: 'pointer', fontSize: '18px' }}>🗑️</motion.button>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>Progress</span>
                      <span style={{ color: completed ? '#4ade80' : '#60a5fa', fontWeight: '700', fontSize: '16px' }}>{percentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '10px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, delay: index * 0.1 }}
                        style={{ height: '100%', background: completed ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)', borderRadius: '10px' }} />
                    </div>
                  </div>
                  <motion.button onClick={() => toggleHabit(habit.id)} variants={checkButtonVariants} initial="unchecked" animate={completed ? "checked" : "unchecked"} whileHover="hover" whileTap="tap"
                    style={{ width: '100%', padding: '16px', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: completed ? '0 4px 20px rgba(34, 197, 94, 0.3)' : '0 4px 15px rgba(59, 130, 246, 0.2)' }}>
                    {completed ? <><span style={{ fontSize: '22px' }}>✓</span><span>Completed Today!</span></> : <><span style={{ fontSize: '22px' }}>○</span><span>Mark as Done</span></>}
                  </motion.button>
                  <div style={{ marginTop: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{habit.completed_dates?.length || 0} total completions</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {habits.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ maxWidth: '800px', margin: '32px auto', padding: '24px 20px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 40, 71, 0.8) 100%)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', marginBottom: '24px', textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📊 Today's Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '14px' }}><div style={{ fontSize: '36px', fontWeight: '800', color: '#fff' }}>{habits.length}</div><div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Total</div></div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '14px' }}><div style={{ fontSize: '36px', fontWeight: '800', color: '#4ade80' }}>{habits.filter(h => isCompletedToday(h)).length}</div><div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Done</div></div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '14px' }}><div style={{ fontSize: '36px', fontWeight: '800', color: '#fbbf24' }}>{habits.length - habits.filter(h => isCompletedToday(h)).length}</div><div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Left</div></div>
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '14px' }}><div style={{ fontSize: '36px', fontWeight: '800', color: '#60a5fa' }}>{habits.length > 0 ? Math.round((habits.filter(h => isCompletedToday(h)).length / habits.length) * 100) : 0}%</div><div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Progress</div></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default HabitsPage;
