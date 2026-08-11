import { useEffect, useState, useRef } from "react"
import { FaChartBar, FaHeart, FaPlay, FaRandom, FaUser, FaMusic, FaSearch } from "react-icons/fa"
import { Routes, Route, Link, useNavigate } from "react-router-dom"
import axios from "axios"

import Sidebar from "./components/Sidebar"
import MusicCard from "./components/MusicCard"
import Player from "./components/Player"
import Favorites from "./pages/Favorites"
import Search from "./pages/Search"
import PlaylistView from "./pages/PlaylistView"
import Auth from "./pages/Auth"
import { searchSongs } from "./services/youtube"
import { searchSaavn } from "./services/saavn"
import logo from "./assets/logo.jpg"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

function App() {
  const navigate = useNavigate()

  const [token, setToken] = useState(localStorage.getItem("aj-token") || "")
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("aj-user") || "null"))

  const [songs, setSongs] = useState([]) // Search results
  const [homeSongs, setHomeSongs] = useState([]) // Home feed
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const [activeSongId, setActiveSongId] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [currentQueue, setCurrentQueue] = useState([])
  const [queueType, setQueueType] = useState("")
  const [isShuffle, setIsShuffle] = useState(false)

  const [search, setSearch] = useState("")
  const [provider, setProvider] = useState("jiosaavn") // Default to JioSaavn for premium audio streams
  const [loading, setLoading] = useState(false)
  const [homeLoading, setHomeLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const handleHomeSearchSubmit = (e) => {
    if (e) e.preventDefault()
    if (search.trim()) {
      fetchSongs(search, provider)
      navigate("/search")
    }
  }

  const handleTagClick = (tag) => {
    const query = tag.toLowerCase()
    setSearch(query)
    fetchSongs(query, provider)
    navigate("/search")
  }

  const [favorites, setFavorites] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [greeting, setGreeting] = useState("Hello")
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const profileDropdownRef = useRef(null)
  const mobileProfileDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) &&
        (mobileProfileDropdownRef.current && !mobileProfileDropdownRef.current.contains(event.target))
      ) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const [toast, setToast] = useState(null)
  const [toastTimeoutId, setToastTimeoutId] = useState(null)

  const showToast = (message, type = "success") => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId)
    setToast({ message, type })
    const id = setTimeout(() => {
      setToast(null)
    }, 3000)
    setToastTimeoutId(id)
  }


  // Curated quick mixes for Home Page (JioSaavn queries)
  const quickMixes = [
    { name: "Lofi Sleep", query: "lofi sleep chill beats", gradient: "from-violet-600/30 to-purple-950/50", icon: "💤" },
    { name: "Retro Electro", query: "retro electro synthwave", gradient: "from-fuchsia-600/30 to-violet-950/50", icon: "⚡" },
    { name: "Study Focus", query: "deep focus ambient study music", gradient: "from-purple-600/30 to-indigo-950/50", icon: "📚" },
    { name: "Workout Boost", query: "synthwave workout motivation", gradient: "from-violet-500/30 to-fuchsia-950/50", icon: "🔥" },
    { name: "Rainy Day Cozy", query: "cozy rainy day jazz piano", gradient: "from-indigo-600/30 to-violet-950/50", icon: "🌧️" }
  ]

  // Set greeting based on local time
  useEffect(() => {
    const hours = new Date().getHours()
    if (hours >= 5 && hours < 12) setGreeting("Good morning")
    else if (hours >= 12 && hours < 17) setGreeting("Good afternoon")
    else if (hours >= 17 && hours < 21) setGreeting("Good evening")
    else setGreeting("Good night")
  }, [])

  // Load favorites & playlists
  useEffect(() => {
    const savedFav = localStorage.getItem("aj-favorites")
    if (savedFav) setFavorites(JSON.parse(savedFav))
  }, [])

  useEffect(() => {
    localStorage.setItem("aj-favorites", JSON.stringify(favorites))
  }, [favorites])

  // Fetch playlists from server or localStorage
  const fetchPlaylists = async () => {
    if (token) {
      try {
        const res = await axios.get(`${API_URL}/playlists`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const formatted = res.data.map(p => ({
          id: p._id,
          name: p.name,
          songs: p.songs || []
        }))
        setPlaylists(formatted)
      } catch (err) {
        console.error("Error fetching playlists:", err)
      }
    }
  }

  useEffect(() => {
    if (token) {
      fetchPlaylists()
    } else {
      const saved = localStorage.getItem("aj-guest-playlists")
      if (saved) {
        try {
          setPlaylists(JSON.parse(saved))
        } catch (e) {
          setPlaylists([])
        }
      } else {
        setPlaylists([])
      }
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      localStorage.setItem("aj-guest-playlists", JSON.stringify(playlists))
    }
  }, [playlists, token])

  // Custom Playlist Helpers
  const createPlaylist = async (name) => {
    if (token) {
      try {
        const res = await axios.post(`${API_URL}/playlists`, { name }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const newP = {
          id: res.data._id,
          name: res.data.name,
          songs: res.data.songs || []
        }
        setPlaylists(prev => [...prev, newP])
        showToast(`Playlist "${name}" created`)
        return
      } catch (err) {
        console.error("Error creating playlist on server:", err)
      }
    }
    // Guest mode or server fallback
    const newP = {
      id: `local_${Date.now()}`,
      name,
      songs: []
    }
    setPlaylists(prev => [...prev, newP])
    showToast(`Playlist "${name}" created`)
  }

  const deletePlaylist = async (id) => {
    const playlistName = playlists.find(p => p.id === id)?.name || "Playlist"
    if (token && !String(id).startsWith("local_")) {
      try {
        await axios.delete(`${API_URL}/playlists/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (err) {
        console.error("Error deleting playlist on server:", err)
      }
    }
    setPlaylists(prev => prev.filter(p => p.id !== id))
    showToast(`Deleted playlist "${playlistName}"`)
  }

  const addSongToPlaylist = async (playlistId, song) => {
    const playlistName = playlists.find(p => p.id === playlistId)?.name || "Playlist"
    const targetP = playlists.find(p => p.id === playlistId)
    if (targetP && targetP.songs.some(s => s.id === song.id)) {
      showToast(`"${song.title}" is already in "${playlistName}"`)
      return
    }

    if (token && !String(playlistId).startsWith("local_")) {
      try {
        const res = await axios.put(`${API_URL}/playlists/${playlistId}/songs`, { song }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
            return {
              id: res.data._id,
              name: res.data.name,
              songs: res.data.songs || []
            }
          }
          return p
        }))
        showToast(`"${song.title}" added to "${playlistName}"`)
        return
      } catch (err) {
        console.error("Error adding song to playlist on server:", err)
      }
    }

    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: [...p.songs, song]
        }
      }
      return p
    }))
    showToast(`"${song.title}" added to "${playlistName}"`)
  }

  const removeSongFromPlaylist = async (playlistId, songId) => {
    const playlistName = playlists.find(p => p.id === playlistId)?.name || "Playlist"
    if (token && !String(playlistId).startsWith("local_")) {
      try {
        const res = await axios.delete(`${API_URL}/playlists/${playlistId}/songs/${songId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPlaylists(prev => prev.map(p => {
          if (p.id === playlistId) {
            return {
              id: res.data._id,
              name: res.data.name,
              songs: res.data.songs || []
            }
          }
          return p
        }))
        showToast(`Song removed from "${playlistName}"`)
        return
      } catch (err) {
        console.error("Error removing song from playlist on server:", err)
      }
    }

    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        return {
          ...p,
          songs: p.songs.filter(s => s.id !== songId)
        }
      }
      return p
    }))
    showToast(`Song removed from "${playlistName}"`)
  }


  // Fetch home trending songs (JioSaavn API)
  const fetchHomeSongs = async (query = "Tamil trending Hits") => {
    try {
      setHomeLoading(true)
      const data = await searchSaavn(query)
      const formatted = (data || []).map(song => ({
        id: song.id,
        title: song.name,
        artist: song.artists?.primary?.map(a => a.name).join(", ") || song.primaryArtists || "",
        image: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url || song.image?.[2]?.link || song.image?.[1]?.link || song.image?.[0]?.link || "",
        file: song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url || song.downloadUrl?.[2]?.url || song.downloadUrl?.[4]?.link || song.downloadUrl?.[3]?.link || song.downloadUrl?.[2]?.link || "",
        provider: "jiosaavn"
      }))
      setHomeSongs(formatted)
    } catch (err) {
      console.log(err)
      setHomeSongs([])
    } finally {
      setHomeLoading(false)
    }
  }

  // Fetch search songs (Supports JioSaavn & YouTube)
  const fetchSongs = async (query = search, activeProvider = provider) => {
    try {
      setLoading(true)
      let formatted = []
      
      if (activeProvider === "jiosaavn") {
        const data = await searchSaavn(query)
        formatted = (data || []).map(song => ({
          id: song.id,
          title: song.name,
          artist: song.artists?.primary?.map(a => a.name).join(", ") || song.primaryArtists || "",
          image: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url || song.image?.[2]?.link || song.image?.[1]?.link || song.image?.[0]?.link || "",
          file: song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url || song.downloadUrl?.[2]?.url || song.downloadUrl?.[4]?.link || song.downloadUrl?.[3]?.link || song.downloadUrl?.[2]?.link || "",
          provider: "jiosaavn"
        }))
      } else {
        const data = await searchSongs(query)
        formatted = (data || [])
          .filter(i => i?.id?.videoId)
          .map(i => ({
            id: i.id.videoId,
            title: i.snippet?.title || "No title",
            artist: i.snippet?.channelTitle || "Unknown",
            image: i.snippet?.thumbnails?.high?.url || "",
            file: i.id.videoId,
            provider: "youtube"
          }))
      }
      setSongs(formatted)
    } catch (err) {
      console.log(err)
      setSongs([])
    } finally {
      setLoading(false)
    }
  }

  // On mount, load home songs
  useEffect(() => {
    fetchHomeSongs()
  }, [])

  // Auto search on typing
  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim()) fetchSongs(search, provider)
    }, 500)

    return () => clearTimeout(t)
  }, [search, provider])

  const nextSong = () => {
    if (!currentQueue.length) return
    if (isShuffle && queueType === "playlist") {
      if (currentQueue.length === 1) {
        setCurrentSong(currentQueue[0])
        setActiveSongId(currentQueue[0].id)
        return
      }
      let next = currentIndex
      while (next === currentIndex) {
        next = Math.floor(Math.random() * currentQueue.length)
      }
      setCurrentSong(currentQueue[next])
      setCurrentIndex(next)
      setActiveSongId(currentQueue[next].id)
    } else {
      const next = (currentIndex + 1) % currentQueue.length
      setCurrentSong(currentQueue[next])
      setCurrentIndex(next)
      setActiveSongId(currentQueue[next].id)
    }
  }

  const prevSong = () => {
    if (!currentQueue.length) return
    const prev = (currentIndex - 1 + currentQueue.length) % currentQueue.length
    setCurrentSong(currentQueue[prev])
    setCurrentIndex(prev)
    setActiveSongId(currentQueue[prev].id)
  }
  const playFavoritesRandom = () => {
    if (!favorites.length) return
    const randomIndex = Math.floor(Math.random() * favorites.length)
    setCurrentSong(favorites[randomIndex])
    setCurrentIndex(randomIndex)
    setActiveSongId(favorites[randomIndex].id)
    setCurrentQueue(favorites)
    setQueueType("favorites")
  }

  // Fetch a mix & play first track instantly (JioSaavn API)
  const playQuickMix = async (mix) => {
    try {
      setHomeLoading(true)
      const data = await searchSaavn(mix.query)
      const formatted = (data || []).map(song => ({
        id: song.id,
        title: song.name,
        artist: song.artists?.primary?.map(a => a.name).join(", ") || song.primaryArtists || "",
        image: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url || song.image?.[2]?.link || song.image?.[1]?.link || song.image?.[0]?.link || "",
        file: song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url || song.downloadUrl?.[2]?.url || song.downloadUrl?.[4]?.link || song.downloadUrl?.[3]?.link || song.downloadUrl?.[2]?.link || "",
        provider: "jiosaavn"
      }))
      
      setHomeSongs(formatted)
      
      if (formatted.length > 0) {
        setCurrentSong(formatted[0])
        setCurrentIndex(0)
        setActiveSongId(formatted[0].id)
        setCurrentQueue(formatted)
        setQueueType("home")
      }
    } catch (err) {
      console.log(err)
    } finally {
      setHomeLoading(false)
    }
  }

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem("aj-token", newToken)
    localStorage.setItem("aj-user", JSON.stringify(newUser))
    setShowAuth(false)
  }

  const handleLogout = () => {
    setToken("")
    setUser(null)
    localStorage.removeItem("aj-token")
    localStorage.removeItem("aj-user")
    setCurrentSong(null)
    setIsPlaying(false)
    setCurrentQueue([])
    setActiveSongId(null)
  }

  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false)
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  if (appLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030303] text-white relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute w-[400px] h-[400px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute w-[300px] h-[300px] bg-purple-900/10 blur-[130px] rounded-full pointer-events-none z-0"></div>

        <div className="z-10 flex flex-col items-center gap-8 relative">
          {/* Animated Music Notes */}
          <FaMusic className="absolute -top-10 -left-12 text-violet-400/50 text-3xl note-float-1" />
          <FaMusic className="absolute top-10 -right-16 text-fuchsia-400/50 text-2xl note-float-2" />
          <FaMusic className="absolute -bottom-6 -left-8 text-purple-400/50 text-xl note-float-3" />

          {/* Logo container with pulse/glow */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-full blur-md opacity-80 animate-spin-slow"></div>
            <img 
              src={logo} 
              alt="Logo" 
              className="relative w-32 h-32 rounded-full object-cover shadow-2xl border-[3px] border-zinc-900 z-10"
            />
          </div>

          <div className="flex flex-col items-center gap-3 mt-4">
            <h1 className="text-3xl font-black tracking-widest text-white uppercase drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">
              LESSO <span className="text-violet-500">TUNES</span>
            </h1>
            <p className="text-zinc-400 text-xs tracking-[0.3em] font-bold uppercase">
              Your Personal Audio Frontier
            </p>
          </div>

          {/* Animated Equalizer */}
          <div className="mt-6 flex items-end justify-center gap-1.5 h-8">
            <div className="w-1.5 bg-violet-500 rounded-t-sm visualizer-bar"></div>
            <div className="w-1.5 bg-fuchsia-500 rounded-t-sm visualizer-bar-fast"></div>
            <div className="w-1.5 bg-purple-500 rounded-t-sm visualizer-bar-slow"></div>
            <div className="w-1.5 bg-violet-500 rounded-t-sm visualizer-bar" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 bg-fuchsia-500 rounded-t-sm visualizer-bar-fast" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="flex min-h-screen bg-[#030303] text-white overflow-hidden relative">

      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-900/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-900/10 blur-[130px] rounded-full pointer-events-none z-0"></div>

      {/* MOBILE BACKDROP FOR SIDEBAR */}
      {menuOpen && (
        <div 
          onClick={() => setMenuOpen(false)} 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <Sidebar 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen} 
        playlists={playlists}
        createPlaylist={createPlaylist}
        user={user}
        handleLogout={handleLogout}
      />


      <div className="flex-1 flex flex-col h-screen overflow-y-auto z-10 pb-32 xl:mr-[340px]">
        
        {/* DESKTOP/MAIN HEADER WITH TOP CENTER SEARCH BAR */}
        <div className="hidden md:flex items-center justify-between gap-4 px-8 py-3.5 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-30 border-b border-zinc-900/60 shadow-lg">
          {/* LOGO / APP NAME */}
          <div className="flex items-center gap-2.5 w-48">
            <img src={logo} alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
            <span className="text-xs font-black tracking-widest text-white uppercase">
              LESSO <span className="text-violet-500">TUNES</span>
            </span>
          </div>

          {/* TOP CENTER SEARCH BOX */}
          <form onSubmit={handleHomeSearchSubmit} className="flex-1 max-w-xl mx-auto">
            <div className="flex items-center gap-2.5 w-full bg-zinc-900/90 border border-zinc-800/80 rounded-full px-4 py-1.5 focus-within:border-violet-500/80 focus-within:ring-2 focus-within:ring-violet-950 transition-all duration-300 shadow-inner group">
              <FaSearch className="text-zinc-400 text-sm flex-shrink-0 group-focus-within:text-violet-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search songs, artists, albums..."
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent outline-none border-none text-white text-xs sm:text-sm placeholder-zinc-500"
              />

              {/* PROVIDER TOGGLE PILLS */}
              <div className="flex bg-zinc-950 border border-zinc-800/90 p-0.5 rounded-full flex-shrink-0 text-[10px] font-extrabold">
                <button
                  type="button"
                  onClick={() => setProvider("jiosaavn")}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    provider === "jiosaavn"
                      ? "bg-violet-600 text-white shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="JioSaavn Audio"
                >
                  Saavn
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("youtube")}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    provider === "youtube"
                      ? "bg-violet-600 text-white shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="YouTube Video"
                >
                  YouTube
                </button>
              </div>

              <button
                type="submit"
                className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold px-3.5 py-1 rounded-full transition-all shadow-md"
              >
                Search
              </button>
            </div>
          </form>

          {/* RIGHT: PROFILE DROPDOWN */}
          <div className="relative w-48 flex justify-end" ref={profileDropdownRef}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800/80 hover:border-violet-500/50 text-zinc-300 hover:text-white transition-all duration-300 group shadow-md"
            >
              <FaUser className="text-xs group-hover:scale-110 transition-transform text-violet-400" />
              {user ? (
                <span className="text-xs font-black tracking-wide truncate max-w-[90px]">
                  {user.username}
                </span>
              ) : (
                <span className="text-xs font-black tracking-wide">
                  Account
                </span>
              )}
            </button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 top-11 bg-zinc-950/95 border border-zinc-800 rounded-xl p-1.5 w-40 shadow-2xl z-30 backdrop-blur-md animate-in fade-in slide-in-from-top-1">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowProfileDropdown(false)
                    }}
                    className="w-full text-left text-xs font-bold px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuth(true)
                      setShowProfileDropdown(false)
                    }}
                    className="w-full text-left text-xs font-bold px-3 py-2 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* MOBILE HEADER WITH TOP CENTER SEARCH BAR */}
        <div className="flex md:hidden flex-col gap-2 px-4 py-3 bg-zinc-950/90 border-b border-zinc-900 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* LEFT: MOBILE MENU TRIGGER */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMenuOpen(true)}
                className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-violet-400 hover:bg-zinc-800 transition"
              >
                ☰
              </button>
              <img src={logo} alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
            </div>

            {/* RIGHT: PROFILE DROPDOWN */}
            <div className="relative" ref={mobileProfileDropdownRef}>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400"
              >
                <FaUser className="text-xs text-violet-400" />
                {user && (
                  <span className="text-[10px] font-bold text-zinc-300">
                    Hi, {user.username}
                  </span>
                )}
              </button>
              
              {showProfileDropdown && (
                <div className="absolute right-0 top-9 bg-zinc-950/95 border border-zinc-800 rounded-xl p-1.5 w-32 shadow-2xl z-30 backdrop-blur-md">
                  {user ? (
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowProfileDropdown(false)
                      }}
                      className="w-full text-left text-xs font-bold px-2 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAuth(true)
                        setShowProfileDropdown(false)
                      }}
                      className="w-full text-left text-xs font-bold px-2 py-1.5 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors"
                    >
                      Login
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* MOBILE TOP CENTER SEARCH BOX */}
          <form onSubmit={handleHomeSearchSubmit} className="w-full mt-1">
            <div className="flex items-center gap-2 w-full bg-zinc-900/90 border border-zinc-800 rounded-full px-3.5 py-1.5 focus-within:border-violet-500">
              <FaSearch className="text-zinc-400 text-xs flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search music..."
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent outline-none border-none text-white text-xs placeholder-zinc-500"
              />
              <button
                type="submit"
                className="flex-shrink-0 bg-violet-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <Routes>
          <Route path="/" element={
            <div className="p-4 md:p-8 min-h-full">

              {/* HERO BANNER */}
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-violet-900/20 via-zinc-950 to-fuchsia-950/20 p-6 md:p-10 mb-8 md:mb-12 text-center flex flex-col items-center justify-center shadow-2xl group hover:border-violet-500/30 transition-all duration-500">
                {/* Background Glows */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/25 transition-all duration-500" />
                <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

                {/* Greeting Badge */}
                <span className="px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-black text-violet-400 uppercase tracking-widest mb-3 z-10">
                  ✨ {greeting}, listener
                </span>

                {/* Main Title */}
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-tight uppercase welcome-title z-10 max-w-3xl">
                  Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-500 to-rose-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">Audio Frontier</span>
                </h1>

                <p className="text-zinc-400 text-xs sm:text-sm md:text-base mt-2 md:mt-3 max-w-xl font-medium z-10">
                  Explore ad-free music, curated custom categories, and save your favorites in one place.
                </p>
              </div>

              {/* CURRENT PLAY ACTIVE GLOW VISUALIZER (Top of Curated Mixes) */}
              {currentSong && (
                <div className="mb-10 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-zinc-900/40 via-[#08060c] to-violet-950/20 border border-zinc-800/80 backdrop-blur-md flex items-center justify-between w-full shadow-xl gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img src={currentSong.image} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover glow-pulse flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] md:text-xs uppercase tracking-widest text-violet-400 font-bold">Now Playing</p>
                      <h4 className="font-extrabold text-white text-sm md:text-lg truncate max-w-[160px] sm:max-w-xs md:max-w-md mt-0.5">{currentSong.title}</h4>
                      <p className="text-zinc-400 text-[10px] md:text-xs truncate mt-0.5">{currentSong.artist}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-[3px] md:gap-[4px] h-8 md:h-12 flex-shrink-0">
                    <div className="w-1.5 bg-gradient-to-t from-violet-600 to-fuchsia-500 rounded-full visualizer-bar" style={{ animationDelay: '0.1s', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
                    <div className="w-1.5 bg-gradient-to-t from-violet-600 to-fuchsia-500 rounded-full visualizer-bar-fast" style={{ animationDelay: '0.3s', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
                    <div className="w-1.5 bg-gradient-to-t from-violet-600 to-fuchsia-500 rounded-full visualizer-bar-slow" style={{ animationDelay: '0.5s', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
                    <div className="w-1.5 bg-gradient-to-t from-violet-600 to-fuchsia-500 rounded-full visualizer-bar" style={{ animationDelay: '0.2s', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
                    <div className="w-1.5 bg-gradient-to-t from-violet-600 to-fuchsia-500 rounded-full visualizer-bar-fast" style={{ animationDelay: '0.4s', animationPlayState: isPlaying ? 'running' : 'paused' }}></div>
                  </div>
                </div>
              )}

              {/* CURATED MIXES GRID */}
              <div className="mb-10">
                <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-[2px] mb-4">Curated Mixes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {quickMixes.map((mix) => (
                    <button
                      key={mix.name}
                      onClick={() => playQuickMix(mix)}
                      className={`relative overflow-hidden p-5 rounded-2xl border border-zinc-800/80 bg-gradient-to-br ${mix.gradient} text-left group hover:border-zinc-700/80 hover:scale-[1.03] transition-all duration-300 shadow-md`}
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-colors" />
                      <span className="text-2xl">{mix.icon}</span>
                      <h4 className="font-extrabold text-white text-base mt-4">{mix.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-1 group-hover:text-red-400 transition-colors">
                        Instant Listen
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* TRENDING HITS */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-extrabold tracking-tight">Trending Hits</h2>
                  <button 
                    onClick={() => fetchHomeSongs("Tamil trending Hits")}
                    className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition"
                  >
                    Refresh
                  </button>
                </div>

                {/* SKELETON */}
                {homeLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={i} className="h-72 bg-zinc-900/30 border border-zinc-800/40 rounded-2xl animate-pulse flex flex-col p-4">
                        <div className="flex-1 bg-zinc-800/40 rounded-xl mb-4"></div>
                        <div className="h-5 bg-zinc-800/40 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-zinc-800/40 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SONGS GRID */}
                {!homeLoading && homeSongs.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {homeSongs.map((song, i) => (
                      <MusicCard
                        key={song.id}
                        song={song}
                        setCurrentSong={() => {
                          setCurrentSong(song)
                          setCurrentIndex(i)
                          setActiveSongId(song.id)
                          setCurrentQueue(homeSongs)
                          setQueueType("home")
                        }}
                        isActive={activeSongId === song.id}
                        onFav={() => {
                          const exists = favorites.find(f => f.id === song.id)
                          if (exists) {
                            setFavorites(favorites.filter(f => f.id !== song.id))
                          } else {
                            setFavorites([...favorites, song])
                          }
                        }}
                        isFav={favorites.some(f => f.id === song.id)}
                        playlists={playlists}
                        addSongToPlaylist={addSongToPlaylist}
                        isPlaying={isPlaying}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          } />

          <Route path="/search" element={
            <Search
              search={search}
              setSearch={setSearch}
              songs={songs}
              loading={loading}
              fetchSongs={fetchSongs}
              favorites={favorites}
              setFavorites={setFavorites}
              setCurrentSong={(song) => {
                setCurrentSong(song)
                setCurrentQueue(songs)
                setQueueType("search")
              }}
              setCurrentIndex={setCurrentIndex}
              setActiveSongId={setActiveSongId}
              activeSongId={activeSongId}
              provider={provider}
              setProvider={setProvider}
              playlists={playlists}
              addSongToPlaylist={addSongToPlaylist}
              isPlaying={isPlaying}
            />
          } />

          <Route path="/playlists/:id" element={
            <PlaylistView
              playlists={playlists}
              deletePlaylist={deletePlaylist}
              removeSongFromPlaylist={removeSongFromPlaylist}
              setCurrentSong={(song) => {
                setCurrentSong(song)
                // Set the current playing queue to this playlist's songs
                const activeP = playlists.find(p => p.songs.some(s => s.id === song.id))
                if (activeP) {
                  setCurrentQueue(activeP.songs)
                  setQueueType("playlist")
                }
              }}
              setActiveSongId={setActiveSongId}
              setCurrentIndex={setCurrentIndex}
              activeSongId={activeSongId}
              onFav={(song) => {
                const exists = favorites.find(f => f.id === song.id)
                if (exists) {
                  setFavorites(favorites.filter(f => f.id !== song.id))
                } else {
                  setFavorites([...favorites, song])
                }
              }}
              favorites={favorites}
              isPlaying={isPlaying}
            />
          } />

          <Route path="/favorites" element={
            <Favorites 
              favorites={favorites} 
              setCurrentSong={(song) => {
                setCurrentSong(song)
                setCurrentQueue(favorites)
                setQueueType("favorites")
              }}
              setActiveSongId={setActiveSongId}
              setCurrentIndex={setCurrentIndex}
              onFav={(song) => {
                setFavorites(favorites.filter(f => f.id !== song.id))
              }}
              activeSongId={activeSongId}
              playlists={playlists}
              addSongToPlaylist={addSongToPlaylist}
              isPlaying={isPlaying}
            />
          } />
        </Routes>
      </div>

      <Player
        currentSong={currentSong}
        nextSong={nextSong}
        prevSong={prevSong}
        setCurrentSong={setCurrentSong}
        favorites={favorites}
        setFavorites={setFavorites}
        playlists={playlists}
        addSongToPlaylist={addSongToPlaylist}
        currentQueue={currentQueue}
        queueType={queueType}
        setCurrentIndex={setCurrentIndex}
        setActiveSongId={setActiveSongId}
        showToast={showToast}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        playing={isPlaying}
        setPlaying={setIsPlaying}
      />

      {showAuth && (
        <Auth 
          onAuthSuccess={handleAuthSuccess} 
          onClose={() => setShowAuth(false)} 
        />
      )}

      {toast && (
        <div className="fixed top-6 right-6 z-[100000] bg-zinc-950/90 border border-violet-500/30 rounded-2xl px-5 py-3 shadow-[0_0_25px_rgba(139,92,246,0.3)] animate-in fade-in slide-in-from-top-6 flex items-center gap-3.5 backdrop-blur-lg">
          <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm">
            {toast.type === "success" ? "🎵" : "⚠️"}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-violet-400">Notification</p>
            <p className="text-xs font-extrabold text-white mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App