import React, { useState } from "react";
import axios from "axios";
import { Search, Download, Music, Loader } from "lucide-react";
import "./JioSaavnDownload.css";

const JioSaavnDownload = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [message, setMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await axios.get("/api/jiosaavn/search", {
        params: { query: searchQuery, limit: 20 },
      });

      if (response.data.success && response.data.data?.results) {
        setSearchResults(response.data.data.results);
      } else {
        setMessage("No results found");
        setSearchResults([]);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to search songs"
      );
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (songId, title) => {
    setDownloading({ ...downloading, [songId]: true });
    setMessage("");

    try {
      const response = await axios.post(
        "/api/jiosaavn/download",
        {
          songId,
          downloadAudio: true,
          downloadImage: true,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage(`Successfully downloaded: ${title}`);
      // Remove from search results
      setSearchResults((prev) =>
        prev.filter((song) => song.id !== songId)
      );
    } catch (error) {
      setMessage(
        error.response?.data?.message || `Failed to download: ${title}`
      );
    } finally {
      setDownloading({ ...downloading, [songId]: false });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="jiosaavn-download">
      <div className="download-header">
        <h2>
          <Music size={24} />
          Download from JioSaavn
        </h2>
        <p>Search and download high-quality songs from JioSaavn</p>
      </div>

      <form onSubmit={handleSearch} className="search-form-download">
        <div className="search-input-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search for songs, artists, albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input-field"
          />
          <button type="submit" disabled={loading} className="search-btn">
            {loading ? <Loader size={18} className="spinner" /> : "Search"}
          </button>
        </div>
      </form>

      {message && (
        <div className={`message ${message.includes("Successfully") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results ({searchResults.length})</h3>
          <div className="songs-list">
            {searchResults.map((song) => (
              <div key={song.id} className="song-item">
                <div className="song-info">
                  {song.image && song.image.length > 0 && (
                    <img
                      src={song.image[0].url}
                      alt={song.title}
                      className="song-thumbnail"
                    />
                  )}
                  <div className="song-details">
                    <div className="song-title">{song.title}</div>
                    <div className="song-subtitle">{song.subtitle}</div>
                    {song.duration && (
                      <div className="song-duration">
                        {formatDuration(song.duration)}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="download-btn"
                  onClick={() => handleDownload(song.id, song.title)}
                  disabled={downloading[song.id]}
                >
                  {downloading[song.id] ? (
                    <>
                      <Loader size={16} className="spinner" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && searchResults.length === 0 && searchQuery && (
        <div className="no-results">
          <p>No songs found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
};

export default JioSaavnDownload;

