import { useState, useEffect } from "react";
import axios from "axios";
import Timer from "../components/Timer";
import { motion } from "framer-motion";
import API_URL from "../config";

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

function Dashboard(){

const [habits,setHabits] = useState([]);
const [title,setTitle] = useState("");
const [category,setCategory] = useState("");
const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "habits";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const tab = localStorage.getItem("activeTab");
      if (tab) setActiveTab(tab);
    };
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(() => {
      const tab = localStorage.getItem("activeTab");
      if (tab && tab !== activeTab) setActiveTab(tab);
    }, 100);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [activeTab]);

const today = new Date().toISOString().split('T')[0];
const userId = localStorage.getItem("userId");

const loadHabits = async () => {
    const res = await axios.get(
        `${API_URL}/api/habits/all/` + userId
    );
    setHabits(res.data);
};

useEffect(()=>{
    loadHabits();
},[]);

const createHabit = async () => {
    if(!title || !category) return;
await axios.post(
        `${API_URL}/api/habits/create`,
        {Title,category,userId}
    );
    setTitle("");
    setCategory("");
    loadHabits();
};

const toggleHabit = async (habitId) => {
    await axios.post(
        `${API_URL}/api/habits/toggle/${habitId}`,
        { date: today }
    );
    loadHabits();
};

const deleteHabit = async (habitId) => {
    await axios.delete(
        `${API_URL}/api/habits/${habitId}`
    );
    loadHabits();
};

const isCompletedToday = (habit) => {
    if(!habit.completedDates) return false;
    return habit.completedDates.some(d => {
        const compDate = new Date(d);
        const localDateStr = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
        return localDateStr === today;
    });
};

const getPercentage = (habit) => {
    if(!habit.completedDates || habit.completedDates.length === 0) return 0;
    const created = new Date(habit.createdAt);
    const now = new Date();
    const days = Math.max(1, Math.ceil((now - created) / (1000 * 60 * 60 * 24)) + 1);
    const percent = Math.round((habit.completedDates.length / days) * 100);
    return Math.min(100, percent);
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// TABLE FUNCTIONS
const [currentMonth, setCurrentMonth] = useState(new Date());
const [selectedDot, setSelectedDot] = useState(null);
const [selectedThreshold, setSelectedThreshold] = useState(null);

const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    return lastDay.getDate();
};

const isDateCompleted = (habit, day) => {
    if (!habit.completedDates) return false;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return habit.completedDates.some((d) => {
        const compDate = new Date(d);
        const localDateStr = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
        return localDateStr === dateStr;
    });
};

const toggleHabitDate = async (habitId, day) => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    if (currentMonth.getFullYear() !== todayYear || currentMonth.getMonth() !== todayMonth) return;
    if (day !== todayDate) return;

    const dateString = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`;

    try {
        await axios.post(`${API_URL}/api/habits/toggle/${habitId}`, {
            date: dateString,
        });
        loadHabits();
    } catch (error) {
        console.error("Error toggling habit:", error);
    }
};

const isToday = (day) => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    return (
        day === todayDate &&
        currentMonth.getFullYear() === todayYear &&
        currentMonth.getMonth() === todayMonth
    );
};

const isFutureDate = (day) => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    if (currentMonth.getFullYear() < todayYear) return false;
    if (currentMonth.getFullYear() > todayYear) return true;
    if (currentMonth.getMonth() < todayMonth) return false;
    if (currentMonth.getMonth() > todayMonth) return true;
    
    return day > todayDate;
};

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const daysInMonth = getDaysInMonth(currentMonth);

const getDailyCompletions = () => {
    const completions = {};
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        let count = 0;
        habits.forEach((habit) => {
            if (habit.completedDates) {
                habit.completedDates.forEach((d) => {
                    const compDate = new Date(d);
                    const localDateStr = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
                    if (localDateStr === dateStr) count++;
                });
            }
        });
        completions[day] = count;
    }
    return completions;
};

const dailyCompletions = getDailyCompletions();

const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
};

const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
};

// FOCUS TAB - Only Timer
if (activeTab === 'focus') {
    return (
        <div style={{ 
            minHeight: 'calc(100vh - 140px)', 
            padding: '20px',
            width: '100%'
        }}>
            <Timer habits={habits} onFocusComplete={loadHabits} />
        </div>
    );
}

// TABLE TAB - Only Table
if (activeTab === 'table') {
    return (
        <div style={{ 
            padding: '20px', 
            width: '100%',
            margin: 0,
            animation: 'fadeIn 0.6s ease-out'
        }}>
            <h1 style={{ 
                textAlign: 'center', 
                marginBottom: '20px', 
                color: '#fff',
                fontSize: '36px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(79, 172, 254, 0.3)'
            }}>
                📅 Monthly Habit Tracker
            </h1>

            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <button 
                    onClick={prevMonth}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                    }}
                >
                    ◀ Prev
                </button>
                <h2 style={{ 
                    margin: 0, 
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #fff 0%, #ccc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button 
                    onClick={nextMonth}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                    }}
                >
                    Next ▶
                </button>
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '15px', 
                justifyContent: 'center', 
                marginBottom: '20px',
                padding: '15px',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#4CAF50', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</div>
                    <span style={{ fontSize: '13px', color: '#fff' }}>Habit Done</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#4CAF50', borderRadius: '50%', border: '3px solid #4CAF50' }}></div>
                    <span style={{ fontSize: '13px', color: '#fff' }}>Green Dot</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: '#4CAF50', borderRadius: '50%', border: '3px solid #4CAF50', boxShadow: '0 0 10px #4CAF50' }}></div>
                    <span style={{ fontSize: '13px', color: '#fff' }}>Selected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }}></div>
                    <span style={{ fontSize: '13px', color: '#fff' }}>No Dots</span>
                </div>
            </div>

            <div style={{ 
                overflowX: 'auto', 
                marginBottom: '30px',
                background: 'rgba(20, 20, 40, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '15px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
                <table style={{ minWidth: '800px', borderCollapse: 'collapse', background: 'transparent' }}>
                    <thead>
                        <tr style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#0f0f23' }}>
                            <th style={{ 
                                padding: '16px', 
                                textAlign: 'left', 
                                borderBottom: '2px solid rgba(0,0,0,0.2)',
                                position: 'sticky',
                                left: 0,
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                zIndex: 2,
                                minWidth: '150px',
                                fontWeight: '700'
                            }}>
                                Habits ↓ / Date →
                            </th>
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                <th key={day} style={{ 
                                    padding: '12px 6px', 
                                    textAlign: 'center',
                                    fontSize: '12px',
                                    borderBottom: '2px solid rgba(0,0,0,0.2)',
                                    backgroundColor: isToday(day) ? 'rgba(79, 172, 254, 0.9)' : 'transparent',
                                    color: '#0f0f23',
                                    minWidth: '32px',
                                    fontWeight: '600'
                                }}>
                                    {day}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {habits.length === 0 ? (
                            <tr>
                                <td colSpan={daysInMonth + 1} style={{ textAlign: 'center', padding: '60px', color: '#fff' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>📝</div>
                                    No habits yet. Go back and add habits!
                                </td>
                            </tr>
                        ) : (
                            habits.map((habit, habitIndex) => (
                                <tr key={habit._id} style={{ 
                                    backgroundColor: habitIndex % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)', 
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <td style={{ 
                                        padding: '14px', 
                                        fontWeight: 'bold', 
                                        color: '#fff',
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: habitIndex % 2 === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
                                        borderRight: '2px solid rgba(79, 172, 254, 0.3)',
                                        minWidth: '150px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{habit.title}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{habit.category}</div>
                                        </div>
                                    </td>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                        const completed = isDateCompleted(habit, day);
                                        const isClickable = isToday(day);
                                        const isFuture = isFutureDate(day);

                                        return (
                                            <td key={day} style={{ padding: '4px', textAlign: 'center', backgroundColor: isToday(day) ? 'rgba(79, 172, 254, 0.1)' : 'transparent' }}>
                                                <div
                                                    onClick={() => !isFuture && toggleHabitDate(habit._id, day)}
                                                    style={{
                                                        width: '26px',
                                                        height: '26px',
                                                        margin: '0 auto',
                                                        borderRadius: '6px',
                                                        border: completed ? 'none' : isFuture ? '1px dashed rgba(255,255,255,0.2)' : isClickable ? '2px solid #4facfe' : '2px solid rgba(255,255,255,0.3)',
                                                        backgroundColor: completed ? '#4CAF50' : isFuture ? 'rgba(255,255,255,0.05)' : isClickable ? 'rgba(79, 172, 254, 0.2)' : 'rgba(255,255,255,0.1)',
                                                        cursor: isFuture ? 'not-allowed' : 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.3s ease',
                                                        opacity: isFuture ? 0.3 : 1,
                                                        boxShadow: completed ? '0 2px 8px rgba(76, 175, 80, 0.4)' : 'none'
                                                    }}
                                                >
                                                    {completed && <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ 
                background: 'rgba(20, 20, 40, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px', 
                padding: '24px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                marginBottom: '30px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ 
                        margin: 0, 
                        color: '#fff',
                        fontSize: '24px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📊 Pattern Analysis - Select a row to see dots
                    </h2>
                    {selectedDot && (
                        <button 
                            onClick={() => {
                                setSelectedDot(null);
                                setSelectedThreshold(null);
                            }}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #ff9800 0%, #ff5722 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(255, 152, 0, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)';
                            }}
                        >
                            ← Show All Rows
                        </button>
                    )}
                </div>

                <div style={{ 
                    overflowX: 'auto',
                    marginBottom: '20px'
                }}>
                    <table style={{ minWidth: '800px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white' }}>
                                <th style={{ 
                                    padding: '16px', 
                                    textAlign: 'left', 
                                    borderBottom: '2px solid rgba(255,255,255,0.2)',
                                    position: 'sticky',
                                    left: 0,
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                    zIndex: 2,
                                    minWidth: '150px',
                                    fontWeight: '700'
                                }}>
                                    {selectedThreshold ? `✓ ${selectedThreshold} task${selectedThreshold > 1 ? 's' : ''}` : 'Task Count →'}
                                </th>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                    <th key={day} style={{ 
                                        padding: '12px 6px', 
                                        textAlign: 'center',
                                        fontSize: '12px',
                                        borderBottom: '2px solid rgba(255,255,255,0.2)',
                                        backgroundColor: isToday(day) ? 'rgba(79, 172, 254, 0.8)' : 'transparent',
                                        color: isToday(day) ? '#fff' : 'rgba(255,255,255,0.8)',
                                        minWidth: '32px',
                                        fontWeight: '600'
                                    }}>
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(selectedThreshold === null || selectedThreshold === 1) && (
                                <tr 
                                    onClick={() => {
                                        if (selectedThreshold === 1) {
                                            setSelectedDot(null);
                                            setSelectedThreshold(null);
                                        }
                                    }}
                                    style={{ 
                                        backgroundColor: selectedThreshold === 1 ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.02)', 
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: selectedThreshold === 1 ? 'pointer' : 'default',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <td style={{ 
                                        padding: '14px', 
                                        fontWeight: 'bold', 
                                        color: '#fff',
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: selectedThreshold === 1 ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.02)',
                                        borderRight: '2px solid rgba(255,255,255,0.1)',
                                        minWidth: '150px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '15px', color: selectedThreshold === 1 ? '#4facfe' : '#fff', fontWeight: '600' }}>
                                                {selectedThreshold === 1 ? '✓ 1 task' : '1 task'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                                {selectedThreshold === 1 ? '✓ Selected' : 'Click to see dots'}
                                            </div>
                                        </div>
                                    </td>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                        const count = dailyCompletions[day] || 0;
                                        const isFuture = isFutureDate(day);
                                        const isSelected = selectedDot === day && selectedThreshold === 1;
                                        const hasAny = count === 1;
                                        const isActiveRow = selectedThreshold === 1;
                                        
                                        return (
                                            <td key={day} style={{ padding: '4px', textAlign: 'center', backgroundColor: isToday(day) ? 'rgba(79, 172, 254, 0.1)' : 'transparent' }}>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isFuture && hasAny && isActiveRow) {
                                                            setSelectedDot(day);
                                                        }
                                                    }}
                                                    style={{
                                                        width: '26px',
                                                        height: '26px',
                                                        margin: '0 auto',
                                                        borderRadius: '50%',
                                                        border: isFuture ? '1px dashed rgba(255,255,255,0.2)' : isSelected ? '3px solid #4CAF50' : hasAny ? '3px solid #4CAF50' : '1px solid rgba(255,255,255,0.2)',
                                                        backgroundColor: isFuture ? 'rgba(255,255,255,0.05)' : isSelected ? '#4CAF50' : hasAny ? '#4CAF50' : 'rgba(255,255,255,0.05)',
                                                        transition: 'all 0.3s ease',
                                                        opacity: isFuture ? 0.3 : 1,
                                                        cursor: isFuture || !hasAny || !isActiveRow ? 'not-allowed' : 'pointer',
                                                        boxShadow: isSelected ? '0 0 12px #4CAF50' : 'none'
                                                    }}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            )}
                            {(selectedThreshold === null || selectedThreshold === 2) && (
                                <tr 
                                    onClick={() => {
                                        if (selectedThreshold === 2) {
                                            setSelectedDot(null);
                                            setSelectedThreshold(null);
                                        }
                                    }}
                                    style={{ 
                                        backgroundColor: selectedThreshold === 2 ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.05)', 
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: selectedThreshold === 2 ? 'pointer' : 'default',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <td style={{ 
                                        padding: '14px', 
                                        fontWeight: 'bold', 
                                        color: '#fff',
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: selectedThreshold === 2 ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.05)',
                                        borderRight: '2px solid rgba(255,255,255,0.1)',
                                        minWidth: '150px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '15px', color: selectedThreshold === 2 ? '#4facfe' : '#fff', fontWeight: '600' }}>
                                                {selectedThreshold === 2 ? '✓ 2 tasks' : '2 tasks'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                                {selectedThreshold === 2 ? '✓ Selected' : 'Click to see dots'}
                                            </div>
                                        </div>
                                    </td>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                        const count = dailyCompletions[day] || 0;
                                        const isFuture = isFutureDate(day);
                                        const isSelected = selectedDot === day && selectedThreshold === 2;
                                        const hasAny = count === 2;
                                        const isActiveRow = selectedThreshold === 2;

                                        return (
                                            <td key={day} style={{ padding: '4px', textAlign: 'center', backgroundColor: isToday(day) ? 'rgba(79, 172, 254, 0.1)' : 'transparent' }}>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isFuture && hasAny && isActiveRow) {
                                                            setSelectedDot(day);
                                                        }
                                                    }}
                                                    style={{
                                                        width: '26px',
                                                        height: '26px',
                                                        margin: '0 auto',
                                                        borderRadius: '50%',
                                                        border: isFuture ? '1px dashed rgba(255,255,255,0.2)' : isSelected ? '3px solid #4CAF50' : hasAny ? '3px solid #4CAF50' : '1px solid rgba(255,255,255,0.2)',
                                                        backgroundColor: isFuture ? 'rgba(255,255,255,0.05)' : isSelected ? '#4CAF50' : hasAny ? '#4CAF50' : 'rgba(255,255,255,0.05)',
                                                        transition: 'all 0.3s ease',
                                                        opacity: isFuture ? 0.3 : 1,
                                                        cursor: isFuture || !hasAny || !isActiveRow ? 'not-allowed' : 'pointer',
                                                        boxShadow: isSelected ? '0 0 12px #4CAF50' : 'none'
                                                    }}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            )}
                            {(selectedThreshold === null || selectedThreshold === 3) && (
                                <tr 
                                    onClick={() => {
                                        if (selectedThreshold === 3) {
                                            setSelectedDot(null);
                                            setSelectedThreshold(null);
                                        }
                                    }}
                                    style={{ 
                                        backgroundColor: selectedThreshold === 3 ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.02)', 
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        cursor: selectedThreshold === 3 ? 'pointer' : 'default',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <td style={{ 
                                        padding: '14px', 
                                        fontWeight: 'bold', 
                                        color: '#fff',
                                        position: 'sticky',
                                        left: 0,
                                        backgroundColor: selectedThreshold === 3 ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.02)',
                                        borderRight: '2px solid rgba(255,255,255,0.1)',
                                        minWidth: '150px'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: '15px', color: selectedThreshold === 3 ? '#4facfe' : '#fff', fontWeight: '600' }}>
                                                {selectedThreshold === 3 ? '✓ 3 tasks' : '3 tasks'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                                {selectedThreshold === 3 ? '✓ Selected' : 'Click to see dots'}
                                            </div>
                                        </div>
                                    </td>
                                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                        const count = dailyCompletions[day] || 0;
                                        const isFuture = isFutureDate(day);
                                        const isSelected = selectedDot === day && selectedThreshold === 3;
                                        const hasAny = count === 3;
                                        const isActiveRow = selectedThreshold === 3;

                                        return (
                                            <td key={day} style={{ padding: '4px', textAlign: 'center', backgroundColor: isToday(day) ? 'rgba(79, 172, 254, 0.1)' : 'transparent' }}>
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!isFuture && hasAny && isActiveRow) {
                                                            setSelectedDot(day);
                                                        }
                                                    }}
                                                    style={{
                                                        width: '26px',
                                                        height: '26px',
                                                        margin: '0 auto',
                                                        borderRadius: '50%',
                                                        border: isFuture ? '1px dashed rgba(255,255,255,0.2)' : isSelected ? '3px solid #4CAF50' : hasAny ? '3px solid #4CAF50' : '1px solid rgba(255,255,255,0.2)',
                                                        backgroundColor: isFuture ? 'rgba(255,255,255,0.05)' : isSelected ? '#4CAF50' : hasAny ? '#4CAF50' : 'rgba(255,255,255,0.05)',
                                                        transition: 'all 0.3s ease',
                                                        opacity: isFuture ? 0.3 : 1,
                                                        cursor: isFuture || !hasAny || !isActiveRow ? 'not-allowed' : 'pointer',
                                                        boxShadow: isSelected ? '0 0 12px #4CAF50' : 'none'
                                                    }}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ 
                    marginTop: '24px',
                    padding: '20px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <h4 style={{ marginBottom: '12px', color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                         🎯 Selected: {selectedDot ? `${selectedDot} ${monthNames[currentMonth.getMonth()]} (${selectedThreshold} task${selectedThreshold > 1 ? 's' : ''})` : 'Click any row'}
                    </h4>
                    {selectedDot ? (
                        <div>
                            <p style={{ margin: '0 0 16px 0', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
                                <strong>{selectedDot} {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</strong> - 
                                <span style={{ color: '#4CAF50', fontWeight: 'bold' }}> {dailyCompletions[selectedDot]} </span>
                                {dailyCompletions[selectedDot] === 1 ? 'habit' : 'habits'} completed
                            </p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {habits
                                    .filter(habit => {
                                        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(selectedDot).padStart(2, '0')}`;
                                        return habit.completedDates?.some(d => {
                                            const compDate = new Date(d);
                                            const localDateStr = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
                                            return localDateStr === dateStr;
                                        });
                                    })
                                    .map(habit => (
                                        <span key={habit._id} style={{ 
                                            padding: '8px 16px', 
                                            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', 
                                            color: 'white', 
                                            borderRadius: '20px', 
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                                        }}>
                                            ✓ {habit.title}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontSize: '14px' }}>
                            👆 Click on a row label to see dots, then click a dot to analyze
                        </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ 
                    padding: '24px', 
                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)',
                    borderRadius: '16px', 
                    textAlign: 'center', 
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(76, 175, 80, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}>
                    <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '8px' }}>{habits.length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '500' }}>Total Habits</div>
                </div>
                <div style={{ 
                    padding: '24px', 
                    background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(79, 172, 254, 0.1) 100%)',
                    borderRadius: '16px', 
                    textAlign: 'center', 
                    border: '1px solid rgba(79, 172, 254, 0.3)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(79, 172, 254, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}>
                    <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#4facfe', marginBottom: '8px' }}>{Object.values(dailyCompletions).filter(c => c > 0).length}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '500' }}>Active Days</div>
                </div>
                <div style={{ 
                    padding: '24px', 
                    background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)',
                    borderRadius: '16px', 
                    textAlign: 'center', 
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 152, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}>
                    <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>{Object.values(dailyCompletions).reduce((a, b) => a + b, 0)}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '500' }}>Total Completions</div>
                </div>
            </div>
        </div>
    );
}

// HABITS TAB (Default) - Only Habits List
return(

<div style={{
    padding: '20px', 
    width: '100%',
    margin: 0,
    animation: 'fadeIn 0.6s ease-out'
}}>

    <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
            textAlign: 'center', 
            marginBottom: '40px'
        }}
    >
        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
                color: '#fff',
                fontSize: '48px',
                fontWeight: '800',
                marginBottom: '12px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #667eea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(79, 172, 254, 0.3)'
            }}
        >
            My Smart Habits ✨
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{color: 'rgba(255,255,255,0.6)', fontSize: '18px', fontWeight: '400'}}
        >
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </motion.p>
    </motion.div>

    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="habit-form-container"
        style={{
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '12px', 
            marginBottom: '32px',
            maxWidth: '900px',
            margin: '0 auto 32px auto',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 40, 71, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(59, 130, 246, 0.1)'
        }}
    >
        <input
            placeholder="🎯 Habit Name"
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            style={{
                flex: '1 1 200px',
                minWidth: '0', 
                padding: '14px 16px', 
                fontSize: '16px', 
                borderRadius: '12px', 
                border: '2px solid rgba(59, 130, 246, 0.3)',
                background: 'rgba(0, 0, 0, 0.2)',
                color: '#fff',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                outline: 'none'
            }}
            onFocus={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                e.target.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.boxShadow = 'none';
            }}
        />
        <input
            placeholder="📂 Category"
            value={category}
            onChange={(e)=>setCategory(e.target.value)}
            style={{
                flex: '1 1 150px',
                minWidth: '0', 
                padding: '14px 16px', 
                fontSize: '16px', 
                borderRadius: '12px', 
                border: '2px solid rgba(59, 130, 246, 0.3)',
                background: 'rgba(0, 0, 0, 0.2)',
                color: '#fff',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                outline: 'none'
            }}
            onFocus={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                e.target.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.boxShadow = 'none';
            }}
        />
        <motion.button 
            onClick={createHabit}
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
            style={{
                flex: '0 0 auto',
                padding: '14px 24px', 
                fontSize: '16px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                fontWeight: '700',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '120px'
            }}
            onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px) scale(1.02)';
                e.target.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
            }}
        >
            + Add Habit
        </motion.button>
    </motion.div>

    {habits.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                maxWidth: '600px',
                margin: '40px auto',
                textAlign: 'center', 
                padding: '60px 40px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(34, 197, 94, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.1)'
            }}
        >
            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: '80px', marginBottom: '20px' }}
            >
                📝
            </motion.div>
            <h3 style={{ color: '#fff', fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
                No habits yet!
            </h3>
            <p style={{ color: 'rgba(96, 165, 250, 0.7)', fontSize: '16px' }}>
                Start adding habits to track your progress
            </p>
        </motion.div>
    ) : (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 16px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 40, 71, 0.8) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '24px 20px',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(59, 130, 246, 0.1)'
        }}>
        <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
            }}
        >
            {habits.map((habit, index) => {
                const completed = isCompletedToday(habit);
                const percentage = getPercentage(habit);
                
                return (
                    <motion.div
                        key={habit._id}
                        variants={staggerItem}
                        whileHover={{ y: -8, scale: 1.02 }}
                        style={{
                            padding: '28px',
                            background: completed 
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(22, 163, 74, 0.15) 100%)'
                                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 58, 95, 0.3) 100%)',
                            backdropFilter: 'blur(15px)',
                            borderRadius: '20px',
                            border: completed 
                                ? '2px solid rgba(34, 197, 94, 0.5)'
                                : '1px solid rgba(59, 130, 246, 0.3)',
                            boxShadow: completed 
                                ? '0 10px 40px rgba(34, 197, 94, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
                                : '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '10px', lineHeight: '1.3' }}>
                                    {habit.title}
                                </h3>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    background: completed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                    borderRadius: '20px',
                                    color: completed ? '#4ade80' : '#60a5fa',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    border: completed ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)'
                                }}>
                                    {habit.category}
                                </span>
                            </div>
                            <motion.button
                                onClick={() => deleteHabit(habit._id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    padding: '10px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontSize: '18px'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                                    e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                                }}
                            >
                                🗑️
                            </motion.button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '500' }}>Progress</span>
                                <span style={{ color: completed ? '#4ade80' : '#60a5fa', fontWeight: '700', fontSize: '16px' }}>{percentage}%</span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    style={{
                                        height: '100%',
                                        background: completed
                                            ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
                                            : 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                                        borderRadius: '10px',
                                        boxShadow: completed ? '0 2px 12px rgba(34, 197, 94, 0.5)' : '0 2px 12px rgba(59, 130, 246, 0.5)'
                                    }}
                                />
                            </div>
                        </div>

                        <motion.button
                            onClick={() => toggleHabit(habit._id)}
                            variants={checkButtonVariants}
                            initial="unchecked"
                            animate={completed ? "checked" : "unchecked"}
                            whileHover="hover"
                            whileTap="tap"
                            style={{
                                width: '100%',
                                padding: '16px',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'all 0.3s ease',
                                boxShadow: completed ? '0 4px 20px rgba(34, 197, 94, 0.3)' : '0 4px 15px rgba(59, 130, 246, 0.2)'
                            }}
                        >
                            {completed ? (
                                <>
                                    <span style={{ fontSize: '22px' }}>✓</span>
                                    <span>Completed Today!</span>
                                </>
                            ) : (
                                <>
                                    <span style={{ fontSize: '22px' }}>○</span>
                                    <span>Mark as Done</span>
                                </>
                            )}
                        </motion.button>

                        <div style={{ marginTop: '16px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: '500' }}>
                            {habit.completedDates?.length || 0} total completions
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
        </div>
    )}

    {habits.length > 0 && (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
                maxWidth: '800px',
                margin: '32px auto',
                padding: '24px 20px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(15, 40, 71, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(59, 130, 246, 0.1)'
            }}
        >
            <h2 style={{ 
                color: '#fff', 
                fontSize: '22px', 
                fontWeight: '700', 
                marginBottom: '24px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                📊 Today's Summary
            </h2>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '16px' 
            }}>
                <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '14px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                        {habits.length}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>
                        Total
                    </div>
                </div>
                <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '14px',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#4ade80', marginBottom: '6px' }}>
                        {habits.filter(h => isCompletedToday(h)).length}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>
                        Done
                    </div>
                </div>
                <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '14px',
                    border: '1px solid rgba(245, 158, 11, 0.2)'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#fbbf24', marginBottom: '6px' }}>
                        {habits.length - habits.filter(h => isCompletedToday(h)).length}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>
                        Left
                    </div>
                </div>
                <div style={{ 
                    textAlign: 'center',
                    padding: '16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '14px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#60a5fa', marginBottom: '6px' }}>
                        {habits.length > 0 ? Math.round((habits.filter(h => isCompletedToday(h)).length / habits.length) * 100) : 0}%
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '600' }}>
                        Progress
                    </div>
                </div>
            </div>
        </motion.div>
    )}
</div>
);
}

export default Dashboard;
