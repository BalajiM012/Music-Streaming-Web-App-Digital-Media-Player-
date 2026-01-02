import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  artist: {
    type: String,
    required: true,
    trim: true,
  },
  album: {
    type: String,
    default: "Unknown Album",
  },
  genre: {
    type: String,
    default: "Unknown",
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
  jiosaavnId: {
    type: String,
    default: null,
    index: true,
  },
  jiosaavnUrl: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Song", songSchema);
