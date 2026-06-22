import express from "express"
import Playlist from "../models/Playlist.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Apply authentication middleware to all playlist routes
router.use(authMiddleware)

// Get all playlists for the logged-in user
router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id })
    res.json(playlists)
  } catch (error) {
    console.error("Fetch playlists error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new playlist
router.post("/", async (req, res) => {
  try {
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Playlist name is required." })
    }

    const newPlaylist = new Playlist({
      name: name.trim(),
      userId: req.user.id,
      songs: []
    })

    const savedPlaylist = await newPlaylist.save()
    res.status(201).json(savedPlaylist)
  } catch (error) {
    console.error("Create playlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a playlist
router.delete("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id })
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." })
    }

    await Playlist.deleteOne({ _id: req.params.id })
    res.json({ message: "Playlist deleted successfully." })
  } catch (error) {
    console.error("Delete playlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add a song to a playlist
router.put("/:id/songs", async (req, res) => {
  try {
    const { song } = req.body
    if (!song || !song.id) {
      return res.status(400).json({ message: "Valid song object is required." })
    }

    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id })
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." })
    }

    // Check if song already exists in this playlist
    const songExists = playlist.songs.some(s => s.id === song.id)
    if (songExists) {
      return res.status(400).json({ message: "Song already in playlist." })
    }

    playlist.songs.push(song)
    await playlist.save()

    res.json(playlist)
  } catch (error) {
    console.error("Add song to playlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove a song from a playlist
router.delete("/:id/songs/:songId", async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, userId: req.user.id })
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found." })
    }

    playlist.songs = playlist.songs.filter(s => s.id !== req.params.songId)
    await playlist.save()

    res.json(playlist)
  } catch (error) {
    console.error("Remove song from playlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
