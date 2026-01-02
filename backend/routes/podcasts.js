import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

/**
 * GET /api/podcasts
 * Get all podcasts with optional filtering
 * Query params: search, category, limit, page
 */
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      limit = 50,
      page = 1,
      sort = "created_at",
      order = "desc",
    } = req.query;

    let query = supabase.from("podcasts").select("*", { count: "exact" });

    // Search filter
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,host.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // Category filter
    if (category) {
      query = query.eq("category_id", category).or(`category.eq.${category}`);
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
      podcasts: data || [],
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    });
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch podcasts",
      error: error.message,
    });
  }
});

/**
 * GET /api/podcasts/:id
 * Get a single podcast by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Podcast not found",
        });
      }
      throw error;
    }

    // Increment play count
    await supabase
      .from("podcasts")
      .update({ play_count: (data.play_count || 0) + 1 })
      .eq("id", id);

    res.json({
      success: true,
      podcast: data,
    });
  } catch (error) {
    console.error("Error fetching podcast:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch podcast",
      error: error.message,
    });
  }
});

/**
 * GET /api/podcasts/popular/top
 * Get popular podcasts
 */
router.get("/popular/top", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .order("play_count", { ascending: false })
      .order("likes", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      podcasts: data || [],
    });
  } catch (error) {
    console.error("Error fetching popular podcasts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch popular podcasts",
      error: error.message,
    });
  }
});

/**
 * POST /api/podcasts
 * Create a new podcast
 */
router.post("/", async (req, res) => {
  try {
    const {
      title,
      host,
      description,
      category,
      category_id,
      duration,
      audio_url,
      cover_image,
    } = req.body;

    if (!title || !host || !duration || !audio_url) {
      return res.status(400).json({
        success: false,
        message: "Title, host, duration, and audio_url are required",
      });
    }

    const { data, error } = await supabase
      .from("podcasts")
      .insert({
        title,
        host,
        description: description || "",
        category: category || "General",
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
      podcast: data,
    });
  } catch (error) {
    console.error("Error creating podcast:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create podcast",
      error: error.message,
    });
  }
});

export default router;
