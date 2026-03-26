const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const habitRoutes = require("./routes/habits");
const contactRoutes = require("./routes/contact");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/contact", contactRoutes);

console.log("🚀 Server running with Supabase on port 5000");

app.listen(5000);