import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

/**
 * GET /api/categories
 * Get all categories
 */
router.get("/", async (req, res) => {
  try {
    const { include_counts } = req.query;

    let query = supabase.from("categories").select("*").order("name");

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Optionally include track and podcast counts
    if (include_counts === "true") {
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const [tracksResult, podcastsResult] = await Promise.all([
            supabase
              .from("tracks")
              .select("id", { count: "exact", head: true })
              .eq("category_id", category.id),
            supabase
              .from("podcasts")
              .select("id", { count: "exact", head: true })
              .eq("category_id", category.id),
          ]);

          return {
            ...category,
            tracks_count: tracksResult.count || 0,
            podcasts_count: podcastsResult.count || 0,
          };
        })
      );

      return res.json({
        success: true,
        categories: categoriesWithCounts,
      });
    }

    res.json({
      success: true,
      categories: data || [],
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
});

/**
 * GET /api/categories/:id
 * Get a single category by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { include_content } = req.query;

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (categoryError) {
      if (categoryError.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      throw categoryError;
    }

    const result = { ...category };

    // Optionally include tracks and podcasts in this category
    if (include_content === "true") {
      const [tracksResult, podcastsResult] = await Promise.all([
        supabase
          .from("tracks")
          .select("*")
          .eq("category_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("podcasts")
          .select("*")
          .eq("category_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      result.tracks = tracksResult.data || [];
      result.podcasts = podcastsResult.data || [];
    }

    res.json({
      success: true,
      category: result,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
});

/**
 * POST /api/categories
 * Create a new category (admin only - for demo purposes)
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        description: description || "",
        image_url: image_url || "",
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      category: data,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
});

export default router;

