import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { Plus, Trash2, Play, Music } from 'lucide-react';
import SongCard from '../components/SongCard';
import './PlaylistDetail.css';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const response = await axios.get(`/api/playlists/${id}`);
      if (response.data.success) {
        setPlaylist(response.data.playlist);
      } else {
        navigate('/library');
      }
    } catch (error) {
      console.error('Error fetching playlist:', error);
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = async (query = '') => {
    try {
      const response = await axios.get(`/api/tracks?search=${query}&limit=50`);
      if (response.data.success) {
        setAvailableSongs(response.data.tracks || []);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playTrack(playlist.songs[0], playlist.songs);
    }
  };

  const handleAddSong = async (songId) => {
    try {
      const response = await axios.post(`/api/playlists/${id}/songs`, { songId });
      if (response.data.success) {
        setPlaylist(response.data.playlist);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding song:', error);
      alert('Failed to add song to playlist');
    }
  };

  const handleRemoveSong = async (songId) => {
    try {
      const response = await axios.delete(`/api/playlists/${id}/songs/${songId}`);
      if (response.data.success) {
        setPlaylist(response.data.playlist);
      }
    } catch (error) {
      console.error('Error removing song:', error);
      alert('Failed to remove song from playlist');
    }
  };

  // Support both MongoDB and Supabase formats
  const isOwner = user && playlist && (
    (playlist.owner_id && playlist.owner_id === user.id) ||
    (playlist.owner && (playlist.owner.id === user.id || playlist.owner._id === user.id))
  );

  if (loading) {
    return <Loader fullScreen text="Loading playlist..." />;
  }

  if (!playlist) {
    return (
      <EmptyState
        icon={Music}
        title="Playlist not found"
        description="The playlist you're looking for doesn't exist or has been removed"
        action={() => navigate("/library")}
        actionLabel="Back to Library"
      />
    );
  }

  return (
    <div className="playlist-detail">
      <div className="playlist-header">
        {(playlist.cover_image || playlist.coverImage) && (
          <img
            src={playlist.cover_image || playlist.coverImage}
            alt={playlist.name}
            className="playlist-cover-large"
          />
        )}
        <div className="playlist-info">
          <div className="playlist-type">Playlist</div>
          <h1>{playlist.name}</h1>
          {playlist.description && <p className="playlist-description">{playlist.description}</p>}
          <div className="playlist-meta">
            <span>{(playlist.owner && playlist.owner.username) || 'Unknown'}</span>
            <span>•</span>
            <span>{playlist.songs?.length || 0} songs</span>
          </div>
          <div className="playlist-actions">
            <button className="play-btn" onClick={handlePlayAll} disabled={!playlist.songs || playlist.songs.length === 0}>
              <Play size={24} fill="currentColor" />
              <span>Play</span>
            </button>
            {isOwner && (
              <button
                className="add-song-btn"
                onClick={() => {
                  setShowAddModal(true);
                  fetchSongs();
                }}
              >
                <Plus size={20} />
                <span>Add Songs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Songs to Playlist</h2>
            <input
              type="text"
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchSongs(e.target.value);
              }}
              className="search-input"
            />
            <div className="songs-list-modal">
              {availableSongs
                .filter(song => !playlist.songs?.some(s => (s.id || s._id) === (song.id || song._id)))
                .map((song) => (
                  <div key={song.id || song._id} className="song-item-modal">
                    <div className="song-info-modal">
                      {(song.cover_image || song.coverImage) && (
                        <img 
                          src={song.cover_image || song.coverImage} 
                          alt={song.title || song.name} 
                          className="song-cover-small" 
                        />
                      )}
                      <div>
                        <div className="song-title-modal">{song.title || song.name}</div>
                        <div className="song-artist-modal">{song.artist || 'Unknown Artist'}</div>
                      </div>
                    </div>
                    <button
                      className="add-btn-small"
                      onClick={() => handleAddSong(song.id || song._id)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
            </div>
            <button className="close-modal-btn" onClick={() => setShowAddModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="playlist-songs">
        {playlist.songs && playlist.songs.length > 0 ? (
          <div className="songs-list">
            {playlist.songs?.map((song, index) => (
              <div key={song.id || song._id} className="playlist-song-item">
                <div className="song-number">{index + 1}</div>
                <SongCard song={song} showControls />
                {isOwner && (
                  <button
                    className="remove-song-btn"
                    onClick={() => handleRemoveSong(song.id || song._id)}
                    title="Remove from playlist"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Music}
            title="This playlist is empty"
            description={isOwner ? "Add your favorite songs to get started" : "This playlist doesn't have any songs yet"}
            action={isOwner ? () => {
              setShowAddModal(true);
              fetchSongs();
            } : null}
            actionLabel={isOwner ? "Add Songs" : null}
          />
        )}
      </div>
    </div>
  );
};

export default PlaylistDetail;

