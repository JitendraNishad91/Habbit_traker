const router = require("express").Router();
const { supabase } = require("../supabase");

router.post("/create", async (req, res) => {
  try {
    const { userId, title, description } = req.body;

    const { data: habit, error } = await supabase
      .from("habits")
      .insert([
        {
          user_id: userId,
          title,
          description: description || "",
          completed_dates: [],
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Create habit error:", error);
      return res.status(500).json({ message: "Failed to create habit" });
    }

    res.json(habit);
  } catch (error) {
    console.error("Create habit error:", error);
    res.status(500).json({ message: "Failed to create habit" });
  }
});

router.get("/all/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: habits, error } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Get habits error:", error);
      return res.status(200).json([]);
    }

    const sortedHabits = (habits || []).sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    res.json(sortedHabits);
  } catch (error) {
    console.error("Get habits error:", error);
    res.status(200).json([]);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("habits")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete habit error:", error);
      return res.status(500).json({ message: "Failed to delete habit" });
    }

    res.json("Deleted");
  } catch (error) {
    console.error("Delete habit error:", error);
    res.status(500).json({ message: "Failed to delete habit" });
  }
});

router.post("/toggle/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.body;

    const { data: habit, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !habit) {
      return res.status(404).json("Habit not found");
    }

    const toggleDate = new Date(date);
    toggleDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (toggleDate.getTime() !== today.getTime()) {
      return res.status(400).json("Can only toggle today's date");
    }

    let completedDates = habit.completed_dates || [];
    
    const existingIndex = completedDates.findIndex(d => {
      const compDate = new Date(d);
      compDate.setHours(0, 0, 0, 0);
      return compDate.getTime() === toggleDate.getTime();
    });

    if (existingIndex > -1) {
      completedDates.splice(existingIndex, 1);
    } else {
      completedDates.push(toggleDate.toISOString());
    }

    const { data: updatedHabit, error: updateError } = await supabase
      .from("habits")
      .update({ completed_dates: completedDates })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Toggle habit error:", updateError);
      return res.status(500).json({ message: "Failed to toggle habit" });
    }

    res.json(updatedHabit);
  } catch (error) {
    console.error("Toggle habit error:", error);
    res.status(500).json(error.message);
  }
});

router.post("/focus-log", async (req, res) => {
  try {
    const { habitId, timeSpent, date } = req.body;

    const { data: existingLog } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("habit_id", habitId)
      .eq("date", date)
      .single();

    if (existingLog) {
      const { data: updatedLog, error } = await supabase
        .from("habit_logs")
        .update({ 
          time_spent: (existingLog.time_spent || 0) + timeSpent 
        })
        .eq("id", existingLog.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ message: "Failed to update log" });
      }
      return res.json(updatedLog);
    } else {
      const { data: newLog, error } = await supabase
        .from("habit_logs")
        .insert([
          {
            habit_id: habitId,
            date,
            time_spent: timeSpent,
            completed: false,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        return res.status(500).json({ message: "Failed to create log" });
      }
      return res.json(newLog);
    }
  } catch (error) {
    console.error("Focus log error:", error);
    res.status(500).json(error.message);
  }
});

router.get("/focus-logs/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: habits } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", userId);

    if (!habits || habits.length === 0) {
      return res.json([]);
    }

    const habitIds = habits.map(h => h.id);

    const { data: logs, error } = await supabase
      .from("habit_logs")
      .select("*")
      .in("habit_id", habitIds);

    if (error) {
      return res.status(500).json([]);
    }

    res.json(logs || []);
  } catch (error) {
    console.error("Get focus logs error:", error);
    res.status(500).json([]);
  }
});

module.exports = router;
