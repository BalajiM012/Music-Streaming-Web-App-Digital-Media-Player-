import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { Headphones, Play, ArrowLeft } from "lucide-react";
import "./PodcastDetail.css";

const PodcastDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [podcast, setPodcast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPodcast();
  }, [id]);

  const fetchPodcast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/podcasts/${id}`);
      if (response.data.success) {
        setPodcast(response.data.podcast);
      } else {
        setError("Podcast not found");
      }
    } catch (error) {
      console.error("Error fetching podcast:", error);
      setError("Failed to load podcast");
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (podcast) {
      // Convert podcast to track format for player
      const trackFormat = {
        id: podcast.id,
        title: podcast.title || podcast.name,
        artist: podcast.host,
        audio_url: podcast.audio_url || podcast.audioUrl,
        cover_image: podcast.cover_image || podcast.coverImage,
        duration: podcast.duration,
      };
      playTrack(trackFormat);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <Loader fullScreen text="Loading podcast..." />;
  }

  if (error || !podcast) {
    return (
      <EmptyState
        icon={Headphones}
        title={error || "Podcast not found"}
        description="The podcast you're looking for doesn't exist or has been removed"
        action={() => navigate("/podcasts")}
        actionLabel="Back to Podcasts"
      />
    );
  }

  return (
    <div className="podcast-detail">
      <button className="back-button" onClick={() => navigate("/podcasts")}>
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="podcast-detail-header">
        <div className="podcast-detail-cover">
          {podcast.cover_image || podcast.coverImage ? (
            <img
              src={podcast.cover_image || podcast.coverImage}
              alt={podcast.title || podcast.name}
              className="podcast-cover-large"
            />
          ) : (
            <div className="podcast-cover-placeholder">
              <Headphones size={64} />
            </div>
          )}
        </div>

        <div className="podcast-detail-info">
          <div className="podcast-type">Podcast</div>
          <h1>{podcast.title || podcast.name}</h1>
          <div className="podcast-host">
            <span>Hosted by</span>
            <strong>{podcast.host || "Unknown Host"}</strong>
          </div>
          {podcast.description && (
            <p className="podcast-description">{podcast.description}</p>
          )}
          <div className="podcast-meta">
            {podcast.duration && (
              <span className="meta-item">
                <strong>Duration:</strong> {formatDuration(podcast.duration)}
              </span>
            )}
            {podcast.category && (
              <span className="meta-item">
                <strong>Category:</strong> {podcast.category}
              </span>
            )}
            {podcast.play_count !== undefined && (
              <span className="meta-item">
                <strong>Plays:</strong> {podcast.play_count || 0}
              </span>
            )}
          </div>
          <div className="podcast-actions">
            <button className="play-podcast-btn" onClick={handlePlay}>
              <Play size={24} fill="currentColor" />
              <span>Play Episode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Episode Info Section */}
      <div className="podcast-episode-section">
        <h2>Episode Details</h2>
        <div className="episode-info-card">
          <div className="episode-info-row">
            <span className="episode-label">Title</span>
            <span className="episode-value">{podcast.title || podcast.name}</span>
          </div>
          {podcast.host && (
            <div className="episode-info-row">
              <span className="episode-label">Host</span>
              <span className="episode-value">{podcast.host}</span>
            </div>
          )}
          {podcast.duration && (
            <div className="episode-info-row">
              <span className="episode-label">Duration</span>
              <span className="episode-value">{formatDuration(podcast.duration)}</span>
            </div>
          )}
          {podcast.category && (
            <div className="episode-info-row">
              <span className="episode-label">Category</span>
              <span className="episode-value">{podcast.category}</span>
            </div>
          )}
          {podcast.release_date && (
            <div className="episode-info-row">
              <span className="episode-label">Release Date</span>
              <span className="episode-value">
                {new Date(podcast.release_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastDetail;

