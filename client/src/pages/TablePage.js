import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTimer } from "../context/TimerContext";

function TablePage() {
  const [habits, setHabits] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDot, setSelectedDot] = useState(null);
  const [selectedThreshold, setSelectedThreshold] = useState(null);
  const { focusLogs, loadHabits: loadHabitsFromContext } = useTimer();

  const userId = localStorage.getItem("userId");

  const loadHabits = useCallback(async () => {
    const res = await axios.get(
      "http://localhost:5000/api/habits/all/" + userId
    );
    setHabits(res.data);
  }, [userId]);

  useEffect(() => {
    loadHabits();
    loadHabitsFromContext();
  }, [loadHabits, loadHabitsFromContext]);

  useEffect(() => {
    if (focusLogs.length > 0) {
      loadHabits();
      loadHabitsFromContext();
    }
  }, [focusLogs, loadHabits, loadHabitsFromContext]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    return lastDay.getDate();
  };

  const isDateCompleted = (habit, day) => {
    if (!habit.completed_dates) return false;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return habit.completed_dates.some((d) => {
      const compDate = new Date(d);
      const localDateStr = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
      return localDateStr === dateStr;
    });
  };

  const toggleHabitDate = async (habitId, day) => {
    const todayDate = new Date();
    const todayYear = todayDate.getFullYear();
    const todayMonth = todayDate.getMonth();
    const todayD = todayDate.getDate();

    if (currentMonth.getFullYear() !== todayYear || currentMonth.getMonth() !== todayMonth) return;
    if (day !== todayD) return;

    const dateString = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayD).padStart(2, '0')}`;

    try {
      await axios.post(`http://localhost:5000/api/habits/toggle/${habitId}`, {
        date: dateString,
      });
      loadHabits();
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const isToday = (day) => {
    const todayDate = new Date();
    return (
      day === todayDate.getDate() &&
      currentMonth.getFullYear() === todayDate.getFullYear() &&
      currentMonth.getMonth() === todayDate.getMonth()
    );
  };

  const isFutureDate = (day) => {
    const todayDate = new Date();
    const todayYear = todayDate.getFullYear();
    const todayMonth = todayDate.getMonth();
    const todayD = todayDate.getDate();

    if (currentMonth.getFullYear() < todayYear) return false;
    if (currentMonth.getFullYear() > todayYear) return true;
    if (currentMonth.getMonth() < todayMonth) return false;
    if (currentMonth.getMonth() > todayMonth) return true;

    return day > todayD;
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
        if (habit.completed_dates) {
          habit.completed_dates.forEach((d) => {
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
                  No habits yet. Add some habits first!
                </td>
              </tr>
            ) : (
              habits.map((habit, habitIndex) => (
                <tr key={habit.id} style={{
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
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{habit.description}</div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const completed = isDateCompleted(habit, day);
                    const isClickable = isToday(day);
                    const isFuture = isFutureDate(day);

                    return (
                      <td key={day} style={{ padding: '4px', textAlign: 'center', backgroundColor: isToday(day) ? 'rgba(79, 172, 254, 0.1)' : 'transparent' }}>
                        <div
                          onClick={() => !isFuture && toggleHabitDate(habit.id, day)}
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
            📊 Pattern Analysis
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
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
              }}
            >
              ← Show All Rows
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
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
                  {selectedThreshold ? `✓ ${selectedThreshold} task${selectedThreshold > 1 ? 's' : ''} complete` : `${habits.length} task${habits.length > 1 ? 's' : ''} total`}
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
              {Array.from({ length: habits.length }, (_, i) => i + 1).map((threshold) => (
                (selectedThreshold === null || selectedThreshold === threshold) && (
                  <tr
                    onClick={() => {
                      if (selectedThreshold === threshold) {
                        setSelectedDot(null);
                        setSelectedThreshold(null);
                      }
                    }}
                    style={{
                      backgroundColor: selectedThreshold === threshold ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.02)',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: selectedThreshold === threshold ? 'pointer' : 'default',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <td style={{
                      padding: '14px',
                      fontWeight: 'bold',
                      color: '#fff',
                      position: 'sticky',
                      left: 0,
                      backgroundColor: selectedThreshold === threshold ? 'rgba(79, 172, 254, 0.1)' : 'rgba(255,255,255,0.02)',
                      borderRight: '2px solid rgba(255,255,255,0.1)',
                      minWidth: '150px'
                    }}>
                      <div>
                        <div style={{ fontSize: '15px', color: selectedThreshold === threshold ? '#4facfe' : '#fff', fontWeight: '600' }}>
                          {selectedThreshold === threshold ? '✓ ' : ''}{threshold} task{threshold > 1 ? 's' : ''} complete
                        </div>
                      </div>
                    </td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const count = dailyCompletions[day] || 0;
                      const isFuture = isFutureDate(day);
                      const isSelected = selectedDot === day && selectedThreshold === threshold;
                      const hasAny = count === threshold;
                      const isActiveRow = selectedThreshold === threshold;

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
                )
              ))}
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
            🎯 Selected: {selectedDot ? `${selectedDot} ${monthNames[currentMonth.getMonth()]} - ${selectedThreshold} task${selectedThreshold > 1 ? 's' : ''} complete` : 'Click any row to see dots'}
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
                    return habit.completed_dates?.some(d => {
                      const compDate = new Date(d);
                      const localDateStr = `${compDate.getFullYear()}-${String(compDate.getMonth() + 1).padStart(2, '0')}-${String(compDate.getDate()).padStart(2, '0')}`;
                      return localDateStr === dateStr;
                    });
                  })
                  .map(habit => (
                    <span key={habit.id} style={{
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
          backdropFilter: 'blur(10px)'
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
          backdropFilter: 'blur(10px)'
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
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>{Object.values(dailyCompletions).reduce((a, b) => a + b, 0)}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '500' }}>Total Completions</div>
        </div>
      </div>
    </div>
  );
}

export default TablePage;
