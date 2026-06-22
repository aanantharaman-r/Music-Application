import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import playlistRoutes from "./routes/playlists.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/playlists", playlistRoutes)

// Default root route
app.get("/", (req, res) => {
  res.send("Music Application API is running...")
})

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/musicapp"

console.log("Connecting to MongoDB...")

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB Cloud/Local Database")
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error("Database connection failed. Make sure MONGODB_URI in your .env file is correct.")
    console.error(err)
    
    // Start server anyway so frontend doesn't crash completely, but with db warning
    app.listen(PORT, () => {
      console.warn(`[WARNING] Server running on port ${PORT} without DB connection!`)
    })
  })
