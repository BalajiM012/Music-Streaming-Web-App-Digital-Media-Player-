import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { usePlayer } from '../context/PlayerContext';
import { useDebounce } from '../hooks/useDebounce';
import SongCard from '../components/SongCard';
import PlaylistCard from '../components/PlaylistCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { Search as SearchIcon, Music, Headphones } from 'lucide-react';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [songs, setSongs] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  
  // Debounce search query
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch();
    } else {
      setSongs([]);
      setPodcasts([]);
      setPlaylists([]);
      setArtists([]);
      fetchGenres();
    }
  }, [debouncedQuery, type]);

  const fetchGenres = async () => {
    try {
      const response = await axios.get('/api/tracks?limit=100');
      const tracks = response.data.success ? response.data.tracks : [];
      const uniqueGenres = [...new Set(tracks.map(song => song.genre))];
      setGenres(uniqueGenres.filter(Boolean));
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search', {
        params: {
          q: debouncedQuery,
          type: type,
          limit: 20
        }
      });

      if (response.data.success) {
        setSongs(response.data.tracks || []);
        setPodcasts(response.data.podcasts || []);
        setPlaylists(response.data.playlists || []);
        setArtists(response.data.artists || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSongs([]);
      setPodcasts([]);
      setPlaylists([]);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query, type });
  };

  const handleGenreClick = (genre) => {
    setQuery(genre);
    setType('songs');
    setSearchParams({ q: genre, type: 'songs' });
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <div className="search-filters">
            <button
              type="button"
              className={`filter-btn ${type === 'all' ? 'active' : ''}`}
              onClick={() => setType('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-btn ${type === 'songs' ? 'active' : ''}`}
              onClick={() => setType('songs')}
            >
              Songs
            </button>
            <button
              type="button"
              className={`filter-btn ${type === 'podcasts' ? 'active' : ''}`}
              onClick={() => setType('podcasts')}
            >
              Podcasts
            </button>
            <button
              type="button"
              className={`filter-btn ${type === 'playlists' ? 'active' : ''}`}
              onClick={() => setType('playlists')}
            >
              Playlists
            </button>
          </div>
        </form>
      </div>

      {!query && (
        <div className="browse-section">
          <h2>Browse by Genre</h2>
          <div className="genres-grid">
            {genres.map((genre) => (
              <button
                key={genre}
                className="genre-card"
                onClick={() => handleGenreClick(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <Loader text="Searching..." />}

      {debouncedQuery && !loading && (
        <div className="search-results">
          {(type === 'all' || type === 'songs' || type === 'tracks') && songs.length > 0 && (
            <section className="results-section">
              <h2>
                <Music size={20} />
                Songs ({songs.length})
              </h2>
              <div className="songs-grid">
                {songs.map((song) => (
                  <SongCard key={song.id || song._id} song={song} />
                ))}
              </div>
            </section>
          )}

          {(type === 'all' || type === 'podcasts') && podcasts.length > 0 && (
            <section className="results-section">
              <h2>
                <Headphones size={20} />
                Podcasts ({podcasts.length})
              </h2>
              <div className="songs-grid">
                {podcasts.map((podcast) => (
                  <SongCard key={podcast.id || podcast._id} song={podcast} isPodcast />
                ))}
              </div>
            </section>
          )}

          {(type === 'all' || type === 'playlists') && playlists.length > 0 && (
            <section className="results-section">
              <h2>Playlists ({playlists.length})</h2>
              <div className="playlists-grid">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id || playlist._id} playlist={playlist} />
                ))}
              </div>
            </section>
          )}

          {(type === 'all' || type === 'artists') && artists.length > 0 && (
            <section className="results-section">
              <h2>Artists ({artists.length})</h2>
              <div className="artists-grid">
                {artists.map((artist, index) => (
                  <div key={index} className="artist-card">
                    <div className="artist-name">{artist.name}</div>
                    <div className="artist-track-count">{artist.trackCount} tracks</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {songs.length === 0 && podcasts.length === 0 && playlists.length === 0 && artists.length === 0 && debouncedQuery && (
            <EmptyState
              icon={SearchIcon}
              title={`No results for "${debouncedQuery}"`}
              description="Try a different search term or check your spelling"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Search;

