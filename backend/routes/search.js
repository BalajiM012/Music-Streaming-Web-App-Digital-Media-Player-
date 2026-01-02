import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

/**
 * GET /api/search
 * Global search across tracks, podcasts, playlists, and artists
 */
router.get("/", async (req, res) => {
  try {
    const { q, type = "all", limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        tracks: [],
        podcasts: [],
        playlists: [],
        artists: [],
      });
    }

    const searchQuery = q.trim();
    const limitNum = parseInt(limit);

    const results = {
      tracks: [],
      podcasts: [],
      playlists: [],
      artists: [],
    };

    // Search tracks
    if (type === "all" || type === "tracks" || type === "songs") {
      const { data: tracks, error: tracksError } = await supabase
        .from("tracks")
        .select("*")
        .or(
          `title.ilike.%${searchQuery}%,artist.ilike.%${searchQuery}%,album.ilike.%${searchQuery}%`
        )
        .limit(limitNum);

      if (!tracksError) {
        results.tracks = tracks || [];
      }
    }

    // Search podcasts
    if (type === "all" || type === "podcasts") {
      const { data: podcasts, error: podcastsError } = await supabase
        .from("podcasts")
        .select("*")
        .or(
          `title.ilike.%${searchQuery}%,host.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        )
        .limit(limitNum);

      if (!podcastsError) {
        results.podcasts = podcasts || [];
      }
    }

    // Search playlists
    if (type === "all" || type === "playlists") {
      const { data: playlists, error: playlistsError } = await supabase
        .from("playlists")
        .select("*")
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq("is_public", true)
        .limit(limitNum);

      if (!playlistsError) {
        results.playlists = playlists || [];
      }
    }

    // Search artists (from tracks)
    if (type === "all" || type === "artists") {
      const { data: tracks, error: tracksError } = await supabase
        .from("tracks")
        .select("artist")
        .ilike("artist", `%${searchQuery}%`)
        .limit(limitNum * 2); // Get more to extract unique artists

      if (!tracksError && tracks) {
        const uniqueArtists = [
          ...new Set(tracks.map((t) => t.artist).filter(Boolean)),
        ].slice(0, limitNum);

        results.artists = uniqueArtists.map((artist) => ({
          name: artist,
          trackCount: tracks.filter((t) => t.artist === artist).length,
        }));
      }
    }

    res.json({
      success: true,
      query: searchQuery,
      ...results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
});

export default router;

