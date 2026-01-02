import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";
import SongCard from "../components/SongCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { Music, Filter } from "lucide-react";
import "./Music.css";

const Music = () => {
  const [tracks, setTracks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetchCategories();
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [selectedCategory, selectedGenre, page]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axios.get("/api/tracks?limit=1000");
      if (response.data.success) {
        const uniqueGenres = [
          ...new Set(
            (response.data.tracks || []).map((track) => track.genre).filter(Boolean)
          ),
        ];
        setGenres(uniqueGenres);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchTracks = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 20,
        page: page,
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedGenre) {
        params.genre = selectedGenre;
      }

      const response = await axios.get("/api/tracks", { params });

      if (response.data.success) {
        setTracks(response.data.tracks || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching tracks:", error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setSelectedGenre(null);
    setPage(1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre === selectedGenre ? null : genre);
    setSelectedCategory(null);
    setPage(1);
  };

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedGenre(null);
    setPage(1);
  };

  return (
    <div className="music-page">
      <div className="music-header">
        <div className="music-header-top">
          <h1>
            <Music size={32} />
            Browse Music
          </h1>
          {tracks.length > 0 && (
            <button className="play-all-btn" onClick={handlePlayAll}>
              <Music size={20} />
              <span>Play All</span>
            </button>
          )}
        </div>
        <p>Discover and play your favorite tracks</p>
      </div>

      {/* Filters */}
      <div className="music-filters">
        <div className="filter-section">
          <div className="filter-label">
            <Filter size={18} />
            <span>Categories</span>
          </div>
          <div className="filter-options">
            <button
              className={`filter-chip ${selectedCategory === null ? "active" : ""}`}
              onClick={() => handleCategoryChange(null)}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`filter-chip ${
                  selectedCategory === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-label">
            <Filter size={18} />
            <span>Genres</span>
          </div>
          <div className="filter-options">
            <button
              className={`filter-chip ${selectedGenre === null ? "active" : ""}`}
              onClick={() => handleGenreChange(null)}
            >
              All
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                className={`filter-chip ${selectedGenre === genre ? "active" : ""}`}
                onClick={() => handleGenreChange(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {(selectedCategory || selectedGenre) && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      {/* Tracks List */}
      {loading ? (
        <Loader fullScreen text="Loading tracks..." />
      ) : tracks.length > 0 ? (
        <>
          <div className="tracks-grid">
            {tracks.map((track) => (
              <SongCard key={track.id || track._id} song={track} showControls />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Music}
          title="No tracks found"
          description={
            selectedCategory || selectedGenre
              ? "Try adjusting your filters to see more tracks"
              : "No tracks available yet. Add some tracks to get started!"
          }
          action={selectedCategory || selectedGenre ? clearFilters : null}
          actionLabel={selectedCategory || selectedGenre ? "Clear Filters" : null}
        />
      )}
    </div>
  );
};

export default Music;

