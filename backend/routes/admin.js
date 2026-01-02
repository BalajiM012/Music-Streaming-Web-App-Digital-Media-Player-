import express from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";
import { authenticateToken } from "../middleware/auth.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/temp");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

/**
 * Middleware to check if user is admin
 */
const isAdmin = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.is_admin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking admin status",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/upload/track
 * Upload track with audio file and metadata (admin only)
 */
router.post(
  "/upload/track",
  authenticateToken,
  isAdmin,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, artist, album, genre, category_id, duration } = req.body;

      if (!title || !artist || !duration) {
        return res.status(400).json({
          success: false,
          message: "Title, artist, and duration are required",
        });
      }

      let audioUrl = "";
      let coverImage = "";

      // Upload audio file to Supabase Storage
      if (req.files.audio && req.files.audio[0]) {
        const audioFile = req.files.audio[0];
        const audioFileName = `tracks/${Date.now()}-${audioFile.originalname}`;

        const audioBuffer = fs.readFileSync(audioFile.path);
        const { data: audioUpload, error: audioError } = await supabaseAdmin.storage
          .from("audio")
          .upload(audioFileName, audioBuffer, {
            contentType: audioFile.mimetype,
            upsert: false,
          });

        if (audioError) {
          throw audioError;
        }

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("audio").getPublicUrl(audioFileName);
        audioUrl = publicUrl;

        // Clean up temp file
        fs.unlinkSync(audioFile.path);
      }

      // Upload cover image to Supabase Storage
      if (req.files.cover && req.files.cover[0]) {
        const coverFile = req.files.cover[0];
        const coverFileName = `covers/${Date.now()}-${coverFile.originalname}`;

        const coverBuffer = fs.readFileSync(coverFile.path);
        const { data: coverUpload, error: coverError } = await supabaseAdmin.storage
          .from("images")
          .upload(coverFileName, coverBuffer, {
            contentType: coverFile.mimetype,
            upsert: false,
          });

        if (coverError) {
          throw coverError;
        }

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("images").getPublicUrl(coverFileName);
        coverImage = publicUrl;

        // Clean up temp file
        fs.unlinkSync(coverFile.path);
      }

      // Create track in database
      const { data: track, error: trackError } = await supabase
        .from("tracks")
        .insert({
          title,
          artist,
          album: album || "Unknown Album",
          genre: genre || "Unknown",
          category_id: category_id || null,
          duration: parseInt(duration),
          audio_url: audioUrl,
          cover_image: coverImage,
        })
        .select()
        .single();

      if (trackError) {
        throw trackError;
      }

      res.status(201).json({
        success: true,
        track: track,
      });
    } catch (error) {
      console.error("Error uploading track:", error);

      // Clean up uploaded files on error
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload track",
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/admin/upload/podcast
 * Upload podcast with audio file and metadata (admin only)
 */
router.post(
  "/upload/podcast",
  authenticateToken,
  isAdmin,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, host, description, category, category_id, duration } = req.body;

      if (!title || !host || !duration) {
        return res.status(400).json({
          success: false,
          message: "Title, host, and duration are required",
        });
      }

      let audioUrl = "";
      let coverImage = "";

      // Upload audio file
      if (req.files.audio && req.files.audio[0]) {
        const audioFile = req.files.audio[0];
        const audioFileName = `podcasts/${Date.now()}-${audioFile.originalname}`;

        const audioBuffer = fs.readFileSync(audioFile.path);
        const { data: audioUpload, error: audioError } = await supabaseAdmin.storage
          .from("audio")
          .upload(audioFileName, audioBuffer, {
            contentType: audioFile.mimetype,
            upsert: false,
          });

        if (audioError) {
          throw audioError;
        }

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("audio").getPublicUrl(audioFileName);
        audioUrl = publicUrl;

        fs.unlinkSync(audioFile.path);
      }

      // Upload cover image
      if (req.files.cover && req.files.cover[0]) {
        const coverFile = req.files.cover[0];
        const coverFileName = `covers/${Date.now()}-${coverFile.originalname}`;

        const coverBuffer = fs.readFileSync(coverFile.path);
        const { data: coverUpload, error: coverError } = await supabaseAdmin.storage
          .from("images")
          .upload(coverFileName, coverBuffer, {
            contentType: coverFile.mimetype,
            upsert: false,
          });

        if (coverError) {
          throw coverError;
        }

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("images").getPublicUrl(coverFileName);
        coverImage = publicUrl;

        fs.unlinkSync(coverFile.path);
      }

      // Create podcast in database
      const { data: podcast, error: podcastError } = await supabase
        .from("podcasts")
        .insert({
          title,
          host,
          description: description || "",
          category: category || "General",
          category_id: category_id || null,
          duration: parseInt(duration),
          audio_url: audioUrl,
          cover_image: coverImage,
        })
        .select()
        .single();

      if (podcastError) {
        throw podcastError;
      }

      res.status(201).json({
        success: true,
        podcast: podcast,
      });
    } catch (error) {
      console.error("Error uploading podcast:", error);

      // Clean up uploaded files on error
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload podcast",
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/admin/stats
 * Get admin statistics (admin only)
 */
router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [tracksCount, podcastsCount, usersCount, playlistsCount] = await Promise.all([
      supabase.from("tracks").select("id", { count: "exact", head: true }),
      supabase.from("podcasts").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("playlists").select("id", { count: "exact", head: true }),
    ]);

    res.json({
      success: true,
      stats: {
        tracks: tracksCount.count || 0,
        podcasts: podcastsCount.count || 0,
        users: usersCount.count || 0,
        playlists: playlistsCount.count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
});

export default router;

