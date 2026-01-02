import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  RepeatOne
} from 'lucide-react';
import './Player.css';

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    changeVolume
  } = usePlayer();

  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [isShuffled, setIsShuffled] = useState(false);

  if (!currentTrack) {
    return null;
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    changeVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      changeVolume(0.5);
      setIsMuted(false);
    } else {
      changeVolume(0);
      setIsMuted(true);
    }
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player">
      <div className="player-content">
        {/* Track Info */}
        <div className="player-track-info">
          {(currentTrack.cover_image || currentTrack.coverImage) && (
            <img
              src={currentTrack.cover_image || currentTrack.coverImage}
              alt={currentTrack.title || currentTrack.name}
              className="player-cover"
            />
          )}
          <div className="player-track-details">
            <div className="player-track-title">{currentTrack.title || currentTrack.name}</div>
            <div className="player-track-artist">{currentTrack.artist || currentTrack.host}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="player-controls">
          <div className="player-controls-top">
            <button
              className={`control-btn ${isShuffled ? 'active' : ''}`}
              onClick={() => setIsShuffled(!isShuffled)}
              title="Shuffle"
            >
              <Shuffle size={18} />
            </button>
            <button
              className="control-btn"
              onClick={playPrevious}
              title="Previous"
            >
              <SkipBack size={22} />
            </button>
            <button
              className="control-btn play-pause-btn"
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              className="control-btn"
              onClick={playNext}
              title="Next"
            >
              <SkipForward size={22} />
            </button>
            <button
              className={`control-btn ${repeatMode !== 'off' ? 'active' : ''}`}
              onClick={() => {
                const modes = ['off', 'all', 'one'];
                const currentIndex = modes.indexOf(repeatMode);
                setRepeatMode(modes[(currentIndex + 1) % modes.length]);
              }}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <RepeatOne size={18} />
              ) : (
                <Repeat size={18} />
              )}
            </button>
          </div>
          <div className="player-progress">
            <span className="player-time">{formatTime(currentTime)}</span>
            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="progress-bar"
              />
            </div>
            <span className="player-time">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="player-volume">
          <button
            className="control-btn"
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={20} />
            ) : (
              <Volume2 size={20} />
            )}
          </button>
          <div className="volume-slider-container">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;

