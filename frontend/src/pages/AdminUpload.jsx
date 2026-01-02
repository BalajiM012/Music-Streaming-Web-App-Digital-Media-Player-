import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Upload, Music, Headphones, FileAudio, Image, Loader } from "lucide-react";
import LoaderComponent from "../components/Loader";
import EmptyState from "../components/EmptyState";
import "./AdminUpload.css";

const AdminUpload = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [uploadType, setUploadType] = useState("track"); // 'track' or 'podcast'
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");

  // Track form state
  const [trackForm, setTrackForm] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    category_id: "",
    duration: "",
    audioFile: null,
    coverFile: null,
  });

  // Podcast form state
  const [podcastForm, setPodcastForm] = useState({
    title: "",
    host: "",
    description: "",
    category: "",
    category_id: "",
    duration: "",
    audioFile: null,
    coverFile: null,
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    checkAdminStatus();
    fetchCategories();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setIsAdmin(response.data.is_admin || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setChecking(false);
    }
  };

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

  const handleFileChange = (e, field, type) => {
    const file = e.target.files[0];
    if (type === "track") {
      setTrackForm({ ...trackForm, [field]: file });
    } else {
      setPodcastForm({ ...podcastForm, [field]: file });
    }
  };

  const handleInputChange = (e, field, type) => {
    const value = e.target.value;
    if (type === "track") {
      setTrackForm({ ...trackForm, [field]: value });
    } else {
      setPodcastForm({ ...podcastForm, [field]: value });
    }
  };

  const handleTrackUpload = async (e) => {
    e.preventDefault();
    if (!trackForm.title || !trackForm.artist || !trackForm.duration || !trackForm.audioFile) {
      setMessage("Please fill all required fields");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", trackForm.title);
      formData.append("artist", trackForm.artist);
      formData.append("album", trackForm.album || "");
      formData.append("genre", trackForm.genre || "");
      formData.append("category_id", trackForm.category_id || "");
      formData.append("duration", trackForm.duration);
      formData.append("audio", trackForm.audioFile);
      if (trackForm.coverFile) {
        formData.append("cover", trackForm.coverFile);
      }

      const response = await axios.post("/api/admin/upload/track", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        setMessage("Track uploaded successfully!");
        setTrackForm({
          title: "",
          artist: "",
          album: "",
          genre: "",
          category_id: "",
          duration: "",
          audioFile: null,
          coverFile: null,
        });
        setUploadProgress(0);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to upload track"
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePodcastUpload = async (e) => {
    e.preventDefault();
    if (!podcastForm.title || !podcastForm.host || !podcastForm.duration || !podcastForm.audioFile) {
      setMessage("Please fill all required fields");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", podcastForm.title);
      formData.append("host", podcastForm.host);
      formData.append("description", podcastForm.description || "");
      formData.append("category", podcastForm.category || "");
      formData.append("category_id", podcastForm.category_id || "");
      formData.append("duration", podcastForm.duration);
      formData.append("audio", podcastForm.audioFile);
      if (podcastForm.coverFile) {
        formData.append("cover", podcastForm.coverFile);
      }

      const response = await axios.post("/api/admin/upload/podcast", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        setMessage("Podcast uploaded successfully!");
        setPodcastForm({
          title: "",
          host: "",
          description: "",
          category: "",
          category_id: "",
          duration: "",
          audioFile: null,
          coverFile: null,
        });
        setUploadProgress(0);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to upload podcast"
      );
    } finally {
      setUploading(false);
    }
  };

  if (checking) {
    return <LoaderComponent fullScreen text="Checking permissions..." />;
  }

  if (!isAdmin) {
    return (
      <EmptyState
        icon={Upload}
        title="Admin Access Required"
        description="You need admin privileges to access this page"
      />
    );
  }

  return (
    <div className="admin-upload">
      <div className="admin-upload-header">
        <h1>
          <Upload size={32} />
          Admin Upload Panel
        </h1>
        <p>Upload tracks and podcasts to the platform</p>
      </div>

      <div className="upload-type-selector">
        <button
          className={`type-btn ${uploadType === "track" ? "active" : ""}`}
          onClick={() => setUploadType("track")}
        >
          <Music size={20} />
          Upload Track
        </button>
        <button
          className={`type-btn ${uploadType === "podcast" ? "active" : ""}`}
          onClick={() => setUploadType("podcast")}
        >
          <Headphones size={20} />
          Upload Podcast
        </button>
      </div>

      {message && (
        <div className={`upload-message ${message.includes("success") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span>{uploadProgress}%</span>
        </div>
      )}

      {uploadType === "track" ? (
        <form className="upload-form" onSubmit={handleTrackUpload}>
          <div className="form-row">
            <div className="form-group">
              <label>
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                value={trackForm.title}
                onChange={(e) => handleInputChange(e, "title", "track")}
                required
                placeholder="Song title"
              />
            </div>
            <div className="form-group">
              <label>
                Artist <span className="required">*</span>
              </label>
              <input
                type="text"
                value={trackForm.artist}
                onChange={(e) => handleInputChange(e, "artist", "track")}
                required
                placeholder="Artist name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Album</label>
              <input
                type="text"
                value={trackForm.album}
                onChange={(e) => handleInputChange(e, "album", "track")}
                placeholder="Album name"
              />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input
                type="text"
                value={trackForm.genre}
                onChange={(e) => handleInputChange(e, "genre", "track")}
                placeholder="Genre"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={trackForm.category_id}
                onChange={(e) => handleInputChange(e, "category_id", "track")}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                Duration (seconds) <span className="required">*</span>
              </label>
              <input
                type="number"
                value={trackForm.duration}
                onChange={(e) => handleInputChange(e, "duration", "track")}
                required
                placeholder="180"
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group file-upload">
              <label>
                <FileAudio size={20} />
                Audio File <span className="required">*</span>
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, "audioFile", "track")}
                required
              />
              {trackForm.audioFile && (
                <span className="file-name">{trackForm.audioFile.name}</span>
              )}
            </div>
            <div className="form-group file-upload">
              <label>
                <Image size={20} />
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "coverFile", "track")}
              />
              {trackForm.coverFile && (
                <span className="file-name">{trackForm.coverFile.name}</span>
              )}
            </div>
          </div>

          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? (
              <>
                <Loader size={18} className="spinner" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Track
              </>
            )}
          </button>
        </form>
      ) : (
        <form className="upload-form" onSubmit={handlePodcastUpload}>
          <div className="form-row">
            <div className="form-group">
              <label>
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                value={podcastForm.title}
                onChange={(e) => handleInputChange(e, "title", "podcast")}
                required
                placeholder="Podcast title"
              />
            </div>
            <div className="form-group">
              <label>
                Host <span className="required">*</span>
              </label>
              <input
                type="text"
                value={podcastForm.host}
                onChange={(e) => handleInputChange(e, "host", "podcast")}
                required
                placeholder="Host name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={podcastForm.description}
              onChange={(e) => handleInputChange(e, "description", "podcast")}
              placeholder="Podcast description"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={podcastForm.category}
                onChange={(e) => handleInputChange(e, "category", "podcast")}
                placeholder="General"
              />
            </div>
            <div className="form-group">
              <label>Database Category</label>
              <select
                value={podcastForm.category_id}
                onChange={(e) => handleInputChange(e, "category_id", "podcast")}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>
                Duration (seconds) <span className="required">*</span>
              </label>
              <input
                type="number"
                value={podcastForm.duration}
                onChange={(e) => handleInputChange(e, "duration", "podcast")}
                required
                placeholder="3600"
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group file-upload">
              <label>
                <FileAudio size={20} />
                Audio File <span className="required">*</span>
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, "audioFile", "podcast")}
                required
              />
              {podcastForm.audioFile && (
                <span className="file-name">{podcastForm.audioFile.name}</span>
              )}
            </div>
            <div className="form-group file-upload">
              <label>
                <Image size={20} />
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "coverFile", "podcast")}
              />
              {podcastForm.coverFile && (
                <span className="file-name">{podcastForm.coverFile.name}</span>
              )}
            </div>
          </div>

          <button type="submit" className="upload-btn" disabled={uploading}>
            {uploading ? (
              <>
                <Loader size={18} className="spinner" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload Podcast
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminUpload;

