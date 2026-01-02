import mongoose from "mongoose";

const podcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  host: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    default: "General",
  },
  duration: {
    type: Number,
    required: true, // in seconds
  },
  audioUrl: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: "",
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
  playCount: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Podcast", podcastSchema);
