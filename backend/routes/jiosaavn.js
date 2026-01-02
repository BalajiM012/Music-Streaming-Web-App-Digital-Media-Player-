import express from "express";
import jioSaavnService from "../services/jiosaavnService.js";
import Song from "../models/Song.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Search songs on JioSaavn
 * GET /api/jiosaavn/search
 */
router.get("/search", async (req, res) => {
  try {
    const { query, page = 0, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const results = await jioSaavnService.searchSongs(
      query,
      parseInt(page),
      parseInt(limit)
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to search songs",
      error: error.message,
    });
  }
});

/**
 * Get song details by JioSaavn ID
 * GET /api/jiosaavn/song/:id
 */
router.get("/song/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await jioSaavnService.getSongById(id);

    if (!result.success || !result.data || result.data.length === 0) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get song",
      error: error.message,
    });
  }
});

/**
 * Get song details by JioSaavn link
 * GET /api/jiosaavn/song-by-link
 */
router.get("/song-by-link", async (req, res) => {
  try {
    const { link } = req.query;

    if (!link) {
      return res.status(400).json({ message: "JioSaavn link is required" });
    }

    const result = await jioSaavnService.getSongByLink(link);

    if (!result.success || !result.data || result.data.length === 0) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get song",
      error: error.message,
    });
  }
});

/**
 * Download and add song to database
 * POST /api/jiosaavn/download
 * Requires authentication
 */
router.post("/download", authenticateToken, async (req, res) => {
  try {
    const { songId, downloadAudio = false, downloadImage = false } = req.body;

    if (!songId) {
      return res.status(400).json({ message: "Song ID is required" });
    }

    // Get song details from JioSaavn
    const jiosaavnResult = await jioSaavnService.getSongById(songId);

    if (!jiosaavnResult.success || !jiosaavnResult.data || jiosaavnResult.data.length === 0) {
      return res.status(404).json({ message: "Song not found on JioSaavn" });
    }

    const jiosaavnSong = jiosaavnResult.data[0];
    const formattedSong = jioSaavnService.convertToLamentixFormat(jiosaavnSong);

    // Check if song already exists
    const existingSong = await Song.findOne({ jiosaavnId: songId });
    if (existingSong) {
      return res.json({
        message: "Song already exists in database",
        song: existingSong,
      });
    }

    let audioUrl = formattedSong.audioUrl;
    let coverImage = formattedSong.coverImage;

    // Download audio file if requested
    if (downloadAudio && formattedSong.audioUrl) {
      const audioFilename = `${songId}_${Date.now()}.mp3`;
      try {
        const downloadedPath = await jioSaavnService.downloadAudio(
          formattedSong.audioUrl,
          audioFilename
        );
        audioUrl = `http://localhost:${process.env.PORT || 5000}${downloadedPath}`;
      } catch (error) {
        console.error("Audio download failed, using direct URL:", error.message);
        // Continue with direct URL if download fails
      }
    }

    // Download cover image if requested
    if (downloadImage && formattedSong.coverImage) {
      const imageFilename = `${songId}_${Date.now()}.jpg`;
      try {
        const downloadedPath = await jioSaavnService.downloadImage(
          formattedSong.coverImage,
          imageFilename
        );
        coverImage = `http://localhost:${process.env.PORT || 5000}${downloadedPath}`;
      } catch (error) {
        console.error("Image download failed, using direct URL:", error.message);
        // Continue with direct URL if download fails
      }
    }

    // Create song in database
    const song = new Song({
      title: formattedSong.title,
      artist: formattedSong.artist,
      album: formattedSong.album,
      genre: formattedSong.genre,
      duration: formattedSong.duration,
      audioUrl: audioUrl,
      coverImage: coverImage,
      releaseDate: formattedSong.releaseDate,
    });

    await song.save();

    res.status(201).json({
      message: "Song downloaded and added successfully",
      song,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to download song",
      error: error.message,
    });
  }
});

/**
 * Bulk download songs from search results
 * POST /api/jiosaavn/bulk-download
 * Requires authentication
 */
router.post("/bulk-download", authenticateToken, async (req, res) => {
  try {
    const { query, limit = 10, downloadAudio = false, downloadImage = false } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search for songs
    const searchResults = await jioSaavnService.searchSongs(query, 0, parseInt(limit));

    if (!searchResults.success || !searchResults.data?.results) {
      return res.status(404).json({ message: "No songs found" });
    }

    const songs = searchResults.data.results;
    const downloadedSongs = [];
    const errors = [];

    // Process each song
    for (const jiosaavnSong of songs) {
      try {
        // Get full song details
        const songDetails = await jioSaavnService.getSongById(jiosaavnSong.id);
        
        if (!songDetails.success || !songDetails.data || songDetails.data.length === 0) {
          errors.push({ songId: jiosaavnSong.id, error: "Song details not found" });
          continue;
        }

        const fullSong = songDetails.data[0];
        const formattedSong = jioSaavnService.convertToLamentixFormat(fullSong);

        // Check if song already exists
        const existingSong = await Song.findOne({ jiosaavnId: formattedSong.jiosaavnId });
        if (existingSong) {
          downloadedSongs.push({ song: existingSong, status: "already_exists" });
          continue;
        }

        let audioUrl = formattedSong.audioUrl;
        let coverImage = formattedSong.coverImage;

        // Download files if requested
        if (downloadAudio && formattedSong.audioUrl) {
          const audioFilename = `${formattedSong.jiosaavnId}_${Date.now()}.mp3`;
          try {
            const downloadedPath = await jioSaavnService.downloadAudio(
              formattedSong.audioUrl,
              audioFilename
            );
            audioUrl = `http://localhost:${process.env.PORT || 5000}${downloadedPath}`;
          } catch (error) {
            console.error(`Audio download failed for ${formattedSong.title}:`, error.message);
          }
        }

        if (downloadImage && formattedSong.coverImage) {
          const imageFilename = `${formattedSong.jiosaavnId}_${Date.now()}.jpg`;
          try {
            const downloadedPath = await jioSaavnService.downloadImage(
              formattedSong.coverImage,
              imageFilename
            );
            coverImage = `http://localhost:${process.env.PORT || 5000}${downloadedPath}`;
          } catch (error) {
            console.error(`Image download failed for ${formattedSong.title}:`, error.message);
          }
        }

        // Create song in database
        const song = new Song({
          title: formattedSong.title,
          artist: formattedSong.artist,
          album: formattedSong.album,
          genre: formattedSong.genre,
          duration: formattedSong.duration,
          audioUrl: audioUrl,
          coverImage: coverImage,
          releaseDate: formattedSong.releaseDate,
        });

        await song.save();
        downloadedSongs.push({ song, status: "downloaded" });
      } catch (error) {
        errors.push({
          songId: jiosaavnSong.id,
          title: jiosaavnSong.title,
          error: error.message,
        });
      }
    }

    res.json({
      message: `Processed ${songs.length} songs`,
      downloaded: downloadedSongs.length,
      errors: errors.length,
      songs: downloadedSongs,
      errors: errors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to bulk download songs",
      error: error.message,
    });
  }
});

export default router;

