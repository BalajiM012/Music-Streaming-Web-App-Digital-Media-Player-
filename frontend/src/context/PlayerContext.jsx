import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resumePosition, setResumePosition] = useState(0);
  const audioRef = useRef(null);
  const savePositionTimeoutRef = useRef(null);

  // Save playback position to history
  const savePlaybackPosition = useCallback(
    async (position) => {
      if (!currentTrack) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const trackId = currentTrack.id || currentTrack._id;
        const isPodcast = currentTrack.host !== undefined;

        await axios.post(
          "/api/history",
          {
            trackId: isPodcast ? null : trackId,
            podcastId: isPodcast ? trackId : null,
            position: position,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error("Error saving playback position:", error);
      }
    },
    [currentTrack]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const time = audio.currentTime;
      setCurrentTime(time);

      // Save position every 5 seconds
      if (savePositionTimeoutRef.current) {
        clearTimeout(savePositionTimeoutRef.current);
      }
      savePositionTimeoutRef.current = setTimeout(() => {
        savePlaybackPosition(time);
      }, 5000);
    };

    const updateDuration = () => setDuration(audio.duration);

    const handleEnded = () => {
      if (currentIndex < queue.length - 1) {
        playNext();
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        savePlaybackPosition(0);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      if (savePositionTimeoutRef.current) {
        clearTimeout(savePositionTimeoutRef.current);
      }
    };
  }, [currentIndex, queue.length, savePlaybackPosition, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((err) => console.error("Play error:", err));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const playTrack = async (track, tracks = []) => {
    setCurrentTrack(track);
    setQueue(tracks.length > 0 ? tracks : [track]);
    // Support both _id (MongoDB) and id (Supabase) formats
    const trackId = track.id || track._id;
    const findIndex = (t) => (t.id || t._id) === trackId;
    setCurrentIndex(tracks.length > 0 ? tracks.findIndex(findIndex) : 0);

    // Try to resume from last position
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get(`/api/history/resume/${trackId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && response.data.position > 0) {
          setResumePosition(response.data.position);
          // Wait for audio to load, then seek
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.currentTime = response.data.position;
              setCurrentTime(response.data.position);
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error fetching resume position:", error);
      }
    }

    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentTrack(queue[nextIndex]);
      setCurrentTime(0);
    }
  };

  const playPrevious = () => {
    if (currentTime > 3) {
      // If more than 3 seconds into track, restart it
      setCurrentTime(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else if (currentIndex > 0) {
      // Otherwise, go to previous track
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentTrack(queue[prevIndex]);
      setCurrentTime(0);
    }
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        queue,
        resumePosition,
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        seek,
        changeVolume,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={currentTrack?.audio_url || currentTrack?.audioUrl}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </PlayerContext.Provider>
  );
};
