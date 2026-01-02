import express from 'express';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('playlists')
      .populate('favoriteSongs');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add song to favorites
router.post('/favorites', authenticateToken, async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: 'Song ID is required' });
    }

    const user = await User.findById(req.user.userId);

    if (!user.favoriteSongs.includes(songId)) {
      user.favoriteSongs.push(songId);
      await user.save();
    }

    const updatedUser = await User.findById(req.user.userId)
      .select('-password')
      .populate('favoriteSongs');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove song from favorites
router.delete('/favorites/:songId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    user.favoriteSongs = user.favoriteSongs.filter(
      songId => songId.toString() !== req.params.songId
    );

    await user.save();

    const updatedUser = await User.findById(req.user.userId)
      .select('-password')
      .populate('favoriteSongs');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

