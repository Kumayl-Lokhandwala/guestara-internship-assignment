import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
import menuRoutes from "./routes/menuRoutes.js"; // <-- 1. Import routes

// Connect to Database
connectDB();

const app = express();
app.use(express.json());

// --- Use Routes ---
app.use("/api", menuRoutes); // <-- 2. Use the routes, prefixing with /api

app.get("/", (req, res) => {
  res.send("Menu Management Backend is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
