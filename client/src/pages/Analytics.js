import { useState, useEffect } from "react";
import axios from "axios";

function Analytics() {
  const [habits, setHabits] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDot, setSelectedDot] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/habits/all/${userId}`);
      setHabits(res.data);
    } catch (error) {
      console.error("Error loading habits:", error);
    }
  };

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
      const compDate = new Date(d).toISOString().split("T")[0];
      return compDate === dateStr;
    });
  };

  const toggleHabitDate = async (habitId, day) => {
    const today = new Date();
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (
      targetDate.getDate() !== today.getDate() ||
      targetDate.getMonth() !== today.getMonth() ||
      targetDate.getFullYear() !== today.getFullYear()
    ) return;

    try {
      await axios.post(`http://localhost:5000/api/habits/toggle/${habitId}`, {
        date: targetDate.toISOString().split("T")[0],
      });
      loadHabits();
    } catch (error) {
      console.error("Error toggling habit:", error);
    }
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isFutureDate = (day) => {
    const today = new Date();
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return targetDate > today;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = getDaysInMonth(currentMonth);
  const today = new Date();

  const getDailyCompletions = () => {
    const completions = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let count = 0;
      habits.forEach((habit) => {
        if (habit.completedDates) {
          habit.completedDates.forEach((d) => {
            const compDate = new Date(d).toISOString().split("T")[0];
            if (compDate === dateStr) count++;
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
    <div style={{ padding: "20px", width: "100%", margin: 0 }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#fff", fontSize: "36px", fontWeight: "800" }}>
        📊 Analytics - Monthly View
      </h1>

      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        padding: "15px",
        borderRadius: "10px"
      }}>
        <button 
          onClick={prevMonth}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          ← Prev
        </button>
        <h2 style={{ margin: 0, color: "#fff", fontSize: "22px", fontWeight: "700" }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button 
          onClick={nextMonth}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}
        >
          Next →
        </button>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "20px", 
        justifyContent: "center", 
        marginBottom: "20px",
        padding: "10px",
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(10px)",
        borderRadius: "8px",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ 
            width: "24px", 
            height: "24px", 
            backgroundColor: "#4CAF50", 
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px"
          }}>✓</div>
          <span style={{ fontSize: "14px", color: "#fff" }}>Completed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ 
            width: "24px", 
            height: "24px", 
            backgroundColor: "#fff", 
            border: "2px solid #ccc", 
            borderRadius: "4px" 
          }}></div>
          <span style={{ fontSize: "14px", color: "#fff" }}>Empty</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ 
            width: "24px", 
            height: "24px", 
            backgroundColor: "#2196F3", 
            borderRadius: "4px",
            border: "3px solid #1976D2"
          }}></div>
          <span style={{ fontSize: "14px", color: "#fff" }}>Today (Clickable)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ 
            width: "24px", 
            height: "24px", 
            backgroundColor: "#ddd",
            borderRadius: "4px"
          }}></div>
          <span style={{ fontSize: "14px", color: "#fff" }}>Future (Disabled)</span>
        </div>
      </div>

      <div style={{ 
        overflowX: "auto", 
        marginBottom: "40px",
        background: "rgba(20, 20, 40, 0.9)",
        backdropFilter: "blur(10px)",
        borderRadius: "10px",
        padding: "10px",
        border: "1px solid rgba(255, 255, 255, 0.15)"
      }}>
        <table style={{ 
          minWidth: "800px",
          borderCollapse: "collapse" 
        }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "#0f0f23" }}>
              <th style={{ 
                padding: "12px", 
                textAlign: "left", 
                borderBottom: "2px solid rgba(0,0,0,0.2)",
                position: "sticky",
                left: 0,
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                zIndex: 2,
                minWidth: "150px",
                fontWeight: "700"
              }}>
                Habits ↓ / Date →
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <th key={day} style={{ 
                  padding: "8px 4px", 
                  textAlign: "center",
                  fontSize: "11px",
                  borderBottom: "2px solid rgba(0,0,0,0.2)",
                  backgroundColor: isToday(day) ? "#1976D2" : "transparent",
                  color: "#fff",
                  minWidth: "30px"
                }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {habits.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 1} style={{ 
                  textAlign: "center", 
                  padding: "40px", 
                  color: "#fff" 
                }}>
                  No habits created yet. Go to Dashboard to add habits!
                </td>
              </tr>
            ) : (
              habits.map((habit, habitIndex) => (
                <tr 
                  key={habit._id} 
                  style={{ 
                    backgroundColor: habitIndex % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                    borderBottom: "1px solid rgba(255,255,255,0.1)"
                  }}
                >
                  <td style={{ 
                    padding: "12px", 
                    fontWeight: "bold", 
                    color: "#fff",
                    position: "sticky",
                    left: 0,
                    backgroundColor: habitIndex % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
                    borderRight: "2px solid rgba(255,255,255,0.1)",
                    minWidth: "150px"
                  }}>
                    <div>
                      <div style={{ fontSize: "14px" }}>{habit.title}</div>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>{habit.category}</div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const completed = isDateCompleted(habit, day);
                    const isClickable = isToday(day);
                    const isFuture = isFutureDate(day);

                    return (
                      <td 
                        key={day} 
                        style={{ 
                          padding: "4px", 
                          textAlign: "center",
                          backgroundColor: isToday(day) ? "rgba(79, 172, 254, 0.1)" : "transparent"
                        }}
                      >
                        <div
                          onClick={() => !isFuture && toggleHabitDate(habit._id, day)}
                          style={{
                            width: "24px",
                            height: "24px",
                            margin: "0 auto",
                            borderRadius: "4px",
                            border: completed 
                              ? "none" 
                              : isFuture 
                                ? "1px dashed rgba(255,255,255,0.2)" 
                                : isClickable
                                  ? "2px solid #4facfe"
                                  : "2px solid rgba(255,255,255,0.3)",
                            backgroundColor: completed 
                              ? "#4CAF50" 
                              : isFuture 
                                ? "rgba(255,255,255,0.05)" 
                                : isClickable 
                                  ? "rgba(79, 172, 254, 0.2)" 
                                  : "rgba(255,255,255,0.1)",
                            cursor: isFuture ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.2s",
                            opacity: isFuture ? 0.4 : 1,
                          }}
                        >
                          {completed && (
                            <span style={{ color: "white", fontSize: "14px", fontWeight: "bold" }}>✓</span>
                          )}
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
        background: "rgba(20, 20, 40, 0.9)",
        backdropFilter: "blur(10px)",
        borderRadius: "10px", 
        padding: "20px",
        marginBottom: "30px",
        border: "1px solid rgba(255, 255, 255, 0.15)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#fff", fontSize: "22px", fontWeight: "700" }}>
          📈 Daily Task Pattern (Click dots to see details)
        </h2>
        
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse" 
        }}>
          <thead>
            <tr style={{ background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)", color: "white" }}>
              <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid rgba(255,255,255,0.2)", width: "100px" }}>
                Date
              </th>
              <th style={{ padding: "12px", textAlign: "center", borderBottom: "2px solid rgba(255,255,255,0.2)", width: "120px" }}>
                Tasks Done
              </th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "2px solid rgba(255,255,255,0.2)" }}>
                Pattern Dots (•)
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(day => !isFutureDate(day)).map((day) => {
              const count = dailyCompletions[day] || 0;
              const isSelected = selectedDot === day;

              return (
                <tr 
                  key={day}
                  style={{ 
                    backgroundColor: isToday(day) ? "rgba(76, 175, 80, 0.1)" : count > 0 ? "rgba(255,255,255,0.05)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onClick={() => setSelectedDot(isSelected ? null : day)}
                >
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ 
                      fontWeight: isToday(day) ? "bold" : "normal",
                      color: isToday(day) ? "#4CAF50" : "#fff",
                      fontSize: "14px"
                    }}>
                      {day} {monthNames[currentMonth.getMonth()].substring(0, 3)}
                      {isToday(day) && " 🎯"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{ 
                      fontSize: "28px", 
                      fontWeight: "bold",
                      color: count > 0 ? "#4CAF50" : "rgba(255,255,255,0.3)"
                    }}>
                      {count > 0 ? count : "-"}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ 
                      display: "flex", 
                      gap: "6px",
                      flexWrap: "wrap",
                      alignItems: "center"
                    }}>
                      {count > 0 ? (
                        <>
                          {Array.from({ length: count }).map((_, i) => (
                            <span
                              key={i}
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                backgroundColor: isSelected && isToday(day) ? "#2196F3" : "#4CAF50",
                                display: "inline-block",
                                transition: "all 0.2s",
                                transform: isSelected && isToday(day) ? "scale(1.2)" : "scale(1)",
                                boxShadow: isSelected && isToday(day) ? "0 0 8px #2196F3" : "none"
                              }}
                            />
                          ))}
                          <span style={{ 
                            marginLeft: "10px", 
                            fontSize: "12px", 
                            color: "rgba(255,255,255,0.6)",
                            fontStyle: "italic"
                          }}>
                            {count} {count === 1 ? "task" : "tasks"} completed
                          </span>
                        </>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>No tasks</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedDot && dailyCompletions[selectedDot] > 0 && (
        <div style={{
          marginBottom: "30px",
          padding: "20px",
          background: "rgba(20, 20, 40, 0.9)",
          backdropFilter: "blur(10px)",
          borderRadius: "10px",
          border: "2px solid rgba(79, 172, 254, 0.5)"
        }}>
          <h3 style={{ color: "#fff", marginBottom: "15px", textAlign: "center", fontSize: "20px", fontWeight: "700" }}>
            📋 Details for {selectedDot} {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "10px",
            justifyContent: "center",
            marginBottom: "15px"
          }}>
            {habits
              .filter(habit => {
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(selectedDot).padStart(2, '0')}`;
                return habit.completedDates?.some(d => {
                  const compDate = new Date(d).toISOString().split("T")[0];
                  return compDate === dateStr;
                });
              })
              .map(habit => (
                <span key={habit._id} style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)"
                }}>
                  ✓ {habit.title}
                </span>
              ))}
          </div>
          <p style={{ textAlign: "center", marginTop: "15px", color: "rgba(255,255,255,0.7)" }}>
            Total: <strong style={{ color: "#4CAF50", fontSize: "20px" }}>
              {dailyCompletions[selectedDot]}
            </strong> {dailyCompletions[selectedDot] === 1 ? "task" : "tasks"} completed
          </p>
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px"
      }}>
        <div style={{
          padding: "20px",
          background: "linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)",
          borderRadius: "10px",
          textAlign: "center",
          border: "2px solid rgba(76, 175, 80, 0.3)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#4CAF50", marginBottom: "8px" }}>{habits.length}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>Total Habits</div>
        </div>
        <div style={{
          padding: "20px",
          background: "linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(79, 172, 254, 0.1) 100%)",
          borderRadius: "10px",
          textAlign: "center",
          border: "2px solid rgba(79, 172, 254, 0.3)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#4facfe", marginBottom: "8px" }}>
            {Object.values(dailyCompletions).filter(c => c > 0).length}
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>Active Days</div>
        </div>
        <div style={{
          padding: "20px",
          background: "linear-gradient(135deg, rgba(255, 152, 0, 0.2) 0%, rgba(255, 152, 0, 0.1) 100%)",
          borderRadius: "10px",
          textAlign: "center",
          border: "2px solid rgba(255, 152, 0, 0.3)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#ff9800", marginBottom: "8px" }}>
            {Object.values(dailyCompletions).reduce((a, b) => a + b, 0)}
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>Total Completions</div>
        </div>
        <div style={{
          padding: "20px",
          background: "linear-gradient(135deg, rgba(156, 39, 176, 0.2) 0%, rgba(156, 39, 176, 0.1) 100%)",
          borderRadius: "10px",
          textAlign: "center",
          border: "2px solid rgba(156, 39, 176, 0.3)",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#9c27b0", marginBottom: "8px" }}>
            {habits.length > 0 
              ? Math.round((Object.values(dailyCompletions).reduce((a, b) => a + b, 0) / habits.length))
              : 0}
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px" }}>Avg/Habit</div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
