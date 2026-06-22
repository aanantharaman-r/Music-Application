import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

// Register a new user
router.post("/register", async (req, res) => {
  try {
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

    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } })
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      username,
      password: hashedPassword
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
        username: savedUser.username
      }
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Login a user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: "Please enter all fields." })
    }

    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, "i") } })
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
        username: user.username
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
