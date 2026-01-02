import express from 'express';
import Song from '../models/Song.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all songs
router.get('/', async (req, res) => {
  try {
    const { search, genre, limit = 50, page = 1 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } },
        { album: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      query.genre = genre;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const songs = await Song.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Song.countDocuments(query);

    res.json({
      songs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get song by ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Increment play count
    song.playCount += 1;
    await song.save();

    res.json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create song (admin only - for demo purposes, remove auth in production)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, artist, album, genre, duration, audioUrl, coverImage } = req.body;

    if (!title || !artist || !duration || !audioUrl) {
      return res.status(400).json({ message: 'Title, artist, duration, and audioUrl are required' });
    }

    const song = new Song({
      title,
      artist,
      album: album || 'Unknown Album',
      genre: genre || 'Unknown',
      duration,
      audioUrl,
      coverImage: coverImage || ''
    });

    await song.save();
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get popular songs
router.get('/popular/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const songs = await Song.find()
      .sort({ playCount: -1, likes: -1 })
      .limit(limit);

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get songs by genre
router.get('/genre/:genre', async (req, res) => {
  try {
    const songs = await Song.find({ genre: req.params.genre })
      .sort({ createdAt: -1 });

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

