import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import User from "../models/User.js"
import authMiddleware from "../middleware/authMiddleware.js"

const router = express.Router()

// Helper function to safely escape regex characters
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Register a new user
router.post("/register", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database is not connected. Please check your MongoDB server." })
    }

    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Please enter all fields." })
    }

    if (username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters." })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." })
    }

    const safeUsername = escapeRegex(username.trim())
    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${safeUsername}$`, "i") } })
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      username: username.trim(),
      password: hashedPassword,
      favorites: []
    })

    const savedUser = await newUser.save()
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    )

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        favorites: savedUser.favorites || []
      }
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: error.message || "Server error during registration" })
  }
})

// Login a user
router.post("/login", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: "Database is not connected. Please check your MongoDB server." })
    }

    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Please enter all fields." })
    }

    const safeUsername = escapeRegex(username.trim())
    const user = await User.findOne({ username: { $regex: new RegExp(`^${safeUsername}$`, "i") } })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." })
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    )

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        favorites: user.favorites || []
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: error.message || "Server error during login" })
  }
})

// Get current logged-in user profile & favorites from MongoDB
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json({
      id: user._id,
      username: user.username,
      favorites: user.favorites || []
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user favorites in MongoDB
router.put("/favorites", authMiddleware, async (req, res) => {
  try {
    const { favorites } = req.body
    if (!Array.isArray(favorites)) {
      return res.status(400).json({ message: "Favorites must be an array" })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { favorites },
      { new: true }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      id: user._id,
      username: user.username,
      favorites: user.favorites || []
    })
  } catch (error) {
    console.error("Update favorites error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
