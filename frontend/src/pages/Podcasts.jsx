import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { Headphones, Play } from "lucide-react";
import "./Podcasts.css";

const Podcasts = () => {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPodcasts();
  }, [selectedCategory, page]);

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

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 20,
        page: page,
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const response = await axios.get("/api/podcasts", { params });

      if (response.data.success) {
        setPodcasts(response.data.podcasts || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching podcasts:", error);
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setPage(1);
  };

  const handlePodcastClick = (podcastId) => {
    navigate(`/podcast/${podcastId}`);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="podcasts-page">
      <div className="podcasts-header">
        <h1>
          <Headphones size={32} />
          Podcasts
        </h1>
        <p>Discover and listen to your favorite podcasts</p>
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="podcasts-filters">
          <div className="filter-label">Filter by Category</div>
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
      )}

      {/* Podcasts List */}
      {loading ? (
        <Loader fullScreen text="Loading podcasts..." />
      ) : podcasts.length > 0 ? (
        <>
          <div className="podcasts-grid">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id || podcast._id}
                className="podcast-card"
                onClick={() => handlePodcastClick(podcast.id || podcast._id)}
              >
                <div className="podcast-card-image-container">
                  {podcast.cover_image || podcast.coverImage ? (
                    <img
                      src={podcast.cover_image || podcast.coverImage}
                      alt={podcast.title || podcast.name}
                      className="podcast-card-image"
                    />
                  ) : (
                    <div className="podcast-card-placeholder">
                      <Headphones size={48} />
                    </div>
                  )}
                  <div className="podcast-play-overlay">
                    <Play size={32} fill="currentColor" />
                  </div>
                </div>
                <div className="podcast-card-info">
                  <div className="podcast-card-title" title={podcast.title || podcast.name}>
                    {podcast.title || podcast.name}
                  </div>
                  <div className="podcast-card-host" title={podcast.host}>
                    {podcast.host || "Unknown Host"}
                  </div>
                  {podcast.description && (
                    <div className="podcast-card-description">
                      {podcast.description.length > 100
                        ? `${podcast.description.substring(0, 100)}...`
                        : podcast.description}
                    </div>
                  )}
                  <div className="podcast-card-meta">
                    {podcast.duration && (
                      <span className="podcast-duration">
                        {formatDuration(podcast.duration)}
                      </span>
                    )}
                    {podcast.category && (
                      <span className="podcast-category">{podcast.category}</span>
                    )}
                  </div>
                </div>
              </div>
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
          icon={Headphones}
          title="No podcasts found"
          description={
            selectedCategory
              ? "Try adjusting your filters to see more podcasts"
              : "No podcasts available yet. Add some podcasts to get started!"
          }
        />
      )}
    </div>
  );
};

export default Podcasts;

