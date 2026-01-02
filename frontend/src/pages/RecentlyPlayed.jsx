import React, { useState, useEffect } from "react";
import axios from "axios";
import { usePlayer } from "../context/PlayerContext";
import { useAuth } from "../context/AuthContext";
import SongCard from "../components/SongCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { History, Play, Music } from "lucide-react";
import "./RecentlyPlayed.css";

const RecentlyPlayed = () => {
  const { playTrack } = usePlayer();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get("/api/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        setHistory(response.data.history || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (item) => {
    if (item.content) {
      // Convert to track format
      const trackFormat = {
        id: item.content.id,
        title: item.content.title || item.content.name,
        artist: item.content.artist || item.content.host,
        audio_url: item.content.audio_url || item.content.audioUrl,
        cover_image: item.content.cover_image || item.content.coverImage,
        duration: item.content.duration,
      };
      playTrack(trackFormat);
    }
  };

  const handleResume = (item) => {
    if (item.content && item.lastPosition > 0) {
      const trackFormat = {
        id: item.content.id,
        title: item.content.title || item.content.name,
        artist: item.content.artist || item.content.host,
        audio_url: item.content.audio_url || item.content.audioUrl,
        cover_image: item.content.cover_image || item.content.coverImage,
        duration: item.content.duration,
      };
      playTrack(trackFormat);
      // Position will be restored by PlayerContext
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <Loader fullScreen text="Loading your history..." />;
  }

  return (
    <div className="recently-played">
      <div className="recently-played-header">
        <h1>
          <History size={32} />
          Recently Played
        </h1>
        <p>Continue where you left off</p>
      </div>

      {history.length > 0 ? (
        <div className="history-list">
          {history.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-item-content">
                <SongCard
                  song={item.content}
                  showControls
                  isPodcast={item.type === "podcast"}
                />
                <div className="history-item-info">
                  <div className="history-item-meta">
                    <span className="play-count">
                      Played {item.playCount} {item.playCount === 1 ? "time" : "times"}
                    </span>
                    {item.lastPosition > 0 && (
                      <span className="last-position">
                        Last position: {formatTime(item.lastPosition)}
                      </span>
                    )}
                    <span className="last-played">
                      {new Date(item.lastPlayedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="history-item-actions">
                    {item.lastPosition > 0 && (
                      <button
                        className="resume-btn"
                        onClick={() => handleResume(item)}
                        title="Resume from last position"
                      >
                        <Play size={16} />
                        Resume
                      </button>
                    )}
                    <button
                      className="play-btn-small"
                      onClick={() => handlePlay(item)}
                      title="Play from beginning"
                    >
                      <Play size={16} />
                      Play
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Music}
          title="No listening history"
          description="Start playing some music to see your recently played tracks here"
        />
      )}
    </div>
  );
};

export default RecentlyPlayed;

