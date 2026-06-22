import { useState } from "react"
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa"
import axios from "axios"

// Use environment or fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Form validations
    if (!username.trim() || !password) {
      setError("All fields are required")
      setLoading(false)
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register"
      const response = await axios.post(`${API_URL}${endpoint}`, {
        username: username.trim(),
        password
      })

      if (response.data && response.data.token) {
        onAuthSuccess(response.data.token, response.data.user)
      } else {
        setError("Something went wrong. Please try again.")
      }
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030303] px-4 overflow-hidden select-none">
      {/* Background ambient glow matching the loader */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-900/10 blur-[130px] rounded-full pointer-events-none z-0"></div>

      {/* Main glass card container */}
      <div className="w-full max-w-[450px] glass-card p-8 md:p-10 relative overflow-hidden transition-all duration-300">
        {/* Top styling accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-8 py-2 bg-white/10 border-b border-x border-white/10 rounded-b-2xl font-bold tracking-wider text-sm text-zinc-300">
          {isLogin ? "Login" : "Sign Up"}
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">
            LESSO <span className="text-violet-500">TUNES</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-semibold">
            {isLogin ? "Welcome back! Please enter your details." : "Join us! Create your premium music profile."}
          </p>
        </div>

        {error && (
          <div className="mt-6 px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Username Field */}
          <div className="relative">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input text-white placeholder-zinc-500 font-semibold text-sm focus:outline-none focus:ring-0"
              required
            />
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-11 py-3.5 rounded-xl glass-input text-white placeholder-zinc-500 font-semibold text-sm focus:outline-none focus:ring-0"
              required
            />
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
            </button>
          </div>

          {/* Confirm Password Field (for Sign Up only) */}
          {!isLogin && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3.5 rounded-xl glass-input text-white placeholder-zinc-500 font-semibold text-sm focus:outline-none focus:ring-0"
                required
              />
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
            </div>
          )}

          {/* Remember Me and optional styling wrapper */}
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-900 text-violet-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-extrabold text-sm shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin)
              setError("")
              setUsername("")
              setPassword("")
              setConfirmPassword("")
            }}
            className="text-xs font-bold text-zinc-300 hover:text-white transition-colors"
          >
            {isLogin ? (
              <span>Don't have an account? <strong className="text-violet-500 hover:underline">Register</strong></span>
            ) : (
              <span>Already have an account? <strong className="text-violet-500 hover:underline">Login</strong></span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Auth
