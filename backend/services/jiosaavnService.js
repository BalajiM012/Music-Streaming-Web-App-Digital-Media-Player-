import axios from "axios";

const JIOSAAVN_API_BASE_URL =
  process.env.JIOSAAVN_API_URL || "http://localhost:3001/api";

class JioSaavnService {
  /**
   * Search for songs on JioSaavn
   * @param {string} query - Search query
   * @param {number} page - Page number (default: 0)
   * @param {number} limit - Results per page (default: 10)
   * @returns {Promise<Object>} Search results
   */
  async searchSongs(query, page = 0, limit = 20) {
    try {
      const response = await axios.get(`${JIOSAAVN_API_BASE_URL}/search/songs`, {
        params: { query, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("JioSaavn search error:", error.message);
      throw new Error(`Failed to search songs: ${error.message}`);
    }
  }

  /**
   * Get song details by ID
   * @param {string} songId - JioSaavn song ID
   * @returns {Promise<Object>} Song details with download URLs
   */
  async getSongById(songId) {
    try {
      const response = await axios.get(`${JIOSAAVN_API_BASE_URL}/songs/${songId}`);
      return response.data;
    } catch (error) {
      console.error("JioSaavn get song error:", error.message);
      throw new Error(`Failed to get song: ${error.message}`);
    }
  }

  /**
   * Get song details by JioSaavn link
   * @param {string} link - JioSaavn song URL
   * @returns {Promise<Object>} Song details with download URLs
   */
  async getSongByLink(link) {
    try {
      const response = await axios.get(`${JIOSAAVN_API_BASE_URL}/songs`, {
        params: { link },
      });
      return response.data;
    } catch (error) {
      console.error("JioSaavn get song by link error:", error.message);
      throw new Error(`Failed to get song by link: ${error.message}`);
    }
  }

  /**
   * Get the best quality download URL
   * @param {Array} downloadUrls - Array of download URLs with quality
   * @returns {string} Best quality URL (prefers 320kbps, then 160kbps, then 96kbps)
   */
  getBestQualityUrl(downloadUrls) {
    if (!downloadUrls || downloadUrls.length === 0) {
      return null;
    }

    // Sort by quality preference: 320kbps > 160kbps > 96kbps
    const qualityOrder = { "320kbps": 3, "160kbps": 2, "96kbps": 1 };
    const sorted = downloadUrls.sort((a, b) => {
      const aQuality = qualityOrder[a.quality] || 0;
      const bQuality = qualityOrder[b.quality] || 0;
      return bQuality - aQuality;
    });

    return sorted[0].url;
  }

  /**
   * Download audio file from URL
   * @param {string} url - Download URL
   * @param {string} filename - Output filename
   * @returns {Promise<string>} Path to downloaded file
   */
  async downloadAudio(url, filename) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const { fileURLToPath } = await import("url");
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const uploadsDir = path.join(__dirname, "../uploads/audio");
      
      // Ensure directory exists
      if (!fs.default.existsSync(uploadsDir)) {
        fs.default.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.default.createWriteStream(filePath);
      response.data.pipe(writer);

      const filePath = path.join(uploadsDir, filename);
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          resolve(`/uploads/audio/${filename}`);
        });
        writer.on("error", reject);
      });
    } catch (error) {
      console.error("Download error:", error.message);
      throw new Error(`Failed to download audio: ${error.message}`);
    }
  }

  /**
   * Download cover image
   * @param {string} url - Image URL
   * @param {string} filename - Output filename
   * @returns {Promise<string>} Path to downloaded image
   */
  async downloadImage(url, filename) {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const { fileURLToPath } = await import("url");
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      const uploadsDir = path.join(__dirname, "../uploads/images");
      
      // Ensure directory exists
      if (!fs.default.existsSync(uploadsDir)) {
        fs.default.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.default.createWriteStream(filePath);
      response.data.pipe(writer);

      const filePath = path.join(uploadsDir, filename);
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => {
          resolve(`/uploads/images/${filename}`);
        });
        writer.on("error", reject);
      });
    } catch (error) {
      console.error("Image download error:", error.message);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Convert JioSaavn song format to Lamentix format
   * @param {Object} jiosaavnSong - Song from JioSaavn API
   * @returns {Object} Formatted song for Lamentix
   */
  convertToLamentixFormat(jiosaavnSong) {
    const primaryArtists = jiosaavnSong.artists?.primary || [];
    const artistName = primaryArtists.map((a) => a.name).join(", ") || "Unknown Artist";

    return {
      title: jiosaavnSong.name || "Unknown Title",
      artist: artistName,
      album: jiosaavnSong.album?.name || "Unknown Album",
      genre: jiosaavnSong.language || "Unknown",
      duration: jiosaavnSong.duration || 0,
      audioUrl: this.getBestQualityUrl(jiosaavnSong.downloadUrl) || "",
      coverImage:
        jiosaavnSong.image && jiosaavnSong.image.length > 0
          ? jiosaavnSong.image[0].url
          : "",
      releaseDate: jiosaavnSong.releaseDate || new Date(),
      jiosaavnId: jiosaavnSong.id,
      jiosaavnUrl: jiosaavnSong.url,
    };
  }
}

export default new JioSaavnService();

