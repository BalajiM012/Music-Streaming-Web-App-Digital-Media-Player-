import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { Plus, Music, Download } from 'lucide-react';
import PlaylistCard from '../components/PlaylistCard';
import SongCard from '../components/SongCard';
import JioSaavnDownload from '../components/JioSaavnDownload';
import './Library.css';

const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activeTab, setActiveTab] = useState('library'); // 'library' or 'download'

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const [playlistsRes, userRes] = await Promise.all([
        axios.get('/api/playlists/my-playlists'),
        axios.get('/api/auth/me')
      ]);

      setPlaylists(playlistsRes.data.success ? playlistsRes.data.playlists : []);
      setFavoriteSongs(userRes.data.favoriteSongs || userRes.data.favorite_songs || []);
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const response = await axios.post('/api/playlists', {
        name: newPlaylistName,
        description: ''
      });
      if (response.data.success) {
        setPlaylists([...playlists, response.data.playlist]);
      }
      setNewPlaylistName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading your library..." />;
  }

  return (
    <div className="library">
      <div className="library-header">
        <h1>Your Library</h1>
        <div className="library-actions">
          <div className="library-tabs">
            <button
              className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
              onClick={() => setActiveTab('library')}
            >
              <Music size={18} />
              <span>Library</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'download' ? 'active' : ''}`}
              onClick={() => setActiveTab('download')}
            >
              <Download size={18} />
              <span>Download</span>
            </button>
          </div>
          {activeTab === 'library' && (
            <button
              className="create-playlist-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={20} />
              <span>Create Playlist</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'download' && (
        <JioSaavnDownload />
      )}

      {activeTab === 'library' && (
        <>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Playlist</h2>
            <form onSubmit={createPlaylist}>
              <input
                type="text"
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {favoriteSongs.length > 0 && (
        <section className="library-section">
          <div className="section-header">
            <h2>
              <Music size={24} />
              Favorite Songs
            </h2>
          </div>
          <div className="songs-grid">
            {favoriteSongs.map((song) => (
              <SongCard key={song._id} song={song} />
            ))}
          </div>
        </section>
      )}

      {playlists.length > 0 && (
        <section className="library-section">
          <div className="section-header">
            <h2>Your Playlists</h2>
          </div>
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist._id} playlist={playlist} />
            ))}
          </div>
        </section>
      )}

      {playlists.length === 0 && favoriteSongs.length === 0 && (
        <EmptyState
          icon={Music}
          title="Your library is empty"
          description="Start adding songs and creating playlists to see them here"
          action={() => setShowCreateModal(true)}
          actionLabel="Create Playlist"
        />
      )}
        </>
      )}
    </div>
  );
};

export default Library;

