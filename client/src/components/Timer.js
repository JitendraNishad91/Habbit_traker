import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

function Timer({ habits, onFocusComplete }) {
  const [selectedMinutes, setSelectedMinutes] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [focusLogs, setFocusLogs] = useState([]);
  const [isRestored, setIsRestored] = useState(false);
  const intervalRef = useRef(null);
  const habitRef = useRef(null);
  const secondsRef = useRef(0);
  const minutesRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    habitRef.current = selectedHabit;
    secondsRef.current = seconds;
    minutesRef.current = selectedMinutes;
  }, [selectedHabit, selectedMinutes, seconds]);

  const saveTimerState = useCallback(() => {
    if (isRunning && selectedHabit && selectedMinutes) {
      const timerState = {
        habitId: selectedHabit._id,
        habitTitle: selectedHabit.title,
        habitCategory: selectedHabit.category,
        selectedMinutes: selectedMinutes,
        seconds: seconds,
        startTime: startTimeRef.current,
        isRunning: true
      };
      localStorage.setItem('focusTimerState', JSON.stringify(timerState));
    }
  }, [isRunning, selectedHabit, selectedMinutes, seconds]);

  const clearTimerState = useCallback(() => {
    localStorage.removeItem('focusTimerState');
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('focusTimerState');
    if (savedState && !isRestored) {
      try {
        const state = JSON.parse(savedState);
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - state.startTime) / 1000);
        const remainingSeconds = (state.selectedMinutes * 60) - elapsedSeconds;
        
        if (remainingSeconds > 0) {
          const habit = habits.find(h => h._id === state.habitId);
          if (habit) {
            setSelectedHabit(habit);
            setSelectedMinutes(state.selectedMinutes);
            setSeconds(remainingSeconds);
            startTimeRef.current = state.startTime;
            setIsRunning(true);
            setIsRestored(true);
            
            setTimeout(() => {
              intervalRef.current = setInterval(() => {
                setSeconds(prev => {
                  if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    clearTimerState();
                    handleComplete(habit, state.selectedMinutes);
                    return 0;
                  }
                  const newVal = prev - 1;
                  secondsRef.current = newVal;
                  return newVal;
                });
              }, 1000);
            }, 100);
          }
        } else {
          clearTimerState();
        }
      } catch (error) {
        console.error("Error restoring timer:", error);
        clearTimerState();
      }
    }
    loadFocusLogs();
  }, [habits, isRestored, clearTimerState]);

  const saveProgressOnLeave = useCallback(async () => {
    if (intervalRef.current && selectedHabit && seconds > 0 && selectedMinutes) {
      saveTimerState();
    }
  }, [selectedHabit, selectedMinutes, seconds, saveTimerState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (intervalRef.current) {
        saveTimerState();
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    const handleVisibilityChange = () => {
      if (document.hidden && intervalRef.current) {
        saveTimerState();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const interval = setInterval(() => {
      if (intervalRef.current) {
        saveTimerState();
      }
    }, 1000);
    
    return () => {
      clearInterval(interval);
      if (intervalRef.current) {
        saveTimerState();
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveTimerState]);

  const loadFocusLogs = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(`http://localhost:5000/api/habits/focus-logs/${userId}`);
      setFocusLogs(res.data);
    } catch (error) {
      console.error("Error loading focus logs:", error);
    }
  };

  const selectMinutes = (mins) => {
    setSelectedMinutes(mins);
    setSeconds(mins * 60);
  };

  const startTimer = () => {
    if (!selectedHabit) {
      alert("Please select a task first!");
      return;
    }
    if (!selectedMinutes) {
      alert("Please select focus duration first!");
      return;
    }
    
    setIsRunning(true);
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          handleComplete(selectedHabit, selectedMinutes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    
    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          handleComplete(selectedHabit, selectedMinutes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleComplete = async (habit = selectedHabit, minutes = selectedMinutes) => {
    setIsRunning(false);
    setIsPaused(false);
    clearTimerState();

    if (habit) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await axios.post("http://localhost:5000/api/habits/focus-log", {
          habitId: habit._id,
          timeSpent: (minutes || 0) * 60,
          date: today
        });
        await loadFocusLogs();
        if (onFocusComplete) onFocusComplete();
      } catch (error) {
        console.error("Error saving focus time:", error);
      }
    }
    
    setTimeout(() => {
      setIsRunning(false);
      setIsPaused(false);
      setSeconds(0);
      setSelectedMinutes(null);
      setSelectedHabit(null);
      setIsRestored(false);
    }, 100);
  };

  const stopTimer = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (selectedHabit && seconds < (selectedMinutes * 60)) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const timeSpent = (selectedMinutes * 60) - seconds;
        await axios.post("http://localhost:5000/api/habits/focus-log", {
          habitId: selectedHabit._id,
          timeSpent: timeSpent,
          date: today
        });
        await loadFocusLogs();
        if (onFocusComplete) onFocusComplete();
      } catch (error) {
        console.error("Error saving focus time:", error);
      }
    }
    
    resetTimer();
  };

  const resetTimer = () => {
    clearTimerState();
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setSelectedMinutes(null);
    setSelectedHabit(null);
    setIsRestored(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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

  const formatMinutes = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    return `${mins} min`;
  };

  const getHabitFocusTime = (habitId) => {
    const logs = focusLogs.filter(log => log.habitId === habitId);
    const total = logs.reduce((sum, log) => sum + (log.timeSpent || 0), 0);
    return total;
  };

  const minuteOptions = [5, 10, 15, 20, 25, 30, 45, 50, 60, 90, 100, 120];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>
      <div style={{ 
        padding: '28px 20px', 
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px', 
        color: '#fff',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        marginBottom: '24px'
      }}>
        <div style={{fontSize: '40px', marginBottom: '12px'}}>⏱️</div>
        <h2 style={{ 
          marginBottom: '24px', 
          color: '#fff',
          fontSize: '24px',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Focus Timer
        </h2>

        {!selectedHabit && !isRunning && !isPaused && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'rgba(96, 165, 250, 0.8)', marginBottom: '14px', fontSize: '15px' }}>
              Select a task to focus on:
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
              gap: '10px',
              maxHeight: '180px',
              overflowY: 'auto',
              padding: '10px'
            }}>
              {habits.map(habit => {
                const focusTime = getHabitFocusTime(habit._id);
                return (
                  <div
                    key={habit._id}
                    onClick={() => setSelectedHabit(habit)}
                    style={{
                      padding: '12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '2px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '14px', marginBottom: '4px' }}>
                      {habit.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(96, 165, 250, 0.7)', marginBottom: '4px' }}>
                      {habit.category}
                    </div>
                    <div style={{ fontSize: '12px', color: focusTime > 0 ? '#22c55e' : 'rgba(96, 165, 250, 0.5)' }}>
                      ⏱️ {focusTime > 0 ? formatMinutes(focusTime) : 'No focus yet'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedHabit && !isRunning && !isPaused && (
          <div style={{
            padding: '16px 24px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'inline-block'
          }}>
            <div style={{ fontSize: '14px', color: 'rgba(96, 165, 250, 0.7)', marginBottom: '4px' }}>
              Focusing on:
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>
              {selectedHabit.title}
            </div>
          </div>
        )}

        {!selectedMinutes && !isRunning && !isPaused && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'rgba(96, 165, 250, 0.8)', marginBottom: '16px', fontSize: '16px' }}>
              How long do you want to focus? (minutes)
            </p>
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'center'
            }}>
              {minuteOptions.map(mins => (
                <button
                  key={mins}
                  onClick={() => selectMinutes(mins)}
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '10px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(59, 130, 246, 0.3)';
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>
        )}

        {(selectedMinutes || isRunning || isPaused) && (
          <>
            <div style={{ 
              fontSize: '56px', 
              fontWeight: '800', 
              marginBottom: '14px',
              fontFamily: 'monospace',
              color: isRunning ? '#22c55e' : isPaused ? '#f59e0b' : '#fff',
              textShadow: isRunning ? '0 0 30px rgba(34, 197, 94, 0.5)' : isPaused ? '0 0 30px rgba(245, 158, 11, 0.5)' : 'none',
              transition: 'all 0.3s ease',
              letterSpacing: '3px'
            }}>
              {formatTime(seconds)}
            </div>

            {selectedMinutes && !isRunning && !isPaused && (
              <div style={{ 
                fontSize: '15px', 
                color: 'rgba(96, 165, 250, 0.7)',
                marginBottom: '20px'
              }}>
                Goal: {selectedMinutes} minutes
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
          {!isRunning && !isPaused && !selectedMinutes && (
            <button 
              onClick={() => setSelectedHabit(null)}
              style={{ 
                padding: '10px 20px', 
                fontSize: '14px', 
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#fca5a5',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ← Change Task
            </button>
          )}

          {!isRunning && !isPaused && selectedMinutes && (
            <button 
              onClick={() => setSelectedMinutes(null)}
              style={{ 
                padding: '12px 24px', 
                fontSize: '16px', 
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                color: '#fca5a5',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ← Change Time
            </button>
          )}

          {!isRunning && !isPaused && selectedMinutes && (
            <button 
              onClick={startTimer}
              disabled={!selectedHabit}
              style={{ 
                padding: '16px 36px', 
                fontSize: '18px', 
                background: selectedHabit 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' 
                  : 'rgba(107, 114, 128, 0.5)',
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: selectedHabit ? 'pointer' : 'not-allowed',
                fontWeight: '800',
                transition: 'all 0.3s ease',
                boxShadow: selectedHabit ? '0 4px 20px rgba(34, 197, 94, 0.4)' : 'none'
              }}
            >
              ▶️ Start Focus
            </button>
          )}
          
          {isRunning && (
            <button 
              onClick={pauseTimer}
              style={{ 
                padding: '16px 36px', 
                fontSize: '18px', 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontWeight: '800',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
              }}
            >
              ⏸️ Pause
            </button>
          )}
          
          {isPaused && (
            <button 
              onClick={resumeTimer}
              style={{ 
                padding: '16px 36px', 
                fontSize: '18px', 
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontWeight: '800',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)'
              }}
            >
              ▶️ Resume
            </button>
          )}
          
          {(isRunning || isPaused) && (
            <button 
              onClick={stopTimer}
              style={{ 
                padding: '16px 36px', 
                fontSize: '18px', 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontWeight: '800',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
              }}
            >
              ⏹️ Stop
            </button>
          )}
        </div>

        <div style={{ 
          marginTop: '24px', 
          fontSize: '15px', 
          color: 'rgba(96, 165, 250, 0.8)',
          padding: '16px',
          background: 'rgba(10, 22, 40, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          {!selectedHabit && !selectedMinutes && (
            <span>🎯 First select a task, then choose your focus time</span>
          )}
          {selectedHabit && !selectedMinutes && (
            <span>🎯 Now choose how long you want to focus (5-120 min)</span>
          )}
          {selectedHabit && selectedMinutes && !isRunning && !isPaused && (
            <span>🚀 Ready to focus for {selectedMinutes} minutes on "{selectedHabit.title}"</span>
          )}
          {isRunning && (
            <span style={{ color: '#22c55e', fontWeight: '600' }}>
              ● Stay focused! You're doing great...
            </span>
          )}
          {isPaused && (
            <span style={{ color: '#f59e0b', fontWeight: '600' }}>
              ⏸️ Paused - Resume when ready
            </span>
          )}
        </div>
      </div>

      <div style={{
        padding: '24px',
        background: 'rgba(13, 33, 55, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h3 style={{ 
          color: '#fff', 
          fontSize: '20px', 
          fontWeight: '700',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          📊 Focus Time Summary
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: '12px' 
        }}>
          {habits.map(habit => {
            const focusTime = getHabitFocusTime(habit._id);
            return (
              <div
                key={habit._id}
                style={{
                  padding: '16px',
                  background: focusTime > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                  border: `1px solid ${focusTime > 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                  borderRadius: '12px'
                }}
              >
                <div style={{ fontWeight: '600', color: '#fff', marginBottom: '8px', fontSize: '14px' }}>
                  {habit.title}
                </div>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '700', 
                  color: focusTime > 0 ? '#22c55e' : 'rgba(96, 165, 250, 0.5)'
                }}>
                  ⏱️ {focusTime > 0 ? formatMinutes(focusTime) : '0m'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Timer;
