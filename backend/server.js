import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import songRoutes from "./routes/songs.js";
import playlistRoutes from "./routes/playlists.js";
import podcastRoutes from "./routes/podcasts.js";
import userRoutes from "./routes/users.js";
import jiosaavnRoutes from "./routes/jiosaavn.js";
// New Supabase routes
import tracksRoutes from "./routes/tracks.js";
import categoriesRoutes from "./routes/categories.js";
import historyRoutes from "./routes/history.js";
import searchRoutes from "./routes/search.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (audio files)
app.use(
  "/uploads/audio",
  express.static(path.join(__dirname, "uploads/audio"))
);
app.use(
  "/uploads/images",
  express.static(path.join(__dirname, "uploads/images"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes); // Legacy route (uses Supabase)
app.use("/api/tracks", tracksRoutes); // New Supabase route
app.use("/api/playlists", playlistRoutes);
app.use("/api/podcasts", podcastRoutes);
app.use("/api/categories", categoriesRoutes); // New Supabase route
app.use("/api/users", userRoutes);
app.use("/api/jiosaavn", jiosaavnRoutes);
app.use("/api/history", historyRoutes); // Listening history
app.use("/api/search", searchRoutes); // Global search
app.use("/api/admin", adminRoutes); // Admin routes

// Health check
app.get("/api/health", async (req, res) => {
  try {
    // Test Supabase connection
    const { supabase } = await import("./config/supabase.js");
    const { error } = await supabase.from("categories").select("id").limit(1);

    if (error) {
      return res.status(503).json({
        status: "ERROR",
        message: "Supabase connection failed",
        error: error.message,
      });
    }

    res.json({
      status: "OK",
      message: "Lamentix API is running",
      database: "Supabase connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      message: "Health check failed",
      error: error.message,
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Supabase: ${process.env.SUPABASE_URL ? "Configured" : "Not configured"}`
  );
});

export default app;
