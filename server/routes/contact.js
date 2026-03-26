const router = require("express").Router();
const { supabase } = require("../supabase");

router.post("/submit", async (req, res) => {
  try {
    const { name, email, query } = req.body;

    if (!email || !query) {
      return res.status(400).json({ message: "Email and query are required" });
    }

    const { data, error } = await supabase
      .from("contacts")
      .insert([
        {
          name: name || "Anonymous",
          email,
          query,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Contact insert error:", error);
      return res.status(500).json({ message: "Failed to submit query" });
    }

    res.json({ message: "Query submitted successfully", data });
  } catch (error) {
    console.error("Contact error:", error);
    res.status(500).json({ message: "Failed to submit query" });
  }
});

module.exports = router;
