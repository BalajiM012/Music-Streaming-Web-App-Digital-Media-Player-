import express from "express";
import { supabase } from "../config/supabase.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/playlists
 * Get all playlists (public only if not authenticated)
 */
router.get("/", async (req, res) => {
  try {
    let query = supabase
      .from("playlists")
      .select(
        `
        *,
        owner:users!playlists_owner_id_fkey(id, username, email)
      `
      )
      .order("created_at", { ascending: false });

    // If not authenticated, only show public playlists
    if (!req.user) {
      query = query.eq("is_public", true);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Fetch tracks for each playlist
    const playlistsWithTracks = await Promise.all(
      (data || []).map(async (playlist) => {
        const { data: playlistTracks } = await supabase
          .from("playlist_tracks")
          .select("track_id, position")
          .eq("playlist_id", playlist.id)
          .order("position", { ascending: true });

        const trackIds = playlistTracks?.map((pt) => pt.track_id) || [];

        let tracks = [];
        if (trackIds.length > 0) {
          const { data: tracksData } = await supabase
            .from("tracks")
            .select("*")
            .in("id", trackIds);

          // Sort tracks by position
          tracks = trackIds
            .map((id) => tracksData?.find((t) => t.id === id))
            .filter(Boolean);
        }

        return {
          ...playlist,
          songs: tracks,
        };
      })
    );

    res.json({
      success: true,
      playlists: playlistsWithTracks,
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * GET /api/playlists/my-playlists
 * Get user's playlists (requires authentication)
 */
router.get("/my-playlists", authenticateToken, async (req, res) => {
  try {
    const { data: playlists, error } = await supabase
      .from("playlists")
      .select("*")
      .eq("owner_id", req.user.userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch tracks for each playlist
    const playlistsWithTracks = await Promise.all(
      (playlists || []).map(async (playlist) => {
        const { data: playlistTracks } = await supabase
          .from("playlist_tracks")
          .select("track_id, position")
          .eq("playlist_id", playlist.id)
          .order("position", { ascending: true });

        const trackIds = playlistTracks?.map((pt) => pt.track_id) || [];

        let tracks = [];
        if (trackIds.length > 0) {
          const { data: tracksData } = await supabase
            .from("tracks")
            .select("*")
            .in("id", trackIds);

          tracks = trackIds
            .map((id) => tracksData?.find((t) => t.id === id))
            .filter(Boolean);
        }

        return {
          ...playlist,
          songs: tracks,
        };
      })
    );

    res.json({
      success: true,
      playlists: playlistsWithTracks,
    });
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * GET /api/playlists/:id
 * Get playlist by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .select(
        `
        *,
        owner:users!playlists_owner_id_fkey(id, username, email)
      `
      )
      .eq("id", id)
      .single();

    if (playlistError) {
      if (playlistError.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Playlist not found",
        });
      }
      throw playlistError;
    }

    // Check if playlist is public or user is owner
    if (
      !playlist.is_public &&
      (!req.user || playlist.owner_id !== req.user.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Fetch tracks
    const { data: playlistTracks } = await supabase
      .from("playlist_tracks")
      .select("track_id, position")
      .eq("playlist_id", id)
      .order("position", { ascending: true });

    const trackIds = playlistTracks?.map((pt) => pt.track_id) || [];

    let tracks = [];
    if (trackIds.length > 0) {
      const { data: tracksData } = await supabase
        .from("tracks")
        .select("*")
        .in("id", trackIds);

      tracks = trackIds
        .map((id) => tracksData?.find((t) => t.id === id))
        .filter(Boolean);
    }

    res.json({
      success: true,
      playlist: {
        ...playlist,
        songs: tracks,
      },
    });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * POST /api/playlists
 * Create playlist (requires authentication)
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description, is_public, cover_image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Playlist name is required",
      });
    }

    const { data: playlist, error } = await supabase
      .from("playlists")
      .insert({
        name,
        description: description || "",
        owner_id: req.user.userId,
        is_public: is_public !== undefined ? is_public : true,
        cover_image: cover_image || "",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Fetch owner info
    const { data: owner } = await supabase
      .from("users")
      .select("id, username, email")
      .eq("id", playlist.owner_id)
      .single();

    res.status(201).json({
      success: true,
      playlist: {
        ...playlist,
        owner: owner,
        songs: [],
      },
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * PUT /api/playlists/:id
 * Update playlist (requires authentication)
 */
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if playlist exists and user is owner
    const { data: existingPlaylist, error: checkError } = await supabase
      .from("playlists")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (checkError || !existingPlaylist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (existingPlaylist.owner_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this playlist",
      });
    }

    const { name, description, is_public, cover_image } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_public !== undefined) updateData.is_public = is_public;
    if (cover_image !== undefined) updateData.cover_image = cover_image;

    const { data: playlist, error } = await supabase
      .from("playlists")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Fetch owner and tracks
    const { data: owner } = await supabase
      .from("users")
      .select("id, username, email")
      .eq("id", playlist.owner_id)
      .single();

    const { data: playlistTracks } = await supabase
      .from("playlist_tracks")
      .select("track_id, position")
      .eq("playlist_id", id)
      .order("position", { ascending: true });

    const trackIds = playlistTracks?.map((pt) => pt.track_id) || [];
    let tracks = [];
    if (trackIds.length > 0) {
      const { data: tracksData } = await supabase
        .from("tracks")
        .select("*")
        .in("id", trackIds);

      tracks = trackIds
        .map((id) => tracksData?.find((t) => t.id === id))
        .filter(Boolean);
    }

    res.json({
      success: true,
      playlist: {
        ...playlist,
        owner: owner,
        songs: tracks,
      },
    });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * POST /api/playlists/:id/songs
 * Add track to playlist (requires authentication)
 */
router.post("/:id/songs", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({
        success: false,
        message: "Song ID is required",
      });
    }

    // Check if playlist exists and user is owner
    const { data: playlist, error: checkError } = await supabase
      .from("playlists")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (checkError || !playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (playlist.owner_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this playlist",
      });
    }

    // Check if track already exists in playlist
    const { data: existing } = await supabase
      .from("playlist_tracks")
      .select("id")
      .eq("playlist_id", id)
      .eq("track_id", songId)
      .single();

    if (!existing) {
      // Get current max position
      const { data: maxPos } = await supabase
        .from("playlist_tracks")
        .select("position")
        .eq("playlist_id", id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const position = maxPos ? maxPos.position + 1 : 0;

      const { error: insertError } = await supabase
        .from("playlist_tracks")
        .insert({
          playlist_id: id,
          track_id: songId,
          position: position,
        });

      if (insertError) {
        throw insertError;
      }
    }

    // Fetch updated playlist with tracks
    const { data: updatedPlaylist } = await supabase
      .from("playlists")
      .select(
        `
        *,
        owner:users!playlists_owner_id_fkey(id, username, email)
      `
      )
      .eq("id", id)
      .single();

    const { data: playlistTracks } = await supabase
      .from("playlist_tracks")
      .select("track_id, position")
      .eq("playlist_id", id)
      .order("position", { ascending: true });

    const trackIds = playlistTracks?.map((pt) => pt.track_id) || [];
    let tracks = [];
    if (trackIds.length > 0) {
      const { data: tracksData } = await supabase
        .from("tracks")
        .select("*")
        .in("id", trackIds);

      tracks = trackIds
        .map((id) => tracksData?.find((t) => t.id === id))
        .filter(Boolean);
    }

    res.json({
      success: true,
      playlist: {
        ...updatedPlaylist,
        songs: tracks,
      },
    });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/playlists/:id/songs/:songId
 * Remove track from playlist (requires authentication)
 */
router.delete("/:id/songs/:songId", authenticateToken, async (req, res) => {
  try {
    const { id, songId } = req.params;

    // Check if playlist exists and user is owner
    const { data: playlist, error: checkError } = await supabase
      .from("playlists")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (checkError || !playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (playlist.owner_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this playlist",
      });
    }

    const { error: deleteError } = await supabase
      .from("playlist_tracks")
      .delete()
      .eq("playlist_id", id)
      .eq("track_id", songId);

    if (deleteError) {
      throw deleteError;
    }

    // Fetch updated playlist with tracks
    const { data: updatedPlaylist } = await supabase
      .from("playlists")
      .select(
        `
        *,
        owner:users!playlists_owner_id_fkey(id, username, email)
      `
      )
      .eq("id", id)
      .single();

    const { data: playlistTracks } = await supabase
      .from("playlist_tracks")
      .select("track_id, position")
      .eq("playlist_id", id)
      .order("position", { ascending: true });

    const trackIds = playlistTracks?.map((pt) => pt.track_id) || [];
    let tracks = [];
    if (trackIds.length > 0) {
      const { data: tracksData } = await supabase
        .from("tracks")
        .select("*")
        .in("id", trackIds);

      tracks = trackIds
        .map((id) => tracksData?.find((t) => t.id === id))
        .filter(Boolean);
    }

    res.json({
      success: true,
      playlist: {
        ...updatedPlaylist,
        songs: tracks,
      },
    });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/playlists/:id
 * Delete playlist (requires authentication)
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if playlist exists and user is owner
    const { data: playlist, error: checkError } = await supabase
      .from("playlists")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (checkError || !playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    if (playlist.owner_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this playlist",
      });
    }

    // Delete playlist tracks first (cascade should handle this, but being explicit)
    await supabase.from("playlist_tracks").delete().eq("playlist_id", id);

    // Delete playlist
    const { error: deleteError } = await supabase
      .from("playlists")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    res.json({
      success: true,
      message: "Playlist deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
