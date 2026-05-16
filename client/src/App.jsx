import { useEffect, useState } from "react"
import { FaSearch, FaChartBar } from "react-icons/fa"
import { Routes, Route } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import MusicCard from "./components/MusicCard"
import Player from "./components/Player"
import Favorites from "./pages/Favorites"
import { searchSongs } from "./services/youtube"

function App() {

  const [songs, setSongs] = useState([])
  const [currentSong, setCurrentSong] = useState(null)

  const [activeSongId, setActiveSongId] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(-1)

  const [search, setSearch] = useState("tamil hits")
  const [loading, setLoading] = useState(false)

  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem("aj-favorites")
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("aj-favorites", JSON.stringify(favorites))
  }, [favorites])

  const fetchSongs = async (query = search) => {
    try {
      setLoading(true)

      const data = await searchSongs(query)

      const formatted = (data || [])
        .filter(i => i?.id?.videoId)
        .map(i => ({
          id: i.id.videoId,
          title: i.snippet?.title || "No title",
          artist: i.snippet?.channelTitle || "Unknown",
          image: i.snippet?.thumbnails?.high?.url || "",
          file: i.id.videoId
        }))

      setSongs(formatted)

    } catch (err) {
      console.log(err)
      setSongs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim()) fetchSongs(search)
    }, 500)

    return () => clearTimeout(t)
  }, [search])

  const nextSong = () => {
    if (!songs.length) return
    const next = (currentIndex + 1) % songs.length
    setCurrentSong(songs[next])
    setCurrentIndex(next)
    setActiveSongId(songs[next].id)
  }

  const prevSong = () => {
    if (!songs.length) return
    const prev = (currentIndex - 1 + songs.length) % songs.length
    setCurrentSong(songs[prev])
    setCurrentIndex(prev)
    setActiveSongId(songs[prev].id)
  }

  const HomePage = () => (
    <div className="p-6 min-h-screen bg-black text-white overflow-x-hidden">

      {/* 🔥 SEARCH BAR FIXED 100% */}
      <div className="flex gap-4 mb-6 items-center w-full">

        <div className="flex items-center gap-3 w-full bg-zinc-900 border border-red-900/50 rounded-2xl px-4 py-3 min-w-0">

          <FaSearch className="text-red-500 flex-shrink-0" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search songs, artists..."
            spellCheck={false}
            autoComplete="off"
            className="
              w-full
              min-w-0
              flex-1
              bg-transparent
              outline-none
              border-none
              text-white
              text-base
              leading-normal
              tracking-normal
              whitespace-nowrap
              overflow-visible
            "
          />

        </div>

        <button
          onClick={() => fetchSongs(search)}
          className="flex-shrink-0 bg-red-700 hover:bg-red-600 px-6 py-3 rounded-2xl font-bold"
        >
          Search
        </button>

      </div>

      {/* LOADING */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-zinc-900 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* SONGS */}
      {!loading && songs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {songs.map((song, i) => (
            <MusicCard
              key={song.id}
              song={song}
              setCurrentSong={() => {
                setCurrentSong(song)
                setCurrentIndex(i)
                setActiveSongId(song.id)
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
            />
          ))}

        </div>
      )}

      {/* VISUALIZER */}
      {currentSong && (
        <div className="flex items-end gap-2 h-16 mt-6">

          {[40, 70, 100, 60, 120, 80].map((h, i) => (
            <div key={i} className="w-2 bg-red-600 rounded-full animate-pulse"
              style={{ height: `${h}px` }} />
          ))}

          <FaChartBar className="text-red-500 ml-3" />

        </div>
      )}

    </div>
  )

  return (
    <div className="flex min-h-screen bg-black overflow-hidden">

      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/favorites" element={<Favorites favorites={favorites} />} />
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