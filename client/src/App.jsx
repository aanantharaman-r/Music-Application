import { useEffect, useState } from "react"
import { FaChartBar, FaHeart, FaPlay, FaRandom } from "react-icons/fa"
import { Routes, Route, Link } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import MusicCard from "./components/MusicCard"
import Player from "./components/Player"
import Favorites from "./pages/Favorites"
import Search from "./pages/Search"
import PlaylistView from "./pages/PlaylistView"
import { searchSongs } from "./services/youtube"
import { searchSaavn } from "./services/saavn"

function App() {

  const [songs, setSongs] = useState([]) // Search results
  const [homeSongs, setHomeSongs] = useState([]) // Home feed
  const [currentSong, setCurrentSong] = useState(null)

  const [activeSongId, setActiveSongId] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [currentQueue, setCurrentQueue] = useState([])

  const [search, setSearch] = useState("tamil hits")
  const [provider, setProvider] = useState("jiosaavn") // Default to JioSaavn for premium audio streams
  const [loading, setLoading] = useState(false)
  const [homeLoading, setHomeLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [favorites, setFavorites] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [greeting, setGreeting] = useState("Hello")

  // Curated quick mixes for Home Page (JioSaavn queries)
  const quickMixes = [
    { name: "Lofi Sleep", query: "lofi sleep chill beats", gradient: "from-indigo-600/30 to-violet-950/40", icon: "💤" },
    { name: "Retro Electro", query: "retro electro synthwave", gradient: "from-rose-600/30 to-red-950/40", icon: "⚡" },
    { name: "Study Focus", query: "deep focus ambient study music", gradient: "from-emerald-600/30 to-teal-950/40", icon: "📚" },
    { name: "Workout Boost", query: "synthwave workout motivation", gradient: "from-amber-600/30 to-orange-950/40", icon: "🔥" },
    { name: "Rainy Day Cozy", query: "cozy rainy day jazz piano", gradient: "from-blue-600/30 to-slate-950/40", icon: "🌧️" }
  ]

  // Set greeting based on local time
  useEffect(() => {
    const hours = new Date().getHours()
    if (hours < 12) setGreeting("Good morning")
    else if (hours < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  // Load favorites & playlists
  useEffect(() => {
    const savedFav = localStorage.getItem("aj-favorites")
    if (savedFav) setFavorites(JSON.parse(savedFav))

    const savedPlaylists = localStorage.getItem("aj-playlists")
    if (savedPlaylists) setPlaylists(JSON.parse(savedPlaylists))
  }, [])

  useEffect(() => {
    localStorage.setItem("aj-favorites", JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    localStorage.setItem("aj-playlists", JSON.stringify(playlists))
  }, [playlists])

  // Custom Playlist Helpers
  const createPlaylist = (name) => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      songs: []
    }
    setPlaylists([...playlists, newPlaylist])
  }

  const deletePlaylist = (id) => {
    setPlaylists(playlists.filter(p => p.id !== id))
  }

  const addSongToPlaylist = (playlistId, song) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        // Prevent duplicate songs
        const exists = p.songs.find(s => s.id === song.id)
        if (exists) return p
        return { ...p, songs: [...p.songs, song] }
      }
      return p
    }))
  }

  const removeSongFromPlaylist = (playlistId, songId) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId) {
        return { ...p, songs: p.songs.filter(s => s.id !== songId) }
      }
      return p
    }))
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
    const next = (currentIndex + 1) % currentQueue.length
    setCurrentSong(currentQueue[next])
    setCurrentIndex(next)
    setActiveSongId(currentQueue[next].id)
  }

  const prevSong = () => {
    if (!currentQueue.length) return
    const prev = (currentIndex - 1 + currentQueue.length) % currentQueue.length
    setCurrentSong(currentQueue[prev])
    setCurrentIndex(prev)
    setActiveSongId(currentQueue[prev].id)
  }

  // Shuffle play favorites list
  const playFavoritesRandom = () => {
    if (!favorites.length) return
    const randomIndex = Math.floor(Math.random() * favorites.length)
    setCurrentSong(favorites[randomIndex])
    setCurrentIndex(randomIndex)
    setActiveSongId(favorites[randomIndex].id)
    setCurrentQueue(favorites)
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
      }
    } catch (err) {
      console.log(err)
    } finally {
      setHomeLoading(false)
    }
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
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto z-10 pb-32">
        
        {/* MOBILE HEADER */}
        <div className="flex md:hidden items-center justify-between px-6 py-4 bg-zinc-950/80 border-b border-zinc-900 backdrop-blur-md sticky top-0 z-30">
          <h1 className="text-2xl font-black tracking-wide">
            <span className="text-white">A</span>
            <span className="text-red-500">J</span>
          </h1>
          <button 
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-red-500 hover:bg-zinc-800 transition"
          >
            ☰
          </button>
        </div>

        <Routes>
          <Route path="/" element={
            <div className="p-6 md:p-8 min-h-full">

              {/* WELCOME BANNER */}
              <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-red-600/15 via-zinc-950 to-zinc-950 p-8 md:p-10 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="z-10 text-center md:text-left">
                  <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-500 uppercase tracking-widest">
                    {greeting}, listener
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mt-3">
                    Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400">Audio Space</span>
                  </h1>
                  <p className="text-zinc-400 text-sm mt-2.5 max-w-md">
                    Explore ad-free music, curated custom categories, and save your favorites in one beautifully designed, responsive app.
                  </p>

                  <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                    <Link
                      to="/search"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-950/40 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                    >
                      🚀 Open Search
                    </Link>
                    {favorites.length > 0 && (
                      <button
                        onClick={playFavoritesRandom}
                        className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 font-bold text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                      >
                        <FaRandom className="text-xs" /> Shuffle Favorites
                      </button>
                    )}
                  </div>
                </div>

                {/* STATS WIDGET */}
                <div className="z-10 flex flex-col items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl min-w-[200px] shadow-lg shadow-black/40">
                  <FaHeart className="text-3xl text-red-500 mb-2.5 animate-pulse" />
                  <span className="text-2xl font-black text-white">{favorites.length}</span>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-1">Liked Songs</span>
                </div>
              </div>

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
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* BOTTOM ACTIVE GLOW VISUALIZER */}
              {currentSong && (
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-zinc-900/40 to-red-950/20 border border-zinc-900 backdrop-blur-md flex items-center justify-between max-w-4xl shadow-xl">
                  <div className="flex items-center gap-4">
                    <img src={currentSong.image} alt="" className="w-16 h-16 rounded-xl object-cover glow-pulse" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-red-500 font-bold">Now Playing</p>
                      <h4 className="font-extrabold text-white text-lg truncate max-w-md mt-0.5">{currentSong.title}</h4>
                      <p className="text-zinc-400 text-xs mt-0.5">{currentSong.artist}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-[4px] h-12">
                    <div className="w-1.5 bg-gradient-to-t from-red-600 to-rose-500 rounded-full visualizer-bar" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 bg-gradient-to-t from-red-600 to-rose-500 rounded-full visualizer-bar-fast" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-1.5 bg-gradient-to-t from-red-600 to-rose-500 rounded-full visualizer-bar-slow" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-1.5 bg-gradient-to-t from-red-600 to-rose-500 rounded-full visualizer-bar" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 bg-gradient-to-t from-red-600 to-rose-500 rounded-full visualizer-bar-fast" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}

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
              }}
              setCurrentIndex={setCurrentIndex}
              setActiveSongId={setActiveSongId}
              activeSongId={activeSongId}
              provider={provider}
              setProvider={setProvider}
              playlists={playlists}
              addSongToPlaylist={addSongToPlaylist}
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
            />
          } />

          <Route path="/favorites" element={
            <Favorites 
              favorites={favorites} 
              setCurrentSong={(song) => {
                setCurrentSong(song)
                setCurrentQueue(favorites)
              }}
              setActiveSongId={setActiveSongId}
              setCurrentIndex={setCurrentIndex}
              onFav={(song) => {
                setFavorites(favorites.filter(f => f.id !== song.id))
              }}
              activeSongId={activeSongId}
              playlists={playlists}
              addSongToPlaylist={addSongToPlaylist}
            />
          } />
        </Routes>
      </div>

      <Player
        currentSong={currentSong}
        nextSong={nextSong}
        prevSong={prevSong}
      />

    </div>
  )
}

export default App