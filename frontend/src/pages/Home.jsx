import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { Music, Headphones } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [popularSongs, setPopularSongs] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [popularRes, recentRes, playlistsRes] = await Promise.all([
        axios.get('/api/tracks/popular/top?limit=10'),
        axios.get('/api/tracks?limit=20'),
        axios.get('/api/playlists?limit=6')
      ]);

      setPopularSongs(popularRes.data.success ? popularRes.data.tracks : []);
      setRecentSongs(recentRes.data.success ? recentRes.data.tracks : []);
      setPlaylists(playlistsRes.data.success ? playlistsRes.data.playlists : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading your music..." />;
  }

  return (
    <div className="home">
      <div className="home-header">
        <h1>Good evening</h1>
        <p>Discover music and podcasts</p>
      </div>

      <section className="home-section">
        <h2 className="section-title">Popular Songs</h2>
        {popularSongs.length > 0 ? (
          <div className="songs-grid">
            {popularSongs.map((song) => (
              <SongCard key={song.id || song._id} song={song} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Music}
            title="No popular songs yet"
            description="Popular songs will appear here based on play counts"
          />
        )}
      </section>

      <section className="home-section">
        <h2 className="section-title">Recently Added</h2>
        {recentSongs.length > 0 ? (
          <div className="songs-grid">
            {recentSongs.map((song) => (
              <SongCard key={song.id || song._id} song={song} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Music}
            title="No tracks yet"
            description="Recently added tracks will appear here"
          />
        )}
      </section>

      <section className="home-section">
        <h2 className="section-title">Featured Playlists</h2>
        {playlists.length > 0 ? (
          <div className="playlists-grid">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id || playlist._id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Headphones}
            title="No playlists yet"
            description="Create your first playlist to get started"
          />
        )}
      </section>
    </div>
  );
};

export default Home;

