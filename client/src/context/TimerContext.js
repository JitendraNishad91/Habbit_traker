import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [selectedMinutes, setSelectedMinutes] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [focusLogs, setFocusLogs] = useState([]);
  const [habits, setHabits] = useState([]);
  
  const intervalRef = useRef(null);

  const loadHabits = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    const res = await axios.get("http://localhost:5000/api/habits/all/" + userId);
    setHabits(res.data);
  }, []);

  const loadFocusLogs = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await axios.get(`http://localhost:5000/api/habits/focus-logs/${userId}`);
      setFocusLogs(res.data);
    } catch (error) {
      console.error("Error loading focus logs:", error);
    }
  }, []);

  useEffect(() => {
    loadHabits();
    loadFocusLogs();
  }, [loadHabits, loadFocusLogs]);

  const selectMinutes = (mins) => {
    setSelectedMinutes(mins);
    setSeconds(mins * 60);
  };

  const handleComplete = useCallback(async (habit, minutes, logsFn, habitsFn) => {
    setIsRunning(false);
    setIsPaused(false);

    if (habit) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await axios.post("http://localhost:5000/api/habits/focus-log", {
          habitId: habit.id,
          timeSpent: (minutes || 0) * 60,
          date: today
        });
        await logsFn();
        await habitsFn();
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
    }, 100);
  }, []);

  const startTimer = useCallback(() => {
    if (!selectedHabit) {
      alert("Please select a task first!");
      return;
    }
    if (!selectedMinutes) {
      alert("Please select focus duration first!");
      return;
    }

    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          handleComplete(selectedHabit, selectedMinutes, loadFocusLogs, loadHabits);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [selectedHabit, selectedMinutes, handleComplete, loadFocusLogs, loadHabits]);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          handleComplete(selectedHabit, selectedMinutes, loadFocusLogs, loadHabits);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [selectedHabit, selectedMinutes, handleComplete, loadFocusLogs, loadHabits]);

  const stopTimer = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (selectedHabit && seconds < (selectedMinutes * 60)) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const timeSpent = (selectedMinutes * 60) - seconds;
        await axios.post("http://localhost:5000/api/habits/focus-log", {
          habitId: selectedHabit.id,
          timeSpent: timeSpent,
          date: today
        });
        await loadFocusLogs();
        await loadHabits();
      } catch (error) {
        console.error("Error saving focus time:", error);
      }
    }

    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setSelectedMinutes(null);
    setSelectedHabit(null);
  }, [seconds, selectedHabit, selectedMinutes, loadFocusLogs, loadHabits]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setSelectedMinutes(null);
    setSelectedHabit(null);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const value = {
    habits,
    selectedMinutes,
    seconds,
    isRunning,
    isPaused,
    selectedHabit,
    focusLogs,
    setSelectedHabit,
    selectMinutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    clearTimer,
    loadFocusLogs,
    loadHabits
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
}
