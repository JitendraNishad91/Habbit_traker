const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../supabase");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "alreadyregistered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password: hashed,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ message: "Registration failed" });
    }

    res.json(newUser);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).send("User not found");
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).send("Invalid password");
    }

    const token = jwt.sign(
      { id: user.id },
      "secret"
    );

    res.json({ token, userId: user.id, name: user.name });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Login failed");
  }
});

module.exports = router;
