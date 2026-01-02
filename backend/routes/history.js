import express from "express";
import { supabase } from "../config/supabase.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/history
 * Get user's listening history (requires authentication)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from("listening_history")
      .select(
        `
        *,
        track:tracks(*),
        podcast:podcasts(*)
      `
      )
      .eq("user_id", req.user.userId)
      .order("last_played_at", { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    // Format response
    const history = (data || []).map((item) => {
      const content = item.track || item.podcast;
      return {
        id: item.id,
        content: content,
        lastPosition: item.last_position,
        playCount: item.play_count,
        lastPlayedAt: item.last_played_at,
        type: item.track ? "track" : "podcast",
      };
    });

    res.json({
      success: true,
      history: history,
    });
  } catch (error) {
    console.error("Error fetching listening history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch listening history",
      error: error.message,
    });
  }
});

/**
 * POST /api/history
 * Update listening history (requires authentication)
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { trackId, podcastId, position } = req.body;

    if (!trackId && !podcastId) {
      return res.status(400).json({
        success: false,
        message: "Either trackId or podcastId is required",
      });
    }

    if (position === undefined || position === null) {
      return res.status(400).json({
        success: false,
        message: "Position is required",
      });
    }

    // Check if history entry exists
    const query = supabase
      .from("listening_history")
      .select("id, play_count")
      .eq("user_id", req.user.userId);

    if (trackId) {
      query.eq("track_id", trackId).is("podcast_id", null);
    } else {
      query.eq("podcast_id", podcastId).is("track_id", null);
    }

    const { data: existing } = await query.single();

    if (existing) {
      // Update existing entry
      const { data, error } = await supabase
        .from("listening_history")
        .update({
          last_position: Math.floor(position),
          play_count: existing.play_count + 1,
          last_played_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        history: data,
      });
    } else {
      // Create new entry
      const insertData = {
        user_id: req.user.userId,
        last_position: Math.floor(position),
        play_count: 1,
        last_played_at: new Date().toISOString(),
      };

      if (trackId) {
        insertData.track_id = trackId;
      } else {
        insertData.podcast_id = podcastId;
      }

      const { data, error } = await supabase
        .from("listening_history")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        history: data,
      });
    }
  } catch (error) {
    console.error("Error updating listening history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update listening history",
      error: error.message,
    });
  }
});

/**
 * GET /api/history/resume/:trackId
 * Get resume position for a track (requires authentication)
 */
router.get("/resume/:trackId", authenticateToken, async (req, res) => {
  try {
    const { trackId } = req.params;

    const { data, error } = await supabase
      .from("listening_history")
      .select("last_position, track:tracks(*)")
      .eq("user_id", req.user.userId)
      .eq("track_id", trackId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) {
      return res.json({
        success: true,
        position: 0,
      });
    }

    res.json({
      success: true,
      position: data.last_position || 0,
      track: data.track,
    });
  } catch (error) {
    console.error("Error fetching resume position:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch resume position",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/history/:id
 * Delete history entry (requires authentication)
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("listening_history")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: "History entry deleted",
    });
  } catch (error) {
    console.error("Error deleting history entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete history entry",
      error: error.message,
    });
  }
});

export default router;

