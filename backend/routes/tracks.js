import express from "express";
import { supabase } from "../config/supabase.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/tracks
 * Get all tracks with optional filtering
 * Query params: search, genre, category, limit, page
 */
router.get("/", async (req, res) => {
  try {
    const {
      search,
      genre,
      category,
      limit = 50,
      page = 1,
      sort = "created_at",
      order = "desc",
    } = req.query;

    let query = supabase.from("tracks").select("*", { count: "exact" });

    // Search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,artist.ilike.%${search}%,album.ilike.%${search}%`
      );
    }

    // Genre filter
    if (genre) {
      query = query.eq("genre", genre);
    }

    // Category filter
    if (category) {
      query = query.eq("category_id", category);
    }

    // Sorting
    query = query.order(sort, { ascending: order === "asc" });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      tracks: data || [],
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tracks",
      error: error.message,
    });
  }
});

/**
 * GET /api/tracks/:id
 * Get a single track by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Track not found",
        });
      }
      throw error;
    }

    // Increment play count
    await supabase
      .from("tracks")
      .update({ play_count: (data.play_count || 0) + 1 })
      .eq("id", id);

    res.json({
      success: true,
      track: data,
    });
  } catch (error) {
    console.error("Error fetching track:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch track",
      error: error.message,
    });
  }
});

/**
 * GET /api/tracks/popular/top
 * Get popular tracks
 */
router.get("/popular/top", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("play_count", { ascending: false })
      .order("likes", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      tracks: data || [],
    });
  } catch (error) {
    console.error("Error fetching popular tracks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular tracks",
      error: error.message,
    });
  }
});

/**
 * GET /api/tracks/genre/:genre
 * Get tracks by genre
 */
router.get("/genre/:genre", async (req, res) => {
  try {
    const { genre } = req.params;

    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("genre", genre)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      tracks: data || [],
    });
  } catch (error) {
    console.error("Error fetching tracks by genre:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tracks",
      error: error.message,
    });
  }
});

/**
 * POST /api/tracks
 * Create a new track (requires authentication)
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      artist,
      album,
      genre,
      category_id,
      duration,
      audio_url,
      cover_image,
    } = req.body;

    if (!title || !artist || !duration || !audio_url) {
      return res.status(400).json({
        success: false,
        message: "Title, artist, duration, and audio_url are required",
      });
    }

    const { data, error } = await supabase
      .from("tracks")
      .insert({
        title,
        artist,
        album: album || "Unknown Album",
        genre: genre || "Unknown",
        category_id: category_id || null,
        duration: parseInt(duration),
        audio_url,
        cover_image: cover_image || "",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      track: data,
    });
  } catch (error) {
    console.error("Error creating track:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create track",
      error: error.message,
    });
  }
});

export default router;

