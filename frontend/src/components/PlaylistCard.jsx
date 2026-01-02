import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { Play, Music } from 'lucide-react';
import './PlaylistCard.css';

const PlaylistCard = ({ playlist }) => {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const handleCardClick = () => {
    navigate(`/playlist/${playlist.id || playlist._id}`);
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playTrack(playlist.songs[0], playlist.songs);
    }
  };

  const getCoverImage = () => {
    if (playlist.cover_image || playlist.coverImage) {
      return playlist.cover_image || playlist.coverImage;
    }
    if (playlist.songs && playlist.songs.length > 0) {
      const firstSong = playlist.songs[0];
      return firstSong.cover_image || firstSong.coverImage || null;
    }
    return null;
  };

  return (
    <div className="playlist-card" onClick={handleCardClick}>
      <div className="playlist-card-image-container">
        {getCoverImage() ? (
          <img src={getCoverImage()} alt={playlist.name} className="playlist-card-image" />
        ) : (
          <div className="playlist-card-placeholder">
            <Music size={48} />
          </div>
        )}
        <button
          className="play-overlay"
          onClick={handlePlay}
          disabled={!playlist.songs || playlist.songs.length === 0}
          aria-label="Play playlist"
        >
          <Play size={24} fill="currentColor" />
        </button>
      </div>
      <div className="playlist-card-info">
        <div className="playlist-card-title" title={playlist.name}>
          {playlist.name}
        </div>
        {playlist.description && (
          <div className="playlist-card-description" title={playlist.description}>
            {playlist.description}
          </div>
        )}
        <div className="playlist-card-meta">
          {playlist.owner && (
            <span className="playlist-owner">{(playlist.owner.username) || 'Unknown'}</span>
          )}
          {playlist.songs && (
            <span className="playlist-song-count">
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard;

