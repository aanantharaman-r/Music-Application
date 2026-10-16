import mongoose from "mongoose"

const songSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  artist: { type: String },
  image: { type: String },
  file: { type: String },
  provider: { type: String, required: true }
}, { _id: false })

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  favorites: [songSchema]
}, {
  timestamps: true
})

const User = mongoose.model("User", userSchema)
export default User
