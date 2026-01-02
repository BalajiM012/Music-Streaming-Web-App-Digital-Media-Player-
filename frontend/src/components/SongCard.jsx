import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, Heart } from 'lucide-react';
import './SongCard.css';

const SongCard = ({ song, showControls = false, isPodcast = false }) => {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  // Support both MongoDB (_id) and Supabase (id) formats
  const songId = song.id || song._id;
  const currentTrackId = currentTrack?.id || currentTrack?._id;
  const isCurrentTrack = currentTrackId === songId;

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playTrack(song);
    }
  };

  const handleCardClick = () => {
    if (isPodcast) {
      // Navigate to podcast detail if needed
      return;
    }
    // Could navigate to song detail page
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="song-card" onClick={handleCardClick}>
      <div className="song-card-image-container">
        {(song.cover_image || song.coverImage) ? (
          <img 
            src={song.cover_image || song.coverImage} 
            alt={song.title || song.name} 
            className="song-card-image" 
          />
        ) : (
          <div className="song-card-placeholder">
            <Play size={32} />
          </div>
        )}
        <button
          className="play-overlay"
          onClick={handlePlay}
          aria-label={isCurrentTrack && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>
      </div>
      <div className="song-card-info">
        <div className="song-card-title" title={song.title || song.name}>
          {song.title || song.name}
        </div>
        <div className="song-card-artist" title={song.artist || song.host}>
          {song.artist || song.host || 'Unknown Artist'}
        </div>
        {showControls && (
          <div className="song-card-meta">
            {song.duration && (
              <span className="song-duration">{formatDuration(song.duration)}</span>
            )}
            {song.genre && (
              <span className="song-genre">{song.genre}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongCard;

