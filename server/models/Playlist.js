import mongoose from "mongoose"

const songSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String },
  image: { type: String },
  file: { type: String },
  provider: { type: String, required: true }
})

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  songs: [songSchema]
}, {
  timestamps: true
})

const Playlist = mongoose.model("Playlist", playlistSchema)
export default Playlist
